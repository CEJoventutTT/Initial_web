'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation, Language } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ca', name: 'Català',  flag: '🇨🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export default function LanguageSelector() {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const current = languages.find(l => l.code === language)

  const setLang = (code: Language) => {
    document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
    startTransition(() => router.refresh())
    setIsOpen(false)
  }

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[90px] text-foreground/80 hover:text-foreground hover:bg-brand-teal/20 flex items-center justify-between px-3"
      >
        <Globe className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">{current?.name}</span>
        <span className="sm:hidden">{current?.flag}</span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full min-w-[140px] bg-brand-dark border border-border rounded-lg shadow-lg z-50">
          {languages.map((l, idx) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              disabled={isPending}
              className={`w-full px-4 py-2 text-left hover:bg-brand-teal/15 transition-colors duration-200 flex items-center space-x-2 ${
                language === l.code
                  ? 'bg-brand-teal/20 text-brand-teal font-medium'
                  : 'text-foreground/80'
              } ${idx === 0 ? 'rounded-t-lg' : ''} ${
                idx === languages.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <span>{l.flag}</span>
              <span className="text-sm">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
