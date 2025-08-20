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

  const { session_id, key } = await req.json()
  if (!session_id || !key) return NextResponse.json({ error: 'missing_params' }, { status: 400 })

  // Cargar sesión con datos necesarios
  const { data: s, error: sErr } = await supabase
    .from('sessions')
    .select('program_id, starts_at, ends_at, qr_secret')
    .eq('id', session_id)
    .single()
  if (sErr || !s) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })

  // Validar secreto
  if (String(s.qr_secret) !== String(key)) {
    return NextResponse.json({ error: 'invalid_qr' }, { status: 403 })
  }

  // Validar que el alumno esté matriculado
  const { data: enr } = await supabase
    .from('enrollments')
    .select('id')
    .eq('program_id', s.program_id)
    .eq('user_id', session.user.id)
    .limit(1)
  if (!enr || !enr.length) {
    return NextResponse.json({ error: 'not_enrolled' }, { status: 403 })
  }

  // Ventanas de tiempo
  const now = new Date()
  const starts = new Date(s.starts_at)
  const ends = new Date(s.ends_at)
  const earlyWindowStart = new Date(starts.getTime() - EARLY_WINDOW_MIN * 60 * 1000)
  const lateLimit = new Date(starts.getTime() + LATE_AFTER_MIN * 60 * 1000)

  if (now < earlyWindowStart) {
    return NextResponse.json({ error: 'too_early', detail: `Vuelve a partir de ${EARLY_WINDOW_MIN} minutos antes.` }, { status: 400 })
  }
  if (now > ends) {
    return NextResponse.json({ error: 'too_late', detail: 'La sesión ya terminó.' }, { status: 400 })
  }

  const status = now <= lateLimit ? 'present' : 'late'
  const xp = status === 'present' ? XP_PRESENT : XP_LATE

  // Upsert de asistencia (única por (session_id, user_id))
  const { error: attendErr } = await supabase
    .from('attendance')
    .upsert({ session_id, user_id: session.user.id, status }, { onConflict: 'session_id,user_id' })
  if (attendErr) return NextResponse.json({ error: attendErr.message }, { status: 400 })

  // XP: insertar si no existe (unique idx en points_ledger lo asegura)
  const { error: xpErr } = await supabase
    .from('points_ledger')
    .insert({
      user_id: session.user.id,
      event_type: 'attendance_session',
      ref_id: session_id,  // único por usuario+tipo+ref_id
      delta: xp
    })
  // si choca el unique, no pasa nada, ya lo tenía
  if (xpErr && !xpErr.message.includes('duplicate key')) {
    return NextResponse.json({ error: xpErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, status, xp })
}
