export const CLUB_TIME_ZONE = 'Europe/Madrid'

const localFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: CLUB_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

export function clubDateTimeInput(value: string | Date) {
  return localFormatter.format(new Date(value)).replace(' ', 'T')
}

export function clubDateTime(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('es-ES', {
        timeZone: CLUB_TIME_ZONE,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—'
}

/** Reject nonexistent and ambiguous wall times instead of silently moving a session. */
export function clubLocalToISO(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error('Introduce una fecha y hora válidas.')
  const wall = Date.parse(`${value}:00Z`)
  if (!Number.isFinite(wall))
    throw new Error('Introduce una fecha y hora válidas.')
  const matches = [0, 1, 2, 3]
    .map((offset) => new Date(wall - offset * 3_600_000))
    .filter((date) => clubDateTimeInput(date) === value)
  if (matches.length === 0)
    throw new Error(
      'Esta hora no existe en Madrid. Revisa la fecha y el cambio de hora.',
    )
  if (matches.length > 1)
    throw new Error(
      'Esta hora ocurre dos veces por el cambio de hora. Elige una hora anterior o posterior.',
    )
  return matches[0].toISOString()
}

export function clubToday() {
  return clubDateTimeInput(new Date()).slice(0, 10)
}
export function clubDayBounds(day: string) {
  const from = clubLocalToISO(`${day}T00:00`)
  const next = new Date(`${day}T12:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return {
    from,
    to: clubLocalToISO(`${next.toISOString().slice(0, 10)}T00:00`),
  }
}

export function clubDateRange(from: string, to: string) {
  try {
    const start = clubDayBounds(from).from,
      end = clubDayBounds(to).to
    if (start >= end) return null
    return { from: start, to: end }
  } catch {
    return null
  }
}
