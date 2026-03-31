"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCEODashboardData() {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== "CEO") {
    return {
      error: "Unauthorized"
    }
  }

  try {
    // Get high-level KPIs
    const totalUsers = await prisma.user.count()
    const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } })
    const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } })
    const totalTests = await prisma.testSubmission.count()
    
    // Monthly Active Users (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const monthlyActiveUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Test completions by month (mock data for now)
    const testCompletionsByMonth = [
      { month: 'Jan', tests: 145 },
      { month: 'Feb', tests: 189 },
      { month: 'Mar', tests: 234 },
      { month: 'Apr', tests: 278 },
      { month: 'May', tests: 312 },
      { month: 'Jun', tests: 356 }
    ]

    // Revenue data (mock data for now)
    const revenueByMonth = [
      { month: 'Jan', revenue: 12500 },
      { month: 'Feb', revenue: 15200 },
      { month: 'Mar', revenue: 18900 },
      { month: 'Apr', revenue: 22100 },
      { month: 'May', revenue: 26800 },
      { month: 'Jun', revenue: 31200 }
    ]

    // Centre performance (mock data for now)
    const centrePerformance = [
      { name: 'London Centre', students: 245, avgBand: 6.8, revenue: 45600 },
      { name: 'New York Centre', students: 189, avgBand: 7.1, revenue: 38900 },
      { name: 'Tokyo Centre', students: 167, avgBand: 6.9, revenue: 34200 },
      { name: 'Sydney Centre', students: 134, avgBand: 7.2, revenue: 28900 },
      { name: 'Toronto Centre', students: 98, avgBand: 6.7, revenue: 23400 }
    ]

    // Recent activity
    const recentActivity = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    return {
      kpis: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalTests,
        monthlyActiveUsers
      },
      testCompletionsByMonth,
      revenueByMonth,
      centrePerformance,
      recentActivity
    }
  } catch (error) {
    console.error("Error fetching CEO dashboard data:", error)
    return {
      error: "Failed to fetch dashboard data"
    }
  }
}
