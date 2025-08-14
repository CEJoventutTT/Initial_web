import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock } from 'lucide-react'

export default function WelcomeSection() {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Card className="bg-gradient-to-r from-brand-green via-brand-teal to-brand-green border-none">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src="/placeholder.svg?height=80&width=80"
                alt="Profile"
                className="w-20 h-20 rounded-full border-4 border-white/20"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#6BBFA0] w-6 h-6 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, Alex Chen! 👋
              </h1>
              <p className="text-white/90 text-lg">Ready for another great training session?</p>
            </div>
          </div>

          <div className="hidden md:block text-right">
            <div className="flex items-center text-white/90 mb-2">
              <Calendar className="mr-2 h-4 w-4" />
              {currentDate}
            </div>
            <div className="flex items-center text-white/90">
              <Clock className="mr-2 h-4 w-4" />
              {currentTime}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
