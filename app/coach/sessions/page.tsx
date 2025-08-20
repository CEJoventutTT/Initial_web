// app/coach/sessions/page.tsx
export const revalidate = 0
export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase/server'
import { createSessionAction, deleteSessionAction } from './actions'

export default async function CoachSessionsPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  const uid = session?.user.id
  if (!uid) {
    return <div className="p-6">Necesitas iniciar sesión.</div>
  }

  // 1) Programas del coach (multi-coach con tabla puente)
  const { data: programsInner, error: programsErr } = await supabase
    .from('programs')
    .select('id, name, coach_programs!inner(coach_id)')
    .eq('coach_programs.coach_id', uid)

  if (programsErr) {
    return <div className="p-6 text-red-400">Error: {programsErr.message}</div>
  }

  let programs = programsInner ?? []

  // 2) Fallback legacy (si usas programs.coach_id)
  if (programs.length === 0) {
    const { data: programsLegacy, error: legacyErr } = await supabase
      .from('programs')
      .select('id, name')
      .eq('coach_id', uid)

    if (legacyErr) {
      return <div className="p-6 text-red-400">Error: {legacyErr.message}</div>
    }
    programs = programsLegacy ?? []
  }

  if (programs.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Sesiones</h1>
        <p className="text-white/70">
          No tienes programas asignados todavía. Vincula este coach a un programa en <code>programs</code> o mediante <code>coach_programs</code>.
        </p>
      </div>
    )
  }

  const programIds = programs.map(p => p.id)

  const { data: sessions, error: sessErr } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at')
    .in('program_id', programIds)
    .order('starts_at', { ascending: true })

  if (sessErr) {
    return <div className="p-6 text-red-400">Error cargando sesiones: {sessErr.message}</div>
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-8">
      {/* Accesos rápidos */}
      <div className="flex gap-3">
        <a
          href="/coach/sessions"
          className="bg-primary text-primary-foreground rounded px-4 py-2"
        >
          Crear/gestionar sesiones
        </a>
        <a
          href="/coach/attendance"
          className="border border-white/20 rounded px-4 py-2 hover:bg-white/10"
        >
          Marcar asistencia (manual)
        </a>
      </div>

      {/* Crear sesión */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Crear sesión</h2>
        <form action={createSessionAction} className="grid md:grid-cols-4 gap-4">
          <select
            name="program_id"
            className="bg-white/5 border border-white/10 rounded p-2 text-white"
            required
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name ?? `Programa #${p.id}`}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="starts_at"
            className="bg-white/5 border-white/10 rounded p-2"
            required
          />
          <input
            type="datetime-local"
            name="ends_at"
            className="bg-white/5 border-white/10 rounded p-2"
            required
          />
          <button className="bg-primary text-primary-foreground rounded px-4 py-2">
            Crear
          </button>
        </form>
      </section>

      {/* Listado de sesiones */}
      <section className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Sesiones</h2>
        {!sessions?.length ? (
          <p className="text-white/70">Aún no hay sesiones.</p>
        ) : (
          <ul className="space-y-2">
            {sessions!.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between bg-white/5 rounded p-3"
              >
                <div>
                  <div className="font-semibold">Sesión #{s.id}</div>
                  <div className="text-white/70 text-sm">
                    Programa #{s.program_id}
                  </div>
                  <div className="text-white/90">
                    {fmt(s.starts_at)} — {fmt(s.ends_at)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/coach/sessions/${s.id}/qr`}
                    className="border border-white/20 rounded px-3 py-1 hover:bg-white/10"
                  >
                    Ver QR
                  </a>
                  <form action={deleteSessionAction}>
                    <input type="hidden" name="session_id" value={s.id} />
                    <button className="border border-white/20 rounded px-3 py-1 hover:bg-white/10">
                      Borrar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
