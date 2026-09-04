// app/admin/users/actions.ts
'use server'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'
import { authenticatedSupabase, hasRole } from '@/lib/supabase/request-auth'
import { revalidatePath } from 'next/cache'

export type ActionState = {
  ok: boolean
  error: string | null
  message: string | null
  recoveryUrl?: string | null
}

async function rollbackAuthUser(admin: SupabaseClient<any>, userId: string) {
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (!error) return null
  console.error('[admin/users] unable to compensate Auth user', { userId, error: error.message })
  return `La cuenta se creó, pero no pudo completarse ni revertirse (id: ${userId}). Requiere reconciliación manual.`
}

export async function createUserAdmin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase, user } = await authenticatedSupabase()
    if (!user || !(await hasRole(supabase, user.id, ['admin']))) {
      return { ok: false, error: 'No autorizado', message: null }
    }

    const email = String(formData.get('email') || '').trim().toLowerCase()
    const fullName = String(formData.get('fullName') || '').trim()
    const role = String(formData.get('role') || 'student') as 'student' | 'coach' | 'admin' | 'parent'
    const locale = 'es'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Email no válido', message: null }
    if (!['student', 'coach', 'admin', 'parent'].includes(role)) return { ok: false, error: 'Rol no válido', message: null }

    // ⚠️ Normaliza dominio SIN barra final
    const rawSite = process.env.NEXT_PUBLIC_SUPABASE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const site = rawSite.replace(/\/+$/, '')

    const { url, serviceRoleKey } = requireSupabaseAdminConfig()
    const admin = createClient(
      url,
      serviceRoleKey,
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
      const tmp = `Temp_${crypto.randomUUID()}!9`
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
      if (linkErr) {
        const reconciliation = await rollbackAuthUser(admin, userId)
        return { ok: false, error: reconciliation ?? `invite falló y generateLink también: ${linkErr.message}`, message: null }
      }

      const { error: profErr } = await admin.from('profiles').upsert({
        user_id: userId,
        full_name: fullName || null,
        role,
        locale,
      })
      if (profErr) {
        const reconciliation = await rollbackAuthUser(admin, userId)
        return { ok: false, error: reconciliation ?? `profiles.upsert: ${profErr.message}`, message: null }
      }

      return {
        ok: true,
        error: null,
        message: `No se pudo enviar la invitación automáticamente (SMTP). Copia y envía este enlace al usuario para que fije su contraseña.`,
        recoveryUrl: linkData.properties?.action_link ?? null,
      }
    }

    const invitedUser = invited?.user
    if (!invitedUser) return { ok: false, error: 'No se recibió user en la invitación', message: null }

    const { error: profErr } = await admin.from('profiles').upsert({
      user_id: invitedUser.id,
      full_name: fullName || null,
      role,
      locale,
    })
    if (profErr) {
      const reconciliation = await rollbackAuthUser(admin, invitedUser.id)
      return { ok: false, error: reconciliation ?? `profiles.upsert: ${profErr.message}`, message: null }
    }

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

async function requireAdmin() {
  const { supabase, user } = await authenticatedSupabase()
  if (!user || !(await hasRole(supabase, user.id, ['admin']))) throw new Error('No autorizado')
  return { supabase, user }
}

const operationInitialState: ActionState = { ok: false, error: null, message: null }

function operationError(error: unknown): ActionState {
  console.error('[admin/user] operation failed', error)
  return { ...operationInitialState, error: 'No se pudo guardar el cambio. Revisa los datos e inténtalo de nuevo.' }
}

async function requireProfileRole(supabase: Awaited<ReturnType<typeof authenticatedSupabase>>['supabase'], userId: string, roles: string[]) {
  const { data, error } = await supabase.from('profiles').select('role').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data || !roles.includes(data.role)) throw new Error('El perfil seleccionado no tiene el rol requerido')
}

export async function reviewApplication(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase, user } = await requireAdmin()
    const id = String(formData.get('application_id') || '')
    const status = String(formData.get('status') || '')
    const internalNotes = String(formData.get('internal_notes') || '').trim().slice(0, 5_000)
    if (!id || !['new', 'contacted', 'approved', 'rejected', 'archived'].includes(status)) throw new Error('Solicitud no válida')
    const { data, error } = await supabase.from('membership_applications').update({ status, internal_notes: internalNotes || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select('id').maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Solicitud no encontrada')
    revalidatePath('/admin/user')
    return { ...operationInitialState, ok: true, message: 'Revisión guardada.' }
  } catch (error) {
    return operationError(error)
  }
}

export async function createProgram(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin()
    const name = String(formData.get('name') || '').trim().slice(0, 120)
    const description = String(formData.get('description') || '').trim().slice(0, 2_000)
    const coachId = String(formData.get('coach_id') || '') || null
    if (!name) throw new Error('El nombre del programa es obligatorio')
    if (coachId) await requireProfileRole(supabase, coachId, ['coach', 'admin'])
    const { error } = await supabase.from('programs').insert({ name, description: description || null, coach_id: coachId })
    if (error) throw error
    revalidatePath('/admin/user')
    return { ...operationInitialState, ok: true, message: 'Programa creado.' }
  } catch (error) {
    return operationError(error)
  }
}

export async function assignCoach(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin()
    const programId = Number(formData.get('program_id'))
    const coachId = String(formData.get('coach_id') || '')
    if (!Number.isSafeInteger(programId) || programId <= 0 || !coachId) throw new Error('Asignación no válida')
    await requireProfileRole(supabase, coachId, ['coach', 'admin'])
    const { error } = await supabase
      .from('coach_programs')
      .upsert({ coach_id: coachId, program_id: programId }, { onConflict: 'coach_id,program_id', ignoreDuplicates: true })
    if (error) throw error
    revalidatePath('/admin/user')
    return { ...operationInitialState, ok: true, message: 'Entrenador asignado.' }
  } catch (error) {
    return operationError(error)
  }
}

export async function enrollStudent(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireAdmin()
    const programId = Number(formData.get('program_id'))
    const userId = String(formData.get('user_id') || '')
    if (!Number.isSafeInteger(programId) || programId <= 0 || !userId) throw new Error('Matrícula no válida')
    await requireProfileRole(supabase, userId, ['student'])
    const { error } = await supabase
      .from('enrollments')
      .upsert({ user_id: userId, program_id: programId, status: 'active' }, { onConflict: 'user_id,program_id' })
    if (error) throw error
    revalidatePath('/admin/user')
    return { ...operationInitialState, ok: true, message: 'Alumno matriculado.' }
  } catch (error) {
    return operationError(error)
  }
}
