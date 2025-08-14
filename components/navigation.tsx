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
    <nav className="fixed top-0 w-full bg-brand-dark/95 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Go to homepage">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Club Esportiu Joventut"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-brand-teal transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}

            <LanguageSelector />

            <Link href="/login">
              <Button
                variant="outline"
                className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-semibold transition-colors"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-brand-dark/95 rounded-lg mt-2 border border-white/10 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-white/85 hover:text-brand-teal hover:bg-white/5 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="px-3 py-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-brand-red text-brand-red hover:bg-brand-red hover:text-white font-semibold"
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
