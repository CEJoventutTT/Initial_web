
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

// Password-recovery links may be opened on a different device from the one
// where they were requested. Use the implicit flow for that one operation so
// the session is returned in the URL fragment rather than relying on a PKCE
// verifier stored in the requesting browser.
export const supabaseImplicitBrowser = () => {
  const { url, anonKey } = requireSupabaseConfig()
  return createBrowserClient(url, anonKey, {
    auth: { flowType: 'implicit' },
  })
}
