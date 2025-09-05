"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Calendar, Settings, CheckCircle, XCircle, Shield, Activity, Edit, Trash2 } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User } from "@/lib/api"
import { toast } from "sonner"

interface GroupedAssignment {
  userId: number
  userName: string
  userEmail: string
  assignments: UserConferenceAssignment[]
  totalPermissions: number
  activeAssignments: number
  latestAssignmentDate: string
}

interface GroupConferenceAssignmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: GroupedAssignment | null
  onEdit?: (group: GroupedAssignment) => void
  onDelete?: (assignmentId: number) => void
  onToggleStatus?: (assignment: UserConferenceAssignment) => void
}

const conferencePermissions = [
  { code: 'conferences.view', name: 'Xem hội nghị', description: 'Xem thông tin chi tiết hội nghị' },
  { code: 'conferences.update', name: 'Cập nhật hội nghị', description: 'Chỉnh sửa thông tin hội nghị' },
  { code: 'attendees.view', name: 'Xem người tham dự', description: 'Xem danh sách người tham dự' },
  { code: 'attendees.manage', name: 'Quản lý người tham dự', description: 'Thêm, sửa, xóa người tham dự' },
  { code: 'checkin.manage', name: 'Quản lý check-in', description: 'Quản lý check-in/check-out' },
  { code: 'sessions.view', name: 'Xem phiên', description: 'Xem danh sách phiên họp' },
  { code: 'sessions.manage', name: 'Quản lý phiên', description: 'Tạo, sửa, xóa phiên họp' },
  { code: 'analytics.view', name: 'Xem báo cáo', description: 'Xem báo cáo thống kê' },
]

export function GroupConferenceAssignmentDetailDialog({ 
  open, 
  onOpenChange, 
  group, 
  onEdit,
  onDelete,
  onToggleStatus
}: GroupConferenceAssignmentDetailDialogProps) {
  const [conferences, setConferences] = useState<ConferenceInfo[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  // Load reference data when dialog opens
  useEffect(() => {
    if (open && group) {
      loadReferenceData()
    }
  }, [open, group])

  const loadReferenceData = async () => {
    if (!group) return

    try {
      setLoading(true)
      
      const [conferencesResponse, usersResponse] = await Promise.all([
        apiClient.getConferences({ page: 1, limit: 1000 }),
        apiClient.getUsers(1, 1000)
      ])

      const userData = usersResponse.data?.find(u => Number(u.id) === group.userId)
      setUser(userData || null)
      setConferences(conferencesResponse.data || [])
    } catch (error: any) {
      console.error('Error loading reference data:', error)
      toast.error('Không thể tải dữ liệu tham chiếu')
    } finally {
      setLoading(false)
    }
  }

  const getConferenceName = (conferenceId: number) => {
    const conference = conferences.find(c => c.id === conferenceId)
    return conference?.name || `Hội nghị #${conferenceId}`
  }

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
      return 0
    }
  }

  const getPermissionList = (permissions: string | Record<string, boolean> | null | undefined) => {
    if (!permissions) return []
    
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
      return []
    }
  }

  const getPermissionName = (code: string) => {
    const permission = conferencePermissions.find(p => p.code === code)
    return permission?.name || code
  }

  if (!group) return null

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Chi tiết phân quyền hội nghị</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về tất cả phân quyền của người dùng này
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Chi tiết phân quyền hội nghị</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về tất cả phân quyền của {group.userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
          {/* User Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin người dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{group.userName}</h3>
                  <p className="text-muted-foreground">{group.userEmail}</p>
                  {user?.role && (
                    <Badge variant="outline" className="mt-1">{user.role}</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{group.assignments.length}</div>
                  <div className="text-sm text-muted-foreground">Hội nghị quản lý</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="conferences" className="space-y-4 flex-1 flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="conferences">Danh sách hội nghị</TabsTrigger>
              <TabsTrigger value="permissions">Tổng quan quyền</TabsTrigger>
              <TabsTrigger value="summary">Thống kê</TabsTrigger>
            </TabsList>

            <TabsContent value="conferences" className="space-y-4 flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Danh sách hội nghị được phân quyền</CardTitle>
                  <CardDescription>
                    Chi tiết từng hội nghị và quyền được cấp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {group.assignments.map((assignment, index) => {
                        const permissionCount = getPermissionCount(assignment.permissions)
                        const permissionList = getPermissionList(assignment.permissions)
                        
                        return (
                          <Card key={assignment.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">
                                      {assignment.conferenceName || getConferenceName(assignment.conferenceId)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">ID: {assignment.conferenceId}</p>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                                    <Badge 
                                      variant={assignment.isActive === 1 ? "default" : "secondary"}
                                      className={assignment.isActive === 1 ? "bg-green-100 text-green-800" : ""}
                                    >
                                      {assignment.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Số quyền</p>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {permissionCount} quyền
                                    </Badge>
                                  </div>
                                </div>

                                {permissionList.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Quyền được cấp:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {permissionList.map((permission) => (
                                        <Badge key={permission} variant="outline" className="text-xs">
                                          {getPermissionName(permission)}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="text-xs text-muted-foreground mt-2">
                                  Ngày giao: {new Date(assignment.assignedAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onToggleStatus?.(assignment)}
                                  className={assignment.isActive === 1 ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                >
                                  {assignment.isActive === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onDelete?.(assignment.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Tổng quan quyền truy cập</CardTitle>
                  <CardDescription>
                    Thống kê quyền được cấp cho tất cả hội nghị
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{group.totalPermissions}</div>
                      <div className="text-sm text-muted-foreground">Tổng quyền được cấp</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{group.activeAssignments}</div>
                      <div className="text-sm text-muted-foreground">Hội nghị hoạt động</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">{group.assignments.length}</div>
                      <div className="text-sm text-muted-foreground">Tổng hội nghị</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Chi tiết quyền theo hội nghị:</h4>
                    {group.assignments.map((assignment) => {
                      const permissionCount = getPermissionCount(assignment.permissions)
                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <span className="font-medium">
                              {assignment.conferenceName || getConferenceName(assignment.conferenceId)}
                            </span>
                            <Badge 
                              variant={assignment.isActive === 1 ? "default" : "secondary"}
                              className={`ml-2 ${assignment.isActive === 1 ? "bg-green-100 text-green-800" : ""}`}
                            >
                              {assignment.isActive === 1 ? "Hoạt động" : "Tạm dừng"}
                            </Badge>
                          </div>
                          <Badge variant="outline">
                            {permissionCount} quyền
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Thống kê tổng quan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Thông tin người dùng</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tên:</span>
                          <span className="font-medium">{group.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{group.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vai trò:</span>
                          <span className="font-medium">{user?.role || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Thống kê phân quyền</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tổng hội nghị:</span>
                          <span className="font-medium">{group.assignments.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Đang hoạt động:</span>
                          <span className="font-medium text-green-600">{group.activeAssignments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tạm dừng:</span>
                          <span className="font-medium text-red-600">{group.assignments.length - group.activeAssignments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tổng quyền:</span>
                          <span className="font-medium">{group.totalPermissions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(group)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa tất cả
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
