// app/api/coach/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic' // evita cache

type SessionRow = {
  id: number
  program_id: number | null
  qr_key: string | null
  secret: string | null // uuid (texto al traerlo)
  active: boolean | null
  expires_at: string | null // ISO
  start_at: string | null   // ISO
  end_at: string | null     // ISO
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // 1) Leer params: query ?s=&k= o body {session_id,key} / {s,k}
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

    // 2) Supabase SSR client (con tus env públicos ya configurados)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // 3) Cargar sesión
    const { data: session, error: sesErr } = await supabase
      .from('attendance_sessions')
      .select('id, program_id, qr_key, secret, active, expires_at, start_at, end_at')
      .eq('id', session_id)
      .single<SessionRow>()

    if (sesErr || !session) {
      return NextResponse.json({ error: 'session_not_found' }, { status: 404 })
    }

    // 4) Validaciones de estado/tiempos
    if (!session.active) {
      return NextResponse.json({ error: 'session_inactive' }, { status: 409 })
    }
    const now = new Date()

    if (session.expires_at && now > new Date(session.expires_at)) {
      return NextResponse.json({ error: 'session_expired' }, { status: 410 })
    }
    if (session.start_at && now < new Date(session.start_at)) {
      return NextResponse.json({ error: 'session_not_started' }, { status: 409 })
    }
    if (session.end_at && now > new Date(session.end_at)) {
      return NextResponse.json({ error: 'session_closed' }, { status: 409 })
    }

    // 5) Validar clave: aceptamos coincidencia con qr_key (text) o secret (uuid)
    const matchesQr = session.qr_key && k === session.qr_key
    const matchesSecret = session.secret && k === session.secret
    if (!matchesQr && !matchesSecret) {
      return NextResponse.json({ error: 'invalid_key' }, { status: 401 })
    }

    // 6) Registrar log (ajusta columnas extra si las tienes)
    const logPayload = {
      session_id: session.id,
      program_id: session.program_id,
      // añade más campos si los necesitas: user_id, coach_id, device, etc.
    }

    const { error: insErr } = await supabase
      .from('attendance_logs')
      .insert(logPayload)

    if (insErr) {
      // No bloqueamos el check-in por fallo de logging, pero lo avisamos
      return NextResponse.json(
        { status: 'ok', warning: 'log_insert_failed' },
        { status: 200 }
      )
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (e) {
    console.error('[checkin] server_error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
