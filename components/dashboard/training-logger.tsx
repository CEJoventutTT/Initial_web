'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, Clock, Target } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TrainingLogger({
  recentLogs,
  uid
}: {
  recentLogs: Array<{ id:number; session_type:string; duration_min:number; notes:string|null; created_at:string }>
  uid: string
}) {
  const [isLogging, setIsLogging] = useState(false)
  const [type, setType] = useState<string | undefined>(undefined)
  const [duration, setDuration] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !duration) return
    setLoading(true)
    const supabase = supabaseBrowser()
    const { error } = await supabase.from('training_logs').insert({
      user_id: uid,               // RLS: debe coincidir con auth.uid()
      session_type: type,
      duration_min: Number(duration),
      notes: notes || null
    })
    setLoading(false)
    if (!error) {
      setIsLogging(false)
      setType(undefined); setDuration(''); setNotes('')
      router.refresh() // refresca datos server del dashboard
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Training Sessions</h2>
        <Button onClick={() => setIsLogging(!isLogging)} className="bg-[#BF0F30] hover:bg-[#a50c28] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Log New Session
        </Button>
      </div>

      {isLogging && (
        <Card className="bg-[#262425] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Log Training Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Session Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select training type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner Class</SelectItem>
                      <SelectItem value="competition">Competition Training</SelectItem>
                      <SelectItem value="adults">Adults Program</SelectItem>
                      <SelectItem value="solo">Solo Practice</SelectItem>
                      <SelectItem value="match">Practice Match</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    placeholder="90"
                    value={duration}
                    onChange={(e)=>setDuration(e.target.value ? Number(e.target.value) : '')}
                    className="bg-white/5 border-white/10 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Session Notes</label>
                <Textarea
                  placeholder="What did you work on today? Any improvements or challenges?"
                  value={notes}
                  onChange={(e)=>setNotes(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/50"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="bg-[#BF0F30] hover:bg-[#a50c28] text-white">
                  {loading ? 'Saving…' : 'Log Session (+100 XP)'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsLogging(false)} className="border-white/15 text-white/80 hover:bg-white/10">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#262425] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#5D8C87] p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {s.session_type === 'beginner' ? 'Beginner Class' :
                       s.session_type === 'competition' ? 'Competition Training' :
                       s.session_type === 'adults' ? 'Adults Program' :
                       s.session_type === 'solo' ? 'Solo Practice' : 'Practice Match'}
                    </h4>
                    <div className="flex items-center text-sm text-white/70 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {s.duration_min} min
                      </span>
                    </div>
                    {s.notes && <p className="text-white/80 text-sm mt-1">{s.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: '#6BBFA0' }}>
                    +100 XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
