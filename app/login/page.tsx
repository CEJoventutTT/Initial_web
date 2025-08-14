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
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      if (formData.email && formData.password) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', formData.email)
        router.push('/dashboard')
      } else {
        alert('Please fill in all fields')
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-brand-green via-brand-teal to-brand-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full border border-white/25">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-4">Welcome Back</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-thin">
              Sign in to access your dashboard, track progress, and connect with the community.
            </p>
          </div>
        </section>

        {/* Login Form */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-brand-dark border border-white/10">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl font-semibold">Sign In</CardTitle>
                <CardDescription className="text-white/80">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-brand-teal focus-visible:ring-0 pr-10"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-brand-teal data-[state=checked]:border-brand-teal"
                      />
                      <label htmlFor="remember" className="text-sm text-white/85">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-brand-teal hover:text-brand-teal/80">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-red hover:bg-brand-red/90 text-white py-3 font-semibold disabled:opacity-50"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                {/* Sign up link */}
                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/join" className="text-brand-teal hover:text-brand-teal/80 font-medium">
                      Join Club Esportiu Joventut
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-white font-medium text-sm mb-2">Demo Credentials:</h4>
                  <div className="text-white/85 text-xs space-y-1">
                    <p>Email: demo@cejoventut.com</p>
                    <p>Password: demo123</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({ email: 'demo@cejoventut.com', password: 'demo123', rememberMe: false })
                    }
                    className="mt-2 w-full border-white/20 text-white/85 hover:bg-white/10 text-xs"
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white mb-3">Access Your Member Dashboard</h2>
              <p className="text-white/80">Once logged in, you&apos;ll have access to:</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Progress Tracking</h3>
                <p className="text-white/80 text-sm">Monitor your XP, level, and training statistics</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                  <span className="text-white font-bold">🏆</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Achievements</h3>
                <p className="text-white/80 text-sm">Unlock badges and track your accomplishments</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                  <span className="text-white font-bold">📅</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Session Logging</h3>
                <p className="text-white/80 text-sm">Log training sessions and track your progress</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
