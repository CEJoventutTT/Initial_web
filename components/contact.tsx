'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function Contact() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    console.log('Contact form submitted:', formData)
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you within 24 hours.')
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('contact.title')}</h2>
          <p className="text-white/80 text-lg font-thin">{t('contact.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information & Map */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.address')}</h3>
                      <p className="text-white/70 text-sm font-thin">
                        123 Sports Avenue<br />Thunder City, TC 12345
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.phone')}</h3>
                      <p className="text-white/70 text-sm font-thin">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.email')}</h3>
                      <p className="text-white/70 text-sm font-thin">info@clubesportiujoventut.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.hours')}</h3>
                      <p className="text-white/70 text-sm font-thin">
                        Mon-Fri: 6AM-10PM<br />Sat-Sun: 8AM-8PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <Card className="bg-brand-dark border border-white/10">
              <CardContent className="p-0">
                <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-brand-teal mx-auto mb-4" />
                    <p className="text-white font-medium">Interactive Map</p>
                    <p className="text-white/70 text-sm font-thin">Club Esportiu Joventut Location</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-white font-medium mb-4">{t('contact.followUs')}</h3>
              <div className="flex justify-center gap-3">
                <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white/80 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-brand-dark border border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-medium">{t('contact.sendMessage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t('contact.firstName')}
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
                      {t('contact.lastName')}
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

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
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
                    {t('contact.phone')}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('contact.subject')}
                  </label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                    placeholder="I'm interested in joining the club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t('contact.message')}
                  </label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0 min-h-[120px]"
                    placeholder="Tell us about your table tennis experience and what you're looking for..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white disabled:opacity-50 font-semibold"
                >
                  {isSubmitting ? t('contact.sending') : t('contact.sendMessageBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
