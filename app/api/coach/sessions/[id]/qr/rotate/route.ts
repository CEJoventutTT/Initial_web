import { NextResponse } from 'next/server'
import { createRouteHandlerClient, createClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const userClient = createRouteHandlerClient({ cookies })
  const { data: { session } } = await userClient.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const sessionId = Number(params.id)
  if (!Number.isFinite(sessionId)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 })

  // 1) Ver permisos del coach (con RLS)
  const { data: s, error: sErr } = await userClient
    .from('sessions')
    .select('program_id')
    .eq('id', sessionId)
    .single()
  if (sErr || !s) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })

  const { data: allowed } = await userClient
    .from('programs')
    .select('id, coach_id')
    .eq('id', s.program_id)
    .maybeSingle()

  let ok = !!(allowed && allowed.coach_id === session.user.id)
  if (!ok) {
    const { data: allowed2 } = await userClient
      .from('coach_programs')
      .select('id')
      .eq('program_id', s.program_id)
      .eq('coach_id', session.user.id)
      .limit(1)
    ok = !!(allowed2 && allowed2.length)
  }
  if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  // 2) Actualizar con SERVICE ROLE (bypass RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // server-only
  )

  const { error: updErr } = await admin
    .from('sessions')
    .update({ qr_secret: randomUUID() })
    .eq('id', sessionId)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
