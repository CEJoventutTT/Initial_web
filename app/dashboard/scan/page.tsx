'use client'

import { useCallback, useMemo, useState } from 'react'
import QrScanner from 'react-qr-scanner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navigation from '/components/navigation'

function extractParamsFromQR(text: string): { session_id: number; key: string } | null {
  try {
    const url = new URL(text)
    const s = url.searchParams.get('s')
    const k = url.searchParams.get('k')
    if (!s || !k) return null
    const sid = Number(s)
    if (!Number.isFinite(sid)) return null
    return { session_id: sid, key: k }
  } catch {
    return null
  }
}

export default function ScanQRPage() {
  const [raw, setRaw] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const previewStyle = useMemo(() => ({ width: '100%', height: 260 }), [])

  const checkin = useCallback(async (payload: { session_id: number; key: string }) => {
    setStatus('sending'); setMsg('Registrando asistencia…')
    try {
      const res = await fetch('/api/coach/attendance/checkin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setStatus('error'); setMsg(json?.error ?? 'Error al registrar asistencia') }
      else { setStatus('ok'); setMsg(`Asistencia registrada (${json?.status ?? 'ok'}) ✅`) }
    } catch {
      setStatus('error'); setMsg('Error de red')
    }
  }, [])

  const handleScan = useCallback((result: { text?: string } | null) => {
    if (!result?.text) return
    if (result.text === raw) return
    setRaw(result.text)
    const parsed = extractParamsFromQR(result.text)
    if (!parsed) {
      setStatus('error'); setMsg('QR no válido. Usa el QR generado por el coach.')
      return
    }
    void checkin(parsed)
  }, [raw, checkin])

  const handleError = useCallback((_err: unknown) => {}, [])

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
          <QrScanner
            delay={300}
            style={previewStyle}
            // ✅ constraints válido para react-qr-scanner (sin casts)
            constraints={{ audio: false, video: { facingMode: 'environment' } }}
            onScan={handleScan}
            onError={handleError}
          />
        </div>

        {raw && (
          <div className="mt-4 rounded-lg border p-3 border-white/20 bg-white/5">
            <div className="text-sm opacity-80">Contenido del QR:</div>
            <div className="break-all font-mono">{raw}</div>
          </div>
        )}

        {status !== 'idle' && (
          <p className={`mt-3 ${status === 'error' ? 'text-red-400' : status === 'ok' ? 'text-emerald-400' : 'text-white/80'}`}>
            {msg}
          </p>
        )}

        <p className="mt-6 text-sm text-white/70">
          Nota: la cámara requiere <span className="font-semibold">HTTPS</span> (o localhost).
        </p>
      </main>
    </div>
  )
}
