"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, FileText, AlertTriangle, CheckCircle, XCircle, RefreshCw, Info, Eye, User, Filter, X, ChevronDown, Trash2 } from "lucide-react"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import { AuditLog } from "@/lib/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Helper function to get user display name and role from audit log
const getUserDisplayInfo = (log: AuditLog, getUserInfo: (userId: number) => { id: number; name: string; email: string; role: string; avatar?: string } | null) => {
  if (!log.userId) {
    return {
      name: 'Hệ thống',
      role: 'Hệ thống',
      avatar: undefined
    }
  }
  
  const userInfo = getUserInfo(log.userId)
  if (userInfo) {
    // Convert role to Vietnamese
    const roleMap: Record<string, string> = {
      'admin': 'Quản trị viên',
      'staff': 'Nhân viên', 
      'attendee': 'Người tham dự',
      'user': 'Người dùng',
      'system': 'Hệ thống'
    }
    
    return {
      name: userInfo.name,
      role: roleMap[userInfo.role] || userInfo.role,
      avatar: userInfo.avatar
    }
  }
  
  // Fallback if user info not found
  return {
    name: `User #${log.userId}`,
    role: 'Người dùng',
    avatar: undefined
  }
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 50) => {
  if (!text) return 'N/A'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Helper function to get action icon
const getActionIcon = (actionName: string) => {
  const action = actionName?.toLowerCase() || ''
  if (action.includes('create') || action.includes('tạo')) return '➕'
  if (action.includes('update') || action.includes('cập nhật')) return '✏️'
  if (action.includes('delete') || action.includes('xóa')) return '🗑️'
  if (action.includes('login') || action.includes('đăng nhập')) return '🔐'
  if (action.includes('logout') || action.includes('đăng xuất')) return '🚪'
  if (action.includes('check') || action.includes('kiểm tra')) return '✅'
  return '📝'
}

// Helper function to format details in a user-friendly way
const formatDetails = (details: string, actionName: string, resourceName: string) => {
  if (!details) return 'Không có chi tiết'
  
  try {
    // Try to parse JSON details
    const parsed = JSON.parse(details)
    
    // Check if it's a frontend log
    if (parsed.type === 'frontend') {
      return formatFrontendDetails(parsed, actionName)
    }
    
    // Format based on action type
    if (actionName?.toLowerCase().includes('update')) {
      return formatUpdateDetails(parsed, resourceName)
    } else if (actionName?.toLowerCase().includes('create')) {
      return formatCreateDetails(parsed, resourceName)
    } else if (actionName?.toLowerCase().includes('delete')) {
      return formatDeleteDetails(parsed, resourceName)
    } else if (actionName?.toLowerCase().includes('login')) {
      return formatLoginDetails(parsed)
    } else {
      return formatGenericDetails(parsed)
    }
  } catch {
    // If not JSON, return as is but truncated
    return truncateText(details, 100)
  }
}

const formatUpdateDetails = (parsed: any, resourceName: string) => {
  const method = parsed.method || 'PATCH'
  const path = parsed.path || ''
  const duration = parsed.durationMs ? `${parsed.durationMs}ms` : ''
  const body = parsed.body || {}
  
  // Get resource ID from path
  let resourceId = ''
  if (path) {
    const pathParts = path.split('/')
    resourceId = pathParts[pathParts.length - 1]
  }
  
  // Convert resource names to Vietnamese
  const resourceMap: Record<string, string> = {
    'attendee': 'người tham dự',
    'attendees': 'người tham dự',
    'user': 'người dùng',
    'users': 'người dùng',
    'conference': 'hội nghị',
    'conferences': 'hội nghị',
    'session': 'phiên họp',
    'sessions': 'phiên họp',
    'registration': 'đăng ký',
    'registrations': 'đăng ký'
  }
  
  const vietnameseResource = resourceMap[resourceName?.toLowerCase() || ''] || resourceName || 'tài nguyên'
  
  // Build a more descriptive message
  let result = `Cập nhật thông tin ${vietnameseResource}`
  
  if (resourceId && !isNaN(Number(resourceId))) {
    result += ` #${resourceId}`
  }
  
  // Show specific changes made
  if (Object.keys(body).length > 0) {
    const changes = []
    const fieldMap: Record<string, string> = {
      'name': 'Tên',
      'email': 'Email',
      'status': 'Trạng thái',
      'role': 'Vai trò',
      'phone': 'Số điện thoại',
      'company': 'Công ty',
      'position': 'Chức vụ',
      'description': 'Mô tả',
      'location': 'Địa điểm',
      'startDate': 'Ngày bắt đầu',
      'endDate': 'Ngày kết thúc',
      'capacity': 'Sức chứa',
      'category': 'Danh mục',
      'organizer': 'Người tổ chức',
      'avatar': 'Ảnh đại diện',
      'dietary': 'Yêu cầu ăn uống',
      'specialNeeds': 'Nhu cầu đặc biệt',
      'dateOfBirth': 'Ngày sinh',
      'gender': 'Giới tính'
    }
    
    // Show specific field changes with values
    const importantFields = ['name', 'email', 'status', 'role', 'phone', 'company']
    const shownFields = Object.keys(body).filter(field => importantFields.includes(field)).slice(0, 2)
    
    if (shownFields.length > 0) {
      const fieldChanges = shownFields.map(field => {
        const fieldName = fieldMap[field] || field
        const value = body[field]
        // Truncate long values
        const displayValue = typeof value === 'string' && value.length > 20 
          ? value.substring(0, 20) + '...' 
          : value
        return `${fieldName}: "${displayValue}"`
      })
      result += ` - Thay đổi: ${fieldChanges.join(', ')}`
    } else {
      // Fallback to field names only
      const fieldNames = Object.keys(body).slice(0, 2).map(field => fieldMap[field] || field)
      result += ` - Các trường: ${fieldNames.join(', ')}`
    }
    
    if (Object.keys(body).length > shownFields.length) {
      result += ` và ${Object.keys(body).length - shownFields.length} trường khác`
    }
  }
  
  if (duration) {
    result += ` (${duration})`
  }
  
  return result
}

const formatCreateDetails = (parsed: any, resourceName: string) => {
  const method = parsed.method || 'POST'
  const path = parsed.path || ''
  const duration = parsed.durationMs ? `${parsed.durationMs}ms` : ''
  const body = parsed.body || {}
  
  // Convert resource names to Vietnamese
  const resourceMap: Record<string, string> = {
    'attendee': 'người tham dự',
    'attendees': 'người tham dự',
    'user': 'người dùng',
    'users': 'người dùng',
    'conference': 'hội nghị',
    'conferences': 'hội nghị',
    'session': 'phiên họp',
    'sessions': 'phiên họp',
    'registration': 'đăng ký',
    'registrations': 'đăng ký'
  }
  
  const vietnameseResource = resourceMap[resourceName?.toLowerCase() || ''] || resourceName || 'tài nguyên'
  
  let result = `Tạo mới ${vietnameseResource}`
  
  // Show key information if available
  if (body.name) {
    result += ` "${body.name}"`
  } else if (body.email) {
    result += ` với email "${body.email}"`
  } else if (body.title) {
    result += ` "${body.title}"`
  }
  
  if (duration) {
    result += ` (${duration})`
  }
  
  return result
}

const formatDeleteDetails = (parsed: any, resourceName: string) => {
  const method = parsed.method || 'DELETE'
  const path = parsed.path || ''
  const duration = parsed.durationMs ? `${parsed.durationMs}ms` : ''
  
  // Convert resource names to Vietnamese
  const resourceMap: Record<string, string> = {
    'attendee': 'người tham dự',
    'attendees': 'người tham dự',
    'user': 'người dùng',
    'users': 'người dùng',
    'conference': 'hội nghị',
    'conferences': 'hội nghị',
    'session': 'phiên họp',
    'sessions': 'phiên họp',
    'registration': 'đăng ký',
    'registrations': 'đăng ký'
  }
  
  const vietnameseResource = resourceMap[resourceName?.toLowerCase() || ''] || resourceName || 'tài nguyên'
  
  let result = `Xóa ${vietnameseResource}`
  
  if (path) {
    const pathParts = path.split('/')
    const resourceId = pathParts[pathParts.length - 1]
    if (resourceId && !isNaN(Number(resourceId))) {
      result += ` #${resourceId}`
    }
  }
  
  if (duration) {
    result += ` (${duration})`
  }
  
  return result
}

const formatLoginDetails = (parsed: any) => {
  const method = parsed.method || 'POST'
  const path = parsed.path || ''
  const duration = parsed.durationMs ? `${parsed.durationMs}ms` : ''
  const body = parsed.body || {}
  
  let result = 'Đăng nhập vào hệ thống'
  
  // Show login method if available
  if (body.email) {
    result += ` với email "${body.email}"`
  } else if (body.username) {
    result += ` với tên đăng nhập "${body.username}"`
  }
  
  // Show login method
  if (path.includes('google')) {
    result += ' (Google)'
  } else if (path.includes('facebook')) {
    result += ' (Facebook)'
  } else if (path.includes('github')) {
    result += ' (GitHub)'
  }
  
  if (duration) {
    result += ` (${duration})`
  }
  
  return result
}

const formatFrontendDetails = (parsed: any, actionName: string) => {
  const page = parsed.page || 'Trang không xác định'
  const details = parsed.details || ''
  
  let result = `Trên trang: ${page}`
  
  if (details) {
    result += ` - ${details}`
  }
  
  return result
}

const formatGenericDetails = (parsed: any) => {
  const method = parsed.method || ''
  const path = parsed.path || ''
  const duration = parsed.durationMs ? `${parsed.durationMs}ms` : ''
  const body = parsed.body || {}
  
  let result = ''
  
  // Try to make it more user-friendly
  if (path.includes('/checkin')) {
    result = 'Thực hiện check-in'
  } else if (path.includes('/checkout')) {
    result = 'Thực hiện check-out'
  } else if (path.includes('/upload')) {
    result = 'Tải lên tệp tin'
  } else if (path.includes('/download')) {
    result = 'Tải xuống tệp tin'
  } else if (path.includes('/export')) {
    result = 'Xuất dữ liệu'
  } else if (path.includes('/import')) {
    result = 'Nhập dữ liệu'
  } else if (path.includes('/send')) {
    result = 'Gửi thông báo'
  } else if (path.includes('/approve')) {
    result = 'Phê duyệt yêu cầu'
  } else if (path.includes('/reject')) {
    result = 'Từ chối yêu cầu'
  } else if (method && path) {
    // Convert HTTP methods to Vietnamese
    const methodMap: Record<string, string> = {
      'GET': 'Truy vấn',
      'POST': 'Tạo mới',
      'PUT': 'Cập nhật',
      'PATCH': 'Cập nhật',
      'DELETE': 'Xóa',
      'OPTIONS': 'Kiểm tra'
    }
    const vietnameseMethod = methodMap[method] || method
    result = `${vietnameseMethod} ${path}`
  } else if (path) {
    result = path
  } else {
    result = 'Hoạt động hệ thống'
  }
  
  // Add specific details if available
  if (body.action) {
    result += ` - ${body.action}`
  } else if (body.message) {
    result += ` - ${body.message}`
  }
  
  if (duration) {
    result += ` (${duration})`
  }
  
  return result
}

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
  frontend: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
}

const categoryLabels = {
  auth: "Xác thực",
  user: "Người dùng",
  conference: "Hội nghị",
  system: "Hệ thống",
  data: "Dữ liệu",
  frontend: "Giao diện",
}

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Advanced filters
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<{id: number, name: string, email: string, avatar?: string}[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false)
      }
    }

    const handleScroll = (event: Event) => {
      // Only close if scrolling outside the dropdown
      const target = event.target as HTMLElement
      if (!target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('scroll', handleScroll, true) // Use capture phase
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('scroll', handleScroll, true)
      }
    }
  }, [showUserDropdown])

  const {
    logs,
    loading,
    error,
    total,
    page: currentPage,
    totalPages,
    filters,
    setFilters,
    refresh,
    exportLogs,
    getUserInfo,
    users
  } = useAuditLogs({
    page: 1,
    limit: 10
  })

  // Update filters when local state changes
  useEffect(() => {
    const newFilters: any = {}
    
    if (searchTerm) newFilters.q = searchTerm
    if (statusFilter !== "all") newFilters.status = statusFilter
    if (categoryFilter !== "all") newFilters.category = categoryFilter
    
    // User filter logic - prioritize selectedUsers over userFilter
    if (selectedUsers.length > 0) {
      // Send array of user IDs for multi-user filtering
      newFilters.userId = selectedUsers.map(u => u.id)
      console.log('Applied selectedUsers filter:', selectedUsers.map(u => u.id))
    } else if (userFilter !== "all") {
      // Only apply role-based filter if no specific users are selected
      newFilters.userId = userFilter === "admin" ? 1 : userFilter === "staff" ? 2 : 3
      console.log('Applied userFilter:', userFilter, 'userId:', newFilters.userId)
    } else {
      // Clear userId filter when no users are selected and no role filter
      newFilters.userId = undefined
      console.log('Cleared userId filter')
    }
    
    console.log('Updating filters:', newFilters)
    setFilters(newFilters)
  }, [searchTerm, statusFilter, categoryFilter, userFilter, selectedUsers, setFilters])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getLogStats = () => {
    return {
      total: total,
      success: logs.filter((l) => l.status === "success").length,
      failed: logs.filter((l) => l.status === "failed").length,
      warning: logs.filter((l) => l.status === "warning").length,
    }
  }

  // Get filtered users for search
  const getFilteredUsers = () => {
    const allUsers = Object.values(users)
    console.log('getFilteredUsers called, users:', allUsers.length, 'searchTerm:', userSearchTerm)
    
    if (!userSearchTerm) {
      // Show all users when no search term
      return allUsers.slice(0, 20) // Show first 20 users
    }
    
    return allUsers.filter((user: any) => 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    ).slice(0, 10) // Limit to 10 results when searching
  }

  const clearAdvancedFilters = () => {
    setUserSearchTerm("")
    setSelectedUsers([])
    setShowUserDropdown(false)
    // Also reset userFilter to "all" to ensure complete reset
    setUserFilter("all")
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setCategoryFilter("all")
    setUserFilter("all")
    setUserSearchTerm("")
    setSelectedUsers([])
    setShowUserDropdown(false)
  }

  // Helper functions for multi-user selection
  const addUser = (user: {id: number, name: string, email: string, avatar?: string}) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user])
    }
    setUserSearchTerm("")
    setShowUserDropdown(false)
  }

  const removeUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const isUserSelected = (userId: number) => {
    return selectedUsers.some(u => u.id === userId)
  }

  const stats = getLogStats()

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage })
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Nhật ký hệ thống</h1>
            <p className="text-muted-foreground">Theo dõi tất cả hoạt động trong hệ thống</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Nhật ký hệ thống</h1>
          <p className="text-muted-foreground">Theo dõi tất cả hoạt động trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={exportLogs} disabled={loading}>
          <Download className="mr-2 h-4 w-4" />
          Xuất nhật ký
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hoạt động</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Đang tải...' : 'Tất cả thời gian'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành công</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.success / stats.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thất bại</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.failed / stats.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warning.toLocaleString('vi-VN')}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.warning / stats.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Bộ lọc và tìm kiếm</span>
          </CardTitle>
            <div className="flex items-center space-x-2">
              {(searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userFilter !== "all" || selectedUsers.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa tất cả</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Bộ lọc nâng cao</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Basic Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo người dùng, hành động, chi tiết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="success">✅ Thành công</SelectItem>
                        <SelectItem value="failed">❌ Thất bại</SelectItem>
                        <SelectItem value="warning">⚠️ Cảnh báo</SelectItem>
                    </SelectContent>
                  </Select>
                  {statusFilter !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                      className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        <SelectItem value="auth">🔐 Xác thực</SelectItem>
                        <SelectItem value="user">👤 Người dùng</SelectItem>
                        <SelectItem value="conference">🏢 Hội nghị</SelectItem>
                        <SelectItem value="system">⚙️ Hệ thống</SelectItem>
                        <SelectItem value="data">📊 Dữ liệu</SelectItem>
                        <SelectItem value="frontend">🖥️ Giao diện</SelectItem>
                    </SelectContent>
                  </Select>
                  {categoryFilter !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryFilter("all")}
                      className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="admin">👑 Admin</SelectItem>
                        <SelectItem value="staff">👨‍💼 Staff</SelectItem>
                        <SelectItem value="attendee">👥 Attendee</SelectItem>
                    </SelectContent>
                  </Select>
                  {userFilter !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserFilter("all")}
                      className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
          </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Bộ lọc nâng cao</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Search */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Tìm kiếm theo người dùng</span>
                      </label>
                      {selectedUsers.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers([])}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 user-dropdown-container relative">
                      {/* Search Input */}
                      <div className="relative">
                        <Input
                          placeholder="Tìm kiếm hoặc chọn người dùng..."
                          value={userSearchTerm}
                          onChange={(e) => {
                            setUserSearchTerm(e.target.value)
                            setShowUserDropdown(true)
                          }}
                          onFocus={() => {
                            console.log('Input focused, showing dropdown')
                            setShowUserDropdown(true)
                          }}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => {
                            console.log('Button clicked, toggling dropdown:', !showUserDropdown)
                            setShowUserDropdown(!showUserDropdown)
                          }}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* User Dropdown */}
                      {showUserDropdown && (
                        <div 
                          className="absolute z-[9999] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl max-h-60 overflow-hidden"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 9999
                          }}
                        >
                          <div 
                            className="max-h-60 overflow-y-auto"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#d1d5db transparent'
                            }}
                            onWheel={(e) => {
                              // Prevent dropdown from closing when scrolling
                              e.stopPropagation()
                            }}
                          >
                            {getFilteredUsers().length > 0 ? (
                              getFilteredUsers().map((user: any) => {
                                const isSelected = isUserSelected(user.id)
                                return (
                                  <div
                                    key={user.id}
                                    className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 transition-colors ${
                                      isSelected ? 'bg-primary/10 border-primary/20' : ''
                                    }`}
                                    onClick={() => {
                                      if (isSelected) {
                                        removeUser(user.id)
                                      } else {
                                        addUser({
                                          id: user.id,
                                          name: user.name,
                                          email: user.email,
                                          avatar: user.avatar
                                        })
                                      }
                                    }}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                                          isSelected 
                                            ? 'bg-primary border-primary' 
                                            : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                          {isSelected && (
                                            <CheckCircle className="h-3 w-3 text-white" />
                                          )}
                                        </div>
                                      </div>
                                      <Avatar className="h-8 w-8 flex-shrink-0">
                                        {user.avatar ? (
                                          <AvatarImage src={user.avatar} alt={user.name} />
                                        ) : null}
                                        <AvatarFallback className="text-xs">
                                          {getInitials(user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                        <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="p-3 text-sm text-muted-foreground text-center">
                                {userSearchTerm ? 'Không tìm thấy người dùng' : 'Đang tải danh sách người dùng...'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Selected Users */}
                      {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">
                            Đã chọn {selectedUsers.length} người dùng:
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {selectedUsers.map((user) => (
                              <div key={user.id} className="flex items-center space-x-2 p-2 bg-primary/10 rounded-md">
                                <Avatar className="h-6 w-6 flex-shrink-0">
                                  {user.avatar ? (
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                  ) : null}
                                  <AvatarFallback className="text-xs">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{user.name}</div>
                                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  onClick={() => {
                                    console.log('Removing user:', user.id)
                                    removeUser(user.id)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => {
                              console.log('Clearing all selected users')
                              setSelectedUsers([])
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Xóa tất cả
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userFilter !== "all" || selectedUsers.length > 0) && (
              <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Đang lọc dữ liệu với {[
                  searchTerm && 'từ khóa',
                  statusFilter !== "all" && 'trạng thái',
                  categoryFilter !== "all" && 'danh mục',
                    userFilter !== "all" && 'vai trò',
                    selectedUsers.length > 0 && `${selectedUsers.length} người dùng cụ thể`
                ].filter(Boolean).join(', ')}
              </div>
                <div className="flex space-x-2">
                  {showAdvancedFilters && selectedUsers.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAdvancedFilters}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa bộ lọc nâng cao
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Xóa tất cả bộ lọc
                  </Button>
                </div>
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Nhật ký hoạt động</span>
              </CardTitle>
          <CardDescription>
                Hiển thị {logs.length} trong tổng số {total} bản ghi
                {loading && <span className="ml-2 text-blue-600">(Đang tải...)</span>}
          </CardDescription>
            </div>
            {!loading && logs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Thời gian</TableHead>
                    <TableHead className="w-[150px]">Người dùng</TableHead>
                    <TableHead className="w-[200px]">Hành động</TableHead>
                    <TableHead className="min-w-[300px]">Chi tiết</TableHead>
                    <TableHead className="w-[100px]">Danh mục</TableHead>
                    <TableHead className="w-[100px]">Trạng thái</TableHead>
                    <TableHead className="w-[120px]">IP Address</TableHead>
                    <TableHead className="w-[80px] text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Không có dữ liệu nhật ký</h3>
                            <p className="text-muted-foreground max-w-md">
                              {searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userFilter !== "all" || selectedUsers.length > 0
                                ? "Không tìm thấy nhật ký phù hợp với bộ lọc hiện tại. Hãy thử thay đổi bộ lọc."
                                : "Chưa có hoạt động nào được ghi lại trong hệ thống."}
                            </p>
                            {(searchTerm || statusFilter !== "all" || categoryFilter !== "all" || userFilter !== "all" || selectedUsers.length > 0) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={clearAllFilters}
                              >
                                Xóa bộ lọc
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => {
                      const StatusIcon = statusIcons[log.status || 'success']
                      const userInfo = getUserDisplayInfo(log, getUserInfo)
                      const actionIcon = getActionIcon(log.actionName || '')
                      
                      return (
                        <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-muted-foreground">
                                {formatTimestamp(log.timestamp)}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {new Date(log.timestamp).toLocaleString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                {userInfo.avatar ? (
                                  <AvatarImage 
                                    src={userInfo.avatar} 
                                    alt={userInfo.name}
                                    className="object-cover"
                                  />
                                ) : null}
                                <AvatarFallback className="text-xs bg-primary/10">
                                  {getInitials(userInfo.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{userInfo.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {userInfo.role}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                      <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{actionIcon}</span>
                                <span className="font-medium text-sm">
                                  {log.actionName || 'Không xác định'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                {log.resourceName || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-sm leading-relaxed">
                                <div className="font-medium text-foreground mb-1">
                                  {formatDetails(log.details || '', log.actionName || '', log.resourceName || '')}
                                </div>
                                {log.details && log.details.includes('{') && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="text-xs text-muted-foreground cursor-help">
                                          <span className="inline-flex items-center space-x-1 hover:text-foreground transition-colors">
                                            <Info className="h-3 w-3" />
                                            <span>Chi tiết kỹ thuật</span>
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-md">
                                        <div className="text-xs">
                                          <div className="font-medium mb-2">Chi tiết JSON:</div>
                                          <pre className="whitespace-pre-wrap break-words">
                                            {JSON.stringify(JSON.parse(log.details), null, 2)}
                                          </pre>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              {log.userAgent && (
                                <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                                  <span className="font-medium">🌐 Browser:</span> {truncateText(log.userAgent, 50)}
                                </div>
                              )}
                              {/* Show additional context if available */}
                              {log.details && log.details.includes('{') && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="inline-flex items-center space-x-1">
                                    <span>💡</span>
                                    <span>Click để xem chi tiết đầy đủ</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${categoryColors[log.category || 'system']} text-xs`}
                              variant="secondary"
                            >
                              {categoryLabels[log.category || 'system']}
                            </Badge>
                      </TableCell>
                      <TableCell>
                            <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                              <Badge 
                                className={`${statusColors[log.status || 'success']} text-xs`}
                                variant="secondary"
                              >
                                {statusLabels[log.status || 'success']}
                              </Badge>
                        </div>
                      </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">
                                {log.ipAddress || 'N/A'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(log)}
                                    className="h-8 w-8 p-0 hover:bg-muted"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Xem chi tiết</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                  )
                    })
                  )}
              </TableBody>
            </Table>
          </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  Hiển thị {((currentPage - 1) * (filters.limit || 10)) + 1} - {Math.min(currentPage * (filters.limit || 10), total)} trong tổng số {total} bản ghi
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Trước
                </Button>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium px-3 py-1 bg-primary/10 rounded">
                    {currentPage}
                  </span>
                  <span className="text-sm text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                >
                  Cuối
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Chi tiết nhật ký audit</span>
            </DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về hoạt động được ghi lại trong hệ thống
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ID:</span>
                      <span className="text-sm text-muted-foreground">{selectedLog.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Thời gian:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(selectedLog.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Người dùng:</span>
                      <div className="flex items-center space-x-2">
                        {selectedLog.userId ? (() => {
                          const userInfo = getUserInfo(selectedLog.userId)
                          console.log("Check userInfo", userInfo)
                          if (userInfo) {
                            return (
                              <div className="flex items-center space-x-2">
                                {userInfo.avatar ? (
                                  <img 
                                    src={userInfo.avatar} 
                                    alt={userInfo.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                    {getInitials(userInfo.name)}
                                  </div>
                                )}
                                <span className="text-sm text-muted-foreground">
                                  {userInfo.name} ({userInfo.email}) - {userInfo.role}
                                </span>
                              </div>
                            )
                          }
                          return `User #${selectedLog.userId}`
                        })() : (
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                              🖥️
                            </div>
                            <span className="text-sm text-muted-foreground">Hệ thống</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Hành động:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedLog.actionName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tài nguyên:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedLog.resourceName || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Thông tin kỹ thuật</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Trạng thái:</span>
                      <Badge className={statusColors[selectedLog.status || 'success']}>
                        {statusLabels[selectedLog.status || 'success']}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Danh mục:</span>
                      <Badge className={categoryColors[selectedLog.category || 'system']}>
                        {categoryLabels[selectedLog.category || 'system']}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">IP Address:</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {selectedLog.ipAddress || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Vai trò:</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedLog.userId ? (() => {
                          const userInfo = getUserInfo(selectedLog.userId)
                          if (userInfo) {
                            const roleMap: Record<string, string> = {
                              'admin': 'Quản trị viên',
                              'staff': 'Nhân viên', 
                              'attendee': 'Người tham dự',
                              'user': 'Người dùng',
                              'system': 'Hệ thống'
                            }
                            return roleMap[userInfo.role] || userInfo.role
                          }
                          return 'Không xác định'
                        })() : 'Hệ thống'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">User Agent:</span>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {selectedLog.userAgent || 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Chi tiết hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Mô tả:</span>
                      <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          {formatDetails(selectedLog.details || '', selectedLog.actionName || '', selectedLog.resourceName || '')}
                        </p>
                      </div>
                    </div>
                    
                    {selectedLog.details && selectedLog.details.includes('{') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Dữ liệu JSON đầy đủ:</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedLog.details.length} ký tự
                          </Badge>
                        </div>
                        <div className="mt-1 p-4 bg-muted/50 rounded-lg border">
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words font-mono leading-relaxed">
                            {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
