"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  QrCode,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AttendeeData {
  id: number;
  name: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  avatar?: string;
  conference: {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    venue: string;
    status: string;
  };
  registration?: {
    id: number;
    status: string;
    registrationDate: string;
    checkinTime?: string;
    checkoutTime?: string;
  };
}

export default function AttendeeInfoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const attendeeId = params.id as string;
  const conferenceId = searchParams.get("conf");

  const [attendeeData, setAttendeeData] = useState<AttendeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (attendeeId && conferenceId) {
      fetchAttendeeData();
    } else {
      setError("Thiếu thông tin attendee hoặc conference");
      setIsLoading(false);
    }
  }, [attendeeId, conferenceId]);

  const fetchAttendeeData = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, you would fetch from your API
      // For now, we'll use mock data
      const mockData: AttendeeData = {
        id: parseInt(attendeeId),
        name: "Nguyễn Văn A",
        email: "nguyenvana@email.com",
        phone: "0123456789",
        organization: "Công ty ABC",
        position: "Giám đốc",
        avatar: "/avatars/default.jpg",
        conference: {
          id: parseInt(conferenceId || "1"),
          name: "Hội nghị Công nghệ 2024",
          description: "Hội nghị về công nghệ thông tin",
          startDate: "2024-01-20",
          endDate: "2024-01-22",
          venue: "Trung tâm Hội nghị Quốc gia",
          status: "active",
        },
        registration: {
          id: 1,
          status: "registered",
          registrationDate: "2024-01-15",
          checkinTime: "2024-01-20 09:15:30",
        },
      };

      setAttendeeData(mockData);
    } catch (err) {
      console.error("Error fetching attendee data:", err);
      setError("Lỗi khi tải thông tin tham dự viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    // Implement check-in logic here
    console.log("Check-in attendee:", attendeeId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !attendeeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Không tìm thấy thông tin
              </h2>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông tin Tham dự viên
          </h1>
          <p className="text-gray-600">
            Quét QR code để xem thông tin chi tiết
          </p>
        </div>

        {/* Attendee Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{attendeeData.name}</CardTitle>
                <p className="text-gray-600">{attendeeData.position}</p>
                <p className="text-sm text-gray-500">
                  {attendeeData.organization}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{attendeeData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{attendeeData.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conference Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Thông tin Hội nghị</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                {attendeeData.conference.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {attendeeData.conference.description}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm">
                  {attendeeData.conference.startDate} -{" "}
                  {attendeeData.conference.endDate}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{attendeeData.conference.venue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Status Card */}
        {attendeeData.registration && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Trạng thái Đăng ký</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {attendeeData.registration.status === "registered" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {attendeeData.registration.status === "registered"
                      ? "Đã đăng ký"
                      : "Chưa đăng ký"}
                  </span>
                </div>
                <Badge
                  variant={
                    attendeeData.registration.status === "registered"
                      ? "default"
                      : "destructive"
                  }
                >
                  {attendeeData.registration.status}
                </Badge>
              </div>
              {attendeeData.registration.checkinTime && (
                <div className="mt-2 text-sm text-gray-600">
                  Check-in: {attendeeData.registration.checkinTime}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={handleCheckIn} className="px-8">
            <CheckCircle className="h-4 w-4 mr-2" />
            Check-in
          </Button>
          <Button variant="outline" onClick={() => window.close()}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

