import { param, type SearchParams } from '@/lib/backoffice/list'
import History from '@/components/backoffice/history'
import { PageHeading } from '@/components/backoffice/list'
import { notFound } from 'next/navigation'
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams,
    entity = param(params, 'entity'),
    id = param(params, 'id')
  if (
    ![
      'enrollments',
      'coach_programs',
      'attendance_logs',
      'attendance_sessions',
    ].includes(entity) ||
    !id
  )
    notFound()
  return (
    <>
      <PageHeading
        title="Historial operativo"
        description="Cambios registrados con fecha y autor."
      />
      <History entity={entity} id={id} path="/admin/history" params={params} />
    </>
  )
}
