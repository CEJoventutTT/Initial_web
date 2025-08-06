'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Trophy, Zap, Check, Star, Clock, MapPin, DollarSign } from 'lucide-react'

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
      price: '$60',
      period: '/month',
      icon: Users,
      popular: false,
      features: [
        'Access to all facilities during off-peak hours',
        'Basic group training sessions',
        'Equipment rental included',
        'Locker room access',
        'Monthly social events'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Membership',
      price: '$90',
      period: '/month',
      icon: Trophy,
      popular: true,
      features: [
        'Unlimited facility access',
        'All group training sessions',
        '2 private coaching sessions/month',
        'Priority court booking',
        'Tournament entry discounts',
        'Nutrition consultation',
        'Guest passes (2/month)'
      ]
    },
    {
      id: 'elite',
      name: 'Elite Membership',
      price: '$150',
      period: '/month',
      icon: Zap,
      popular: false,
      features: [
        'All Premium features',
        'Unlimited private coaching',
        'Personal training program',
        'Video analysis sessions',
        'Competition team eligibility',
        'Free tournament entries',
        'Unlimited guest passes',
        'Exclusive elite events'
      ]
    }
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Membership application submitted:', { ...formData, plan: selectedPlan })
    // Here you would typically send the data to your backend
    alert('Thank you for your application! We will contact you within 24 hours.')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Join Thunder TT Club</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Take your table tennis journey to the next level. Choose the membership plan that fits your goals and start training with the best.
            </p>
          </div>
        </section>

        {/* Membership Plans */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
              <p className="text-gray-300 text-lg">Select the membership that matches your commitment and goals</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {membershipPlans.map((plan) => {
                const IconComponent = plan.icon
                return (
                  <Card 
                    key={plan.id}
                    className={`relative bg-gray-800 border-2 transition-all duration-300 cursor-pointer ${
                      selectedPlan === plan.id 
                        ? 'border-orange-500 bg-orange-500/5' 
                        : 'border-gray-700 hover:border-orange-500/50'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                          <Star className="mr-1 h-3 w-3" />
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-orange-400">{plan.price}</span>
                        <span className="text-gray-400 ml-1">{plan.period}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="text-center">
                        <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                          selectedPlan === plan.id 
                            ? 'bg-orange-500 border-orange-500' 
                            : 'border-gray-400'
                        }`}>
                          {selectedPlan === plan.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
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
        <section className="py-20 bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Complete Your Application</h2>
              <p className="text-gray-300 text-lg">Fill out the form below to join Thunder TT Club</p>
            </div>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Membership Application</CardTitle>
                <CardDescription className="text-gray-300">
                  Selected Plan: <span className="text-orange-400 font-semibold">
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name *
                        </label>
                        <Input
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name *
                        </label>
                        <Input
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Table Tennis Experience
                        </label>
                        <Select onValueChange={(value) => handleInputChange('experience', value)}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                            <SelectItem value="expert">Expert (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Goals and Expectations
                        </label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => handleInputChange('goals', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Emergency Contact Name *
                        </label>
                        <Input
                          required
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Emergency Contact Phone *
                        </label>
                        <Input
                          type="tel"
                          required
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                          placeholder="+1 (555) 987-6543"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                        I agree to the <span className="text-orange-400 hover:underline cursor-pointer">Terms and Conditions</span> and <span className="text-orange-400 hover:underline cursor-pointer">Privacy Policy</span> of Thunder TT Club. *
                      </label>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="newsletter"
                        checked={formData.agreeNewsletter}
                        onCheckedChange={(checked) => handleInputChange('agreeNewsletter', checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <label htmlFor="newsletter" className="text-sm text-gray-300">
                        I would like to receive newsletters and updates about club events and activities.
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!formData.agreeTerms}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Application
                    </Button>
                    <p className="text-center text-gray-400 text-sm mt-4">
                      We'll review your application and contact you within 24 hours.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Join Thunder TT Club?</h2>
              <p className="text-gray-300 text-lg">Experience the benefits of being part of our community</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Expert Coaching</h3>
                <p className="text-gray-300">
                  Learn from certified coaches with years of competitive experience and proven training methods.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Modern Facilities</h3>
                <p className="text-gray-300">
                  Train in our state-of-the-art facility with professional equipment and optimal playing conditions.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Competitive Opportunities</h3>
                <p className="text-gray-300">
                  Participate in tournaments, leagues, and competitions to test your skills and achieve your goals.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
