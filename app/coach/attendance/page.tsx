import { supabaseServer } from '@/lib/supabase/server'
import { markAttendanceManually } from './actions'

type Session = { id: number; program_id: number; start_at: string; end_at: string | null; programs: { name: string } | null }

export const dynamic = 'force-dynamic'

export default async function CoachAttendancePage() {
  const supabase = await supabaseServer()
  const { data: sessionsData } = await supabase.from('attendance_sessions').select('id, program_id, start_at, end_at, programs(name)').order('start_at', { ascending: false }).limit(30)
  const sessions = (sessionsData ?? []) as unknown as Session[]
  const studentsBySession = await Promise.all(sessions.map(async (session) => {
    const { data } = await supabase.from('enrollments').select('user_id, profiles!inner(full_name)').eq('program_id', session.program_id).eq('status', 'active')
    return [session.id, data ?? []] as const
  }))
  const students = new Map(studentsBySession)

  return <main className="space-y-6">
    <header><h2 className="text-2xl font-bold">Asistencia manual</h2><p className="mt-1 text-white/70">Marca a un alumno matriculado cuando no pueda usar el QR.</p></header>
    {sessions.length === 0 && <p className="rounded border border-white/15 p-4 text-white/70">No hay sesiones disponibles.</p>}
    <div className="space-y-4">{sessions.map((session) => {
      const sessionStudents = students.get(session.id) ?? []
      return <section key={session.id} className="rounded border border-white/15 p-4"><div className="mb-3"><h3 className="font-semibold">{session.programs?.name ?? `Programa ${session.program_id}`}</h3><p className="text-sm text-white/70">{new Date(session.start_at).toLocaleString()} {session.end_at ? `— ${new Date(session.end_at).toLocaleString()}` : ''}</p></div>{sessionStudents.length === 0 ? <p className="text-sm text-white/60">No hay alumnos activos en este programa.</p> : <div className="flex flex-wrap gap-2">{sessionStudents.map((row: any) => <form action={markAttendanceManually} key={row.user_id}><input type="hidden" name="session_id" value={session.id} /><input type="hidden" name="student_id" value={row.user_id} /><button type="submit" className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10">Marcar: {Array.isArray(row.profiles) ? row.profiles[0]?.full_name : row.profiles?.full_name || row.user_id}</button></form>)}</div>}</section>
    })}</div>
  </main>
}
