"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, ThumbsUp, Send, Filter, Clock, CheckCircle } from "lucide-react"

interface Question {
  id: string
  author: string
  avatar: string
  question: string
  timestamp: Date
  upvotes: number
  hasUpvoted: boolean
  status: "pending" | "answered" | "selected"
  answer?: string
  answeredBy?: string
  answeredAt?: Date
}

interface QASystemProps {
  sessionId: string
}

export default function QASystem({ sessionId }: QASystemProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular")

  useEffect(() => {
    // Simulate Q&A data
    const mockQuestions: Question[] = [
      {
        id: "1",
        author: "Nguyễn Văn An",
        avatar: "/placeholder.svg",
        question: "Làm thế nào để đảm bảo AI không có bias trong quá trình ra quyết định?",
        timestamp: new Date(Date.now() - 300000),
        upvotes: 23,
        hasUpvoted: false,
        status: "answered",
        answer:
          "Đây là một câu hỏi rất quan trọng. Chúng ta cần đảm bảo dữ liệu training đa dạng, sử dụng các kỹ thuật fairness testing, và có quy trình audit thường xuyên.",
        answeredBy: "TS. Nguyễn Văn An",
        answeredAt: new Date(Date.now() - 120000),
      },
      {
        id: "2",
        author: "Trần Thị Bình",
        avatar: "/placeholder.svg",
        question: "Xu hướng phát triển của AI trong 5 năm tới sẽ như thế nào?",
        timestamp: new Date(Date.now() - 240000),
        upvotes: 18,
        hasUpvoted: true,
        status: "selected",
      },
      {
        id: "3",
        author: "Lê Minh Cường",
        avatar: "/placeholder.svg",
        question: "Có thể chia sẻ về các công cụ AI mà doanh nghiệp nhỏ có thể sử dụng không?",
        timestamp: new Date(Date.now() - 180000),
        upvotes: 15,
        hasUpvoted: false,
        status: "pending",
      },
      {
        id: "4",
        author: "Phạm Thị Dung",
        avatar: "/placeholder.svg",
        question: "Làm sao để bắt đầu career trong lĩnh vực AI?",
        timestamp: new Date(Date.now() - 120000),
        upvotes: 12,
        hasUpvoted: false,
        status: "pending",
      },
    ]

    setQuestions(mockQuestions)
  }, [sessionId])

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return

    const question: Question = {
      id: Date.now().toString(),
      author: "Bạn",
      avatar: "/placeholder.svg",
      question: newQuestion,
      timestamp: new Date(),
      upvotes: 0,
      hasUpvoted: false,
      status: "pending",
    }

    setQuestions((prev) => [question, ...prev])
    setNewQuestion("")
  }

  const handleUpvote = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && !q.hasUpvoted) {
          return {
            ...q,
            upvotes: q.upvotes + 1,
            hasUpvoted: true,
          }
        }
        return q
      }),
    )
  }

  const filteredQuestions = questions.filter((q) => {
    if (filter === "all") return true
    return q.status === filter
  })

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === "popular") {
      return b.upvotes - a.upvotes
    }
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500"
      case "selected":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "answered":
        return "Đã trả lời"
      case "selected":
        return "Được chọn"
      case "pending":
        return "Chờ trả lời"
      default:
        return status
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    return date.toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-6">
      {/* Submit Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Đặt câu hỏi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Nhập câu hỏi của bạn..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Câu hỏi của bạn sẽ được gửi đến diễn giả và có thể được trả lời trong phiên Q&A
            </p>
            <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Gửi câu hỏi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ trả lời</option>
              <option value="answered">Đã trả lời</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="recent">Mới nhất</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{questions.length} câu hỏi</span>
          <span>{questions.filter((q) => q.status === "answered").length} đã trả lời</span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.avatar || "/placeholder.svg"} alt={question.author} />
                  <AvatarFallback>{question.author.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{question.author}</span>
                      <Badge className={getStatusColor(question.status)} variant="secondary">
                        {getStatusText(question.status)}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(question.timestamp)}</span>
                  </div>

                  <p className="text-gray-900 dark:text-white">{question.question}</p>

                  {question.answer && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Trả lời bởi {question.answeredBy}
                        </span>
                        {question.answeredAt && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {formatTime(question.answeredAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{question.answer}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-2">
                    <Button
                      size="sm"
                      variant={question.hasUpvoted ? "default" : "outline"}
                      onClick={() => handleUpvote(question.id)}
                      disabled={question.hasUpvoted}
                    >
                      <ThumbsUp className={`h-3 w-3 mr-1 ${question.hasUpvoted ? "fill-current" : ""}`} />
                      {question.upvotes}
                    </Button>

                    {question.status === "selected" && (
                      <Badge className="bg-blue-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Sẽ được trả lời
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedQuestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có câu hỏi nào</h3>
              <p className="text-gray-600 dark:text-gray-400">Hãy là người đầu tiên đặt câu hỏi!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
