// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const PUBLIC_PREFIXES = ['/attend', '/api/coach/attendance/checkin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // BYPASS TOTAL para rutas públicas (sirve tanto con o sin query string)
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Para el resto, sincroniza sesión si lo necesitas
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

// Matcher amplio, ignora estáticos y assets comunes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|logo.png|.*\\.(?:jpg|jpeg|png|gif|webp|svg)).*)',
  ],
}
