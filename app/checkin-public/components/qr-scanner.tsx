"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, X, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
  isScanning: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  onScanning?: (isScanning: boolean) => void;
}

export function QRScanner({
  onScanSuccess,
  onScanError,
  isScanning,
  onStartScan,
  onStopScan,
  onScanning,
}: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const startCamera = async () => {
    try {
      setError("");

      console.log("=== QR Scanner Debug ===");
      console.log("Protocol:", window.location.protocol);
      console.log("Host:", window.location.host);
      console.log("User Agent:", navigator.userAgent);

      // Check if we're on HTTPS or localhost
      if (
        window.location.protocol !== "https:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        setError(
          "Camera chỉ hoạt động trên HTTPS hoặc localhost. Vui lòng sử dụng HTTPS hoặc chạy trên localhost."
        );
        setHasPermission(false);
        return;
      }

      // Check if QrScanner is supported first
      if (!QrScanner.hasCamera()) {
        setError(
          "Không tìm thấy camera trên thiết bị này. Vui lòng kiểm tra thiết bị có camera không."
        );
        setHasPermission(false);
        return;
      }

      console.log("✅ QrScanner.hasCamera() returned true");

      // Wait for video element to be available with longer timeout
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts

      while (!videoRef.current && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // Increased delay
        attempts++;
      }

      if (!videoRef.current) {
        setError(
          "Video element không khả dụng. Vui lòng thử lại sau khi trang tải xong."
        );
        return;
      }

      // Additional check to ensure video element is properly mounted
      if (!videoRef.current.parentElement) {
        setError("Video element chưa được mount đúng cách. Vui lòng thử lại.");
        return;
      }

      console.log("✅ Video element found:", videoRef.current);
      console.log("✅ Video element parent:", videoRef.current.parentElement);

      // Test basic camera access first
      try {
        console.log("🎥 Testing basic camera access...");
        const testStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        console.log("✅ Basic camera access successful");
        testStream.getTracks().forEach((track) => track.stop());
      } catch (cameraError: any) {
        console.error("❌ Basic camera access failed:", cameraError);

        let errorMessage = "Không thể truy cập camera: ";
        if (cameraError.name === "NotAllowedError") {
          errorMessage +=
            "Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera.";
        } else if (cameraError.name === "NotFoundError") {
          errorMessage += "Không tìm thấy camera trên thiết bị này.";
        } else if (cameraError.name === "NotReadableError") {
          errorMessage += "Camera đang được sử dụng bởi ứng dụng khác.";
        } else if (cameraError.name === "SecurityError") {
          errorMessage += "Lỗi bảo mật. Cần HTTPS hoặc localhost.";
        } else {
          errorMessage += cameraError.message || "Lỗi không xác định";
        }

        setError(errorMessage);
        setHasPermission(false);
        return;
      }

      // Create QR Scanner instance with optimized settings
      console.log("🔧 Creating QR Scanner instance...");
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log("✅ QR Code detected:", result.data);

          // Try to parse QR code as JSON first (from name card)
          try {
            const qrData = JSON.parse(result.data);
            if (qrData.type === "attendee_registration" && qrData.attendeeId) {
              console.log("📱 Name card QR code detected:", qrData);

              // Check if QR code contains full attendee data
              if (qrData.attendee && qrData.conference) {
                console.log("✅ Full attendee data found in QR code:", {
                  attendee: qrData.attendee.name,
                  conference: qrData.conference.name,
                  registration: qrData.registration?.status,
                });
              }

              // Use the full JSON data for better processing
              onScanSuccess(result.data);
            } else {
              // Fallback to original data
              onScanSuccess(result.data);
            }
          } catch (e) {
            // Not JSON, use original data
            console.log("📱 Standard QR code detected:", result.data);
            onScanSuccess(result.data);
          }

          stopCamera();
        },
        {
          onDecodeError: (error) => {
            // This is normal, QR codes are not detected on every frame
            // Only log if it's not a "No QR code found" error
            const errorMessage =
              typeof error === "string" ? error : error.message;
            if (!errorMessage.includes("No QR code found")) {
              console.warn("⚠️ QR decode error:", error);
            }
          },
          // Optimize for better detection across the entire frame
          highlightScanRegion: false, // Disable fixed scan region
          highlightCodeOutline: true, // Keep code outline highlighting
          preferredCamera: "environment", // Use back camera on mobile
          // Additional detection settings
          maxScansPerSecond: 10, // Increase scan frequency
          returnDetailedScanResult: true, // Get more detailed results
        }
      );

      console.log("🚀 Starting QR Scanner...");
      // Start scanning
      await qrScannerRef.current.start();
      setHasPermission(true);
      setIsInitialized(true);
      onStartScan();
      console.log("✅ QR Scanner started successfully");

      // Force video to be visible after QR scanner starts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.style.display = "block";
          videoRef.current.style.opacity = "1";
          videoRef.current.style.width = "100%";
          videoRef.current.style.height = "100%";
          videoRef.current.style.transform = "scaleX(1)"; // Remove any flip transforms
          console.log("🎥 Video visibility forced:", {
            display: videoRef.current.style.display,
            opacity: videoRef.current.style.opacity,
            width: videoRef.current.style.width,
            height: videoRef.current.style.height,
          });
        }
      }, 100);
    } catch (err: any) {
      console.error("❌ Error starting QR scanner:", err);

      let errorMessage = "Không thể khởi tạo QR scanner: ";
      if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += "Lỗi không xác định. Vui lòng thử lại.";
      }

      setError(errorMessage);
      setHasPermission(false);
      onScanError("QR Scanner initialization failed");
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setHasPermission(null);
    setIsInitialized(false);
    onStopScan();
  };

  // Ensure video element is ready and visible
  useEffect(() => {
    if (videoRef.current && isScanning && hasPermission && isInitialized) {
      // Force video to be visible when scanning starts
      const video = videoRef.current;
      video.style.display = "block";
      video.style.opacity = "1";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.transform = "scaleX(1)";
      console.log("🎥 Video visibility updated in useEffect");
    }
  }, [isScanning, hasPermission, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Máy quét QR Code</span>
        </CardTitle>
        <CardDescription>
          Sử dụng camera để quét mã QR của tham dự viên
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera Preview - Full Screen */}
          <div className="relative w-full">
            <div
              className="bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
              style={{
                height:
                  isScanning && hasPermission && isInitialized
                    ? "70vh"
                    : "400px",
                minHeight: "400px",
                maxHeight: "80vh",
              }}
            >
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{
                    display:
                      isScanning && hasPermission && isInitialized
                        ? "block"
                        : "none",
                    opacity:
                      isScanning && hasPermission && isInitialized ? 1 : 0,
                    width:
                      isScanning && hasPermission && isInitialized
                        ? "100%"
                        : "0px",
                    height:
                      isScanning && hasPermission && isInitialized
                        ? "100%"
                        : "0px",
                  }}
                />
                {(!isScanning || !hasPermission || !isInitialized) && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground mb-2">
                        {hasPermission === false
                          ? "Không có quyền truy cập camera"
                          : "Nhấn 'Bắt đầu quét' để sử dụng camera"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Camera sẽ hiển thị toàn màn hình để quét QR code dễ dàng
                        hơn
                      </p>
                    </div>
                  </div>
                )}

                {/* QR Code Overlay when scanning */}
                {isScanning && hasPermission && isInitialized && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Full frame scanning indicator */}
                    <div className="absolute inset-4 border-2 border-primary border-dashed rounded-lg bg-primary/5">
                      <div className="absolute top-2 left-2 text-primary text-xs font-medium bg-white px-2 py-1 rounded">
                        QUÉT TOÀN MÀN HÌNH
                      </div>
                    </div>

                    {/* Corner brackets for visual guidance */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg"></div>

                    {/* Scanning animation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-24 h-24 border-2 border-primary border-dashed rounded-lg bg-primary/10 flex items-center justify-center animate-pulse">
                        <div className="text-primary font-bold text-xs">
                          SCANNING
                        </div>
                      </div>
                    </div>

                    {/* Instructions overlay */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                        Di chuyển camera để tìm QR code ở bất kỳ vị trí nào
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center space-x-2">
            {!isScanning ? (
              <Button onClick={startCamera} disabled={hasPermission === false}>
                <Camera className="h-4 w-4 mr-2" />
                Bắt đầu quét
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Dừng quét
              </Button>
            )}

            {hasPermission === false && (
              <Button onClick={startCamera} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="text-base font-medium mb-2">Hướng dẫn quét QR Code</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Đặt QR Code bất kỳ đâu</p>
                  <p className="text-xs">
                    QR code có thể ở bất kỳ vị trí nào trong khung hình
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Di chuyển camera tự do</p>
                  <p className="text-xs">
                    Camera sẽ quét toàn bộ khung hình liên tục
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Quét tự động</p>
                  <p className="text-xs">
                    QR code sẽ được phát hiện và quét tự động
                  </p>
                </div>
              </div>
            </div>
            {isScanning && isInitialized && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 font-medium flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Đang quét toàn màn hình... QR code có thể ở bất kỳ vị trí nào
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
