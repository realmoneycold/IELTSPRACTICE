"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTeacherDashboardData() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return {
      error: "Unauthorized"
    }
  }

  try {
    // Get total students
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT"
      }
    })

    // Get tests graded today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const testsGradedToday = await prisma.testSubmission.count({
      where: {
        submittedAt: {
          gte: today
        }
      }
    })

    // Get average band score
    const averageBandScore = await prisma.user.aggregate({
      where: {
        role: "STUDENT",
        currentBand: {
          not: null
        }
      },
      _avg: {
        currentBand: true
      }
    })

    // Get student roster
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT"
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentBand: true,
        targetBand: true,
        tasksDone: true,
        updatedAt: true,
        testSubmissions: {
          select: {
            testType: true,
            score: true,
            bandScore: true,
            submittedAt: true
          },
          orderBy: {
            submittedAt: 'desc'
          },
          take: 4
        }
      },
      orderBy: [
        { updatedAt: 'desc' },
        { name: 'asc' }
      ],
      take: 50
    })

    // Get recent submissions
    const recentSubmissions = await prisma.testSubmission.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    return {
      totalStudents,
      testsGradedToday,
      averageBandScore: averageBandScore._avg.currentBand || 0,
      students,
      recentSubmissions
    }
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error)
    return {
      error: "Failed to fetch dashboard data"
    }
  }
}

export async function updateSubmissionGrade(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized")
  }

  const submissionId = formData.get("submissionId") as string
  const teacherBandScore = parseFloat(formData.get("teacherBandScore") as string)
  const teacherComment = formData.get("teacherComment") as string

  try {
    await prisma.testSubmission.update({
      where: {
        id: submissionId
      },
      data: {
        bandScore: teacherBandScore,
        feedback: teacherComment ? { teacherComment } : undefined,
        gradedAt: new Date()
      }
    })

    revalidatePath("/(teacher)/dashboard")
    revalidatePath(`/teacher/submissions/${submissionId}`)
  } catch (error) {
    console.error("Error updating submission grade:", error)
    throw new Error("Failed to update grade")
  }
}
