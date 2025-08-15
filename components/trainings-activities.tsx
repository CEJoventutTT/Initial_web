'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Trophy, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useRouter } from 'next/navigation'

export default function TrainingsActivities() {
  const { t } = useTranslation()
  const router = useRouter()

  // Divide "29€/mes – 1 día a la semana" en precio (izq) y días (dcha)
  const parsePrice = (line: string) => {
    const parts = line.split('–') // EN DASH
    if (parts.length >= 2) {
      return {
        price: parts[0].trim(),
        days: parts.slice(1).join('–').trim(),
      }
    }
    return { price: line, days: '' }
  }

  const trainings = [
    {
      title: t('trainings.beginnerLevel'),
      description: t('trainings.beginnerDesc'),
      icon: Users,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.flexSchedule'),
        t('trainings.improve'),
      ],
      priceLine: t('trainings.price1'),
    },
    {
      title: t('trainings.competitionLevel'),
      description: t('trainings.competitionDesc'),
      icon: Trophy,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.flexSchedule'),
        t('trainings.steadyProgress'),
      ],
      priceLine: t('trainings.price2'),
    },
    {
      title: t('trainings.adultsProgram'),
      description: t('trainings.adultsDesc'),
      icon: Zap,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.completeTraining'),
        t('trainings.freeTshirt'),
      ],
      priceLine: t('trainings.price3'),
    },
  ].map((tr) => ({ ...tr, parsed: parsePrice(tr.priceLine) }))

  return (
    <section id="trainings" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('trainings.title')}</h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-thin">
            {t('trainings.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trainings.map((training, index) => {
            const IconComponent = training.icon
            return (
              <Card
                key={index}
                className="relative flex flex-col justify-between bg-gradient-to-br from-brand-green/5 to-brand-teal/10 border border-white/10 hover:border-primary transition-colors duration-300relative flex flex-col justify-between bg-brand-green/10 border border-brand-green/30 hover:border-primary transition-colors duration-300"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/15 bg-brand-teal/25">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-medium">{training.title}</CardTitle>

                  {/* Bloque con altura mínima común para alinear las tarjetas */}
                  <div className="min-h-[40px] flex items-start justify-center">
                    <CardDescription className="text-white/80 font-thin">
                      {training.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col grow">
                  <div className="space-y-5 grow">
                    <div>
                      <h4 className="text-brand-teal font-medium mb-2">
                        {t('trainings.includes')}
                      </h4>
                      <ul className="text-white/85 text-sm space-y-2">
                        {training.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mt-1 w-1.5 h-1.5 bg-brand-teal rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer fijo y alineado: precio y días en dos líneas, luego botón */}
                    <div className="mt-auto border-t border-white/10 pt-4">
                      <div className="text-brand-teal font-semibold leading-tight">
                        {training.parsed.price}
                      </div>
                      {training.parsed.days && (
                        <div className="text-white/70 text-sm mb-4 leading-tight">
                          {training.parsed.days}
                        </div>
                      )}

                      <Button
                        className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-semibold"
                        onClick={() => router.push('/trainings')}
                      >
                        {t('trainings.seeMore')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
