'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useTranslation, Language } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

type LangItem = {
  code: Language
  codeLabel: 'ES' | 'CA' | 'GB'
  name: string
  flagClass: 'fi-es' | 'fi-es-ct' | 'fi-gb'
}

const languages: LangItem[] = [
  { code: 'es', codeLabel: 'ES', name: 'Español', flagClass: 'fi-es' },
  { code: 'ca', codeLabel: 'CA', name: 'Català',  flagClass: 'fi-es-ct' },
  { code: 'en', codeLabel: 'GB', name: 'English', flagClass: 'fi-gb' },
]

export default function LanguageSelector() {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  // Por defecto Español si no hay cookie/valor válido
  const current = languages.find(l => l.code === language) ?? languages[0]

  const setLang = (code: Language) => {
    document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
    startTransition(() => router.refresh())
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const Flag = ({ cls, alt }: { cls: LangItem['flagClass']; alt: string }) => (
    <span
      className={`fi ${cls}`}
      style={{ ['--fi-size' as any]: '16px' }}
      aria-label={alt}
      title={alt}
    />
  )

  return (
    <div className="relative" ref={ref}>
      {/* Botón principal -> solo código idioma + flecha */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[64px] text-foreground/80 hover:text-foreground hover:bg-brand-teal/20 flex items-center justify-between px-3"
      >
        <span className="font-semibold">{current.codeLabel}</span>
        <ChevronDown className="h-3 w-3 ml-1 shrink-0" />
      </Button>

      {/* Desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full min-w-[180px] bg-brand-dark border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((l, idx) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              disabled={isPending}
              className={`w-full px-4 py-2 hover:bg-brand-teal/15 transition-colors duration-200 flex items-center ${
                current.code === l.code
                  ? 'bg-brand-teal/20 text-brand-teal font-medium'
                  : 'text-foreground/80'
              } ${idx === 0 ? 'rounded-t-lg' : ''} ${
                idx === languages.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* código más pequeño en el menú */}
                  <span className="text-xs w-7 text-left shrink-0">
                    {l.codeLabel}
                  </span>
                  <span className="text-sm opacity-80">{l.name}</span>
                </div>
                <Flag cls={l.flagClass} alt={`${l.name} flag`} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
