"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Settings, CheckCircle, XCircle, Clock, Shield, Activity } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User } from "@/lib/api"
import { toast } from "sonner"

interface ConferenceAssignmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: UserConferenceAssignment | null
  onEdit?: (assignment: UserConferenceAssignment) => void
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

export function ConferenceAssignmentDetailDialog({ 
  open, 
  onOpenChange, 
  assignment, 
  onEdit,
  onToggleStatus
}: ConferenceAssignmentDetailDialogProps) {
  const [conference, setConference] = useState<ConferenceInfo | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})

  // Load assignment data when dialog opens
  useEffect(() => {
    if (open && assignment) {
      loadAssignmentData()
    }
  }, [open, assignment])

  const loadAssignmentData = async () => {
    if (!assignment) return

    try {
      setLoading(true)
      
      // Load conference and user data
      const [conferencesResponse, usersResponse] = await Promise.all([
        apiClient.getConferences({ page: 1, limit: 1000 }),
        apiClient.getUsers(1, 1000)
      ])

      const conferenceData = conferencesResponse.data?.find(c => c.id === assignment.conferenceId)
      const userData = usersResponse.data?.find(u => Number(u.id) === assignment.userId)

      setConference(conferenceData || null)
      setUser(userData || null)

      // Parse permissions safely
      let parsedPermissions: Record<string, boolean> = {}
      try {
        if (typeof assignment.permissions === 'string') {
          parsedPermissions = JSON.parse(assignment.permissions)
        } else if (assignment.permissions && typeof assignment.permissions === 'object') {
          parsedPermissions = assignment.permissions
        } else {
          parsedPermissions = {}
        }
      } catch (error) {
        console.error('Error parsing permissions:', error, assignment.permissions)
        parsedPermissions = {}
      }

      setPermissions(parsedPermissions)
    } catch (error: any) {
      console.error('Error loading assignment data:', error)
      toast.error('Không thể tải dữ liệu phân quyền')
    } finally {
      setLoading(false)
    }
  }

  const getPermissionCount = () => {
    return Object.values(permissions).filter(Boolean).length
  }

  const getPermissionList = () => {
    return Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
  }

  const getPermissionName = (code: string) => {
    const permission = conferencePermissions.find(p => p.code === code)
    return permission?.name || code
  }

  const getPermissionDescription = (code: string) => {
    const permission = conferencePermissions.find(p => p.code === code)
    return permission?.description || ''
  }

  if (!assignment) return null

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Chi tiết phân quyền hội nghị</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về phân quyền này
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Chi tiết phân quyền hội nghị</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phân quyền này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
          {/* Assignment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Người dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{assignment.userName || user?.name || `Người dùng #${assignment.userId}`}</div>
                      <div className="text-xs text-muted-foreground">{assignment.userEmail || user?.email || ''}</div>
                    </div>
                  </div>
                  {user?.role && (
                    <Badge variant="outline" className="text-xs">{user.role}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conference Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Hội nghị
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{assignment.conferenceName || conference?.name || `Hội nghị #${assignment.conferenceId}`}</div>
                      <div className="text-xs text-muted-foreground">ID: {assignment.conferenceId}</div>
                    </div>
                  </div>
                  {conference?.status && (
                    <Badge 
                      variant={conference.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {conference.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {assignment.isActive === 1 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-sm">
                      {assignment.isActive === 1 ? 'Hoạt động' : 'Không hoạt động'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {assignment.isActive === 1 ? 'Phân quyền đang có hiệu lực' : 'Phân quyền đã bị vô hiệu hóa'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="permissions" className="space-y-4 flex-1 flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="permissions">Quyền truy cập</TabsTrigger>
              <TabsTrigger value="details">Thông tin chi tiết</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4 flex-1 flex flex-col">
              {/* Permissions Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Tổng quan quyền truy cập
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{getPermissionCount()}</div>
                      <div className="text-sm text-muted-foreground">Quyền được cấp</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">{conferencePermissions.length - getPermissionCount()}</div>
                      <div className="text-sm text-muted-foreground">Quyền không được cấp</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">{conferencePermissions.length}</div>
                      <div className="text-sm text-muted-foreground">Tổng quyền có thể</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions List */}
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Danh sách quyền</CardTitle>
                  <CardDescription>
                    Chi tiết các quyền được cấp cho người dùng này
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {conferencePermissions.map((permission) => {
                      const hasPermission = permissions[permission.code] || false
                      return (
                        <div 
                          key={permission.code} 
                          className={`p-4 rounded-lg border ${
                            hasPermission 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {hasPermission ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{permission.name}</h3>
                                <Badge 
                                  variant={hasPermission ? "default" : "secondary"}
                                  className={hasPermission ? "bg-green-100 text-green-800" : ""}
                                >
                                  {hasPermission ? 'Có quyền' : 'Không có quyền'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                              <div className="text-xs text-muted-foreground mt-2 font-mono">
                                {permission.code}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 flex-1 flex flex-col">
              {/* Assignment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin phân quyền</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">ID Phân quyền</Label>
                        <div className="text-sm text-muted-foreground font-mono">{assignment.id}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Ngày tạo</Label>
                        <div className="text-sm text-muted-foreground">
                          {new Date(assignment.assignedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Cập nhật lần cuối</Label>
                        <div className="text-sm text-muted-foreground">
                          {assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Trạng thái</Label>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={assignment.isActive === 1 ? "default" : "secondary"}
                            className={assignment.isActive === 1 ? "bg-green-100 text-green-800" : ""}
                          >
                            {assignment.isActive === 1 ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Số quyền được cấp</Label>
                        <div className="text-sm text-muted-foreground">{getPermissionCount()} / {conferencePermissions.length}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conference Details */}
              {conference && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin hội nghị</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Tên hội nghị</Label>
                        <div className="text-sm text-muted-foreground">{conference.name}</div>
                      </div>
                      {conference.description && (
                        <div>
                          <Label className="text-sm font-medium">Mô tả</Label>
                          <div className="text-sm text-muted-foreground">{conference.description}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Ngày bắt đầu</Label>
                          <div className="text-sm text-muted-foreground">
                            {new Date(conference.startDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Ngày kết thúc</Label>
                          <div className="text-sm text-muted-foreground">
                            {conference.endDate ? new Date(conference.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Địa điểm</Label>
                          <div className="text-sm text-muted-foreground">{conference.location || 'Chưa xác định'}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Trạng thái hội nghị</Label>
                          <Badge  variant={conference.status === 'active' ? 'default' : 'secondary'}>
                            {conference.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(assignment)}>
              Chỉnh sửa
            </Button>
          )}
          {onToggleStatus && (
            <Button 
              variant="outline"
              onClick={() => onToggleStatus(assignment)}
              className={assignment.isActive === 1 ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            >
              {assignment.isActive === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

