// app/admin/users/page.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createUserAdmin } from './actions'
import { useEffect } from 'react'

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

const initialState = { ok: false, error: null as string | null, message: null as string | null }

export default function AdminUsersPage() {
  const [state, formAction] = useFormState(createUserAdmin, initialState)

  useEffect(() => {
    // aquí podrías disparar un toast si usas tu sistema de notificaciones
    if (state?.error) console.error(state.error)
    if (state?.ok) console.log(state.message)
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
        <p className="text-green-600 text-sm">{state.message}</p>
      )}
    </div>
  )
}
