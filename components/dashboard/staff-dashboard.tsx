"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CheckCircle, Clock, QrCode } from "lucide-react"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { useAuth } from "@/hooks/use-auth"
import { RoleInfoPanel } from "@/components/layout/role-info-panel"

const todayStats = [
  {
    title: "Cần check-in hôm nay",
    value: "450",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  {
    title: "Đã check-in",
    value: "287",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  {
    title: "Chưa check-in",
    value: "163",
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
  },
]

export function StaffDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            Chào mừng, {user?.name || 'Nhân viên'}!
          </h1>
          <p className="text-muted-foreground">Quản lý check-in và hỗ trợ người tham dự</p>
        </div>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Bắt đầu check-in
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">
                {index === 1 && "64% hoàn thành"}
                {index === 2 && "36% còn lại"}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Role Info Panel */}
        <RoleInfoPanel />
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng thường dùng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <QrCode className="mr-2 h-4 w-4" />
              Quét mã QR check-in
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              Tìm kiếm người tham dự
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <CheckCircle className="mr-2 h-4 w-4" />
              Check-in thủ công
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Current Event Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sự kiện hiện tại</CardTitle>
          <CardDescription>Hội nghị Công nghệ 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">450</div>
              <div className="text-sm text-muted-foreground">Tổng đăng ký</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">287</div>
              <div className="text-sm text-muted-foreground">Đã check-in</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">163</div>
              <div className="text-sm text-muted-foreground">Chưa check-in</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">64%</div>
              <div className="text-sm text-muted-foreground">Tỷ lệ tham dự</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
