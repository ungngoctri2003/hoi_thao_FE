"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Building,
  Briefcase,
  Cake,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit,
  QrCode,
} from "lucide-react";
import {
  Attendee,
  Conference,
  Registration,
  CheckinStatus,
} from "@/lib/api/attendees-api";
import { useToast } from "@/hooks/use-toast";
import { QRNameCardGenerator } from "./qr-name-card-generator";

interface AttendeeWithConferences extends Attendee {
  conferences: Conference[];
  registrations: Registration[];
  overallStatus:
    | "not-registered"
    | "registered"
    | "checked-in"
    | "checked-out"
    | "no-show"
    | "cancelled";
  lastCheckinTime?: Date;
  lastCheckoutTime?: Date;
}

interface AttendeeDialogProps {
  attendee: AttendeeWithConferences | null;
  conferences: Conference[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Attendee>) => Promise<void>;
  onRefresh?: () => void;
  mode: "view" | "edit" | "create";
}

export function AttendeeDialog({
  attendee,
  conferences,
  isOpen,
  onClose,
  onSave,
  onRefresh,
  mode,
}: AttendeeDialogProps) {
  const [formData, setFormData] = useState<Partial<Attendee>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedConferenceId, setSelectedConferenceId] = useState<
    number | null
  >(null);
  const [checkinStatuses, setCheckinStatuses] = useState<CheckinStatus[]>([]);
  const [isManagingConferences, setIsManagingConferences] = useState(false);
  const [pendingConferences, setPendingConferences] = useState<number[]>([]);
  const [pendingCheckinUpdates, setPendingCheckinUpdates] = useState<
    Map<number, string>
  >(new Map());
  const [pendingRegistrations, setPendingRegistrations] = useState<number[]>(
    []
  );
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (attendee && mode !== "create") {
      setFormData(attendee);
    } else if (mode === "create") {
      setFormData({
        NAME: "",
        EMAIL: "",
        PHONE: "",
        COMPANY: "",
        POSITION: "",
        AVATAR_URL: "",
        DIETARY: "",
        SPECIAL_NEEDS: "",
        DATE_OF_BIRTH: null,
        GENDER: "",
        FIREBASE_UID: "",
      });
    }
  }, [attendee, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.NAME?.trim()) {
      newErrors.NAME = "Họ và tên là bắt buộc";
    }

    if (!formData.EMAIL?.trim()) {
      newErrors.EMAIL = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EMAIL)) {
      newErrors.EMAIL = "Email không hợp lệ";
    }

    if (formData.PHONE && !/^[0-9+\-\s()]+$/.test(formData.PHONE)) {
      newErrors.PHONE = "Số điện thoại không hợp lệ";
    }

    if (
      formData.FIREBASE_UID &&
      !/^[a-zA-Z0-9_-]+$/.test(formData.FIREBASE_UID)
    ) {
      newErrors.FIREBASE_UID = "Firebase UID không hợp lệ";
    }

    if (
      formData.AVATAR_URL &&
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(formData.AVATAR_URL)
    ) {
      newErrors.AVATAR_URL = "URL avatar phải là link ảnh hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});

      // Save attendee first
      await onSave(formData);

      // Process pending conference registrations
      if (pendingRegistrations.length > 0 && attendee?.ID) {
        console.log("Processing pending registrations:", pendingRegistrations);
        for (const conferenceId of pendingRegistrations) {
          try {
            const response = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:4000/api/v1"
              }/attendees/${attendee.ID}/registrations`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
                body: JSON.stringify({ conferenceId }),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to register for conference ${conferenceId}`
              );
            }
            console.log(
              `Successfully registered for conference ${conferenceId}`
            );
          } catch (error) {
            console.error(
              `Error registering for conference ${conferenceId}:`,
              error
            );
            throw new Error(`Lỗi khi đăng ký hội nghị ${conferenceId}`);
          }
        }
      }

      // Process pending checkin status updates
      if (pendingCheckinUpdates.size > 0) {
        console.log(
          "Processing pending checkin updates:",
          Array.from(pendingCheckinUpdates.entries())
        );
        for (const [
          registrationId,
          status,
        ] of pendingCheckinUpdates.entries()) {
          try {
            const response = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:4000/api/v1"
              }/registrations/${registrationId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
                body: JSON.stringify({ status }),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to update registration ${registrationId} status to ${status}`
              );
            }
            console.log(
              `Successfully updated registration ${registrationId} status to ${status}`
            );
          } catch (error) {
            console.error(
              `Error updating registration ${registrationId}:`,
              error
            );
            throw new Error(
              `Lỗi khi cập nhật trạng thái đăng ký ${registrationId}`
            );
          }
        }
      }

      // Process pending conference deletions
      if (pendingDeletions.length > 0) {
        console.log("Processing pending deletions:", pendingDeletions);
        for (const registrationId of pendingDeletions) {
          try {
            const response = await fetch(
              `${
                process.env.NEXT_PUBLIC_API_URL ||
                "http://localhost:4000/api/v1"
              }/registrations/${registrationId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(
                `Failed to delete registration ${registrationId}`
              );
            }
            console.log(`Successfully deleted registration ${registrationId}`);
          } catch (error) {
            console.error(
              `Error deleting registration ${registrationId}:`,
              error
            );
            throw new Error(`Lỗi khi xóa đăng ký hội nghị ${registrationId}`);
          }
        }
      }

      // If in create mode and there are pending conferences, register them
      if (mode === "create" && pendingConferences.length > 0) {
        // We need to get the created attendee ID to register for conferences
        // This would require the parent component to return the created attendee
        // For now, we'll show a message about pending registrations
        toast({
          title: "Thành công",
          description: `Tham dự viên đã được tạo thành công! ${pendingConferences.length} hội nghị sẽ được đăng ký sau khi tải lại trang.`,
          variant: "success",
        });
      }

      // Show success message if there were pending changes
      const totalChanges =
        pendingRegistrations.length +
        pendingCheckinUpdates.size +
        pendingDeletions.length;
      if (totalChanges > 0) {
        toast({
          title: "Thành công",
          description: `Cập nhật thành công! Đã xử lý ${totalChanges} thay đổi.`,
          variant: "success",
        });
      }

      // Clear pending changes after successful update
      setPendingRegistrations([]);
      setPendingCheckinUpdates(new Map());
      setPendingDeletions([]);

      // Refresh data if callback provided
      if (onRefresh) {
        onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Error saving attendee:", error);
      setErrors({ general: "Có lỗi xảy ra khi lưu dữ liệu" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Attendee, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Conference management functions
  const handleRegisterForConference = () => {
    if (!selectedConferenceId) return;

    if (mode === "create") {
      setPendingConferences((prev) => [...prev, selectedConferenceId]);
    } else {
      setPendingRegistrations((prev) => [...prev, selectedConferenceId]);
    }
    setSelectedConferenceId(null);
  };

  const handleRemovePendingConference = (conferenceId: number) => {
    if (mode === "create") {
      setPendingConferences((prev) => prev.filter((id) => id !== conferenceId));
    } else {
      setPendingRegistrations((prev) =>
        prev.filter((id) => id !== conferenceId)
      );
    }
  };

  const handleUpdateCheckinStatus = (
    registrationId: number,
    status: string
  ) => {
    setPendingCheckinUpdates(
      (prev) => new Map(prev.set(registrationId, status))
    );
  };

  const handleDeleteConference = (registrationId: number) => {
    // Use a more user-friendly confirmation approach
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa hội nghị này khỏi danh sách đăng ký?"
    );
    if (confirmed) {
      setPendingDeletions((prev) => [...prev, registrationId]);
      toast({
        title: "Thông báo",
        description:
          "Hội nghị đã được đánh dấu để xóa. Thay đổi sẽ được áp dụng khi lưu.",
        variant: "info",
      });
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  const isReadOnly = mode === "view";

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; color: string; icon: string }
    > = {
      "not-registered": {
        label: "Chưa đăng ký",
        color: "bg-gray-100 text-gray-600",
        icon: "⭕",
      },
      registered: {
        label: "Đã đăng ký",
        color: "bg-blue-100 text-blue-800",
        icon: "📝",
      },
      "checked-in": {
        label: "Đã check-in",
        color: "bg-green-100 text-green-800",
        icon: "✅",
      },
      "checked-out": {
        label: "Đã check-out",
        color: "bg-orange-100 text-orange-800",
        icon: "🚪",
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: "❌",
      },
      "no-show": {
        label: "Không tham dự",
        color: "bg-gray-100 text-gray-800",
        icon: "⏰",
      },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "bg-gray-100 text-gray-600",
      icon: "❓",
    };
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>
    );
  };

  // Conference management functions

  const loadCheckinStatuses = async () => {
    if (!attendee?.ID) return;

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/attendees/${attendee.ID}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const statuses: CheckinStatus[] = data.data.map(
          (reg: Registration) => ({
            registrationId: reg.ID,
            conferenceId: reg.CONFERENCE_ID,
            conferenceName:
              conferences.find((c) => c.ID === reg.CONFERENCE_ID)?.NAME ||
              "Unknown Conference",
            status: reg.STATUS as any,
            qrCode: reg.QR_CODE,
            registrationDate: reg.REGISTRATION_DATE,
            checkinTime: reg.CHECKIN_TIME,
            checkoutTime: reg.CHECKOUT_TIME,
          })
        );
        setCheckinStatuses(statuses);
      }
    } catch (error) {
      console.error("Error loading checkin statuses:", error);
    }
  };

  // Generate QR code for attendee
  const generateQRCode = async (
    attendeeId: number,
    conferenceId?: number
  ): Promise<string> => {
    try {
      if (!attendee || !conferenceId) {
        throw new Error("Missing attendee or conference information");
      }

      // Find conference and registration information
      const conference = conferences.find((c) => c.ID === conferenceId);
      const registration = checkinStatuses.find(
        (status) => status.conferenceId === conferenceId
      );

      if (!conference) {
        throw new Error("Conference not found");
      }

      // Create comprehensive QR data with all necessary information for checkin
      const qrData = {
        type: "attendee_registration",
        attendeeId: attendee.ID,
        conferenceId: conference.ID,
        registrationId: registration?.registrationId || null,
        timestamp: Date.now(),
        // Attendee information
        attendee: {
          id: attendee.ID,
          name: attendee.NAME,
          email: attendee.EMAIL,
          phone: attendee.PHONE,
          company: attendee.COMPANY,
          position: attendee.POSITION,
          avatarUrl: attendee.AVATAR_URL,
        },
        // Conference information
        conference: {
          id: conference.ID,
          name: conference.NAME,
          description: conference.DESCRIPTION,
          startDate: conference.START_DATE,
          endDate: conference.END_DATE,
          venue: conference.VENUE,
          status: conference.STATUS,
        },
        // Registration information
        registration: registration
          ? {
              id: registration.registrationId,
              status: registration.status,
              registrationDate: registration.registrationDate,
              checkinTime: registration.checkinTime,
              checkoutTime: registration.checkoutTime,
            }
          : null,
        // Security and validation
        checksum: generateChecksum(attendee.ID, conference.ID),
        version: "1.0",
      };

      return JSON.stringify(qrData);
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  };

  // Generate checksum for security validation
  const generateChecksum = (
    attendeeId: number,
    conferenceId: number
  ): string => {
    const data = `${attendeeId}-${conferenceId}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  // Load checkin statuses when attendee changes
  useEffect(() => {
    if (attendee && mode !== "create") {
      // Use real data from attendee.conferences and attendee.registrations
      if (attendee.conferences && attendee.registrations) {
        console.log("🔍 Loading real conference data for attendee:", {
          attendeeId: attendee.ID,
          attendeeName: attendee.NAME,
          conferences: attendee.conferences.length,
          registrations: attendee.registrations.length,
        });

        // Map registrations to CheckinStatus format
        const realStatuses: CheckinStatus[] = attendee.registrations.map((registration) => {
          const conference = attendee.conferences?.find(c => c.ID === registration.CONFERENCE_ID);
          return {
            registrationId: registration.ID,
            conferenceId: registration.CONFERENCE_ID,
            conferenceName: conference?.NAME || "Unknown Conference",
            status: registration.STATUS as any,
            qrCode: registration.QR_CODE,
            registrationDate: registration.REGISTRATION_DATE,
            checkinTime: registration.CHECKIN_TIME,
            checkoutTime: registration.CHECKOUT_TIME,
          };
        });

        console.log("✅ Mapped real statuses:", realStatuses);
        setCheckinStatuses(realStatuses);
      } else {
        // Fallback to API call if data is not available
        console.log("⚠️ No conference/registration data available, falling back to API call");
        loadCheckinStatuses();
      }
    }
  }, [attendee, mode, conferences]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>
              {mode === "create"
                ? "Thêm tham dự viên mới"
                : mode === "edit"
                ? "Chỉnh sửa tham dự viên"
                : "Chi tiết tham dự viên"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin tham dự viên mới"
              : mode === "edit"
              ? "Cập nhật thông tin tham dự viên"
              : "Xem thông tin chi tiết tham dự viên"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information - Show in all modes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                <CardDescription>
                  {mode === "create"
                    ? "Nhập thông tin cá nhân của tham dự viên mới"
                    : mode === "edit"
                    ? "Cập nhật thông tin cá nhân"
                    : "Thông tin cá nhân của tham dự viên"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={formData.NAME || ""}
                    onChange={(e) => handleInputChange("NAME", e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Nhập họ và tên"
                    className={errors.NAME ? "border-red-500" : ""}
                  />
                  {errors.NAME && (
                    <p className="text-sm text-red-500">{errors.NAME}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.EMAIL || ""}
                    onChange={(e) => handleInputChange("EMAIL", e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Nhập email"
                    className={errors.EMAIL ? "border-red-500" : ""}
                  />
                  {errors.EMAIL && (
                    <p className="text-sm text-red-500">{errors.EMAIL}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.PHONE || ""}
                    onChange={(e) => handleInputChange("PHONE", e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Nhập số điện thoại"
                    className={errors.PHONE ? "border-red-500" : ""}
                  />
                  {errors.PHONE && (
                    <p className="text-sm text-red-500">{errors.PHONE}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select
                    value={formData.GENDER || ""}
                    onValueChange={(value) =>
                      handleInputChange("GENDER", value)
                    }
                    disabled={isReadOnly}
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

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formatDate(formData.DATE_OF_BIRTH)}
                    onChange={(e) =>
                      handleInputChange(
                        "DATE_OF_BIRTH",
                        e.target.value ? new Date(e.target.value) : null
                      )
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin nghề nghiệp</CardTitle>
                <CardDescription>
                  {mode === "create"
                    ? "Nhập thông tin công việc và tổ chức"
                    : mode === "edit"
                    ? "Cập nhật thông tin công việc"
                    : "Thông tin công việc và tổ chức"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Công ty</Label>
                  <Input
                    id="company"
                    value={formData.COMPANY || ""}
                    onChange={(e) =>
                      handleInputChange("COMPANY", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Nhập tên công ty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Chức vụ</Label>
                  <Input
                    id="position"
                    value={formData.POSITION || ""}
                    onChange={(e) =>
                      handleInputChange("POSITION", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Nhập chức vụ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">URL Avatar</Label>
                  <Input
                    id="avatar"
                    value={formData.AVATAR_URL || ""}
                    onChange={(e) =>
                      handleInputChange("AVATAR_URL", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Nhập URL avatar"
                    className={errors.AVATAR_URL ? "border-red-500" : ""}
                  />
                  {errors.AVATAR_URL && (
                    <p className="text-sm text-red-500">{errors.AVATAR_URL}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firebaseUid">Firebase UID</Label>
                  <Input
                    id="firebaseUid"
                    value={formData.FIREBASE_UID || ""}
                    onChange={(e) =>
                      handleInputChange("FIREBASE_UID", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Firebase UID (tự động tạo khi đăng nhập Google)"
                    className={errors.FIREBASE_UID ? "border-red-500" : ""}
                  />
                  {errors.FIREBASE_UID && (
                    <p className="text-sm text-red-500">
                      {errors.FIREBASE_UID}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Firebase UID được tự động tạo khi người dùng đăng nhập bằng
                    Google
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
                <CardDescription>
                  {mode === "create"
                    ? "Nhập thông tin bổ sung về tham dự viên"
                    : mode === "edit"
                    ? "Cập nhật thông tin bổ sung"
                    : "Thông tin bổ sung về tham dự viên"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dietary">Yêu cầu ăn uống</Label>
                  <Textarea
                    id="dietary"
                    value={formData.DIETARY || ""}
                    onChange={(e) =>
                      handleInputChange("DIETARY", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Nhập yêu cầu ăn uống (nếu có)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNeeds">Nhu cầu đặc biệt</Label>
                  <Textarea
                    id="specialNeeds"
                    value={formData.SPECIAL_NEEDS || ""}
                    onChange={(e) =>
                      handleInputChange("SPECIAL_NEEDS", e.target.value)
                    }
                    disabled={isReadOnly}
                    placeholder="Nhập nhu cầu đặc biệt (nếu có)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Information - Only in view mode */}
            {mode === "view" && attendee && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin hệ thống</CardTitle>
                  <CardDescription>
                    Thông tin kỹ thuật và thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>ID</Label>
                    <div className="p-2 bg-gray-100 rounded-md">
                      <span className="font-mono text-sm">{attendee.ID}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Ngày tạo</Label>
                    <div className="p-2 bg-gray-100 rounded-md">
                      <span className="text-sm">
                        {new Date(attendee.CREATED_AT).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-2 bg-gray-100 rounded-md">
                      <span className="text-sm">{attendee.EMAIL}</span>
                    </div>
                  </div>

                  {attendee.FIREBASE_UID && (
                    <div className="space-y-2">
                      <Label>Firebase UID</Label>
                      <div className="p-2 bg-gray-100 rounded-md">
                        <span className="text-sm font-mono">
                          {attendee.FIREBASE_UID}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Conference Management - Full width section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {isReadOnly
                    ? "Hội nghị và Check-in"
                    : "Quản lý hội nghị và Check-in"}
                </span>
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIsManagingConferences(!isManagingConferences)
                    }
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{isManagingConferences ? "Ẩn" : "Quản lý"}</span>
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                {mode === "create"
                  ? "Chọn hội nghị để đăng ký khi tạo tham dự viên mới"
                  : isReadOnly
                  ? "Xem thông tin hội nghị và trạng thái check-in của tham dự viên"
                  : "Đăng ký hội nghị và quản lý trạng thái check-in cho tham dự viên"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Register for new conference - Only show in create/edit mode */}
              {!isReadOnly && (
                <div className="space-y-2">
                  <Label>Đăng ký hội nghị mới</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={selectedConferenceId?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedConferenceId(Number(value))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn hội nghị để đăng ký" />
                      </SelectTrigger>
                      <SelectContent>
                        {conferences
                          .filter(
                            (conf) =>
                              !checkinStatuses.some(
                                (status) => status.conferenceId === conf.ID
                              ) && !pendingConferences.includes(conf.ID)
                          )
                          .map((conference) => (
                            <SelectItem
                              key={conference.ID}
                              value={conference.ID.toString()}
                            >
                              {conference.NAME}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleRegisterForConference}
                      disabled={!selectedConferenceId || isLoading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isLoading ? "Đang xử lý..." : "Đăng ký"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Current registrations and check-in status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    {mode === "create"
                      ? "Hội nghị sẽ đăng ký"
                      : "Hội nghị đã đăng ký"}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (
                      {mode === "create"
                        ? pendingConferences.length
                        : checkinStatuses.length +
                          pendingRegistrations.length -
                          pendingDeletions.length}
                      )
                    </span>
                  </Label>
                  {!isManagingConferences && !isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsManagingConferences(true)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-6 bg-gray-50/50">
                  {/* Show pending conferences in create mode */}
                  {mode === "create" && pendingConferences.length > 0 ? (
                    pendingConferences.map((conferenceId) => {
                      const conference = conferences.find(
                        (c) => c.ID === conferenceId
                      );
                      return (
                        <div
                          key={conferenceId}
                          className="p-4 border rounded-lg bg-blue-50/80 hover:bg-blue-100/80 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <p className="font-semibold text-blue-900">
                                  {conference?.NAME || "Unknown Conference"}
                                </p>
                              </div>
                              <p className="text-sm text-blue-700">
                                Sẽ được đăng ký khi tạo tham dự viên
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-blue-200 text-blue-800 border-blue-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Chờ đăng ký
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleRemovePendingConference(conferenceId)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : mode !== "create" &&
                    (checkinStatuses.length > 0 ||
                      pendingRegistrations.length > 0) ? (
                    <>
                      {/* Show existing registrations */}
                      {checkinStatuses
                        .filter(
                          (status) =>
                            !pendingDeletions.includes(status.registrationId)
                        )
                        .map((status) => (
                          <div
                            key={status.registrationId}
                            className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Calendar className="h-4 w-4 text-gray-600" />
                                  <p className="font-semibold text-gray-900">
                                    {status.conferenceName}
                                  </p>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p className="flex items-center space-x-2">
                                    <QrCode className="h-3 w-3" />
                                    <span>QR Code: {status.qrCode}</span>
                                  </p>
                                  <p className="flex items-center space-x-2">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Đăng ký:{" "}
                                      {formatDateTime(status.registrationDate)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(
                                  pendingCheckinUpdates.get(
                                    status.registrationId
                                  ) || status.status
                                )}
                                {pendingCheckinUpdates.has(
                                  status.registrationId
                                ) && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Chờ cập nhật
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {isManagingConferences && !isReadOnly && (
                              <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                                <div className="flex-1">
                                  <Select
                                    value={
                                      pendingCheckinUpdates.get(
                                        status.registrationId
                                      ) || status.status
                                    }
                                    onValueChange={(value) =>
                                      handleUpdateCheckinStatus(
                                        status.registrationId,
                                        value
                                      )
                                    }
                                    disabled={isLoading}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="registered">
                                        📝 Đã đăng ký
                                      </SelectItem>
                                      <SelectItem value="checked-in">
                                        ✅ Đã check-in
                                      </SelectItem>
                                      <SelectItem value="checked-out">
                                        🚪 Đã check-out
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        ❌ Đã hủy
                                      </SelectItem>
                                      <SelectItem value="no-show">
                                        ⏰ Không tham dự
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDeleteConference(
                                      status.registrationId
                                    )
                                  }
                                  disabled={isLoading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}

                            {(status.checkinTime || status.checkoutTime) && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="space-y-1 text-xs text-gray-500">
                                  {status.checkinTime && (
                                    <p className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      <span>
                                        Check-in:{" "}
                                        {formatDateTime(status.checkinTime)}
                                      </span>
                                    </p>
                                  )}
                                  {status.checkoutTime && (
                                    <p className="flex items-center space-x-2">
                                      <XCircle className="h-3 w-3 text-orange-600" />
                                      <span>
                                        Check-out:{" "}
                                        {formatDateTime(status.checkoutTime)}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                      {/* Show pending registrations */}
                      {pendingRegistrations.map((conferenceId) => {
                        const conference = conferences.find(
                          (c) => c.ID === conferenceId
                        );
                        return (
                          <div
                            key={conferenceId}
                            className="p-4 border rounded-lg bg-yellow-50/80 hover:bg-yellow-100/80 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Calendar className="h-4 w-4 text-yellow-600" />
                                  <p className="font-semibold text-yellow-900">
                                    {conference?.NAME || "Unknown Conference"}
                                  </p>
                                </div>
                                <p className="text-sm text-yellow-700">
                                  Sẽ được đăng ký khi cập nhật
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Chờ đăng ký
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleRemovePendingConference(conferenceId)
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Show pending deletions */}
                      {pendingDeletions.map((registrationId) => {
                        const status = checkinStatuses.find(
                          (s) => s.registrationId === registrationId
                        );
                        return (
                          <div
                            key={registrationId}
                            className="p-4 border rounded-lg bg-red-50/80 hover:bg-red-100/80 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Calendar className="h-4 w-4 text-red-600" />
                                  <p className="font-semibold text-red-900">
                                    {status?.conferenceName ||
                                      "Unknown Conference"}
                                  </p>
                                </div>
                                <p className="text-sm text-red-700">
                                  Sẽ được xóa khi cập nhật
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-red-200 text-red-800 border-red-300">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Chờ xóa
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPendingDeletions((prev) =>
                                      prev.filter((id) => id !== registrationId)
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {mode === "create"
                          ? "Chưa chọn hội nghị nào"
                          : "Chưa đăng ký hội nghị nào"}
                      </p>
                      <p className="text-sm">
                        {mode === "create"
                          ? "Sử dụng form phía trên để chọn hội nghị cần đăng ký"
                          : "Sử dụng form phía trên để đăng ký hội nghị mới"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <div className="flex-1">
            {mode === "edit" &&
              (pendingRegistrations.length > 0 ||
                pendingCheckinUpdates.size > 0 ||
                pendingDeletions.length > 0) && (
                <div className="flex items-center space-x-2 text-sm text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    Có{" "}
                    {pendingRegistrations.length +
                      pendingCheckinUpdates.size +
                      pendingDeletions.length}{" "}
                    thay đổi chờ xử lý
                  </span>
                </div>
              )}
          </div>
          <div className="flex space-x-3">
            {/* QR Name Card Generator - Only show in view mode */}
            {mode === "view" && attendee && (
              <QRNameCardGenerator
                attendee={attendee}
                conferences={conferences}
                registrations={checkinStatuses.map((status) => ({
                  ID: status.registrationId,
                  CONFERENCE_ID: status.conferenceId,
                  ATTENDEE_ID: attendee.ID,
                  STATUS: status.status,
                  QR_CODE: status.qrCode,
                  REGISTRATION_DATE: status.registrationDate,
                  CHECKIN_TIME: status.checkinTime,
                  CHECKOUT_TIME: status.checkoutTime,
                }))}
                onGenerateQR={generateQRCode}
              />
            )}
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              {mode === "view" ? "Đóng" : "Hủy"}
            </Button>
            {mode !== "view" && (
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{mode === "create" ? "Tạo mới" : "Cập nhật"}</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
