import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Trophy, Users } from 'lucide-react'

export default function TrainingsActivities() {
  const trainings = [
    {
      title: 'Beginner Level',
      description: 'Perfect for newcomers to table tennis. Learn basic techniques, rules, and develop fundamental skills in a supportive environment.',
      icon: Users,
      features: ['Basic stroke techniques', 'Game rules and scoring', 'Equipment guidance', 'Fun group activities'],
      schedule: 'Mon, Wed, Fri - 6:00 PM'
    },
    {
      title: 'Competition Level',
      description: 'Advanced training for competitive players. Focus on strategy, advanced techniques, and tournament preparation.',
      icon: Trophy,
      features: ['Advanced techniques', 'Match strategy', 'Tournament prep', 'Video analysis'],
      schedule: 'Tue, Thu, Sat - 7:00 PM'
    },
    {
      title: 'Adults Program',
      description: 'Flexible training sessions designed for working adults. Improve fitness while learning table tennis skills.',
      icon: Zap,
      features: ['Flexible scheduling', 'Fitness focused', 'Social matches', 'Stress relief'],
      schedule: 'Weekend sessions available'
    }
  ]

  return (
    <section id="trainings" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Trainings & Activities</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Choose from our comprehensive training programs designed to suit every skill level and schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trainings.map((training, index) => {
            const IconComponent = training.icon
            return (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors duration-300">
                <CardHeader className="text-center">
                  <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl">{training.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-2">What you'll learn:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {training.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-400 text-sm mb-4">
                        <span className="font-semibold">Schedule:</span> {training.schedule}
                      </p>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        See More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
