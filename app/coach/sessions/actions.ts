'use server'
import {
  checked,
  InputError,
  numberField,
  operation,
  requireOperator,
  textField,
} from '@/lib/backoffice/server'
import { canManageProgram } from '@/lib/supabase/request-auth'
import { clubLocalToISO } from '@/lib/backoffice/time'
import type { ActionState } from '@/lib/backoffice/state'

export async function saveSession(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator(false)
    const programId = numberField(form, 'program_id')
    if (!(await canManageProgram(supabase, programId)))
      throw new InputError('No puedes gestionar este programa.')
    const { data: program } = checked(
      await supabase
        .from('programs')
        .select('active')
        .eq('id', programId)
        .single(),
    )
    if (!program?.active) throw new InputError('El programa está archivado.')
    let start: string, end: string
    try {
      start = clubLocalToISO(textField(form, 'start_at'))
      end = clubLocalToISO(textField(form, 'end_at'))
    } catch (error) {
      throw new InputError((error as Error).message)
    }
    if (end <= start)
      throw new InputError('El fin debe ser posterior al inicio.')
    const values = {
      program_id: programId,
      start_at: start,
      end_at: end,
      expires_at: end,
      active: form.get('active') === 'true',
    }
    if (form.get('session_id')) {
      const id = numberField(form, 'session_id')
      const { data: previous } = checked(
        await supabase
          .from('attendance_sessions')
          .select('program_id')
          .eq('id', id)
          .single(),
      )
      if (!previous || !(await canManageProgram(supabase, previous.program_id)))
        throw new InputError('No puedes modificar esta sesión.')
      const { data } = checked(
        await supabase
          .from('attendance_sessions')
          .update(values)
          .eq('id', id)
          .select('id')
          .maybeSingle(),
      )
      if (!data) throw new InputError('La sesión ya no está disponible.')
      return 'Sesión actualizada. Horario de Madrid.'
    }
    checked(await supabase.from('attendance_sessions').insert(values))
    return 'Sesión creada. Horario de Madrid.'
  })
}
export async function cancelSession(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator(false)
    const { data } = checked(
      await supabase
        .from('attendance_sessions')
        .update({ active: false })
        .eq('id', numberField(form, 'session_id'))
        .select('id')
        .maybeSingle(),
    )
    if (!data) throw new InputError('No puedes gestionar esta sesión.')
    return 'Sesión cancelada. La asistencia histórica se conserva.'
  })
}
export async function deleteSession(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator(false)
    const { data } = checked(
      await supabase
        .from('attendance_sessions')
        .delete()
        .eq('id', numberField(form, 'session_id'))
        .select('id')
        .maybeSingle(),
    )
    if (!data) throw new InputError('La sesión no existe o no tienes permiso.')
    return 'Sesión vacía eliminada.'
  })
}
