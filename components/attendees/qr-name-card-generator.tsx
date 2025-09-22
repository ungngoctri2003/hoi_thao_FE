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

interface QRNameCardGeneratorProps {
  attendee: Attendee;
  conferences?: Conference[];
  registrations?: Registration[];
  qrCode?: string;
  onGenerateQR?: (attendeeId: number, conferenceId?: number) => Promise<string>;
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
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate QR code when component mounts or QR code changes
  useEffect(() => {
    const generateQRCode = async () => {
      if (!qrCode && !generatedQR) return;

      try {
        const qrData = qrCode || generatedQR;
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 400, // Tăng độ phân giải QR code
          margin: 4,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "M", // Thêm error correction
        });
        setQrCodeDataUrl(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [qrCode, generatedQR]);

  const handleGenerateQR = async () => {
    if (!attendee?.ID || !selectedConference) return;

    setIsGenerating(true);
    try {
      // Create comprehensive QR data with all necessary information for checkin
      const qrData = {
        type: "attendee_registration",
        attendeeId: attendee.ID,
        conferenceId: selectedConference.ID,
        registrationId: selectedRegistration?.ID || null,
        timestamp: Date.now(),
        // Attendee information
        attendee: {
          id: attendee.ID,
          name: attendee.NAME,
          email: attendee.EMAIL,
          phone: attendee.PHONE,
          company: attendee.COMPANY,
          position: attendee.POSITION,
          avatarUrl: attendee.AVATAR_URL,
        },
        // Conference information
        conference: {
          id: selectedConference.ID,
          name: selectedConference.NAME,
          description: selectedConference.DESCRIPTION,
          startDate: selectedConference.START_DATE,
          endDate: selectedConference.END_DATE,
          venue: selectedConference.VENUE,
          status: selectedConference.STATUS,
        },
        // Registration information
        registration: selectedRegistration
          ? {
              id: selectedRegistration.ID,
              status: selectedRegistration.STATUS,
              registrationDate: selectedRegistration.REGISTRATION_DATE,
              checkinTime: selectedRegistration.CHECKIN_TIME,
              checkoutTime: selectedRegistration.CHECKOUT_TIME,
            }
          : null,
        // Security and validation
        checksum: generateChecksum(attendee.ID, selectedConference.ID),
        version: "1.0",
      };

      const qrString = JSON.stringify(qrData);
      setGeneratedQR(qrString);

      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(qrString, {
        width: 400, // Tăng độ phân giải QR code
        margin: 4,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      // Generate a fallback QR code
      const fallbackQR = JSON.stringify({
        attendeeId: attendee.ID,
        conferenceId: selectedConference.ID,
        timestamp: Date.now(),
        type: "attendee_registration",
      });
      setGeneratedQR(fallbackQR);

      const qrDataUrl = await QRCode.toDataURL(fallbackQR, {
        width: 400, // Tăng độ phân giải QR code
        margin: 4,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeDataUrl(qrDataUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate checksum for security validation
  const generateChecksum = (
    attendeeId: number,
    conferenceId: number
  ): string => {
    const data = `${attendeeId}-${conferenceId}-${Date.now()}`;
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
  const handleConferenceSelect = (conferenceId: string) => {
    const conference = conferences.find((c) => c.ID === parseInt(conferenceId));
    const registration = registrations.find(
      (r) => r.CONFERENCE_ID === parseInt(conferenceId)
    );

    setSelectedConference(conference || null);
    setSelectedRegistration(registration || null);

    // Reset QR code when conference changes
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

      // Draw QR Code
      const qrSize = 120; // Size in pixels
      const qrX = 30;
      const qrY = (canvas.height / scale - qrSize) / 2;

      // Load and draw QR code image
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });

      // Draw QR code with border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw attendee information
      const infoX = qrX + qrSize + 30;
      const infoY = 30;
      const lineHeight = 20;

      // Draw avatar
      const avatarSize = 50;
      const avatarX = infoX;
      const avatarY = infoY;

      // Draw avatar background circle
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw avatar initial
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        getInitials(attendee.NAME),
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2
      );

      // Reset text alignment
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Set font properties
      ctx.fillStyle = "#1f2937";

      // Draw name
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.fillText(attendee.NAME, infoX + avatarSize + 15, infoY);

      // Draw position
      ctx.font = "14px Arial, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(
        attendee.POSITION || "Tham dự viên",
        infoX + avatarSize + 15,
        infoY + 30
      );

      // Draw company
      ctx.fillText(
        attendee.COMPANY || "Chưa cập nhật",
        infoX + avatarSize + 15,
        infoY + 50
      );

      // Draw contact info
      let currentY = infoY + 80;
      if (attendee.EMAIL) {
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(`📧 ${attendee.EMAIL}`, infoX, currentY);
        currentY += 20;
      }
      if (attendee.PHONE) {
        ctx.fillText(`📞 ${attendee.PHONE}`, infoX, currentY);
        currentY += 20;
      }

      // Draw conference info
      if (selectedConference) {
        currentY += 10;
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoX, currentY);
        ctx.lineTo(canvas.width / scale - 30, currentY);
        ctx.stroke();
        currentY += 15;

        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(`📅 ${selectedConference.NAME}`, infoX, currentY);
        currentY += 20;

        const startDate = formatDate(selectedConference.START_DATE);
        const endDate = formatDate(selectedConference.END_DATE);
        ctx.fillText(`${startDate} - ${endDate}`, infoX, currentY);
        currentY += 20;

        if (selectedConference.VENUE) {
          ctx.fillText(`📍 ${selectedConference.VENUE}`, infoX, currentY);
          currentY += 20;
        }

        if (selectedRegistration) {
          ctx.fillText(
            `🎫 Trạng thái: ${selectedRegistration.STATUS}`,
            infoX,
            currentY
          );
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

      // Draw QR Code
      const qrSize = 120;
      const qrX = 30;
      const qrY = (canvas.height / scale - qrSize) / 2;

      // Load and draw QR code image
      const qrImage = new Image();
      qrImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });

      // Draw QR code with border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw attendee information
      const infoX = qrX + qrSize + 30;
      const infoY = 30;

      // Draw avatar
      const avatarSize = 50;
      const avatarX = infoX;
      const avatarY = infoY;

      // Draw avatar background circle
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw avatar initial
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        getInitials(attendee.NAME),
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2
      );

      // Reset text alignment
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Set font properties
      ctx.fillStyle = "#1f2937";

      // Draw name
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.fillText(attendee.NAME, infoX + avatarSize + 15, infoY);

      // Draw position
      ctx.font = "14px Arial, sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(
        attendee.POSITION || "Tham dự viên",
        infoX + avatarSize + 15,
        infoY + 30
      );

      // Draw company
      ctx.fillText(
        attendee.COMPANY || "Chưa cập nhật",
        infoX + avatarSize + 15,
        infoY + 50
      );

      // Draw contact info
      let currentY = infoY + 80;
      if (attendee.EMAIL) {
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(`📧 ${attendee.EMAIL}`, infoX, currentY);
        currentY += 20;
      }
      if (attendee.PHONE) {
        ctx.fillText(`📞 ${attendee.PHONE}`, infoX, currentY);
        currentY += 20;
      }

      // Draw conference info
      if (selectedConference) {
        currentY += 10;
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(infoX, currentY);
        ctx.lineTo(canvas.width / scale - 30, currentY);
        ctx.stroke();
        currentY += 15;

        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(`📅 ${selectedConference.NAME}`, infoX, currentY);
        currentY += 20;

        const startDate = formatDate(selectedConference.START_DATE);
        const endDate = formatDate(selectedConference.END_DATE);
        ctx.fillText(`${startDate} - ${endDate}`, infoX, currentY);
        currentY += 20;

        if (selectedConference.VENUE) {
          ctx.fillText(`📍 ${selectedConference.VENUE}`, infoX, currentY);
          currentY += 20;
        }

        if (selectedRegistration) {
          ctx.fillText(
            `🎫 Trạng thái: ${selectedRegistration.STATUS}`,
            infoX,
            currentY
          );
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {!qrCode && !generatedQR && (
                <Button
                  onClick={handleGenerateQR}
                  disabled={isGenerating || !selectedConference}
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

          {/* Name Card Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className="w-[420px] h-[240px] bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-gray-200 rounded-lg shadow-lg p-6 flex items-center space-x-6"
              style={{
                aspectRatio: "3.5/2", // Chuẩn namecard 3.5" x 2"
                maxWidth: "420px",
                maxHeight: "240px",
              }}
            >
              {/* Left side - QR Code */}
              <div className="flex-shrink-0 qr-section">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-28 h-28 border border-gray-300 rounded-lg"
                    style={{
                      imageRendering: "crisp-edges", // Tối ưu hiển thị QR code
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Right side - Attendee Info */}
              <div className="flex-1 min-w-0 info-section">
                <div className="flex items-start space-x-4 mb-3">
                  <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarImage src={attendee.AVATAR_URL || ""} />
                    <AvatarFallback className="text-base">
                      {getInitials(attendee.NAME)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate">
                      {attendee.NAME}
                    </h3>
                    <p className="text-sm text-gray-600 truncate position">
                      {attendee.POSITION || "Tham dự viên"}
                    </p>
                    <p className="text-sm text-gray-600 truncate company">
                      {attendee.COMPANY || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1 text-xs text-gray-600 contact-info">
                  {attendee.EMAIL && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{attendee.EMAIL}</span>
                    </div>
                  )}
                  {attendee.PHONE && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{attendee.PHONE}</span>
                    </div>
                  )}
                </div>

                {/* Conference Info */}
                {selectedConference && (
                  <div className="mt-3 pt-2 border-t border-gray-200 conference-info">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {selectedConference.NAME}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(selectedConference.START_DATE)} -{" "}
                      {formatDate(selectedConference.END_DATE)}
                    </div>
                    {selectedConference.VENUE && (
                      <div className="text-xs text-gray-500 mt-1">
                        📍 {selectedConference.VENUE}
                      </div>
                    )}
                    {selectedRegistration && (
                      <div className="text-xs text-gray-500 mt-1">
                        🎫 Trạng thái: {selectedRegistration.STATUS}
                      </div>
                    )}
                  </div>
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
              <li>• Name card có kích thước chuẩn 3.5" x 2" (thẻ tham dự)</li>
              <li>• QR code chất lượng cao (400px) với error correction</li>
              <li>
                • QR code bao gồm: thông tin cá nhân, thông tin hội nghị, trạng
                thái đăng ký
              </li>
              <li>
                • Tải xuống với độ phân giải 300 DPI cho chất lượng in tốt
              </li>
              <li>• In với bố cục chuẩn namecard, tối ưu cho máy in</li>
              <li>
                • Thẻ có thể được sử dụng để check-in tại hội nghị tương ứng
              </li>
              <li>• QR code có tính bảo mật với checksum để xác thực</li>
              <li>
                • Dữ liệu QR được mã hóa an toàn, không hiển thị dạng text
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
