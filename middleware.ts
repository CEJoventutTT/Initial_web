// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // Esto sincroniza la sesión del usuario con la cookie de servidor
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

// excluye estáticos si quieres
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|logo.png|.*\\.jpg|.*\\.png).*)',
  ],
}
