export type SearchParams = Record<string, string | string[] | undefined>
export const PAGE_SIZE = 25
export function param(params: SearchParams, key: string, fallback = '') {
  return typeof params[key] === 'string' ? params[key] : fallback
}
export function listParams(params: SearchParams) {
  const rawPage = Number(param(params, 'page', '1'))
  const page =
    Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100000) : 1
  return {
    page,
    from: (page - 1) * PAGE_SIZE,
    to: page * PAGE_SIZE - 1,
    q: param(params, 'q').trim().slice(0, 120),
  }
}
export function searchPattern(value: string) {
  return `%${value
    .replace(/[(),]/g, ' ')
    .trim()
    .replace(/[\\%_]/g, (character) => `\\${character}`)}%`
}
export type PersonSummary = {
  user_id: string
  full_name: string | null
  role: string
  active: boolean
  email: string | null
}
export function listUrl(
  path: string,
  params: SearchParams,
  overrides: Record<string, string | undefined> = {},
) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...params, ...overrides }))
    if (typeof value === 'string' && value) query.set(key, value)
  return `${path}${query.size ? `?${query}` : ''}`
}
export function backUrl(value: string, path: string) {
  return value === path || value.startsWith(`${path}?`) ? value : path
}
export const statuses: Record<string, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  archived: 'Archivada',
  active: 'Activa',
  inactive: 'Inactiva',
  pending: 'Pendiente',
  student: 'Alumno/a',
  coach: 'Entrenador/a',
  admin: 'Administración',
  parent: 'Tutor/a',
  sent: 'Enviada',
  failed: 'Fallida',
  sending: 'En proceso',
  unknown: 'Por comprobar',
}
