'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Trophy, MapPin } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import emailjs from '@emailjs/browser'
import { useToast } from '@/hooks/use-toast'

type ParticipantProfile = 'children' | 'teens' | 'adults' | 'seniors' | 'mixed'
type OrgType = 'school' | 'association' | 'sports' | 'healthcare' | 'other'
type TimeSlot = 'morning' | 'afternoon' | 'evening'

export default function JoinPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Centro / entidad
    centerName: '',
    orgType: '' as OrgType | '',
    municipality: '',
    address: '',
    locationNotes: '',

    // Persona de contacto
    contactPerson: '',
    role: '',
    email: '',
    phone: '',

    // Participantes
    participantProfile: '' as ParticipantProfile | '',
    ageRange: '',
    numParticipants: '',
    specialNeeds: '',
    accessibility: '',

    // Planificación
    preferredDays: [] as string[], // ['mon','tue',...]
    preferredTime: '' as TimeSlot | '',
    frequencyPerWeek: '',
    sessionDuration: '',
    startDate: '',

    // Espacio y material
    tablesAvailable: false,
    spaceAvailable: false,
    equipmentNotes: '',

    // Otros
    objectives: '',
    notes: '',

    // Consentimiento
    agreeTerms: false,
    agreeNewsletter: false
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePreferredDay = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: checked
        ? [...prev.preferredDays, day]
        : prev.preferredDays.filter(d => d !== day),
    }))
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
        // Centro/entidad
        centerName: formData.centerName,
        orgType: formData.orgType,
        municipality: formData.municipality,
        address: formData.address,
        locationNotes: formData.locationNotes,

        // Contacto
        contactPerson: formData.contactPerson,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,

        // Participantes
        participantProfile: formData.participantProfile,
        ageRange: formData.ageRange,
        numParticipants: formData.numParticipants,
        specialNeeds: formData.specialNeeds,
        accessibility: formData.accessibility,

        // Planificación
        preferredDays: formData.preferredDays.join(', '),
        preferredTime: formData.preferredTime,
        frequencyPerWeek: formData.frequencyPerWeek,
        sessionDuration: formData.sessionDuration,
        startDate: formData.startDate,

        // Espacio/material
        tablesAvailable: formData.tablesAvailable ? 'Yes' : 'No',
        spaceAvailable: formData.spaceAvailable ? 'Yes' : 'No',
        equipmentNotes: formData.equipmentNotes,

        // Otros
        objectives: formData.objectives,
        notes: formData.notes,

        // Consentimiento
        agreeTerms: formData.agreeTerms ? 'Yes' : 'No',
        agreeNewsletter: formData.agreeNewsletter ? 'Yes' : 'No',

        createdAt: new Date().toISOString(),
      }

      await emailjs.send(serviceId, templateId, templateParams, { publicKey })
      toast({ title: t('common.success'), description: t('join.reviewMessage') })

      setFormData({
        centerName: '',
        orgType: '',
        municipality: '',
        address: '',
        locationNotes: '',
        contactPerson: '',
        role: '',
        email: '',
        phone: '',
        participantProfile: '',
        ageRange: '',
        numParticipants: '',
        specialNeeds: '',
        accessibility: '',
        preferredDays: [],
        preferredTime: '',
        frequencyPerWeek: '',
        sessionDuration: '',
        startDate: '',
        tablesAvailable: false,
        spaceAvailable: false,
        equipmentNotes: '',
        objectives: '',
        notes: '',
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

  const dayOptions = [
    { key: 'mon', label: t('join.days.mon') },
    { key: 'tue', label: t('join.days.tue') },
    { key: 'wed', label: t('join.days.wed') },
    { key: 'thu', label: t('join.days.thu') },
    { key: 'fri', label: t('join.days.fri') },
    { key: 'sat', label: t('join.days.sat') },
    { key: 'sun', label: t('join.days.sun') },
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

        {/* Application Form para centros */}
        <section className="pt-10 pb-20 bg-white/5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">{t('join.completeApplication')}</h2>
              <p className="text-muted-foreground text-lg">{t('join.applicationDesc')}</p>
            </div>

            <Card className="bg-card/90 border border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-2xl">
                  {t('join.activityRequest')}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t('join.reviewMessage')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Centro / entidad */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.centerInfo')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.centerName')} *
                        </label>
                        <Input
                          required
                          value={formData.centerName}
                          onChange={(e) => handleInputChange('centerName', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.orgType')}
                        </label>
                        <Select onValueChange={(v) => handleInputChange('orgType', v as OrgType)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.orgType')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="school">{t('join.orgTypes.school')}</SelectItem>
                            <SelectItem value="association">{t('join.orgTypes.association')}</SelectItem>
                            <SelectItem value="sports">{t('join.orgTypes.sports')}</SelectItem>
                            <SelectItem value="healthcare">{t('join.orgTypes.healthcare')}</SelectItem>
                            <SelectItem value="other">{t('join.orgTypes.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.municipality')}
                        </label>
                        <Input
                          value={formData.municipality}
                          onChange={(e) => handleInputChange('municipality', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.address')}
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.locationNotes')}
                        </label>
                        <Textarea
                          value={formData.locationNotes}
                          onChange={(e) => handleInputChange('locationNotes', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Persona de contacto */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.contactPerson')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.contactName')} *
                        </label>
                        <Input
                          required
                          value={formData.contactPerson}
                          onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.role')}
                        </label>
                        <Input
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>
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
                        />
                      </div>
                    </div>
                  </div>

                  {/* Participantes */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.participants')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.participantProfile')}
                        </label>
                        <Select onValueChange={(v) => handleInputChange('participantProfile', v as ParticipantProfile)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.participantProfile')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="children">{t('join.participantProfiles.children')}</SelectItem>
                            <SelectItem value="teens">{t('join.participantProfiles.teens')}</SelectItem>
                            <SelectItem value="adults">{t('join.participantProfiles.adults')}</SelectItem>
                            <SelectItem value="seniors">{t('join.participantProfiles.seniors')}</SelectItem>
                            <SelectItem value="mixed">{t('join.participantProfiles.mixed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.ageRange')}
                        </label>
                        <Input
                          placeholder="8–12 / 13–17 / 60+ …"
                          value={formData.ageRange}
                          onChange={(e) => handleInputChange('ageRange', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.numParticipants')}
                        </label>
                        <Input
                          type="number"
                          min={1}
                          value={formData.numParticipants}
                          onChange={(e) => handleInputChange('numParticipants', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.specialNeeds')}
                        </label>
                        <Textarea
                          value={formData.specialNeeds}
                          onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          rows={2}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.accessibility')}
                        </label>
                        <Textarea
                          value={formData.accessibility}
                          onChange={(e) => handleInputChange('accessibility', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Planificación */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.scheduling')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.preferredDays')}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {dayOptions.map(d => (
                            <label key={d.key} className="flex items-center space-x-2 text-sm">
                              <Checkbox
                                checked={formData.preferredDays.includes(d.key)}
                                onCheckedChange={(checked) => togglePreferredDay(d.key, !!checked)}
                              />
                              <span>{d.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.preferredTime')}
                        </label>
                        <Select onValueChange={(v) => handleInputChange('preferredTime', v as TimeSlot)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.preferredTime')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="morning">{t('join.timeSlots.morning')}</SelectItem>
                            <SelectItem value="afternoon">{t('join.timeSlots.afternoon')}</SelectItem>
                            <SelectItem value="evening">{t('join.timeSlots.evening')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.frequencyPerWeek')}
                        </label>
                        <Select onValueChange={(v) => handleInputChange('frequencyPerWeek', v)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.frequencyPerWeek')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.sessionDuration')}
                        </label>
                        <Select onValueChange={(v) => handleInputChange('sessionDuration', v)}>
                          <SelectTrigger className="bg-card border-border text-foreground focus:ring-0">
                            <SelectValue placeholder={t('join.sessionDuration')} />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border text-foreground">
                            <SelectItem value="45">45 min</SelectItem>
                            <SelectItem value="60">60 min</SelectItem>
                            <SelectItem value="90">90 min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.startDate')}
                        </label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="bg-card border-border text-foreground focus:border-accent focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Espacio y material */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.spaceEquipment')}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={formData.tablesAvailable}
                          onCheckedChange={(checked) => handleInputChange('tablesAvailable', !!checked)}
                        />
                        <span className="text-sm">{t('join.tablesAvailable')}</span>
                      </label>

                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={formData.spaceAvailable}
                          onCheckedChange={(checked) => handleInputChange('spaceAvailable', !!checked)}
                        />
                        <span className="text-sm">{t('join.spaceAvailable')}</span>
                      </label>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                          {t('join.equipmentNotes')}
                        </label>
                        <Textarea
                          value={formData.equipmentNotes}
                          onChange={(e) => handleInputChange('equipmentNotes', e.target.value)}
                          className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Objetivos / notas */}
                  <div>
                    <h3 className="text-foreground font-semibold text-lg mb-4">{t('join.objectives')}</h3>
                    <Textarea
                      value={formData.objectives}
                      onChange={(e) => handleInputChange('objectives', e.target.value)}
                      className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                      rows={3}
                      placeholder={t('join.objectivesPlaceholder')}
                    />
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground/80 mb-2">
                        {t('join.notes')}
                      </label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="bg-card border-border text-foreground placeholder-foreground/40 focus:border-accent focus-visible:ring-0"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
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
                        onCheckedChange={(checked) => handleInputChange('agreeNewsletter', !!checked)}
                        className="border-foreground/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <label htmlFor="newsletter" className="text-sm text-foreground/85">
                        {t('join.agreeNewsletter')}
                      </label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={!formData.agreeTerms || submitting}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? t('contact.sending') : t('join.submitApplication')}
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

        {/* Beneficios (puedes mantenerlos o adaptarlos al dossier) */}
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
