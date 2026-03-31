"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function completeTest(testData: {
  testId: string
  testType: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING'
  score: number
  timeSpent: number
  answers: any
  bandScore?: number
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/(auth)/login")
  }

  try {
    // Save test submission
    const submission = await prisma.testSubmission.create({
      data: {
        userId: session.user.id,
        testId: testData.testId,
        testType: testData.testType,
        answers: testData.answers,
        score: testData.score,
        bandScore: testData.bandScore,
        timeSpent: testData.timeSpent,
        submittedAt: new Date(),
      },
    })

    // Update or create user progress
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_testType: {
          userId: session.user.id,
          testType: testData.testType,
        },
      },
    })

    if (existingProgress) {
      await prisma.userProgress.update({
        where: {
          userId_testType: {
            userId: session.user.id,
            testType: testData.testType,
          },
        },
        data: {
          latestScore: testData.score,
          testsCompleted: existingProgress.testsCompleted + 1,
          lastTestDate: new Date(),
        },
      })
    } else {
      await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          testType: testData.testType,
          latestScore: testData.score,
          testsCompleted: 1,
          lastTestDate: new Date(),
        },
      })
    }

    // Update user's overall stats
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tasksDone: {
          increment: 1,
        },
        ...(testData.bandScore && {
          currentBand: testData.bandScore,
        }),
      },
    })

    // Revalidate dashboard to show updated progress
    revalidatePath("/(student)/dashboard")

    return {
      success: true,
      submissionId: submission.id,
      message: "Test completed successfully",
    }
  } catch (error) {
    console.error("Error completing test:", error)
    return {
      success: false,
      error: "Failed to complete test. Please try again.",
    }
  }
}

export async function getUserTestProgress(userId: string) {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    const submissions = await prisma.testSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    })

    return {
      progress,
      recentSubmissions: submissions,
    }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return {
      progress: [],
      recentSubmissions: [],
    }
  }
}

export async function getTestById(testId: string) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    return test
  } catch (error) {
    console.error("Error fetching test:", error)
    return null
  }
}
