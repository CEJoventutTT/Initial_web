// app/api/coach/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// (opcional) Déjalo mientras pruebas; luego puedes eliminarlo
export async function GET() {
  return NextResponse.json({ ping: 'ok', bypass: true })
}

export async function POST(req: Request) {
  // 0) Variables de entorno
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const srv = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srv) {
    return NextResponse.json(
      { error: 'env_missing', detail: { NEXT_PUBLIC_SUPABASE_URL: !!url, SUPABASE_SERVICE_ROLE_KEY: !!srv } },
      { status: 500 }
    )
  }

  const supabase = createClient(url, srv)

  // 1) Cuerpo
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json_body' }, { status: 400 })
  }

  const s = typeof body.s === 'string' ? Number(body.s) : body.s
  const k: string | undefined = body.k
  const studentId: string | undefined = body.studentId ?? body.user_id

  if (!s || !k || !studentId) {
    return NextResponse.json(
      { error: 'invalid_params', detail: { s: !!s, k: !!k, studentId: !!studentId } },
      { status: 400 }
    )
  }

  try {
    // 2) Carga sesión
    const { data: session, error: sErr } = await supabase
      .from('attendance_sessions')
      .select('id, qr_key, active, expires_at, program_id')
      .eq('id', s)
      .single()

    if (sErr || !session) {
      return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
    }

    // 3) Validaciones
    if (!session.active) {
      return NextResponse.json({ error: 'session_inactive' }, { status: 400 })
    }
    if (session.qr_key !== k) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 400 })
    }
    const exp = new Date(session.expires_at).getTime()
    if (Number.isNaN(exp) || exp < Date.now()) {
      return NextResponse.json({ error: 'expired' }, { status: 400 })
    }

    // 4) Inserta log
    const { error: insErr } = await supabase.from('attendance_logs').insert({
      session_id: session.id,
      program_id: session.program_id,
      student_id: studentId,
      checked_at: new Date().toISOString(),
    })

    if (insErr) {
      return NextResponse.json({ error: 'insert_failed', detail: insErr.message }, { status: 500 })
    }

    // 5) OK
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'exception', detail: e?.message }, { status: 500 })
  }
}
