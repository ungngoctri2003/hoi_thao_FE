"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { User, Mail, CalendarDays, Shield } from "lucide-react";

export default function ProfilePage() {
  // Giả lập dữ liệu người dùng, thực tế nên lấy từ context hoặc API
  const [user, setUser] = useState({
    name: "Lê Văn User",
    email: "levanuser@email.com",
    role: "attendee",
    joinedAt: "2024-01-15",
  });

  const [editData, setEditData] = useState(user);
  const [open, setOpen] = useState(false);

  const roleLabels = {
    admin: "Quản trị viên",
    staff: "Nhân viên",
    attendee: "Tham dự",
  };

  const roleColors = {
    admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    attendee:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  const handleSave = () => {
    setUser(editData);
    setOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center   p-0">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg mb-2">
            <User className="h-12 w-12 text-primary-foreground" />
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
          <div className="pt-4 flex justify-center">
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
                    Thay đổi tên hoặc email của bạn. Vai trò không thể chỉnh
                    sửa.
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
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Hủy</Button>
                  </DialogClose>
                  <Button onClick={handleSave}>Lưu thay đổi</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
