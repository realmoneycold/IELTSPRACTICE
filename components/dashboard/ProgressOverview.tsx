import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Award } from "lucide-react"

interface ProgressOverviewProps {
  userProgress: any[]
  totalTests: number
  completedTests: number
}

export function ProgressOverview({ userProgress, totalTests, completedTests }: ProgressOverviewProps) {
  const completionPercentage = totalTests > 0 ? (completedTests / totalTests) * 100 : 0
  
  // Calculate average scores by skill
  const getAverageScore = (skill: string) => {
    const skillProgress = userProgress.find(p => p.testType.toLowerCase() === skill)
    return skillProgress?.latestScore || 0
  }

  const skills = [
    { name: 'Reading', score: getAverageScore('reading'), color: 'bg-blue-500' },
    { name: 'Listening', score: getAverageScore('listening'), color: 'bg-green-500' },
    { name: 'Writing', score: getAverageScore('writing'), color: 'bg-purple-500' },
    { name: 'Speaking', score: getAverageScore('speaking'), color: 'bg-orange-500' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedTests}/{totalTests}</div>
          <p className="text-xs text-muted-foreground">Tests completed</p>
          <Progress value={completionPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completionPercentage.toFixed(1)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Average Band Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Band Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {skills.length > 0 
              ? (skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length).toFixed(1)
              : '0.0'
            }
          </div>
          <p className="text-xs text-muted-foreground">Overall IELTS band</p>
          <div className="mt-2 space-y-1">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${skill.color}`} />
                <span className="text-xs">{skill.name}: {skill.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7.5</div>
          <p className="text-xs text-muted-foreground">Current target band</p>
          <Progress value={75} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            On track to target
          </p>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">Days in a row</p>
          <div className="mt-2 flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < 5 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Keep it up!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
