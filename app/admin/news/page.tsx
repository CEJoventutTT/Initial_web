import Link from 'next/link'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  listParams,
  listUrl,
  param,
  searchPattern,
  type SearchParams,
} from '@/lib/backoffice/list'
import { clubDateTime } from '@/lib/backoffice/time'
import { newsStatuses, newsCategories, newsSources } from '@/lib/news/editorial'
import {
  PageHeading,
  Filters,
  Field,
  Pagination,
  Empty,
} from '@/components/backoffice/list'
import { Button } from '@/components/ui/button'
import NewsSync from '@/components/backoffice/news/sync'

export default async function NewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams,
    { q, page, from, to } = listParams(params)
  const { supabase } = await requireOperator()
  let query = supabase
    .from('news_articles')
    .select('admin_id,title,lang,status,source,date,updated_at', {
      count: 'exact',
    })
  if (q) query = query.ilike('title', searchPattern(q))
  for (const key of ['status', 'lang', 'source'])
    if (param(params, key)) query = query.eq(key, param(params, key))
  if (param(params, 'category'))
    query = query.contains('categories', [param(params, 'category')])
  const [articles, runs] = await Promise.all([
    query
      .order('date', { ascending: param(params, 'sort') === 'oldest' })
      .order('admin_id')
      .range(from, to),
    supabase
      .from('news_sync_runs')
      .select(
        'id,started_at,status,read_count,created_count,skipped_count,error',
      )
      .order('started_at', { ascending: false })
      .limit(5),
  ])
  const { data, count } = checked(articles),
    sync = checked(runs).data
  const back = listUrl('/admin/news', params)
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          title="Noticias"
          description="Prepara artículos y revisa las noticias importadas antes de publicarlas."
        />
        <Button className="bo-button" asChild>
          <Link href={`/admin/news/new?back=${encodeURIComponent(back)}`}>
            Nueva noticia
          </Link>
        </Button>
      </div>
      <Filters path="/admin/news" q={q} placeholder="Título de la noticia">
        {[
          ['status', 'Estado', Object.entries(newsStatuses)],
          [
            'lang',
            'Idioma',
            [
              ['ca', 'Català'],
              ['es', 'Castellano'],
              ['en', 'English'],
            ],
          ],
          ['category', 'Categoría', Object.entries(newsCategories)],
          [
            'source',
            'Origen',
            [
              ['manual', 'Manual'],
              ['rss', 'RSS'],
              ['csv', 'CSV'],
              ['legacy', 'Anterior'],
            ],
          ],
        ].map(([key, label, options]) => (
          <Field key={String(key)} name={String(key)} label={String(label)}>
            <select
              className="bo-input"
              id={String(key)}
              name={String(key)}
              defaultValue={param(params, String(key))}
            >
              <option value="">Todos</option>
              {(options as string[][]).map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        ))}
        <Field name="sort" label="Orden">
          <select
            className="bo-input"
            id="sort"
            name="sort"
            defaultValue={param(params, 'sort')}
          >
            <option value="">Más recientes</option>
            <option value="oldest">Más antiguas</option>
          </select>
        </Field>
      </Filters>
      <section className="bo-panel mb-6">
        {data?.length ? (
          <div className="overflow-x-auto">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Idioma</th>
                  <th>Estado</th>
                  <th>Origen</th>
                  <th>Fecha editorial</th>
                  <th>Modificada</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.admin_id}>
                    <td>
                      <Link
                        className="bo-link"
                        href={`/admin/news/${row.admin_id}?back=${encodeURIComponent(back)}`}
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td>{row.lang.toUpperCase()}</td>
                    <td>
                      {newsStatuses[row.status as keyof typeof newsStatuses]}
                    </td>
                    <td>{newsSources[row.source] || row.source}</td>
                    <td>{clubDateTime(row.date)}</td>
                    <td>{clubDateTime(row.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>
            No hay noticias con estos filtros. Crea una noticia o sincroniza
            desde Medium.
          </Empty>
        )}
        <Pagination
          path="/admin/news"
          params={params}
          page={page}
          count={count ?? 0}
        />
      </section>
      <section className="bo-panel space-y-5">
        <h3 className="text-lg font-semibold">Importación desde Medium</h3>
        <p className="text-sm text-white/65">
          Las noticias nuevas se guardan como borradores. Las noticias
          existentes conservan su contenido y estado.
        </p>
        <NewsSync />
        {sync?.length ? (
          <ul className="space-y-3 text-sm">
            {sync.map((run) => (
              <li key={run.id} className="border-t border-white/10 pt-3">
                {clubDateTime(run.started_at)} ·{' '}
                {
                  {
                    running: 'En curso',
                    success: 'Completada',
                    failed: 'Fallida',
                  }[run.status as 'running' | 'success' | 'failed']
                }{' '}
                · {run.created_count} creadas / {run.read_count} leídas ·{' '}
                {run.skipped_count} omitidas
                {run.error && <p className="mt-1 text-red-200">{run.error}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/65">
            Todavía no hay sincronizaciones registradas.
          </p>
        )}
      </section>
    </>
  )
}
