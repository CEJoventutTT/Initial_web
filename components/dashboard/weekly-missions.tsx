import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Calendar as CalIcon, Trophy, MessageCircle, Zap } from 'lucide-react'

const iconMap: Record<string, any> = {
  attendance_present: CalIcon,
  match_win: Trophy,
  comment_post: MessageCircle,
}

export default function WeeklyMissions({
  missions
}: {
  missions: Array<{ quest_id:number; progress:any; status:string; quests:{ title:string; description:string; xp_reward:number; steps:any } | null }>
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Weekly Missions</h2>
        <div className="flex items-center" style={{ color: '#5D8C87' }}>
          <Zap className="mr-1 h-4 w-4" />
          <span className="text-sm font-medium">Resets weekly</span>
        </div>
      </div>

      <div className="grid gap-4">
        {missions.map((m) => {
          const quest = m.quests
          if (!quest) return null

          // Un solo paso (simple) o el primero de varios
          const step = Array.isArray(quest.steps) ? quest.steps[0] : quest.steps
          const metric = step?.metric ?? 'attendance_present'
          const target = Number(step?.target ?? 1)
          const progress = Number(m.progress?.[metric] ?? 0)
          const completed = progress >= target
          const IconComponent = iconMap[metric] ?? CalIcon
          const pct = Math.min(100, (progress / target) * 100)

          return (
            <Card
              key={m.quest_id}
              className={`bg-[#262425] border transition-all duration-300 ${
                completed ? 'border-[#6BBFA0] bg-[#6BBFA0]/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${completed ? 'bg-[#6BBFA0]' : 'bg-[#BF0F30]'}`}>
                    {completed ? <CheckCircle className="h-6 w-6 text-white" /> : <IconComponent className="h-6 w-6 text-white" />}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{quest.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{quest.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">Progress: {progress}/{target}</span>
                        <span className="font-medium" style={{ color: '#2C6DFF' }}>+{quest.xp_reward} XP</span>
                      </div>

                      <div className="w-full h-2 rounded bg-white/10 overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: completed ? '#6BBFA0' : '#BF0F30' }} />
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
