'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser, supabaseImplicitBrowser } from '@/lib/supabase/client'
import { safeInternalRedirect } from '@/lib/safe-redirect'

type Notice = { kind: 'error' | 'success'; text: string } | null

export default function LoginForm() {
  const supabase = supabaseBrowser()
  const router = useRouter()
  const sp = useSearchParams()
  const next = safeInternalRedirect(sp.get('next') ?? sp.get('redirect') ?? sp.get('redirectTo'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRecovery, setIsRecovery] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)

  const setError = () => setNotice({ kind: 'error', text: 'No hemos podido completar la operación. Comprueba los datos e inténtalo de nuevo.' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(); return }
      router.replace(next)
    } catch {
      setError()
    } finally {
      setLoading(false)
    }
  }

  const onRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotice(null)
    try {
      const { error } = await supabaseImplicitBrowser().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) { setError(); return }
      setNotice({ kind: 'success', text: 'Si existe una cuenta con este email, recibirás un enlace para restablecer tu contraseña.' })
    } catch {
      setError()
    } finally {
      setLoading(false)
    }
  }

  const changeMode = (recovery: boolean) => { setIsRecovery(recovery); setNotice(null) }
  const inputClassName = 'mt-2 block w-full rounded-lg border border-white/20 bg-white px-3.5 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-brand-green focus:ring-4 focus:ring-brand-green/25 disabled:cursor-not-allowed disabled:bg-zinc-100'

  return (
    <section className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-panel-glow" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-lg px-2 py-1 text-sm font-medium text-white/80 outline-none transition hover:text-white focus-visible:ring-4 focus-visible:ring-brand-green/40">
          <span className="relative h-12 w-12 overflow-hidden rounded-full border border-white/15 bg-white/10"><Image src="/logo.png" alt="" fill sizes="48px" className="object-contain p-1" priority /></span>
          <span>Club Esportiu Joventut</span>
        </Link>

        <div className="rounded-2xl border border-white/15 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">{isRecovery ? 'Recupera tu contraseña' : 'Accede a tu área'}</h1>
            <p className="mt-2 text-sm leading-6 text-white/70">{isRecovery ? 'Te enviaremos un enlace seguro para crear una nueva contraseña.' : 'Inicia sesión para consultar tu actividad y gestionar tu cuenta.'}</p>
          </div>

          {isRecovery ? (
            <form onSubmit={onRecoverySubmit} className="space-y-5">
              <div><label htmlFor="recovery-email" className="block text-sm font-medium text-white">Email</label><input id="recovery-email" className={inputClassName} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required disabled={loading} /></div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground outline-none transition hover:bg-brand-red/90 focus-visible:ring-4 focus-visible:ring-brand-red/40 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Enviando enlace…' : 'Enviar enlace de recuperación'}</button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div><label htmlFor="email" className="block text-sm font-medium text-white">Email</label><input id="email" className={inputClassName} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required disabled={loading} /></div>
              <div>
                <div className="flex items-center justify-between gap-4"><label htmlFor="password" className="block text-sm font-medium text-white">Contraseña</label><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="text-sm font-medium text-brand-green outline-none hover:text-white focus-visible:ring-4 focus-visible:ring-brand-green/40" aria-pressed={showPassword}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div>
                <input id="password" className={inputClassName} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" autoComplete="current-password" required disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground outline-none transition hover:bg-brand-red/90 focus-visible:ring-4 focus-visible:ring-brand-red/40 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Entrando…' : 'Entrar'}</button>
            </form>
          )}

          {notice && <p className={`mt-5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${notice.kind === 'error' ? 'border-red-400/40 bg-red-950/50 text-red-100' : 'border-brand-green/40 bg-brand-green/15 text-white'}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live="polite">{notice.text}</p>}

          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-white/70">
            {isRecovery ? <button type="button" onClick={() => changeMode(false)} className="font-medium text-brand-green outline-none hover:text-white focus-visible:ring-4 focus-visible:ring-brand-green/40">Volver a iniciar sesión</button> : <button type="button" onClick={() => changeMode(true)} className="font-medium text-brand-green outline-none hover:text-white focus-visible:ring-4 focus-visible:ring-brand-green/40">¿Has olvidado tu contraseña?</button>}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-white/65">¿Necesitas ayuda? <Link href="/join" className="font-medium text-brand-green outline-none hover:text-white focus-visible:ring-4 focus-visible:ring-brand-green/40">Contacta con el club</Link>.</p>
      </div>
    </section>
  )
}
