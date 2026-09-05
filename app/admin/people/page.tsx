import LazyDetails from '@/components/backoffice/lazy-details'
import Link from 'next/link'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  listParams,
  listUrl,
  param,
  searchPattern,
  statuses,
  type SearchParams,
  type PersonSummary,
} from '@/lib/backoffice/list'
import {
  Filters,
  Field,
  PageHeading,
  Pagination,
  Empty,
} from '@/components/backoffice/list'
import { ActionForm } from '@/components/backoffice/action-form'
import { createUserAdmin } from '../user/actions'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { q, page, from, to } = listParams(params)
  const { supabase } = await requireOperator()
  const role = param(params, 'role'),
    active = param(params, 'active')
  let query = supabase.rpc('admin_people_directory', {}, { count: 'exact' })
  if (q)
    query = query.or(
      `full_name.ilike.${searchPattern(q)},email.ilike.${searchPattern(q)}`,
    )
  if (['admin', 'coach', 'student', 'parent'].includes(role))
    query = query.eq('role', role)
  if (active) query = query.eq('active', active !== 'false')
  const { data, count } = checked(
    await query.order('full_name').order('user_id').range(from, to),
  )
  const returnTo = listUrl('/admin/people', params)
  return (
    <>
      <PageHeading
        title="Personas"
        description="Consulta perfiles, matrículas y acceso al club."
      />
      <LazyDetails className="bo-panel mb-6" title="Crear cuenta">
        <div className="mt-5 max-w-xl">
          <ActionForm action={createUserAdmin} submit="Crear e invitar">
            <Field label="Nombre completo" name="fullName">
              <input
                className="bo-input"
                id="fullName"
                name="fullName"
                required
                maxLength={120}
              />
            </Field>
            <Field label="Correo electrónico" name="email">
              <input
                className="bo-input"
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
              />
            </Field>
            <Field label="Rol inicial" name="role">
              <select
                className="bo-input"
                id="role"
                name="role"
                defaultValue="student"
              >
                <option value="student">Alumno/a</option>
                <option value="coach">Entrenador/a</option>
                <option value="admin">Administración</option>
              </select>
            </Field>
          </ActionForm>
        </div>
      </LazyDetails>
      <Filters path="/admin/people" q={q}>
        <Field label="Rol" name="role-filter">
          <select
            className="bo-input"
            id="role-filter"
            name="role"
            defaultValue={role}
          >
            <option value="">Todos</option>
            {['student', 'coach', 'admin', 'parent'].map((value) => (
              <option value={value} key={value}>
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
            defaultValue={active}
          >
            <option value="">Todas</option>
            <option value="true">En activo</option>
            <option value="false">De baja</option>
          </select>
        </Field>
      </Filters>
      <div className="bo-panel">
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Situación</th>
                </tr>
              </thead>
              <tbody>
                {(data as PersonSummary[]).map((row) => (
                  <tr key={row.user_id}>
                    <td>
                      <Link
                        className="bo-link"
                        href={`/admin/people/${row.user_id}?back=${encodeURIComponent(returnTo)}`}
                      >
                        {row.full_name || 'Sin nombre'}
                      </Link>
                      <p className="mt-1 text-white/60">{row.email}</p>
                    </td>
                    <td>{statuses[row.role]}</td>
                    <td>{row.active ? 'En activo' : 'De baja'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/admin/people"
          params={params}
          page={page}
          count={count ?? 0}
        />
        <Link
          className="bo-link mt-4 inline-block text-sm"
          href={listUrl('/api/backoffice/export', params, { kind: 'people' })}
        >
          Exportar resultados CSV
        </Link>
      </div>
    </>
  )
}
