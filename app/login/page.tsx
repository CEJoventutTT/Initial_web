// app/login/page.tsx
'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { signInAction, type LoginState } from './actions'

const initialState: LoginState = { error: null }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
      <form action={formAction} className="w-full max-w-sm space-y-4 bg-white/5 p-6 rounded border border-white/10">
        <h1 className="text-xl font-bold">Entrar</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="tu@correo.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="********"
          />
        </div>

        <button
          disabled={pending}
          className="bg-primary text-primary-foreground rounded px-4 py-2 disabled:opacity-60"
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>

        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
      </form>
    </div>
  )
}
