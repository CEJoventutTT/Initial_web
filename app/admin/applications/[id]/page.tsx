import Link from 'next/link'
import { notFound } from 'next/navigation'
import { checked, requireOperator } from '@/lib/backoffice/server'
import {
  backUrl,
  param,
  statuses,
  type SearchParams,
} from '@/lib/backoffice/list'
import { clubDateTime } from '@/lib/backoffice/time'
import { ActionForm } from '@/components/backoffice/action-form'
import { Field, PageHeading } from '@/components/backoffice/list'
import EntitySelect from '@/components/backoffice/entity-select'
import History from '@/components/backoffice/history'
import {
  completeApplication,
  createUserAdmin,
  reviewApplication,
} from '../../user/actions'

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { id } = await params,
    filters = await searchParams
  const { supabase } = await requireOperator()
  const { data: app } = checked(
    await supabase
      .from('membership_applications')
      .select(
        'id, full_name, email, phone, municipality, birth_date, competition_interest, event_interest, status, internal_notes, linked_user_id, created_at',
      )
      .eq('id', id)
      .maybeSingle(),
  )
  if (!app) notFound()
  const [linkedResult, accessResult] = app.linked_user_id
    ? await Promise.all([
        supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', app.linked_user_id)
          .single(),
        supabase
          .rpc('admin_invitation_status')
          .eq('user_id', app.linked_user_id)
          .maybeSingle(),
      ])
    : [null, null]
  const linked = linkedResult ? checked(linkedResult).data : null
  const access = accessResult
    ? (checked(accessResult).data as {
        status: string
        last_sign_in_at: string | null
      } | null)
    : null
  return (
    <div className="space-y-6">
      <Link
        className="bo-link"
        href={backUrl(param(filters, 'back'), '/admin/applications')}
      >
        ← Volver a solicitudes
      </Link>
      <PageHeading
        title={app.full_name}
        description={`Solicitud recibida el ${clubDateTime(app.created_at)}`}
      />
      <section className="bo-panel">
        <h3 className="mb-3 text-lg font-semibold">Datos de la solicitud</h3>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            ['Correo', app.email],
            ['Teléfono', app.phone],
            ['Municipio', app.municipality],
            ['Nacimiento', app.birth_date],
            [
              'Competición',
              { yes: 'Sí', no: 'No', later: 'Más adelante' }[
                app.competition_interest as 'yes' | 'no' | 'later'
              ],
            ],
            ['Eventos', app.event_interest === 'yes' ? 'Sí' : 'No'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-white/55">{label}</dt>
              <dd className="mt-1 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">1. Revisar solicitud</h3>
        <ActionForm action={reviewApplication}>
          <input type="hidden" name="application_id" value={id} />
          <Field name="status" label="Estado">
            <select
              className="bo-input"
              id="status"
              name="status"
              defaultValue={app.status}
            >
              {['new', 'contacted', 'approved', 'rejected', 'archived'].map(
                (value) => (
                  <option key={value} value={value}>
                    {statuses[value]}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label="Notas internas" name="internal_notes">
            <textarea
              className="bo-input min-h-28"
              id="internal_notes"
              name="internal_notes"
              maxLength={5000}
              defaultValue={app.internal_notes ?? ''}
            />
          </Field>
        </ActionForm>
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">2. Vincular persona</h3>
        {app.linked_user_id ? (
          <div>
            <p>
              Vinculada a{' '}
              <Link
                className="bo-link"
                href={`/admin/people/${app.linked_user_id}`}
              >
                {linked?.full_name || 'Ver persona'}
              </Link>
              .
            </p>
            {access && (
              <p className="mt-3 text-sm text-white/65">
                {access.last_sign_in_at
                  ? 'La persona ya ha accedido a su cuenta.'
                  : access.status === 'sent'
                    ? 'Correo de acceso enviado. Pendiente del primer acceso.'
                    : 'Cuenta creada. El correo de acceso está pendiente; puedes reintentarlo desde la ficha de la persona.'}
              </p>
            )}
          </div>
        ) : app.status !== 'approved' ? (
          <p className="text-white/65">Aprueba la solicitud para continuar.</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <ActionForm
              action={completeApplication}
              submit="Vincular persona existente"
              confirm="Confirma que has comprobado la identidad de la persona seleccionada."
            >
              <input type="hidden" name="application_id" value={id} />
              <EntitySelect
                kind="students"
                name="user_id"
                label="Alumno/a existente"
              />
              <p className="text-sm text-white/60">
                Comprueba su identidad. Una coincidencia de correo no vincula
                cuentas automáticamente.
              </p>
            </ActionForm>
            <ActionForm
              action={createUserAdmin}
              submit="Crear cuenta y enviar acceso"
            >
              <input type="hidden" name="application_id" value={id} />
              <input type="hidden" name="role" value="student" />
              <Field name="fullName" label="Nombre completo">
                <input
                  className="bo-input"
                  id="fullName"
                  name="fullName"
                  required
                  maxLength={120}
                  defaultValue={app.full_name}
                />
              </Field>
              <Field name="email" label="Correo electrónico">
                <input
                  className="bo-input"
                  type="email"
                  id="email"
                  name="email"
                  required
                  maxLength={254}
                  defaultValue={app.email}
                />
              </Field>
            </ActionForm>
          </div>
        )}
      </section>
      <section className="bo-panel">
        <h3 className="mb-4 text-lg font-semibold">3. Matricular</h3>
        {app.linked_user_id && app.status === 'approved' ? (
          <ActionForm action={completeApplication} submit="Activar matrícula">
            <input type="hidden" name="application_id" value={id} />
            <input type="hidden" name="user_id" value={app.linked_user_id} />
            <EntitySelect kind="programs" name="program_id" label="Programa" />
          </ActionForm>
        ) : (
          <p className="text-white/65">
            La solicitud debe estar aprobada y vinculada a una persona.
          </p>
        )}
        <p className="mt-4 text-sm text-white/55">
          La aprobación, el primer acceso y la matrícula se registran por
          separado. Consulta las matrículas actuales en la ficha de la persona.
        </p>
      </section>
      <History
        entity="membership_applications"
        id={id}
        path={`/admin/applications/${id}`}
        params={filters}
      />
    </div>
  )
}
