'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AttendPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')
  const [msg, setMsg] = useState<string>('')
  const fired = useRef(false) // evita doble ejecución

  useEffect(() => {
    const s = sp.get('s')
const k = sp.get('k')
if (!s || !k) { setStatus('error'); setMsg('Parámetros inválidos.'); return }
const session_id = Number(s)
if (!Number.isFinite(session_id)) { setStatus('error'); setMsg('ID de sesión inválido.'); return }

const res = await fetch('/api/coach/attendance/checkin', {   // 🔴 misma ruta
  method: 'POST',
  credentials: 'include',
  cache: 'no-store',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ session_id, key: k }),
})

    const run = async () => {
      setStatus('sending'); setMsg('Registrando asistencia…')
      try {
        const res = await fetch('/api/coach/attendance/checkin', {
          method: 'POST',
          credentials: 'include',   // usa cookies (tu handler las espera)
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: k }), // ✅ solo key
        })

        if (res.status === 401) {
          setStatus('error'); setMsg('Inicia sesión para registrar tu asistencia.')
          router.push('/login?next=' + encodeURIComponent(location.pathname + location.search))
          return
        }

        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          setStatus('error'); setMsg(json?.error ?? 'Error al registrar asistencia')
        } else {
          setStatus('ok'); setMsg(`Asistencia registrada (${json?.status ?? 'ok'}) ✅`)
        }
      } catch {
        setStatus('error'); setMsg('Error de red')
      }
    }

    void run()
  }, [sp, router])

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Asistencia</h1>

        {status === 'sending' && <p>Registrando asistencia…</p>}
        {status === 'ok' && <p className="text-emerald-400">{msg}</p>}
        {status === 'error' && (
          <div>
            <p className="text-red-400">{msg}</p>
            <p className="mt-2 text-white/70">
              Asegúrate de haber iniciado sesión con tu cuenta.
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/dashboard">
            <Button className="bg-primary text-white hover:bg-primary/90">Ir al panel</Button>
          </Link>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => location.reload()}
            disabled={status === 'sending'}
          >
            Reintentar
          </Button>
        </div>
      </main>
    </div>
  )
}
