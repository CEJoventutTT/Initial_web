// app/api/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const LATE_AFTER_MIN = 10
const EARLY_WINDOW_MIN = 15
const XP_PRESENT = 100
const XP_LATE = 50

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({} as any))
  const session_id = Number(body?.session_id)
  const keyRaw = String(body?.key ?? '')
  const key = keyRaw.trim()

  if (!Number.isFinite(session_id) || !key || key === 'null' || key === 'undefined') {
    return NextResponse.json({ error: 'invalid_qr' }, { status: 400 })
  }

  // Cargar sesión con datos necesarios
  const { data: s, error: sErr } = await supabase
    .from('sessions')
    .select('program_id, starts_at, ends_at, qr_secret')
    .eq('id', session_id)
    .single()
  if (sErr || !s) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })

  // Validar secreto
  if (String(s.qr_secret) !== key) {
    return NextResponse.json({ error: 'invalid_qr' }, { status: 403 })
  }

  // Validar matrícula del alumno en el programa de la sesión
  const { data: enr, error: enrErr } = await supabase
    .from('enrollments')
    .select('id')
    .eq('program_id', s.program_id)
    .eq('user_id', session.user.id)
    .limit(1)
  if (enrErr) return NextResponse.json({ error: enrErr.message }, { status: 400 })
  if (!enr || !enr.length) {
    return NextResponse.json({ error: 'not_enrolled' }, { status: 403 })
  }

  // ⛔️ Ventanas de tiempo DESACTIVADAS temporalmente para pruebas:
  // const now = new Date()
  // const starts = new Date(s.starts_at)
  // const ends = s.ends_at ? new Date(s.ends_at) : new Date(s.starts_at)
  // const earlyWindowStart = new Date(starts.getTime() - EARLY_WINDOW_MIN * 60 * 1000)
  // const lateLimit = new Date(starts.getTime() + LATE_AFTER_MIN * 60 * 1000)
  //
  // if (now < earlyWindowStart) {
  //   return NextResponse.json({ error: 'too_early', detail: `Vuelve a partir de ${EARLY_WINDOW_MIN} minutos antes.` }, { status: 400 })
  // }
  // if (now > ends) {
  //   return NextResponse.json({ error: 'too_late', detail: 'La sesión ya terminó.' }, { status: 400 })
  // }

  // Para conservar la lógica de XP, seguimos calculando status en base a START,
  // pero si prefieres fijo 'present' durante las pruebas, pon: const status = 'present' as const;
  const status = 'present' as const
  const xp = XP_PRESENT

  // Upsert de asistencia (única por (session_id, user_id))
  const { error: attendErr } = await supabase
    .from('attendance')
    .upsert(
      { session_id, user_id: session.user.id, status },
      { onConflict: 'session_id,user_id' }
    )
  if (attendErr) return NextResponse.json({ error: attendErr.message }, { status: 400 })

  // XP: insertar si no existe (unique idx recomendado)
  const { error: xpErr } = await supabase
    .from('points_ledger')
    .insert({
      user_id: session.user.id,
      event_type: 'attendance_session',
      ref_id: session_id,
      delta: xp
    })
  if (xpErr && !/duplicate key|unique/i.test(xpErr.message)) {
    return NextResponse.json({ error: xpErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, status, xp })
}
