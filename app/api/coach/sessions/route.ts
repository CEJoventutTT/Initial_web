// app/api/coach/sessions/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function randomKey(len = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz'
  let out = ''
  const cryptoObj = globalThis.crypto || (require('crypto').webcrypto as Crypto)
  const buf = new Uint32Array(len)
  cryptoObj.getRandomValues(buf)
  for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length]
  return out
}

export async function POST(req: Request) {
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

    const { program_id, start_at, end_at } = await req.json()

    const s = new Date(start_at)
    const e = new Date(end_at)
    if (isNaN(+s) || isNaN(+e)) {
      return NextResponse.json({ error: 'invalid_datetime' }, { status: 400 })
    }

    // ownership
    const { data: owns, error: ownErr } = await userClient
      .from('coach_programs')
      .select('id')
      .eq('program_id', program_id)
      .eq('coach_id', user.id)
      .limit(1)
    if (ownErr) return NextResponse.json({ error: ownErr.message }, { status: 400 })
    if (!owns || owns.length === 0) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    // Inserta con Service Role
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const payload = {
      program_id,
      start_at: s.toISOString(),
      end_at: e.toISOString(),
      active: true,
      qr_key: randomKey(20),
      // secret: crypto.randomUUID(), // si quieres doble validación
    }

    const { data, error: insErr } = await admin
      .from('attendance_sessions')
      .insert(payload)
      .select('id, qr_key')
      .single()

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
    return NextResponse.json({ ok: true, id: data.id, qr_key: data.qr_key })
  } finally {
    clearTimeout(t)
  }
}
