"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Users, Calendar, Settings, CheckCircle, XCircle } from "lucide-react"
import { apiClient, User, ConferenceInfo, UserConferenceAssignment, CreateUserConferenceAssignmentRequest, BulkAssignConferencesRequest } from "@/lib/api"
import { toast } from "sonner"

interface ConferenceAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onAssignmentCreated?: () => void
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

export function ConferenceAssignmentDialog({ open, onOpenChange, user, onAssignmentCreated }: ConferenceAssignmentDialogProps) {
  const [conferences, setConferences] = useState<ConferenceInfo[]>([])
  const [selectedConferences, setSelectedConferences] = useState<number[]>([])
  const [permissions, setPermissions] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [existingAssignments, setExistingAssignments] = useState<UserConferenceAssignment[]>([])

  // Load conferences and existing assignments when dialog opens
  useEffect(() => {
    if (open && user) {
      loadData()
    }
  }, [open, user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [conferencesResponse, assignmentsResponse] = await Promise.all([
        apiClient.getConferences({ page: 1, limit: 1000 }),
        apiClient.getUserAssignments(Number(user.id))
      ])

      setConferences(conferencesResponse.data)
      setExistingAssignments(assignmentsResponse.data)

      // Initialize permissions with default values
      const defaultPermissions: Record<string, boolean> = {}
      conferencePermissions.forEach(perm => {
        defaultPermissions[perm.code] = false
      })
      setPermissions(defaultPermissions)
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const filteredConferences = conferences.filter(conference =>
    conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conference.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleConferenceToggle = (conferenceId: number) => {
    setSelectedConferences(prev => {
      if (prev.includes(conferenceId)) {
        return prev.filter(id => id !== conferenceId)
      } else {
        return [...prev, conferenceId]
      }
    })
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
    if (!user || selectedConferences.length === 0) {
      toast.error('Vui lòng chọn ít nhất một hội nghị')
      return
    }

    const hasAnyPermission = Object.values(permissions).some(Boolean)
    if (!hasAnyPermission) {
      toast.error('Vui lòng chọn ít nhất một quyền')
      return
    }

    try {
      setLoading(true)

      // Check for existing assignments
      const existingConferenceIds = existingAssignments.map(a => a.conferenceId)
      const newConferenceIds = selectedConferences.filter(id => !existingConferenceIds.includes(id))
      const duplicateConferenceIds = selectedConferences.filter(id => existingConferenceIds.includes(id))

      if (duplicateConferenceIds.length > 0) {
        toast.warning(`Một số hội nghị đã được giao: ${duplicateConferenceIds.map(id => 
          conferences.find(c => c.id === id)?.name
        ).join(', ')}`)
      }

      if (newConferenceIds.length > 0) {
        const bulkAssignData: BulkAssignConferencesRequest = {
          userId: Number(user.id),
          conferenceIds: newConferenceIds,
          permissions
        }

        await apiClient.bulkAssignConferences(bulkAssignData)
        toast.success(`Đã giao ${newConferenceIds.length} hội nghị cho ${user.name}`)
        onAssignmentCreated?.()
        onOpenChange(false)
      } else {
        toast.info('Tất cả hội nghị đã được giao trước đó')
      }
    } catch (error: any) {
      console.error('Error creating assignments:', error)
      toast.error('Không thể tạo phân quyền')
    } finally {
      setLoading(false)
    }
  }

  const isConferenceSelected = (conferenceId: number) => selectedConferences.includes(conferenceId)
  const isConferenceAlreadyAssigned = (conferenceId: number) => existingAssignments.some(a => a.conferenceId === conferenceId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Giao hội nghị cho nhân viên</DialogTitle>
          <DialogDescription>
            Chọn hội nghị và quyền truy cập cho {user?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Thông tin nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline">{user?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="conferences" className="space-y-4 flex-1 flex flex-col">
            <TabsList className="flex-shrink-0">
              <TabsTrigger value="conferences">Chọn hội nghị</TabsTrigger>
              <TabsTrigger value="permissions">Cấu hình quyền</TabsTrigger>
            </TabsList>

            <TabsContent value="conferences" className="space-y-4 flex-1 flex flex-col">
              {/* Search */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm hội nghị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Conferences List */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 p-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Đang tải...</p>
                    </div>
                  ) : filteredConferences.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Không tìm thấy hội nghị nào</p>
                    </div>
                  ) : (
                    filteredConferences.map((conference) => {
                      const isSelected = isConferenceSelected(conference.id)
                      const isAlreadyAssigned = isConferenceAlreadyAssigned(conference.id)
                      
                      return (
                        <Card 
                          key={conference.id} 
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                            isAlreadyAssigned ? 'bg-yellow-50 border-yellow-200' : 
                            'hover:bg-muted/50'
                          }`}
                          onClick={() => !isAlreadyAssigned && handleConferenceToggle(conference.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{conference.name}</h3>
                                  {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                                  {isAlreadyAssigned && (
                                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                      Đã giao
                                    </Badge>
                                  )}
                                </div>
                                {conference.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {conference.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>📅 {new Date(conference.startDate).toLocaleDateString('vi-VN')}</span>
                                  <span>📍 {conference.location || 'Chưa xác định'}</span>
                                  <Badge variant={conference.status === 'active' ? 'default' : 'secondary'}>
                                    {conference.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Selected Count */}
              <div className="text-sm text-muted-foreground flex-shrink-0">
                Đã chọn {selectedConferences.length} hội nghị
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 flex-1 flex flex-col">
              {/* Permission Controls */}
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={handleSelectAllPermissions}>
                  Chọn tất cả
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAllPermissions}>
                  Bỏ chọn tất cả
                </Button>
              </div>

              {/* Permissions List */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 p-4">
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
              <div className="text-sm text-muted-foreground flex-shrink-0">
                Đã chọn {Object.values(permissions).filter(Boolean).length} quyền
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading || selectedConferences.length === 0}>
            {loading ? 'Đang lưu...' : 'Lưu phân quyền'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
