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
import { QRNameCardGenerator } from "@/components/attendees/qr-name-card-generator";
import { QRAttendeeInfo } from "@/components/attendees/qr-attendee-info";
import { Attendee, Conference, Registration } from "@/lib/api/attendees-api";
import { QrCode, User, Calendar } from "lucide-react";

export default function TestQRNameCardEnhancedPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
    null
  );
  const [scannedQRData, setScannedQRData] = useState<any>(null);

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
    ];

    const mockRegistrations: Registration[] = [
      {
        ID: 1,
        CONFERENCE_ID: 1,
        ATTENDEE_ID: 1,
        STATUS: "registered",
        QR_CODE: "MOCK_QR_1",
        REGISTRATION_DATE: new Date("2024-03-01"),
        CHECKIN_TIME: null,
        CHECKOUT_TIME: null,
      },
      {
        ID: 2,
        CONFERENCE_ID: 2,
        ATTENDEE_ID: 1,
        STATUS: "registered",
        QR_CODE: "MOCK_QR_2",
        REGISTRATION_DATE: new Date("2024-04-01"),
        CHECKIN_TIME: null,
        CHECKOUT_TIME: null,
      },
      {
        ID: 3,
        CONFERENCE_ID: 1,
        ATTENDEE_ID: 2,
        STATUS: "checked-in",
        QR_CODE: "MOCK_QR_3",
        REGISTRATION_DATE: new Date("2024-03-02"),
        CHECKIN_TIME: new Date("2024-03-15T08:30:00"),
        CHECKOUT_TIME: null,
      },
    ];

    setAttendees(mockAttendees);
    setConferences(mockConferences);
    setRegistrations(mockRegistrations);
  }, []);

  const handleQRScan = (qrData: string) => {
    try {
      const parsed = JSON.parse(qrData);
      setScannedQRData(parsed);
      console.log("Scanned QR data:", parsed);
    } catch (e) {
      console.error("Invalid QR data:", e);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Test QR Name Card Enhanced
        </h1>
        <p className="text-gray-600">
          Test tính năng xuất QR Name Card cho từng hội nghị với đầy đủ thông
          tin
        </p>
      </div>

      {/* Attendee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Chọn tham dự viên</span>
          </CardTitle>
          <CardDescription>
            Chọn tham dự viên để test tính năng xuất QR Name Card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attendees.map((attendee) => (
              <div
                key={attendee.ID}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAttendee?.ID === attendee.ID
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedAttendee(attendee)}
              >
                <h3 className="font-semibold">{attendee.NAME}</h3>
                <p className="text-sm text-gray-600">{attendee.EMAIL}</p>
                <p className="text-sm text-gray-600">{attendee.COMPANY}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QR Name Card Generator */}
      {selectedAttendee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>QR Name Card Generator</span>
            </CardTitle>
            <CardDescription>
              Xuất QR Name Card cho {selectedAttendee.NAME}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QRNameCardGenerator
              attendee={selectedAttendee}
              conferences={conferences}
              registrations={registrations.filter(
                (r) => r.ATTENDEE_ID === selectedAttendee.ID
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Scanner Test</span>
          </CardTitle>
          <CardDescription>
            Test quét QR code và hiển thị thông tin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Paste QR code data (JSON format) để test:
              </p>
              <textarea
                className="w-full h-32 p-2 border rounded-lg font-mono text-sm"
                placeholder='{"type":"attendee_registration","attendeeId":1,"conferenceId":1,...}'
                onChange={(e) => handleQRScan(e.target.value)}
              />
            </div>

            {scannedQRData && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  Thông tin từ QR Code:
                </h3>
                <QRAttendeeInfo qrData={scannedQRData} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conference Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Thông tin hội nghị</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conferences.map((conference) => (
              <div key={conference.ID} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{conference.NAME}</h3>
                <p className="text-sm text-gray-600">
                  {conference.DESCRIPTION}
                </p>
                <p className="text-sm text-gray-600">
                  {conference.START_DATE.toLocaleDateString("vi-VN")} -{" "}
                  {conference.END_DATE.toLocaleDateString("vi-VN")}
                </p>
                <p className="text-sm text-gray-600">📍 {conference.VENUE}</p>
                <p className="text-sm text-gray-600">
                  Trạng thái: {conference.STATUS}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registration Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {registrations.map((registration) => {
              const attendee = attendees.find(
                (a) => a.ID === registration.ATTENDEE_ID
              );
              const conference = conferences.find(
                (c) => c.ID === registration.CONFERENCE_ID
              );
              return (
                <div key={registration.ID} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{attendee?.NAME}</p>
                      <p className="text-sm text-gray-600">
                        {conference?.NAME}
                      </p>
                      <p className="text-sm text-gray-600">
                        Đăng ký:{" "}
                        {registration.REGISTRATION_DATE.toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        registration.STATUS === "registered"
                          ? "bg-blue-100 text-blue-800"
                          : registration.STATUS === "checked-in"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {registration.STATUS}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
