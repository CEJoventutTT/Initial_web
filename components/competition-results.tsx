'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function CompetitionResults() {
  const { t } = useTranslation()

  // 🔹 Sin partidos jugados todavía
  /*
  const recentMatches = [
    { date: '2024-01-15', opponent: 'City Champions TTC',   result: 'W 5-2', venue: 'Home',    type: 'League Match' },
    { date: '2024-01-08', opponent: 'Metro Table Tennis Club', result: 'W 4-3', venue: 'Away',    type: 'Cup Quarter-Final' },
    { date: '2024-01-01', opponent: 'Elite Ping Pong Academy', result: 'L 2-5', venue: 'Neutral', type: 'Tournament' },
    { date: '2023-12-18', opponent: 'Riverside TT Club',    result: 'W 6-1', venue: 'Home',    type: 'League Match' },
  ]
  */

  const femaleStandings = [
    { position: 1, team: 'C.T.M. JEREZ', played: 0, won: 0, lost: 0, points: 0 },
    { position: 2, team: 'CLINIQAS.COM',  played: 0, won: 0, lost: 0, points: 0 },
    { position: 3, team: 'CLUB TENNIS TAULA TRAMUNTANA FIGUERES', played: 0, won: 0, lost: 0, points: 0 },
    { position: 4, team: 'GIRBAU VIC T.T.',  played: 0, won: 0, lost: 0, points: 0 },
    { position: 5, team: 'HUJASE JAÉN PARAISO INTERIOR',  played: 0, won: 0, lost: 0, points: 0 },
    { position: 6, team: 'MIRÓ GANXETS COSTA DAURADA',       played: 0, won: 0, lost: 0, points: 0 },
  ]

  const maleStandings = [
    { position: 1, team: 'ALICANTE TM',            played: 0, won: 0, lost: 0, points: 0 },
    { position: 2, team: 'ARTEAL SANTIAGO',        played: 0, won: 0, lost: 0, points: 0 },
    { position: 3, team: 'ATLÉTICO SAN SEBASTIÁN', played: 0, won: 0, lost: 0, points: 0 },
    { position: 4, team: 'C.T.T C.E.R. L´ESCALA',played: 0, won: 0, lost: 0, points: 0 },
    { position: 5, team: 'C.T.T. OLOT - CAPDEVILA PERMAR',      played: 0, won: 0, lost: 0, points: 0 },
    { position: 6, team: 'CTT HOSPITALET',             played: 0, won: 0, lost: 0, points: 0 },
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
                {/* De momento sin partidos jugados */}
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
              <div className="space-y-8">
                {/* Liga Femenina primero */}
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    {t('teams.femaleLeague')}
                  </h3>
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
                        {femaleStandings.slice(0, 5).map((team, index) => (
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
                </div>

                {/* Liga Masculina */}
                <div>
                  <h3 className="text-white font-semibold mb-3">
                    {t('teams.maleLeague')}
                  </h3>
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
                        {maleStandings.slice(0, 5).map((team, index) => (
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
