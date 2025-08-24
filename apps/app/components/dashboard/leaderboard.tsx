import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Crown, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function Leaderboard({
  items
}: {
  items: Array<{ user_id:string; full_name:string|null; total_xp:number }>
}) {
  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up':   return <TrendingUp className="h-4 w-4 text-[#6BBFA0]" />
      case 'down': return <TrendingDown className="h-4 w-4 text-[#BF0F30]" />
      default:     return <Minus className="h-4 w-4 text-white/50" />
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
          {items.map((p, idx) => (
            <div key={p.user_id} className={`flex items-center justify-between p-3 rounded-lg ${idx===0?'bg-[#BF0F30]/10 border border-[#BF0F30]/30':'bg-white/5 border border-white/5'}`}>
              <div className="flex items-center space-x-3">
                <div className="text-lg font-bold w-6 text-center">{idx+1}</div>
                <div className="relative">
                  <img src="/placeholder.svg?height=40&width=40" alt={p.full_name ?? 'Player'} className="w-10 h-10 rounded-full" />
                </div>
                <div>
                  <div className="font-medium text-white">{p.full_name ?? 'Player'}</div>
                  <div className="text-sm text-white/70">{p.total_xp.toLocaleString()} XP</div>
                </div>
              </div>
              <div className="flex items-center">{getChangeIcon('same')}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-white/60 text-sm">Updated hourly</p>
        </div>
      </CardContent>
    </Card>
  )
}
