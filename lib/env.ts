const REQUIRED_SUPABASE_ENV = [
  'CEJTT_SUPABASE_URL',
  'NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY',
] as const

export function getMissingSupabaseEnv() {
  return REQUIRED_SUPABASE_ENV.filter((key) => !process.env[key])
}

export function hasSupabaseEnv() {
  return getMissingSupabaseEnv().length === 0
}
