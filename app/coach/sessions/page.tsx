import { supabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function CoachSessionsPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  const uid = session?.user.id

  // Programas del coach
  const { data: programs } = await supabase
    .from('programs')
    .select('id, name')
    .eq('coach_id', uid!)

  // Sesiones de esos programas (servidor)
  const programIds = (programs ?? []).map(p => p.id)
  let sessions: any[] = []
  if (programIds.length) {
    const { data } = await supabase
      .from('sessions')
      .select('id, program_id, starts_at, ends_at')
      .in('program_id', programIds)
      .order('starts_at', { ascending: true })
      .limit(100)
    sessions = data ?? []
  }

  async function createSession(formData: FormData) {
    'use server'
    const program_id = Number(formData.get('program_id'))
    const starts_at = String(formData.get('starts_at'))
    const ends_at = String(formData.get('ends_at'))

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/coach/sessions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ program_id, starts_at, ends_at })
    })
    revalidatePath('/coach/sessions')
  }

  async function deleteSession(_fd: FormData) {
    'use server'
    const id = Number(_fd.get('id'))
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/coach/sessions/${id}`, {
      method: 'DELETE'
    })
    revalidatePath('/coach/sessions')
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
    })

  return (
    <div className="space-y-8">
      <section className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Crear sesión</h2>
        <form action={createSession} className="grid md:grid-cols-4 gap-4">
          <select name="program_id" className="bg-white/5 border border-white/10 rounded p-2 text-white" required>
            <option value="">Selecciona programa</option>
            {(programs ?? []).map(p => (
              <option key={p.id} value={p.id}>{p.name ?? `Programa #${p.id}`}</option>
            ))}
          </select>
          <input type="datetime-local" name="starts_at" className="bg-white/5 border border-white/10 rounded p-2" required />
          <input type="datetime-local" name="ends_at"   className="bg-white/5 border border-white/10 rounded p-2" required />
          <button className="bg-primary text-primary-foreground rounded px-4 py-2">Crear</button>
        </form>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Sesiones</h2>
        {sessions.length === 0 ? (
          <p className="text-white/70">Aún no hay sesiones.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map(s => (
              <li key={s.id} className="flex items-center justify-between bg-white/5 rounded p-3">
                <div>
                  <div className="font-semibold">Sesión #{s.id}</div>
                  <div className="text-white/70 text-sm">Programa #{s.program_id}</div>
                  <div className="text-white/90">{fmt(s.starts_at)} — {fmt(s.ends_at)}</div>
                </div>
                <form action={deleteSession}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="border border-white/20 rounded px-3 py-1 hover:bg-white/10">Borrar</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
