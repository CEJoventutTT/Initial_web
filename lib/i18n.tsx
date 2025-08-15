'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'

export type Language = 'es' | 'ca' | 'en'

type TFn = (key: string, params?: Record<string, string | number>) => string

interface TranslationContextType {
  language: Language
  t: TFn
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const useTranslation = () => {
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
  dictionary: Record<string, any>
}) {
  const t = useMemo<TFn>(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const value = key
        .split('.')
        .reduce<any>((acc, k) => (acc && typeof acc === 'object' ? acc[k] : undefined), dictionary)

      let out = typeof value === 'string' ? value : key
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
