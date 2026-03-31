"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAdminDashboardData() {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    return {
      error: "Unauthorized"
    }
  }

  try {
    // Get platform stats
    const totalUsers = await prisma.user.count()
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } })
    const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } })
    const totalTests = await prisma.testSubmission.count()
    const todayTests = await prisma.testSubmission.count({
      where: {
        submittedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    // Get user list
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        currentBand: true,
        targetBand: true,
        tasksDone: true
      },
      orderBy: [
        { createdAt: 'desc' },
        { name: 'asc' }
      ],
      take: 100
    })

    // Get recent announcements (mock data for now)
    const announcements = []

    return {
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalTests,
        todayTests
      },
      users,
      announcements
    }
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error)
    return {
      error: "Failed to fetch dashboard data"
    }
  }
}

export async function createUser(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string

  try {
    await prisma.user.create({
      data: {
        email,
        name,
        role: role as any,
        password, // In production, hash this
        isActive: true
      }
    })

    revalidatePath("/(admin)/dashboard")
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

export async function updateUser(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  const userId = formData.get("userId") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string
  const isActive = formData.get("isActive") === "true"

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role: role as any,
        isActive
      }
    })

    revalidatePath("/(admin)/dashboard")
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error("Failed to update user")
  }
}

export async function deactivateUser(userId: string) {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    })

    revalidatePath("/(admin)/dashboard")
  } catch (error) {
    console.error("Error deactivating user:", error)
    throw new Error("Failed to deactivate user")
  }
}

export async function createAnnouncement(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const type = formData.get("type") as string

  try {
    // In a real implementation, you'd have an announcements table
    console.log("Creating announcement:", { title, content, type })
    
    revalidatePath("/(admin)/dashboard")
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw new Error("Failed to create announcement")
  }
}

export async function exportUsersCSV() {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        currentBand: true,
        targetBand: true,
        tasksDone: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Convert to CSV
    const headers = ['ID', 'Email', 'Name', 'Role', 'Active', 'Current Band', 'Target Band', 'Tasks Done', 'Created At', 'Updated At']
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        user.email,
        user.name || '',
        user.role,
        user.isActive ? 'Active' : 'Inactive',
        user.currentBand?.toString() || 'N/A',
        user.targetBand?.toString() || 'N/A',
        user.tasksDone.toString(),
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      ].map(field => `"${field}"`).join(','))
    ]

    return csvRows.join('\n')
  } catch (error) {
    console.error("Error exporting users CSV:", error)
    throw new Error("Failed to export users")
  }
}

export async function exportSubmissionsCSV() {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  try {
    const submissions = await prisma.testSubmission.findMany({
      select: {
        id: true,
        userId: true,
        testType: true,
        testId: true,
        score: true,
        bandScore: true,
        timeSpent: true,
        submittedAt: true,
        gradedAt: true
      },
      orderBy: [
        { submittedAt: 'desc' }
      ]
    })

    // Get user emails for better reporting
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {} as Record<string, any>)

    // Convert to CSV
    const headers = ['Submission ID', 'User Email', 'User Name', 'Test Type', 'Test ID', 'Score', 'Band Score', 'Time Spent (min)', 'Submitted At', 'Graded At']
    const csvRows = [
      headers.join(','),
      ...submissions.map(submission => {
        const user = userMap[submission.userId]
        return [
          submission.id,
          user?.email || 'Unknown',
          user?.name || 'Unknown',
          submission.testType,
          submission.testId,
          submission.score?.toString() || '0',
          submission.bandScore?.toString() || 'N/A',
          submission.timeSpent?.toString() || '0',
          submission.submittedAt.toISOString(),
          submission.gradedAt?.toISOString() || 'N/A'
        ].map(field => `"${field}"`).join(',')
      })
    ]

    return csvRows.join('\n')
  } catch (error) {
    console.error("Error exporting submissions CSV:", error)
    throw new Error("Failed to export submissions")
  }
}

export async function exportUsersPDF() {
  const session = await auth()
  
  if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
    throw new Error("Unauthorized")
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        currentBand: true,
        targetBand: true,
        tasksDone: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IELTS Platform - Users Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .active { color: green; }
          .inactive { color: red; }
        </style>
      </head>
      <body>
        <h1>IELTS Platform - Users Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Current Band</th>
              <th>Target Band</th>
              <th>Tasks Done</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => `
              <tr>
                <td>${user.id}</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</td>
                <td>${user.currentBand?.toFixed(1) || 'N/A'}</td>
                <td>${user.targetBand?.toFixed(1) || 'N/A'}</td>
                <td>${user.tasksDone}</td>
                <td>${user.createdAt.toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    return html
  } catch (error) {
    console.error("Error generating users PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}
