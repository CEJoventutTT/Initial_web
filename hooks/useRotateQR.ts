// hooks/useRotateQR.ts
'use client'
import { supabaseBrowser } from '@/lib/supabase/client'

export function useRotateQR() {
  const supabase = supabaseBrowser()

  return async function rotate(sessionId: number) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const res = await fetch(`/api/coach/sessions/${sessionId}/qr/rotate`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j?.detail || j?.error || 'No se pudo rotar QR')
    return j as { attendUrl: string; session: { id: number; expires_at: string } }
  }
}
