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
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-teal-800/90"></div>
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
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-medium text-lg mb-2">{t('join.joinCommunity')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.joinCommunityDesc')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-medium text-lg mb-2">{t('join.competeWin')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.competeWinDesc')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-medium text-lg mb-2">{t('join.loveGame')}</h3>
            <p className="text-white/80 text-sm font-thin">{t('join.loveGameDesc')}</p>
          </div>
        </div>

        <Link href="/join">
          <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-12 py-4 text-xl font-medium">
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
