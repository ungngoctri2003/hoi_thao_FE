"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Users, Zap, Search, Heart, Star } from "lucide-react"
import AttendeeChat from "./attendee-chat"
import MatchingSystem from "./matching-system"

interface Attendee {
  id: string
  name: string
  title: string
  company: string
  avatar: string
  interests: string[]
  matchScore: number
  isOnline: boolean
  lastSeen: string
}

export default function NetworkingHub() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // Simulate loading attendees
    const mockAttendees: Attendee[] = [
      {
        id: "1",
        name: "Nguyễn Văn An",
        title: "Senior Developer",
        company: "Tech Corp",
        avatar: "/professional-man.png",
        interests: ["React", "Node.js", "AI"],
        matchScore: 95,
        isOnline: true,
        lastSeen: "Đang hoạt động",
      },
      {
        id: "2",
        name: "Trần Thị Bình",
        title: "Product Manager",
        company: "Innovation Ltd",
        avatar: "/professional-woman.png",
        interests: ["Product Strategy", "UX", "Analytics"],
        matchScore: 88,
        isOnline: true,
        lastSeen: "Đang hoạt động",
      },
      {
        id: "3",
        name: "Lê Minh Cường",
        title: "Data Scientist",
        company: "AI Solutions",
        avatar: "/data-scientist-analyzing.png",
        interests: ["Machine Learning", "Python", "Statistics"],
        matchScore: 82,
        isOnline: false,
        lastSeen: "5 phút trước",
      },
    ]
    setAttendees(mockAttendees)
  }, [])

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.interests.some((interest) => interest.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "online" && attendee.isOnline) ||
      (selectedFilter === "high-match" && attendee.matchScore >= 85)

    return matchesSearch && matchesFilter
  })

  const handleStartChat = (attendee: Attendee) => {
    setSelectedAttendee(attendee)
    setShowChat(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số người tham dự</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
                <p className="text-2xl font-bold">342</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tin nhắn hôm nay</p>
                <p className="text-2xl font-bold">2,156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kết nối mới</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Khám phá</TabsTrigger>
          <TabsTrigger value="matches">Gợi ý kết nối</TabsTrigger>
          <TabsTrigger value="messages">Tin nhắn</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, công ty, hoặc sở thích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={selectedFilter === "online" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("online")}
              >
                Đang hoạt động
              </Button>
              <Button
                variant={selectedFilter === "high-match" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("high-match")}
              >
                Phù hợp cao
              </Button>
            </div>
          </div>

          {/* Attendees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttendees.map((attendee) => (
              <Card key={attendee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {attendee.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{attendee.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{attendee.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{attendee.company}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{attendee.matchScore}% phù hợp</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {attendee.interests.slice(0, 3).map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleStartChat(attendee)}>
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Nhắn tin
                    </Button>
                    <Button size="sm" variant="outline">
                      Kết nối
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{attendee.lastSeen}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches">
          <MatchingSystem />
        </TabsContent>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {selectedAttendee ? (
                <AttendeeChat attendee={selectedAttendee} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Chọn một người từ danh sách để bắt đầu trò chuyện
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cuộc trò chuyện gần đây</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {attendees.slice(0, 5).map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleStartChat(attendee)}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.avatar || "/placeholder.svg"} alt={attendee.name} />
                          <AvatarFallback className="text-xs">{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {attendee.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attendee.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{attendee.lastSeen}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chat Modal */}
      {showChat && selectedAttendee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-96">
            <AttendeeChat attendee={selectedAttendee} onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
