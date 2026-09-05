import Link from 'next/link'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  listParams,
  listUrl,
  param,
  searchPattern,
  statuses,
  type SearchParams,
} from '@/lib/backoffice/list'
import {
  Filters,
  Field,
  PageHeading,
  Pagination,
  Empty,
} from '@/components/backoffice/list'
import { clubDateTime, clubDateRange } from '@/lib/backoffice/time'

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { q, page, from, to } = listParams(params)
  const status = param(params, 'status')
  const { supabase } = await requireOperator()
  let query = supabase
    .from('membership_applications')
    .select('id, full_name, email, status, created_at', { count: 'exact' })
  if (q)
    query = query.or(
      `full_name.ilike.${searchPattern(q)},email.ilike.${searchPattern(q)}`,
    )
  if (['new', 'contacted', 'approved', 'rejected', 'archived'].includes(status))
    query = query.eq('status', status)
  const range = clubDateRange(param(params, 'from'), param(params, 'to'))
  if (range) {
    const column =
      param(params, 'completed') === 'true' ? 'completed_at' : 'created_at'
    query = query.gte(column, range.from).lt(column, range.to)
  }
  const oldest = param(params, 'sort') === 'oldest'
  const { data, count } = checked(
    await query
      .order('created_at', { ascending: oldest })
      .order('id')
      .range(from, to),
  )
  const returnTo = listUrl('/admin/applications', params)
  return (
    <>
      <PageHeading
        title="Solicitudes"
        description="Revisa las altas y acompaña a cada persona hasta su matrícula."
      />
      <Filters path="/admin/applications" q={q}>
        <input
          type="hidden"
          name="completed"
          value={param(params, 'completed')}
        />
        <Field name="from" label="Desde">
          <input
            className="bo-input"
            type="date"
            id="from"
            name="from"
            defaultValue={param(params, 'from')}
          />
        </Field>
        <Field name="to" label="Hasta">
          <input
            className="bo-input"
            type="date"
            id="to"
            name="to"
            defaultValue={param(params, 'to')}
          />
        </Field>
        <Field label="Estado" name="status">
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="bo-input"
          >
            <option value="">Todos</option>
            {['new', 'contacted', 'approved', 'rejected', 'archived'].map(
              (value) => (
                <option key={value} value={value}>
                  {statuses[value]}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="Orden" name="sort">
          <select
            id="sort"
            name="sort"
            defaultValue={oldest ? 'oldest' : 'newest'}
            className="bo-input"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
        </Field>
      </Filters>
      <div className="bo-panel">
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Estado</th>
                  <th>Recibida</th>
                  <th>Antigüedad</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link
                        className="bo-link font-medium"
                        href={`/admin/applications/${row.id}?back=${encodeURIComponent(returnTo)}`}
                      >
                        {row.full_name}
                      </Link>
                      <p className="mt-1 text-white/60">{row.email}</p>
                    </td>
                    <td>{statuses[row.status]}</td>
                    <td>{clubDateTime(row.created_at)}</td>
                    <td>
                      {Math.max(
                        0,
                        Math.floor(
                          (Date.now() - Date.parse(row.created_at)) / 86400000,
                        ),
                      )}{' '}
                      días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/admin/applications"
          params={params}
          page={page}
          count={count ?? 0}
        />
        <Link
          className="bo-link mt-4 inline-block text-sm"
          href={listUrl('/api/backoffice/export', params, {
            kind: 'applications',
          })}
        >
          Exportar resultados CSV
        </Link>
      </div>
    </>
  )
}
