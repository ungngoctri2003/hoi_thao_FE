"use client";

import { Bell, Search, User, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  userName: string;
  userRole: "admin" | "staff" | "attendee";
  userAvatar?: string;
}

const fakeNotifications = [
  {
    id: 1,
    title: "Bạn đã nhận được huy hiệu mới!",
    description: "Chúc mừng bạn đã đạt huy hiệu 'Tham dự tích cực'.",
    time: "2 phút trước",
  },
  {
    id: 2,
    title: "Có phiên họp sắp bắt đầu",
    description: "Phiên 'AI trong tương lai' sẽ bắt đầu sau 10 phút.",
    time: "10 phút trước",
  },
  {
    id: 3,
    title: "Cập nhật hệ thống",
    description: "Hệ thống sẽ bảo trì vào lúc 22:00 hôm nay.",
    time: "1 giờ trước",
  },
];

export function Header({ userName, userRole, userAvatar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      {/* Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm..." className="pl-10 w-80" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-12 w-12 flex items-center justify-center"
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute top-1 right-1 h-5 w-5 p-0 text-xs bg-red-500 flex items-center justify-center">
                {fakeNotifications.length}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg"
          >
            <div className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
              Thông báo
            </div>
            <DropdownMenuSeparator />
            {fakeNotifications.map((noti) => (
              <DropdownMenuItem
                key={noti.id}
                className="flex flex-col items-start space-y-0 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {noti.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {noti.description}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {noti.time}
                </span>
              </DropdownMenuItem>
            ))}
            {fakeNotifications.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Không có thông báo mới
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={userName}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-primary-foreground" />
                )}
              </div>
              <span className="font-medium">{userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {userRole === "admin"
                  ? "Quản trị viên"
                  : userRole === "staff"
                  ? "Nhân viên"
                  : "Tham dự"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/profile">
                <User className="mr-2 h-4 w-4" />
                Thông tin cá nhân
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600" 
              onSelect={handleLogout}
              disabled={isLoggingOut || isLoading}
            >
              {isLoggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng xuất...
                </div>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
