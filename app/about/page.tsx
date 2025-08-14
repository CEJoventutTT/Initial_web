'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Heart, Target, Users, Trophy, Calendar } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: 'Years of Excellence', value: '16',  icon: Calendar },
    { label: 'Active Members',      value: '250+',icon: Users },
    { label: 'Tournaments Won',     value: '45+', icon: Trophy },
    { label: 'Training Programs',   value: '8',   icon: Target }
  ]

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for the highest standards in training, competition, and sportsmanship.',
      icon: Award
    },
    {
      title: 'Community',
      description: 'Building lasting friendships and supporting each other through our shared passion.',
      icon: Heart
    },
    {
      title: 'Growth',
      description: 'Continuous improvement and personal development for players of all levels.',
      icon: Target
    }
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-brand-green via-brand-teal to-brand-green">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">About Thunder TT Club</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              Founded in 1995, we've been the premier destination for table tennis excellence,
              fostering champions and building community through the beautiful game.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-black text-white mb-6">Our Story</h2>
                <div className="space-y-5 text-white/85 text-lg leading-relaxed font-thin">
                  <p>
                    Thunder TT Club was born from a simple vision: to create a space where table tennis
                    enthusiasts of all levels could come together, learn, and grow. What started as a
                    small group of passionate players in 1995 has evolved into one of the region&apos;s most
                    respected table tennis institutions.
                  </p>
                  <p>
                    Our founders, former national champions Sarah and Michael Chen, believed that table
                    tennis was more than just a sport—it was a way to build character, discipline, and
                    lifelong friendships. This philosophy continues to guide us today.
                  </p>
                  <p>
                    Over the years, we&apos;ve produced numerous regional and national champions, but we&apos;re
                    equally proud of the recreational players who&apos;ve found joy, fitness, and community
                    within our walls.
                  </p>
                </div>
              </div>

              <div className="relative">
                <img
                  src="/logo.png"
                  alt="logo CE Joventut TT"
                  className="rounded-lg w-full h-auto border border-white/10 bg-white/5 p-6"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Our Values</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto font-thin">
                These core principles guide everything we do at Thunder TT Club
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon
                return (
                  <Card key={index} className="bg-brand-dark border border-white/10 text-center">
                    <CardHeader>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/15 bg-brand-teal/25">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl font-semibold">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 font-thin">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
