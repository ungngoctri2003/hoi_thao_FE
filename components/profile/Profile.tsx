"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineLoading } from "@/components/ui/global-loading";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Mail, CalendarDays, Shield, Camera, Lock } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChangePassword } from "@/components/auth/change-password";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const { user: authUser, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Sử dụng dữ liệu từ authentication state
  const [user, setUser] = useState({
    name: authUser?.name || "Người dùng",
    email: authUser?.email || "user@example.com",
    role: authUser?.role || "attendee",
    avatar: authUser?.avatar,
    joinedAt: "2024-01-15", // Có thể lấy từ API sau
  });

  const [editData, setEditData] = useState(user);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Cập nhật user data khi authUser thay đổi
  useEffect(() => {
    if (authUser) {
      const updatedUser = {
        name: authUser.name || "Người dùng",
        email: authUser.email || "user@example.com",
        role: authUser.role || "attendee",
        avatar: authUser.avatar,
        joinedAt: "2024-01-15", // Có thể lấy từ API sau
      };
      setUser(updatedUser);
      setEditData(updatedUser);
    }
  }, [authUser]);

  const roleLabels: Record<string, string> = {
    admin: "Quản trị viên",
    staff: "Nhân viên",
    attendee: "Tham dự",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    attendee:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      console.log("💾 Saving profile with data:", {
        name: editData.name,
        email: editData.email,
        avatar: editData.avatar
          ? editData.avatar.substring(0, 50) + "..."
          : "null",
      });

      // Call updateProfile from auth service - this will update the global auth state
      await updateProfile({
        name: editData.name,
        email: editData.email,
        avatar: editData.avatar,
      });

      showSuccess("Cập nhật thành công", "Thông tin cá nhân đã được cập nhật");

      // The auth state will be updated automatically via the useAuth hook
      // No need to manually update local state

      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      showError(
        "Cập nhật thất bại",
        "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center   p-0">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg mb-2 overflow-hidden">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">{user.name}</CardTitle>
          <Badge className={roleColors[user.role]}>
            {roleLabels[user.role]}
          </Badge>
          <CardDescription className="mt-2 text-center text-muted-foreground">
            Chào mừng bạn đến với hệ thống quản lý hội nghị!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 mt-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-base">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-base">{roleLabels[user.role]}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-base">Tham gia: {user.joinedAt}</span>
            </div>
          </div>
          <div className="pt-4 flex justify-center gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  Chỉnh sửa thông tin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
                  <DialogDescription>
                    Thay đổi thông tin cá nhân của bạn. Vai trò không thể chỉnh
                    sửa.
                    {isImageUploading && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                        📤 Đang upload ảnh lên cloud... Vui lòng đợi trước khi
                        lưu.
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ tên
                    </label>
                    <Input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vai trò
                    </label>
                    <Input value={roleLabels[editData.role]} disabled />
                  </div>
                  <div>
                    <ImageUpload
                      value={editData.avatar || ""}
                      onChange={(avatarUrl) =>
                        setEditData({ ...editData, avatar: avatarUrl })
                      }
                      onUploadStateChange={setIsImageUploading}
                      label="Ảnh đại diện"
                      maxSize={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Hủy</Button>
                  </DialogClose>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating || isImageUploading}
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <InlineLoading size="sm" />
                        Đang lưu...
                      </div>
                    ) : isImageUploading ? (
                      <div className="flex items-center gap-2">
                        <InlineLoading size="sm" />
                        Đang upload ảnh...
                      </div>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <ChangePassword
              trigger={
                <Button variant="outline" size="lg">
                  <Lock className="mr-2 h-4 w-4" />
                  Đổi mật khẩu
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
