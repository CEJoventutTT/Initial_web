'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
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

    try {
      const result = await emailjs.send(
        'service_10y7taj', // tu Service ID
        'template_sj2ux1g', // tu Template ID
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        },
        'FFvWCj8eY0NVgjjep' // tu Public Key
      )

      console.log('EmailJS result:', result.text)
      alert('✅ Tu mensaje ha sido enviado con éxito. Te responderemos en menos de 24h.')
      setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      console.error('EmailJS error:', error)
      alert('❌ Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('contact.title')}</h2>
          <p className="text-white/80 text-lg font-thin">{t('contact.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Columna izquierda: info + mapa */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6 flex items-start">
                  <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('contact.address')}</h3>
                    <p className="text-white/70 text-sm font-thin">
                      C.P. L'Urgell | Avinguda del Diputat Josep Ribas, s/n <br /> 07830 Sant Josep de sa Talaia, Illes Balears
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6 flex items-start">
                  <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('contact.phone')}</h3>
                    <p className="text-white/70 text-sm font-thin">+34 644 978 857</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6 flex items-start">
                  <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('contact.email')}</h3>
                    <p className="text-white/70 text-sm font-thin">ce.joventut.tt@gmail.com</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-dark border border-white/10">
                <CardContent className="p-6 flex items-start">
                  <div className="bg-brand-teal/25 p-3 rounded-lg mr-4 border border-white/10">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{t('contact.hours')}</h3>
                    <p className="text-white/70 text-sm font-thin">
                      Mon-Fri: 6AM-10PM<br />Sat-Sun: 8AM-8PM
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

{/* Map */}
<Card className="bg-brand-dark border border-white/10">
  <CardContent className="p-0">
    <div className="h-64 rounded-lg overflow-hidden">
      <iframe
        title="Club Esportiu Joventut Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.1939318490176!2d1.302067774867495!3d38.91954467171931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129946b9e686a4ab%3A0x8c31162d212170ec!2sC.P.%20L'Urgell!5e0!3m2!1ses-419!2ses!4v1755185883113!5m2!1ses-419!2ses"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  </CardContent>
</Card>
            {/* Redes sociales */}
            <div className="text-center">
              <h3 className="text-white font-medium mb-4">{t('contact.followUs')}</h3>
              <div className="flex justify-center gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/80 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: formulario */}
          <Card className="bg-brand-dark border border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-medium">{t('contact.sendMessage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder={t('contact.firstName')}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal"
                  />
                  <Input
                    required
                    placeholder={t('contact.lastName')}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal"
                  />
                </div>
                <Input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal"
                />
                <Input
                  type="tel"
                  placeholder={t('contact.phone')}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal"
                />
                <Input
                  required
                  placeholder={t('contact.subject')}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal"
                />
                <Textarea
                  required
                  placeholder={t('contact.message')}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal min-h-[120px]"
                />
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
