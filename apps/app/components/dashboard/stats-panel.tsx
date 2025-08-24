import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react'

export default function StatsPanel({
  totalXP,
  xpByType
}: {
  totalXP: number
  xpByType: Array<{ type:string; xp:number }>
}) {
  const level = Math.floor(totalXP / 100)
  const nextLevelXP = (level + 1) * 100
  const currentXP = totalXP
  const progressPercentage = Math.min(100, (currentXP / nextLevelXP) * 100)

  const stats = [
    { title: 'Current Level', value: String(level), subtitle: 'Keep going!',  icon: Target,     color: '#BF0F30' },
    { title: 'Total XP',      value: currentXP.toLocaleString(), subtitle: `${nextLevelXP - currentXP} to next level`, icon: Zap,        color: '#2C6DFF' },
    // Puedes derivar otras métricas si quieres:
    { title: 'Training Logs', value: (xpByType.find(x=>x.type==='training_log')?.xp ?? 0).toString(), subtitle: 'XP from logs', icon: Calendar,   color: '#5D8C87' },
    { title: 'Trend',         value: '—', subtitle: 'Coming soon', icon: TrendingUp, color: '#6BBFA0' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Progress</h2>
      <Card className="bg-[#262425] border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Level {level} Progress</h3>
              <p className="text-white/70">XP to next level</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: '#BF0F30' }}>{currentXP}</div>
              <div className="text-sm text-white/60">/ {nextLevelXP} XP</div>
            </div>
          </div>

          <div className="w-full h-3 rounded bg-white/10 overflow-hidden mb-2">
            <div className="h-full rounded" style={{ width: `${progressPercentage}%`, backgroundColor: '#BF0F30' }} />
          </div>

          <p className="text-sm text-white/60">
            {nextLevelXP - currentXP} XP needed to reach Level {level + 1}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="bg-[#262425] border-white/10 hover:border-white/20 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="h-8 w-8" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/70 mb-2">{stat.title}</div>
                <div className="text-xs text-white/50">{stat.subtitle}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
