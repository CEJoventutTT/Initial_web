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
      features: ['Basic stroke techniques', 'Game rules and scoring', 'Equipment guidance', 'Fun group activities'],
      schedule: t('trainings.price1')
    },
    {
      title: t('trainings.competitionLevel'),
      description: t('trainings.competitionDesc'),
      icon: Trophy,
      features: ['Advanced techniques', 'Match strategy', 'Tournament prep', 'Video analysis'],
      schedule: t('trainings.price2')
    },
    {
      title: t('trainings.adultsProgram'),
      description: t('trainings.adultsDesc'),
      icon: Zap,
      features: ['Flexible scheduling', 'Fitness focused', 'Social matches', 'Stress relief'],
      schedule: t('trainings.price3')
    }
  ]

  return (
    <section id="trainings" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('trainings.title')}</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-thin">
            {t('trainings.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trainings.map((training, index) => {
            const IconComponent = training.icon
            return (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-teal-600 transition-colors duration-300">
                <CardHeader className="text-center">
                  <div className="bg-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-medium">{training.title}</CardTitle>
                  <CardDescription className="text-gray-300 font-thin">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-teal-400 font-medium mb-2">What you'll learn:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {training.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-teal-600 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-400 text-sm mb-4">
                        <span className="font-medium"></span> {training.schedule}
                      </p>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium">
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
