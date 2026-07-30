import { NextResponse, type NextRequest } from 'next/server'
import { supabaseMiddleware } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = supabaseMiddleware(request, response)
  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:jpg|jpeg|png|gif|webp|avif|svg|mp3)).*)',
  ],
}
