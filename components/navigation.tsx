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
    <nav className="fixed top-0 inset-x-0 z-50 bg-brand-dark/60 backdrop-blur supports-[backdrop-filter]:bg-brand-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="absolute top-[0.5rem] left-4 z-50 w-28 h-28">
              <Image src="/logo.png" alt="Club Esportiu Joventut" fill className="object-contain" />
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            <LanguageSelector />
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-brand-dark font-medium"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-brand-dark/90 rounded-lg mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-white/90 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white hover:text-brand-dark font-medium"
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
