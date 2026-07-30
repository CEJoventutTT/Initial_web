// app/api/coach/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { requireSupabaseConfig } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // 1) params
    let s = url.searchParams.get('s')
    let k = url.searchParams.get('k')
    if (!s || !k) {
      const body = await req.json().catch(() => null)
      if (body) {
        s = String(body.session_id ?? body.s ?? s ?? '')
        k = String(body.key ?? body.k ?? k ?? '')
      }
    }
    const session_id = Number(s)
    if (!Number.isFinite(session_id) || !k || k.length < 8) {
      return NextResponse.json({ error: 'invalid_param' }, { status: 400 })
    }

    // 2) supabase SSR + usuario
    const cookieStore = await cookies()
    const { url: supabaseUrl, anonKey } = requireSupabaseConfig()
    const supabase = createServerClient(
      supabaseUrl,
      anonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { data: authUser, error: userErr } = await supabase.auth.getUser()
    if (userErr || !authUser?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase.rpc('check_in_attendance', {
      p_session_id: session_id,
      p_key: k,
    })
    if (error) return NextResponse.json({ error: 'checkin_failed' }, { status: 400 })

    const result = data as {
      ok?: boolean
      error?: string
      status?: string
      xp?: number
      duplicate?: boolean
    }
    if (!result.ok) {
      const status = result.error === 'session_not_found' ? 404
        : result.error === 'invalid_key' ? 401
          : result.error === 'session_expired' ? 410
            : 409
      return NextResponse.json({ error: result.error || 'checkin_failed' }, { status })
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('[checkin] server_error', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
