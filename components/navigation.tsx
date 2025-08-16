'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSelector from './language-selector'
import { useTranslation } from '@/lib/i18n'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.trainings'), href: '/trainings' },
    { name: t('nav.teams'), href: '/teams' },
    { name: t('nav.news'), href: '/news' },
    { name: t('nav.gallery'), href: '/gallery' },
    { name: t('nav.join'), href: '/join' },
  ]

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* Barra base un poco más alta para que el logo pueda “respirar” */}
        <div className="relative flex justify-between items-center h-16 md:h-20">
          {/* Logo sobresaliente */}
          <div className="relative">
            <Link href="/" className="block">
              <span className="sr-only">Club Esportiu Joventut</span>

              {/* Contenedor del logo: sobreeleva y deja que sobresalga por debajo */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 -mb-6 md:-mb-8">
                <Image
                  src="/logo.png"
                  alt="Club Esportiu Joventut"
                  fill
                  className="object-contain"
                  priority
                />
                {/* Halo suave debajo del logo para integrarlo con la barra */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 md:w-28 h-6 rounded-full bg-black/20 blur-md pointer-events-none" />
              </div>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            <LanguageSelector />
            <Link href="/login">
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-medium"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 rounded-md hover:bg-foreground/5"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/90 rounded-lg mt-2 border border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-foreground/90 hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
