import { type ClassValue } from "clsx"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina condicionalmente classNames y resuelve conflictos de Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
