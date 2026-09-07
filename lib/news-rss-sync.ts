import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'
import { runRssSync } from '@/scripts/news-rss-runner.mjs'

export async function syncNewsFromRss(actor?: string) {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return runRssSync(supabase, { actor: actor ?? null })
}
