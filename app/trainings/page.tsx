'use client'

import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Zap, Clock, MapPin, UserRound } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrainingsPage() {
  const { t } = useTranslation()
  const [expandedSpecial, setExpandedSpecial] = useState<number | null>(null)
  const router = useRouter()

  // Extrae precio (izquierda del "–") y días (derecha)
  const parsePrice = (line: string) => {
    const parts = line.split('–')
    if (parts.length >= 2) {
      return {
        price: parts[0].trim(),                 // p. ej. "29€/mes"
        days: parts.slice(1).join('–').trim(), // p. ej. "1 día a la semana"
      }
    }
    return { price: line, days: '' }
  }

  // Horario uniforme para los 3 programas principales
  const commonSchedule = [
    { day: t('days.monday'), time: '6:00 PM - 7:30 PM' },
    { day: t('days.wednesday'), time: '6:00 PM - 7:30 PM' },
    { day: t('days.friday'), time: '6:00 PM - 7:30 PM' },
  ]

  // Programas principales
  const programs = [
    {
      title: t('trainings.beginnerLevel'),
      description: t('trainings.beginnerDesc'),
      icon: Users,
      schedule: commonSchedule,
      priceLine: t('trainings.price1'),
      features: [t('trainings.personalizedTraining'), t('trainings.flexSchedule'), t('trainings.improve')],
      coach: 'Adrián Morato',
      maxStudents: 12,
    },
    {
      title: t('trainings.competitionLevel'),
      description: t('trainings.competitionDesc'),
      icon: Trophy,
      schedule: commonSchedule,
      priceLine: t('trainings.price2'),
      features: [t('trainings.personalizedTraining'), t('trainings.steadyProgress'), t('trainings.flexSchedule')],
      coach: 'Adrián Morato',
      maxStudents: 8,
    },
    {
      title: t('trainings.adultsProgram'),
      description: t('trainings.adultsDesc'),
      icon: Zap,
      schedule: commonSchedule,
      priceLine: t('trainings.price3'),
      features: [t('trainings.personalizedTraining'), t('trainings.completeTraining'), t('trainings.freeTshirt')],
      coach: 'Adrián Morato',
      maxStudents: 10,
    },
  ].map((p) => ({ ...p, parsed: parsePrice(p.priceLine) }))

  // Programas especiales
  const specialPrograms = [
    {
      title: t('trainings.youthDevelopment'),
      description: t('trainings.youthDesc'),
      schedule: t('trainings.youthSchedule'),
      price: t('trainings.youthPrice'),
      extra: t('trainings.youthMore'),
    },
    {
      title: t('trainings.privateCoaching'),
      description: t('trainings.privateDesc'),
      schedule: t('trainings.byAppointment'),
      price: t('trainings.privatePrice'),
      extra: t('trainings.privateMore'),
    },
    {
      title: t('trainings.corporateTraining'),
      description: t('trainings.corporateDesc'),
      schedule: t('trainings.flexibleScheduling'),
      price: t('trainings.contactForPricing'),
      extra: t('trainings.corporateMore'),
    },
  ]

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-brand-green via-brand-teal to-brand-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">{t('trainings.title')}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              {t('trainings.description')}
            </p>
          </div>
        </section>

        {/* Main Programs */}
        <section className="py-20 bg-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">{t('trainings.mainPrograms')}</h2>
              <p className="text-accent2/90 text-lg">{t('trainings.mainProgramsDesc')}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {programs.map((program, index) => {
                const IconComponent = program.icon

                return (
                  <Card
                    key={index}
                    className="relative flex flex-col justify-between bg-white/5 border border-white/10 hover:border-primary transition-colors duration-300"
                  >
                    {/* Cartel superpuesto arriba-derecha con precio (rojo) y días (blanco) */}
                    <div className="absolute top-3 right-3 z-10 rounded-lg border border-brand-red/60 bg-black/50 backdrop-blur-sm px-3 py-2 shadow">
                      <div className="text-brand-red font-bold text-sm leading-tight">
                        {program.parsed.price}
                      </div>
                      {program.parsed.days && (
                        <div className="text-white/90 text-xs leading-tight">
                          {program.parsed.days}
                        </div>
                      )}
                    </div>

                    <div>
                      <CardHeader className="text-center">
                        <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>

                        {/* Bloque con altura mínima para alinear entre tarjetas */}
                        <div className="min-h-[90px] flex flex-col justify-start">
                          <CardTitle className="text-white text-xl font-semibold">{program.title}</CardTitle>
                          <CardDescription className="text-accent2 mt-2">
                            {program.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Schedule */}
                        <div>
                          <h4 className="text-primary font-semibold mb-3 flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {t('trainings.schedule')}
                          </h4>
                          <div className="space-y-2">
                            {program.schedule.map((session, idx) => (
                              <div key={idx} className="flex justify-between text-sm text-accent2">
                                <span>{session.day}</span>
                                <span>{session.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* What's Included */}
                        <div>
                          <h4 className="text-primary font-semibold mb-3">{t('trainings.whatsIncluded')}</h4>
                          <ul className="text-accent2 text-sm space-y-1">
                            {program.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-accent2/90">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-accent1" />
                            {t('trainings.maxLabel')} {program.maxStudents} {t('trainings.studentsLabel')}
                          </div>
                          <div className="flex items-center">
                            <UserRound className="mr-2 h-4 w-4 text-accent1" />
                            {t('trainings.coachLabel')} {program.coach}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-accent1" />
                            {t('trainings.locationLabel')} {t('trainings.locationClub')}
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Footer: precio en rojo y días en blanco, botón debajo */}
                    <div className="border-t border-white/10 p-4 mt-auto text-center">
                      <div className="text-brand-red font-semibold">
                        {program.parsed.price}
                      </div>
                      {program.parsed.days && (
                        <div className="text-white/90 text-sm">
                          {program.parsed.days}
                        </div>
                      )}
                      <Button
                        className="w-full mt-3 bg-primary hover:opacity-90 text-white font-semibold"
                        onClick={() => router.push('/join')}
                      >
                        {t('trainings.enrollNow')}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Special Programs */}
        <section className="py-20 bg-white/5 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">{t('trainings.specialPrograms')}</h2>
              <p className="text-accent2/90 text-lg">{t('trainings.specialProgramsDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {specialPrograms.map((program, index) => (
                <Card key={index} className="flex flex-col justify-between bg-dark/70 border border-white/10">
                  <div>
                    <CardHeader>
                      <CardTitle className="text-white">{program.title}</CardTitle>
                      <CardDescription className="text-accent2 mt-2 mb-6">
                        {program.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-accent2/90">
                          <Clock className="mr-2 h-4 w-4 text-accent1" />
                          {program.schedule}
                        </div>
                        <div className="text-primary font-semibold">{program.price}</div>

                        {expandedSpecial === index && (
                          <div className="mt-3 p-3 border border-primary text-sm text-accent2/90 rounded-md">
                            {program.extra}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="border-t border-white/10 p-4 mt-auto">
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      onClick={() => setExpandedSpecial(expandedSpecial === index ? null : index)}
                    >
                      {expandedSpecial === index ? t('trainings.hideInfo') : t('trainings.learnMore')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
