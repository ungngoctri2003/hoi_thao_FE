"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRUpload } from "../checkin-public/components/qr-upload";
import { QrCode, CheckCircle, XCircle } from "lucide-react";

export default function TestQRUploadPage() {
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    qrData?: string;
  } | null>(null);

  const mockConferences = [
    {
      id: 1,
      name: "Hội nghị Test 2024",
      date: "2024-01-20",
      status: "active" as const,
    },
  ];

  const handleUploadSuccess = (qrData: string) => {
    console.log("✅ QR Upload Success:", qrData);
    setResult({
      success: true,
      message: "QR code được đọc thành công!",
      qrData: qrData,
    });
  };

  const handleUploadError = (error: string) => {
    console.log("❌ QR Upload Error:", error);
    setResult({
      success: false,
      message: error,
    });
  };

  const generateTestQR = () => {
    // Generate a test QR code data
    const testQRData = JSON.stringify({
      id: 1,
      conf: 1,
      type: "attendee",
      v: "1.0",
    });
    
    // Create a simple QR code using a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Simple QR code representation (just for testing)
    canvas.width = 200;
    canvas.height = 200;
    
    // Draw a simple pattern
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 20, 160, 160);
    ctx.fillStyle = '#000';
    ctx.fillRect(40, 40, 120, 120);
    
    // Add text
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test QR', 100, 100);
    ctx.fillText('Code', 100, 120);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-qr-code.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <QrCode className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Test QR Upload</h1>
              <p className="text-muted-foreground">
                Kiểm tra chức năng tải ảnh QR code
              </p>
            </div>
          </div>

          {/* Test QR Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Tạo QR Code Test</CardTitle>
              <CardDescription>
                Tạo một QR code test để kiểm tra chức năng upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generateTestQR} className="w-full">
                Tạo và tải xuống QR Code Test
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                QR code này sẽ chứa dữ liệu: {JSON.stringify({id: 1, conf: 1, type: "attendee", v: "1.0"})}
              </p>
            </CardContent>
          </Card>

          {/* QR Upload Component */}
          <QRUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            conferences={mockConferences}
            selectedConference="1"
          />

          {/* Result Display */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Kết quả</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.qrData && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Dữ liệu QR Code:</p>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {result.qrData}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Nhấn nút "Tạo và tải xuống QR Code Test" để tạo QR code test</li>
                <li>Lưu ảnh QR code vào máy tính</li>
                <li>Quay lại trang này và tải ảnh QR code vừa tạo lên</li>
                <li>Kiểm tra kết quả hiển thị bên dưới</li>
                <li>Nếu thành công, bạn sẽ thấy dữ liệu QR code được hiển thị</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
