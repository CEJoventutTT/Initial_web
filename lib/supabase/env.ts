export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_CEJTT_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.CEJTT_SUPABASE_URL ||
    ''
  )
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.CEJTT_SUPABASE_PUBLISHABLE_KEY ||
    ''
  )
}

export function getSupabaseServiceRoleKey() {
  return (
    process.env.CEJTT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  )
}

export function getSupabaseConfig() {
  return {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
    serviceRoleKey: getSupabaseServiceRoleKey(),
  }
}

export function requireSupabaseConfig() {
  const config = getSupabaseConfig()
  if (!config.url || !config.anonKey) {
    throw new Error('Missing Supabase URL or anon key')
  }
  return config
}

export function requireSupabaseAdminConfig() {
  const config = getSupabaseConfig()
  if (!config.url || !config.serviceRoleKey) {
    throw new Error('Missing Supabase URL or service role key')
  }
  return config
}
