import { checked, requireOperator } from '@/lib/backoffice/server'
import { listParams, statuses, type SearchParams } from '@/lib/backoffice/list'
import { clubDateTime } from '@/lib/backoffice/time'
import { Pagination, Empty } from './list'

const labels: Record<string, string> = {
  status: 'Estado',
  internal_notes: 'Notas',
  linked_user_id: 'Persona vinculada',
  full_name: 'Nombre',
  role: 'Rol',
  active: 'Activo',
  name: 'Nombre',
  coach_id: 'Responsable',
  user_id: 'Persona',
  program_id: 'Programa',
  start_at: 'Inicio',
  end_at: 'Fin',
  description: 'Descripción',
}
function changes(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
) {
  return Object.keys(labels)
    .filter(
      (key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]),
    )
    .map((key) => {
      const display = (value: unknown) =>
        value == null
          ? '—'
          : typeof value === 'boolean'
            ? value
              ? 'Sí'
              : 'No'
            : (statuses[String(value)] ?? String(value))
      return `${labels[key]}: ${display(before?.[key])} → ${display(after?.[key])}`
    })
}
export default async function History({
  entity,
  id,
  path,
  params,
}: {
  entity: string
  id: string
  path: string
  params: SearchParams
}) {
  const { supabase } = await requireOperator()
  const { page, from, to } = listParams({ page: params.history })
  const { data, count } = checked(
    await supabase
      .from('backoffice_audit')
      .select(
        'id, actor_id, action, before_data, after_data, reason, created_at',
        { count: 'exact' },
      )
      .eq('entity', entity)
      .eq('entity_id', id)
      .order('id', { ascending: false })
      .range(from, to),
  )
  const ids = [
    ...new Set((data ?? []).map((row) => row.actor_id).filter(Boolean)),
  ]
  const actors = ids.length
    ? (checked(
        await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', ids),
      ).data ?? [])
    : []
  const names = new Map(actors.map((row) => [row.user_id, row.full_name]))
  return (
    <section className="bo-panel">
      <h3 className="mb-4 text-lg font-semibold">Historial de cambios</h3>
      {data?.length ? (
        <ol className="space-y-4">
          {data.map((row) => (
            <li
              key={row.id}
              className="border-l-2 border-white/20 pl-4 text-sm"
            >
              <p className="font-medium">
                {clubDateTime(row.created_at)} ·{' '}
                {names.get(row.actor_id) ||
                  (row.actor_id ? 'Usuario anterior' : 'Sistema')}
              </p>
              <p className="text-white/60">
                {row.action === 'INSERT'
                  ? 'Registro creado'
                  : row.action === 'DELETE'
                    ? 'Registro retirado'
                    : 'Registro actualizado'}
              </p>
              {changes(row.before_data, row.after_data).map((change) => (
                <p
                  className="mt-1 break-words whitespace-pre-wrap text-white/80"
                  key={change}
                >
                  {change}
                </p>
              ))}
              {row.reason && <p className="mt-1">Motivo: {row.reason}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <Empty>
          No hay cambios registrados desde la incorporación del historial.
        </Empty>
      )}
      <Pagination
        path={path}
        params={params}
        page={page}
        count={count ?? 0}
        pageKey="history"
      />
    </section>
  )
}
