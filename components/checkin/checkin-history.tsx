"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

const recentCheckins = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    company: "Tech Corp",
    time: "2 phút trước",
    avatar: "",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    company: "AI Academy",
    time: "5 phút trước",
    avatar: "",
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    company: "Startup Hub",
    time: "8 phút trước",
    avatar: "",
  },
  {
    id: "4",
    name: "Phạm Thị Dung",
    company: "Medical Center",
    time: "12 phút trước",
    avatar: "",
  },
]

export function CheckinHistory() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-3">
      {recentCheckins.map((checkin) => (
        <div key={checkin.id} className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={checkin.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">{getInitials(checkin.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{checkin.name}</div>
            <div className="text-xs text-muted-foreground truncate">{checkin.company}</div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              Thành công
            </Badge>
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {checkin.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
