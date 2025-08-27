"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, CheckCircle, TrendingUp, Clock, AlertTriangle, BarChart3, Activity } from "lucide-react"
import { RealtimeChart } from "@/components/charts/realtime-chart"
import { RegistrationChart } from "@/components/charts/registration-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"

const statsData = [
  {
    title: "Tổng số hội nghị",
    value: "12",
    change: "+2 từ tháng trước",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    title: "Tổng người tham dự",
    value: "2,847",
    change: "+18% từ tháng trước",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    title: "Đã check-in hôm nay",
    value: "1,234",
    change: "87% tổng số đăng ký",
    icon: CheckCircle,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  {
    title: "Tỷ lệ tham dự",
    value: "87.3%",
    change: "+5.2% so với trung bình",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
]

const upcomingEvents = [
  {
    name: "Hội nghị Công nghệ 2024",
    date: "15/12/2024",
    attendees: 450,
    status: "active",
  },
  {
    name: "Workshop AI & Machine Learning",
    date: "18/12/2024",
    attendees: 120,
    status: "upcoming",
  },
  {
    name: "Seminar Khởi nghiệp",
    date: "22/12/2024",
    attendees: 200,
    status: "upcoming",
  },
]

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const statusLabels = {
  active: "Đang diễn ra",
  upcoming: "Sắp tới",
  completed: "Đã kết thúc",
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý toàn bộ hoạt động hội nghị</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Trực tuyến</span>
          </Badge>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Check-in Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Check-in theo thời gian thực</span>
            </CardTitle>
            <CardDescription>Số lượng check-in trong 24 giờ qua</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeChart />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Hoạt động gần đây</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Sự kiện</TabsTrigger>
          <TabsTrigger value="registrations">Đăng ký</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện sắp tới</CardTitle>
              <CardDescription>Danh sách các hội nghị và sự kiện trong thời gian tới</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{event.attendees} người</p>
                        <p className="text-xs text-muted-foreground">đã đăng ký</p>
                      </div>
                      <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                        {statusLabels[event.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đăng ký</CardTitle>
              <CardDescription>Xu hướng đăng ký trong 30 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tỷ lệ tham dự theo sự kiện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hội nghị Công nghệ 2024</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Workshop AI & ML</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seminar Khởi nghiệp</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cảnh báo hệ thống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Sự kiện sắp đầy</p>
                      <p className="text-xs text-muted-foreground">Workshop AI có 95% chỗ đã đăng ký</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Check-in sắp bắt đầu</p>
                      <p className="text-xs text-muted-foreground">Hội nghị Công nghệ bắt đầu trong 2 giờ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
