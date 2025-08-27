"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Download, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: "admin" | "staff" | "attendee"
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  status: "success" | "failed" | "warning"
  category: "auth" | "user" | "conference" | "system" | "data"
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-12-14 10:30:15",
    user: "Nguyễn Văn Admin",
    userRole: "admin",
    action: "Tạo hội nghị mới",
    resource: "conferences",
    details: "Tạo hội nghị 'Workshop AI 2024'",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    status: "success",
    category: "conference",
  },
  {
    id: "2",
    timestamp: "2024-12-14 10:25:42",
    user: "Trần Thị Staff",
    userRole: "staff",
    action: "Check-in người tham dự",
    resource: "attendees",
    details: "Check-in thành công cho Lê Văn A",
    ipAddress: "192.168.1.101",
    userAgent: "Chrome 120.0.0.0",
    status: "success",
    category: "data",
  },
  {
    id: "3",
    timestamp: "2024-12-14 10:20:18",
    user: "Unknown User",
    userRole: "attendee",
    action: "Đăng nhập thất bại",
    resource: "auth",
    details: "Sai mật khẩu cho email: user@test.com",
    ipAddress: "203.162.4.191",
    userAgent: "Chrome 119.0.0.0",
    status: "failed",
    category: "auth",
  },
  {
    id: "4",
    timestamp: "2024-12-14 10:15:33",
    user: "Nguyễn Văn Admin",
    userRole: "admin",
    action: "Cập nhật cài đặt hệ thống",
    resource: "settings",
    details: "Thay đổi cấu hình SMTP",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
    status: "success",
    category: "system",
  },
  {
    id: "5",
    timestamp: "2024-12-14 10:10:07",
    user: "Phạm Thị User",
    userRole: "attendee",
    action: "Đăng ký tham dự",
    resource: "registrations",
    details: "Đăng ký tham dự 'Hội nghị Công nghệ 2024'",
    ipAddress: "14.160.33.45",
    userAgent: "Safari 17.0",
    status: "success",
    category: "data",
  },
]

const statusColors = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

const statusLabels = {
  success: "Thành công",
  failed: "Thất bại",
  warning: "Cảnh báo",
}

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  warning: AlertTriangle,
}

const categoryColors = {
  auth: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  user: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  conference: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  system: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  data: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
}

const categoryLabels = {
  auth: "Xác thực",
  user: "Người dùng",
  conference: "Hội nghị",
  system: "Hệ thống",
  data: "Dữ liệu",
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    const matchesUser = userFilter === "all" || log.userRole === userFilter
    return matchesSearch && matchesStatus && matchesCategory && matchesUser
  })

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getLogStats = () => {
    return {
      total: logs.length,
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      warning: logs.filter((l) => l.status === "warning").length,
    }
  }

  const stats = getLogStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Nhật ký hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất nhật ký
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Hôm nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <p className="text-xs text-muted-foreground">{Math.round((stats.success / stats.total) * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">{Math.round((stats.failed / stats.total) * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <p className="text-xs text-muted-foreground">{Math.round((stats.warning / stats.total) * 100)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo người dùng, hành động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="auth">Xác thực</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="conference">Hội nghị</SelectItem>
                <SelectItem value="system">Hệ thống</SelectItem>
                <SelectItem value="data">Dữ liệu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hoạt động</CardTitle>
          <CardDescription>
            Hiển thị {paginatedLogs.length} trong tổng số {filteredLogs.length} bản ghi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Chi tiết</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => {
                  const StatusIcon = statusIcons[log.status]
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{log.timestamp}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{getInitials(log.user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{log.user}</div>
                            <div className="text-xs text-muted-foreground">{log.userRole}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">{log.resource}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{log.details}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryColors[log.category]}>{categoryLabels[log.category]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusColors[log.status]}>{statusLabels[log.status]}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{log.ipAddress}</div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} trong {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
