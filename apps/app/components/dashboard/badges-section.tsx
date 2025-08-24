import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

type BadgeRow = {
  id: number
  granted_at: string
  badges: { code:string; name:string; icon_url:string|null } | null
}

export default function BadgesSection({ items }: { items: BadgeRow[] }) {
  const unlockedCount = items.length

  return (
    <Card className="bg-[#262425] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Award className="mr-2 h-5 w-5 text-white/80" />
          Badges ({unlockedCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((b) => (
            <div key={b.id} className="relative p-4 rounded-lg border-2 border-white/15 bg-white/5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 bg-[#BF0F30]">
                  {b.badges?.icon_url
                    ? <img src={b.badges.icon_url} alt={b.badges.name} className="w-12 h-12 object-cover rounded-full" />
                    : <span className="text-2xl text-white">🏅</span>
                  }
                </div>
                <h4 className="text-white font-semibold text-sm mb-1">{b.badges?.name ?? b.badges?.code ?? 'Badge'}</h4>
                <p className="text-white/70 text-xs">
                  {new Date(b.granted_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="absolute -top-1 -right-1 bg-[#6BBFA0] w-4 h-4 rounded-full border-2 border-[#262425]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
