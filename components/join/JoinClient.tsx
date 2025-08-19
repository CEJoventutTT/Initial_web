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
import emailjs from '@emailjs/browser'
import { useToast } from '@/hooks/use-toast'

export default function JoinPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'elite'>('basic')
  const [submitting, setSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeTerms || submitting) return

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS config missing. Check NEXT_PUBLIC_EMAILJS_* env vars.')
      toast({ variant: 'destructive', title: t('common.error'), description: t('join.applicationDesc') })
      return
    }

    try {
      setSubmitting(true)
      const templateParams = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        experience: formData.experience,
        goals: formData.goals,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        agreeTerms: formData.agreeTerms ? 'Yes' : 'No',
        agreeNewsletter: formData.agreeNewsletter ? 'Yes' : 'No',
        plan:
          selectedPlan === 'basic'
            ? t('trainings.beginnerLevel')
            : selectedPlan === 'premium'
            ? t('trainings.competitionLevel')
            : t('trainings.adultsProgram'),
        createdAt: new Date().toISOString(),
      }

      await emailjs.send(serviceId, templateId, templateParams, { publicKey })
      toast({ title: t('common.success'), description: t('join.reviewMessage') })

      setFormData({
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
    } catch (err) {
      console.error(err)
      toast({ variant: 'destructive', title: t('common.error'), description: t('join.applicationDesc') })
    } finally {
      setSubmitting(false)
    }
  }

  const membershipPlans = [
    {
      id: 'basic' as const,
      name: t('trainings.beginnerLevel'),
      desc: t('trainings.beginnerDesc'),
      priceLine: t('trainings.price1'),
      icon: Users,
      popular: false,
      features: [t('trainings.personalizedTraining'), t('trainings.flexSchedule'), t('trainings.improve')],
    },
    {
      id: 'premium' as const,
      name: t('trainings.competitionLevel'),
      desc: t('trainings.competitionDesc'),
      priceLine: t('trainings.price2'),
      icon: Trophy,
      popular: true,
      features: [t('trainings.personalizedTraining'), t('trainings.flexSchedule'), t('trainings.steadyProgress')],
    },
    {
      id: 'elite' as const,
      name: t('trainings.adultsProgram'),
      desc: t('trainings.adultsDesc'),
      priceLine: t('trainings.price3'),
      icon: Zap,
      popular: false,
      features: [t('trainings.personalizedTraining'), t('trainings.completeTraining'), t('trainings.freeTshirt')],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black mb-6">{t('join.title')}</h1>
            <p className="text-xl text-foreground/90 max-w-3xl mx-auto font-thin">
              {t('join.description')}
            </p>
          </div>
        </section>

        {/* Membership Plans */}
        <section className="pt-20 pb-10 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">{t('join.choosePlan')}</h2>
              <p className="text-muted-foreground text-lg">{t('join.choosePlanDesc')}</p>
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
                        ? 'border-accent bg-card/90'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                          {t('join.mostPopular')}
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border bg-brand-teal/25">
                        <IconComponent className="h-8 w-8 text-foreground" />
                      </div>

                      {/* Bloque título + descripción con altura reservada para alinear */}
                      <div className="min-h-[88px] flex flex-col justify-center">
                        <CardTitle className="text-foreground text-2xl">{plan.name}</CardTitle>
                        {plan.desc && (
                          <CardDescription className="text-muted-foreground">
                            {plan.desc}
                          </CardDescription>
                        )}
                      </div>

                      {/* Precio alineado */}
                      <div className="mt-3 text-accent font-semibold min-h-[24px] flex items-center justify-center">
                        {plan.priceLine}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="text-muted-foreground text-sm mb-3">
                        {t('trainings.includes')}
                      </div>
                      <ul className="space-y-3 mb-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground/85 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <p className="text-foreground/70 text-sm mt-4 font-thin text-center">{t('join.specialOffer')}</p>
          </div>
        </section>

        {/* Application Form */}
        <section className="pt-10 pb-20 bg-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">{t('join.completeApplication')}</h2>
              <p className="text-muted-foreground text-lg">{t('join.applicationDesc')}</p>
            </div>

            <Card className="bg-card/90 border border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-2xl">{t('join.membershipApplication')}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('join.selectedPlan')}: {' '}
                  <span className="text-accent font-semibold">
                    {membershipPlans.find(p => p.id === selectedPlan)?.name}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.personalInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.firstName')} *
                        </label>
                        <Input
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.lastName')} *
                        </label>
                        <Input
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.contactInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.email')}
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.phone')}
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.additionalInfo')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.dateOfBirth')} *
                        </label>
                        <Input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="bg-card border-border text-foreground focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.experience')}
                        </label>
                        <Select onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.experience')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="beginner">{t('levels.beginner')}</SelectItem>
                            <SelectItem value="intermediate">{t('levels.intermediate')}</SelectItem>
                            <SelectItem value="advanced">{t('levels.advanced')}</SelectItem>
                            <SelectItem value="expert">{t('levels.expert')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.goals')}
                        </label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => handleInputChange('goals', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder={t('join.goals')}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.emergencyContact')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.emergencyContactName')} *
                        </label>
                        <Input
                          required
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.emergencyContactPhone')} *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
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
                        className="border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="terms" className="text-sm text-foreground/85 leading-relaxed">
                        {t('join.agreeTerms')}
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="newsletter"
                        checked={formData.agreeNewsletter}
                        onCheckedChange={(checked) => handleInputChange('agreeNewsletter', checked as boolean)}
                        className="border-foreground/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <label htmlFor="newsletter" className="text-sm text-foreground/85">
                        {t('join.agreeNewsletter')}
                      </label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!formData.agreeTerms || submitting}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? t('login.signingIn') : t('join.submitApplication')}
                    </Button>
                    <p className="text-center text-foreground/70 text-sm mt-4">
                      {t('join.reviewMessage')}
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">{t('join.whyJoin')}</h2>
              <p className="text-muted-foreground text-lg">{t('join.whyJoinDesc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-border bg-brand-teal/25">
                  <Users className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-foreground font-semibold text-xl mb-4">{t('join.expertCoaching')}</h3>
                <p className="text-muted-foreground">{t('join.expertCoachingDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-border bg-brand-teal/25">
                  <MapPin className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-foreground font-semibold text-xl mb-4">{t('join.modernFacilities')}</h3>
                <p className="text-muted-foreground">{t('join.modernFacilitiesDesc')}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-border bg-brand-teal/25">
                  <Trophy className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="text-foreground font-semibold text-xl mb-4">{t('join.competitiveOpportunities')}</h3>
                <p className="text-muted-foreground">{t('join.competitiveOpportunitiesDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}