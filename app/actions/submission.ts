"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getSubmissionDetails(submissionId: string) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return {
      error: "Unauthorized"
    }
  }

  try {
    const submission = await prisma.testSubmission.findUnique({
      where: {
        id: submissionId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!submission) {
      return {
        error: "Submission not found"
      }
    }

    return {
      submission
    }
  } catch (error) {
    console.error("Error fetching submission details:", error)
    return {
      error: "Failed to fetch submission details"
    }
  }
}
