import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCEODashboardData } from "@/app/actions/ceo"
import { Users, DollarSign, TrendingUp, Activity, Building, Calendar, Download, FileSpreadsheet } from "lucide-react"

export default async function CEODashboard() {
  const data = await getCEODashboardData()

  if ("error" in data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{data.error}</p>
        </div>
      </div>
    )
  }

  const { kpis, testCompletionsByMonth, revenueByMonth, centrePerformance, recentActivity } = data

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CEO Dashboard</h1>
            <p className="text-gray-600">High-level platform insights and business metrics</p>
          </div>
          <div className="flex gap-4">
            <Button asChild>
              <a href="/api/export?type=users&format=csv">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Users CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/export?type=users&format=pdf">
                <Download className="w-4 h-4 mr-2" />
                Export Users PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/export?type=submissions&format=csv">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Submissions CSV
              </a>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalTeachers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.monthlyActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.totalTests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Completions Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Test Completions by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCompletionsByMonth.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.tests / 400) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{item.tests}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByMonth.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(item.revenue / 40000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">${item.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Centre Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Centre Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg Band</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centrePerformance.map((centre) => (
                  <TableRow key={centre.name}>
                    <TableCell className="font-medium">{centre.name}</TableCell>
                    <TableCell>{centre.students}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{centre.avgBand.toFixed(1)}</Badge>
                    </TableCell>
                    <TableCell>${centre.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(centre.avgBand / 9) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round((centre.avgBand / 9) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(user.updatedAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Portal Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              As CEO, you have full access to all administrative functions. You can manage users, 
              create announcements, and oversee platform operations.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <a href="/(admin)/dashboard">Go to Admin Portal</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/(teacher)/dashboard">View Teacher Portal</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
