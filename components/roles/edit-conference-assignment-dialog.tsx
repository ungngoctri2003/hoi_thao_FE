"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Calendar, Settings, CheckCircle, XCircle } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User, UpdateUserConferenceAssignmentRequest } from "@/lib/api"
import { toast } from "sonner"

interface EditConferenceAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: UserConferenceAssignment | null
  onAssignmentUpdated?: () => void
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

export function EditConferenceAssignmentDialog({ 
  open, 
  onOpenChange, 
  assignment, 
  onAssignmentUpdated 
}: EditConferenceAssignmentDialogProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [conference, setConference] = useState<ConferenceInfo | null>(null)
  const [user, setUser] = useState<User | null>(null)

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
      setIsActive(assignment.isActive === 1)
    } catch (error: any) {
      console.error('Error loading assignment data:', error)
      toast.error('Không thể tải dữ liệu phân quyền')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionCode: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionCode]: checked
    }))
  }

  const handleSelectAllPermissions = () => {
    const allPermissions: Record<string, boolean> = {}
    conferencePermissions.forEach(perm => {
      allPermissions[perm.code] = true
    })
    setPermissions(allPermissions)
  }

  const handleDeselectAllPermissions = () => {
    const noPermissions: Record<string, boolean> = {}
    conferencePermissions.forEach(perm => {
      noPermissions[perm.code] = false
    })
    setPermissions(noPermissions)
  }

  const handleSave = async () => {
    if (!assignment) return

    const hasAnyPermission = Object.values(permissions).some(Boolean)
    if (!hasAnyPermission) {
      toast.error('Vui lòng chọn ít nhất một quyền')
      return
    }

    try {
      setLoading(true)

      const updateData: UpdateUserConferenceAssignmentRequest = {
        permissions,
        isActive: isActive ? 1 : 0
      }

      await apiClient.updateUserConferenceAssignment(assignment.id, updateData)
      toast.success('Đã cập nhật phân quyền thành công')
      onAssignmentUpdated?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating assignment:', error)
      const errorMessage = error?.message || 'Không thể cập nhật phân quyền'
      toast.error(`Lỗi: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!assignment) return

    try {
      setLoading(true)
      
      if (isActive) {
        await apiClient.deactivateUserConferenceAssignment(assignment.id)
        setIsActive(false)
        toast.success('Đã vô hiệu hóa phân quyền')
      } else {
        // Reactivate by updating with isActive = 1
        const updateData: UpdateUserConferenceAssignmentRequest = {
          permissions,
          isActive: 1
        }
        await apiClient.updateUserConferenceAssignment(assignment.id, updateData)
        setIsActive(true)
        toast.success('Đã kích hoạt lại phân quyền')
      }
      
      onAssignmentUpdated?.()
    } catch (error: any) {
      console.error('Error toggling assignment status:', error)
      const errorMessage = error?.message || 'Không thể thay đổi trạng thái phân quyền'
      toast.error(`Lỗi: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (!assignment) return null

  if (loading && !permissions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Chỉnh sửa phân quyền hội nghị</DialogTitle>
            <DialogDescription>
              Cập nhật quyền truy cập cho phân quyền này
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
          <DialogTitle>Chỉnh sửa phân quyền hội nghị</DialogTitle>
          <DialogDescription>
            Cập nhật quyền truy cập cho phân quyền này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Info */}
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
                  <div>
                    <h3 className="font-semibold">{assignment.userName || user?.name || `Người dùng #${assignment.userId}`}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.userEmail || user?.email || ''}</p>
                    <Badge variant="outline">{user?.role || 'N/A'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conference Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông tin hội nghị
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{assignment.conferenceName || conference?.name || `Hội nghị #${assignment.conferenceId}`}</h3>
                    <p className="text-sm text-muted-foreground">ID: {assignment.conferenceId}</p>
                    {conference?.description && (
                      <p className="text-sm text-muted-foreground mt-1">{conference.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Permissions */}
          <div className="space-y-4">
            {/* Status Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Trạng thái phân quyền
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className={isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Quyền truy cập</CardTitle>
                <CardDescription>
                  Chọn các quyền mà người dùng có thể thực hiện với hội nghị này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Permission Controls */}
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={handleSelectAllPermissions}>
                    Chọn tất cả
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAllPermissions}>
                    Bỏ chọn tất cả
                  </Button>
                </div>

                {/* Permissions List */}
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {conferencePermissions.map((permission) => (
                      <Card key={permission.code} className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.code}
                            checked={permissions[permission.code] || false}
                            onCheckedChange={(checked) => handlePermissionChange(permission.code, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={permission.code} className="font-medium cursor-pointer">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* Selected Permissions Summary */}
                <div className="text-sm text-muted-foreground mt-4">
                  Đã chọn {Object.values(permissions).filter(Boolean).length} quyền
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
