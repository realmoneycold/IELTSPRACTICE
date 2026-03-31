import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { answers, score, totalQuestions } = await request.json()

    // Calculate band score based on performance
    const bandScore = (score / totalQuestions) * 9

    // Save diagnostic test results
    const submission = await prisma.testSubmission.create({
      data: {
        userId: session.user.id,
        testType: "DIAGNOSTIC",
        testId: "DIAGNOSTIC_" + Date.now(),
        score: score,
        bandScore: Math.round(bandScore * 2) / 2, // Round to nearest 0.5
        timeSpent: 20, // Estimated time in minutes
        submittedAt: new Date(),
        gradedAt: new Date(),
        answers: JSON.stringify(answers),
        feedback: {
          type: "diagnostic",
          recommendations: generateRecommendations(score, totalQuestions, answers)
        }
      }
    })

    // Update user progress
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentBand: Math.round(bandScore * 2) / 2,
        tasksDone: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      submission,
      bandScore: Math.round(bandScore * 2) / 2
    })
  } catch (error) {
    console.error("Diagnostic test submission error:", error)
    return NextResponse.json(
      { error: "Failed to submit diagnostic test" },
      { status: 500 }
    )
  }
}

function generateRecommendations(score: number, totalQuestions: number, answers: Record<string, number>) {
  const percentage = (score / totalQuestions) * 100
  
  const recommendations = []
  
  if (percentage < 50) {
    recommendations.push("Focus on fundamental IELTS concepts and strategies")
    recommendations.push("Consider taking introductory courses for each skill")
  } else if (percentage < 70) {
    recommendations.push("Practice regularly with timed exercises")
    recommendations.push("Work on weak areas identified in the test")
  } else {
    recommendations.push("Continue practicing to maintain and improve your score")
    recommendations.push("Focus on advanced techniques and time management")
  }
  
  // Skill-specific recommendations could be added here based on answer analysis
  
  return recommendations
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get existing diagnostic test results
    const diagnosticResults = await prisma.testSubmission.findMany({
      where: {
        userId: session.user.id,
        testType: "DIAGNOSTIC"
      },
      orderBy: { submittedAt: 'desc' },
      take: 5
    })

    return NextResponse.json({ 
      success: true, 
      diagnosticResults 
    })
  } catch (error) {
    console.error("Error fetching diagnostic results:", error)
    return NextResponse.json(
      { error: "Failed to fetch diagnostic results" },
      { status: 500 }
    )
  }
}
