import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import {
  authenticatedSupabase,
  canManageProgram,
  hasRole,
} from '@/lib/supabase/request-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user } = await authenticatedSupabase(request)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!(await hasRole(supabase, user.id, ['coach', 'admin']))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const sessionId = Number((await params).id)
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('attendance_sessions')
    .select('program_id')
    .eq('id', sessionId)
    .single()
  if (!existing?.program_id || !(await canManageProgram(supabase, existing.program_id))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!configuredSiteUrl) {
    return NextResponse.json({ error: 'missing_site_url' }, { status: 500 })
  }

  let attendUrl: URL
  try {
    attendUrl = new URL('/attend', configuredSiteUrl)
    if (!['http:', 'https:'].includes(attendUrl.protocol)) {
      throw new Error('Unsupported site URL protocol')
    }
  } catch {
    return NextResponse.json({ error: 'invalid_site_url' }, { status: 500 })
  }

  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString()
  const key = crypto.randomBytes(24).toString('base64url')
  const { data, error } = await supabase
    .from('attendance_sessions')
    .update({ qr_key: key, expires_at: expiresAt, active: true })
    .eq('id', sessionId)
    .select('id, expires_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'rotate_failed' }, { status: 400 })
  }

  attendUrl.searchParams.set('s', String(sessionId))
  attendUrl.searchParams.set('k', key)

  return NextResponse.json({ ok: true, session: data, attendUrl: attendUrl.toString() })
}
