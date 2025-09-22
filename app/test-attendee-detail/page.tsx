"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttendeeDialog } from "@/components/attendees/attendee-dialog";
import { Attendee, Conference, Registration } from "@/lib/api/attendees-api";
import { User, Calendar, QrCode } from "lucide-react";

export default function TestAttendeeDetailPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data for testing
  useEffect(() => {
    const mockAttendees: Attendee[] = [
      {
        ID: 1,
        NAME: "Nguyễn Văn A",
        EMAIL: "nguyenvana@example.com",
        PHONE: "0123456789",
        COMPANY: "Công ty ABC",
        POSITION: "Giám đốc",
        AVATAR_URL: null,
        DIETARY: null,
        SPECIAL_NEEDS: null,
        DATE_OF_BIRTH: null,
        GENDER: "Nam",
        FIREBASE_UID: null,
        CREATED_AT: new Date(),
      },
      {
        ID: 2,
        NAME: "Trần Thị B",
        EMAIL: "tranthib@example.com",
        PHONE: "0987654321",
        COMPANY: "Công ty XYZ",
        POSITION: "Trưởng phòng",
        AVATAR_URL: null,
        DIETARY: null,
        SPECIAL_NEEDS: null,
        DATE_OF_BIRTH: null,
        GENDER: "Nữ",
        FIREBASE_UID: null,
        CREATED_AT: new Date(),
      },
    ];

    const mockConferences: Conference[] = [
      {
        ID: 1,
        NAME: "Hội nghị Công nghệ 2024",
        DESCRIPTION: "Hội nghị về công nghệ và đổi mới",
        START_DATE: new Date("2024-03-15"),
        END_DATE: new Date("2024-03-17"),
        STATUS: "active",
        VENUE: "Trung tâm Hội nghị Quốc gia",
        CREATED_AT: new Date(),
      },
      {
        ID: 2,
        NAME: "Hội nghị Kinh doanh 2024",
        DESCRIPTION: "Hội nghị về kinh doanh và đầu tư",
        START_DATE: new Date("2024-04-20"),
        END_DATE: new Date("2024-04-22"),
        STATUS: "active",
        VENUE: "Khách sạn Grand Plaza",
        CREATED_AT: new Date(),
      },
      {
        ID: 3,
        NAME: "Hội nghị Marketing 2024",
        DESCRIPTION: "Hội nghị về marketing và truyền thông",
        START_DATE: new Date("2024-05-10"),
        END_DATE: new Date("2024-05-12"),
        STATUS: "active",
        VENUE: "Trung tâm Triển lãm Quốc tế",
        CREATED_AT: new Date(),
      },
    ];

    setAttendees(mockAttendees);
    setConferences(mockConferences);
  }, []);

  const handleViewAttendee = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsDialogOpen(true);
  };

  const handleSaveAttendee = async (data: Partial<Attendee>) => {
    console.log("Saving attendee:", data);
    // Mock save - in real app this would call API
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Attendee saved successfully");
        resolve();
      }, 1000);
    });
  };

  const handleRefresh = () => {
    console.log("Refreshing data...");
    // Mock refresh - in real app this would reload data
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Test Attendee Detail Dialog
        </h1>
        <p className="text-gray-600">
          Test tính năng xuất QR Name Card trong trang chi tiết tham dự viên
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Hướng dẫn test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. Click vào "Xem chi tiết" của bất kỳ tham dự viên nào</p>
            <p>
              2. Trong dialog chi tiết, scroll xuống phần "Hội nghị và Check-in"
            </p>
            <p>3. Tìm nút "Xuất Name Card" ở cuối dialog</p>
            <p>4. Click nút để mở QR Name Card Generator</p>
            <p>5. Chọn hội nghị từ dropdown để xuất QR cho hội nghị cụ thể</p>
            <p>6. QR code sẽ chứa đầy đủ thông tin tham dự viên và hội nghị</p>
          </div>
        </CardContent>
      </Card>

      {/* Attendees List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Danh sách tham dự viên</span>
          </CardTitle>
          <CardDescription>
            Click "Xem chi tiết" để test tính năng QR Name Card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendees.map((attendee) => (
              <div
                key={attendee.ID}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{attendee.NAME}</h3>
                    <p className="text-sm text-gray-600">{attendee.EMAIL}</p>
                    <p className="text-sm text-gray-600">{attendee.COMPANY}</p>
                    <p className="text-sm text-gray-600">{attendee.POSITION}</p>
                  </div>
                  <Button
                    onClick={() => handleViewAttendee(attendee)}
                    className="ml-4"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conferences Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Danh sách hội nghị</span>
          </CardTitle>
          <CardDescription>
            Các hội nghị có sẵn để test xuất QR Name Card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {conferences.map((conference) => (
              <div key={conference.ID} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{conference.NAME}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {conference.DESCRIPTION}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  📅 {conference.START_DATE.toLocaleDateString("vi-VN")} -{" "}
                  {conference.END_DATE.toLocaleDateString("vi-VN")}
                </p>
                <p className="text-sm text-gray-600">📍 {conference.VENUE}</p>
                <p className="text-sm text-gray-600">
                  🟢 Trạng thái: {conference.STATUS}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mock Registration Data Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng ký mô phỏng</CardTitle>
          <CardDescription>
            Dữ liệu đăng ký sẽ được tạo tự động khi mở dialog chi tiết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Mỗi tham dự viên sẽ có đăng ký cho 2-3 hội nghị</p>
            <p>• Trạng thái đăng ký: registered, checked-in, checked-out</p>
            <p>
              • QR code sẽ được tạo với đầy đủ thông tin tham dự viên và hội
              nghị
            </p>
            <p>• Có thể chọn hội nghị cụ thể để xuất QR Name Card</p>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Dialog */}
      <AttendeeDialog
        attendee={selectedAttendee}
        conferences={conferences}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveAttendee}
        onRefresh={handleRefresh}
        mode="view"
      />
    </div>
  );
}
