"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Clock, CheckCircle } from "lucide-react"

interface Poll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
  totalVotes: number
  isActive: boolean
  timeLeft: number
  hasVoted: boolean
  userVote?: string
}

interface LivePollingProps {
  sessionId: string
}

export default function LivePolling({ sessionId }: LivePollingProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [activePoll, setActivePoll] = useState<Poll | null>(null)

  useEffect(() => {
    // Simulate polling data
    const mockPolls: Poll[] = [
      {
        id: "1",
        question: "Bạn nghĩ AI sẽ thay thế con người trong lĩnh vực nào sớm nhất?",
        options: [
          { id: "a", text: "Dịch vụ khách hàng", votes: 45 },
          { id: "b", text: "Vận tải và logistics", votes: 32 },
          { id: "c", text: "Phân tích dữ liệu", votes: 67 },
          { id: "d", text: "Sản xuất", votes: 28 },
        ],
        totalVotes: 172,
        isActive: true,
        timeLeft: 45,
        hasVoted: false,
      },
      {
        id: "2",
        question: "Mức độ quan tâm của bạn đến AI Ethics?",
        options: [
          { id: "a", text: "Rất quan tâm", votes: 89 },
          { id: "b", text: "Quan tâm", votes: 56 },
          { id: "c", text: "Bình thường", votes: 23 },
          { id: "d", text: "Không quan tâm", votes: 4 },
        ],
        totalVotes: 172,
        isActive: false,
        timeLeft: 0,
        hasVoted: true,
        userVote: "a",
      },
    ]

    setPolls(mockPolls)
    setActivePoll(mockPolls.find((p) => p.isActive) || null)
  }, [sessionId])

  useEffect(() => {
    // Simulate real-time vote updates
    const interval = setInterval(() => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) => {
          if (poll.isActive) {
            const updatedOptions = poll.options.map((option) => ({
              ...option,
              votes: option.votes + Math.floor(Math.random() * 3),
            }))
            const newTotalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0)

            return {
              ...poll,
              options: updatedOptions,
              totalVotes: newTotalVotes,
              timeLeft: Math.max(0, poll.timeLeft - 1),
            }
          }
          return poll
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleVote = (pollId: string, optionId: string) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id === pollId && !poll.hasVoted) {
          const updatedOptions = poll.options.map((option) => ({
            ...option,
            votes: option.id === optionId ? option.votes + 1 : option.votes,
          }))

          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1,
            hasVoted: true,
            userVote: optionId,
          }
        }
        return poll
      }),
    )

    if (activePoll?.id === pollId) {
      setActivePoll((prev) =>
        prev
          ? {
              ...prev,
              hasVoted: true,
              userVote: optionId,
            }
          : null,
      )
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Active Poll */}
      {activePoll && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Bình chọn trực tiếp</CardTitle>
              <div className="flex items-center space-x-2">
                {activePoll.timeLeft > 0 ? (
                  <Badge className="bg-green-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(activePoll.timeLeft)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Đã kết thúc</Badge>
                )}
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {activePoll.totalVotes} phiếu
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-lg">{activePoll.question}</h3>

            <div className="space-y-3">
              {activePoll.options.map((option) => {
                const percentage = activePoll.totalVotes > 0 ? (option.votes / activePoll.totalVotes) * 100 : 0
                const isUserChoice = activePoll.userVote === option.id

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={isUserChoice ? "default" : "outline"}
                          onClick={() => handleVote(activePoll.id, option.id)}
                          disabled={activePoll.hasVoted || activePoll.timeLeft === 0}
                          className="min-w-[40px]"
                        >
                          {isUserChoice ? <CheckCircle className="h-4 w-4" /> : option.id.toUpperCase()}
                        </Button>
                        <span className="font-medium">{option.text}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.votes} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>

            {activePoll.hasVoted && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Cảm ơn bạn đã tham gia bình chọn!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Poll History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Lịch sử bình chọn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {polls
            .filter((poll) => !poll.isActive)
            .map((poll) => (
              <div key={poll.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{poll.question}</h4>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {poll.totalVotes} phiếu
                  </Badge>
                </div>

                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
                    const isUserChoice = poll.userVote === option.id

                    return (
                      <div key={option.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className={`font-medium ${isUserChoice ? "text-blue-600 dark:text-blue-400" : ""}`}>
                            {option.text}
                            {isUserChoice && " ✓"}
                          </span>
                          <div className="flex-1 mx-2">
                            <Progress value={percentage} className="h-1" />
                          </div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          {option.votes} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

          {polls.filter((poll) => !poll.isActive).length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có bình chọn nào được thực hiện</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
