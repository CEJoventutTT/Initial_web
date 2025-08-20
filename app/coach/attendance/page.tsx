'use client'
import { useEffect, useMemo, useState } from 'react'

type Program = { id: number; name: string | null }
type Session = { id: number; program_id: number; starts_at: string; ends_at: string }
type Student = { user_id: string; profiles?: { full_name: string | null } }

export default function CoachAttendancePage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [programId, setProgramId] = useState<number | ''>('')
  const [sessionId, setSessionId] = useState<number | ''>('')
  const [userId, setUserId] = useState<string>('')
  const [status, setStatus] = useState<'present'|'absent'|'late'>('present')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga inicial: programas + sesiones (server API con RLS)
  useEffect(() => {
    (async () => {
      setLoading(true)
      setMsg(null)
      const res = await fetch('/api/coach/attendance', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setPrograms(data.programs ?? [])
        setSessions(data.sessions ?? [])
      } else {
        setMsg(`Error: ${data.error || 'No se pudieron cargar los datos'}`)
      }
      setLoading(false)
    })()
  }, [])

  // Al cambiar de programa, cargar alumnos (server API con RLS)
  useEffect(() => {
    (async () => {
      setStudents([])
      setSessionId('')
      setUserId('')
      if (!programId) return
      const res = await fetch(`/api/coach/programs/${programId}/students`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setStudents(data.students ?? [])
      } else {
        setMsg(`Error: ${data.error || 'No se pudieron cargar los alumnos'}`)
      }
    })()
  }, [programId])

  const sessionsOfProgram = useMemo(
    () => sessions.filter(s => s.program_id === programId),
    [sessions, programId]
  )

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
    })

  async function mark() {
    setMsg(null)
    if (!programId || !sessionId || !userId) {
      setMsg('Selecciona programa, sesión y alumno')
      return
    }
    const res = await fetch('/api/coach/attendance/mark', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session_id: Number(sessionId), user_id: userId, status })
    })
    const data = await res.json()
    setMsg(res.ok ? '✅ Asistencia marcada' : `❌ ${data.error}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Marcar asistencia</h2>

      {loading ? (
        <p className="text-white/70">Cargando…</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              className="bg-white/5 border border-white/10 rounded p-2 text-white"
              value={programId}
              onChange={e=>{ setProgramId(e.target.value ? Number(e.target.value) : ''); setSessionId(''); setUserId('') }}
            >
              <option value="">Programa</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name ?? `Programa #${p.id}`}</option>
              ))}
            </select>

            <select
              className="bg-white/5 border border-white/10 rounded p-2 text-white"
              value={sessionId}
              onChange={e=>setSessionId(e.target.value ? Number(e.target.value) : '')}
              disabled={!programId}
            >
              <option value="">Sesión</option>
              {sessionsOfProgram.map(s => (
                <option key={s.id} value={s.id}>
                  #{s.id} • {fmt(s.starts_at)}
                </option>
              ))}
            </select>

            <select
              className="bg-white/5 border border-white/10 rounded p-2 text-white"
              value={userId}
              onChange={e=>setUserId(e.target.value)}
              disabled={!programId}
            >
              <option value="">Alumno</option>
              {students.map(en => (
                <option key={en.user_id} value={en.user_id}>
                  {en.profiles?.full_name ?? en.user_id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="bg-white/5 border border-white/10 rounded p-2 text-white"
              value={status}
              onChange={e=>setStatus(e.target.value as any)}
            >
              <option value="present">present</option>
              <option value="absent">absent</option>
              <option value="late">late</option>
            </select>

            <button className="bg-primary text-primary-foreground rounded px-4 py-2" onClick={mark}>
              Guardar
            </button>
          </div>

          {msg && <p className="text-white/80">{msg}</p>}
        </>
      )}
    </div>
  )
}
