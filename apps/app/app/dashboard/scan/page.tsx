'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navigation from '../../../components/navigation'

function extractParamsFromQR(text: string): { session_id: number; key: string } | null {
  try {
    let s: string | null = null
    let k: string | null = null
    try {
      const u = new URL(text)
      s = u.searchParams.get('s')
      k = u.searchParams.get('k')
    } catch {
      const qs = new URLSearchParams(text)
      s = s ?? qs.get('s')
      k = k ?? qs.get('k')
    }
    if (!s || !k) return null
    const session_id = Number(s)
    if (!Number.isFinite(session_id)) return null
    return { session_id, key: k }
  } catch { return null }
}

export default function ScanQRPage() {
  const [raw, setRaw] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  // para evitar repetir el mismo QR / o sonar demasiado
  const sentFor = useRef<string>('')
  const lastBeepAt = useRef<number>(0)

  // 🔊 audios
  const detectAudioRef = useRef<HTMLAudioElement | null>(null) // suena al detectar QR válido
  const okAudioRef = useRef<HTMLAudioElement | null>(null)      // suena cuando el checkin es OK

  const constraints = useMemo(() => ({
    facingMode: 'environment' as const,
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: 1.7778,
  }), [])

  const checkin = useCallback(async ({ session_id, key }: { session_id:number; key:string }) => {
    setStatus('sending'); setMsg('Registrando asistencia…')
    try {
      const res = await fetch('/api/coach/attendance/checkin', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, key }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error'); setMsg(json?.error ?? 'Error al registrar asistencia')
      } else {
        setStatus('ok'); setMsg(`Asistencia registrada (${json?.status ?? 'ok'}) ✅`)
        // 🔊 sonido de éxito al confirmar check-in
        okAudioRef.current?.play().catch(() => {})
      }
    } catch {
      setStatus('error'); setMsg('Error de red')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-10 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Escanear QR</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Volver al panel
            </Button>
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden bg-black/30 p-4">
          <Scanner
            constraints={constraints}
            components={{ finder: true }}
            onScan={(results) => {
              const text = results?.[0]?.rawValue
              if (!text) return
              setRaw(text)

              // ya procesado exactamente este contenido → no repetir
              if (sentFor.current === text) return

              const parsed = extractParamsFromQR(text)
              if (!parsed) { setStatus('error'); setMsg('QR inválido.'); return }

              // 🔊 sonido al detectar un QR válido (throttle 700ms)
              const now = Date.now()
              if (now - lastBeepAt.current > 700) {
                detectAudioRef.current?.play().catch(() => {})
                lastBeepAt.current = now
              }

              sentFor.current = text
              void checkin(parsed)
            }}
            onError={() => {}}
          />
        </div>

        {raw && (
          <div className="mt-4 rounded-lg border p-3 border-white/20 bg-white/5">
            <div className="text-sm opacity-80">Contenido del QR:</div>
            <div className="break-all font-mono">{raw}</div>
          </div>
        )}

        {status !== 'idle' && (
          <p
            className={`mt-3 ${
              status === 'error'
                ? 'text-red-400'
                : status === 'ok'
                ? 'text-emerald-400'
                : 'text-white/80'
            }`}
          >
            {msg}
          </p>
        )}

        {/* 🔊 audios (en public/...) */}
        <audio ref={detectAudioRef} src="/sounds/pop.mp3" preload="auto" />
        <audio ref={okAudioRef} src="/sounds/pop.mp3" preload="auto" />
      </main>
    </div>
  )
}
