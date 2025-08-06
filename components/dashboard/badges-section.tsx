import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Flame, Target, Users, Calendar, Award, Zap } from 'lucide-react'

export default function BadgesSection() {
  const badges = [
    {
      name: 'First Victory',
      description: 'Won your first match',
      icon: Trophy,
      unlocked: true,
      rarity: 'common'
    },
    {
      name: 'Training Streak',
      description: '7 days in a row',
      icon: Flame,
      unlocked: true,
      rarity: 'rare'
    },
    {
      name: 'Perfect Serve',
      description: '10 aces in one match',
      icon: Target,
      unlocked: true,
      rarity: 'epic'
    },
    {
      name: 'Team Player',
      description: 'Played 20 doubles matches',
      icon: Users,
      unlocked: true,
      rarity: 'common'
    },
    {
      name: 'Monthly Champion',
      description: 'Top player this month',
      icon: Star,
      unlocked: false,
      rarity: 'legendary'
    },
    {
      name: 'Dedication',
      description: '100 training sessions',
      icon: Calendar,
      unlocked: false,
      rarity: 'rare'
    },
    {
      name: 'Tournament Winner',
      description: 'Won a tournament',
      icon: Award,
      unlocked: false,
      rarity: 'epic'
    },
    {
      name: 'Speed Demon',
      description: 'Fastest serve record',
      icon: Zap,
      unlocked: false,
      rarity: 'legendary'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10'
      case 'rare': return 'border-blue-500 bg-blue-500/10'
      case 'epic': return 'border-purple-500 bg-purple-500/10'
      case 'legendary': return 'border-orange-500 bg-orange-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="mr-2 h-5 w-5 text-orange-500" />
          Badges ({badges.filter(b => b.unlocked).length}/{badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge, index) => {
            const IconComponent = badge.icon
            return (
              <div
                key={index}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  badge.unlocked 
                    ? `${getRarityColor(badge.rarity)} hover:scale-105` 
                    : 'border-gray-700 bg-gray-700/20 opacity-50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    badge.unlocked ? 'bg-orange-500' : 'bg-gray-600'
                  }`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{badge.name}</h4>
                  <p className="text-gray-400 text-xs">{badge.description}</p>
                </div>
                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
