import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'
import { requireSupabaseConfig } from '@/lib/supabase/env'

export async function authenticatedSupabase(request?: Request) {
  const token = request?.headers
    .get('authorization')
    ?.match(/^Bearer\s+(.+)$/i)?.[1]

  const supabase = token
    ? createClient(
        requireSupabaseConfig().url,
        requireSupabaseConfig().anonKey,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { autoRefreshToken: false, persistSession: false },
        },
      )
    : await supabaseServer()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return { supabase, user: error ? null : user }
}

export async function hasRole(
  supabase: Awaited<ReturnType<typeof authenticatedSupabase>>['supabase'],
  userId: string,
  roles: Array<'coach' | 'admin'>,
) {
  const { data } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('user_id', userId)
    .single()

  return Boolean(data?.active && data.role && roles.includes(data.role))
}

export async function canManageProgram(
  supabase: Awaited<ReturnType<typeof authenticatedSupabase>>['supabase'],
  programId: number,
) {
  const { data, error } = await supabase.rpc('is_program_coach', {
    p_program_id: programId,
  })

  return !error && data === true
}
