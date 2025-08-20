// app/api/coach/sessions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      console.error('[sessions.create] missing env', { hasURL: !!url, hasService: !!serviceKey })
      return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
    }

    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

    const programId = body.program_id ?? body.programId
    // Ajusta la ventana horaria: ahora → +10 min (cámbialo a tu gusto)
    const startAt = body.start_at ?? body.starts_at ?? new Date().toISOString()
    const endAt =
      body.end_at ??
      body.ends_at ??
      new Date(Date.now() + 10 * 60_000).toISOString()

    if (!programId) return NextResponse.json({ error: 'program_id_required' }, { status: 400 })

    const payload = {
      program_id: Number(programId),
      qr_key: randomKey(20),
      secret: crypto.randomUUID(),
      active: true,
      expires_at: null,
      // ⬇️ Usa los nombres REALES de tus columnas
      start_at: startAt, // cambia a starts_at si tu tabla lo usa con "s"
      end_at: endAt,     // cambia a ends_at si aplica
    }

    const { data, error } = await supabase
      .from('attendance_sessions')
      .insert(payload)
      .select('id, program_id, qr_key, secret, active, start_at, end_at')
      .single()

    if (error) {
      console.error('[sessions.create] insert_error', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, session: data }, { status: 200 })
  } catch (e: any) {
    console.error('[sessions.create] server_error', e)
    return NextResponse.json({ error: e.message ?? 'server_error' }, { status: 500 })
  }
}
