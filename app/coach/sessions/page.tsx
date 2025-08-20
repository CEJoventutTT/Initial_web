// app/coach/sessions/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import ConfirmDelete from '@/components/ConfirmDelete' // ⬅️ asegúrate de que el archivo existe en components

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
      cookies: { get: (name: string) => cookieStore.get(name)?.value }, // solo lectura
    }
  )

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select<AttendanceSession>('id, program_id, start_at, end_at, secret, active, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Sesiones de asistencia</h1>
        <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          Error: {error.message}
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sesiones de asistencia</h1>

      {/* Crear sesión */}
      <section className="rounded border border-white/10 p-4">
        <h2 className="mb-3 text-lg font-semibold">Crear nueva sesión</h2>
        <form action={createSession} className="grid gap-3 sm:grid-cols-5">
          <div className="sm:col-span-1">
            <label className="block text-sm text-white/70 mb-1">Programa (opcional)</label>
            <input name="program_id" className="w-full rounded bg-white/5 px-3 py-2 outline-none" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm text-white/70 mb-1">Inicio</label>
            <input
              name="start_at"
              type="datetime-local"
              required
              className="w-full rounded bg-white/5 px-3 py-2 outline-none"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm text-white/70 mb-1">Fin</label>
            <input
              name="end_at"
              type="datetime-local"
              required
              className="w-full rounded bg-white/5 px-3 py-2 outline-none"
            />
          </div>
          <div className="flex items-end gap-2 sm:col-span-1">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input name="active" type="checkbox" defaultChecked className="accent-white" />
              Activa
            </label>
          </div>
          <div className="sm:col-span-1 flex items-end">
            <button type="submit" className="w-full rounded bg-white/10 px-4 py-2 hover:bg-white/20">
              Crear sesión
            </button>
          </div>
        </form>
      </section>

      {/* Tabla sesiones */}
      {!data || data.length === 0 ? (
        <p className="text-white/70">No hay sesiones creadas todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-white/70">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="px-3">Programa</th>
                <th className="px-3">Activa</th>
                <th className="px-3">Horario</th>
                <th className="px-3">Creada</th>
                <th className="px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => {
                const isPast = new Date(s.end_at).getTime() < Date.now()
                return (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="py-2 px-3 font-mono">{s.id}</td>
                    <td className="px-3">
                      <form action={updateProgramId} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          name="program_id"
                          defaultValue={s.program_id ?? ''}
                          placeholder="program_id"
                          className="w-44 rounded bg-white/5 px-2 py-1 outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
                          title="Guardar programa"
                        >
                          Guardar
                        </button>
                      </form>
                    </td>
                    <td className="px-3">
                      <span
                        className={
                          'rounded px-2 py-0.5 ' +
                          (s.active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/70')
                        }
                      >
                        {s.active ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-3">
                      {new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}
                      {isPast && <span className="ml-2 text-red-300">(finalizada)</span>}
                    </td>
                    <td className="px-3">
                      {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-3">
                      <div className="flex flex-wrap gap-2">
                        {/* Mostrar QR */}
                        <a
                          href={`/coach/sessions/${s.id}/qr`}
                          className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
                          title="Mostrar QR"
                        >
                          Mostrar QR
                        </a>

                        {/* Toggle activa */}
                        <form action={toggleActive}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="current" value={String(!!s.active)} />
                          <button
                            type="submit"
                            className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
                            title={s.active ? 'Desactivar' : 'Activar'}
                          >
                            {s.active ? 'Desactivar' : 'Activar'}
                          </button>
                        </form>

                        {/* Borrar con confirmación */}
                        <ConfirmDelete id={s.id} action={deleteSession} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
