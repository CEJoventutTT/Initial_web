import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, Zap, Clock, MapPin, DollarSign } from 'lucide-react'

export default function TrainingsPage() {
  const programs = [
    {
      title: 'Beginner Level',
      description: 'Perfect for newcomers to table tennis. Learn basic techniques, rules, and develop fundamental skills.',
      icon: Users,
      schedule: [
        { day: 'Monday', time: '6:00 PM - 7:30 PM' },
        { day: 'Wednesday', time: '6:00 PM - 7:30 PM' },
        { day: 'Friday', time: '6:00 PM - 7:30 PM' }
      ],
      price: '$80/month',
      features: [
        'Basic stroke techniques',
        'Game rules and scoring',
        'Equipment guidance',
        'Fun group activities',
        'Beginner-friendly environment'
      ],
      coach: 'Coach Maria Rodriguez',
      maxStudents: 12
    },
    {
      title: 'Competition Level',
      description: 'Advanced training for competitive players. Focus on strategy, advanced techniques, and tournament preparation.',
      icon: Trophy,
      schedule: [
        { day: 'Tuesday', time: '7:00 PM - 9:00 PM' },
        { day: 'Thursday', time: '7:00 PM - 9:00 PM' },
        { day: 'Saturday', time: '2:00 PM - 4:00 PM' }
      ],
      price: '$120/month',
      features: [
        'Advanced techniques',
        'Match strategy',
        'Tournament preparation',
        'Video analysis',
        'Individual coaching'
      ],
      coach: 'Coach David Chen',
      maxStudents: 8
    },
    {
      title: 'Adults Program',
      description: 'Flexible training sessions designed for working adults. Improve fitness while learning table tennis skills.',
      icon: Zap,
      schedule: [
        { day: 'Saturday', time: '10:00 AM - 11:30 AM' },
        { day: 'Sunday', time: '10:00 AM - 11:30 AM' },
        { day: 'Sunday', time: '2:00 PM - 3:30 PM' }
      ],
      price: '$90/month',
      features: [
        'Flexible scheduling',
        'Fitness focused',
        'Social matches',
        'Stress relief',
        'Adult-only environment'
      ],
      coach: 'Coach Lisa Park',
      maxStudents: 10
    }
  ]

  const specialPrograms = [
    {
      title: 'Youth Development',
      description: 'Specialized program for young talents aged 8-16',
      schedule: 'Saturdays 9:00 AM - 12:00 PM',
      price: '$100/month'
    },
    {
      title: 'Private Coaching',
      description: 'One-on-one sessions with certified coaches',
      schedule: 'By appointment',
      price: '$60/hour'
    },
    {
      title: 'Corporate Training',
      description: 'Team building sessions for companies',
      schedule: 'Flexible scheduling',
      price: 'Contact for pricing'
    }
  ]

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">Training Programs</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              Discover the perfect training program for your skill level and goals. From beginners to committed players, we have something for everyone.
            </p>
          </div>
        </section>

        {/* Main Programs */}
        <section className="py-20 bg-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Main Programs</h2>
              <p className="text-accent2/90 text-lg">Choose the program that matches your skill level and commitment</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {programs.map((program, index) => {
                const IconComponent = program.icon
                return (
                  <Card
                    key={index}
                    className="bg-white/5 border border-white/10 hover:border-primary transition-colors duration-300"
                  >
                    <CardHeader className="text-center">
                      <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-white text-xl font-semibold">{program.title}</CardTitle>
                      <CardDescription className="text-accent2">
                        {program.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Schedule */}
                      <div>
                        <h4 className="text-primary font-semibold mb-3 flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Schedule
                        </h4>
                        <div className="space-y-2">
                          {program.schedule.map((session, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-accent2">
                              <span>{session.day}</span>
                              <span>{session.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="text-primary font-semibold mb-3">What’s Included</h4>
                        <ul className="text-accent2 text-sm space-y-1">
                          {program.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-accent2/90">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-accent1" />
                          Max {program.maxStudents} students
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-accent1" />
                          Coach: {program.coach}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-primary font-bold text-lg">
                            <DollarSign className="mr-1 h-5 w-5" />
                            {program.price.replace('$', '')}
                          </div>
                        </div>
                        <Button className="w-full bg-primary hover:opacity-90 text-white font-semibold">
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Special Programs */}
        <section className="py-20 bg-white/5 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white mb-4">Special Programs</h2>
              <p className="text-accent2/90 text-lg">Additional training options for specific needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {specialPrograms.map((program, index) => (
                <Card key={index} className="bg-dark/70 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">{program.title}</CardTitle>
                    <CardDescription className="text-accent2">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-accent2/90">
                        <Clock className="mr-2 h-4 w-4 text-accent1" />
                        {program.schedule}
                      </div>
                      <div className="flex items-center text-primary font-semibold">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {program.price}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
