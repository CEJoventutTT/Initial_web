import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // timeout defensivo
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 12_000)

  try {
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const { data: { user }, error: userErr } = await userClient.auth.getUser({ signal: ac.signal } as any)
    if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { program_id, starts_at, ends_at } = await req.json()

    const s = new Date(starts_at)
    const e = new Date(ends_at)
    if (isNaN(+s) || isNaN(+e)) {
      return NextResponse.json({ error: 'invalid_datetime' }, { status: 400 })
    }

    // Ownership O(1) SIN count exacto
    const { data: owns, error: ownErr } = await userClient
      .from('coach_programs')
      .select('id')
      .eq('program_id', program_id)
      .eq('coach_id', user.id)
      .limit(1)
    if (ownErr) return NextResponse.json({ error: ownErr.message }, { status: 400 })
    if (!owns || owns.length === 0) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // Inserta con Service Role
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    )

    const { error: insErr } = await admin
      .from('attendance_sessions')
      .insert({ program_id, starts_at: s.toISOString(), ends_at: e.toISOString() })

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } finally {
    clearTimeout(t)
  }
}
