import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Star, Flame, Target, Users, Calendar, Award, Zap } from 'lucide-react'

export default function BadgesSection() {
  const badges = [
    { name: 'First Victory', description: 'Won your first match', icon: Trophy, unlocked: true,  rarity: 'common'     },
    { name: 'Training Streak', description: '7 days in a row',   icon: Flame,  unlocked: true,  rarity: 'rare'       },
    { name: 'Perfect Serve',   description: '10 aces in one match', icon: Target, unlocked: true,  rarity: 'epic'       },
    { name: 'Team Player',     description: 'Played 20 doubles matches', icon: Users, unlocked: true,  rarity: 'common'     },
    { name: 'Monthly Champion',description: 'Top player this month', icon: Star,  unlocked: false, rarity: 'legendary' },
    { name: 'Dedication',      description: '100 training sessions', icon: Calendar, unlocked: false, rarity: 'rare'       },
    { name: 'Tournament Winner', description: 'Won a tournament', icon: Award, unlocked: false, rarity: 'epic'       },
    { name: 'Speed Demon',     description: 'Fastest serve record', icon: Zap,   unlocked: false, rarity: 'legendary' }
  ]

  const getRarityClasses = (rarity: string) => {
    switch (rarity) {
      case 'common':    return 'border-white/15 bg-white/5'
      case 'rare':      return 'border-[#2C6DFF] bg-[#2C6DFF]/10'
      case 'epic':      return 'border-[#5D8C87] bg-[#5D8C87]/10'
      case 'legendary': return 'border-[#BF0F30] bg-[#BF0F30]/10'
      default:          return 'border-white/15 bg-white/5'
    }
  }

  return (
    <Card className="bg-[#262425] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="mr-2 h-5 w-5 text-white/80" />
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
                    ? `${getRarityClasses(badge.rarity)} hover:scale-[1.02]` 
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      badge.unlocked ? 'bg-[#BF0F30]' : 'bg-white/10'
                    }`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{badge.name}</h4>
                  <p className="text-white/70 text-xs">{badge.description}</p>
                </div>

                {badge.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-[#6BBFA0] w-4 h-4 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
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
