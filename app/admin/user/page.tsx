// app/admin/users/page.tsx
'use client'

import { useEffect } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createUserAdmin } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
    >
      {pending ? 'Creando...' : 'Crear'}
    </button>
  )
}

const initialState = {
  ok: false,
  error: null as string | null,
  message: null as string | null,
  recoveryUrl: null as string | null,
}

export default function AdminUsersPage() {
  const [state, formAction] = useActionState(createUserAdmin, initialState)

  useEffect(() => {
    if (state?.error) console.error('[AdminUsers] Error:', state.error)
    if (state?.ok && state?.message) console.log('[AdminUsers] OK:', state.message)
  }, [state])

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Admin · Crear usuario</h1>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="usuario@dominio.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="fullName" className="block text-sm font-medium">Nombre completo</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="Nombre Apellidos"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="role" className="block text-sm font-medium">Rol</label>
          <select id="role" name="role" className="w-full rounded border px-3 py-2 text-black" defaultValue="student">
            <option value="student">student</option>
            <option value="coach">coach</option>
            <option value="admin">admin</option>
            <option value="parent">parent</option>
          </select>
        </div>

        <SubmitButton />
      </form>

      {state?.error && (
        <p className="text-red-500 text-sm">Error: {state.error}</p>
      )}
      {state?.ok && (
        <div className="space-y-2 text-sm">
          <p className="text-green-600 whitespace-pre-line">{state.message}</p>
          {state.recoveryUrl && (
            <div className="rounded border border-amber-400 bg-amber-50 p-3 text-amber-950">
              <p className="font-medium">Enlace de recuperación (secreto y de un solo uso)</p>
              <p className="mt-1 break-all select-all">{state.recoveryUrl}</p>
              <p className="mt-1">Cópialo y compártelo únicamente con la persona invitada.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
