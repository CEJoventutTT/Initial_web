// app/admin/users/actions.ts
'use server'

import { createClient } from '@supabase/supabase-js'

type ActionState = {
  ok: boolean
  error: string | null
  message: string | null
}

export async function createUserAdmin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const fullName = String(formData.get('fullName') || '').trim()
    const role = String(formData.get('role') || 'student') as
      | 'student'
      | 'coach'
      | 'admin'
      | 'parent'

    if (!email) return { ok: false, error: 'Falta email', message: null }

    // ⚠️ Client con Service Role (SERVER ONLY). NO exponer esta key en el cliente.
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1) Invitar por email → el usuario recibe enlace para establecer contraseña
    //    Puedes adjuntar metadata inicial (full_name/role) en `data`
    const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || null, role },
      // redirectTo: 'https://tu-dominio.com/auth/update-password' // opcional: ver notas abajo
    })
    if (inviteErr) {
      return { ok: false, error: `auth.invite: ${inviteErr.message}`, message: null }
    }

    const user = invited?.user
    if (!user) {
      return { ok: false, error: 'No se recibió user en la invitación', message: null }
    }

    // 2) Insertar profile (con Service Role ignora RLS)
    const { error: profErr } = await admin.from('profiles').insert({
      user_id: user.id,
      full_name: fullName || null,
      role,
    })
    if (profErr) {
      return { ok: false, error: `profiles.insert: ${profErr.message}`, message: null }
    }

    return {
      ok: true,
      error: null,
      message: `Invitación enviada a ${email}. El usuario podrá establecer su contraseña desde el correo.`,
    }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e), message: null }
  }
}
