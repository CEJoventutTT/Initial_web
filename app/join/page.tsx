'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Trophy, Zap, Check, MapPin } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function JoinPage() {
  const { t } = useTranslation()

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'elite'>('basic')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    experience: '',
    goals: '',
    emergencyContact: '',
    emergencyPhone: '',
    agreeTerms: false,
    agreeNewsletter: false
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Membership application submitted:', { ...formData, plan: selectedPlan })
    alert(t('join.reviewMessage'))
  }

  // Planes con textos sacados de trainings.*
  const membershipPlans = [
    {
      id: 'basic' as const,
      // Golpes Iniciales
      name: t('trainings.beginnerLevel'),
      desc: t('trainings.beginnerDesc'),
      // Línea de precio completa
      priceLine: t('trainings.price1'),
      icon: Users,
      popular: false,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.flexSchedule'),
        t('trainings.improve'),
      ],
    },
    {
      id: 'premium' as const,
      // Juego en Marcha
      name: t('trainings.competitionLevel'),
      desc: t('trainings.competitionDesc'),
      priceLine: t('trainings.price2'),
      icon: Trophy,
      popular: true,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.flexSchedule'),
        t('trainings.steadyProgress'),
      ],
    },
    {
      id: 'elite' as const,
      // A Potencia Máxima
      name: t('trainings.adultsProgram'),
      desc: t('trainings.adultsDesc'),
      priceLine: t('trainings.price3'),
      icon: Zap,
      popular: false,
      features: [
        t('trainings.personalizedTraining'),
        t('trainings.completeTraining'),
        t('trainings.freeTshirt'),
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-brand-green via-brand-teal to-brand-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">{t('join.title')}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              {t('join.description')}
            </p>
          </div>
        </section>

        {/* Membership Plans */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">{t('join.choosePlan')}</h2>
              <p className="text-white/80 text-lg">{t('join.choosePlanDesc')}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {membershipPlans.map((plan) => {
                const IconComponent = plan.icon
                const active = selectedPlan === plan.id
                return (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer transition-all duration-300 border ${
                      active
                        ? 'border-brand-teal bg-white/5'
                        : 'border-white/10 hover:border-brand-teal/60'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-brand-red text-white px-4 py-1 rounded-full text-sm font-semibold">
                          {t('join.mostPopular')}
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      {plan.desc && (
                        <CardDescription className="text-white/80">
                          {plan.desc}
                        </CardDescription>
                      )}
                      {/* Línea de precio completa (ej. “29€/mes – 1 día a la semana”) */}
                      <div className="mt-3 text-brand-teal font-semibold">
                        {plan.priceLine}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* “Así es tu entrenamiento:” */}
                      <div className="text-white/80 text-sm mb-3">
                        {t('trainings.includes')}
                      </div>
                      <ul className="space-y-3 mb-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-brand-teal mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-white/85 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 bg-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4">{t('join.completeApplication')}</h2>
              <p className="text-white/80 text-lg">{t('join.applicationDesc')}</p>
            </div>

            <Card className="bg-brand-dark border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{t('join.membershipApplication')}</CardTitle>
                <CardDescription className="text-white/80">
                  {t('join.selectedPlan')}: {' '}
                  <span className="text-brand-teal font-semibold">
                    {membershipPlans.find(p => p.id === selectedPlan)?.name}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">{t('join.personalInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.firstName')} *
                        </label>
                        <Input
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.lastName')} *
                        </label>
                        <Input
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">{t('join.contactInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.email')}
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.phone')}
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">{t('join.additionalInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.dateOfBirth')} *
                        </label>
                        <Input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="bg-white/5 border-white/10 text-white focus:border-brand-teal focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.experience')}
                        </label>
                        <Select onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-0">
                            <SelectValue placeholder={t('trainings.learnMore')} />
                          </SelectTrigger>
                          <SelectContent className="bg-brand-dark border border-white/10 text-white">
                            <SelectItem value="beginner">{t('trainings.beginnerLevel')} (0-1)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3)</SelectItem>
                            <SelectItem value="advanced">Advanced (3-5)</SelectItem>
                            <SelectItem value="expert">Expert (5+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.goals')}
                        </label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => handleInputChange('goals', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder={t('join.goals')}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">{t('join.emergencyContact')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.emergencyContactName')} *
                        </label>
                        <Input
                          required
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          {t('join.emergencyContactPhone')} *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="+1 (555) 987-6543"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"
                      />
                      <label htmlFor="terms" className="text-sm text-white/85 leading-relaxed">
                        {t('join.agreeTerms')}
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="newsletter"
                        checked={formData.agreeNewsletter}
                        onCheckedChange={(checked) => handleInputChange('agreeNewsletter', checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-brand-teal data-[state=checked]:border-brand-teal"
                      />
                      <label htmlFor="newsletter" className="text-sm text-white/85">
                        {t('join.agreeNewsletter')}
                      </label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!formData.agreeTerms}
                      className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('join.submitApplication')}
                    </Button>
                    <p className="text-center text-white/70 text-sm mt-4">
                      {t('join.reviewMessage')}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">{t('join.whyJoin')}</h2>
              <p className="text-white/80 text-lg">{t('join.whyJoinDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">{t('join.expertCoaching')}</h3>
                <p className="text-white/80">{t('join.expertCoachingDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">{t('join.modernFacilities')}</h3>
                <p className="text-white/80">{t('join.modernFacilitiesDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">{t('join.competitiveOpportunities')}</h3>
                <p className="text-white/80">{t('join.competitiveOpportunitiesDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
