"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, Users, Settings, RotateCcw } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User } from "@/lib/api"
import { toast } from "sonner"
import { EditConferenceAssignmentDialog } from "./edit-conference-assignment-dialog"
import { ConferenceAssignmentDetailDialog } from "./conference-assignment-detail-dialog"

interface UserConferenceListProps {
  userId: number
  userName?: string
  userEmail?: string
  onEdit?: (assignment: UserConferenceAssignment) => void
  onDelete?: (assignmentId: number) => void
}

export function UserConferenceList({ 
  userId, 
  userName,
  userEmail,
  onEdit, 
  onDelete
}: UserConferenceListProps) {
  const [assignments, setAssignments] = useState<UserConferenceAssignment[]>([])
  const [conferences, setConferences] = useState<ConferenceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 10

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<UserConferenceAssignment | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [userId, currentPage, statusFilter])

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserAssignments(userId)
      
      // Apply client-side filtering
      let filtered = response.data
      
      // Filter by status
      if (statusFilter !== "all") {
        const isActive = statusFilter === "active" ? 1 : 0
        filtered = filtered.filter(assignment => assignment.isActive === isActive)
      }
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(assignment => {
          const conference = conferences.find(c => c.id === assignment.conferenceId)
          return conference?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 conference?.description?.toLowerCase().includes(searchTerm.toLowerCase())
        })
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedAssignments = filtered.slice(startIndex, endIndex)
      
      setAssignments(paginatedAssignments)
      setTotal(filtered.length)
      setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    } catch (error: any) {
      console.error('Error loading user assignments:', error)
      toast.error('Không thể tải danh sách hội nghị của người dùng')
    } finally {
      setLoading(false)
    }
  }

  const loadReferenceData = async () => {
    try {
      const response = await apiClient.getConferences({ page: 1, limit: 1000 })
      setConferences(response.data)
    } catch (error: any) {
      console.error('Error loading conferences:', error)
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const conference = conferences.find(c => c.id === assignment.conferenceId)
    
    const matchesSearch = 
      conference?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference?.description?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleDeactivate = async (assignmentId: number) => {
    try {
      await apiClient.deactivateUserConferenceAssignment(assignmentId)
      toast.success('Đã vô hiệu hóa phân quyền')
      loadAssignments()
    } catch (error: any) {
      console.error('Error deactivating assignment:', error)
      toast.error('Không thể vô hiệu hóa phân quyền')
    }
  }

  const handleActivate = async (assignmentId: number) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId)
      if (!assignment) return

      let parsedPermissions: Record<string, boolean> = {}
      try {
        parsedPermissions = typeof assignment.permissions === 'string' 
          ? JSON.parse(assignment.permissions) 
          : assignment.permissions
      } catch {
        parsedPermissions = {}
      }

      await apiClient.updateUserConferenceAssignment(assignmentId, {
        permissions: parsedPermissions,
        isActive: 1
      })
      toast.success('Đã kích hoạt lại phân quyền')
      loadAssignments()
    } catch (error: any) {
      console.error('Error activating assignment:', error)
      toast.error('Không thể kích hoạt phân quyền')
    }
  }

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phân quyền này?')) {
      return
    }

    try {
      await apiClient.deleteUserConferenceAssignment(assignmentId)
      toast.success('Đã xóa phân quyền')
      loadAssignments()
      onDelete?.(assignmentId)
    } catch (error: any) {
      console.error('Error deleting assignment:', error)
      toast.error('Không thể xóa phân quyền')
    }
  }

  const getConferenceName = (conferenceId: number) => {
    const conference = conferences.find(c => c.id === conferenceId)
    return conference?.name || `Hội nghị #${conferenceId}`
  }

  const getConferenceDescription = (conferenceId: number) => {
    const conference = conferences.find(c => c.id === conferenceId)
    return conference?.description || ''
  }

  const getPermissionCount = (permissions: string | Record<string, boolean>) => {
    try {
      let perms: Record<string, boolean>
      if (typeof permissions === 'string') {
        perms = JSON.parse(permissions)
      } else {
        perms = permissions || {}
      }
      return Object.values(perms).filter(Boolean).length
    } catch (error) {
      console.error('Error parsing permissions:', error, permissions)
      return 0
    }
  }

  const getPermissionList = (permissions: string | Record<string, boolean>) => {
    try {
      let perms: Record<string, boolean>
      if (typeof permissions === 'string') {
        perms = JSON.parse(permissions)
      } else {
        perms = permissions || {}
      }
      return Object.entries(perms)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)
    } catch (error) {
      console.error('Error parsing permissions:', error, permissions)
      return []
    }
  }

  // Dialog handlers
  const handleEditAssignment = (assignment: UserConferenceAssignment) => {
    setSelectedAssignment(assignment)
    setIsEditDialogOpen(true)
  }

  const handleViewAssignment = (assignment: UserConferenceAssignment) => {
    setSelectedAssignment(assignment)
    setIsDetailDialogOpen(true)
  }

  const handleToggleStatus = (assignment: UserConferenceAssignment) => {
    if (assignment.isActive === 1) {
      handleDeactivate(assignment.id)
    } else {
      handleActivate(assignment.id)
    }
  }

  const handleAssignmentUpdated = () => {
    loadAssignments()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải danh sách hội nghị...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hội nghị được giao cho {userName || `Người dùng #${userId}`}
          </CardTitle>
          <CardDescription>
            {userEmail && `Email: ${userEmail}`}
          </CardDescription>
        </CardHeader>
      </Card>

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
                  placeholder="Tìm kiếm theo tên hội nghị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conferences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hội nghị</CardTitle>
          <CardDescription>
            Hiển thị {filteredAssignments.length} trong tổng số {total} hội nghị được giao
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hội nghị</TableHead>
                  <TableHead>Quyền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày giao</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Không có hội nghị nào được giao</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const permissionList = getPermissionList(assignment.permissions)
                    const permissionCount = getPermissionCount(assignment.permissions)

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{assignment.conferenceName || getConferenceName(assignment.conferenceId)}</div>
                              <div className="text-sm text-muted-foreground">ID: {assignment.conferenceId}</div>
                              {getConferenceDescription(assignment.conferenceId) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {getConferenceDescription(assignment.conferenceId)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">
                              {permissionCount} quyền
                            </Badge>
                            {permissionList.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {permissionList.slice(0, 2).join(', ')}
                                {permissionList.length > 2 && ` +${permissionList.length - 2} khác`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={assignment.isActive ? "default" : "secondary"}
                            className={assignment.isActive ? "bg-green-100 text-green-800" : ""}
                          >
                            {assignment.isActive ? "Hoạt động" : "Không hoạt động"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewAssignment(assignment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(assignment)}
                              >
                                {assignment.isActive === 1 ? (
                                  <>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Vô hiệu hóa
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Kích hoạt lại
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(assignment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
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

      {/* Dialogs */}
      <EditConferenceAssignmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        assignment={selectedAssignment}
        onAssignmentUpdated={handleAssignmentUpdated}
      />
      
      <ConferenceAssignmentDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        assignment={selectedAssignment}
        onEdit={handleEditAssignment}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  )
}
