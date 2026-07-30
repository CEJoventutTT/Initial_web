import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import {
  authenticatedSupabase,
  canManageProgram,
  hasRole,
} from '@/lib/supabase/request-auth'

export async function PUT(req: Request) {
  const { supabase, user } = await authenticatedSupabase(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!(await hasRole(supabase, user.id, ['coach', 'admin']))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const url = new URL(req.url)
  const rawId = body?.id ?? url.searchParams.get('id')
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('program_id')
    .eq('id', id)
    .single()
  if (!session?.program_id || !(await canManageProgram(supabase, session.program_id))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const key = crypto.randomBytes(24).toString('base64url')
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({ qr_key: key })
    .eq('id', id)
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: 'rotate_failed' }, { status: 400 })
  return NextResponse.json({ ok: true, session: { ...data, qr_key: key } })
}
