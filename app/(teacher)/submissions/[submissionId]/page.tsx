import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getSubmissionDetails } from "@/app/actions/submission"
import { updateSubmissionGrade } from "@/app/actions/teacher"
import { ArrowLeft, Clock, User, FileText, Save } from "lucide-react"
import Link from "next/link"

export default async function SubmissionReviewPage({ params }: { params: { submissionId: string } }) {
  const data = await getSubmissionDetails(params.submissionId)

  if ("error" in data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{data.error}</p>
          <Link href="/(teacher)/dashboard" className="mt-4 inline-block">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { submission } = data

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/(teacher)/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submission Review</h1>
            <p className="text-gray-600">
              {submission.testType} by {submission.user.name || submission.user.email}
            </p>
          </div>
        </div>

        {/* Submission Info */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Student</p>
                <p className="text-lg">{submission.user.name || submission.user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Test Type</p>
                <Badge variant="outline">{submission.testType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Raw Score</p>
                <p className="text-lg font-bold">{submission.score.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="text-lg">{new Date(submission.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student's Answers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Student's Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {JSON.stringify(submission.answers, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback */}
        {submission.feedback && (
          <Card>
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-blue-800">
                  {JSON.stringify(submission.feedback, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teacher Override Form */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Grade Override</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateSubmissionGrade} className="space-y-4">
              <input type="hidden" name="submissionId" value={submission.id} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bandScore">Band Score (0.0 - 9.0)</Label>
                  <Input
                    type="number"
                    id="bandScore"
                    name="teacherBandScore"
                    min="0"
                    max="9"
                    step="0.5"
                    placeholder="7.5"
                    defaultValue={submission.bandScore || ""}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter IELTS band score in 0.5 increments
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="comment">Teacher Comment</Label>
                  <Textarea
                    id="comment"
                    name="teacherComment"
                    placeholder="Provide feedback on the student's performance..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add your feedback for the student
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Grade
                </Button>
                <Link href="/(teacher)/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Score Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Raw Score</p>
                <p className="text-2xl font-bold text-gray-900">{submission.score.toFixed(1)}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600">AI Band Score</p>
                <p className="text-2xl font-bold text-blue-900">
                  {submission.bandScore ? submission.bandScore.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Teacher Band Score</p>
                <p className="text-2xl font-bold text-green-900">
                  {submission.bandScore ? submission.bandScore.toFixed(1) : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
