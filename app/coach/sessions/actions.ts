// app/coach/sessions/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

async function getAuthenticatedClient() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('unauthorized')
  return supabase
}

export async function createSessionAction(formData: FormData) {
  const program_id = Number(formData.get('program_id'))
  const start_at = new Date(String(formData.get('starts_at') || ''))
  const end_at = new Date(String(formData.get('ends_at') || ''))
  if (!Number.isSafeInteger(program_id) || program_id <= 0) throw new Error('invalid_program')
  if (Number.isNaN(start_at.getTime()) || Number.isNaN(end_at.getTime()) || end_at <= start_at) {
    throw new Error('invalid_dates')
  }

  const supabase = await getAuthenticatedClient()
  const { error } = await supabase.from('attendance_sessions').insert({
    program_id,
    start_at: start_at.toISOString(),
    end_at: end_at.toISOString(),
    active: true,
  })
  if (error) throw new Error('session_create_failed')

  revalidatePath('/coach/sessions')
  redirect('/coach/sessions')
}

export async function deleteSessionAction(formData: FormData) {
  const id = Number(formData.get('session_id'))

  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('invalid_session')
  const supabase = await getAuthenticatedClient()
  const { error } = await supabase.from('attendance_sessions').delete().eq('id', id)
  if (error) throw new Error('session_delete_failed')

  revalidatePath('/coach/sessions')
  redirect('/coach/sessions')
}
