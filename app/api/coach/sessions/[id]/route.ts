import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sessionId = Number(params.id)

  // sólo si la sesión pertenece a un programa del coach
  const { data: s } = await supabase
    .from('sessions')
    .select('id, program_id')
    .eq('id', sessionId)
    .single()
  if (!s) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const { data: prog } = await supabase
    .from('programs')
    .select('id')
    .eq('id', s.program_id)
    .eq('coach_id', session.user.id)
    .single()
  if (!prog) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
