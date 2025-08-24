// app/auth/update-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function parseHashTokens() {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash?.replace(/^#/, '') || ''
  if (!hash) return null
  const params = new URLSearchParams(hash)
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  const type = params.get('type') // invite | recovery | magiclink | signup
  if (access_token && refresh_token) {
    return { access_token, refresh_token, type }
  }
  return null
}

export default function UpdatePasswordPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined

    async function ensureSession() {
      setLoading(true)
      setErr(null)
      setMsg(null)

      // 1) ¿Viene con ?code=... ? intenta intercambio (PKCE)
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        // Primero intenta con el code directo
        const { error: exchErr1 } = await supabase.auth.exchangeCodeForSession(code)
        if (exchErr1) {
          // Algunos setups requieren pasar la URL completa
          const { error: exchErr2 } = await supabase.auth.exchangeCodeForSession(window.location.href as unknown as string)
          if (exchErr2) {
            console.error('exchangeCodeForSession falló:', exchErr1.message, ' / ', exchErr2.message)
          }
        }
      } else {
        // 2) ¿Viene con #access_token y refresh_token? setea sesión manualmente
        const tokens = parseHashTokens()
        if (tokens?.access_token && tokens?.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          })
          if (error) {
            console.error('setSession error:', error.message)
          }
        }
      }

      // 3) Comprueba sesión (dos intentos por si el SDK tarda un tick)
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await new Promise(r => setTimeout(r, 80))
        const again = await supabase.auth.getSession()
        session = again.data.session
      }

      setHasSession(!!session)
      setLoading(false)

      // Suscríbete a cambios por si llega tarde
      const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => {
        if (s && !hasSession) setHasSession(true)
      })
      unsub = () => sub.subscription.unsubscribe()
    }

    ensureSession()

    return () => {
      if (unsub) unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <p className="text-white/70 mb-4">
            Abre el link directamente desde el correo (no lo copies/pegues) o solicita una nueva invitación.
          </p>
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
