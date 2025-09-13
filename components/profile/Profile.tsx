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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  CalendarDays,
  Shield,
  Camera,
  Lock,
  Phone,
  MapPin,
  Activity,
  Award,
  Clock,
  Settings,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";
import { ImageUpload } from "@/components/ui/image-upload";
import { ChangePassword } from "@/components/auth/change-password";
import { apiClient } from "@/lib/api";

interface UserProfile {
  // Basic info
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedAt: string;
  lastLogin?: string;

  // Extended info from ATTENDEES table
  phone?: string;
  dietary?: string;
  specialNeeds?: string;
  dateOfBirth?: string;
  gender?: string;

  // Recent activity
  recentActivity?: Array<{
    id: string;
    action: string;
    timestamp: string;
    details?: string;
  }>;
}

export default function ProfilePage() {
  const { user: authUser, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Sử dụng dữ liệu từ authentication state
  const [user, setUser] = useState<UserProfile>({
    name: authUser?.name || "Người dùng",
    email: authUser?.email || "user@example.com",
    role: authUser?.role || "attendee",
    avatar: authUser?.avatar,
    joinedAt: "2024-01-15",
    lastLogin: authUser?.updatedAt,
    recentActivity: [],
  });

  const [editData, setEditData] = useState<UserProfile>(user);
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) return;

      try {
        console.log("🔄 Loading user data...");

        // Load profile data with extended info
        let userData, attendeeData;
        try {
          const profileResponse = await apiClient.request<any>("/profile", {
            method: "GET",
          });
          userData = profileResponse.data.user;
          attendeeData = profileResponse.data.attendee;
          console.log("✅ Profile data loaded:", { userData, attendeeData });
        } catch (profileError) {
          console.warn("⚠️ Profile API failed, using auth data:", profileError);
          userData = null;
          attendeeData = null;
        }

        // Load recent activity
        let recentActivity = [];
        try {
          const auditResponse = await apiClient.getAuditLogs({
            userId: [authUser.id],
            limit: 10,
          });
          const recentLogs = auditResponse.data || [];
          recentActivity = recentLogs.slice(0, 5).map((log: any) => ({
            id: log.id.toString(),
            action: log.actionName || "Hoạt động",
            timestamp: log.timestamp,
            details: log.details,
          }));
        } catch (error) {
          console.warn("⚠️ Audit logs API failed:", error);
          recentActivity = [
            {
              id: "1",
              action: "Đăng nhập hệ thống",
              timestamp: new Date().toISOString(),
              details: "Truy cập trang profile",
            },
          ];
        }

        const updatedUser: UserProfile = {
          name:
            userData?.NAME || userData?.name || authUser.name || "Người dùng",
          email:
            userData?.EMAIL ||
            userData?.email ||
            authUser.email ||
            "user@example.com",
          role: authUser.role || "attendee",
          avatar:
            userData?.AVATAR_URL || userData?.avatar_url || authUser.avatar,
          joinedAt:
            userData?.CREATED_AT || userData?.created_at || "2024-01-15",
          lastLogin:
            userData?.LAST_LOGIN || userData?.last_login || authUser.updatedAt,

          // Extended info from ATTENDEES table
          phone: attendeeData?.PHONE || attendeeData?.phone,
          dietary: attendeeData?.DIETARY || attendeeData?.dietary,
          specialNeeds:
            attendeeData?.SPECIAL_NEEDS || attendeeData?.specialNeeds,
          dateOfBirth: attendeeData?.DATE_OF_BIRTH || attendeeData?.dateOfBirth,
          gender: attendeeData?.GENDER || attendeeData?.gender,

          // Recent activity
          recentActivity,
        };

        console.log("✅ User profile updated");

        setUser(updatedUser);
        setEditData(updatedUser);
      } catch (error) {
        console.error("❌ Failed to load user data:", error);
        // Fallback to basic data
        const updatedUser: UserProfile = {
          name: authUser.name || "Người dùng",
          email: authUser.email || "user@example.com",
          role: authUser.role || "attendee",
          avatar: authUser.avatar,
          joinedAt: "2024-01-15",
          lastLogin: authUser.updatedAt,
          recentActivity: [
            {
              id: "1",
              action: "Đăng nhập hệ thống",
              timestamp: new Date().toISOString(),
              details: "Truy cập trang profile",
            },
          ],
        };
        setUser(updatedUser);
        setEditData(updatedUser);
      }
    };

    loadUserData();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Chưa có thông tin";
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Chưa có thông tin";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Chưa có thông tin";
    }
  };

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-primary/10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white dark:border-slate-800">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-6 px-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground text-lg">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={roleColors[user.role]} variant="secondary">
                    {roleLabels[user.role]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Tham gia: {formatDate(user.joinedAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-full">
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
                      <DialogDescription>
                        Cập nhật thông tin cá nhân của bạn. Vai trò không thể
                        chỉnh sửa.
                        {isImageUploading && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                            📤 Đang upload ảnh lên cloud... Vui lòng đợi trước
                            khi lưu.
                          </div>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Họ tên</Label>
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            value={editData.phone || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={editData.gender || ""}
                          onValueChange={(value) =>
                            setEditData({ ...editData, gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dietary">Yêu cầu ăn uống</Label>
                        <Input
                          id="dietary"
                          value={editData.dietary || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              dietary: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Ăn chay, không ăn hải sản..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="specialNeeds">Nhu cầu đặc biệt</Label>
                        <Textarea
                          id="specialNeeds"
                          value={editData.specialNeeds || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              specialNeeds: e.target.value,
                            })
                          }
                          placeholder="Mô tả nhu cầu đặc biệt của bạn..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Vai trò</Label>
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
                    <DialogFooter className="sticky bottom-0 bg-background border-t pt-4 mt-4 flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating || isImageUploading}
                        className="w-full sm:w-auto"
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
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <ChangePassword
                  trigger={
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information - Comprehensive */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Thông tin chi tiết về tài khoản và hồ sơ cá nhân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Vai trò
                          </p>
                          <Badge
                            className={roleColors[user.role]}
                            variant="secondary"
                          >
                            {roleLabels[user.role]}
                          </Badge>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground">
                              Số điện thoại
                            </p>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      {user.gender && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Giới tính
                            </p>
                            <p className="font-medium capitalize">
                              {user.gender === "male"
                                ? "Nam"
                                : user.gender === "female"
                                ? "Nữ"
                                : "Khác"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Thông tin tài khoản
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tham gia
                          </p>
                          <p className="font-medium">
                            {formatDate(user.joinedAt)}
                          </p>
                        </div>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Lần đăng nhập cuối
                            </p>
                            <p className="font-medium text-xs">
                              {formatDateTime(user.lastLogin)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                {(user.dietary || user.specialNeeds) && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">
                      Thông tin bổ sung
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.dietary && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Yêu cầu ăn uống
                          </p>
                          <p className="font-medium">{user.dietary}</p>
                        </div>
                      )}
                      {user.specialNeeds && (
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Nhu cầu đặc biệt
                          </p>
                          <p className="font-medium">{user.specialNeeds}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.recentActivity && user.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {user.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.action}</p>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.details}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có hoạt động nào
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý cài đặt bảo mật và tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Đổi mật khẩu</h4>
                      <p className="text-sm text-muted-foreground">
                        Cập nhật mật khẩu để bảo mật tài khoản
                      </p>
                    </div>
                    <ChangePassword
                      trigger={
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Đổi mật khẩu
                        </Button>
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Thông tin cá nhân</h4>
                      <p className="text-sm text-muted-foreground">
                        Cập nhật thông tin cá nhân và liên hệ
                      </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
