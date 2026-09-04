'use server'

import { revalidatePath } from 'next/cache'
import { authenticatedSupabase, canManageProgram, hasRole } from '@/lib/supabase/request-auth'

export async function markAttendanceManually(formData: FormData) {
  const { supabase, user } = await authenticatedSupabase()
  const sessionId = Number(formData.get('session_id'))
  const studentId = String(formData.get('student_id') || '')
  if (!user || !(await hasRole(supabase, user?.id ?? '', ['coach', 'admin']))) throw new Error('No autorizado')
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !studentId) throw new Error('Datos de asistencia no válidos')
  const { data: session, error: sessionError } = await supabase.from('attendance_sessions').select('program_id').eq('id', sessionId).single()
  if (sessionError || !session?.program_id || !(await canManageProgram(supabase, session.program_id))) throw new Error('No puedes gestionar esta sesión')
  const { data: enrollment } = await supabase.from('enrollments').select('id').eq('program_id', session.program_id).eq('user_id', studentId).eq('status', 'active').maybeSingle()
  if (!enrollment) throw new Error('El alumno no está matriculado en este programa')
  const { error } = await supabase.from('attendance_logs').upsert({ session_id: sessionId, student_id: studentId, program_id: session.program_id, marked_by: user.id }, { onConflict: 'student_id,session_id', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
  revalidatePath('/coach/attendance')
  revalidatePath('/dashboard')
}
