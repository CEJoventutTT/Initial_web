'use client'

import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina condicionalmente classNames y resuelve conflictos de utilidades Tailwind.
 * Ejemplo: cn('p-2', cond && 'hidden', 'p-3') -> 'p-3'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

/* ──────────────────────────────────────────────────────────────
 * Toast system (hook + componentes)
 * Asegúrate de tener estos archivos:
 *  - packages/ui/src/hooks/use-toast.ts
 *  - packages/ui/src/toast/toast.tsx
 *  - packages/ui/src/toast/toaster.tsx
 * ────────────────────────────────────────────────────────────── */

export * from './toast/toast'
export { default as Toaster } from './toast/toaster'
export * from './hooks/use-toast'

// Componentes opcionales (descomenta si existen)
// export * from './button'
// export * from './card'
