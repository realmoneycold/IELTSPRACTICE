"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function generateStudyPlan() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  try {
    // Get user's recent performance data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        testSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Analyze weak areas from recent submissions
    const skillScores = {
      READING: [] as number[],
      LISTENING: [] as number[],
      WRITING: [] as number[],
      SPEAKING: [] as number[]
    }

    user.testSubmissions.forEach(submission => {
      if (submission.bandScore) {
        skillScores[submission.testType].push(submission.bandScore)
      }
    })

    // Calculate average scores per skill
    const avgScores = Object.keys(skillScores).reduce((acc, skill) => {
      const scores = skillScores[skill as keyof typeof skillScores]
      acc[skill] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      return acc
    }, {} as Record<string, number>)

    // Identify weak areas
    const weakAreas = Object.entries(avgScores)
      .filter(([_, score]) => score < 7.0)
      .map(([skill, score]) => ({ skill, score }))
      .sort((a, b) => a.score - b.score)

    // Generate study plan using Gemini
    const prompt = `Create a personalized 7-day IELTS study plan for a student with the following profile:

Current Performance:
- Overall Band: ${user.currentBand || 'Not yet determined'}
- Target Band: ${user.targetBand || 'Not set'}
- Recent Average Scores: ${Object.entries(avgScores).map(([skill, score]) => `${skill}: ${score.toFixed(1)}`).join(', ')}
- Weak Areas: ${weakAreas.map(area => area.skill).join(', ') || 'None identified'}
- Tests Completed: ${user.tasksDone}

Please create a structured 7-day study plan with:
1. Daily focus areas (prioritizing weak skills)
2. Specific test recommendations (Reading, Listening, Writing, Speaking)
3. Time allocation suggestions
4. Practice exercises
5. Progress goals for each day

Format the response as a JSON array with this structure:
[
  {
    "day": 1,
    "focus": "Main focus area",
    "tests": ["Test type 1", "Test type 2"],
    "timeAllocation": "2 hours",
    "exercises": ["Exercise 1", "Exercise 2"],
    "goal": "Daily goal"
  }
]`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      temperature: 0.7,
    })

    // Parse the response
    let studyPlan
    try {
      studyPlan = JSON.parse(text)
    } catch (error) {
      // Fallback plan if JSON parsing fails
      studyPlan = [
        {
          day: 1,
          focus: weakAreas[0]?.skill || "Reading",
          tests: ["Reading Practice"],
          timeAllocation: "2 hours",
          exercises: ["Reading comprehension", "Vocabulary building"],
          goal: "Improve reading speed and comprehension"
        },
        // ... add more days
      ]
    }

    // Save study plan to user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // In a real implementation, you'd have a studyPlan field
        // For now, we'll just return the plan
      }
    })

    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      studyPlan
    }
  } catch (error) {
    console.error("Error generating study plan:", error)
    throw new Error("Failed to generate study plan")
  }
}

export async function getPredictedBandScore(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        testSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 20
        }
      }
    })

    if (!user || !user.testSubmissions.length) {
      return {
        overall: 0,
        skills: {
          READING: 0,
          LISTENING: 0,
          WRITING: 0,
          SPEAKING: 0
        }
      }
    }

    // Calculate skill-specific averages
    const skillScores = {
      READING: [] as number[],
      LISTENING: [] as number[],
      WRITING: [] as number[],
      SPEAKING: [] as number[]
    }

    user.testSubmissions.forEach(submission => {
      if (submission.bandScore) {
        skillScores[submission.testType].push(submission.bandScore)
      }
    })

    const skillAverages = Object.keys(skillScores).reduce((acc, skill) => {
      const scores = skillScores[skill as keyof typeof skillScores]
      acc[skill] = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0
      return acc
    }, {} as Record<string, number>)

    // Calculate overall average
    const validScores = Object.values(skillAverages).filter(score => score > 0)
    const overall = validScores.length > 0 
      ? validScores.reduce((a, b) => a + b, 0) / validScores.length 
      : 0

    return {
      overall: Math.round(overall * 2) / 2, // Round to nearest 0.5
      skills: {
        READING: Math.round(skillAverages.READING * 2) / 2,
        LISTENING: Math.round(skillAverages.LISTENING * 2) / 2,
        WRITING: Math.round(skillAverages.WRITING * 2) / 2,
        SPEAKING: Math.round(skillAverages.SPEAKING * 2) / 2
      }
    }
  } catch (error) {
    console.error("Error calculating predicted band score:", error)
    return {
      overall: 0,
      skills: {
        READING: 0,
        LISTENING: 0,
        WRITING: 0,
        SPEAKING: 0
      }
    }
  }
}

export async function getUserBadges(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        testSubmissions: {
          orderBy: { submittedAt: 'desc' },
          take: 50
        }
      }
    })

    if (!user) return []

    const badges = []
    const submissionCount = user.testSubmissions.length
    const currentStreak = calculateStreak(user.testSubmissions)
    const avgScore = user.testSubmissions
      .filter(s => s.bandScore)
      .reduce((acc, s) => acc + s.bandScore!, 0) / 
      user.testSubmissions.filter(s => s.bandScore).length || 0

    // Achievement badges
    if (submissionCount >= 1) badges.push({ name: "First Steps", icon: "🎯", description: "Completed your first test" })
    if (submissionCount >= 5) badges.push({ name: "Dedicated", icon: "📚", description: "Completed 5 tests" })
    if (submissionCount >= 10) badges.push({ name: "Committed", icon: "⭐", description: "Completed 10 tests" })
    if (submissionCount >= 25) badges.push({ name: "Expert", icon: "🏆", description: "Completed 25 tests" })
    
    // Performance badges
    if (avgScore >= 7.0) badges.push({ name: "High Achiever", icon: "🌟", description: "Average band 7.0+" })
    if (avgScore >= 8.0) badges.push({ name: "Excellence", icon: "💎", description: "Average band 8.0+" })
    
    // Streak badges
    if (currentStreak >= 3) badges.push({ name: "On Fire", icon: "🔥", description: "3-day streak" })
    if (currentStreak >= 7) badges.push({ name: "Unstoppable", icon: "⚡", description: "7-day streak" })
    if (currentStreak >= 30) badges.push({ name: "Legend", icon: "👑", description: "30-day streak" })

    return badges
  } catch (error) {
    console.error("Error fetching user badges:", error)
    return []
  }
}

function calculateStreak(submissions: any[]): number {
  if (!submissions.length) return 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = new Date(today)
  
  for (let i = 0; i < submissions.length; i++) {
    const submissionDate = new Date(submissions[i].submittedAt)
    submissionDate.setHours(0, 0, 0, 0)
    
    if (submissionDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (submissionDate.getTime() < currentDate.getTime()) {
      break
    }
  }
  
  return streak
}
