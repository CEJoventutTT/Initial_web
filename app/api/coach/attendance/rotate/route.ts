import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

export async function PUT(req: Request) {
  const { url: supabaseUrl, serviceRoleKey } = requireSupabaseAdminConfig()
  const admin = createClient(
    supabaseUrl,
    serviceRoleKey
  )

  const body = await req.json().catch(() => null)
  const url = new URL(req.url)
  const rawId = body?.id ?? url.searchParams.get('id')
  const id = Number(rawId)
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
