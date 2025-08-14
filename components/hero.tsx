'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import SunBouncing from '@/components/SunBouncing'

export default function Hero() {
  const { t } = useTranslation()

  return (
    <section id="home" className="relative overflow-hidden bg-gray-900">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/10.jpg" // coloca aquí tu imagen
          alt="Table tennis player in action at Club Esportiu Joventut, Sant Josep de sa Talaia"
          priority
          fill
          className="object-cover"
          style={{ objectPosition: 'left center' }} // deja aire a la derecha (mesa/raqueta)
          sizes="100vw"
        />
        {/* Overlays para contraste y foco */}
        {/* degradado lateral (izquierda) para texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/30 to-transparent md:from-gray-900/80 md:via-gray-900/25 md:to-transparent pointer-events-none" />
        {/* degradado inferior para asegurar lectura del párrafo/CTAs */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        {/* viñeteado suave en bordes */}
        <div className="absolute inset-0 ring-1 ring-black/10 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 md:pb-28 text-center">
        <h1 className="text-white font-black tracking-tight leading-[1.05] text-balance
                       text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block mb-2">{t('hero.title')}</span>
          <span className="block text-[#5D8C87] md:mt-1 lg:mt-2 lg:text-[0.94em]">
            {t('hero.subtitle')}
          </span>
        </h1>

        <p className="mx-auto mt-8 text-lg md:text-xl leading-relaxed text-gray-200 max-w-2xl md:max-w-3xl">
          {t('hero.description')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Secundario primero (descubrir) */}
          <Link href="/trainings" aria-label="Explore trainings">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border border-gray-500/70 text-white
                         hover:border-gray-300 hover:bg-white hover:text-gray-900
                         px-6 md:px-8 py-3.5 md:py-4 text-base md:text-lg font-semibold
                         transition-transform duration-150 hover:scale-[1.02]"
            >
              <Play className="mr-2 h-5 w-5" />
              {t('hero.exploreTrainings')}
            </Button>
          </Link>

          {/* Primario (acción) */}
          <Link href="/join" aria-label="Join the club">
            <Button
              size="lg"
              className="rounded-xl bg-[#5D8C87] text-[#262425]
                         hover:opacity-90 px-6 md:px-8 py-3.5 md:py-4
                         text-base md:text-lg font-semibold shadow-lg
                         transition-transform duration-150 hover:scale-[1.02]"
            >
              <Users className="mr-2 h-5 w-5" />
              {t('hero.joinClub')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator (sol) */}
      <div className="fixed bottom-8 right-8 z-50">
        <a href="#about" aria-label="Scroll to content" className="inline-flex">
          <SunBouncing />
        </a>
      </div>
    </section>
  )
}
