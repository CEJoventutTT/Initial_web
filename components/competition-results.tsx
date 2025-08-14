'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar, MapPin } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function CompetitionResults() {
  const { t } = useTranslation()

  const recentMatches = [
    { date: '2024-01-15', opponent: 'City Champions TTC',   result: 'W 5-2', venue: 'Home',    type: 'League Match' },
    { date: '2024-01-08', opponent: 'Metro Table Tennis Club', result: 'W 4-3', venue: 'Away',    type: 'Cup Quarter-Final' },
    { date: '2024-01-01', opponent: 'Elite Ping Pong Academy', result: 'L 2-5', venue: 'Neutral', type: 'Tournament' },
    { date: '2023-12-18', opponent: 'Riverside TT Club',    result: 'W 6-1', venue: 'Home',    type: 'League Match' },
  ]

  const standings = [
    { position: 1, team: 'Alicante TM',            played: 0, won: 0, lost: 0, points: 0 },
    { position: 2, team: 'Arteal Santiago',        played: 0, won: 0, lost: 0, points: 0 },
    { position: 3, team: 'Atlético San Sebastián', played: 0, won: 0, lost: 0, points: 0 },
    { position: 4, team: 'Metro Table Tennis Club',played: 12, won: 6, lost: 6, points: 18 },
    { position: 5, team: 'Riverside TT Club',      played: 12, won: 3, lost: 9, points: 9 },
  ]

  return (
    <section id="teams" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">
            {t('teams.title')}
          </h2>
          <p className="text-white/80 text-lg font-thin">
            {t('teams.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <Card className="bg-brand-dark border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center font-medium">
                <Calendar className="mr-2 h-5 w-5 text-brand-teal" />
                {t('teams.recentMatches')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.map((match, index) => {
                  const isWin = match.result.startsWith('W')
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center text-sm text-white/60 mb-1">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(match.date).toLocaleDateString()}
                          <MapPin className="ml-3 mr-1 h-3 w-3" />
                          {match.venue}
                        </div>
                        <div className="text-white font-medium">{match.opponent}</div>
                        <div className="text-xs text-brand-teal/90">{match.type}</div>
                      </div>

                      <div
                        className={[
                          'text-lg font-bold px-3 py-1 rounded',
                          isWin
                            ? 'text-brand-teal bg-brand-teal/10'
                            : 'text-brand-red bg-brand-red/10',
                        ].join(' ')}
                      >
                        {match.result}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* League Standings */}
          <Card className="bg-brand-dark border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center font-medium">
                <Trophy className="mr-2 h-5 w-5 text-brand-teal" />
                {t('teams.leagueStandings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/60 pb-2">Pos</th>
                      <th className="text-left text-white/60 pb-2">Team</th>
                      <th className="text-center text-white/60 pb-2">P</th>
                      <th className="text-center text-white/60 pb-2">W</th>
                      <th className="text-center text-white/60 pb-2">L</th>
                      <th className="text-center text-white/60 pb-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr
                        key={index}
                        className={[
                          'border-b border-white/5',
                          team.position === 1 ? 'bg-brand-teal/10' : '',
                        ].join(' ')}
                      >
                        <td className="py-2 text-white font-medium">{team.position}</td>
                        <td className="py-2 text-white">{team.team}</td>
                        <td className="py-2 text-center text-white/80">{team.played}</td>
                        <td className="py-2 text-center text-brand-teal">{team.won}</td>
                        <td className="py-2 text-center text-brand-red">{team.lost}</td>
                        <td className="py-2 text-center text-brand-teal font-bold">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
