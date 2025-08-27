"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Shield, Key, Users, Save } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface PermissionMatrixProps {
  permissions: Permission[]
  rolePermissions: Record<string, string[]>
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

export function PermissionMatrix({ permissions, rolePermissions }: PermissionMatrixProps) {
  const [currentPermissions, setCurrentPermissions] = useState(rolePermissions)
  const [hasChanges, setHasChanges] = useState(false)

  const categories = [...new Set(permissions.map((p) => p.category))]
  const roles = Object.keys(rolePermissions) as Array<keyof typeof rolePermissions>

  const handlePermissionChange = (role: string, permissionId: string, checked: boolean) => {
    setCurrentPermissions((prev) => {
      const newPermissions = { ...prev }
      if (checked) {
        newPermissions[role] = [...(newPermissions[role] || []), permissionId]
      } else {
        newPermissions[role] = (newPermissions[role] || []).filter((id) => id !== permissionId)
      }
      return newPermissions
    })
    setHasChanges(true)
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
          const Icon = roleIcons[role as keyof typeof roleIcons]
          const permissionCount = currentPermissions[role]?.length || 0
          return (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{roleLabels[role as keyof typeof roleLabels]}</CardTitle>
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
                      <th key={role} className="text-center py-2 px-4 font-medium">
                        <Badge className={roleColors[role as keyof typeof roleColors]}>
                          {roleLabels[role as keyof typeof roleLabels]}
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
                          <td key={`${role}-${permission.id}`} className="text-center py-3 px-4">
                            <Checkbox
                              checked={currentPermissions[role]?.includes(permission.id) || false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(role, permission.id, checked as boolean)
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
