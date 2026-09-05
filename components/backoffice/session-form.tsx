import { ActionForm } from './action-form'
import EntitySelect from './entity-select'
import { Field } from './list'
import { clubDateTimeInput } from '@/lib/backoffice/time'
import { saveSession } from '@/app/coach/sessions/actions'
export type SessionData = {
  id: number
  program_id: number
  start_at: string
  end_at: string | null
  active: boolean
  programs: { name: string } | null
}
export default function SessionForm({
  session,
  duplicate = false,
}: {
  session?: SessionData
  duplicate?: boolean
}) {
  return (
    <ActionForm
      action={saveSession}
      submit={session && !duplicate ? 'Guardar sesión' : 'Crear sesión'}
    >
      {session && !duplicate && (
        <input type="hidden" name="session_id" value={session.id} />
      )}
      <EntitySelect
        kind="programs"
        name="program_id"
        label="Programa"
        initial={
          session?.program_id
            ? {
                id: String(session.program_id),
                label: session.programs?.name || 'Programa actual',
              }
            : undefined
        }
      />
      <p className="text-sm text-white/60">
        Todas las horas corresponden a Madrid.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name={`start-${session?.id ?? 'new'}-${duplicate}`}
          label="Inicio"
        >
          <input
            id={`start-${session?.id ?? 'new'}-${duplicate}`}
            name="start_at"
            type="datetime-local"
            className="bo-input"
            required
            defaultValue={
              session && !duplicate ? clubDateTimeInput(session.start_at) : ''
            }
          />
        </Field>
        <Field name={`end-${session?.id ?? 'new'}-${duplicate}`} label="Fin">
          <input
            id={`end-${session?.id ?? 'new'}-${duplicate}`}
            name="end_at"
            type="datetime-local"
            className="bo-input"
            required
            defaultValue={
              session?.end_at && !duplicate
                ? clubDateTimeInput(session.end_at)
                : ''
            }
          />
        </Field>
      </div>
      <label className="flex gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          value="true"
          defaultChecked={duplicate || session?.active !== false}
        />{' '}
        Sesión activa
      </label>
    </ActionForm>
  )
}
