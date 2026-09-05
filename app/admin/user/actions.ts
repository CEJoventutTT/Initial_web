'use server'

import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'
import {
  checked,
  InputError,
  numberField,
  operation,
  requireOperator,
  textField,
} from '@/lib/backoffice/server'
import type { ActionState } from '@/lib/backoffice/state'
export type { ActionState } from '@/lib/backoffice/state'

function inviteOrigin() {
  return process.env.NODE_ENV === 'production'
    ? 'https://cejoventut.com'
    : new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000')
        .origin
}

export async function createUserAdmin(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  return operation(async () => {
    const { supabase } = await requireOperator()
    const email = textField(form, 'email', 254).toLowerCase()
    const name = textField(form, 'fullName', 120)
    const role = textField(form, 'role') || 'student'
    const applicationId = textField(form, 'application_id')
    if (
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !['student', 'coach', 'admin'].includes(role)
    )
      throw new InputError('Revisa el nombre, correo y rol.')
    if (applicationId) {
      const { data: app } = checked(
        await supabase
          .from('membership_applications')
          .select('status, linked_user_id')
          .eq('id', applicationId)
          .single(),
      )
      if (!app || app.status !== 'approved' || role !== 'student')
        throw new InputError(
          'Aprueba la solicitud antes de crear la cuenta de alumno.',
        )
      if (app.linked_user_id)
        throw new InputError(
          'La solicitud ya tiene una cuenta vinculada. Continúa desde su ficha.',
        )
    }
    const { data: invitation } = checked(
      await supabase.rpc('admin_claim_invitation', {
        p_email: email,
        p_name: name,
        p_role: role,
        p_resend: form.get('resend') === 'true',
      }),
    )
    const { url, serviceRoleKey } = requireSupabaseAdminConfig()
    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    let userId: string | undefined = invitation.user_id ?? undefined
    const identity = checked(
      await supabase.rpc('admin_account_identity', { p_email: email }),
    ).data?.[0]
    // Only reconcile accounts created by this invitation. Existing people require explicit linking.
    if (identity && identity.invitation_id !== invitation.id) {
      if (invitation.status === 'sending')
        checked(
          await admin
            .from('account_invitations')
            .update({
              status: 'failed',
              last_error:
                'Ya existe una cuenta. Selecciona la persona para vincularla.',
              lease_until: null,
              lease_token: null,
            })
            .eq('id', invitation.id)
            .eq('lease_token', invitation.lease_token),
        )
      throw new InputError(
        'Ya existe una cuenta con este correo. Selecciona explícitamente la persona existente para vincularla.',
      )
    }
    if (invitation.status === 'sent') {
      if (applicationId && userId)
        checked(
          await supabase.rpc('admin_complete_application', {
            p_application: applicationId,
            p_user: userId,
          }),
        )
      return 'La cuenta ya existe y la invitación ya se envió. Puedes continuar con la matrícula.'
    }
    let mailAccepted = false
    try {
      if (identity) userId = identity.user_id
      if (!userId) {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password: `${crypto.randomUUID()}!Aa9`,
          email_confirm: true,
          user_metadata: {
            full_name: invitation.full_name,
            role: invitation.role,
            locale: 'es',
          },
          app_metadata: { backoffice_invitation_id: invitation.id },
        })
        if (error || !data.user)
          throw new InputError(
            'No se pudo crear la cuenta. Reintenta; no se duplicará una cuenta existente.',
          )
        userId = data.user.id
      }
      const { data: existingProfile } = checked(
        await admin
          .from('profiles')
          .select('user_id, active')
          .eq('user_id', userId)
          .maybeSingle(),
      )
      if (existingProfile && !existingProfile.active)
        throw new InputError(
          'La persona está de baja. Revisa su ficha antes de enviar una invitación.',
        )
      if (!existingProfile)
        checked(
          await admin
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: invitation.full_name,
              role: invitation.role,
              locale: 'es',
            }),
        )
      checked(
        await admin
          .from('account_invitations')
          .update({ user_id: userId })
          .eq('id', invitation.id)
          .eq('lease_token', invitation.lease_token),
      )
      if (applicationId)
        checked(
          await supabase.rpc('admin_complete_application', {
            p_application: applicationId,
            p_user: userId,
          }),
        )
      if (identity?.last_sign_in_at) {
        checked(
          await admin
            .from('account_invitations')
            .update({ status: 'sent', lease_until: null, lease_token: null })
            .eq('id', invitation.id)
            .eq('lease_token', invitation.lease_token),
        )
        return 'La cuenta ya ha iniciado sesión. No necesita otra invitación.'
      }
      // Auth handles delivery and expiring recovery credentials. No link is stored or displayed.
      const { error: mailError } = await admin.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${inviteOrigin()}/auth/update-password` },
      )
      if (mailError)
        throw new InputError(
          'La cuenta está creada, pero no se pudo enviar el acceso. Reintenta el envío desde la ficha de la persona.',
        )
      mailAccepted = true
      checked(
        await admin
          .from('account_invitations')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            last_error: null,
            lease_until: null,
            lease_token: null,
          })
          .eq('id', invitation.id)
          .eq('lease_token', invitation.lease_token),
      )
      return 'Cuenta preparada. Se ha enviado un correo para establecer la contraseña.'
    } catch (error) {
      checked(
        await admin
          .from('account_invitations')
          .update({
            status: mailAccepted ? 'unknown' : 'failed',
            last_error:
              error instanceof InputError
                ? error.message
                : 'Proceso incompleto. Reintenta desde el backoffice.',
            lease_until: null,
            lease_token: null,
          })
          .eq('id', invitation.id)
          .eq('lease_token', invitation.lease_token),
      )
      throw error
    }
  })
}

export async function reviewApplication(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase, user } = await requireOperator()
    const status = textField(form, 'status')
    if (
      !['new', 'contacted', 'approved', 'rejected', 'archived'].includes(status)
    )
      throw new InputError('Selecciona un estado válido.')
    const { data } = checked(
      await supabase
        .from('membership_applications')
        .update({
          status,
          internal_notes: textField(form, 'internal_notes') || null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', textField(form, 'application_id'))
        .select('id')
        .maybeSingle(),
    )
    if (!data) throw new InputError('Solicitud no encontrada.')
    return 'Revisión guardada en el historial.'
  })
}
export async function completeApplication(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    checked(
      await supabase.rpc('admin_complete_application', {
        p_application: textField(form, 'application_id'),
        p_user: textField(form, 'user_id'),
        p_program: form.get('program_id')
          ? numberField(form, 'program_id')
          : null,
      }),
    )
    return form.get('program_id')
      ? 'Persona vinculada y matrícula activa.'
      : 'Persona vinculada. Ya puedes matricularla.'
  })
}
async function requireCoach(
  supabase: Awaited<ReturnType<typeof requireOperator>>['supabase'],
  id: string,
) {
  const { data } = checked(
    await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', id)
      .eq('active', true)
      .in('role', ['coach', 'admin'])
      .maybeSingle(),
  )
  if (!data) throw new InputError('Selecciona un entrenador activo.')
}
export async function createProgram(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    const name = textField(form, 'name', 120),
      coach = textField(form, 'coach_id')
    if (!name) throw new InputError('El nombre es obligatorio.')
    if (coach) await requireCoach(supabase, coach)
    checked(
      await supabase
        .from('programs')
        .insert({
          name,
          description: textField(form, 'description', 2000),
          coach_id: coach || null,
        }),
    )
    return 'Programa creado.'
  })
}
export async function assignCoach(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    const coach = textField(form, 'coach_id')
    await requireCoach(supabase, coach)
    checked(
      await supabase
        .from('coach_programs')
        .upsert(
          { coach_id: coach, program_id: numberField(form, 'program_id') },
          { onConflict: 'coach_id,program_id', ignoreDuplicates: true },
        ),
    )
    return 'Entrenador asignado.'
  })
}
export async function removeCoach(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    checked(
      await supabase
        .from('coach_programs')
        .delete()
        .eq('id', numberField(form, 'assignment_id')),
    )
    return 'Asignación retirada.'
  })
}
export async function enrollStudent(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    checked(
      await supabase
        .from('enrollments')
        .upsert(
          {
            user_id: textField(form, 'user_id'),
            program_id: numberField(form, 'program_id'),
            status: 'active',
          },
          { onConflict: 'user_id,program_id' },
        ),
    )
    return 'Matrícula activada.'
  })
}
export async function updateEnrollment(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    const status = textField(form, 'status')
    if (!['active', 'inactive'].includes(status))
      throw new InputError('Estado no válido.')
    const { data } = checked(
      await supabase
        .from('enrollments')
        .update({ status })
        .eq('id', numberField(form, 'enrollment_id'))
        .select('id')
        .maybeSingle(),
    )
    if (!data) throw new InputError('Matrícula no encontrada.')
    return 'Matrícula actualizada. El historial de asistencia se conserva.'
  })
}
export async function updateProfile(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    checked(
      await supabase.rpc('admin_update_profile', {
        p_user: textField(form, 'user_id'),
        p_name: textField(form, 'full_name', 120),
        p_role: textField(form, 'role'),
        p_active: form.get('active') === 'true',
      }),
    )
    return 'Persona actualizada. Las matrículas dadas de baja se reactivan individualmente.'
  })
}
export async function updateProgram(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator()
    checked(
      await supabase.rpc('admin_update_program', {
        p_id: numberField(form, 'program_id'),
        p_name: textField(form, 'name', 120),
        p_description: textField(form, 'description', 2000),
        p_coach: textField(form, 'coach_id') || null,
        p_active: form.get('active') === 'true',
      }),
    )
    return 'Programa actualizado. El historial se conserva.'
  })
}
