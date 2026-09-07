import { requireOperator } from '@/lib/backoffice/server'
import { backUrl, param, type SearchParams } from '@/lib/backoffice/list'
import { PageHeading } from '@/components/backoffice/list'
import NewsEditor from '@/components/backoffice/news/editor'
export default async function NewNewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireOperator()
  const params = await searchParams
  return (
    <>
      <PageHeading
        title="Nueva noticia"
        description="Empieza con un borrador y comprueba su vista previa antes de publicar."
      />
      <NewsEditor back={backUrl(param(params, 'back'), '/admin/news')} />
    </>
  )
}
