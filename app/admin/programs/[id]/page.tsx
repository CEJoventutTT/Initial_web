import LazyDetails from '@/components/backoffice/lazy-details'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { checked, requireOperator } from '@/lib/backoffice/server'
import {
  backUrl,
  listParams,
  param,
  statuses,
  type SearchParams,
} from '@/lib/backoffice/list'
import { ActionForm } from '@/components/backoffice/action-form'
import {
  Empty,
  Field,
  PageHeading,
  Pagination,
} from '@/components/backoffice/list'
import EntitySelect from '@/components/backoffice/entity-select'
import History from '@/components/backoffice/history'
import {
  assignCoach,
  enrollStudent,
  removeCoach,
  updateEnrollment,
  updateProgram,
} from '../../user/actions'

export default async function ProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params,
    filters = await searchParams
  const { supabase } = await requireOperator()
  const { data: program } = checked(
    await supabase
      .from('programs')
      .select(
        'id, name, description, active, coach_id, profiles!programs_coach_id_fkey(full_name)',
      )
      .eq('id', id)
      .maybeSingle(),
  )
  if (!program) notFound()
  const students = listParams(filters),
    coachesPage = listParams({ page: filters.coaches })
  const [enrollmentsRes, coachesRes, futureRes, activeRes] = await Promise.all([
    supabase
      .from('enrollments')
      .select('id, user_id, status, profiles(full_name)', { count: 'exact' })
      .eq('program_id', id)
      .order('id')
      .range(students.from, students.to),
    supabase
      .from('coach_programs')
      .select('id, coach_id, profiles(full_name)', { count: 'exact' })
      .eq('program_id', id)
      .order('id')
      .range(coachesPage.from, coachesPage.to),
    supabase
      .from('attendance_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', id)
      .eq('active', true)
      .gte('start_at', new Date().toISOString()),
    supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', id)
      .eq('status', 'active'),
  ])
  const enrollments = checked(enrollmentsRes),
    coaches = checked(coachesRes),
    future = checked(futureRes).count ?? 0,
    active = checked(activeRes).count ?? 0
  const responsible =
    (program.profiles as unknown as { full_name: string } | null)?.full_name ??
    'Responsable actual'
  const path = `/admin/programs/${id}`
  return (
    <div className="space-y-6">
      <Link
        className="bo-link"
        href={backUrl(param(filters, 'back'), '/admin/programs')}
      >
        ← Volver a programas
      </Link>
      <PageHeading
        title={program.name}
        description={`${program.active ? 'Activo' : 'Archivado'} · ${active} matrículas activas · ${future} sesiones futuras activas`}
      />
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Configuración</h3>
        <ActionForm
          action={updateProgram}
          confirm={`¿Guardar los cambios? Si archivas el programa, se darán de baja sus matrículas activas (ahora ${active}) y se cancelarán sus sesiones futuras activas (ahora ${future}).`}
        >
          <input type="hidden" name="program_id" value={id} />
          <Field name="name" label="Nombre">
            <input
              className="bo-input"
              id="name"
              name="name"
              required
              maxLength={120}
              defaultValue={program.name}
            />
          </Field>
          <Field name="description" label="Descripción">
            <textarea
              className="bo-input"
              id="description"
              name="description"
              maxLength={2000}
              defaultValue={program.description ?? ''}
            />
          </Field>
          <EntitySelect
            name="coach_id"
            label="Responsable"
            kind="coaches"
            required={false}
            initial={
              program.coach_id
                ? { id: program.coach_id, label: responsible }
                : undefined
            }
          />
          <Field name="active" label="Situación">
            <select
              className="bo-input"
              id="active"
              name="active"
              defaultValue={String(program.active)}
            >
              <option value="true">Activo</option>
              <option value="false">Archivado</option>
            </select>
          </Field>
          <p className="text-sm text-white/65">
            Archivar conserva el historial. Al reactivar, las matrículas y
            sesiones se reactivan individualmente.
          </p>
        </ActionForm>
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Entrenadores adicionales</h3>
        {coaches.data?.length ? (
          <ul className="space-y-4">
            {coaches.data.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-4"
              >
                <Link
                  className="bo-link"
                  href={`/admin/people/${row.coach_id}`}
                >
                  {(row.profiles as unknown as { full_name: string })
                    ?.full_name ?? 'Entrenador'}
                </Link>
                <ActionForm
                  action={removeCoach}
                  submit="Retirar asignación"
                  confirm="¿Retirar el acceso de este entrenador al programa?"
                >
                  <input type="hidden" name="assignment_id" value={row.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No hay entrenadores adicionales.</Empty>
        )}
        <Pagination
          path={path}
          params={filters}
          count={coaches.count ?? 0}
          page={coachesPage.page}
          pageKey="coaches"
        />
        {program.active && (
          <LazyDetails className="mt-5" title="Asignar entrenador">
            <ActionForm action={assignCoach} submit="Asignar" className="mt-4">
              <input type="hidden" name="program_id" value={id} />
              <EntitySelect
                kind="coaches"
                name="coach_id"
                label="Entrenador/a"
              />
            </ActionForm>
          </LazyDetails>
        )}
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Alumnos y matrículas</h3>
        {enrollments.data?.length ? (
          <ul className="space-y-4">
            {enrollments.data.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"
              >
                <p>
                  <Link
                    className="bo-link"
                    href={`/admin/people/${row.user_id}`}
                  >
                    {(row.profiles as unknown as { full_name: string })
                      ?.full_name ?? 'Alumno/a'}
                  </Link>{' '}
                  · {statuses[row.status]} ·{' '}
                  <Link
                    className="bo-link text-xs"
                    href={`/admin/history?entity=enrollments&id=${row.id}`}
                  >
                    Historial
                  </Link>
                </p>
                <ActionForm
                  action={updateEnrollment}
                  submit={row.status === 'active' ? 'Dar de baja' : 'Reactivar'}
                  disabled={!program.active && row.status !== 'active'}
                  confirm="¿Cambiar el estado de esta matrícula?"
                >
                  <input type="hidden" name="enrollment_id" value={row.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={row.status === 'active' ? 'inactive' : 'active'}
                  />
                </ActionForm>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No hay matrículas.</Empty>
        )}
        <Pagination
          path={path}
          params={filters}
          page={students.page}
          count={enrollments.count ?? 0}
        />
        {program.active && (
          <LazyDetails className="mt-5" title="Matricular alumno/a">
            <ActionForm
              action={enrollStudent}
              submit="Matricular"
              className="mt-4"
            >
              <input type="hidden" name="program_id" value={id} />
              <EntitySelect kind="students" name="user_id" label="Alumno/a" />
            </ActionForm>
          </LazyDetails>
        )}
      </section>
      <History entity="programs" id={id} path={path} params={filters} />
    </div>
  )
}
