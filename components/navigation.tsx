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
    //{ name: t('nav.trainings'), href: '/trainings' },
    //{ name: t('nav.teams'), href: '/teams' },
    { name: t('nav.news'), href: '/news' },
   //{ name: t('nav.gallery'), href: '/gallery' },
    { name: t('nav.colabora'), href: '/join' },
  ]

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo grande, sin halo ni sombra */}
          <Link href="/" className="relative flex items-center">
            <span className="sr-only">Club Esportiu Joventut</span>
            <div className="relative w-28 h-28 md:w-32 md:h-32 -mb-10 md:-mb-12">
              <Image
                src="/logo.png"
                alt="Club Esportiu Joventut"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Links (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <LanguageSelector />
            <Link href="/login">
              <Button
                variant="outline"
                className="font-medium border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>

          {/* Botón móvil */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-foreground hover:bg-foreground/5"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Cajón móvil */}
        {isOpen && (
          <div className="md:hidden pb-3">
            <div className="mt-2 rounded-lg border border-border bg-background/90">
              <ul className="px-2 pt-2 pb-2 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-foreground/90 hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between px-3 py-2">
                <LanguageSelector />
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
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
