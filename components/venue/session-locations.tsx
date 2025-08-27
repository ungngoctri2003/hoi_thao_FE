"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, MapPin, Users, Search } from "lucide-react"

interface Session {
  id: string
  title: string
  speaker: string
  room: string
  startTime: string
  endTime: string
  capacity: number
  registered: number
  category: string
  status: "upcoming" | "active" | "completed"
  description: string
}

interface SessionLocationsProps {
  floor: number
}

export default function SessionLocations({ floor }: SessionLocationsProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    // Generate sessions based on floor
    const generateSessions = (floorNumber: number): Session[] => {
      const baseSessions: Session[] = []

      if (floorNumber === 1) {
        baseSessions.push(
          {
            id: "1",
            title: "Keynote: Tương lai của Trí tuệ nhân tạo",
            speaker: "TS. Nguyễn Văn An",
            room: "Hội trường chính",
            startTime: "09:00",
            endTime: "10:30",
            capacity: 500,
            registered: 387,
            category: "Keynote",
            status: "active",
            description: "Khám phá những xu hướng mới nhất trong lĩnh vực AI và tác động đến tương lai",
          },
          {
            id: "2",
            title: "Workshop: Phát triển ứng dụng React",
            speaker: "Trần Thị Bình",
            room: "Phòng Workshop A",
            startTime: "11:00",
            endTime: "12:30",
            capacity: 100,
            registered: 78,
            category: "Workshop",
            status: "upcoming",
            description: "Hands-on workshop về React hooks và state management",
          },
          {
            id: "3",
            title: "Triển lãm công nghệ mới",
            speaker: "Nhiều diễn giả",
            room: "Khu triển lãm",
            startTime: "08:00",
            endTime: "18:00",
            capacity: 300,
            registered: 156,
            category: "Exhibition",
            status: "active",
            description: "Khám phá các sản phẩm và giải pháp công nghệ mới nhất",
          },
        )
      } else if (floorNumber === 2) {
        baseSessions.push(
          {
            id: "4",
            title: "Blockchain và Fintech",
            speaker: "Lê Minh Cường",
            room: "Phòng hội nghị B1",
            startTime: "10:00",
            endTime: "11:30",
            capacity: 150,
            registered: 142,
            category: "Technology",
            status: "active",
            description: "Ứng dụng blockchain trong lĩnh vực tài chính",
          },
          {
            id: "5",
            title: "Machine Learning Workshop",
            speaker: "Phạm Thị Dung",
            room: "Phòng hội nghị B2",
            startTime: "14:00",
            endTime: "16:00",
            capacity: 120,
            registered: 95,
            category: "Workshop",
            status: "upcoming",
            description: "Thực hành xây dựng mô hình machine learning",
          },
          {
            id: "6",
            title: "UX Design Principles",
            speaker: "Hoàng Minh Tuấn",
            room: "Phòng Workshop B",
            startTime: "13:00",
            endTime: "14:30",
            capacity: 80,
            registered: 67,
            category: "Design",
            status: "active",
            description: "Nguyên tắc thiết kế trải nghiệm người dùng hiệu quả",
          },
        )
      } else {
        baseSessions.push(
          {
            id: "7",
            title: "Executive Roundtable",
            speaker: "Ban lãnh đạo",
            room: "Phòng họp điều hành",
            startTime: "15:00",
            endTime: "16:30",
            capacity: 30,
            registered: 15,
            category: "Executive",
            status: "upcoming",
            description: "Thảo luận chiến lược và định hướng phát triển",
          },
          {
            id: "8",
            title: "Networking Session",
            speaker: "Tất cả tham dự",
            room: "VIP Lounge",
            startTime: "16:30",
            endTime: "18:00",
            capacity: 50,
            registered: 28,
            category: "Networking",
            status: "upcoming",
            description: "Giao lưu và kết nối với các chuyên gia trong ngành",
          },
        )
      }

      return baseSessions
    }

    setSessions(generateSessions(floor))
  }, [floor])

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.room.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || session.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || session.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ["all", ...Array.from(new Set(sessions.map((s) => s.category)))]
  const statuses = ["all", "upcoming", "active", "completed"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "upcoming":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang diễn ra"
      case "upcoming":
        return "Sắp bắt đầu"
      case "completed":
        return "Đã kết thúc"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm phiên họp, diễn giả, hoặc phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "Tất cả danh mục" : category}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "Tất cả trạng thái" : getStatusText(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{session.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{session.speaker}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)} flex-shrink-0 mt-1`}></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{session.room}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>
                    {session.registered}/{session.capacity}
                  </span>
                </div>
                <Badge variant="secondary">{session.category}</Badge>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{session.description}</p>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  Chỉ đường
                </Button>
                <Button size="sm" variant="outline">
                  Chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy phiên họp</h3>
            <p className="text-gray-600 dark:text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
