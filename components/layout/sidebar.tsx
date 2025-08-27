"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Calendar,
  QrCode,
  Settings,
  Shield,
  FileText,
  Menu,
  X,
  Network,
  MapPin,
  Video,
  Award,
  BarChart3,
  Smartphone,
} from "lucide-react";

interface SidebarProps {
  userRole: "admin" | "staff" | "attendee";
}

const navigationItems = {
  admin: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/conferences", icon: Calendar, label: "Quản lý hội nghị" },
    { href: "/attendees", icon: Users, label: "Danh sách tham dự" },
    { href: "/checkin", icon: QrCode, label: "Check-in QR" },
    { href: "/networking", icon: Network, label: "Kết nối mạng" },
    { href: "/venue", icon: MapPin, label: "Bản đồ địa điểm" },
    { href: "/sessions", icon: Video, label: "Phiên trực tiếp" },
    { href: "/badges", icon: Award, label: "Huy hiệu số" },
    { href: "/analytics", icon: BarChart3, label: "Phân tích AI" },
    { href: "/mobile", icon: Smartphone, label: "Ứng dụng di động" },
    { href: "/roles", icon: Shield, label: "Phân quyền" },
    { href: "/audit", icon: FileText, label: "Nhật ký hệ thống" },
    { href: "/settings", icon: Settings, label: "Cài đặt" },
  ],
  staff: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/attendees", icon: Users, label: "Danh sách tham dự" },
    { href: "/checkin", icon: QrCode, label: "Check-in QR" },
    { href: "/networking", icon: Network, label: "Kết nối mạng" },
    { href: "/venue", icon: MapPin, label: "Bản đồ địa điểm" },
    { href: "/sessions", icon: Video, label: "Phiên trực tiếp" },
    { href: "/badges", icon: Award, label: "Huy hiệu số" },
    { href: "/mobile", icon: Smartphone, label: "Ứng dụng di động" },
  ],
  attendee: [
    { href: "/dashboard", icon: LayoutDashboard, label: "Trang chủ" },
    { href: "/my-events", icon: Calendar, label: "Sự kiện của tôi" },
    { href: "/networking", icon: Network, label: "Kết nối mạng" },
    { href: "/venue", icon: MapPin, label: "Bản đồ địa điểm" },
    { href: "/sessions", icon: Video, label: "Phiên trực tiếp" },
    { href: "/badges", icon: Award, label: "Huy hiệu của tôi" },
    { href: "/mobile", icon: Smartphone, label: "Ứng dụng di động" },
  ],
};

const roleLabels = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  attendee: "Tham dự",
};

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const items = navigationItems[userRole];

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-lg text-sidebar-foreground">
              ConferenceMS
            </h1>
            <Badge className={cn("text-xs mt-1 w-fit", roleColors[userRole])}>
              {roleLabels[userRole]}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  isCollapsed && "px-2",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60">Phiên bản 1.0.0</p>
        </div>
      )}
    </div>
  );
}
