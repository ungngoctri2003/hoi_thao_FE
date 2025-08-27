"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Users, MessageCircle, Eye } from "lucide-react"
import LivePolling from "./live-polling"
import QASystem from "./qa-system"
import SessionFeedback from "./session-feedback"
import SessionStream from "./session-stream"

interface LiveSession {
  id: string
  title: string
  speaker: string
  room: string
  startTime: string
  endTime: string
  status: "live" | "upcoming" | "ended"
  viewers: number
  participants: number
  description: string
  tags: string[]
  streamUrl?: string
}

export default function LiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)
  const [activeTab, setActiveTab] = useState("stream")

  useEffect(() => {
    // Simulate live sessions data
    const mockSessions: LiveSession[] = [
      {
        id: "1",
        title: "Keynote: Tương lai của Trí tuệ nhân tạo",
        speaker: "TS. Nguyễn Văn An",
        room: "Hội trường chính",
        startTime: "09:00",
        endTime: "10:30",
        status: "live",
        viewers: 387,
        participants: 156,
        description: "Khám phá những xu hướng mới nhất trong lĩnh vực AI và tác động đến tương lai",
        tags: ["AI", "Technology", "Future"],
        streamUrl: "https://example.com/stream1",
      },
      {
        id: "2",
        title: "Workshop: Phát triển ứng dụng React",
        speaker: "Trần Thị Bình",
        room: "Phòng Workshop A",
        startTime: "11:00",
        endTime: "12:30",
        status: "upcoming",
        viewers: 0,
        participants: 78,
        description: "Hands-on workshop về React hooks và state management",
        tags: ["React", "JavaScript", "Workshop"],
      },
      {
        id: "3",
        title: "Blockchain và Fintech",
        speaker: "Lê Minh Cường",
        room: "Phòng hội nghị B1",
        startTime: "10:00",
        endTime: "11:30",
        status: "live",
        viewers: 142,
        participants: 89,
        description: "Ứng dụng blockchain trong lĩnh vực tài chính",
        tags: ["Blockchain", "Fintech", "Cryptocurrency"],
      },
    ]

    setSessions(mockSessions)
    setSelectedSession(mockSessions[0])
  }, [])

  useEffect(() => {
    // Simulate real-time viewer updates
    const interval = setInterval(() => {
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          viewers:
            session.status === "live"
              ? Math.max(50, session.viewers + Math.floor(Math.random() * 20 - 10))
              : session.viewers,
          participants:
            session.status === "live"
              ? Math.max(20, session.participants + Math.floor(Math.random() * 10 - 5))
              : session.participants,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 animate-pulse"
      case "upcoming":
        return "bg-blue-500"
      case "ended":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "TRỰC TIẾP"
      case "upcoming":
        return "SẮP DIỄN RA"
      case "ended":
        return "ĐÃ KẾT THÚC"
      default:
        return status
    }
  }

  const liveSessions = sessions.filter((s) => s.status === "live")
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming")

  return (
    <div className="space-y-6">
      {/* Live Sessions Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang trực tiếp</p>
                <p className="text-2xl font-bold">{liveSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người xem</p>
                <p className="text-2xl font-bold">{liveSessions.reduce((sum, s) => sum + s.viewers, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tham gia tương tác</p>
                <p className="text-2xl font-bold">{liveSessions.reduce((sum, s) => sum + s.participants, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sắp diễn ra</p>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Phiên họp đang diễn ra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm leading-tight">{session.title}</h4>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)} flex-shrink-0 mt-1`}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{session.speaker}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500">{session.room}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{session.viewers}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{session.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {liveSessions.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Không có phiên họp nào đang diễn ra
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sắp diễn ra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-sm leading-tight mb-1">{session.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{session.speaker}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-500">{session.startTime}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.participants} đã đăng ký
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-xl">{selectedSession.title}</CardTitle>
                      <Badge className={getStatusColor(selectedSession.status)}>
                        {getStatusText(selectedSession.status)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{selectedSession.speaker}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>{selectedSession.room}</span>
                      <span>
                        {selectedSession.startTime} - {selectedSession.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>{selectedSession.viewers} người xem</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>{selectedSession.participants} tham gia</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="stream">Trực tiếp</TabsTrigger>
                    <TabsTrigger value="poll">Bình chọn</TabsTrigger>
                    <TabsTrigger value="qa">Hỏi đáp</TabsTrigger>
                    <TabsTrigger value="feedback">Đánh giá</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stream" className="mt-4">
                    <SessionStream session={selectedSession} />
                  </TabsContent>

                  <TabsContent value="poll" className="mt-4">
                    <LivePolling sessionId={selectedSession.id} />
                  </TabsContent>

                  <TabsContent value="qa" className="mt-4">
                    <QASystem sessionId={selectedSession.id} />
                  </TabsContent>

                  <TabsContent value="feedback" className="mt-4">
                    <SessionFeedback sessionId={selectedSession.id} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chọn một phiên họp</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Chọn một phiên họp từ danh sách để xem nội dung và tham gia tương tác
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
