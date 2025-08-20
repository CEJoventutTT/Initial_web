// app/coach/sessions/page.tsx
export const revalidate = 0
export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase/server'
import { createSessionAction, deleteSessionAction } from './actions'

export default async function CoachSessionsPage() {
  const supabase = supabaseServer()

  // Sesión obligatoria
  const { data: { session } } = await supabase.auth.getSession()
  const uid = session?.user.id
  const email = session?.user.email
  if (!uid) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Mis sesiones</h1>
        <p className="text-white/70">Necesitas iniciar sesión.</p>
      </div>
    )
  }

  // 1) Programas del coach vía tabla puente coach_programs (multi-coach)
  const { data: programsInner, error: programsErr } = await supabase
    .from('programs')
    .select('id, name, coach_programs!inner(coach_id)')
    .eq('coach_programs.coach_id', uid)

  if (programsErr) {
    return (
      <div className="p-6 text-red-400">
        Error obteniendo programas: {programsErr.message}
      </div>
    )
  }

  let programs = programsInner ?? []

  // 2) Fallback legacy a programs.coach_id si no hay vínculos en coach_programs
  if (programs.length === 0) {
    const { data: programsLegacy, error: legacyErr } = await supabase
      .from('programs')
      .select('id, name')
      .eq('coach_id', uid)

    if (legacyErr) {
      return (
        <div className="p-6 text-red-400">
          Error obteniendo programas (legacy): {legacyErr.message}
        </div>
      )
    }
    programs = programsLegacy ?? []
  }

  if (programs.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Mis sesiones</h1>

        {/* Debug visible del usuario autenticado */}
        <div className="bg-white/5 border border-white/10 rounded p-3">
          <p><span className="text-white/70">user.id:</span> {uid}</p>
          <p><span className="text-white/70">email:</span> {email}</p>
        </div>

        <p className="text-white/70">
          No tienes programas asociados todavía. Asegúrate de tener un vínculo en
          <code className="mx-1 px-1 rounded bg-black/30">coach_programs (program_id, coach_id)</code>.
        </p>
      </div>
    )
  }

  // 3) Cargar sesiones de esos programas
  const programIds = programs.map(p => p.id)
  const { data: sessions, error: sessErr } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at')
    .in('program_id', programIds)
    .order('starts_at', { ascending: true })

  if (sessErr) {
    return (
      <div className="p-6 text-red-400">
        Error cargando sesiones: {sessErr.message}
      </div>
    )
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
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Mis sesiones</h1>

      {/* 🔍 Debug visible del usuario autenticado */}
      <div className="bg-white/5 border border-white/10 rounded p-3">
        <p><span className="text-white/70">user.id:</span> {uid}</p>
        <p><span className="text-white/70">email:</span> {email}</p>
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
                <form action={deleteSessionAction}>
                  <input type="hidden" name="session_id" value={s.id} />
                  <button className="border border-white/20 rounded px-3 py-1 hover:bg-white/10">
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
