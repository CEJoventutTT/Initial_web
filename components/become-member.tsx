'use client'

import { Button } from '@/components/ui/button'
import { Users, Trophy, Heart } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function BecomeMember() {
  const { t } = useTranslation()

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=600&width=1920')`
        }}
      >
        {/* Overlay con degradado corporativo */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-red/95 to-brand-teal/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-black text-white mb-6">
          {t('join.title')}
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-thin">
          {t('join.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Card 1 */}
          <div className="text-center">
            <div className="bg-white/15 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{t('join.joinCommunity')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.joinCommunityDesc')}</p>
          </div>

          {/* Card 2 */}
          <div className="text-center">
            <div className="bg-white/15 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{t('join.competeWin')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.competeWinDesc')}</p>
          </div>

          {/* Card 3 */}
          <div className="text-center">
            <div className="bg-white/15 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">{t('join.loveGame')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.loveGameDesc')}</p>
          </div>
        </div>

        <Link href="/join">
          <Button
            size="lg"
            className="bg-brand-red text-white hover:bg-brand-red/90 px-12 py-4 text-xl font-semibold transition-colors"
          >
            {t('join.becomeMember')}
          </Button>
        </Link>

        <p className="text-white/70 text-sm mt-4 font-thin">
          {t('join.specialOffer')}
        </p>
      </div>
    </section>
  )
}
