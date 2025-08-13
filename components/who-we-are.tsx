'use client'

import { Award, Heart, Target } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function WhoWeAre() {
  const { t } = useTranslation()

  return (
    <section id="about" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-black text-white mb-6">{t('about.title')}</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed font-thin">
              {t('about.description')}
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium mb-2">{t('about.excellence')}</h3>
                <p className="text-gray-400 text-sm font-thin">{t('about.excellenceDesc')}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium mb-2">{t('about.community')}</h3>
                <p className="text-gray-400 text-sm font-thin">{t('about.communityDesc')}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-medium mb-2">{t('about.growth')}</h3>
                <p className="text-gray-400 text-sm font-thin">{t('about.growthDesc')}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="/logo.png"
              alt="Club Esportiu Joventut logo"
              className="rounded-lg w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-teal-600 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-black">365</div>
              <div className="text-sm font-thin">{t('about.yearsExcellence')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
