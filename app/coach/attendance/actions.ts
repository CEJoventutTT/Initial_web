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
import type { ActionState } from '@/lib/backoffice/state'

export async function markAttendanceManually(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase, user } = await requireOperator(false)
    const sessionId = numberField(form, 'session_id')
    const { data: session } = checked(
      await supabase
        .from('attendance_sessions')
        .select('program_id, active')
        .eq('id', sessionId)
        .single(),
    )
    if (
      !session?.active ||
      !(await canManageProgram(supabase, session.program_id))
    )
      throw new InputError('No puedes marcar asistencia en esta sesión.')
    checked(
      await supabase
        .from('attendance_logs')
        .upsert(
          {
            session_id: sessionId,
            student_id: textField(form, 'student_id'),
            program_id: session.program_id,
            marked_by: user.id,
          },
          { onConflict: 'student_id,session_id', ignoreDuplicates: true },
        ),
    )
    return 'Asistencia registrada.'
  })
}
export async function correctAttendance(_: ActionState, form: FormData) {
  return operation(async () => {
    const { supabase } = await requireOperator(false)
    checked(
      await supabase.rpc('correct_attendance', {
        p_session: numberField(form, 'session_id'),
        p_student: textField(form, 'student_id'),
        p_reason: textField(form, 'reason', 500),
      }),
    )
    return 'Asistencia retirada y progreso recalculado. La corrección queda en el historial.'
  })
}
