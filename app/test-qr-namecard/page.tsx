"use client";

import { useState } from "react";
import { QRNameCardGenerator } from "@/components/attendees/qr-name-card-generator";
import { Attendee, Conference } from "@/lib/api/attendees-api";

export default function TestQRNameCardPage() {
  const [attendee] = useState<Attendee>({
    ID: 1,
    NAME: "Nguyễn Văn An",
    EMAIL: "nguyen.van.an@email.com",
    PHONE: "0901234567",
    COMPANY: "Tech Corp Vietnam",
    POSITION: "Senior Software Engineer",
    AVATAR_URL:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    DIETARY: "Vegetarian",
    SPECIAL_NEEDS: "Wheelchair accessible",
    DATE_OF_BIRTH: new Date("1990-05-15"),
    GENDER: "male",
    FIREBASE_UID: "firebase_uid_123",
    CREATED_AT: new Date("2024-01-15"),
  });

  const [conference] = useState<Conference>({
    ID: 1,
    NAME: "Hội nghị Công nghệ 2024",
    DESCRIPTION: "Hội nghị về công nghệ và đổi mới",
    START_DATE: new Date("2024-12-15"),
    END_DATE: new Date("2024-12-17"),
    STATUS: "active",
    VENUE: "Trung tâm Hội nghị Quốc gia",
    CREATED_AT: new Date("2024-01-01"),
  });

  const generateQRCode = async (
    attendeeId: number,
    conferenceId?: number
  ): Promise<string> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `ATTENDEE:${attendeeId}:CONF:${
            conferenceId || "GENERAL"
          }:${Date.now()}`
        );
      }, 1000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test QR Name Card Generator
          </h1>
          <p className="text-gray-600">
            Demo chức năng xuất QR name card cho tham dự viên
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin tham dự viên
              </h2>
              <p className="text-gray-600">
                {attendee.NAME} - {attendee.COMPANY}
              </p>
            </div>
            <QRNameCardGenerator
              attendee={attendee}
              conferences={[conference]}
              registrations={[]}
              onGenerateQR={generateQRCode}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Thông tin cá nhân
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Tên:</span> {attendee.NAME}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {attendee.EMAIL}
                </div>
                <div>
                  <span className="font-medium">SĐT:</span> {attendee.PHONE}
                </div>
                <div>
                  <span className="font-medium">Công ty:</span>{" "}
                  {attendee.COMPANY}
                </div>
                <div>
                  <span className="font-medium">Chức vụ:</span>{" "}
                  {attendee.POSITION}
                </div>
                <div>
                  <span className="font-medium">Giới tính:</span>{" "}
                  {attendee.GENDER}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Thông tin hội nghị
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Tên hội nghị:</span>{" "}
                  {conference.NAME}
                </div>
                <div>
                  <span className="font-medium">Mô tả:</span>{" "}
                  {conference.DESCRIPTION}
                </div>
                <div>
                  <span className="font-medium">Ngày bắt đầu:</span>{" "}
                  {conference.START_DATE.toLocaleDateString("vi-VN")}
                </div>
                <div>
                  <span className="font-medium">Ngày kết thúc:</span>{" "}
                  {conference.END_DATE.toLocaleDateString("vi-VN")}
                </div>
                <div>
                  <span className="font-medium">Địa điểm:</span>{" "}
                  {conference.VENUE}
                </div>
                <div>
                  <span className="font-medium">Trạng thái:</span>{" "}
                  {conference.STATUS}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Hướng dẫn sử dụng:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Nhấn nút "Xuất Name Card" để mở dialog tạo name card</li>
              <li>• Nhấn "Tạo QR Code" để generate QR code mới</li>
              <li>• Sử dụng "Tải xuống" để lưu name card dưới dạng hình ảnh</li>
              <li>• Sử dụng "In" để in name card trực tiếp</li>
              <li>• Name card có kích thước chuẩn 3.5" x 2" (thẻ tham dự)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
