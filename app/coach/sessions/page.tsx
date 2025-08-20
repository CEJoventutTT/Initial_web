// app/coach/sessions/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import ConfirmDelete from '@/components/ConfirmDelete'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AttendanceSession = {
  id: string
  program_id: string | null
  start_at: string
  end_at: string
  secret: string
  active: boolean | null
  created_at: string
}

// ---------- helper para Supabase en Server Actions ----------
async function getSupabaseForAction() {
  'use server'
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.delete({ name, ...options }),
      },
    }
  )
  return supabase
}

// -------------------- ACTIONS --------------------
export async function createSession(formData: FormData) {
  'use server'
  const supabase = await getSupabaseForAction()
  const program_id = (formData.get('program_id') as string)?.trim() || null
  const start_at = new Date(formData.get('start_at') as string).toISOString()
  const end_at = new Date(formData.get('end_at') as string).toISOString()
  const active = (formData.get('active') as string) === 'on'

  const { error } = await supabase.from('attendance_sessions').insert([
    { program_id, start_at, end_at, active },
  ])
  if (error) console.error('createSession error:', error.message)
  revalidatePath('/coach/sessions')
}

export async function toggleActive(formData: FormData) {
  'use server'
  const supabase = await getSupabaseForAction()
  const id = formData.get('id') as string
  const current = formData.get('current') === 'true'
  const { error } = await supabase
    .from('attendance_sessions')
    .update({ active: !current })
    .eq('id', id)

  if (error) console.error('toggleActive error:', error.message)
  revalidatePath('/coach/sessions')
}

export async function updateProgramId(formData: FormData) {
  'use server'
  const supabase = await getSupabaseForAction()
  const id = formData.get('id') as string
  const program_id = (formData.get('program_id') as string)?.trim() || null

  const { error } = await supabase
    .from('attendance_sessions')
    .update({ program_id })
    .eq('id', id)

  if (error) console.error('updateProgramId error:', error.message)
  revalidatePath('/coach/sessions')
}

export async function deleteSession(formData: FormData) {
  'use server'
  const supabase = await getSupabaseForAction()
  const id = formData.get('id') as string

  const { error } = await supabase.from('attendance_sessions').delete().eq('id', id)
  if (error) console.error('deleteSession error:', error.message)
  revalidatePath('/coach/sessions')
}

// -------------------- PAGE (RSC) --------------------
export default async function CoachSessionsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name: string) => cookieStore.get(name)?.value },
    }
  )

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select<AttendanceSession>('id, program_id, start_at, end_at, secret, active, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <main className="min-h-[70vh] bg-brand-dark bg-panel-glow p-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Sesiones de asistencia
          </h1>
          <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-red-300 shadow-soft">
            Error: {error.message}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] bg-brand-dark bg-panel-glow p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-xl border border-border/60 bg-muted/60 p-5 shadow-card backdrop-blur">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Sesiones de asistencia
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, edita y gestiona sesiones. Colores y acentos adaptados a la marca.
          </p>
        </header>

        {/* Crear sesión */}
        <section className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-card backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-brand-white/90">
            Crear nueva sesión
          </h2>
          <form action={createSession} className="grid gap-4 sm:grid-cols-5">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm text-white/70">Programa (opcional)</label>
              <input
                name="program_id"
                className="w-full rounded-md border border-input bg-white/5 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm text-white/70">Inicio</label>
              <input
                name="start_at"
                type="datetime-local"
                required
                className="w-full rounded-md border border-input bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-sm text-white/70">Fin</label>
              <input
                name="end_at"
                type="datetime-local"
                required
                className="w-full rounded-md border border-input bg-white/5 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-end gap-3 sm:col-span-1">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input name="active" type="checkbox" defaultChecked className="accent-accent" />
                Activa
              </label>
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground shadow-brand transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Crear sesión
              </button>
            </div>
          </form>
        </section>

        {/* Tabla sesiones */}
        {!data || data.length === 0 ? (
          <p className="text-white/80">No hay sesiones creadas todavía.</p>
        ) : (
          <section className="rounded-xl border border-border/60 bg-card/80 p-0 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-left text-white/80">
                  <tr className="uppercase tracking-wide text-[11px]">
                    <th className="py-3 px-4">ID</th>
                    <th className="px-4">Programa</th>
                    <th className="px-4">Activa</th>
                    <th className="px-4">Horario</th>
                    <th className="px-4">Creada</th>
                    <th className="px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((s) => {
                    const isPast = new Date(s.end_at).getTime() < Date.now()
                    return (
                      <tr key={s.id} className="border-t border-border/60 hover:bg-white/[0.04]">
                        <td className="py-3 px-4 font-mono text-white/90">{s.id}</td>
                        <td className="px-4">
                          <form action={updateProgramId} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={s.id} />
                            <input
                              name="program_id"
                              defaultValue={s.program_id ?? ''}
                              placeholder="program_id"
                              className="w-48 rounded-md border border-input bg-white/5 px-2 py-1 text-white outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                              type="submit"
                              className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
                              title="Guardar programa"
                            >
                              Guardar
                            </button>
                          </form>
                        </td>
                        <td className="px-4">
                          <span
                            className={
                              'rounded-md px-2 py-0.5 text-[12px] ' +
                              (s.active
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-white/8 text-white/70 border border-white/10')
                            }
                          >
                            {s.active ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4">
                          <span className="whitespace-nowrap">
                            {new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}
                          </span>
                          {isPast && <span className="ml-2 rounded-sm bg-red-500/15 px-2 py-0.5 text-[11px] text-red-300">finalizada</span>}
                        </td>
                        <td className="px-4">
                          {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/coach/sessions/${s.id}/qr`}
                              className="rounded-md bg-accent/15 px-3 py-1 text-accent-foreground transition hover:bg-accent/25"
                              title="Mostrar QR"
                            >
                              Mostrar QR
                            </a>
                            <form action={toggleActive}>
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="current" value={String(!!s.active)} />
                              <button
                                type="submit"
                                className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-white/90 transition hover:bg-white/10"
                                title={s.active ? 'Desactivar' : 'Activar'}
                              >
                                {s.active ? 'Desactivar' : 'Activar'}
                              </button>
                            </form>
                            <ConfirmDelete
                              id={s.id}
                              action={deleteSession}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
