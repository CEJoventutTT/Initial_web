import { notFound } from 'next/navigation'
import { requireOperator, checked } from '@/lib/backoffice/server'
import { backUrl, param, type SearchParams } from '@/lib/backoffice/list'
import type { EditorialArticle } from '@/lib/news/editorial'
import { PageHeading } from '@/components/backoffice/list'
import NewsEditor from '@/components/backoffice/news/editor'
import History from '@/components/backoffice/history'
export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params,
    filters = await searchParams
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)
  )
    notFound()
  const { supabase } = await requireOperator()
  const { data } = checked(
    await supabase
      .from('news_articles')
      .select('*')
      .eq('admin_id', id)
      .maybeSingle(),
  )
  if (!data) notFound()
  return (
    <div className="space-y-6">
      <PageHeading
        title="Editar noticia"
        description="Gestiona el contenido y su publicación conservando el enlace original."
      />
      <NewsEditor
        article={data as EditorialArticle}
        back={backUrl(param(filters, 'back'), '/admin/news')}
      />
      <History
        entity="news_articles"
        id={id}
        path={`/admin/news/${id}`}
        params={filters}
      />
    </div>
  )
}
