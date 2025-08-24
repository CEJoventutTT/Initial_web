// app/api/coach/sessions/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function supa() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set() {},
        remove() {},
      },
    }
  )
}

// POST /api/coach/sessions  (JSON body)
export async function POST(req: Request) {
  const supabase = supa()

  // requiere usuario logueado
  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const program_id = Number(body?.program_id)
  if (!program_id || Number.isNaN(program_id)) {
    return NextResponse.json({ ok: false, error: 'program_id required' }, { status: 400 })
  }

  // opcionales
  const start_at = body?.start_at ? new Date(body.start_at) : null
  const end_at   = body?.end_at   ? new Date(body.end_at)   : null
  const expires_minutes = Number(body?.expires_minutes ?? 120)
  const expires_at = new Date(Date.now() + expires_minutes * 60_000)

  const payload: any = {
    program_id,
    active: true,
    expires_at,
  }
  if (start_at) payload.start_at = start_at
  if (end_at)   payload.end_at   = end_at

  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert(payload)
    .select('id, program_id, qr_key, active, start_at, end_at, expires_at, created_at')
    .single()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, session: data })
}
