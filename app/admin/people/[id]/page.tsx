import LazyDetails from '@/components/backoffice/lazy-details'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  backUrl,
  listParams,
  param,
  statuses,
  type SearchParams,
} from '@/lib/backoffice/list'
import { clubDateTime } from '@/lib/backoffice/time'
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
  createUserAdmin,
  enrollStudent,
  updateEnrollment,
  updateProfile,
} from '../../user/actions'

type Program = { name: string }
export default async function PersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params,
    filters = await searchParams
  const { supabase } = await requireOperator()
  const { data: person } = checked(
    await supabase
      .from('profiles')
      .select('user_id, full_name, role, active')
      .eq('user_id', id)
      .maybeSingle(),
  )
  if (!person) notFound()
  const membership = listParams(filters),
    attendance = listParams({ page: filters.attendance })
  const [identityRes, invitationRes, enrollmentRes, attendanceRes] =
    await Promise.all([
      supabase.rpc('admin_account_identity', { p_user: id }),
      supabase
        .from('account_invitations')
        .select(
          'email, full_name, role, status, attempts, last_attempt_at, last_error, lease_until',
        )
        .eq('user_id', id)
        .maybeSingle(),
      supabase
        .from('enrollments')
        .select('id, program_id, status, programs(name)', { count: 'exact' })
        .eq('user_id', id)
        .order('id', { ascending: false })
        .range(membership.from, membership.to),
      supabase
        .from('attendance_logs')
        .select('id, checked_at, session_id, programs(name)', {
          count: 'exact',
        })
        .eq('student_id', id)
        .order('checked_at', { ascending: false })
        .order('id')
        .range(attendance.from, attendance.to),
    ])
  const identity = checked(identityRes).data?.[0],
    invitation = checked(invitationRes).data
  const enrollments = checked(enrollmentRes),
    logs = checked(attendanceRes),
    path = `/admin/people/${id}`
  const teachingPage = listParams({ page: filters.teaching })
  const teaching = checked(
    await supabase
      .rpc('admin_person_programs', { p_user: id }, { count: 'exact' })
      .order('name')
      .order('id')
      .range(teachingPage.from, teachingPage.to),
  )
  return (
    <div className="space-y-6">
      <Link
        className="bo-link"
        href={backUrl(param(filters, 'back'), '/admin/people')}
      >
        ← Volver a personas
      </Link>
      <PageHeading
        title={person.full_name || 'Persona sin nombre'}
        description={`${identity?.email ?? 'Sin correo'} · ${statuses[person.role]}`}
      />
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Datos y situación</h3>
        <ActionForm
          action={updateProfile}
          confirm="¿Guardar los cambios de esta persona? Darla de baja desactiva sus matrículas. Los cambios de rol afectan a sus permisos."
        >
          <input type="hidden" name="user_id" value={id} />
          <Field label="Nombre completo" name="full_name">
            <input
              className="bo-input"
              id="full_name"
              name="full_name"
              defaultValue={person.full_name ?? ''}
              required
              maxLength={120}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Rol" name="role">
              <select
                className="bo-input"
                id="role"
                name="role"
                defaultValue={person.role}
              >
                {[
                  'student',
                  'coach',
                  'admin',
                  ...(person.role === 'parent' ? ['parent'] : []),
                ].map((value) => (
                  <option key={value} value={value}>
                    {statuses[value]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Situación" name="active">
              <select
                className="bo-input"
                id="active"
                name="active"
                defaultValue={String(person.active)}
              >
                <option value="true">En activo</option>
                <option value="false">De baja</option>
              </select>
            </Field>
          </div>
          <p className="text-sm text-white/60">
            La baja desactiva matrículas y conserva el historial. Reactivar la
            persona no reactiva sus matrículas automáticamente.
          </p>
        </ActionForm>
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Acceso e invitación</h3>
        <p>
          {identity?.last_sign_in_at
            ? `Último acceso: ${clubDateTime(identity.last_sign_in_at)}`
            : 'Todavía no ha iniciado sesión.'}
        </p>
        {invitation && (
          <>
            <p className="mt-2 text-sm text-white/70">
              Envío:{' '}
              {invitation.status === 'sending' &&
              invitation.lease_until &&
              Date.parse(invitation.lease_until) < Date.now()
                ? 'Proceso interrumpido; se puede reintentar'
                : statuses[invitation.status]}{' '}
              · {invitation.attempts} intentos ·{' '}
              {clubDateTime(invitation.last_attempt_at)}
            </p>
            {invitation.last_error && (
              <p className="mt-2 text-sm text-amber-200">
                {invitation.last_error}
              </p>
            )}
            {!identity?.last_sign_in_at && person.active && (
              <ActionForm
                action={createUserAdmin}
                submit="Reenviar acceso"
                className="mt-4"
                confirm="¿Enviar un nuevo correo de acceso a esta persona?"
              >
                <input type="hidden" name="email" value={invitation.email} />
                <input
                  type="hidden"
                  name="fullName"
                  value={invitation.full_name}
                />
                <input type="hidden" name="role" value={invitation.role} />
                <input type="hidden" name="resend" value="true" />
              </ActionForm>
            )}
          </>
        )}
        {!invitation && (
          <p className="mt-2 text-sm text-white/60">
            Cuenta anterior al seguimiento de invitaciones.
          </p>
        )}
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Matrículas</h3>
        {enrollments.data?.length ? (
          <ul className="space-y-4">
            {enrollments.data.map((row) => (
              <li
                className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4"
                key={row.id}
              >
                <p>
                  <Link
                    className="bo-link"
                    href={`/admin/programs/${row.program_id}`}
                  >
                    {(row.programs as unknown as Program)?.name}
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
          <Empty>No tiene matrículas.</Empty>
        )}
        <Pagination
          path={path}
          params={filters}
          page={membership.page}
          count={enrollments.count ?? 0}
        />
        {person.role === 'student' && person.active && (
          <LazyDetails className="mt-6" title="Nueva matrícula">
            <ActionForm
              action={enrollStudent}
              submit="Matricular"
              className="mt-4"
            >
              <input type="hidden" name="user_id" value={id} />
              <EntitySelect
                name="program_id"
                label="Programa"
                kind="programs"
              />
            </ActionForm>
          </LazyDetails>
        )}
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">Asistencia registrada</h3>
        {logs.data?.length ? (
          <ul className="space-y-3 text-sm">
            {logs.data.map((row) => (
              <li key={row.id}>
                <Link
                  className="bo-link"
                  href={`/coach/attendance?session=${row.session_id}`}
                >
                  {(row.programs as unknown as Program)?.name ??
                    'Programa anterior'}
                </Link>{' '}
                · {clubDateTime(row.checked_at)}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No hay asistencias registradas.</Empty>
        )}
        <Pagination
          path={path}
          params={filters}
          page={attendance.page}
          count={logs.count ?? 0}
          pageKey="attendance"
        />
      </section>
      {person.role === 'coach' || person.role === 'admin' || teaching.count ? (
        <section className="bo-panel">
          <h3 className="mb-4 text-lg font-semibold">Programas que imparte</h3>
          {teaching.data?.length ? (
            <ul className="space-y-3">
              {(
                teaching.data as {
                  id: number
                  name: string
                  active: boolean
                  responsible: boolean
                }[]
              ).map((row) => (
                <li key={row.id}>
                  <Link className="bo-link" href={`/admin/programs/${row.id}`}>
                    {row.name}
                  </Link>{' '}
                  · {row.responsible ? 'Responsable' : 'Entrenador adicional'} ·{' '}
                  {row.active ? 'Activo' : 'Archivado'}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No tiene programas asignados.</Empty>
          )}
          <Pagination
            path={path}
            params={filters}
            page={teachingPage.page}
            count={teaching.count ?? 0}
            pageKey="teaching"
          />
        </section>
      ) : null}
      <History entity="profiles" id={id} path={path} params={filters} />
    </div>
  )
}
