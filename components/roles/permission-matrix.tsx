"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Shield, Key, Users, Save } from "lucide-react"

interface PermissionMatrixProps {
  permissions: Array<{ id: number; name: string; description?: string; category?: string }>
  rolePermissions: Record<string, string[]>
  roles: Array<{ id: number; code: string; name: string }>
  onPermissionChange: (roleId: number, permissionId: number, checked: boolean) => void
}

const roleIcons = {
  admin: Shield,
  staff: Key,
  attendee: Users,
}

const roleLabels = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  attendee: "Tham dự",
}

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

export function PermissionMatrix({ permissions, rolePermissions, roles, onPermissionChange }: PermissionMatrixProps) {
  const [currentPermissions, setCurrentPermissions] = useState(rolePermissions)
  const [hasChanges, setHasChanges] = useState(false)

  const categories = [...new Set(permissions.map((p) => p.category || 'Khác'))]

  const handlePermissionToggle = async (roleId: number, permissionId: number, checked: boolean) => {
    try {
      // Call the parent's permission change handler (this will call the API)
      await onPermissionChange(roleId, permissionId, checked)
      
      // Update local state for immediate UI feedback
      setCurrentPermissions((prev) => {
        const newPermissions = { ...prev }
        const role = roles.find(r => r.id === roleId)
        if (role) {
          const roleKey = role.code
          if (checked) {
            newPermissions[roleKey] = [...(newPermissions[roleKey] || []), permissionId.toString()]
          } else {
            newPermissions[roleKey] = (newPermissions[roleKey] || []).filter((id) => id !== permissionId.toString())
          }
        }
        return newPermissions
      })
      setHasChanges(false) // No changes pending since we saved to backend
    } catch (error) {
      console.error('Failed to update permission:', error)
      // Revert the UI change on error
      setCurrentPermissions(rolePermissions)
    }
  }

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving permissions:", currentPermissions)
    setHasChanges(false)
  }

  const handleReset = () => {
    setCurrentPermissions(rolePermissions)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Ma trận phân quyền</h2>
          <p className="text-muted-foreground">Cấu hình quyền truy cập cho từng vai trò</p>
        </div>
        {hasChanges && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Hủy thay đổi
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        )}
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const Icon = roleIcons[role.code as keyof typeof roleIcons] || Shield
          const permissionCount = currentPermissions[role.code]?.length || 0
          return (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{role.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{permissionCount}</div>
                <p className="text-xs text-muted-foreground">quyền được cấp</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Permission Matrix */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Quyền truy cập cho danh mục {category.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium">Quyền</th>
                    {roles.map((role) => (
                      <th key={role.id} className="text-center py-2 px-4 font-medium">
                        <Badge className={roleColors[role.code as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
                          {role.name}
                        </Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions
                    .filter((p) => p.category === category)
                    .map((permission) => (
                      <tr key={permission.id} className="border-b">
                        <td className="py-3 pr-4">
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">{permission.description}</div>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={`${role.id}-${permission.id}`} className="text-center py-3 px-4">
                            <Checkbox
                              checked={currentPermissions[role.code]?.includes(permission.id.toString()) || false}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(role.id, permission.id, checked as boolean)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
