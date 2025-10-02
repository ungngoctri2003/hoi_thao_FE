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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
} from "lucide-react";
import { type Attendee } from "../types";

interface Session {
  id: number;
  title: string;
  speaker?: string;
  startTime: string;
  endTime: string;
  status: string;
  conferenceId: number;
}

interface ManualCheckInFormProps {
  onCheckInSuccess: (attendee: Attendee, actionType?: "checkin" | "checkout") => void;
  onCheckInError: (error: string) => void;
  conferences: Array<{ id: number; name: string; date: string }>;
  actionType?: "checkin" | "checkout"; // Action type: checkin or checkout
}

export function ManualCheckInForm({
  onCheckInSuccess,
  onCheckInError,
  conferences,
  actionType = "checkin", // Default to checkin
}: ManualCheckInFormProps) {
  const [email, setEmail] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState("");

  // Load sessions when conference changes
  useEffect(() => {
    if (selectedConference) {
      loadSessions(parseInt(selectedConference));
    } else {
      setSessions([]);
      setSelectedSession("");
    }
  }, [selectedConference]);

  const loadSessions = async (conferenceId: number) => {
    setIsLoadingSessions(true);
    setError("");
    
    try {
      const { checkInAPI } = await import("../lib/checkin-api");
      const sessionsData = await checkInAPI.getSessions(conferenceId);
      setSessions(sessionsData);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Lỗi khi tải danh sách phiên");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleCheckIn = async () => {
    // Basic client-side validation only
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    
    if (!qrCode.trim()) {
      setError("Vui lòng nhập mã QR");
      return;
    }
    
    if (!selectedConference) {
      setError("Vui lòng chọn hội nghị");
      return;
    }

    setIsCheckingIn(true);
    setError("");

    try {
      const { checkInAPI } = await import("../lib/checkin-api");

      // Send request to backend - let it handle all validation and business logic
      // Similar to QR code check-in flow
      const response = await checkInAPI.checkInAttendee({
        qrCode: qrCode,
        conferenceId: parseInt(selectedConference),
        sessionId: selectedSession ? parseInt(selectedSession) : null,
        checkInMethod: "manual",
        actionType: actionType,
        attendeeInfo: {
          email: email,
          name: email.split('@')[0], // Use email prefix as fallback name
        },
      });

      if (response.success && response.data) {
        // Create attendee object for success callback
        const attendee: Attendee = {
          id: response.data.id,
          name: response.data.attendeeName || email.split('@')[0],
          email: response.data.attendeeEmail || email,
          qrCode: qrCode,
          conferenceId: parseInt(selectedConference),
          isRegistered: true,
        };

        // Pass actionType to success handler (same as QR code)
        onCheckInSuccess(attendee, actionType);
        
        // Reset form
        setEmail("");
        setQrCode("");
        setSelectedConference("");
        setSelectedSession("");
        setSessions([]);
      } else {
        // Backend returned error - display it with appropriate styling
        const errorCode = response.error || "";
        let displayMessage = response.message || "Lỗi khi xử lý";
        
        // Add more context for specific errors
        if (errorCode === "ALREADY_CHECKED_IN") {
          displayMessage = "⚠️ " + displayMessage;
          onCheckInError(displayMessage); // Use error handler for better visibility
        } else if (errorCode === "NOT_CHECKED_IN") {
          displayMessage = "⚠️ " + displayMessage;
          onCheckInError(displayMessage);
        } else if (errorCode === "EMAIL_MISMATCH") {
          displayMessage = "❌ " + displayMessage + "\n\n💡 Hãy kiểm tra xem email có đúng với người sở hữu QR code này không.";
          setError(displayMessage);
        } else if (errorCode === "QR_CODE_NOT_FOUND") {
          displayMessage = "❌ " + displayMessage + "\n\n💡 Hãy kiểm tra lại mã QR và conference ID.";
          setError(displayMessage);
        } else if (errorCode === "REGISTRATION_NOT_FOUND") {
          displayMessage = "❌ " + displayMessage + "\n\n💡 Người này có thể chưa đăng ký tham dự hội nghị.";
          setError(displayMessage);
        } else {
          setError(displayMessage);
        }
      }
    } catch (err) {
      console.error("Check-in error:", err);
      const errorMessage = "❌ Lỗi khi xử lý. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Check-in Thủ công</span>
        </CardTitle>
        <CardDescription>
          Nhập thông tin tham dự viên để check-in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Nhập email tham dự viên..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* QR Code Input */}
          <div className="space-y-2">
            <Label htmlFor="qrCode">
              Mã QR <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="qrCode"
                placeholder="Nhập mã QR..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conference Selection */}
          <div className="space-y-2">
            <Label htmlFor="conference">
              Hội nghị <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedConference}
              onValueChange={setSelectedConference}
            >
              <SelectTrigger id="conference">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Chọn hội nghị..." />
                </div>
              </SelectTrigger>
              <SelectContent>
                {conferences.map((conference) => (
                  <SelectItem key={conference.id} value={conference.id.toString()}>
                    {conference.name} - {conference.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Selection */}
          <div className="space-y-2">
            <Label htmlFor="session">
              Phiên (Session) <span className="text-muted-foreground text-sm">(Tùy chọn)</span>
            </Label>
            <Select
              value={selectedSession}
              onValueChange={setSelectedSession}
              disabled={!selectedConference || isLoadingSessions}
            >
              <SelectTrigger id="session">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={
                    isLoadingSessions
                      ? "Đang tải..."
                      : !selectedConference
                      ? "Vui lòng chọn hội nghị trước"
                      : sessions.length === 0
                      ? "Không có phiên nào"
                      : "Chọn phiên..."
                  } />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.title}
                    {session.speaker && ` - ${session.speaker}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            </Alert>
          )}

          {/* Check-in Button */}
          <Button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !email.trim() || !qrCode.trim() || !selectedConference}
            className="w-full"
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {actionType === "checkin" ? "Check-in" : "Check-out"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
