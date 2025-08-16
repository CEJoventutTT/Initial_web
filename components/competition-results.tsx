'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function CompetitionResults() {
  const { t } = useTranslation()

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
    { position: 4, team: 'C.T.T C.E.R. L´ESCALA',  played: 0, won: 0, lost: 0, points: 0 },
    { position: 5, team: 'C.T.T. OLOT - CAPDEVILA PERMAR', played: 0, won: 0, lost: 0, points: 0 },
    { position: 6, team: 'CTT HOSPITALET',         played: 0, won: 0, lost: 0, points: 0 },
  ]

  const Table = ({ rows }: { rows: typeof femaleStandings }) => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-card/70">
          <tr className="border-b border-border/60">
            <th className="text-left text-foreground/70 py-2 px-3">Pos</th>
            <th className="text-left text-foreground/70 py-2 px-3">Team</th>
            <th className="text-center text-foreground/70 py-2 px-3">P</th>
            <th className="text-center text-foreground/70 py-2 px-3">W</th>
            <th className="text-center text-foreground/70 py-2 px-3">L</th>
            <th className="text-center text-foreground/70 py-2 px-3">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((team, i) => (
            <tr
              key={i}
              className={[
                'border-b border-border/40',
                i % 2 === 1 ? 'bg-background/40' : '',
                team.position === 1 ? 'bg-accent/10' : '',
              ].join(' ')}
            >
              <td className="py-2 px-3 text-foreground font-medium">{team.position}</td>
              <td className="py-2 px-3 text-foreground">{team.team}</td>
              <td className="py-2 px-3 text-center text-foreground/80">{team.played}</td>
              <td className="py-2 px-3 text-center text-accent">{team.won}</td>
              <td className="py-2 px-3 text-center text-primary">{team.lost}</td>
              <td className="py-2 px-3 text-center text-accent font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <section id="teams" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-foreground mb-4">{t('teams.title')}</h2>
          <p className="text-foreground/80 text-lg font-thin">{t('teams.description')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <Card className="bg-card/90 border border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center font-medium">
                <Calendar className="mr-2 h-5 w-5 text-accent" />
                {t('teams.recentMatches')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground/70 text-sm">
                {/* Sin partidos jugados todavía */}
              </div>
            </CardContent>
          </Card>

          {/* League Standings */}
          <Card className="bg-card/90 border border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center font-medium">
                <Trophy className="mr-2 h-5 w-5 text-accent" />
                {t('teams.leagueStandings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-foreground font-semibold mb-3">{t('teams.femaleLeague')}</h3>
                  <Table rows={femaleStandings} />
                </div>
                <div>
                  <h3 className="text-foreground font-semibold mb-3">{t('teams.maleLeague')}</h3>
                  <Table rows={maleStandings} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
