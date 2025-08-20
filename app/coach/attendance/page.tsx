// app/attend/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AttendPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const qp = useSearchParams()
  const s = qp.get('s')
  const k = qp.get('k')

  const [msg, setMsg] = useState<string | null>(null)
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    (async () => {
      if (!s || !k) {
        setOk(false)
        setMsg('Código inválido.')
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // redirige a login y vuelve aquí
        const site = typeof window !== 'undefined' ? window.location.origin : ''
        router.push(`/login?redirect=${encodeURIComponent(`/attend?s=${s}&k=${k}`)}`)
        return
      }
      try {
        const res = await fetch('/api/attendance/checkin', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ session_id: Number(s), key: k })
        })
        const data = await res.json()
        if (res.ok) {
          setOk(true)
          setMsg(data.status === 'present'
            ? `¡Asistencia registrada! +${data.xp} XP (puntual)`
            : `Llegaste tarde. +${data.xp} XP`)
          // opcional: ir al dashboard
          // setTimeout(()=> router.push('/dashboard'), 1200)
        } else {
          setOk(false)
          setMsg(data.detail || data.error || 'No se pudo registrar la asistencia.')
        }
      } catch (e: any) {
        setOk(false)
        setMsg(String(e?.message || e))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, k])

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Registro de asistencia</h1>
        {ok === null && <p className="text-white/70">Procesando…</p>}
        {ok === true && <p className="text-green-400">{msg}</p>}
        {ok === false && <p className="text-red-400">{msg}</p>}
      </div>
    </div>
  )
}
