// app/attend/page.tsx
'use client'
import { useEffect, useState } from 'react'

type Res =
  | { ok: true; status: 'new' | 'repeat'; attendance: any }
  | { ok: false; status?: 'inactive'; error?: string }

export default function AttendPage({ searchParams }: { searchParams: { k?: string; key?: string } }) {
  const k = (searchParams?.k || searchParams?.key || '').toString()
  const [res, setRes] = useState<Res | null>(null)

  useEffect(() => {
    if (!k) return
    fetch('/api/coach/attendance/checkin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: k }),
    })
      .then(r => r.json())
      .then(setRes)
      .catch(() => setRes({ ok: false, error: 'network_error' }))
  }, [k])

  if (!k) return <div className="min-h-screen grid place-items-center text-white">Falta la clave del QR.</div>

  return (
    <div className="min-h-screen grid place-items-center bg-[#262425] text-white p-6">
      <div className="max-w-md w-full text-center space-y-4">
        {!res && <p>Validando asistencia…</p>}
        {res?.ok && (
          <>
            <h1 className="text-2xl font-bold">
              {res.status === 'new' ? '¡Asistencia confirmada!' : 'Ya estabas marcado'}
            </h1>
            <p className="text-white/80">Sesión #{res.attendance.session_id} — Programa #{res.attendance.program_id}</p>
            <p className="text-white/60 text-sm">
              Hora: {new Date(res.attendance.checked_at).toLocaleString()}
            </p>
          </>
        )}
        {res && !res.ok && (
          <>
            <h1 className="text-2xl font-bold">
              {res.status === 'inactive' ? 'Sesión inactiva o expirada ❌' : 'No se pudo validar ❌'}
            </h1>
            {res.error && <p className="text-white/60 text-sm mt-2">({res.error})</p>}
          </>
        )}
      </div>
    </div>
  )
}
