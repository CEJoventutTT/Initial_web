import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Calendar, Trophy, MessageCircle, Zap } from 'lucide-react'

export default function WeeklyMissions() {
  const missions = [
    { title: 'Attend 2 Training Sessions', description: 'Join any training session this week', progress: 1, target: 2, xpReward: 150, icon: Calendar,      completed: false },
    { title: 'Win 1 Match',               description: 'Victory in any competitive match',    progress: 1, target: 1, xpReward: 200, icon: Trophy,       completed: true  },
    { title: 'Comment on a Post',         description: 'Engage with the community',           progress: 0, target: 1, xpReward: 50,  icon: MessageCircle, completed: false },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Weekly Missions</h2>
        <div className="flex items-center" style={{ color: '#5D8C87' }}>
          <Zap className="mr-1 h-4 w-4" />
          <span className="text-sm font-medium">Resets in 3 days</span>
        </div>
      </div>

      <div className="grid gap-4">
        {missions.map((mission, index) => {
          const IconComponent = mission.icon
          const progressPercentage = (mission.progress / mission.target) * 100

          return (
            <Card
              key={index}
              className={`bg-[#262425] border transition-all duration-300 ${
                mission.completed
                  ? 'border-[#6BBFA0] bg-[#6BBFA0]/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${mission.completed ? 'bg-[#6BBFA0]' : 'bg-[#BF0F30]'}`}>
                      {mission.completed
                        ? <CheckCircle className="h-6 w-6 text-white" />
                        : <IconComponent className="h-6 w-6 text-white" />
                      }
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{mission.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{mission.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/80">Progress: {mission.progress}/{mission.target}</span>
                          <span className="font-medium" style={{ color: '#2C6DFF' }}>+{mission.xpReward} XP</span>
                        </div>

                        {/* progress custom */}
                        <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${progressPercentage}%`,
                              backgroundColor: mission.completed ? '#6BBFA0' : '#BF0F30'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
