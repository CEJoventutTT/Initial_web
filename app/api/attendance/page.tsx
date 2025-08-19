'use client'
import { useState } from 'react'

export default function CoachAttendancePage() {
  const [sessionId, setSessionId] = useState<number | ''>('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState<'present'|'absent'|'late'>('present')
  const [msg, setMsg] = useState<string| null>(null)

  async function mark() {
    setMsg(null)
    const res = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session_id: Number(sessionId), user_id: userId, status })
    })
    const data = await res.json()
    setMsg(res.ok ? 'Asistencia marcada' : `Error: ${data.error}`)
  }

  return (
    <div className="p-6 space-y-3 max-w-md">
      <h1 className="text-2xl font-bold">Marcar asistencia</h1>
      <input className="border p-2 w-full" placeholder="Session ID" value={sessionId} onChange={e=>setSessionId(e.target.value as any)} />
      <input className="border p-2 w-full" placeholder="User ID (uuid alumno)" value={userId} onChange={e=>setUserId(e.target.value)} />
      <select className="border p-2 w-full" value={status} onChange={e=>setStatus(e.target.value as any)}>
        <option value="present">present</option>
        <option value="absent">absent</option>
        <option value="late">late</option>
      </select>
      <button className="px-4 py-2 bg-primary text-white rounded" onClick={mark}>Guardar</button>
      {msg && <p>{msg}</p>}
    </div>
  )
}
