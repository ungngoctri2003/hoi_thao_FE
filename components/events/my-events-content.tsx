"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Search, Filter } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  status: "registered" | "attended" | "missed" | "upcoming"
  category: string
  attendees: number
  maxAttendees: number
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Hội nghị Công nghệ AI 2024",
    description: "Khám phá những xu hướng mới nhất trong trí tuệ nhân tạo",
    date: "2024-03-15",
    time: "09:00",
    location: "Trung tâm Hội nghị Quốc gia",
    status: "upcoming",
    category: "Công nghệ",
    attendees: 245,
    maxAttendees: 300,
  },
  {
    id: "2",
    title: "Workshop Phát triển Web",
    description: "Học cách xây dựng ứng dụng web hiện đại",
    date: "2024-03-10",
    time: "14:00",
    location: "Phòng họp A",
    status: "attended",
    category: "Giáo dục",
    attendees: 50,
    maxAttendees: 50,
  },
  {
    id: "3",
    title: "Seminar Marketing Digital",
    description: "Chiến lược marketing trong thời đại số",
    date: "2024-03-08",
    time: "10:30",
    location: "Khách sạn Metropole",
    status: "missed",
    category: "Kinh doanh",
    attendees: 120,
    maxAttendees: 150,
  },
  {
    id: "4",
    title: "Hội thảo Khởi nghiệp",
    description: "Chia sẻ kinh nghiệm từ các startup thành công",
    date: "2024-03-20",
    time: "16:00",
    location: "Coworking Space",
    status: "registered",
    category: "Khởi nghiệp",
    attendees: 80,
    maxAttendees: 100,
  },
]

const statusLabels = {
  registered: "Đã đăng ký",
  attended: "Đã tham dự",
  missed: "Đã bỏ lỡ",
  upcoming: "Sắp diễn ra",
}

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attended: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  missed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  upcoming: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

export function MyEventsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(mockEvents.map((event) => event.category)))]

  const getEventsByStatus = (status: Event["status"]) => {
    return filteredEvents.filter((event) => event.status === status)
  }

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </div>
          <Badge className={statusColors[event.status]}>{statusLabels[event.status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {event.attendees}/{event.maxAttendees}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {event.status === "upcoming" && (
            <Button size="sm" className="flex-1">
              Xem chi tiết
            </Button>
          )}
          {event.status === "registered" && (
            <>
              <Button size="sm" className="flex-1">
                Xem chi tiết
              </Button>
              <Button size="sm" variant="outline">
                Hủy đăng ký
              </Button>
            </>
          )}
          {event.status === "attended" && (
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              Tải chứng chỉ
            </Button>
          )}
          {event.status === "missed" && (
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              Xem lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Sự kiện của tôi</h1>
        <p className="text-muted-foreground mt-2">Quản lý và theo dõi các sự kiện bạn đã đăng ký tham dự</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tất cả ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp tới ({getEventsByStatus("upcoming").length})</TabsTrigger>
          <TabsTrigger value="registered">Đã đăng ký ({getEventsByStatus("registered").length})</TabsTrigger>
          <TabsTrigger value="attended">Đã tham dự ({getEventsByStatus("attended").length})</TabsTrigger>
          <TabsTrigger value="missed">Đã bỏ lỡ ({getEventsByStatus("missed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getEventsByStatus("upcoming").map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registered" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getEventsByStatus("registered").map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attended" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getEventsByStatus("attended").map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="missed" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getEventsByStatus("missed").map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy sự kiện nào phù hợp với bộ lọc của bạn.</p>
        </div>
      )}
    </div>
  )
}
