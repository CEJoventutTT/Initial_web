import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // SOLO server
)

// helper: comprueba header x-admin-key
function hasAdminKey(req: Request) {
  const headerKey = req.headers.get('x-admin-key')
  return !!process.env.ADMIN_API_KEY && headerKey === process.env.ADMIN_API_KEY
}

export async function POST(req: Request) {
  // 1) Bloquea si no trae la clave
  if (!hasAdminKey(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { email, fullName, role } = await req.json() as {
    email: string
    fullName?: string
    role: 'student' | 'coach' | 'admin' | 'parent'
  }

  // 2) Crea usuario en Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { fullName, role },
  })
  if (error || !data?.user) {
    return NextResponse.json({ error: error?.message ?? 'createUser failed' }, { status: 400 })
  }

  // 3) Inserta su perfil (rol, nombre, etc.)
  const { error: pErr } = await supabaseAdmin.from('profiles').insert({
    user_id: data.user.id,
    role,
    full_name: fullName ?? null,
    locale: 'es',
  })
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 400 })
  }

  // 4) (Opcional) Genera link de set-password
  await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  return NextResponse.json({ ok: true })
}
