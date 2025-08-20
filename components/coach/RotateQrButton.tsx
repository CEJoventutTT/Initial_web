// components/RotateQrButton.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  sessionId: number
  size?: 'sm' | 'md'
}

export default function RotateQrButton({ sessionId, size = 'sm' }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [attendUrl, setAttendUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const onClick = async () => {
    if (loading) return
    setLoading(true)
    setMsg(null)
    setAttendUrl(null)
    setExpiresAt(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/coach/sessions/${sessionId}/qr/rotate`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        const reason = j?.detail || j?.error || 'No se pudo generar/rotar el QR'
        throw new Error(reason)
      }

      setAttendUrl(j.attendUrl || null)
      setExpiresAt(j.session?.expires_at || null)
      setMsg('QR actualizado ✅')
      router.refresh()
    } catch (e: any) {
      setMsg(e?.message || 'Error al rotar el QR')
    } finally {
      setLoading(false)
    }
  }

  const onCopy = async () => {
    if (!attendUrl) return
    try {
      await navigator.clipboard.writeText(attendUrl)
      setMsg('Enlace copiado 📋')
    } catch {
      setMsg('No se pudo copiar el enlace')
    }
  }

  const btnClass = [
    'rounded px-3 py-1.5 bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-60',
    size === 'sm' ? 'text-sm' : '',
  ].join(' ')

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button onClick={onClick} disabled={loading} className={btnClass}>
        {loading ? 'Guardando…' : 'Generar / Rotar QR'}
      </button>

      {msg && <span className="text-xs text-white/70">{msg}</span>}

      {attendUrl && (
        <div className="flex items-center gap-2 w-full max-w-md">
          <input
            className="w-full rounded bg-black/30 border border-white/10 px-2 py-1 text-xs text-white"
            value={attendUrl}
            readOnly
          />
          <button
            onClick={onCopy}
            className="rounded bg-white/15 hover:bg-white/25 px-2 py-1 text-xs"
          >
            Copiar
          </button>
        </div>
      )}

      {expiresAt && (
        <span className="text-[11px] text-white/50">
          Expira: {new Date(expiresAt).toLocaleString()}
        </span>
      )}
    </div>
  )
}
