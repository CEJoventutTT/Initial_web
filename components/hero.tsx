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
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <Image
          src="/10.jpg"
          alt="Table tennis player in action at Club Esportiu Joventut, Sant Josep de sa Talaia"
          priority
          fill
          className="object-cover translate-y-[20px]"
          style={{ objectPosition: 'left center' }}
          sizes="100vw"
        />

        {/* Funde con el nav (oscurece arriba) */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/55 to-transparent pointer-events-none" />
        {/* Viñeteado lateral para lectura del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/85 via-brand-dark/35 to-transparent md:from-brand-dark/80 md:via-brand-dark/30 md:to-transparent pointer-events-none" />
        {/* Tinte verde sutil en todo el hero */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/18 via-transparent to-brand-teal/14 pointer-events-none" />
        {/* Borde suave */}
        <div className="absolute inset-0 ring-1 ring-black/10 pointer-events-none" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-20 md:pb-28 text-center">
        <h1
          className="
            text-white font-black tracking-tight leading-[1.05] text-balance
            text-4xl sm:text-5xl md:text-[56px] lg:text-[64px]
          "
        >
          <span className="block mb-2">
            {t('hero.title')}
          </span>

          <span
            className="
              block md:mt-1 lg:mt-2
              text-brand-teal/85
              text-[0.82em] sm:text-[0.9em] lg:text-[0.95em]
            "
          >
            {t('hero.subtitle')}
          </span>
        </h1>

        <p className="mx-auto mt-7 md:mt-8 text-base sm:text-lg md:text-xl leading-relaxed text-white/85 max-w-2xl md:max-w-3xl">
          {t('hero.description')}
        </p>

        {/* CTAs */}
        <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Secundario: explorar */}
          <Link href="/trainings" aria-label="Explore trainings">
            <Button
              size="lg"
              variant="outline"
              className="
                rounded-xl border border-white/30 text-white
                hover:border-white hover:bg-white hover:text-brand-dark
                px-6 md:px-8 py-3.5 md:py-4 text-base md:text-lg font-semibold
                transition-transform duration-150 hover:scale-[1.02]
              "
            >
              <Play className="mr-2 h-5 w-5" />
              {t('hero.exploreTrainings')}
            </Button>
          </Link>

          {/* Primario: unirse */}
          <Link href="/join" aria-label="Join the club">
            <Button
              size="lg"
              className="
                rounded-xl bg-brand-red text-white
                hover:bg-brand-red/90 px-6 md:px-8 py-3.5 md:py-4
                text-base md:text-lg font-semibold shadow-lg
                transition-transform duration-150 hover:scale-[1.02]
              "
            >
              <Users className="mr-2 h-5 w-5" />
              {t('hero.joinClub')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Sol fijo en BLANCO */}
      <div className="fixed bottom-8 right-8 z-50">
        <a href="#about" aria-label="Scroll to content" className="inline-flex text-white">
          <SunBouncing className="text-white" />
        </a>
      </div>
    </section>
  )
}
