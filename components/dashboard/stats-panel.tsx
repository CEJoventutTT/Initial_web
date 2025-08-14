import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react'

export default function StatsPanel() {
  const currentXP = 2450
  const nextLevelXP = 3000
  const progressPercentage = (currentXP / nextLevelXP) * 100

  const stats = [
    { title: 'Current Level',     value: '7',                   subtitle: 'Intermediate Pro',             icon: Target,     color: '#BF0F30' },
    { title: 'Total XP',          value: currentXP.toLocaleString(), subtitle: `${nextLevelXP - currentXP} to next level`, icon: Zap,        color: '#2C6DFF' },
    { title: 'Training Sessions', value: '47',                  subtitle: 'This month: 12',              icon: Calendar,   color: '#5D8C87' },
    { title: 'Win Rate',          value: '73%',                 subtitle: '+5% from last month',         icon: TrendingUp, color: '#6BBFA0' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Progress</h2>

      {/* XP Progress */}
      <Card className="bg-[#262425] border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Level 7 Progress</h3>
              <p className="text-white/70">Intermediate Pro</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: '#BF0F30' }}>{currentXP}</div>
              <div className="text-sm text-white/60">/ {nextLevelXP} XP</div>
            </div>
          </div>

          {/* Barra de progreso con color de marca */}
          <div className="w-full h-3 rounded bg-white/10 overflow-hidden mb-2">
            <div
              className="h-full rounded"
              style={{ width: `${progressPercentage}%`, backgroundColor: '#BF0F30' }}
            />
          </div>

          <p className="text-sm text-white/60">
            {nextLevelXP - currentXP} XP needed to reach Level 8
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card
              key={index}
              className="bg-[#262425] border-white/10 hover:border-white/20 transition-colors duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8" style={{ color: stat.color }} />
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
