"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  conference: string;
  registrationDate: string;
  status: "registered" | "checked-in" | "cancelled" | "no-show";
  dietary: string;
  specialNeeds: string;
  avatar?: string;
}

interface AttendeeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendee: Attendee | null;
  onSave: (updated: Attendee) => void;
  conferences: string[];
}

export function AttendeeEditDialog({
  open,
  onOpenChange,
  attendee,
  onSave,
  conferences,
}: AttendeeEditDialogProps) {
  const [form, setForm] = React.useState<Attendee | null>(attendee);

  React.useEffect(() => {
    setForm(attendee);
  }, [attendee]);

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            Chỉnh sửa người tham dự
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin người tham dự. Các trường có dấu{" "}
            <span className="text-red-500">*</span> là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Họ tên *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email *"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            placeholder="Công ty"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <Input
            placeholder="Chức vụ"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
          <Select
            value={form.conference}
            onValueChange={(val) => setForm({ ...form, conference: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn hội nghị" />
            </SelectTrigger>
            <SelectContent>
              {conferences
                .filter((c) => c !== "Tất cả")
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              placeholder="Nhu cầu ăn uống"
              value={form.dietary}
              onChange={(e) => setForm({ ...form, dietary: e.target.value })}
            />
            <Input
              placeholder="Nhu cầu đặc biệt"
              value={form.specialNeeds}
              onChange={(e) =>
                setForm({ ...form, specialNeeds: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={form.status}
              onValueChange={(val) =>
                setForm({ ...form, status: val as Attendee["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">Đã đăng ký</SelectItem>
                <SelectItem value="checked-in">Đã check-in</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="no-show">Vắng mặt</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Ngày đăng ký"
              type="date"
              value={form.registrationDate}
              onChange={(e) =>
                setForm({ ...form, registrationDate: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button
            onClick={() => form && onSave(form)}
            disabled={!form.name || !form.email}
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
