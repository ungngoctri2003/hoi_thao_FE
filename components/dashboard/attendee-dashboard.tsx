"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react"

const myEvents = [
  {
    name: "Hội nghị Công nghệ 2024",
    date: "15/12/2024",
    time: "08:00 - 17:00",
    location: "Trung tâm Hội nghị Quốc gia",
    status: "registered",
    rating: null,
  },
  {
    name: "Workshop AI & Machine Learning",
    date: "18/12/2024",
    time: "09:00 - 12:00",
    location: "Phòng hội thảo A1",
    status: "registered",
    rating: null,
  },
  {
    name: "Seminar Digital Marketing",
    date: "10/12/2024",
    time: "14:00 - 16:00",
    location: "Khách sạn Metropole",
    status: "completed",
    rating: 5,
  },
]

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const statusLabels = {
  registered: "Đã đăng ký",
  completed: "Đã tham dự",
  cancelled: "Đã hủy",
}

export function AttendeeDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold">Chào mừng trở lại!</h1>
        <p className="text-muted-foreground">Quản lý các sự kiện và hội nghị của bạn</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự kiện đã đăng ký</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 sắp tới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã tham dự</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Tháng này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.0</div>
            <p className="text-xs text-muted-foreground">Từ 1 đánh giá</p>
          </CardContent>
        </Card>
      </div>

      {/* My Events */}
      <Card>
        <CardHeader>
          <CardTitle>Sự kiện của tôi</CardTitle>
          <CardDescription>Danh sách các sự kiện bạn đã đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{event.name}</h4>
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      {statusLabels[event.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  {event.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">Đánh giá:</span>
                      {[...Array(event.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  {event.status === "registered" && (
                    <>
                      <Button size="sm">Xem chi tiết</Button>
                      <Button size="sm" variant="outline">
                        Hủy đăng ký
                      </Button>
                    </>
                  )}
                  {event.status === "completed" && (
                    <Button size="sm" variant="outline">
                      Xem chứng chỉ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Sự kiện sắp tới</CardTitle>
          <CardDescription>Các sự kiện mở đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Hội thảo Blockchain & Cryptocurrency</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>25/12/2024</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>150 chỗ</span>
                  </div>
                </div>
              </div>
              <Button>Đăng ký</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
