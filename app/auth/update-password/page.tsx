// app/auth/update-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    async function ensureSession() {
      setLoading(true)
      setErr(null)
      setMsg(null)

      if (searchParams.get('error') === 'recovery_link_invalid') {
        setErr('Este enlace no es válido o ha caducado. Solicita uno nuevo para restablecer la contraseña.')
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setHasSession(Boolean(session))
      setLoading(false)
    }

    ensureSession()
  }, [searchParams, supabase])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)

    if (password.length < 8) {
      setErr('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setErr('Las contraseñas no coinciden.')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setErr(error.message)
      return
    }

    setMsg('Contraseña actualizada. Entrando al panel…')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
        <p className="text-white/70">Verificando enlace…</p>
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded p-6 text-center">
          <h1 className="text-xl font-bold mb-2">Enlace no válido o caducado</h1>
          <p className="text-white/70 mb-4">{err ?? 'Solicita un nuevo enlace de recuperación e inténtalo de nuevo.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 bg-white/5 p-6 rounded border border-white/10">
        <h1 className="text-xl font-bold">Establecer nueva contraseña</h1>

        <div>
          <label className="block text-sm mb-1">Nueva contraseña</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="********"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Confirmar contraseña</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2 text-black"
            placeholder="********"
            value={confirm}
            onChange={(e)=>setConfirm(e.target.value)}
            required
          />
        </div>

        <button className="bg-primary text-primary-foreground rounded px-4 py-2">
          Guardar
        </button>

        {err && <p className="text-red-400 text-sm">{err}</p>}
        {msg && <p className="text-green-400 text-sm">{msg}</p>}
      </form>
    </div>
  )
}
