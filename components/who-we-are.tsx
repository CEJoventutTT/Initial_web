'use client'

import { Award, Heart, Target } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function WhoWeAre() {
  const { t } = useTranslation()

  return (
    <section id="about" className="py-20 bg-brand-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black text-white mb-6">
          {t('about.title')}
        </h2>
        <p className="text-white/80 text-lg mb-10 leading-relaxed font-thin">
          {t('about.description')}
        </p>

        <div className="grid sm:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-brand-teal/30 bg-brand-teal/20">
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
          <div>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-brand-teal/30 bg-brand-teal/20">
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
          <div>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-brand-teal/30 bg-brand-teal/20">
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
    </section>
  )
}
