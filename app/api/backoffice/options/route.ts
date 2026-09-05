import { NextResponse } from 'next/server'
import { requireOperator, checked } from '@/lib/backoffice/server'
import { searchPattern, type PersonSummary } from '@/lib/backoffice/list'

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireOperator(false)
    const { searchParams } = new URL(request.url)
    const kind = searchParams.get('kind')
    const q = searchPattern((searchParams.get('q') ?? '').slice(0, 120))
    const { data: profile } = checked(
      await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single(),
    )
    if (kind === 'programs') {
      const query = supabase
        .rpc('backoffice_program_options')
        .ilike('name', q)
        .order('name')
        .order('id')
        .limit(25)
      return NextResponse.json(
        checked(await query).data?.map((row: { id: number; name: string }) => ({
          id: String(row.id),
          label: row.name,
        })) ?? [],
      )
    }
    if (profile?.role !== 'admin')
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    if (!['people', 'students', 'coaches'].includes(kind ?? ''))
      return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
    let query = supabase
      .rpc('admin_people_directory')
      .eq('active', true)
      .or(`full_name.ilike.${q},email.ilike.${q}`)
      .order('full_name')
      .order('user_id')
      .limit(25)
    if (kind === 'students') query = query.eq('role', 'student')
    if (kind === 'coaches') query = query.in('role', ['coach', 'admin'])
    return NextResponse.json(
      checked(await query).data?.map((row: PersonSummary) => ({
        id: row.user_id,
        label: `${row.full_name || 'Sin nombre'} · ${row.email || row.user_id.slice(0, 8)}`,
      })) ?? [],
    )
  } catch {
    return NextResponse.json(
      { error: 'No se pudieron cargar las opciones' },
      { status: 403 },
    )
  }
}
