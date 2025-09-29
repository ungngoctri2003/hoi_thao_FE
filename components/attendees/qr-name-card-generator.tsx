"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCode,
  Download,
  Printer,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import QRCode from "qrcode";
import { Attendee, Conference, Registration } from "@/lib/api/attendees-api";
import { SessionInfo, apiClient } from "@/lib/api";

interface QRNameCardGeneratorProps {
  attendee: Attendee;
  conferences?: Conference[];
  registrations?: Registration[];
  qrCode?: string;
  onGenerateQR?: (attendeeId: number, conferenceId?: number, sessionId?: number) => Promise<string>;
}

export function QRNameCardGenerator({
  attendee,
  conferences = [],
  registrations = [],
  qrCode,
  onGenerateQR,
}: QRNameCardGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string>("");
  const [selectedConference, setSelectedConference] =
    useState<Conference | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch sessions when conference changes
  const fetchSessions = async (conferenceId: number) => {
    setIsLoadingSessions(true);
    try {
      const response = await apiClient.getSessions(conferenceId);
      setSessions(response.data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Generate QR code when component mounts or QR code changes
  useEffect(() => {
    const generateQRCode = async () => {
      if (!qrCode && !generatedQR) return;

      try {
        const qrData = qrCode || generatedQR;
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 600, // Tăng độ phân giải QR code
          margin: 0,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "L", // Giảm error correction để QR mỏng hơn
          scale: 1,
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [qrCode, generatedQR]);

  const handleGenerateQR = async () => {
    if (!attendee?.ID || !selectedConference || !selectedSession) return;

    setIsGenerating(true);
    try {
      // Create minimal QR data with only essential information for checkin
      const qrData = {
        id: attendee.ID,
        conf: selectedConference.ID,
        ...(selectedSession && { session: selectedSession.id }),
        t: Date.now(),
        type: "attendee_registration",
        // Security and validation
        cs: generateChecksum(attendee.ID, selectedConference.ID, selectedSession?.id),
        v: "2.0", // Updated version for optimized QR
      };

      const qrString = JSON.stringify(qrData);
      setGeneratedQR(qrString);

      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(qrString, {
        width: 600, // Tăng độ phân giải QR code
        margin: 0,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "L",
        scale: 1,
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Generate a fallback QR code with minimal data
      const fallbackQR = JSON.stringify({
        id: attendee.ID,
        conf: selectedConference.ID,
        ...(selectedSession && { session: selectedSession.id }),
        t: Date.now(),
        type: "attendee_registration",
        v: "2.0",
      });
      setGeneratedQR(fallbackQR);

      const qrDataUrl = await QRCode.toDataURL(fallbackQR, {
        width: 600, // Tăng độ phân giải QR code
        margin: 0,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "L",
        scale: 1,
      });
      setQrCodeDataUrl(qrDataUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate checksum for security validation
  const generateChecksum = (
    attendeeId: number,
    conferenceId: number,
    sessionId?: number
  ): string => {
    const data = `${attendeeId}-${conferenceId}-${sessionId || 0}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

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

  // Handle conference selection
  const handleConferenceSelect = async (conferenceId: string) => {
    const conference = conferences.find((c) => c.ID === parseInt(conferenceId));
    const registration = registrations.find(
      (r) => r.CONFERENCE_ID === parseInt(conferenceId)
    );

    setSelectedConference(conference || null);
    setSelectedRegistration(registration || null);
    setSelectedSession(null); // Reset session selection

    // Reset QR code when conference changes
    setGeneratedQR("");
    setQrCodeDataUrl("");

    // Fetch sessions for the selected conference
    if (conference) {
      await fetchSessions(conference.ID);
    }
  };

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find((s) => s.id === parseInt(sessionId));
    setSelectedSession(session || null);
    
    // Reset QR code when session changes
    setGeneratedQR("");
    setQrCodeDataUrl("");
  };

  // Get available conferences for this attendee
  const getAvailableConferences = () => {
    if (registrations.length > 0) {
      // If registrations are provided, show only conferences where attendee is registered
      return conferences.filter((conf) =>
        registrations.some((reg) => reg.CONFERENCE_ID === conf.ID)
      );
    }
    return conferences;
  };

  const handleDownload = async () => {
    if (!cardRef.current || !qrCodeDataUrl) return;

    try {
      // Create a high-resolution canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size for namecard 3.5" x 2" at 300 DPI
      const dpi = 300;
      const cardWidthInches = 3.5;
      const cardHeightInches = 2;
      canvas.width = cardWidthInches * dpi; // 1050px
      canvas.height = cardHeightInches * dpi; // 600px

      // Enable high DPI rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scale = dpi / 96; // 96 is standard DPI
      ctx.scale(scale, scale);

      // Set background with gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width / scale,
        canvas.height / scale
      );
      gradient.addColorStop(0, "#f8fafc");
      gradient.addColorStop(1, "#e0e7ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      // Add border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width / scale - 2, canvas.height / scale - 2);

      // Add rounded corners
      const rectX = 1;
      const rectY = 1;
      const rectWidth = canvas.width / scale - 2;
      const rectHeight = canvas.height / scale - 2;
      const radius = 8;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.clip();

      // Draw QR Code - Optimized for 3.5" x 2" card
      const qrSize = 130; // Increased size for better scanning
      const canvasWidth = canvas.width / scale; // Actual canvas width
      const canvasHeight = canvas.height / scale; // Actual canvas height
      const qrX = (canvasWidth - qrSize) / 2; // Center horizontally
      const qrY = 15; // Position from top - minimal margin

      // Load and draw QR code image
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });

      // Draw QR code with prominent border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw minimal attendee information below QR code - centered and simple
      const infoY = qrY + qrSize + 12; // Balanced spacing
      
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Draw name - larger and centered
      ctx.font = "bold 16px Arial, sans-serif"; // Reduced font size
      ctx.fillText(attendee.NAME, canvasWidth / 2, infoY);

      // Draw position - smaller and centered
      ctx.font = "10px Arial, sans-serif"; // Reduced font size // Reduced font size
      ctx.fillStyle = "#6b7280";
      ctx.fillText(
        attendee.POSITION || "Tham dự viên",
        canvasWidth / 2,
        infoY + 12 // Compact spacing
      );

      // Draw conference name - smaller and centered
      if (selectedConference) {
        ctx.font = "9px Arial, sans-serif"; // Reduced font size
        ctx.fillStyle = "#9ca3af";
        ctx.fillText(selectedConference.NAME, canvasWidth / 2, infoY + 22); // Compact spacing
        
        // Draw session name if selected
        if (selectedSession) {
          ctx.font = "8px Arial, sans-serif";
          ctx.fillStyle = "#6b7280";
          // Truncate session name if too long
          const maxWidth = canvasWidth - 20; // Leave margin
          let sessionName = selectedSession.name;
          if (ctx.measureText(sessionName).width > maxWidth) {
            while (ctx.measureText(sessionName + "...").width > maxWidth && sessionName.length > 0) {
              sessionName = sessionName.slice(0, -1);
            }
            sessionName += "...";
          }
          ctx.fillText(sessionName, canvasWidth / 2, infoY + 32);
        }
      }

      // Download the image
      const link = document.createElement("a");
      link.download = `name-card-${attendee.NAME.replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Error generating name card:", error);
      alert("Có lỗi khi tạo name card. Vui lòng thử lại.");
    }
  };

  const handlePrint = async () => {
    if (!cardRef.current || !qrCodeDataUrl) return;

    try {
      // Create a high-resolution canvas for printing
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size for namecard 3.5" x 2" at 300 DPI
      const dpi = 300;
      const cardWidthInches = 3.5;
      const cardHeightInches = 2;
      canvas.width = cardWidthInches * dpi; // 1050px
      canvas.height = cardHeightInches * dpi; // 600px

      // Enable high DPI rendering
      const scale = dpi / 96; // 96 is standard DPI
      ctx.scale(scale, scale);

      // Set background with gradient
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width / scale,
        canvas.height / scale
      );
      gradient.addColorStop(0, "#f8fafc");
      gradient.addColorStop(1, "#e0e7ff");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      // Add border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width / scale - 2, canvas.height / scale - 2);

      // Add rounded corners
      const rectX = 1;
      const rectY = 1;
      const rectWidth = canvas.width / scale - 2;
      const rectHeight = canvas.height / scale - 2;
      const radius = 8;

      ctx.beginPath();
      ctx.moveTo(rectX + radius, rectY);
      ctx.lineTo(rectX + rectWidth - radius, rectY);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY,
        rectX + rectWidth,
        rectY + radius
      );
      ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
      ctx.quadraticCurveTo(
        rectX + rectWidth,
        rectY + rectHeight,
        rectX + rectWidth - radius,
        rectY + rectHeight
      );
      ctx.lineTo(rectX + radius, rectY + rectHeight);
      ctx.quadraticCurveTo(
        rectX,
        rectY + rectHeight,
        rectX,
        rectY + rectHeight - radius
      );
      ctx.lineTo(rectX, rectY + radius);
      ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
      ctx.closePath();
      ctx.clip();

      // Draw QR Code - Optimized for 3.5" x 2" card
      const qrSize = 130; // Increased size for better scanning
      const canvasWidth = canvas.width / scale; // Actual canvas width
      const canvasHeight = canvas.height / scale; // Actual canvas height
      const qrX = (canvasWidth - qrSize) / 2; // Center horizontally
      const qrY = 15; // Position from top - minimal margin

      // Load and draw QR code image
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });

      // Draw QR code with prominent border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw minimal attendee information below QR code - centered and simple
      const infoY = qrY + qrSize + 12; // Balanced spacing
      
      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Draw name - larger and centered
      ctx.font = "bold 16px Arial, sans-serif"; // Reduced font size
      ctx.fillText(attendee.NAME, canvasWidth / 2, infoY);

      // Draw position - smaller and centered
      ctx.font = "10px Arial, sans-serif"; // Reduced font size // Reduced font size
      ctx.fillStyle = "#6b7280";
      ctx.fillText(
        attendee.POSITION || "Tham dự viên",
        canvasWidth / 2,
        infoY + 12 // Compact spacing
      );

      // Draw conference name - smaller and centered
      if (selectedConference) {
        ctx.font = "9px Arial, sans-serif"; // Reduced font size
        ctx.fillStyle = "#9ca3af";
        ctx.fillText(selectedConference.NAME, canvasWidth / 2, infoY + 22); // Compact spacing
        
        // Draw session name if selected
        if (selectedSession) {
          ctx.font = "8px Arial, sans-serif";
          ctx.fillStyle = "#6b7280";
          // Truncate session name if too long
          const maxWidth = canvasWidth - 20; // Leave margin
          let sessionName = selectedSession.name;
          if (ctx.measureText(sessionName).width > maxWidth) {
            while (ctx.measureText(sessionName + "...").width > maxWidth && sessionName.length > 0) {
              sessionName = sessionName.slice(0, -1);
            }
            sessionName += "...";
          }
          ctx.fillText(sessionName, canvasWidth / 2, infoY + 32);
        }
      }

      // Create print window with the canvas image
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const imageDataUrl = canvas.toDataURL("image/png", 1.0);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Name Card - ${attendee.NAME}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                background: white;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              .print-card {
                width: 3.5in;
                height: 2in;
                border: 1px solid #ccc;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .print-card img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 8px;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: block;
                }
                .print-card { 
                  width: 3.5in; 
                  height: 2in; 
                  margin: 0;
                  page-break-inside: avoid;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-card">
              <img src="${imageDataUrl}" alt="Name Card" />
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error("Error generating print name card:", error);
      alert("Có lỗi khi tạo name card để in. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <QrCode className="h-4 w-4" />
          <span>Xuất Name Card</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Name Card - {attendee.NAME}</span>
          </DialogTitle>
          <DialogDescription>
            Tạo và xuất name card với QR code cho tham dự viên
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conference Selection */}
          {conferences.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Chọn hội nghị để xuất QR Name Card:
              </label>
              <Select
                onValueChange={handleConferenceSelect}
                value={selectedConference?.ID.toString() || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn hội nghị..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableConferences().map((conference) => (
                    <SelectItem
                      key={conference.ID}
                      value={conference.ID.toString()}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{conference.NAME}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(conference.START_DATE)} -{" "}
                          {formatDate(conference.END_DATE)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Session Selection */}
          {selectedConference && sessions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Chọn phiên tham dự:
              </label>
              <Select
                onValueChange={handleSessionSelect}
                value={selectedSession?.id.toString() || ""}
                disabled={isLoadingSessions}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingSessions ? "Đang tải..." : "Chọn phiên tham dự..."} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem
                      key={session.id}
                      value={session.id.toString()}
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-medium text-gray-900">{session.name}</span>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                          <span>
                            {new Date(session.startTime).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} -{" "}
                            {new Date(session.endTime).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>
                            {new Date(session.startTime).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        {session.location && (
                          <span className="text-xs text-gray-400 mt-1">
                            📍 {session.location}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {!qrCode && !generatedQR && (
                <Button
                  onClick={handleGenerateQR}
                  disabled={isGenerating || !selectedConference || !selectedSession}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>{isGenerating ? "Đang tạo..." : "Tạo QR Code"}</span>
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleDownload}
                disabled={!qrCodeDataUrl}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Tải xuống</span>
              </Button>
              <Button
                onClick={handlePrint}
                disabled={!qrCodeDataUrl}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>In</span>
              </Button>
            </div>
          </div>

          {/* Name Card Preview - Simplified Design */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-[420px] h-[240px] bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-gray-200 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center space-y-4"
              style={{
                aspectRatio: "3.5/2", // Chuẩn namecard 3.5" x 2"
                maxWidth: "420px",
                maxHeight: "240px",
              }}
            >
              {/* QR Code - Large and Centered */}
              <div className="qr-section">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-32 h-32 border-4 border-black rounded-lg"
                    style={{
                      imageRendering: "crisp-edges", // Tối ưu hiển thị QR code
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 border-4 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Attendee Info - Minimal and Centered */}
              <div className="text-center space-y-1">
                <h3 className="font-bold text-lg text-gray-900">
                  {attendee.NAME}
                </h3>
                <p className="text-sm text-gray-600">
                  {attendee.POSITION || "Tham dự viên"}
                </p>
                {selectedConference && (
                  <p className="text-xs text-gray-500">
                    {selectedConference.NAME}
                  </p>
                )}
                {selectedSession && (
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    {selectedSession.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Hướng dẫn sử dụng:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Chọn hội nghị cụ thể để xuất QR Name Card</li>
              <li>• Bắt buộc chọn phiên tham dự cụ thể để QR code có hiệu lực cho phiên đó</li>
              <li>• Name card có kích thước chuẩn 3.5" x 2" (thẻ tham dự)</li>
              <li>• QR code lớn, rõ ràng, dễ quét (130px)</li>
              <li>
                • QR code tối ưu: chứa ID tham dự viên, ID hội nghị, session ID và timestamp
              </li>
              <li>
                • Thiết kế đơn giản: QR code làm trung tâm, thông tin tối thiểu
              </li>
              <li>
                • Tải xuống với độ phân giải 300 DPI cho chất lượng in tốt
              </li>
              <li>• In với bố cục tối ưu cho việc quét QR code</li>
              <li>
                • Thẻ có thể được sử dụng để check-in tại phiên tương ứng
              </li>
              <li>• QR code có tính bảo mật với checksum để xác thực</li>
              <li>
                • QR code nhỏ gọn, dễ quét, tối ưu cho thiết bị di động
              </li>
              <li>• Tên phiên tham dự sẽ hiển thị trên name card với font size tối ưu</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
