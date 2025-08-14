'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Trophy, Zap, Check, Star, Clock, MapPin } from 'lucide-react'

export default function JoinPage() {
  const [selectedPlan, setSelectedPlan] = useState('basic')
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

  const membershipPlans = [
    {
      id: 'basic',
      name: 'Basic Membership',
      price: '29€',
      period: '/mes',
      icon: Users,
      popular: false,
      features: [
        'Acceso a instalaciones en horario estándar',
        'Sesiones grupales básicas',
        'Material incluido (básico)',
        'Taquillas',
        'Eventos sociales mensuales'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Membership',
      price: '39€',
      period: '/mes',
      icon: Trophy,
      popular: true,
      features: [
        'Acceso ilimitado a instalaciones',
        'Todas las sesiones grupales',
        '1 sesión privada/mes',
        'Reserva prioritaria',
        'Descuentos en torneos',
        'Asesoría básica de nutrición',
        '2 pases de invitado/mes'
      ]
    },
    {
      id: 'elite',
      name: 'Elite Membership',
      price: '49€',
      period: '/mes',
      icon: Zap,
      popular: false,
      features: [
        'Todo lo de Premium',
        '2 sesiones privadas/mes',
        'Plan de entrenamiento personalizado',
        'Sesiones de video-análisis',
        'Elegibilidad equipo competición',
        'Entradas a torneos del club',
        'Pases de invitado ampliados',
        'Eventos exclusivos'
      ]
    }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Membership application submitted:', { ...formData, plan: selectedPlan })
    alert('Thank you for your application! We will contact you within 24 hours.')
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-brand-green via-brand-teal to-brand-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">Join Club Esportiu Joventut</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              Elige el plan que encaje contigo y empieza a entrenar con un equipo experto y un ambiente motivador.
            </p>
          </div>
        </section>

        {/* Membership Plans */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Choose Your Plan</h2>
              <p className="text-white/80 text-lg">Selecciona la membresía que mejor se ajuste a tus objetivos</p>
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
                        <div className="bg-brand-red text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                          <Star className="mr-1 h-3 w-3" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-black text-brand-teal">{plan.price}</span>
                        <span className="text-white/70 ml-1">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-brand-teal mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-white/85 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="text-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mx-auto ${
                            active ? 'bg-brand-teal border-brand-teal' : 'border-white/40'
                          }`}
                        >
                          {active && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                        </div>
                      </div>
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
              <h2 className="text-4xl font-black text-white mb-4">Complete Your Application</h2>
              <p className="text-white/80 text-lg">Rellena el formulario para unirte al club</p>
            </div>

            <Card className="bg-brand-dark border border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Membership Application</CardTitle>
                <CardDescription className="text-white/80">
                  Selected Plan:{' '}
                  <span className="text-brand-teal font-semibold">
                    {membershipPlans.find(p => p.id === selectedPlan)?.name}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">First Name *</label>
                        <Input
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Last Name *</label>
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
                    <h3 className="text-white font-semibold text-lg mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email Address *</label>
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
                        <label className="block text-sm font-medium text-white/80 mb-2">Phone Number *</label>
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
                    <h3 className="text-white font-semibold text-lg mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Date of Birth *</label>
                        <Input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="bg-white/5 border-white/10 text-white focus:border-brand-teal focus-visible:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Table Tennis Experience</label>
                        <Select onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-0">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-brand-dark border border-white/10 text-white">
                            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                            <SelectItem value="expert">Expert (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Goals and Expectations</label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => handleInputChange('goals', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="Tell us about your table tennis goals and what you hope to achieve..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4">Emergency Contact</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Emergency Contact Name *</label>
                        <Input
                          required
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Emergency Contact Phone *</label>
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
                        I agree to the <span className="text-brand-teal hover:underline cursor-pointer">Terms and Conditions</span> and <span className="text-brand-teal hover:underline cursor-pointer">Privacy Policy</span> of the Club. *
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
                        I would like to receive newsletters and updates about club events and activities.
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
                      Submit Application
                    </Button>
                    <p className="text-center text-white/70 text-sm mt-4">
                      We'll review your application and contact you within 24 hours.
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
              <h2 className="text-4xl font-black text-white mb-4">Why Join Club Esportiu Joventut?</h2>
              <p className="text-white/80 text-lg">Beneficios de formar parte de nuestra comunidad</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Expert Coaching</h3>
                <p className="text-white/80">
                  Aprende con entrenadores con experiencia competitiva y métodos probados.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Modern Facilities</h3>
                <p className="text-white/80">
                  Entrena con material profesional y condiciones óptimas de juego.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/15 bg-brand-teal/25">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Competitive Opportunities</h3>
                <p className="text-white/80">
                  Participa en ligas y torneos y sigue progresando a tu ritmo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
