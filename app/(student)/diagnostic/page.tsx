import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DiagnosticTest } from "@/components/DiagnosticTest"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

async function DiagnosticContent() {
  const session = await auth()
  
  if (!session) {
    redirect("/(auth)/login")
  }

  // Check if user has already taken diagnostic test
  const existingDiagnostic = await prisma.testSubmission.findFirst({
    where: {
      userId: session.user.id,
      testType: "DIAGNOSTIC"
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/student-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IELTS Diagnostic Test</h1>
                <p className="text-sm text-gray-600">
                  {existingDiagnostic ? "Review your results" : "Quick assessment across all skills"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {existingDiagnostic ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Diagnostic Test Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Your Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {existingDiagnostic.bandScore?.toFixed(1) || "N/A"}
                        </div>
                        <p className="text-sm text-gray-600">Overall Band Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {existingDiagnostic.score || 0}/20
                        </div>
                        <p className="text-sm text-gray-600">Questions Correct</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Recommended Next Steps</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Focus on practice tests in your weakest areas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Generate a personalized study plan from your dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Use the AI tutor for targeted help with difficult topics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Track your progress with regular practice tests
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/student-dashboard">View Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/practice">Practice Tests</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">About This Test</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        20 questions covering all 4 IELTS skills (5 questions each)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Takes approximately 15-20 minutes to complete
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Identifies your current skill level and weak areas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Provides personalized recommendations for study focus
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Important Notes
                    </h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Complete this test in one sitting for accurate results</li>
                      <li>• Answer honestly - don't use external resources</li>
                      <li>• Your results will help create a personalized study plan</li>
                      <li>• You can retake the diagnostic test after 30 days</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DiagnosticTest />
          </div>
        )}
      </main>
    </div>
  )
}

export default function DiagnosticPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic test...</p>
        </div>
      </div>
    }>
      <DiagnosticContent />
    </Suspense>
  )
}
