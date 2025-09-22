"use client";

import { useState } from "react";
import { QRNameCardGenerator } from "@/components/attendees/qr-name-card-generator";
import { Attendee, Conference } from "@/lib/api/attendees-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QrCode, Camera, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function TestQRScanPage() {
  const [attendee] = useState<Attendee>({
    ID: 1,
    NAME: "Nguyễn Văn Test",
    EMAIL: "test@email.com",
    PHONE: "0901234567",
    COMPANY: "Test Company",
    POSITION: "Test Position",
    AVATAR_URL:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    DIETARY: "",
    SPECIAL_NEEDS: "",
    DATE_OF_BIRTH: new Date("1990-01-01"),
    GENDER: "male",
    FIREBASE_UID: "test_uid",
    CREATED_AT: new Date("2024-01-01"),
  });

  const [conference] = useState<Conference>({
    ID: 1,
    NAME: "Hội nghị Test 2024",
    DESCRIPTION: "Hội nghị test QR code",
    START_DATE: new Date("2024-12-15"),
    END_DATE: new Date("2024-12-17"),
    STATUS: "active",
    VENUE: "Test Venue",
    CREATED_AT: new Date("2024-01-01"),
  });

  const generateQRCode = async (
    attendeeId: number,
    conferenceId?: number
  ): Promise<string> => {
    // Generate QR code data like the API would
    const qrData = {
      attendeeId,
      conferenceId: conferenceId || null,
      timestamp: Date.now(),
      type: "attendee_registration",
    };
    return JSON.stringify(qrData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test QR Code Scanning
          </h1>
          <p className="text-gray-600">
            Tạo name card với QR code và test quét QR code
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate QR Name Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Bước 1: Tạo Name Card</span>
              </CardTitle>
              <CardDescription>
                Tạo name card với QR code để test quét
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRNameCardGenerator
                attendee={attendee}
                conferences={[conference]}
                registrations={[]}
                onGenerateQR={generateQRCode}
              />
            </CardContent>
          </Card>

          {/* Test QR Scanning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>Bước 2: Test Quét QR</span>
              </CardTitle>
              <CardDescription>
                Sử dụng camera để quét QR code từ name card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Hướng dẫn test:
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Tạo name card ở bước 1</li>
                  <li>In name card hoặc mở trên màn hình khác</li>
                  <li>Vào trang checkin-public</li>
                  <li>Chọn hội nghị "Hội nghị Test 2024"</li>
                  <li>Quét QR code từ name card</li>
                  <li>Kiểm tra kết quả check-in</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Link href="/checkin-public">
                  <Button className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Mở trang Check-in Public
                  </Button>
                </Link>

                <Link href="/test-qr-namecard">
                  <Button variant="outline" className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    Xem demo Name Card
                  </Button>
                </Link>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    QR code sẽ chứa thông tin JSON với attendeeId và
                    conferenceId
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Thông tin QR Code</CardTitle>
            <CardDescription>
              QR code được tạo sẽ có format JSON như sau:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm">
                {`{
  "attendeeId": 1,
  "conferenceId": 1,
  "timestamp": 1703123456789,
  "type": "attendee_registration"
}`}
              </pre>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Khi quét QR code này, hệ thống sẽ tự động parse JSON và thực hiện
              check-in cho attendee tương ứng.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
