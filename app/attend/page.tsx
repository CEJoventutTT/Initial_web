// app/attend/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AttendPage() {
  const supabase = createClientComponentClient()
  const sp = useSearchParams()
  const s = sp.get('s')
  const k = sp.get('k')

  const [status, setStatus] = useState<'loading'|'ok'|'error'|'noauth'>('loading')
  const [msg, setMsg] = useState('Validando asistencia…')

  useEffect(() => {
    (async () => {
      if (!s || !k) {
        setStatus('error'); setMsg('Parámetros inválidos'); return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('noauth')
        setMsg('Asegúrate de haber iniciado sesión con tu cuenta.')
        return
      }

      try {
        const res = await fetch('/api/coach/attendance/checkin', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ s, k, studentId: user.id })
        })
        const j = await res.json()
        if (res.ok && j?.ok) {
          setStatus('ok'); setMsg('¡Asistencia registrada!')
        } else {
          setStatus('error'); setMsg(j?.error || 'Error al registrar asistencia')
        }
      } catch (e: any) {
        setStatus('error'); setMsg(e?.message || 'Error de red')
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, k])

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      {status === 'loading' && <p>{msg}</p>}
      {status === 'ok' && <p>{msg}</p>}
      {status === 'error' && <p style={{color:'tomato'}}>Error: {msg}</p>}
      {status === 'noauth' && (
        <div className="text-center space-y-3">
          <p>{msg}</p>
          <a
            className="underline"
            href={`/login?redirectTo=${encodeURIComponent(`/attend?s=${s}&k=${k}`)}`}
          >
            Iniciar sesión y volver al QR
          </a>
        </div>
      )}
    </main>
  )
}
