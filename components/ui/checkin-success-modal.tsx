"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, QrCode, Calendar, MapPin, Users } from "lucide-react";

interface CheckinSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferenceName: string;
  conferenceLocation: string;
  conferenceDate: string;
}

export function CheckinSuccessModal({
  isOpen,
  onClose,
  conferenceName,
  conferenceLocation,
  conferenceDate,
}: CheckinSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Check-in thành công!
            </h2>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Bạn đã check-in thành công vào hội nghị
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {conferenceName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {conferenceLocation}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {conferenceDate}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                Thông tin check-in đã được lưu vào hệ thống
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Hoàn thành
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

