"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { completeTest } from "./complete-test"
import { revalidatePath } from "next/cache"

interface TestScore {
  score: number
  total: number
  percentage: number
}

export async function submitReadingAnswers(testId: string, answers: Record<string, string>, score: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required"
    }
  }

  try {
    // Calculate band score based on raw score
    const bandScore = calculateBandScore(score, 10) // Assuming 10 questions max

    // Call completeTest to handle the main logic
    const result = await completeTest({
      testId,
      testType: 'READING',
      score,
      timeSpent: 0, // Will be calculated client-side
      answers,
      bandScore
    })

    // Revalidate dashboard to show updated progress
    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      submissionId: result.submissionId,
      score: { score, total: 10, percentage: (score / 10) * 100 },
      bandScore,
      message: "Reading test submitted successfully"
    }
  } catch (error) {
    console.error("Error submitting reading answers:", error)
    return {
      success: false,
      error: "Failed to submit test. Please try again."
    }
  }
}

export async function submitListeningAnswers(testId: string, answers: Record<string, string>, score: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required"
    }
  }

  try {
    const bandScore = calculateBandScore(score, 10)

    const result = await completeTest({
      testId,
      testType: 'LISTENING',
      score,
      timeSpent: 0,
      answers,
      bandScore
    })

    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      submissionId: result.submissionId,
      score: { score, total: 10, percentage: (score / 10) * 100 },
      bandScore,
      message: "Listening test submitted successfully"
    }
  } catch (error) {
    console.error("Error submitting listening answers:", error)
    return {
      success: false,
      error: "Failed to submit test. Please try again."
    }
  }
}

export async function submitWritingAnswers(testId: string, answers: Record<string, string>, score: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required"
    }
  }

  try {
    const bandScore = calculateBandScore(score, 2) // Writing is typically out of 2 tasks

    const result = await completeTest({
      testId,
      testType: 'WRITING',
      score,
      timeSpent: 0,
      answers,
      bandScore
    })

    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      submissionId: result.submissionId,
      score: { score, total: 2, percentage: (score / 2) * 100 },
      bandScore,
      message: "Writing test submitted successfully"
    }
  } catch (error) {
    console.error("Error submitting writing answers:", error)
    return {
      success: false,
      error: "Failed to submit test. Please try again."
    }
  }
}

export async function submitSpeakingAnswers(testId: string, answers: Record<string, string>, score: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Authentication required"
    }
  }

  try {
    const bandScore = calculateBandScore(score, 3) // Speaking has 3 parts

    const result = await completeTest({
      testId,
      testType: 'SPEAKING',
      score,
      timeSpent: 0,
      answers,
      bandScore
    })

    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      submissionId: result.submissionId,
      score: { score, total: 3, percentage: (score / 3) * 100 },
      bandScore,
      message: "Speaking test submitted successfully"
    }
  } catch (error) {
    console.error("Error submitting speaking answers:", error)
    return {
      success: false,
      error: "Failed to submit test. Please try again."
    }
  }
}

// Helper function to calculate IELTS band score
function calculateBandScore(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100
  
  if (percentage >= 90) return 9.0
  if (percentage >= 85) return 8.5
  if (percentage >= 80) return 8.0
  if (percentage >= 75) return 7.5
  if (percentage >= 70) return 7.0
  if (percentage >= 65) return 6.5
  if (percentage >= 60) return 6.0
  if (percentage >= 55) return 5.5
  if (percentage >= 50) return 5.0
  if (percentage >= 45) return 4.5
  if (percentage >= 40) return 4.0
  if (percentage >= 35) return 3.5
  if (percentage >= 30) return 3.0
  if (percentage >= 25) return 2.5
  if (percentage >= 20) return 2.0
  if (percentage >= 15) return 1.5
  return 1.0
}
