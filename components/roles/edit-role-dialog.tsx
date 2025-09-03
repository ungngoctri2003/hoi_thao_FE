"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Role, UpdateRoleRequest } from "@/lib/api"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onRoleUpdated: () => void
}

export function EditRoleDialog({ open, onOpenChange, role, onRoleUpdated }: EditRoleDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Update form when role changes
  useEffect(() => {
    if (role) {
      setName(role.name)
      setCode(role.code)
    }
  }, [role])

  const handleSave = async () => {
    if (!role) return

    // Validation
    if (!name.trim()) {
      toast.error("Tên vai trò không được để trống")
      return
    }
    if (!code.trim()) {
      toast.error("Mã vai trò không được để trống")
      return
    }

    try {
      setLoading(true)
      const updateData: UpdateRoleRequest = {
        name: name.trim(),
        code: code.trim(),
      }

      console.log('Updating role:', { roleId: role.id, updateData })
      await apiClient.updateRole(role.id, updateData)
      console.log('Role updated successfully')
      toast.success("Cập nhật vai trò thành công")
      onRoleUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating role:", error)
      const errorMessage = error?.message || "Không thể cập nhật vai trò"
      toast.error(`Lỗi: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!role) return

    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      return
    }

    try {
      setDeleteLoading(true)
      await apiClient.deleteRole(role.id)
      toast.success("Xóa vai trò thành công")
      onRoleUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error deleting role:", error)
      const errorMessage = error?.message || "Không thể xóa vai trò"
      toast.error(errorMessage)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin vai trò hoặc xóa vai trò khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên vai trò
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Nhập tên vai trò"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Mã vai trò
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3"
              placeholder="Nhập mã vai trò"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteLoading ? "Đang xóa..." : "Xóa vai trò"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={loading || !name.trim() || !code.trim()}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
