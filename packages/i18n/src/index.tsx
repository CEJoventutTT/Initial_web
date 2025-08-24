'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'

export type Language = 'es' | 'ca' | 'en'
type Dict = Record<string, unknown>
type TParams = Record<string, string | number>
type TFn = (key: string, params?: TParams, fallback?: string) => string

interface TranslationContextType {
  language: Language
  t: TFn
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// ⛔ Importante: NO re-exportes aquí nada de locales/dictionaries (server)
// Este entry es client-only.

export function useTranslation() {
  const ctx = useContext(TranslationContext)
  if (!ctx) throw new Error('useTranslation must be used within a TranslationProvider')
  return ctx
}

export function TranslationProvider({
  children,
  initialLanguage,
  dictionary,
}: {
  children: ReactNode
  initialLanguage: Language
  dictionary: Dict
}) {
  const t = useMemo<TFn>(() => {
    return (key: string, params?: TParams, fallback?: string) => {
      const value = key.split('.').reduce<unknown>((acc, k) => {
        if (acc && typeof acc === 'object' && k in (acc as Dict)) {
          return (acc as Dict)[k]
        }
        return undefined
      }, dictionary)

      let out = typeof value === 'string' ? value : (fallback ?? key)

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          out = out.replace(`{${k}}`, String(v))
        }
      }
      return out
    }
  }, [dictionary])

  return (
    <TranslationContext.Provider value={{ language: initialLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}
