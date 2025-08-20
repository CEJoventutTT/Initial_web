import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const id = Number(params.id)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })

  const key = Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12)
  const { data, error } = await admin
    .from('attendance_sessions')
    .update({ qr_key: key })
    .eq('id', id)
    .select('id, qr_key')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, session: data })
}
