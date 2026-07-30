// app/api/coach/sessions/route.ts
import { NextResponse } from 'next/server'
import {
  authenticatedSupabase,
  canManageProgram,
  hasRole,
} from '@/lib/supabase/request-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function randomKey(len = 20) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz'
  let out = ''
  const buf = new Uint32Array(len)
  crypto.getRandomValues(buf)
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length]
  return out
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await authenticatedSupabase(req)
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    if (!(await hasRole(supabase, user.id, ['coach', 'admin']))) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

    const programId = body.program_id ?? body.programId
    // Ajusta la ventana horaria: ahora → +10 min (cámbialo a tu gusto)
    const startAt = body.start_at ?? body.starts_at ?? new Date().toISOString()
    const endAt =
      body.end_at ??
      body.ends_at ??
      new Date(Date.now() + 10 * 60_000).toISOString()

    const numericProgramId = Number(programId)
    if (!Number.isSafeInteger(numericProgramId) || numericProgramId <= 0) {
      return NextResponse.json({ error: 'invalid_program_id' }, { status: 400 })
    }
    if (!(await canManageProgram(supabase, numericProgramId))) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const payload = {
      program_id: numericProgramId,
      qr_key: randomKey(20),
      active: true,
      expires_at: null,
      // ⬇️ Usa los nombres REALES de tus columnas
      start_at: startAt, // cambia a starts_at si tu tabla lo usa con "s"
      end_at: endAt,     // cambia a ends_at si aplica
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert(payload)
      .select('id, program_id, active, start_at, end_at')
      .single()

    if (error) {
      console.error('[sessions.create] insert_error', error.code)
      return NextResponse.json({ error: 'session_create_failed' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, session: data }, { status: 200 })
  } catch (error) {
    console.error('[sessions.create] server_error', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
