// app/admin/users/actions.ts
'use server'

import { createClient } from '@supabase/supabase-js'

type ActionState = {
  ok: boolean
  error: string | null
  message: string | null
  recoveryUrl?: string | null
}

export async function createUserAdmin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const fullName = String(formData.get('fullName') || '').trim()
    const role = String(formData.get('role') || 'student') as 'student' | 'coach' | 'admin' | 'parent'
    const locale = 'es'

    if (!email) return { ok: false, error: 'Falta email', message: null }

    // ⚠️ Normaliza dominio SIN barra final
    const rawSite = process.env.NEXT_PUBLIC_SUPABASE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const site = rawSite.replace(/\/+$/, '')

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1) Invite con redirect permitido
    const { data: invited, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName || null, role, locale },
        redirectTo: `${site}/auth/update-password`,  // ⬅️ usa la constante site
      })

    if (inviteErr) {
      // Fallback: crear user + recovery link
      const tmp = 'Temp_' + Math.random().toString(36).slice(2, 10) + '!9'
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: tmp,
        email_confirm: true,
        user_metadata: { full_name: fullName || null, role, locale },
      })
      if (createErr) return { ok: false, error: `auth.createUser: ${createErr.message}`, message: null }

      const userId = created.user?.id
      if (!userId) return { ok: false, error: 'No se pudo obtener el user id', message: null }

      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${site}/auth/update-password` }, // ⬅️ igual aquí
      })
      if (linkErr) return { ok: false, error: `invite falló y generateLink también: ${linkErr.message}`, message: null }

      const { error: profErr } = await admin.from('profiles').upsert({
        user_id: userId,
        full_name: fullName || null,
        role,
        locale,
      })
      if (profErr) return { ok: false, error: `profiles.upsert: ${profErr.message}`, message: null }

      return {
        ok: true,
        error: null,
        message: `No se pudo enviar la invitación automáticamente (SMTP). Copia y envía este enlace al usuario para que fije su contraseña.`,
        recoveryUrl: linkData.properties?.action_link ?? null,
      }
    }

    const user = invited?.user
    if (!user) return { ok: false, error: 'No se recibió user en la invitación', message: null }

    const { error: profErr } = await admin.from('profiles').upsert({
      user_id: user.id,
      full_name: fullName || null,
      role,
      locale,
    })
    if (profErr) return { ok: false, error: `profiles.upsert: ${profErr.message}`, message: null }

    return {
      ok: true,
      error: null,
      message: `Invitación enviada a ${email}. El usuario podrá establecer su contraseña desde el correo.`,
      recoveryUrl: null,
    }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e), message: null }
  }
}
