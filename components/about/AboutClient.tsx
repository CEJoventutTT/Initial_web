'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Target, Users, Trophy, Calendar, Activity } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import Image from 'next/image'

export default function AboutClient() {
  const { t } = useTranslation()

  const stats = [
    { label: t('about.yearsExcellence'), value: t('about.since'), icon: Calendar },
    { label: t('about.programs'), value: t('about.programsShort'), icon: Activity },
    { label: t('about.communityReach'), value: t('about.communityReachShort'), icon: Users },
    { label: t('about.nationalPath'), value: t('about.nationalPathShort'), icon: Trophy }
  ]

  const values = [
    { title: t('about.values.inclusionTitle'),  description: t('about.values.inclusionDesc'),  icon: Heart },
    { title: t('about.values.integrationTitle'), description: t('about.values.integrationDesc'), icon: Users },
    { title: t('about.values.developmentTitle'), description: t('about.values.developmentDesc'), icon: Target }
  ]

  const benefits = [
    { icon: Activity, title: t('about.benefits.physicalTitle'), desc: t('about.benefits.physicalDesc') },
    { icon: Target,   title: t('about.benefits.cognitiveTitle'), desc: t('about.benefits.cognitiveDesc') },
    { icon: Heart,    title: t('about.benefits.cardiovascularTitle'), desc: t('about.benefits.cardiovascularDesc') },
    { icon: Users,    title: t('about.benefits.socialTitle'), desc: t('about.benefits.socialDesc') }
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />

      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="pointer-events-none absolute inset-x-0 -top-6 h-10 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">{t('about.title')}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              {t('about.description')}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon as any
                return (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Beneficios del tenis de mesa */}
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-black text-white mb-4">{t('about.benefits.title')}</h2>
              <p className="text-white/80 text-lg max-w-3xl mx-auto font-thin">
                {t('about.benefits.lead')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b, i) => {
                const Icon = b.icon as any
                return (
                  <Card key={i} className="bg-brand-dark border border-white/10 text-center">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-white text-lg font-semibold">{b.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 font-thin text-sm">{b.desc}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Nuestro equipo */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6">{t('about.teamTitle')}</h2>
              <p className="text-white/80 text-lg mb-6">{t('about.teamIntro')}</p>
              <h3 className="text-2xl font-semibold mb-3">{t('about.coachName')}</h3>
              <p className="text-white/80 font-thin">{t('about.coachDesc')}</p>
            </div>
            <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/adrian-morato.jpg"
                alt={t('about.coachName')}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Misión / Visión / Valores */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-10">
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t('about.missionTitle')}</h3>
              <p className="text-white/80 font-thin">{t('about.mission')}</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t('about.visionTitle')}</h3>
              <p className="text-white/80 font-thin">{t('about.vision')}</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t('about.valuesTitle')}</h3>
              <p className="text-white/80 font-thin">{t('about.valuesLead')}</p>
            </div>
          </div>
        </section>

        {/* Nuestros Valores */}
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">{t('about.ourValues')}</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto font-thin">
                {t('about.valuesDesc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon as any
                return (
                  <Card key={idx} className="bg-brand-dark border border-white/10 text-center">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl font-semibold">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 font-thin">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
