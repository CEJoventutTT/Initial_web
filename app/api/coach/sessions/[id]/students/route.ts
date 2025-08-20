import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const programId = Number(params.id)

  // RLS hará el filtrado: solo verás alumnos de tus programas
  const { data, error } = await supabase
    .from('enrollments')
    .select('user_id, program_id, profiles:profiles!inner(user_id, full_name)')
    .eq('program_id', programId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ students: data ?? [] })
}
