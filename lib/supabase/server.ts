// lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { requireSupabaseConfig } from './env'

export async function supabaseServer() {
  const cookieStore = await cookies()
  const { url, anonKey } = requireSupabaseConfig()

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components may not be able to write cookies during render.
          }
        },
      },
    }
  )
}
