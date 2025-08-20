import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // 1) Cliente “user” con el JWT del coach (para autorizar)
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const { data: { user }, error: userErr } = await userClient.auth.getUser()
  if (userErr || !user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { program_id, starts_at, ends_at } = await req.json()

  const s = new Date(starts_at), e = new Date(ends_at)
  if (isNaN(+s) || isNaN(+e)) return NextResponse.json({ error: 'invalid_datetime' }, { status: 400 })

  // 2) Ownership O(1)
  const { count, error: ownErr } = await userClient
    .from('coach_programs')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', program_id)
    .eq('coach_id', user.id)
  if (ownErr) return NextResponse.json({ error: ownErr.message }, { status: 400 })
  if (!count) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // 3) Inserta con Service Role (bypasa RLS, ya autorizamos arriba)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server-only
  )

  const { error: insErr } = await admin
    .from('sessions')
    .insert({ program_id, starts_at: s.toISOString(), ends_at: e.toISOString() })

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
