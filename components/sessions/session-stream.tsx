"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Heart, Share2 } from "lucide-react"

interface SessionStreamProps {
  session: {
    id: string
    title: string
    speaker: string
    status: string
    streamUrl?: string
  }
}

export default function SessionStream({ session }: SessionStreamProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(80)
  const [quality, setQuality] = useState("1080p")
  const [likes, setLikes] = useState(234)
  const [hasLiked, setHasLiked] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; message: string; time: string }>>(
    [],
  )

  useEffect(() => {
    // Simulate live chat messages
    const messages = [
      { id: "1", user: "Nguyễn An", message: "Presentation rất hay!", time: "10:15" },
      { id: "2", user: "Trần Bình", message: "Có thể chia sẻ slide được không?", time: "10:16" },
      { id: "3", user: "Lê Cường", message: "Câu hỏi về AI ethics rất thú vị", time: "10:17" },
      { id: "4", user: "Phạm Dung", message: "👏👏👏", time: "10:18" },
      { id: "5", user: "Hoàng Tuấn", message: "Khi nào có Q&A session?", time: "10:19" },
    ]

    setChatMessages(messages)

    // Simulate new messages
    const interval = setInterval(() => {
      const newMessage = {
        id: Date.now().toString(),
        user: `User${Math.floor(Math.random() * 100)}`,
        message: [
          "Rất hữu ích!",
          "Cảm ơn diễn giả",
          "Có thể lặp lại phần này không?",
          "Excellent presentation!",
          "👍",
          "Câu hỏi hay quá",
        ][Math.floor(Math.random() * 6)],
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => [...prev.slice(-10), newMessage])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1)
      setHasLiked(true)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: `Đang xem: ${session.title} bởi ${session.speaker}`,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {/* Simulated video content */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
            <p className="text-lg opacity-80">{session.speaker}</p>
            {session.status === "live" && <Badge className="bg-red-500 animate-pulse mt-4">🔴 TRỰC TIẾP</Badge>}
          </div>
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none slider"
                />
              </div>

              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/30"
              >
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            variant={hasLiked ? "default" : "outline"}
            onClick={handleLike}
            className={hasLiked ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <Heart className={`h-4 w-4 mr-1 ${hasLiked ? "fill-current" : ""}`} />
            {likes}
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Chia sẻ
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Chất lượng: {quality}</span>
        </div>
      </div>

      {/* Live Chat */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Chat trực tiếp</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2 text-sm">
                <span className="font-medium text-blue-600 dark:text-blue-400 flex-shrink-0">{msg.user}:</span>
                <span className="flex-1">{msg.message}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{msg.time}</span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement
                  if (input.value.trim()) {
                    const newMessage = {
                      id: Date.now().toString(),
                      user: "Bạn",
                      message: input.value,
                      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
                    }
                    setChatMessages((prev) => [...prev, newMessage])
                    input.value = ""
                  }
                }
              }}
            />
            <Button size="sm">Gửi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
