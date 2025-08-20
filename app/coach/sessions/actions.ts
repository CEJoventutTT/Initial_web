// app/coach/sessions/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function getOrigin() {
  const h = headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

async function getAccessToken() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export async function createSessionAction(formData: FormData) {
  const program_id = Number(formData.get('program_id'))
  const starts_at  = String(formData.get('starts_at') || '')
  const ends_at    = String(formData.get('ends_at') || '')

  const origin = getOrigin()
  const token  = await getAccessToken()
  if (!token) throw new Error('unauthorized')

  const res = await fetch(new URL('/api/coach/sessions', origin), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`, // 👈 Bearer REAL del usuario
    },
    body: JSON.stringify({ program_id, starts_at, ends_at }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `Failed (${res.status})`)
  }

  revalidatePath('/coach/sessions')
  redirect('/coach/sessions')
}

export async function deleteSessionAction(formData: FormData) {
  const id = Number(formData.get('session_id'))

  const origin = getOrigin()
  const token  = await getAccessToken()
  if (!token) throw new Error('unauthorized')

  const res = await fetch(new URL(`/api/coach/sessions/${id}`, origin), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`, // 👈 Bearer REAL del usuario
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `Failed (${res.status})`)
  }

  revalidatePath('/coach/sessions')
  redirect('/coach/sessions')
}
