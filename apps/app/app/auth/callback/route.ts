// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // Intercambia el code por la cookie de sesión de servidor
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirige a donde prefieras
  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
