"use client"
import { CheckCircle, UserPlus, Calendar, AlertCircle } from "lucide-react"

const activities = [
  {
    type: "checkin",
    message: "Nguyễn Văn A đã check-in",
    time: "2 phút trước",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    type: "registration",
    message: "Trần Thị B đăng ký Workshop AI",
    time: "5 phút trước",
    icon: UserPlus,
    color: "text-blue-600",
  },
  {
    type: "event",
    message: "Hội nghị Công nghệ bắt đầu",
    time: "1 giờ trước",
    icon: Calendar,
    color: "text-purple-600",
  },
  {
    type: "alert",
    message: "Sự kiện sắp đầy chỗ",
    time: "2 giờ trước",
    icon: AlertCircle,
    color: "text-orange-600",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`p-1 rounded-full bg-muted`}>
            <activity.icon className={`h-3 w-3 ${activity.color}`} />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.message}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
