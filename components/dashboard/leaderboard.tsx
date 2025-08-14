import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Leaderboard() {
  const leaderboard = [
    { rank: 1, name: 'Sarah Chen',  avatar: '/placeholder.svg?height=40&width=40', points: 3250, change: 'up',   isCurrentUser: false },
    { rank: 2, name: 'Mike Johnson',avatar: '/placeholder.svg?height=40&width=40', points: 3100, change: 'down', isCurrentUser: false },
    { rank: 3, name: 'Alex Chen',   avatar: '/placeholder.svg?height=40&width=40', points: 2450, change: 'up',   isCurrentUser: true  },
    { rank: 4, name: 'Emma Wilson', avatar: '/placeholder.svg?height=40&width=40', points: 2380, change: 'same', isCurrentUser: false },
    { rank: 5, name: 'David Lee',   avatar: '/placeholder.svg?height=40&width=40', points: 2200, change: 'up',   isCurrentUser: false },
    { rank: 6, name: 'Lisa Park',   avatar: '/placeholder.svg?height=40&width=40', points: 2150, change: 'down', isCurrentUser: false }
  ]

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':   return <TrendingUp className="h-4 w-4 text-[#6BBFA0]" />
      case 'down': return <TrendingDown className="h-4 w-4 text-[#BF0F30]" />
      default:     return <Minus className="h-4 w-4 text-white/50" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-[#6BBFA0]' // “oro” → usamos mint (success)
      case 2: return 'text-white/80'
      case 3: return 'text-[#5D8C87]'
      default: return 'text-white/60'
    }
  }

  return (
    <Card className="bg-[#262425] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Crown className="mr-2 h-5 w-5 text-white/80" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                player.isCurrentUser 
                  ? 'bg-[#BF0F30]/10 border border-[#BF0F30]/30' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-lg font-bold w-6 text-center ${getRankColor(player.rank)}`}>
                  {player.rank === 1 ? <Crown className="h-5 w-5" /> : player.rank}
                </div>

                <div className="relative">
                  <img
                    src={player.avatar || "/placeholder.svg"}
                    alt={player.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {player.isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 bg-[#BF0F30] w-4 h-4 rounded-full border-2 border-[#262425]" />
                  )}
                </div>

                <div>
                  <div className={`font-medium ${player.isCurrentUser ? 'text-[#BF0F30]' : 'text-white'}`}>
                    {player.name}
                    {player.isCurrentUser && <span className="text-xs text-[#BF0F30] ml-2">(You)</span>}
                  </div>
                  <div className="text-sm text-white/70">
                    {player.points.toLocaleString()} XP
                  </div>
                </div>
              </div>

              <div className="flex items-center">{getChangeIcon(player.change)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">Updated every hour • Season ends in 45 days</p>
        </div>
      </CardContent>
    </Card>
  )
}
