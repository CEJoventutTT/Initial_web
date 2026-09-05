import LazyDetails from '@/components/backoffice/lazy-details'
import Link from 'next/link'
import { checked, requireOperator } from '@/lib/backoffice/server'
import {
  clubDateTime,
  clubDayBounds,
  clubToday,
  clubDateRange,
} from '@/lib/backoffice/time'
import { listParams, param, type SearchParams } from '@/lib/backoffice/list'
import {
  Empty,
  Field,
  PageHeading,
  Pagination,
} from '@/components/backoffice/list'
import { ActionForm } from '@/components/backoffice/action-form'
import SessionForm, {
  type SessionData,
} from '@/components/backoffice/session-form'
import EntitySelect from '@/components/backoffice/entity-select'
import { cancelSession, deleteSession } from './actions'

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams,
    paging = listParams(filters)
  const { supabase, user } = await requireOperator(false)
  const { data: profile } = checked(
    await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single(),
  )
  const day = param(filters, 'date'),
    program = Number(param(filters, 'program_id')),
    state = param(filters, 'state')
  const coach = param(filters, 'coach_id')
  let query = supabase.rpc(
    'backoffice_sessions',
    { p_coach: coach || null },
    { count: 'exact' },
  )
  if (day) {
    try {
      const { from, to } = clubDayBounds(day)
      query = query.gte('start_at', from).lt('start_at', to)
    } catch {
      /* Invalid filters are ignored; no writes. */
    }
  }
  const range = clubDateRange(param(filters, 'from'), param(filters, 'to'))
  if (range) query = query.gte('start_at', range.from).lt('start_at', range.to)
  if (Number.isSafeInteger(program) && program > 0)
    query = query.eq('program_id', program)
  if (state === 'active' || state === 'cancelled')
    query = query.eq('active', state === 'active')
  const { data, count } = checked(
    await query
      .order('start_at', { ascending: Boolean(day) })
      .order('id')
      .range(paging.from, paging.to),
  )
  const sessions = (data ?? []) as unknown as SessionData[]
  return (
    <div className="space-y-6">
      <PageHeading
        title="Sesiones de asistencia"
        description="Organiza las sesiones y consulta su asistencia. Horario de Madrid."
      />
      <div className="flex flex-wrap gap-4">
        <Link
          className="bo-button"
          href={`/coach/sessions?date=${clubToday()}`}
        >
          Sesiones de hoy
        </Link>
        <Link className="bo-link py-2" href="/coach/sessions">
          Todas las sesiones
        </Link>
      </div>
      <LazyDetails className="bo-panel" title="Crear nueva sesión">
        <div className="mt-5 max-w-xl">
          <SessionForm />
        </div>
      </LazyDetails>
      <form
        action="/coach/sessions"
        className="bo-panel grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Field name="from" label="Desde">
          <input
            className="bo-input"
            type="date"
            id="from"
            name="from"
            defaultValue={param(filters, 'from')}
          />
        </Field>
        <Field name="to" label="Hasta">
          <input
            className="bo-input"
            type="date"
            id="to"
            name="to"
            defaultValue={param(filters, 'to')}
          />
        </Field>
        <Field name="date" label="Fecha">
          <input
            type="date"
            className="bo-input"
            id="date"
            name="date"
            defaultValue={day}
          />
        </Field>
        <EntitySelect
          kind="programs"
          name="program_id"
          label="Programa"
          required={false}
          initial={
            program > 0
              ? {
                  id: String(program),
                  label: sessions[0]?.programs?.name ?? 'Programa seleccionado',
                }
              : undefined
          }
        />
        {profile?.role === 'admin' && (
          <EntitySelect
            kind="coaches"
            name="coach_id"
            label="Entrenador/a"
            required={false}
            initial={
              coach
                ? { id: coach, label: 'Entrenador seleccionado' }
                : undefined
            }
          />
        )}
        <Field name="state" label="Estado">
          <select
            className="bo-input"
            id="state"
            name="state"
            defaultValue={state}
          >
            <option value="">Todos</option>
            <option value="active">Activas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </Field>
        <button className="bo-button">Filtrar sesiones</button>
      </form>
      {sessions.length ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <section className="bo-panel" key={session.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {session.programs?.name ?? 'Programa anterior'}
                  </h3>
                  <p className="mt-1 text-sm text-white/65">
                    {clubDateTime(session.start_at)} —{' '}
                    {clubDateTime(session.end_at)}
                  </p>
                  <p className="mt-1 text-sm">
                    {session.active
                      ? session.end_at &&
                        Date.parse(session.end_at) < Date.now()
                        ? 'Finalizada'
                        : 'Activa'
                      : 'Cancelada'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    className="bo-link"
                    href={`/coach/attendance?session=${session.id}`}
                  >
                    Ver asistencia
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link
                      className="bo-link"
                      href={`/admin/history?entity=attendance_sessions&id=${session.id}`}
                    >
                      Historial
                    </Link>
                  )}
                  {session.active && (
                    <Link
                      className="bo-link"
                      href={`/coach/sessions/${session.id}/qr`}
                    >
                      Mostrar QR
                    </Link>
                  )}
                </div>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <LazyDetails title="Editar sesión">
                  <div className="mt-4">
                    <SessionForm session={session} />
                  </div>
                </LazyDetails>
                <LazyDetails title="Duplicar con otra fecha">
                  <div className="mt-4">
                    <SessionForm session={session} duplicate />
                  </div>
                </LazyDetails>
              </div>
              <div className="mt-5 flex flex-wrap gap-4">
                {session.active && (
                  <ActionForm
                    action={cancelSession}
                    submit="Cancelar sesión"
                    confirm="¿Cancelar esta sesión? Se conservará su asistencia."
                  >
                    <input type="hidden" name="session_id" value={session.id} />
                  </ActionForm>
                )}
                <ActionForm
                  action={deleteSession}
                  submit="Eliminar si está vacía"
                  confirm="¿Eliminar esta sesión? Solo se permite si no tiene asistencia."
                >
                  <input type="hidden" name="session_id" value={session.id} />
                </ActionForm>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Empty />
      )}
      <Pagination
        path="/coach/sessions"
        params={filters}
        count={count ?? 0}
        page={paging.page}
      />
    </div>
  )
}
