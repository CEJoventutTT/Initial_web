import { NextResponse } from 'next/server'
import {
  authenticatedSupabase,
  canManageProgram,
  hasRole,
} from '@/lib/supabase/request-auth'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await authenticatedSupabase(req)
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!(await hasRole(supabase, user.id, ['coach', 'admin']))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { id } = await params
  const sessionId = Number(id)
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('program_id')
    .eq('id', sessionId)
    .single()

  if (!session?.program_id || !(await canManageProgram(supabase, session.program_id))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('attendance_sessions')
    .delete()
    .eq('id', sessionId)
  if (error) return NextResponse.json({ error: 'session_delete_failed' }, { status: 400 })

  return NextResponse.json({ ok: true })
}
