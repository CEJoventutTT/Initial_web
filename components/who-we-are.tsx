'use client'

import { Award, Heart, Target } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function WhoWeAre() {
  const { t } = useTranslation()

  return (
    <section id="about" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-black text-white mb-6">
              {t('about.title')}
            </h2>
            <p className="text-white/80 text-lg mb-10 leading-relaxed font-thin">
              {t('about.description')}
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/15 bg-brand-teal/25">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {t('about.excellence')}
                </h3>
                <p className="text-white/70 text-sm font-thin">
                  {t('about.excellenceDesc')}
                </p>
              </div>

              {/* Card 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/15 bg-brand-teal/25">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {t('about.community')}
                </h3>
                <p className="text-white/70 text-sm font-thin">
                  {t('about.communityDesc')}
                </p>
              </div>

              {/* Card 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/15 bg-brand-teal/25">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {t('about.growth')}
                </h3>
                <p className="text-white/70 text-sm font-thin">
                  {t('about.growthDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="/her.jpg"
              alt="Club Esportiu Joventut"
              className="rounded-lg w-full h-auto border border-white/10 bg-white/5 p-6"
              draggable={false}
            />

            {/* Badge opcional (si quieres reactivarlo, descomenta) */}
            {/*
            <div className="absolute -bottom-6 -right-6 bg-brand-red text-white p-6 rounded-lg shadow-lg border border-white/10">
              <div className="text-3xl font-black leading-none">365</div>
              <div className="text-sm font-thin mt-1">{t('about.yearsExcellence')}</div>
            </div>
            */}
          </div>
        </div>
      </div>
    </section>
  )
}
