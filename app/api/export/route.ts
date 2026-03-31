import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { exportUsersCSV, exportSubmissionsCSV, exportUsersPDF } from "@/app/actions/admin"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !["ADMIN", "CEO"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const format = searchParams.get('format') || 'csv'

    if (type === 'users') {
      if (format === 'pdf') {
        const html = await exportUsersPDF()
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': 'attachment; filename="users-report.html"'
          }
        })
      } else {
        const csv = await exportUsersCSV()
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="users-export.csv"'
          }
        })
      }
    } else if (type === 'submissions') {
      const csv = await exportSubmissionsCSV()
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="submissions-export.csv"'
        }
      })
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}
