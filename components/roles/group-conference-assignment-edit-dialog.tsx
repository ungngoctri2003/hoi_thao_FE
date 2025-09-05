"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, CheckCircle, XCircle, Save, RotateCcw } from "lucide-react"
import { apiClient, UserConferenceAssignment, ConferenceInfo, User, UpdateUserConferenceAssignmentRequest } from "@/lib/api"
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

interface GroupConferenceAssignmentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: GroupedAssignment | null
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

export function GroupConferenceAssignmentEditDialog({ 
  open, 
  onOpenChange, 
  group, 
  onAssignmentUpdated 
}: GroupConferenceAssignmentEditDialogProps) {
  const [conferences, setConferences] = useState<ConferenceInfo[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [assignmentsData, setAssignmentsData] = useState<Record<number, {
    permissions: Record<string, boolean>
    isActive: boolean
  }>>({})

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

      // Initialize assignments data
      const initialData: Record<number, { permissions: Record<string, boolean>, isActive: boolean }> = {}
      
      group.assignments.forEach(assignment => {
        let parsedPermissions: Record<string, boolean> = {}
        try {
          if (typeof assignment.permissions === 'string') {
            parsedPermissions = JSON.parse(assignment.permissions)
          } else if (assignment.permissions && typeof assignment.permissions === 'object') {
            parsedPermissions = assignment.permissions
          }
        } catch (error) {
          console.error('Error parsing permissions:', error)
        }

        initialData[assignment.id] = {
          permissions: parsedPermissions,
          isActive: assignment.isActive === 1
        }
      })

      setAssignmentsData(initialData)

      // Initialize bulk permissions with most common permissions
      const commonPermissions: Record<string, boolean> = {}
      conferencePermissions.forEach(perm => {
        // Set common permissions to true by default
        const isCommon = ['conferences.view', 'attendees.view', 'sessions.view'].includes(perm.code)
        commonPermissions[perm.code] = isCommon
      })
      setBulkPermissions(commonPermissions)
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

  const handlePermissionChange = (assignmentId: number, permissionCode: string, checked: boolean) => {
    setAssignmentsData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        permissions: {
          ...prev[assignmentId]?.permissions,
          [permissionCode]: checked
        }
      }
    }))
  }

  const handleStatusChange = (assignmentId: number, isActive: boolean) => {
    setAssignmentsData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        isActive
      }
    }))
  }

  const handleSelectAllPermissions = (assignmentId: number) => {
    const allPermissions: Record<string, boolean> = {}
    conferencePermissions.forEach(perm => {
      allPermissions[perm.code] = true
    })
    
    setAssignmentsData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        permissions: allPermissions
      }
    }))
  }

  const handleDeselectAllPermissions = (assignmentId: number) => {
    const noPermissions: Record<string, boolean> = {}
    conferencePermissions.forEach(perm => {
      noPermissions[perm.code] = false
    })
    
    setAssignmentsData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        permissions: noPermissions
      }
    }))
  }

  const handleSaveAll = async () => {
    if (!group) return

    // Validate all assignments
    const invalidAssignments = []
    for (const assignment of group.assignments) {
      const assignmentData = assignmentsData[assignment.id]
      if (!assignmentData) continue

      const hasAnyPermission = Object.values(assignmentData.permissions).some(Boolean)
      if (!hasAnyPermission) {
        invalidAssignments.push(getConferenceName(assignment.conferenceId))
      }
    }

    if (invalidAssignments.length > 0) {
      toast.error(`Vui lòng chọn ít nhất một quyền cho các hội nghị: ${invalidAssignments.join(', ')}`)
      return
    }

    try {
      setLoading(true)
      
      const updatePromises = group.assignments.map(async (assignment) => {
        const assignmentData = assignmentsData[assignment.id]
        if (!assignmentData) return

        const updateData: UpdateUserConferenceAssignmentRequest = {
          permissions: assignmentData.permissions,
          isActive: assignmentData.isActive ? 1 : 0
        }

        await apiClient.updateUserConferenceAssignment(assignment.id, updateData)
      })

      await Promise.all(updatePromises)
      toast.success(`Đã cập nhật thành công ${group.assignments.length} phân quyền`)
      onAssignmentUpdated?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error updating assignments:', error)
      const errorMessage = error?.message || 'Không thể cập nhật phân quyền'
      toast.error(`Lỗi: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAllStatus = () => {
    const hasAnyActive = Object.values(assignmentsData).some(data => data.isActive)
    const newStatus = !hasAnyActive

    setAssignmentsData(prev => {
      const updated = { ...prev }
      Object.keys(updated).forEach(assignmentId => {
        updated[Number(assignmentId)] = {
          ...updated[Number(assignmentId)],
          isActive: newStatus
        }
      })
      return updated
    })
  }


  if (!group) return null

  if (loading && Object.keys(assignmentsData).length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Chỉnh sửa phân quyền hội nghị</DialogTitle>
            <DialogDescription>
              Cập nhật quyền truy cập cho tất cả hội nghị của {group.userName}
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
          <DialogTitle>Chỉnh sửa phân quyền hội nghị</DialogTitle>
          <DialogDescription>
            Cập nhật quyền truy cập cho tất cả hội nghị của {group.userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{group.userName}</h3>
                  <p className="text-muted-foreground">{group.userEmail}</p>
                  {user?.role && (
                    <Badge variant="outline" className="mt-1">{user.role}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleAllStatus}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {Object.values(assignmentsData).some(data => data.isActive) ? 'Vô hiệu hóa tất cả' : 'Kích hoạt tất cả'}
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center">
                    {Object.values(assignmentsData).filter(data => data.isActive).length} / {Object.keys(assignmentsData).length} hoạt động
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="conferences" className="space-y-4 flex-1 flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="conferences">Chỉnh sửa hội nghị</TabsTrigger>
            </TabsList>

            <TabsContent value="conferences" className="space-y-4 flex-1 flex flex-col">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Chỉnh sửa hội nghị</CardTitle>
                  <CardDescription>
                    Cập nhật quyền cho từng hội nghị
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-6">
                      {group.assignments.map((assignment) => {
                        const assignmentData = assignmentsData[assignment.id]
                        if (!assignmentData) return null

                        return (
                          <Card key={assignment.id} className="p-4">
                            <div className="space-y-4">
                              {/* Conference Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
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
                                
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`status-${assignment.id}`}
                                    checked={assignmentData.isActive}
                                    onCheckedChange={(checked) => handleStatusChange(assignment.id, checked as boolean)}
                                  />
                                  <Label htmlFor={`status-${assignment.id}`} className="text-sm">
                                    Hoạt động
                                  </Label>
                                </div>
                              </div>

                              {/* Permission Controls */}
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleSelectAllPermissions(assignment.id)}
                                >
                                  Chọn tất cả
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleDeselectAllPermissions(assignment.id)}
                                >
                                  Bỏ chọn tất cả
                                </Button>
                              </div>

                              {/* Permissions List */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {conferencePermissions.map((permission) => (
                                  <div key={permission.code} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`${assignment.id}-${permission.code}`}
                                      checked={assignmentData.permissions[permission.code] || false}
                                      onCheckedChange={(checked) => handlePermissionChange(assignment.id, permission.code, checked as boolean)}
                                    />
                                    <div className="flex-1">
                                      <Label htmlFor={`${assignment.id}-${permission.code}`} className="text-sm font-medium cursor-pointer">
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Summary */}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Đã chọn {Object.values(assignmentData.permissions).filter(Boolean).length} quyền
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={assignmentData.isActive ? "default" : "secondary"}
                                    className={assignmentData.isActive ? "bg-green-100 text-green-800" : ""}
                                  >
                                    {assignmentData.isActive ? "Hoạt động" : "Tạm dừng"}
                                  </Badge>
                                </div>
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

          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSaveAll} disabled={loading}>
            {loading ? 'Đang lưu...' : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu tất cả thay đổi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
