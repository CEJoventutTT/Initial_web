'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMsg(error.message); return }
      router.replace(next)
    } catch (err: any) {
      setMsg(err?.message || 'No se pudo contactar con el servicio de autenticación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input className="text-black px-3 py-2 rounded w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
      <input className="text-black px-3 py-2 rounded w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" required />
      <button disabled={loading} className="bg-primary px-4 py-2 rounded">{loading ? 'Entrando…' : 'Entrar'}</button>
      {msg && <p className="text-red-400 text-sm">{msg}</p>}
    </form>
  )
}
