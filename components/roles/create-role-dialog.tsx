"use client"

import type React from "react"
import { useState } from "react"
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
import { apiClient, CreateRoleRequest } from "@/lib/api"
import { toast } from "sonner"

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoleCreated: () => void
}

export function CreateRoleDialog({ open, onOpenChange, onRoleCreated }: CreateRoleDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      setLoading(true)
      const roleData: CreateRoleRequest = {
        code: formData.code.trim(),
        name: formData.name.trim(),
      }
      
      await apiClient.createRole(roleData)
      toast.success("Tạo vai trò thành công")
      
      // Reset form
      setFormData({ code: "", name: "" })
      onOpenChange(false)
      onRoleCreated()
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error("Không thể tạo vai trò")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ code: "", name: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo vai trò mới</DialogTitle>
          <DialogDescription>
            Tạo một vai trò mới trong hệ thống với mã và tên vai trò
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Mã vai trò *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="VD: moderator, editor, viewer"
              required
            />
            <p className="text-sm text-muted-foreground">
              Mã vai trò phải là duy nhất và không chứa khoảng trắng
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên vai trò *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Điều hành viên, Biên tập viên, Người xem"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo vai trò"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
