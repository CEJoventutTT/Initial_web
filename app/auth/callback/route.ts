// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabase = await supabaseServer()
    // Intercambia el code por la cookie de sesión de servidor
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth_callback_failed', url.origin))
    }
  } else {
    return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
  }

  // Redirige a donde prefieras
  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
