// app/api/coach/programs/[id]/qr/rotate/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const pid = Number(params.id)
  if (!Number.isFinite(pid)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })

  // Verificar que el coach tenga acceso al programa
  const { data: prog, error: pErr } = await supabase
    .from('programs')
    .select('id, coach_id')
    .eq('id', pid)
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 })
  if (!prog) return NextResponse.json({ error: 'program_not_found' }, { status: 404 })

  if (prog.coach_id !== session.user.id) {
    const { data: allow2 } = await supabase
      .from('coach_programs')
      .select('id')
      .eq('program_id', pid)
      .eq('coach_id', session.user.id)
      .limit(1)
    if (!allow2 || !allow2.length) return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const newSecret = randomUUID()
  const { error: updErr } = await supabase
    .from('programs')
    .update({ qr_secret: newSecret })
    .eq('id', pid)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })

  return NextResponse.json({ ok: true, qr_secret: newSecret })
}
