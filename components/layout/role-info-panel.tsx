"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Info, 
  Shield, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleInfoPanelProps {
  className?: string;
}

export function RoleInfoPanel({ className }: RoleInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { permissions, isLoading } = usePermissions();

  if (!user) return null;

  const currentRole = user.role as "admin" | "staff" | "attendee";

  const roleInfo = {
    admin: {
      label: "Quản trị viên",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      description: "Toàn quyền truy cập hệ thống",
      permissions: [
        "Quản lý hội nghị",
        "Quản lý người tham dự", 
        "Check-in QR",
        "Phân quyền người dùng",
        "Xem nhật ký hệ thống",
        "Cài đặt hệ thống",
        "Phân tích AI",
        "Tất cả tính năng khác"
      ]
    },
    staff: {
      label: "Nhân viên",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      description: "Quyền quản lý cơ bản",
      permissions: [
        "Quản lý hội nghị",
        "Quản lý người tham dự",
        "Check-in QR",
        "Kết nối mạng",
        "Bản đồ địa điểm",
        "Phiên trực tiếp",
        "Huy hiệu số",
        "Ứng dụng di động"
      ]
    },
    attendee: {
      label: "Tham dự",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      description: "Quyền tham dự cơ bản",
      permissions: [
        "Xem sự kiện của tôi",
        "Kết nối mạng",
        "Bản đồ địa điểm", 
        "Phiên trực tiếp",
        "Huy hiệu của tôi",
        "Ứng dụng di động"
      ]
    }
  };

  const info = roleInfo[currentRole];
  
  // Get actual permissions from API or fallback to role-based
  const actualPermissions = permissions.length > 0 
    ? permissions.map(p => p.name)
    : info.permissions;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Thông tin quyền</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", info.color)}>
              {info.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {info.description}
            </span>
          </div>

          {/* Permissions List */}
          {isExpanded && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Quyền hạn hiện tại:
                </span>
              </div>
                             <div className="grid grid-cols-1 gap-1">
                 {actualPermissions.map((permission, index) => (
                   <div key={index} className="flex items-center gap-2">
                     <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                     <span className="text-xs text-muted-foreground">
                       {permission}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="text-xs text-muted-foreground">
            {actualPermissions.length} tính năng có sẵn
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
