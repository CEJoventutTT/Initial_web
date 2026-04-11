// app/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export type LoginState = { error: string | null }

export async function signInAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Introduce email y contraseña.' }
  }

  const supabase = await supabaseServer()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
