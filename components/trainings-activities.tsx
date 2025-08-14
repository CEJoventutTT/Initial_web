'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Trophy, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function TrainingsActivities() {
  const { t } = useTranslation()

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
      schedule: t('trainings.price1'),
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
      schedule: t('trainings.price2'),
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
      schedule: t('trainings.price3'),
    },
  ]

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
                className="bg-brand-dark border border-white/10 hover:border-brand-teal transition-colors duration-300"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/15 bg-brand-teal/25">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-medium">{training.title}</CardTitle>
                  <CardDescription className="text-white/80 font-thin">
                    {training.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-5">
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

                    <div className="border-t border-white/10 pt-4">
                      <p className="text-white/70 text-sm mb-4">
                        <span className="font-semibold text-brand-teal">{training.schedule}</span>
                      </p>
                      <Button className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-semibold">
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
