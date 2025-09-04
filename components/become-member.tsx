'use client'

import { Button } from '@/components/ui/button'
import { Users, Trophy, Heart } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function BecomeMember() {
  const { t } = useTranslation()

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Overlay corporativo */}
      <div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-green/90 to-brand-teal/90 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-black text-foreground mb-6">{t('join.title')}</h2>
        <p className="text-xl text-foreground/90 mb-12 max-w-2xl mx-auto font-thin">
          {t('join.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { Icon: Users, title: t('join.joinCommunity'), desc: t('join.joinCommunityDesc') },
            { Icon: Trophy, title: t('join.competeWin'), desc: t('join.competeWinDesc') },
            { Icon: Heart, title: t('join.loveGame'), desc: t('join.loveGameDesc') },
          ].map(({ Icon, title, desc }, i) => (
            <div key={i} className="text-center">
              <div className="bg-card/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/30">
                <Icon className="h-10 w-10 text-foreground" />
              </div>
              <h3 className="text-foreground font-semibold text-lg mb-2">{title}</h3>
              <p className="text-foreground/80 text-sm font-thin">{desc}</p>
            </div>
          ))}
        </div>

        <Link href="/join">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:opacity-90 px-12 py-4 text-xl font-semibold shadow-brand"
          >
            {t('join.becomeMember')}
          </Button>
        </Link>
      </div>
    </section>
  )
}
