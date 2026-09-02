
import { createBrowserClient } from '@supabase/ssr'
import { requireSupabaseConfig } from './env'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const supabaseBrowser = () => {
  if (!browserClient) {
    const { url, anonKey } = requireSupabaseConfig()
    browserClient = createBrowserClient(url, anonKey)
  }

  return browserClient
}
