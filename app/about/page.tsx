import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Heart, Target, Users, Trophy, Calendar } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { label: 'Years of Excellence', value: '16', icon: Calendar },
    { label: 'Active Members', value: '250+', icon: Users },
    { label: 'Tournaments Won', value: '45+', icon: Trophy },
    { label: 'Training Programs', value: '8', icon: Target }
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">About Thunder TT Club</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Founded in 1995, we've been the premier destination for table tennis excellence, 
              fostering champions and building community through the beautiful game.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-300">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                  <p>
                    Thunder TT Club was born from a simple vision: to create a space where table tennis 
                    enthusiasts of all levels could come together, learn, and grow. What started as a 
                    small group of passionate players in 1995 has evolved into one of the region's most 
                    respected table tennis institutions.
                  </p>
                  <p>
                    Our founders, former national champions Sarah and Michael Chen, believed that table 
                    tennis was more than just a sport—it was a way to build character, discipline, and 
                    lifelong friendships. This philosophy continues to guide us today.
                  </p>
                  <p>
                    Over the years, we've produced numerous regional and national champions, but we're 
                    equally proud of the recreational players who've found joy, fitness, and community 
                    within our walls.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="logo CE Joventut TT"
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                These core principles guide everything we do at Thunder TT Club
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon
                return (
                  <Card key={index} className="bg-gray-900 border-gray-700 text-center">
                    <CardHeader>
                      <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{value.description}</p>
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
