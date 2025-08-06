import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react'

export default function StatsPanel() {
  const currentXP = 2450
  const nextLevelXP = 3000
  const progressPercentage = (currentXP / nextLevelXP) * 100

  const stats = [
    {
      title: 'Current Level',
      value: '7',
      subtitle: 'Intermediate Pro',
      icon: Target,
      color: 'text-orange-400'
    },
    {
      title: 'Total XP',
      value: currentXP.toLocaleString(),
      subtitle: `${nextLevelXP - currentXP} to next level`,
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      title: 'Training Sessions',
      value: '47',
      subtitle: 'This month: 12',
      icon: Calendar,
      color: 'text-blue-400'
    },
    {
      title: 'Win Rate',
      value: '73%',
      subtitle: '+5% from last month',
      icon: TrendingUp,
      color: 'text-green-400'
    }
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Your Progress</h2>
      
      {/* XP Progress Bar */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Level 7 Progress</h3>
              <p className="text-gray-400">Intermediate Pro</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">{currentXP}</div>
              <div className="text-sm text-gray-400">/ {nextLevelXP} XP</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3 mb-2" />
          <p className="text-sm text-gray-400">
            {nextLevelXP - currentXP} XP needed to reach Level 8
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400 mb-2">{stat.title}</div>
                <div className="text-xs text-gray-500">{stat.subtitle}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
