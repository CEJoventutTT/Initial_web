import Link from 'next/link'
import { requireOperator, checked } from '@/lib/backoffice/server'
import {
  listParams,
  param,
  statuses,
  type SearchParams,
} from '@/lib/backoffice/list'
import { clubDateTime } from '@/lib/backoffice/time'
import { ActionForm } from '@/components/backoffice/action-form'
import {
  Empty,
  Field,
  PageHeading,
  Pagination,
} from '@/components/backoffice/list'
import { createUserAdmin } from '../user/actions'

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams,
    paging = listParams(params),
    mailPaging = listParams({ page: params.mailpage })
  const { supabase } = await requireOperator()
  const status = param(params, 'status'),
    pending = param(params, 'pending_access') === 'true'
  let invitationsQuery = supabase.rpc(
    'admin_invitation_status',
    {},
    { count: 'exact' },
  )
  let mailQuery = supabase.rpc('admin_email_status', {}, { count: 'exact' })
  if (['pending', 'sending', 'sent', 'failed', 'unknown'].includes(status)) {
    invitationsQuery = invitationsQuery.eq('status', status)
    mailQuery = mailQuery.eq('status', status)
  }
  if (pending) invitationsQuery = invitationsQuery.is('last_sign_in_at', null)
  const [invitationsRes, mailRes] = await Promise.all([
    invitationsQuery
      .order('last_attempt_at', { ascending: false })
      .order('id')
      .range(paging.from, paging.to),
    mailQuery
      .order('created_at', { ascending: false })
      .order('id')
      .range(mailPaging.from, mailPaging.to),
  ])
  const invitations = checked(invitationsRes),
    emails = checked(mailRes)
  type Invitation = {
    id: string
    user_id: string | null
    full_name: string
    email: string
    role: string
    status: string
    attempts: number
    last_attempt_at: string | null
    last_sign_in_at: string | null
    last_error: string | null
    lease_until: string | null
  }
  type Mail = {
    id: string
    flow: string
    kind: string
    status: string
    attempts: number
    next_attempt_at: string | null
    created_at: string
  }
  return (
    <div className="space-y-6">
      <PageHeading
        title="Seguimiento de correos"
        description="Consulta los envíos y recupera las invitaciones incompletas."
      />
      <form
        action="/admin/emails"
        className="bo-panel flex flex-wrap items-end gap-4"
      >
        <Field label="Estado del envío" name="status">
          <select
            className="bo-input"
            id="status"
            name="status"
            defaultValue={status}
          >
            <option value="">Todos</option>
            {['pending', 'sending', 'sent', 'failed', 'unknown'].map(
              (value) => (
                <option key={value} value={value}>
                  {statuses[value]}
                </option>
              ),
            )}
          </select>
        </Field>
        <label className="text-sm">
          <input
            type="checkbox"
            name="pending_access"
            value="true"
            defaultChecked={pending}
          />{' '}
          Solo invitaciones sin primer acceso
        </label>
        <button className="bo-button">Filtrar</button>
        <Link className="bo-link" href="/admin/emails">
          Limpiar
        </Link>
      </form>
      <section className="bo-panel">
        <h3 className="mb-2 text-lg font-semibold">Invitaciones de acceso</h3>
        <p className="mb-4 text-sm text-white/60">
          El envío de acceso utiliza Auth. «Enviada» confirma que Auth aceptó el
          envío; el primer acceso se comprueba por separado.
        </p>
        {invitations.data?.length ? (
          <ul className="space-y-5">
            {(invitations.data as Invitation[]).map((row) => (
              <li className="border-b border-white/10 pb-5" key={row.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    {row.user_id ? (
                      <Link
                        className="bo-link font-semibold"
                        href={`/admin/people/${row.user_id}`}
                      >
                        {row.full_name}
                      </Link>
                    ) : (
                      <h4 className="font-semibold">{row.full_name}</h4>
                    )}
                    <p className="text-sm text-white/65">{row.email}</p>
                    <p className="mt-2 text-sm">
                      {row.status === 'sending' &&
                      row.lease_until &&
                      Date.parse(row.lease_until) < Date.now()
                        ? 'Proceso interrumpido'
                        : statuses[row.status]}{' '}
                      · {row.attempts} intentos ·{' '}
                      {clubDateTime(row.last_attempt_at)}
                    </p>
                    <p className="text-sm text-white/65">
                      {row.last_sign_in_at
                        ? `Último acceso: ${clubDateTime(row.last_sign_in_at)}`
                        : 'Sin primer acceso'}
                    </p>
                    {row.last_error && (
                      <p className="mt-2 text-sm text-amber-200">
                        {row.last_error}
                      </p>
                    )}
                  </div>
                  {!row.last_sign_in_at && (
                    <ActionForm
                      action={createUserAdmin}
                      submit="Reintentar envío"
                      confirm="¿Enviar el acceso a esta persona?"
                    >
                      <input type="hidden" name="email" value={row.email} />
                      <input
                        type="hidden"
                        name="fullName"
                        value={row.full_name}
                      />
                      <input type="hidden" name="role" value={row.role} />
                      <input type="hidden" name="resend" value="true" />
                    </ActionForm>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/admin/emails"
          params={params}
          page={paging.page}
          count={invitations.count ?? 0}
        />
      </section>
      <section className="bo-panel">
        <h3 className="mb-2 text-lg font-semibold">Correos de formularios</h3>
        <p className="mb-4 text-sm text-white/60">
          Avisos y acuses de contacto e inscripción. Los fallos recuperables
          siguen el reintento automático existente.
        </p>
        {emails.data?.length ? (
          <div className="overflow-x-auto">
            <table className="bo-table">
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Intentos</th>
                  <th>Próximo intento</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(emails.data as Mail[]).map((row) => (
                  <tr key={row.id}>
                    <td>{row.flow === 'join' ? 'Inscripción' : 'Contacto'}</td>
                    <td>
                      {row.kind === 'notice'
                        ? 'Aviso al club'
                        : 'Acuse a la persona'}
                    </td>
                    <td>{statuses[row.status]}</td>
                    <td>{row.attempts}</td>
                    <td>{clubDateTime(row.next_attempt_at)}</td>
                    <td>{clubDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <Pagination
          path="/admin/emails"
          params={params}
          page={mailPaging.page}
          count={emails.count ?? 0}
          pageKey="mailpage"
        />
      </section>
    </div>
  )
}
