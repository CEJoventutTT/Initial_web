'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, Clock, Target, Users } from 'lucide-react'

export default function TrainingLogger() {
  const [isLogging, setIsLogging] = useState(false)

  const recentSessions = [
    {
      date: '2024-01-15',
      type: 'Competition Training',
      duration: '90 min',
      xpGained: 120,
      notes: 'Worked on backhand technique'
    },
    {
      date: '2024-01-12',
      type: 'Beginner Class',
      duration: '60 min',
      xpGained: 80,
      notes: 'Helped new members with basics'
    },
    {
      date: '2024-01-10',
      type: 'Solo Practice',
      duration: '45 min',
      xpGained: 60,
      notes: 'Focused on serve consistency'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Training Sessions</h2>
        <Button 
          onClick={() => setIsLogging(!isLogging)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Log New Session
        </Button>
      </div>

      {isLogging && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Log Training Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Type
                  </label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <Input 
                    type="number"
                    placeholder="90"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Notes
                </label>
                <Textarea 
                  placeholder="What did you work on today? Any improvements or challenges?"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Log Session (+100 XP)
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsLogging(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{session.type}</h4>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {session.duration}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{session.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 font-bold">+{session.xpGained} XP</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
