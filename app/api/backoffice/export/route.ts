import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  searchPattern,
  statuses,
  type PersonSummary,
} from '@/lib/backoffice/list'
import { clubDateRange } from '@/lib/backoffice/time'
import { csvRow } from '@/lib/backoffice/csv'

export async function GET(request: Request) {
  try {
    const { supabase } = await requireOperator()
    const params = new URL(request.url).searchParams
    const kind = params.get('kind'),
      q = (params.get('q') ?? '').slice(0, 120)
    if (kind !== 'people' && kind !== 'applications')
      return Response.json({ error: 'Exportación no válida' }, { status: 400 })
    const range =
      params.get('from') && params.get('to')
        ? clubDateRange(params.get('from')!, params.get('to')!)
        : null
    const makeQuery = () => {
      if (kind === 'people') {
        let query = supabase
          .rpc('admin_people_directory')
          .order('full_name')
          .order('user_id')
        if (q)
          query = query.or(
            `full_name.ilike.${searchPattern(q)},email.ilike.${searchPattern(q)}`,
          )
        const role = params.get('role')
        if (role && ['student', 'coach', 'admin', 'parent'].includes(role))
          query = query.eq('role', role)
        if (params.get('active'))
          query = query.eq('active', params.get('active') !== 'false')
        return query
      }
      let query = supabase
        .from('membership_applications')
        .select('id, full_name, email, status, created_at')
        .order('created_at', { ascending: params.get('sort') === 'oldest' })
        .order('id')
      if (q)
        query = query.or(
          `full_name.ilike.${searchPattern(q)},email.ilike.${searchPattern(q)}`,
        )
      const status = params.get('status')
      if (
        status &&
        ['new', 'contacted', 'approved', 'rejected', 'archived'].includes(
          status,
        )
      )
        query = query.eq('status', status)
      if (range)
        query = query
          .gte(
            params.get('completed') === 'true' ? 'completed_at' : 'created_at',
            range.from,
          )
          .lt(
            params.get('completed') === 'true' ? 'completed_at' : 'created_at',
            range.to,
          )
      return query
    }
    // Fetch the first page before starting the download so initial failures return a proper error.
    const first = checked(await makeQuery().range(0, 499)).data ?? []
    const encoder = new TextEncoder()
    let batch = first,
      offset = 0,
      headerSent = false
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          if (!headerSent) {
            controller.enqueue(
              encoder.encode(
                '\uFEFF' +
                  csvRow(
                    kind === 'people'
                      ? ['ID', 'Nombre', 'Correo', 'Rol', 'Situación']
                      : ['ID', 'Nombre', 'Correo', 'Estado', 'Recibida'],
                  ),
              ),
            )
            headerSent = true
          }
          controller.enqueue(
            encoder.encode(
              batch
                .map(
                  (
                    row:
                      | PersonSummary
                      | {
                          id: string
                          full_name: string
                          email: string
                          status: string
                          created_at: string
                        },
                  ) =>
                    'role' in row
                      ? csvRow([
                          row.user_id,
                          row.full_name,
                          row.email,
                          statuses[row.role],
                          row.active ? 'En activo' : 'De baja',
                        ])
                      : csvRow([
                          row.id,
                          row.full_name,
                          row.email,
                          statuses[row.status],
                          row.created_at,
                        ]),
                )
                .join(''),
            ),
          )
          if (batch.length < 500) {
            controller.close()
            return
          }
          offset += 500
          batch =
            checked(await makeQuery().range(offset, offset + 499)).data ?? []
        } catch (error) {
          controller.error(error)
        }
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${kind === 'people' ? 'personas' : 'solicitudes'}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return Response.json(
      { error: 'No se pudo preparar la exportación.' },
      { status: 403 },
    )
  }
}
