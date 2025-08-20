// app/api/coach/attendance/qr/[id]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    const sessionId = Number(params.id)
    if (!Number.isFinite(sessionId)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })

    // 1) recuperar program_id desde attendance_sessions
    const { data: s, error: sErr } = await userClient
      .from('attendance_sessions')
      .select('program_id')
      .eq('id', sessionId)
      .single()
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 })
    if (!s)   return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // 2) ownership
    const { data: owns, error: ownErr } = await userClient
      .from('coach_programs')
      .select('id')
      .eq('program_id', s.program_id)
      .eq('coach_id', user.id)
      .limit(1)
    if (ownErr) return NextResponse.json({ error: ownErr.message }, { status: 400 })
    if (!owns || owns.length === 0) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

    // 3) borrar con service role
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: delAttErr } = await admin
      .from('attendance_logs')
      .delete()
      .eq('session_id', sessionId)
    if (delAttErr) return NextResponse.json({ error: delAttErr.message }, { status: 400 })

    const { error: delSesErr } = await admin
      .from('attendance_sessions')
      .delete()
      .eq('id', sessionId)
    if (delSesErr) return NextResponse.json({ error: delSesErr.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } finally {
    clearTimeout(t)
  }
}
