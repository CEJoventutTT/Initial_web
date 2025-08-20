// app/api/coach/attendance/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const uid = session.user.id

  // 1) Programas via coach_programs (multi-coach)
  const { data: progsBridge, error: bridgeErr } = await supabase
    .from('programs')
    .select('id, name, coach_programs!inner(coach_id)')
    .eq('coach_programs.coach_id', uid)

  if (bridgeErr) {
    return NextResponse.json({ error: bridgeErr.message }, { status: 400 })
  }

  // 2) Fallback legacy: programs.coach_id
  const { data: progsLegacy, error: legacyErr } = await supabase
    .from('programs')
    .select('id, name')
    .eq('coach_id', uid)

  if (legacyErr) {
    return NextResponse.json({ error: legacyErr.message }, { status: 400 })
  }

  // 3) Unir y deduplicar
  const allProgramsMap = new Map<number, { id: number; name: string | null }>()
  ;(progsBridge ?? []).forEach(p => allProgramsMap.set(p.id, { id: p.id, name: p.name }))
  ;(progsLegacy ?? []).forEach(p => allProgramsMap.set(p.id, { id: p.id, name: p.name }))

  const programs = Array.from(allProgramsMap.values())
  const programIds = programs.map(p => p.id)

  // 4) Sesiones de esos programas
  let attendance_sessions: any[] = []
  if (programIds.length > 0) {
    const { data: sess, error: sessErr } = await supabase
      .from('sessions')
      .select('id, program_id, starts_at, ends_at')
      .in('program_id', programIds)
      .order('starts_at', { ascending: true })

    if (sessErr) {
      return NextResponse.json({ error: sessErr.message }, { status: 400 })
    }
    sessions = sess ?? []
  }

  return NextResponse.json({ programs, sessions })
}
