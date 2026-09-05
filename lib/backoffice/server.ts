import 'server-only'
import { revalidatePath } from 'next/cache'
import { authenticatedSupabase, hasRole } from '@/lib/supabase/request-auth'
import type { ActionState } from './state'

export class InputError extends Error {}
export async function requireOperator(adminOnly = true) {
  const context = await authenticatedSupabase()
  if (
    !context.user ||
    !(await hasRole(
      context.supabase,
      context.user.id,
      adminOnly ? ['admin'] : ['admin', 'coach'],
    ))
  ) {
    throw new InputError('No tienes permiso para realizar esta operación.')
  }
  return { supabase: context.supabase, user: context.user }
}
export function checked<T extends { error: unknown }>(result: T): T {
  if (result.error) throw result.error
  return result
}
export function numberField(data: FormData, name: string) {
  const value = Number(data.get(name))
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new InputError('Selecciona un registro válido.')
  return value
}
export function textField(data: FormData, name: string, max = 5000) {
  const value = String(data.get(name) ?? '').trim()
  if (value.length > max)
    throw new InputError(`El texto supera el máximo de ${max} caracteres.`)
  return value
}
export function refreshBackoffice() {
  revalidatePath('/admin', 'layout')
  revalidatePath('/coach', 'layout')
  revalidatePath('/dashboard')
}
export async function operation(
  work: () => Promise<string>,
): Promise<ActionState> {
  try {
    const message = await work()
    refreshBackoffice()
    return { ok: true, error: null, message }
  } catch (error) {
    const code = (error as { code?: string })?.code
    const message =
      error instanceof InputError
        ? error.message
        : code === '23505'
          ? 'Ya existe un registro con estos datos.'
          : code === 'P0001'
            ? String((error as { message: string }).message)
            : 'No se pudo guardar el cambio. Revisa los datos e inténtalo de nuevo.'
    console.error('[backoffice] operation failed', {
      code,
      message:
        error instanceof InputError
          ? error.message
          : 'database or service error',
    })
    refreshBackoffice()
    return { ok: false, error: message, message: null }
  }
}
