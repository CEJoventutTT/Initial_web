'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock login - simulate API call
    setTimeout(() => {
      console.log('Login attempt:', formData)
      
      // Mock successful login
      if (formData.email && formData.password) {
        // In a real app, you'd validate credentials and set auth tokens
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', formData.email)
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        alert('Please fill in all fields')
      }
      
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Sign in to your Thunder TT Club account to access your dashboard, track progress, and connect with the community.
            </p>
          </div>
        </section>

        {/* Login Form */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Sign In</CardTitle>
                <CardDescription className="text-gray-300">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <label htmlFor="remember" className="text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold disabled:opacity-50"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link href="/join" className="text-orange-400 hover:text-orange-300 font-medium">
                      Join Thunder TT Club
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <h4 className="text-white font-medium text-sm mb-2">Demo Credentials:</h4>
                  <div className="text-gray-300 text-xs space-y-1">
                    <p>Email: demo@thundertt.com</p>
                    <p>Password: demo123</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        email: 'demo@thundertt.com',
                        password: 'demo123',
                        rememberMe: false
                      })
                    }}
                    className="mt-2 w-full border-gray-600 text-gray-300 hover:bg-gray-600 text-xs"
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Access Your Member Dashboard</h2>
              <p className="text-gray-300">Once logged in, you'll have access to:</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-400 text-sm">Monitor your XP, level, and training statistics</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">🏆</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Achievements</h3>
                <p className="text-gray-400 text-sm">Unlock badges and track your accomplishments</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">📅</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Session Logging</h3>
                <p className="text-gray-400 text-sm">Log training sessions and track your progress</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
