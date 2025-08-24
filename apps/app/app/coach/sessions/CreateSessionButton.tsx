'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateSessionButton({ defaultProgramId }: { defaultProgramId?: number }) {
  const [loading, setLoading] = useState(false)
  const [programId, setProgramId] = useState<number | ''>(defaultProgramId ?? '')
  const [minutes, setMinutes] = useState<number | ''>(120)
  const router = useRouter()

  async function createSession() {
    if (!programId) return
    setLoading(true)
    try {
      const res = await fetch('/api/coach/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          program_id: Number(programId),
          expires_minutes: minutes ? Number(minutes) : 120,
        }),
      })
      const json = await res.json()
      if (!json.ok) {
        alert(`No se pudo crear: ${json.error || 'error'}`)
      } else {
        router.refresh() // recarga los datos del server component
      }
    } catch {
      alert('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="px-3 py-2 rounded bg-white/10 border border-white/20"
        placeholder="Program ID"
        value={programId}
        onChange={(e) => setProgramId(e.target.value ? Number(e.target.value) : '')}
      />
      <input
        type="number"
        className="px-3 py-2 rounded bg-white/10 border border-white/20 w-28"
        placeholder="Caduca (min)"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value ? Number(e.target.value) : '')}
      />
      <button
        onClick={createSession}
        disabled={loading || !programId}
        className="px-4 py-2 rounded-2xl bg-white text-black disabled:opacity-60"
      >
        {loading ? 'Creando…' : 'Crear sesión'}
      </button>
    </div>
  )
}
