'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation, Language } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'ca', name: 'Català',  flag: 'CA' },
  { code: 'en', name: 'English', flag: 'GB' },
]

export default function LanguageSelector() {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const current = languages.find(l => l.code === language)

  const setLang = (code: Language) => {
    document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
    // Rehidrata desde SSR con el nuevo diccionario (sin flash)
    startTransition(() => router.refresh())
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.name}</span>
        <span className="sm:hidden">{current?.flag}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
          {languages.map((l, idx) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              disabled={isPending}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 ${
                language === l.code ? 'bg-gray-700 text-teal-400' : 'text-gray-300'
              } ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === languages.length - 1 ? 'rounded-b-lg' : ''}`}
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
