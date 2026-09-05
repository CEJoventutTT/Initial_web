'use client'

import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { initialState, type FormAction } from '@/lib/backoffice/state'

export function SubmitButton({
  children,
  disabled = false,
}: {
  children: ReactNode
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending || disabled} className="bo-button">
      {pending ? 'Guardando…' : children}
    </button>
  )
}

export function ActionForm({
  action,
  children,
  submit = 'Guardar',
  disabled = false,
  confirm,
  className = '',
}: {
  action: FormAction
  children?: ReactNode
  submit?: string
  disabled?: boolean
  confirm?: string
  className?: string
}) {
  const [state, formAction] = useActionState(action, initialState)
  return (
    <form
      action={formAction}
      className={`space-y-4 ${className}`}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault()
      }}
    >
      {children}
      <SubmitButton disabled={disabled}>{submit}</SubmitButton>
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-100"
        >
          {state.message}
        </p>
      )}
      {state.recoveryUrl && (
        <p className="break-all rounded-lg border border-amber-400/40 p-3 text-sm">
          Enlace de un solo uso: {state.recoveryUrl}
        </p>
      )}
    </form>
  )
}
