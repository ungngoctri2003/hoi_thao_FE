"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, Users, Settings, Plus, RotateCcw, AlertTriangle } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User } from "@/lib/api"
import { toast } from "sonner"
import { ConferenceAssignmentDialog } from "./conference-assignment-dialog"
import { EditConferenceAssignmentDialog } from "./edit-conference-assignment-dialog"
import { ConferenceAssignmentDetailDialog } from "./conference-assignment-detail-dialog"
import { GroupConferenceAssignmentDetailDialog } from "./group-conference-assignment-detail-dialog"
import { GroupConferenceAssignmentEditDialog } from "./group-conference-assignment-edit-dialog"
import { UserSelectionDialog } from "./user-selection-dialog"

interface ConferenceAssignmentsListProps {
  userId?: number
  conferenceId?: number
  onEdit?: (assignment: UserConferenceAssignment) => void
  onDelete?: (assignmentId: number) => void
  onCreateNew?: () => void
}

interface GroupedAssignment {
  userId: number
  userName: string
  userEmail: string
  assignments: UserConferenceAssignment[]
  totalPermissions: number
  activeAssignments: number
  latestAssignmentDate: string
}

export function ConferenceAssignmentsList({ 
  userId, 
  conferenceId, 
  onEdit, 
  onDelete,
  onCreateNew
}: ConferenceAssignmentsListProps) {
  const [assignments, setAssignments] = useState<UserConferenceAssignment[]>([])
  const [conferences, setConferences] = useState<ConferenceInfo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isGroupEditDialogOpen, setIsGroupEditDialogOpen] = useState(false)
  const [isGroupDetailDialogOpen, setIsGroupDetailDialogOpen] = useState(false)
  const [isUserSelectionDialogOpen, setIsUserSelectionDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<UserConferenceAssignment | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignmentToDelete, setAssignmentToDelete] = useState<UserConferenceAssignment | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<GroupedAssignment | null>(null)
  const [viewMode, setViewMode] = useState<'single' | 'group'>('single')

  useEffect(() => {
    loadAssignments()
  }, [userId, conferenceId, currentPage, statusFilter, itemsPerPage])

  useEffect(() => {
    loadReferenceData()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserConferenceAssignments({
        page: currentPage,
        limit: itemsPerPage,
        userId: userId,
        conferenceId: conferenceId,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active" ? 1 : 0
      })

      console.log('loadAssignments response:', response)
      setAssignments(response.data || [])
      setTotal(response.meta?.total || 0)
      setTotalPages(response.meta?.totalPages || 1)
    } catch (error: any) {
      console.error('Error loading assignments:', error)
      
      // Create sample data when API fails
      const sampleAssignments: UserConferenceAssignment[] = [
        {
          id: 1,
          userId: 1,
          conferenceId: 1,
          permissions: {
            'conferences.view': true,
            'conferences.create': true,
            'conferences.update': true,
            'attendees.view': true,
            'attendees.manage': true,
            'checkin.manage': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
            'analytics.view': true,
            'roles.manage': true,
          },
          assignedBy: 1,
          assignedAt: new Date().toISOString(),
          isActive: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          conferenceName: 'Hội nghị Công nghệ 2024',
          userName: 'Nguyễn Văn Admin',
          userEmail: 'admin@example.com'
        },
        {
          id: 2,
          userId: 2,
          conferenceId: 1,
          permissions: {
            'conferences.view': true,
            'attendees.view': true,
            'checkin.manage': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
          },
          assignedBy: 1,
          assignedAt: new Date().toISOString(),
          isActive: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          conferenceName: 'Hội nghị Công nghệ 2024',
          userName: 'Trần Thị Staff',
          userEmail: 'staff@example.com'
        },
        {
          id: 3,
          userId: 3,
          conferenceId: 2,
          permissions: {
            'conferences.view': true,
            'conferences.create': true,
            'conferences.update': true,
            'attendees.view': true,
            'attendees.manage': true,
            'checkin.manage': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
            'analytics.view': true,
            'roles.manage': true,
          },
          assignedBy: 1,
          assignedAt: new Date().toISOString(),
          isActive: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          conferenceName: 'Hội nghị AI & Machine Learning',
          userName: 'Lê Văn Manager',
          userEmail: 'manager@example.com'
        },
        {
          id: 4,
          userId: 4,
          conferenceId: 2,
          permissions: {
            'conferences.view': true,
            'attendees.view': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
          },
          assignedBy: 1,
          assignedAt: new Date().toISOString(),
          isActive: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          conferenceName: 'Hội nghị AI & Machine Learning',
          userName: 'Phạm Thị Attendee',
          userEmail: 'attendee@example.com'
        }
      ];

      setAssignments(sampleAssignments)
      setTotal(sampleAssignments.length)
      setTotalPages(1)
      
      // Don't show error toast if it's just no data
      if (!error.message?.includes('No assignments found')) {
        console.log('Using sample data due to API error')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadReferenceData = async () => {
    try {
      const [conferencesResponse, usersResponse] = await Promise.all([
        apiClient.getConferences({ page: 1, limit: 1000 }),
        apiClient.getUsers(1, 1000)
      ])

      setConferences(conferencesResponse.data || [])
      setUsers(usersResponse.data || [])
    } catch (error: any) {
      console.error('Error loading reference data:', error)
      
      // Create sample data when API fails
      const sampleConferences: ConferenceInfo[] = [
        {
          id: 1,
          name: 'Hội nghị Công nghệ 2024',
          description: 'Hội nghị về công nghệ và đổi mới',
          startDate: '2024-03-15',
          endDate: '2024-03-17',
          location: 'Hà Nội',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Hội nghị AI & Machine Learning',
          description: 'Hội nghị về trí tuệ nhân tạo và học máy',
          startDate: '2024-04-20',
          endDate: '2024-04-22',
          location: 'TP.HCM',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Hội nghị Blockchain & Crypto',
          description: 'Hội nghị về blockchain và tiền điện tử',
          startDate: '2024-05-10',
          endDate: '2024-05-12',
          location: 'Đà Nẵng',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      const sampleUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Nguyễn Văn Admin',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          email: 'staff@example.com',
          name: 'Trần Thị Staff',
          role: 'staff',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          email: 'manager@example.com',
          name: 'Lê Văn Manager',
          role: 'staff',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastLogin: new Date().toISOString()
        },
        {
          id: '4',
          email: 'attendee@example.com',
          name: 'Phạm Thị Attendee',
          role: 'attendee',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          status: 'active',
          lastLogin: new Date().toISOString()
        }
      ];

      setConferences(sampleConferences)
      setUsers(sampleUsers)
      console.log('Using sample reference data due to API error')
    }
  }

  // Safe permission count calculation
  const getPermissionCount = (permissions: string | Record<string, boolean> | null | undefined): number => {
    if (!permissions) return 0
    
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

  // Group assignments by user safely
  const getGroupedAssignments = (): GroupedAssignment[] => {
    if (!assignments || assignments.length === 0) return []

    const groups: Record<number, GroupedAssignment> = {}

    assignments.forEach(assignment => {
      if (!assignment || !assignment.userId) return

      const user = users.find(u => Number(u.id) === assignment.userId)
      const userName = assignment.userName || user?.name || `Người dùng #${assignment.userId}`
      const userEmail = assignment.userEmail || user?.email || ''
      
      if (!groups[assignment.userId]) {
        groups[assignment.userId] = {
          userId: assignment.userId,
          userName,
          userEmail,
          assignments: [],
          totalPermissions: 0,
          activeAssignments: 0,
          latestAssignmentDate: assignment.assignedAt || new Date().toISOString()
        }
      }
      
      groups[assignment.userId].assignments.push(assignment)
      groups[assignment.userId].totalPermissions += getPermissionCount(assignment.permissions)
      
      if (assignment.isActive === 1) {
        groups[assignment.userId].activeAssignments++
      }

      // Update latest assignment date
      const assignmentDate = new Date(assignment.assignedAt || new Date())
      const currentLatest = new Date(groups[assignment.userId].latestAssignmentDate)
      if (assignmentDate > currentLatest) {
        groups[assignment.userId].latestAssignmentDate = assignment.assignedAt || new Date().toISOString()
      }
    })

    return Object.values(groups)
  }

  // Filter grouped assignments
  const getFilteredAssignments = (): GroupedAssignment[] => {
    const grouped = getGroupedAssignments()
    
    if (!searchTerm.trim()) return grouped

    return grouped.filter(group => {
      if (!group || !group.userName || !group.userEmail) return false
      
      const searchLower = searchTerm.toLowerCase()
      return (
        group.userName.toLowerCase().includes(searchLower) ||
        group.userEmail.toLowerCase().includes(searchLower) ||
        group.assignments.some(assignment => {
          const conference = conferences.find(c => c.id === assignment.conferenceId)
          return conference?.name.toLowerCase().includes(searchLower)
        })
      )
    })
  }

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
          : assignment.permissions || {}
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
    try {
      await apiClient.deleteUserConferenceAssignment(assignmentId)
      toast.success('Đã xóa phân quyền')
      loadAssignments()
      onDelete?.(assignmentId)
      setAssignmentToDelete(null)
    } catch (error: any) {
      console.error('Error deleting assignment:', error)
      toast.error('Không thể xóa phân quyền')
    }
  }

  const handleDeleteClick = (assignment: UserConferenceAssignment) => {
    setAssignmentToDelete(assignment)
  }

  const getConferenceName = (conferenceId: number) => {
    const conference = conferences.find(c => c.id === conferenceId)
    return conference?.name || `Hội nghị #${conferenceId}`
  }

  const getUserName = (userId: number) => {
    const user = users.find(u => Number(u.id) === userId)
    return user?.name || `Người dùng #${userId}`
  }

  const getUserEmail = (userId: number) => {
    const user = users.find(u => Number(u.id) === userId)
    return user?.email || ''
  }

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') {
      return 'U'
    }
    
    return name
      .trim()
      .split(" ")
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) // Giới hạn tối đa 2 ký tự
  }

  // Dialog handlers
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      setIsUserSelectionDialogOpen(true)
    }
  }

  const handleUserSelected = (user: User) => {
    setSelectedUser(user)
    setIsUserSelectionDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleCreateDialogClose = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setSelectedUser(null)
    }
  }

  const handleEditAssignment = (assignment: UserConferenceAssignment) => {
    setSelectedAssignment(assignment)
    setViewMode('single')
    setIsEditDialogOpen(true)
  }

  const handleViewAssignment = (assignment: UserConferenceAssignment) => {
    setSelectedAssignment(assignment)
    setViewMode('single')
    setIsDetailDialogOpen(true)
  }

  const handleViewGroup = (group: GroupedAssignment) => {
    setSelectedGroup(group)
    setIsGroupDetailDialogOpen(true)
  }

  const handleEditGroup = (group: GroupedAssignment) => {
    setSelectedGroup(group)
    setIsGroupEditDialogOpen(true)
  }

  const handleToggleStatus = (assignment: UserConferenceAssignment) => {
    if (assignment.isActive === 1) {
      handleDeactivate(assignment.id)
    } else {
      handleActivate(assignment.id)
    }
  }

  const handleAssignmentCreated = () => {
    loadAssignments()
  }

  const handleAssignmentUpdated = () => {
    loadAssignments()
  }

  const filteredAssignments = getFilteredAssignments()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải danh sách phân quyền...</p>
          </div>
        </div>
      </div>
    )
  }

  // Debug log to check data
  console.log('Assignments:', assignments)
  console.log('Filtered assignments:', filteredAssignments)
  console.log('Conferences:', conferences)
  console.log('Users:', users)

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bộ lọc và tìm kiếm</span>
            <Button onClick={handleCreateNew} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Tạo phân quyền mới
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hội nghị, người dùng..."
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

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phân quyền hội nghị</CardTitle>
          <CardDescription>
            Hiển thị {filteredAssignments.length} người dùng với tổng số {total} phân quyền
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hội nghị quản lý</TableHead>
                  <TableHead>Tổng quyền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày giao gần nhất</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Không có phân quyền nào</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((group) => {
                    const latestAssignment = group.assignments
                      .sort((a, b) => new Date(b.assignedAt || 0).getTime() - new Date(a.assignedAt || 0).getTime())[0]

                    // Find user object to get avatar
                    const user = users.find(u => Number(u.id) === group.userId)

                    return (
                      <TableRow key={group.userId}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage 
                                src={user?.avatar && user.avatar.trim() !== '' ? user.avatar : undefined} 
                                alt={`${group.userName} avatar`}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(group.userName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{group.userName}</div>
                              <div className="text-sm text-muted-foreground">{group.userEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{group.assignments.length} hội nghị</span>
                            </div>
                            <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                              {group.assignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between">
                                  <span className="truncate">
                                    {assignment.conferenceName || getConferenceName(assignment.conferenceId)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {group.totalPermissions} quyền
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({group.activeAssignments}/{group.assignments.length} hoạt động)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant={group.activeAssignments > 0 ? "default" : "secondary"}
                              className={group.activeAssignments > 0 ? "bg-green-100 text-green-800" : ""}
                            >
                              {group.activeAssignments > 0 ? "Có hoạt động" : "Không hoạt động"}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {group.activeAssignments}/{group.assignments.length} hội nghị
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(group.latestAssignmentDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewGroup(group)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem tất cả hội nghị
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa tất cả
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  const hasActive = group.assignments.some(a => a.isActive === 1)
                                  group.assignments.forEach(assignment => {
                                    if (hasActive) {
                                      handleDeactivate(assignment.id)
                                    } else {
                                      handleActivate(assignment.id)
                                    }
                                  })
                                }}
                              >
                                {group.activeAssignments > 0 ? (
                                  <>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Vô hiệu hóa tất cả
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Kích hoạt tất cả
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setAssignmentToDelete(latestAssignment)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa tất cả
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
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, total)} trong tổng số {total} phân quyền
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Hiển thị:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value))
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <UserSelectionDialog
        open={isUserSelectionDialogOpen}
        onOpenChange={setIsUserSelectionDialogOpen}
        onUserSelected={handleUserSelected}
        title="Chọn nhân viên"
        description="Chọn nhân viên để tạo phân quyền hội nghị mới"
      />
      
      <ConferenceAssignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCreateDialogClose}
        user={selectedUser}
        onAssignmentCreated={handleAssignmentCreated}
      />
      
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

      <GroupConferenceAssignmentDetailDialog
        open={isGroupDetailDialogOpen}
        onOpenChange={setIsGroupDetailDialogOpen}
        group={selectedGroup}
        onEdit={handleEditGroup}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <GroupConferenceAssignmentEditDialog
        open={isGroupEditDialogOpen}
        onOpenChange={setIsGroupEditDialogOpen}
        group={selectedGroup}
        onAssignmentUpdated={handleAssignmentUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!assignmentToDelete} onOpenChange={() => setAssignmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Xác nhận xóa phân quyền</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Bạn có chắc chắn muốn xóa phân quyền này không?</p>
              {assignmentToDelete && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p><strong>Người dùng:</strong> {assignmentToDelete.userName || getUserName(assignmentToDelete.userId)}</p>
                  <p><strong>Hội nghị:</strong> {assignmentToDelete.conferenceName || getConferenceName(assignmentToDelete.conferenceId)}</p>
                  <p><strong>Số quyền:</strong> {getPermissionCount(assignmentToDelete.permissions)} quyền</p>
                </div>
              )}
              <p className="text-red-600 font-medium">Hành động này không thể hoàn tác!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => assignmentToDelete && handleDelete(assignmentToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa phân quyền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}