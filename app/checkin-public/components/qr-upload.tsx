"use client";

import React, { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import jsQR from "jsqr";
import { checkInAPI } from "../lib/checkin-api";

interface QRUploadProps {
  onUploadSuccess: (data: string) => void;
  onUploadError: (error: string) => void;
  conferences?: any[];
  selectedConference?: string;
  onCheckInComplete?: () => void; // Callback khi check-in hoàn thành
}

export interface QRUploadRef {
  clearImage: () => void;
}

export const QRUpload = forwardRef<QRUploadRef, QRUploadProps>(({ onUploadSuccess, onUploadError, conferences = [], selectedConference, onCheckInComplete }, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      onUploadError("File không phải là ảnh");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File ảnh quá lớn (tối đa 10MB)");
      onUploadError("File ảnh quá lớn");
      return;
    }

    setError("");
    processImage(file);
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError("");

    try {
      // Create image preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Process QR code from image using jsQR
      const qrData = await processImageWithJsQR(file);

      if (qrData) {
        console.log("✅ QR code detected from uploaded image:", qrData);
        
        // Get conference ID for validation
        let conferenceId: number | null = null;
        
        // First, try to extract conference ID from QR data
        try {
          const parsedQRData = JSON.parse(qrData);
          console.log("📱 Parsed QR data:", parsedQRData);
          
          if (parsedQRData.conferenceId) {
            conferenceId = parseInt(parsedQRData.conferenceId);
          } else if (parsedQRData.conf) {
            conferenceId = parseInt(parsedQRData.conf);
          }
          
          console.log("📱 Extracted conference ID from QR:", conferenceId);
        } catch (e) {
          console.log("📱 QR data is not JSON format, will use selected conference");
        }
        
        // If no conference ID from QR data, try to get from selected conference
        if (!conferenceId) {
          if (selectedConference) {
            conferenceId = parseInt(selectedConference);
          } else if (conferences.length > 0) {
            // Use the first active conference as default
            const activeConference = conferences.find((c) => c.status === "active") || conferences[0];
            conferenceId = activeConference.id;
          }
        }

        if (!conferenceId) {
          setError("Không thể xác định hội nghị để validate QR code");
          onUploadError("Không thể xác định hội nghị");
          return;
        }

        // Pass QR data to parent component for validation and check-in
        console.log("✅ QR code detected from uploaded image:", qrData);
        console.log("📱 Conference ID for validation:", conferenceId);
        onUploadSuccess(qrData);
      } else {
        setError("Không tìm thấy mã QR trong ảnh");
        onUploadError("Không tìm thấy mã QR trong ảnh");
      }
    } catch (err: any) {
      console.error("Error processing QR code from image:", err);
      setError("Không thể đọc mã QR từ ảnh. Vui lòng thử ảnh khác.");
      onUploadError("Không thể đọc mã QR từ ảnh");
    } finally {
      setIsProcessing(false);
    }
  };

  const processImageWithJsQR = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(null);
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan for QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } } as any);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Expose clearImage method to parent component
  useImperativeHandle(ref, () => ({
    clearImage
  }));

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Tải lên ảnh QR Code</span>
        </CardTitle>
        <CardDescription>
          Tải lên ảnh chứa mã QR code để check-in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Uploaded QR code"
                    className="max-w-full max-h-64 rounded-lg border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6"
                    onClick={clearImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {isProcessing && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang xử lý ảnh...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Kéo thả ảnh vào đây hoặc
                  </p>
                  <Button
                    variant="outline"
                    onClick={triggerFileSelect}
                    className="mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn ảnh
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Hướng dẫn sử dụng:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Chọn ảnh chứa mã QR code từ thiết bị</li>
              <li>• Hỗ trợ các định dạng: JPG, PNG, GIF</li>
              <li>• Kích thước file tối đa: 10MB</li>
              <li>• Ảnh phải rõ nét và QR code phải dễ nhìn</li>
              <li>• Có thể kéo thả ảnh trực tiếp vào vùng upload</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

QRUpload.displayName = "QRUpload";
