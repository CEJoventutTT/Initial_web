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
    <section id="home" className="relative overflow-hidden bg-brand-dark">
      {/* Imagen */}
      <div className="absolute inset-0">
        <Image
          src="/10.jpg"
          alt="Table tennis player in action at Club Esportiu Joventut, Sant Josep de sa Talaia"
          priority fill sizes="100vw"
          className="object-cover"
          style={{ objectPosition: 'left center' }}
        />
        {/* Overlays de contraste con color corporativo dark */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/85 via-brand-dark/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-dark/65 to-transparent pointer-events-none" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 md:pb-28 text-center">
        <h1 className="text-white font-black tracking-tight leading-[1.05] text-balance
                       text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="block mb-2">{t('hero.title')}</span>
          <span className="block text-brand-teal md:mt-1 lg:mt-2 lg:text-[0.94em]">
            {t('hero.subtitle')}
          </span>
        </h1>

        <p className="mx-auto mt-8 text-lg md:text-xl leading-relaxed text-white/85 max-w-2xl md:max-w-3xl">
          {t('hero.description')}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Secundario: teal */}
          <Link href="/trainings" aria-label="Explore trainings">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border border-brand-teal text-brand-teal
                         hover:bg-brand-teal hover:text-brand-dark
                         px-6 md:px-8 py-3.5 md:py-4 text-base md:text-lg font-semibold
                         transition-transform duration-150 hover:scale-[1.02]"
            >
              <Play className="mr-2 h-5 w-5" />
              {t('hero.exploreTrainings')}
            </Button>
          </Link>

          {/* Primario: rojo */}
          <Link href="/join" aria-label="Join the club">
            <Button
              size="lg"
              className="rounded-xl bg-brand-red text-white hover:bg-brand-red/90
                         px-6 md:px-8 py-3.5 md:py-4 text-base md:text-lg font-semibold
                         shadow-brand transition-transform duration-150 hover:scale-[1.02]"
            >
              <Users className="mr-2 h-5 w-5" />
              {t('hero.joinClub')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="fixed bottom-8 right-8 z-50">
        <a href="#about" aria-label="Scroll to content" className="inline-flex">
          <SunBouncing />
        </a>
      </div>
    </section>
  )
}
