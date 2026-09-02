// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const supabase = await supabaseServer()

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash })
    if (error) return NextResponse.redirect(new URL('/auth/update-password?error=recovery_link_invalid', url.origin))
    return NextResponse.redirect(new URL('/auth/update-password', url.origin))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
  }

  // Intercambia el code por la cookie de sesión de servidor.
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return NextResponse.redirect(new URL('/login?error=auth_callback_failed', url.origin))

  return NextResponse.redirect(new URL('/dashboard', url.origin))
}
