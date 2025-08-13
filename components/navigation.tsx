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
    <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="/sol.png"
                alt="Club Esportiu Joventut"
                fill
                className="object-contain"
              />
            </div>
     {/*       <span className="text-xl font-black text-white">
              Club Esportiu Joventut
            </span> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium"
              >
                {link.name}
              </Link>
            ))}
            <LanguageSelector />
            <Link href="/login">
              <Button 
                variant="outline" 
                className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white font-medium"
              >
                {t('nav.login')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 rounded-lg mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white font-medium"
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
