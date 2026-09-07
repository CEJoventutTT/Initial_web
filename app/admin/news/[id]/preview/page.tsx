import { notFound } from 'next/navigation'
import { requireOperator, checked } from '@/lib/backoffice/server'
import { editorialToArticle, type EditorialArticle } from '@/lib/news/editorial'
import ArticleContent from '@/components/news/article-content'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Vista previa de noticia',
  robots: { index: false, follow: false },
}
export default async function PreviewNews({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
    <>
      <p className="bo-panel">
        Vista previa privada del último contenido guardado.
      </p>
      <ArticleContent article={editorialToArticle(data as EditorialArticle)} />
    </>
  )
}
