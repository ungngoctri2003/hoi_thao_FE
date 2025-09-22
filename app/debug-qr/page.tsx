"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DebugQRPage() {
  const [qrData, setQrData] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [scannedData, setScannedData] = useState("");

  const generateQR = async () => {
    if (!qrData) return;

    try {
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrImage(qrImageUrl);
    } catch (error) {
      console.error("Error generating QR:", error);
    }
  };

  const testJSONQR = () => {
    const jsonData = {
      attendeeId: 1,
      conferenceId: 1,
      timestamp: Date.now(),
      type: "attendee_registration",
    };
    setQrData(JSON.stringify(jsonData));
  };

  const testStringQR = () => {
    setQrData("ATTENDEE:1:CONF:1:1703123456789");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug QR Code</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate QR */}
          <Card>
            <CardHeader>
              <CardTitle>Generate QR Code</CardTitle>
              <CardDescription>Tạo QR code để test quét</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>QR Data (JSON hoặc String):</Label>
                <Input
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  placeholder="Nhập dữ liệu QR code..."
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={testJSONQR} variant="outline">
                  Test JSON Format
                </Button>
                <Button onClick={testStringQR} variant="outline">
                  Test String Format
                </Button>
              </div>

              <Button onClick={generateQR} className="w-full">
                Generate QR Code
              </Button>

              {qrImage && (
                <div className="text-center">
                  <img
                    src={qrImage}
                    alt="QR Code"
                    className="mx-auto border rounded"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this QR code with your camera
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Result */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Result</CardTitle>
              <CardDescription>
                Kết quả quét QR code sẽ hiển thị ở đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Scanned Data:</Label>
                  <Input
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                    placeholder="Dán dữ liệu đã quét vào đây..."
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Test Instructions:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Generate QR code ở bên trái</li>
                    <li>Mở camera trên điện thoại</li>
                    <li>Quét QR code</li>
                    <li>Copy dữ liệu đã quét vào ô "Scanned Data"</li>
                    <li>Kiểm tra xem dữ liệu có đúng không</li>
                  </ol>
                </div>

                {scannedData && (
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Parsed Data:</h4>
                    <pre className="text-sm overflow-auto">
                      {(() => {
                        try {
                          const parsed = JSON.parse(scannedData);
                          return JSON.stringify(parsed, null, 2);
                        } catch (e) {
                          return `String format: ${scannedData}`;
                        }
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Test</CardTitle>
            <CardDescription>Test nhanh với dữ liệu mẫu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">JSON Format:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  {`{
  "attendeeId": 1,
  "conferenceId": 1,
  "timestamp": 1703123456789,
  "type": "attendee_registration"
}`}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">String Format:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded">
                  ATTENDEE:1:CONF:1:1703123456789
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

