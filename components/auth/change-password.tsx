"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PasswordStrength } from "@/components/auth/password-strength";
import { Eye, EyeOff, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";

interface ChangePasswordProps {
  trigger?: React.ReactNode;
}

export function ChangePassword({ trigger }: ChangePasswordProps) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { changePassword } = useAuth();
  const { showError, showSuccess } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    // Validation
    if (!currentPassword.trim()) {
      showError("Thiếu thông tin", "Vui lòng nhập mật khẩu hiện tại");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      showError("Mật khẩu quá ngắn", "Mật khẩu mới phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Mật khẩu không khớp", "Mật khẩu xác nhận không khớp với mật khẩu mới");
      setIsLoading(false);
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      showError("Mật khẩu yếu", "Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số");
      setIsLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      showError("Mật khẩu trùng lặp", "Mật khẩu mới phải khác mật khẩu hiện tại");
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setIsSuccess(true);
      showSuccess("Đổi mật khẩu thành công", "Mật khẩu đã được cập nhật thành công");
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setIsSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Change password error:', err);
      if (err.message?.includes('Invalid') || err.message?.includes('incorrect')) {
        showError("Mật khẩu không đúng", "Mật khẩu hiện tại không đúng");
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        showError("Lỗi kết nối", "Vui lòng kiểm tra kết nối internet và thử lại");
      } else {
        showError("Có lỗi xảy ra", err.message || "Vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Lock className="mr-2 h-4 w-4" />
            Đổi mật khẩu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>
            Thay đổi mật khẩu của bạn để bảo mật tài khoản tốt hơn.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                Đổi mật khẩu thành công!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mật khẩu của bạn đã được cập nhật.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  Hủy
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isLoading || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
