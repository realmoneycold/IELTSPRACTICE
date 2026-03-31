"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getStudentDetails(userId: string) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return {
      error: "Unauthorized"
    }
  }

  try {
    const student = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "STUDENT"
      },
      include: {
        testSubmissions: {
          orderBy: {
            submittedAt: 'desc'
          },
          take: 20
        }
      }
    })

    if (!student) {
      return {
        error: "Student not found"
      }
    }

    return {
      student
    }
  } catch (error) {
    console.error("Error fetching student details:", error)
    return {
      error: "Failed to fetch student details"
    }
  }
}
