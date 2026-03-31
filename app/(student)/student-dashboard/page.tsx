import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TM_TESTS, getTestsBySkill } from "@/lib/tests-registry"
import { TestCard } from "@/components/dashboard/TestCard"
import { ProgressOverview } from "@/components/dashboard/ProgressOverview"
import { FloatingChatButton } from "@/components/FloatingChatButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateStudyPlan, getPredictedBandScore, getUserBadges } from "@/app/actions/ai-features"
import { redirect } from "next/navigation"
import { Sparkles, Target, Trophy, Flame, Calendar, TrendingUp, Star } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/(auth)/login")
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/(auth)/login")
  }

  // Get AI features data
  const [predictedScore, badges] = await Promise.all([
    getPredictedBandScore(session.user.id),
    getUserBadges(session.user.id)
  ])

  // Get user's test submissions and progress
  const userSubmissions = await prisma.testSubmission.findMany({
    where: { userId: session.user.id },
    orderBy: { submittedAt: 'desc' }
  })

  const userProgress = await prisma.userProgress.findMany({
    where: { userId: session.user.id }
  })

  // Calculate completed test IDs
  const completedTestIds = new Set(userSubmissions.map(s => s.testId))

  // Update tests with completion status
  const testsWithStatus = TM_TESTS.map(test => ({
    ...test,
    completed: completedTestIds.has(test.id),
    score: userSubmissions.find(s => s.testId === test.id)?.score || 0
  }))

  // Group tests by skill
  const readingTests = getTestsBySkill('reading').map(test => ({
    ...test,
    completed: completedTestIds.has(test.id),
    score: userSubmissions.find(s => s.testId === test.id)?.score || 0
  }))
  
  const listeningTests = getTestsBySkill('listening').map(test => ({
    ...test,
    completed: completedTestIds.has(test.id),
    score: userSubmissions.find(s => s.testId === test.id)?.score || 0
  }))
  
  const writingTests = getTestsBySkill('writing').map(test => ({
    ...test,
    completed: completedTestIds.has(test.id),
    score: userSubmissions.find(s => s.testId === test.id)?.score || 0
  }))
  
  const speakingTests = getTestsBySkill('speaking').map(test => ({
    ...test,
    completed: completedTestIds.has(test.id),
    score: userSubmissions.find(s => s.testId === test.id)?.score || 0
  }))

  // Calculate streak (simplified)
  const streak = Math.min(userSubmissions.length, 7)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IELTS Practice Platform</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {streak} day streak
              </Badge>
              <span className="text-sm text-gray-600">
                {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
              </span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Predicted Band Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Predicted Band Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {predictedScore.overall.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">Overall Band</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reading:</span>
                    <span className="font-medium">{predictedScore.skills.READING.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Listening:</span>
                    <span className="font-medium">{predictedScore.skills.LISTENING.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Writing:</span>
                    <span className="font-medium">{predictedScore.skills.WRITING.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speaking:</span>
                    <span className="font-medium">{predictedScore.skills.SPEAKING.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Plan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Personalized Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Get AI-powered study recommendations based on your progress
                </p>
                <form action={generateStudyPlan} className="w-full">
                  <Button type="submit" className="w-full flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate My Study Plan
                  </Button>
                </form>
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/(student)/diagnostic">
                      <Target className="w-4 h-4 mr-2" />
                      Take Diagnostic Test
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges & Achievements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {badges.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-4">
                    Complete tests to earn badges!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 6).map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs"
                        title={badge.description}
                      >
                        <span>{badge.icon}</span>
                        <span className="font-medium">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {badges.length > 6 && (
                  <p className="text-xs text-gray-500">+{badges.length - 6} more achievements</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <ProgressOverview 
          userProgress={userProgress}
          totalTests={TM_TESTS.length}
          completedTests={completedTestIds.size}
        />

        {/* Test Grid */}
        <div className="space-y-8">
          {/* Reading Tests */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reading Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {readingTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </div>

          {/* Listening Tests */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Listening Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listeningTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </div>

          {/* Writing Tests */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Writing Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {writingTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </div>

          {/* Speaking Tests */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Speaking Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {speakingTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <FloatingChatButton />
    </div>
  )
}
