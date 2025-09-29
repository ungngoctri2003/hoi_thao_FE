"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Ticket,
} from "lucide-react";

interface QRAttendeeInfoProps {
  qrData: any;
  className?: string;
}

export function QRAttendeeInfo({
  qrData,
  className = "",
}: QRAttendeeInfoProps) {
  if (!qrData || qrData.type !== "attendee_registration") {
    return null;
  }

  // Support both old and new QR format
  const attendee = qrData.attendee || qrData.a;
  const conference = qrData.conference || qrData.c;
  const registration = qrData.registration || qrData.r;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "registered":
        return "bg-blue-100 text-blue-800";
      case "checked-in":
        return "bg-green-100 text-green-800";
      case "checked-out":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Attendee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Thông tin tham dự viên</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={attendee?.avatarUrl || ""} />
              <AvatarFallback className="text-lg">
                {getInitials(attendee?.name || "N/A")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {attendee?.name || attendee?.n || "N/A"}
                </h3>
                <p className="text-sm text-gray-600">
                  {attendee?.position || attendee?.pos || "Tham dự viên"}
                </p>
                <p className="text-sm text-gray-600">
                  {attendee?.company || attendee?.c || "Chưa cập nhật"}
                </p>
              </div>

              <div className="space-y-1">
                {(attendee?.email || attendee?.e) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{attendee.email || attendee.e}</span>
                  </div>
                )}
                {(attendee?.phone || attendee?.p) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{attendee.phone || attendee.p}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conference Information */}
      {conference && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Thông tin hội nghị</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {conference.name || conference.n}
                </h3>
                {(conference.description || conference.d) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {conference.description || conference.d}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(conference.startDate || conference.sd)} -{" "}
                    {formatDate(conference.endDate || conference.ed)}
                  </span>
                </div>

                {(conference.venue || conference.v) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{conference.venue || conference.v}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={
                    conference.status === "active"
                      ? "border-green-500 text-green-700"
                      : "border-gray-500 text-gray-700"
                  }
                >
                  {conference.status === "active" ? "Đang diễn ra" : "Kết thúc"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Information */}
      {registration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Ticket className="h-5 w-5" />
              <span>Thông tin đăng ký</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Trạng thái:
                </span>
                <Badge className={getStatusColor(registration.status)}>
                  {registration.status}
                </Badge>
              </div>

              {registration.registrationDate && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Đăng ký: {formatDateTime(registration.registrationDate)}
                  </span>
                </div>
              )}

              {registration.checkinTime && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Check-in: {formatDateTime(registration.checkinTime)}
                  </span>
                </div>
              )}

              {registration.checkoutTime && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Check-out: {formatDateTime(registration.checkoutTime)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Thông tin QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-gray-600">
            <div>ID Tham dự viên: {qrData.attendeeId || qrData.id}</div>
            <div>ID Hội nghị: {qrData.conferenceId || qrData.conf}</div>
            <div>Tạo lúc: {formatDateTime(new Date(qrData.timestamp || qrData.t))}</div>
            {qrData.checksum && <div>Checksum: {qrData.checksum}</div>}
            {qrData.cs && <div>Checksum: {qrData.cs}</div>}
            <div>Phiên bản: {qrData.version || qrData.v || "1.0"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


