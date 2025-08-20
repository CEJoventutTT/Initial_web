// app/api/coach/sessions/[id]/qr/rotate/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sessionId = Number(params.id)

  // Verificar ownership del coach (puente o legacy)
  const { data: s, error: sErr } = await supabase
    .from('sessions')
    .select('program_id')
    .eq('id', sessionId)
    .single()
  if (sErr || !s) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })

  const { data: allowed } = await supabase
    .from('programs')
    .select('id')
    .eq('id', s.program_id)
    .eq('coach_id', session.user.id)
    .limit(1)
    .maybeSingle()

  const { data: allowed2 } = await supabase
    .from('coach_programs')
    .select('id')
    .eq('program_id', s.program_id)
    .eq('coach_id', session.user.id)
    .limit(1)

  if (!allowed && !(allowed2 && allowed2.length)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { error: updErr } = await supabase
    .from('sessions')
    .update({ qr_secret: crypto.randomUUID() })
    .eq('id', sessionId)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
