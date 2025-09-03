"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Shield, User, Clock, MapPin, Phone, Globe } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "staff" | "attendee"
  status: "active" | "inactive" | "suspended"
  lastLogin: string
  createdAt: string
  avatar?: string
  phone?: string
  address?: string
  bio?: string
}

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onEdit?: (user: User) => void
  onToggleStatus?: (userId: string, newStatus: "active" | "inactive" | "suspended") => void
}

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const roleLabels = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  attendee: "Tham dự",
}

const statusLabels = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  suspended: "Tạm khóa",
}

export function UserDetailDialog({ open, onOpenChange, user, onEdit, onToggleStatus }: UserDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleToggleStatus = async () => {
    if (!user || !onToggleStatus) return

    setIsLoading(true)
    try {
      // Determine next status based on current status
      let newStatus: "active" | "inactive" | "suspended"
      if (user.status === 'active') {
        newStatus = 'inactive'
      } else if (user.status === 'inactive') {
        newStatus = 'suspended'
      } else {
        newStatus = 'active'
      }
      
      await onToggleStatus(user.id, newStatus)
    } catch (error) {
      console.error('Error toggling user status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground font-normal">ID: {user.id}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết người dùng trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="font-medium">{user.email}</div>
                </div>
                
                {user.phone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Số điện thoại
                    </div>
                    <div className="font-medium">{user.phone}</div>
                  </div>
                )}
              </div>

              {user.bio && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Giới thiệu</div>
                  <div className="text-sm">{user.bio}</div>
                </div>
              )}

              {user.address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </div>
                  <div className="text-sm">{user.address}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role and Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vai trò và trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Vai trò</div>
                  <Badge className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Trạng thái</div>
                  <Badge className={statusColors[user.status]}>
                    {statusLabels[user.status]}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Ngày tạo tài khoản
                  </div>
                  <div className="text-sm">{formatDate(user.createdAt)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Đăng nhập cuối
                  </div>
                  <div className="text-sm">{formatDate(user.lastLogin)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {onEdit && (
              <Button onClick={() => onEdit(user)}>
                Chỉnh sửa
              </Button>
            )}
            {onToggleStatus && (
              <Button 
                variant={user.status === 'active' ? 'destructive' : 'default'}
                onClick={handleToggleStatus}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 
                  user.status === 'active' ? 'Khóa tài khoản' :
                  user.status === 'inactive' ? 'Tạm khóa tài khoản' :
                  'Mở khóa tài khoản'
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
