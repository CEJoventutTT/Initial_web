import Link from 'next/link'
import { checked, requireOperator } from '@/lib/backoffice/server'
import { clubDateTime, clubToday } from '@/lib/backoffice/time'
import {
  listParams,
  param,
  searchPattern,
  type SearchParams,
} from '@/lib/backoffice/list'
import { ActionForm } from '@/components/backoffice/action-form'
import {
  Empty,
  Field,
  PageHeading,
  Pagination,
} from '@/components/backoffice/list'
import { markAttendanceManually, correctAttendance } from './actions'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams,
    paging = listParams(filters)
  const { supabase } = await requireOperator(false)
  const sessionId = Number(param(filters, 'session'))
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0)
    return (
      <>
        <PageHeading
          title="Asistencia"
          description="Selecciona una sesión para ver presentes y pendientes."
        />
        <Link
          className="bo-button"
          href={`/coach/sessions?date=${clubToday()}`}
        >
          Elegir sesión de hoy
        </Link>
        <Link className="bo-link ml-4" href="/coach/sessions">
          Ver todas las sesiones
        </Link>
      </>
    )
  const { data: session } = checked(
    await supabase
      .from('attendance_sessions')
      .select('id, active, start_at, end_at, programs(name)')
      .eq('id', sessionId)
      .maybeSingle(),
  )
  if (!session)
    return (
      <Empty>
        La sesión no está disponible.{' '}
        <Link className="bo-link" href="/coach/sessions">
          Elegir otra sesión
        </Link>
      </Empty>
    )
  let query = supabase.rpc(
    'coach_attendance_roster',
    { p_session: sessionId },
    { count: 'exact' },
  )
  if (paging.q) query = query.ilike('full_name', searchPattern(paging.q))
  const state = param(filters, 'state')
  if (state === 'present' || state === 'pending')
    query = query.eq('present', state === 'present')
  const [rosterRes, totalRes, presentRes] = await Promise.all([
    query.order('full_name').order('student_id').range(paging.from, paging.to),
    supabase.rpc(
      'coach_attendance_roster',
      { p_session: sessionId },
      { count: 'exact', head: true },
    ),
    supabase
      .rpc(
        'coach_attendance_roster',
        { p_session: sessionId },
        { count: 'exact', head: true },
      )
      .eq('present', true),
  ])
  const roster = checked(rosterRes),
    total = checked(totalRes).count ?? 0,
    present = checked(presentRes).count ?? 0
  const rows = (roster.data ?? []) as {
    student_id: string
    full_name: string
    present: boolean
    checked_at: string | null
    enrolled: boolean
  }[]
  return (
    <div className="space-y-6">
      <Link className="bo-link" href="/coach/sessions">
        ← Elegir otra sesión
      </Link>
      <PageHeading
        title={`Asistencia · ${(session.programs as unknown as { name: string })?.name ?? 'Sesión'}`}
        description={`${clubDateTime(session.start_at)} — ${clubDateTime(session.end_at)}`}
      />
      <div className="bo-panel flex flex-wrap gap-6">
        <p>
          <strong className="text-xl">{present}</strong> presentes
        </p>
        <p>
          <strong className="text-xl">{total - present}</strong> pendientes
        </p>
        <p>
          <strong className="text-xl">{total}</strong> alumnos en la lista
        </p>
        {!session.active && (
          <p className="text-amber-200">
            Sesión cancelada: se conserva el historial.
          </p>
        )}
      </div>
      <form
        action="/coach/attendance"
        className="bo-panel flex flex-wrap items-end gap-4"
      >
        <input type="hidden" name="session" value={sessionId} />
        <Field name="q" label="Buscar alumno/a">
          <input className="bo-input" id="q" name="q" defaultValue={paging.q} />
        </Field>
        <Field name="state" label="Asistencia">
          <select
            className="bo-input"
            id="state"
            name="state"
            defaultValue={state}
          >
            <option value="">Todos</option>
            <option value="present">Presentes</option>
            <option value="pending">Pendientes</option>
          </select>
        </Field>
        <button className="bo-button">Filtrar</button>
      </form>
      <div className="bo-panel">
        {rows.length ? (
          <ul className="space-y-5">
            {rows.map((row) => (
              <li
                key={row.student_id}
                className="border-b border-white/10 pb-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">
                      {row.full_name || 'Alumno/a'}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${row.present ? 'text-emerald-200' : 'text-white/60'}`}
                    >
                      {row.present
                        ? `Presente · ${clubDateTime(row.checked_at)}`
                        : 'Pendiente'}
                      {!row.enrolled && ' · Matrícula ya no activa'}
                    </p>
                  </div>
                  {!row.present && row.enrolled && session.active && (
                    <ActionForm
                      action={markAttendanceManually}
                      submit="Marcar presente"
                    >
                      <input
                        type="hidden"
                        name="session_id"
                        value={sessionId}
                      />
                      <input
                        type="hidden"
                        name="student_id"
                        value={row.student_id}
                      />
                    </ActionForm>
                  )}
                </div>
                {row.present && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-white/65">
                      Corregir asistencia
                    </summary>
                    <ActionForm
                      className="mt-3"
                      action={correctAttendance}
                      submit="Retirar asistencia"
                      confirm="¿Retirar esta asistencia? Se recalcularán XP, misiones y la insignia de primera asistencia."
                    >
                      <input
                        type="hidden"
                        name="session_id"
                        value={sessionId}
                      />
                      <input
                        type="hidden"
                        name="student_id"
                        value={row.student_id}
                      />
                      <Field
                        name={`reason-${row.student_id}`}
                        label="Motivo de la corrección"
                      >
                        <textarea
                          id={`reason-${row.student_id}`}
                          name="reason"
                          className="bo-input"
                          minLength={5}
                          maxLength={500}
                          required
                        />
                      </Field>
                    </ActionForm>
                  </details>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/coach/attendance"
          params={filters}
          page={paging.page}
          count={roster.count ?? 0}
        />
      </div>
    </div>
  )
}
