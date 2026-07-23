'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'

type CompetitionInterest = 'yes' | 'no' | 'later'
type EventInterest = 'yes' | 'no'

const initialFormData = {
  fullName: '',
  birthDate: '',
  municipality: '',
  phone: '',
  email: '',
  referralSource: '',
  competitionInterest: '' as CompetitionInterest | '',
  eventInterest: '' as EventInterest | '',
  dataProtectionConsent: false,
}

export default function JoinPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormData)

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.dataProtectionConsent || submitting) return

    try {
      setSubmitting(true)
      const response = await fetch('/api/center-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error?.error || 'REQUEST_FAILED')
      }

      toast({ title: t('common.success'), description: t('join.reviewMessage') })
      setFormData(initialFormData)
    } catch (error: any) {
      console.error('[Join] submit error:', error?.message || error)
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error?.message || t('join.applicationDesc'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClassName =
    'bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black">{t('join.title')}</h1>
          </div>
        </section>

        <section className="pt-10 pb-20 bg-white/5">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">{t('join.completeApplication')}</h2>
              <p className="text-muted-foreground text-lg">{t('join.applicationDesc')}</p>
            </div>

            <Card className="bg-card/90 border border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                        {t('join.fullName')} *
                      </label>
                      <Input
                        id="fullName"
                        required
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={(event) => handleInputChange('fullName', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
                        {t('join.birthDate')} *
                      </label>
                      <Input
                        id="birthDate"
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(event) => handleInputChange('birthDate', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="municipality" className="block text-sm font-medium mb-2">
                        {t('join.municipality')} *
                      </label>
                      <Input
                        id="municipality"
                        required
                        autoComplete="address-level2"
                        value={formData.municipality}
                        onChange={(event) => handleInputChange('municipality', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        {t('join.phone')} *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(event) => handleInputChange('phone', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        {t('join.email')} *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="referralSource" className="block text-sm font-medium mb-2">
                        {t('join.referralSource')} *
                      </label>
                      <Input
                        id="referralSource"
                        required
                        value={formData.referralSource}
                        onChange={(event) => handleInputChange('referralSource', event.target.value)}
                        className={fieldClassName}
                      />
                    </div>
                  </div>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">{t('join.competitionInterest')} *</legend>
                    <RadioGroup
                      required
                      value={formData.competitionInterest}
                      onValueChange={(value) =>
                        handleInputChange('competitionInterest', value as CompetitionInterest)
                      }
                      className="flex flex-wrap gap-x-6 gap-y-3"
                    >
                      {(['yes', 'no', 'later'] as const).map((value) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value={value} />
                          <span className="text-sm">{t(`join.options.${value}`)}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-medium">{t('join.eventInterest')} *</legend>
                    <RadioGroup
                      required
                      value={formData.eventInterest}
                      onValueChange={(value) =>
                        handleInputChange('eventInterest', value as EventInterest)
                      }
                      className="flex flex-wrap gap-x-6 gap-y-3"
                    >
                      {(['yes', 'no'] as const).map((value) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value={value} />
                          <span className="text-sm">{t(`join.options.${value}`)}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </fieldset>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">{t('join.dataProtectionTitle')}</h3>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="dataProtectionConsent"
                        required
                        checked={formData.dataProtectionConsent}
                        onCheckedChange={(checked) =>
                          handleInputChange('dataProtectionConsent', checked === true)
                        }
                        className="mt-1 border-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="dataProtectionConsent"
                        className="text-sm text-foreground/85 leading-relaxed"
                      >
                        {t('join.dataProtectionConsent')}
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!formData.dataProtectionConsent || submitting}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('contact.sending') : t('join.submitApplication')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
