import LazyDetails from '@/components/backoffice/lazy-details'
import Link from 'next/link'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  listParams,
  listUrl,
  param,
  searchPattern,
  type SearchParams,
} from '@/lib/backoffice/list'
import {
  Filters,
  Field,
  PageHeading,
  Pagination,
  Empty,
} from '@/components/backoffice/list'
import { ActionForm } from '@/components/backoffice/action-form'
import EntitySelect from '@/components/backoffice/entity-select'
import { createProgram } from '../user/actions'

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { q, page, from, to } = listParams(params)
  const { supabase } = await requireOperator()
  const active = param(params, 'active')
  let query = supabase
    .from('programs')
    .select(
      'id, name, active, coach_id, profiles!programs_coach_id_fkey(full_name)',
      { count: 'exact' },
    )
  if (q) query = query.ilike('name', searchPattern(q))
  if (active) query = query.eq('active', active !== 'false')
  if (param(params, 'unassigned') === 'true') query = query.is('coach_id', null)
  const { data, count } = checked(
    await query.order('name').order('id').range(from, to),
  )
  const returnTo = listUrl('/admin/programs', params)
  return (
    <>
      <PageHeading
        title="Programas"
        description="Organiza grupos, responsables y matrículas."
      />
      <LazyDetails className="bo-panel mb-6" title="Nuevo programa">
        <div className="mt-5 max-w-xl">
          <ActionForm action={createProgram} submit="Crear programa">
            <Field label="Nombre" name="name">
              <input
                className="bo-input"
                id="name"
                name="name"
                required
                maxLength={120}
              />
            </Field>
            <Field label="Descripción" name="description">
              <textarea
                className="bo-input"
                id="description"
                name="description"
                maxLength={2000}
              />
            </Field>
            <EntitySelect
              name="coach_id"
              kind="coaches"
              label="Responsable inicial"
              required={false}
            />
          </ActionForm>
        </div>
      </LazyDetails>
      <Filters path="/admin/programs" q={q}>
        <Field label="Situación" name="active">
          <select
            className="bo-input"
            id="active"
            name="active"
            defaultValue={active}
          >
            <option value="">Todas</option>
            <option value="true">Activos</option>
            <option value="false">Archivados</option>
          </select>
        </Field>
        <label className="text-sm">
          <input
            type="checkbox"
            name="unassigned"
            value="true"
            defaultChecked={param(params, 'unassigned') === 'true'}
          />{' '}
          Sin responsable
        </label>
      </Filters>
      <div className="bo-panel">
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Responsable</th>
                  <th>Situación</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        className="bo-link"
                        href={`/admin/programs/${row.id}?back=${encodeURIComponent(returnTo)}`}
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td>
                      {(row.profiles as unknown as { full_name: string } | null)
                        ?.full_name || 'Sin responsable'}
                    </td>
                    <td>{row.active ? 'Activo' : 'Archivado'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/admin/programs"
          params={params}
          page={page}
          count={count ?? 0}
        />
      </div>
    </>
  )
}
