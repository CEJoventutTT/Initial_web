// app/api/coach/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

type SessionRow = {
  id: number
  program_id: number | null
  qr_key: string | null
  secret: string | null
  active: boolean | null
  expires_at: string | null
  start_at: string | null
  end_at: string | null
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // 1) params
    let s = url.searchParams.get('s')
    let k = url.searchParams.get('k')
    if (!s || !k) {
      const body = await req.json().catch(() => null)
      if (body) {
        s = String(body.session_id ?? body.s ?? s ?? '')
        k = String(body.key ?? body.k ?? k ?? '')
      }
    }
    const session_id = Number(s)
    if (!Number.isFinite(session_id) || !k || k.length < 8) {
      return NextResponse.json({ error: 'invalid_param' }, { status: 400 })
    }

    // 2) supabase SSR + usuario
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    )

    const { data: authUser, error: userErr } = await supabase.auth.getUser()
    if (userErr || !authUser?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const uid = authUser.user.id

    // 3) sesión
    const { data: session, error: sesErr } = await supabase
      .from('attendance_sessions')
      .select('id, program_id, qr_key, secret, active, expires_at, start_at, end_at')
      .eq('id', session_id)
      .single<SessionRow>()

    if (sesErr || !session) {
      return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
    }

    // 4) estado/tiempos
    if (!session.active) return NextResponse.json({ error: 'session_inactive' }, { status: 409 })
    const now = new Date()
    if (session.expires_at && now > new Date(session.expires_at)) return NextResponse.json({ error: 'session_expired' }, { status: 410 })
    if (session.start_at && now < new Date(session.start_at))   return NextResponse.json({ error: 'session_not_started' }, { status: 409 })
    if (session.end_at && now > new Date(session.end_at))       return NextResponse.json({ error: 'session_closed' }, { status: 409 })

    // 5) clave
    const okKey = (session.qr_key && k === session.qr_key) || (session.secret && k === session.secret)
    if (!okKey) return NextResponse.json({ error: 'invalid_key' }, { status: 401 })

    // 6) evita duplicados del mismo alumno en la misma sesión (opcional)
    const { data: existing } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('student_id', uid)
      .eq('session_id', session.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ status: 'ok', duplicate: true }, { status: 200 })
    }

    // 7) inserta log con student_id
    const { error: insErr } = await supabase
      .from('attendance_logs')
      .insert({
        student_id: uid,
        session_id: session.id,
        program_id: session.program_id,
      })

    if (insErr) {
      return NextResponse.json({ error: 'log_insert_failed', details: insErr.message }, { status: 400 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (e) {
    console.error('[checkin] server_error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
