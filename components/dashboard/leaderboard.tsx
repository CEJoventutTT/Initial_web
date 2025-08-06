import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Leaderboard() {
  const leaderboard = [
    {
      rank: 1,
      name: 'Sarah Chen',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 3250,
      change: 'up',
      isCurrentUser: false
    },
    {
      rank: 2,
      name: 'Mike Johnson',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 3100,
      change: 'down',
      isCurrentUser: false
    },
    {
      rank: 3,
      name: 'Alex Chen',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 2450,
      change: 'up',
      isCurrentUser: true
    },
    {
      rank: 4,
      name: 'Emma Wilson',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 2380,
      change: 'same',
      isCurrentUser: false
    },
    {
      rank: 5,
      name: 'David Lee',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 2200,
      change: 'up',
      isCurrentUser: false
    },
    {
      rank: 6,
      name: 'Lisa Park',
      avatar: '/placeholder.svg?height=40&width=40',
      points: 2150,
      change: 'down',
      isCurrentUser: false
    }
  ]

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />
      default: return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400'
      case 2: return 'text-gray-300'
      case 3: return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Crown className="mr-2 h-5 w-5 text-orange-500" />
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
                  ? 'bg-orange-500/10 border border-orange-500/30' 
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`text-lg font-bold w-6 text-center ${getRankColor(player.rank)}`}>
                  {player.rank === 1 && <Crown className="h-5 w-5 text-yellow-400" />}
                  {player.rank !== 1 && player.rank}
                </div>
                
                <div className="relative">
                  <img
                    src={player.avatar || "/placeholder.svg"}
                    alt={player.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {player.isCurrentUser && (
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 w-4 h-4 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                
                <div>
                  <div className={`font-medium ${
                    player.isCurrentUser ? 'text-orange-400' : 'text-white'
                  }`}>
                    {player.name}
                    {player.isCurrentUser && (
                      <span className="text-xs text-orange-400 ml-2">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.points.toLocaleString()} XP
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                {getChangeIcon(player.change)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Updated every hour • Season ends in 45 days
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
