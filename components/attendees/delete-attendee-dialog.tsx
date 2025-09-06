"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User, Trash2, X } from "lucide-react";
import { Attendee } from "@/lib/api/attendees-api";

interface DeleteAttendeeDialogProps {
  attendee: Attendee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteAttendeeDialog({ 
  attendee, 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: DeleteAttendeeDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting attendee:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!attendee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Xác nhận xóa tham dự viên
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Hành động này không thể hoàn tác
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Thông tin tham dự viên sẽ bị xóa:
                </h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p><strong>Tên:</strong> {attendee.NAME}</p>
                  <p><strong>Email:</strong> {attendee.EMAIL}</p>
                  {attendee.PHONE && (
                    <p><strong>Số điện thoại:</strong> {attendee.PHONE}</p>
                  )}
                  {attendee.COMPANY && (
                    <p><strong>Công ty:</strong> {attendee.COMPANY}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Cảnh báo quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Tất cả thông tin cá nhân sẽ bị xóa vĩnh viễn</li>
                  <li>Lịch sử đăng ký hội nghị sẽ bị mất</li>
                  <li>Dữ liệu check-in/check-out sẽ bị xóa</li>
                  <li>Hành động này không thể hoàn tác</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting || isLoading}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || isLoading}
            className="w-full sm:w-auto"
          >
            {isDeleting || isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa tham dự viên
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
