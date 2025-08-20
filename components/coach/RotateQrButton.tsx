'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RotateQrButton({ sessionId, size='sm' }:{
  sessionId: number
  size?: 'sm'|'md'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const onClick = async () => {
    if (loading) return
    setLoading(true); setMsg(null)
    try {
      const res = await fetch(`/api/coach/sessions/${sessionId}/qr/rotate`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || 'No se pudo generar/rotar el QR')
      }
      setMsg('QR actualizado ✅')
      router.refresh() // 👉 refresca la tabla/página
    } catch (e:any) {
      setMsg(e?.message || 'Error al rotar el QR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={onClick}
        disabled={loading}
        className={`rounded px-3 py-1.5 ${size==='sm' ? 'text-sm' : ''} 
                    bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-60`}
      >
        {loading ? 'Guardando…' : 'Generar / Rotar QR'}
      </button>
      {msg && <span className="text-xs text-white/70">{msg}</span>}
    </div>
  )
}
