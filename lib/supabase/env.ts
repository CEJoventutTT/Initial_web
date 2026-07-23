const URL_KEYS = [
  'NEXT_PUBLIC_CEJTT_SUPABASE_URL',
  'CEJTT_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
] as const

const ANON_KEY_KEYS = [
  'NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY',
  'CEJTT_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

const SERVICE_ROLE_KEY_KEYS = [
  'CEJTT_SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

function firstEnv(keys: readonly string[]) {
  return keys.map((key) => process.env[key]).find(Boolean) || ''
}

export function getSupabaseUrl() {
  return firstEnv(URL_KEYS)
}

export function getSupabaseAnonKey() {
  return firstEnv(ANON_KEY_KEYS)
}

export function getSupabaseServiceRoleKey() {
  return firstEnv(SERVICE_ROLE_KEY_KEYS)
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
