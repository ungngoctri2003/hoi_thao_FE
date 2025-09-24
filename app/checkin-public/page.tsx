"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/layout/public-header";
import { QRScanner } from "./components/qr-scanner";
import { ManualCheckInForm } from "./components/manual-checkin-form";
import { StatsCards } from "./components/stats-cards";
import { CheckInRecordsList } from "./components/checkin-records-list";
// import { APIStatus } from "./components/api-status";
import { ConferenceInfo } from "./components/conference-info";
import { UsageGuide } from "./components/usage-guide";
import { ToastNotification } from "./components/toast-notification";
import { QRAttendeeInfo } from "@/components/attendees/qr-attendee-info";
import { checkInAPI, type CheckInResponse } from "./lib/checkin-api";
import { type CheckInRecord, type Attendee, type Conference } from "./types";
import { QrCode, CheckCircle, XCircle, Users, Calendar } from "lucide-react";

export default function PublicCheckInPage() {
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [currentConference, setCurrentConference] = useState<Conference | null>(
    null
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [popupMessage, setPopupMessage] = useState<{
    message: string;
    type: "success" | "error" | "warning" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [scannedQRData, setScannedQRData] = useState<any>(null);
  const [showQRInfo, setShowQRInfo] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load checkin records when conference changes
  useEffect(() => {
    if (selectedConference) {
      loadCheckInRecords(parseInt(selectedConference));
    } else {
      setCheckInRecords([]);
    }
  }, [selectedConference]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const conferencesData = await checkInAPI.getConferences();
      setConferences(conferencesData);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setPopupMessage({
        message: "Lỗi khi tải dữ liệu",
        type: "error",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCheckInRecords = async (conferenceId: number) => {
    try {
      setIsLoading(true);
      const recordsData = await checkInAPI.getCheckInRecords(conferenceId);
      setCheckInRecords(recordsData);
    } catch (err) {
      console.error("Error loading checkin records:", err);
      setPopupMessage({
        message: "Lỗi khi tải lịch sử check-in",
        type: "error",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScanSuccess = async (qrData: string) => {
    try {
      setIsScanning(false);

      console.log("🔍 Processing QR code:", qrData);

      // Show processing message
      setPopupMessage({
        message: "Đang xử lý mã QR...",
        type: "info",
        isVisible: true,
      });

      // Parse QR data to check if it contains full information
      let parsedQRData = null;
      let conferenceId: number | null = null;

      try {
        parsedQRData = JSON.parse(qrData);
        console.log("📱 Parsed QR data:", parsedQRData);

        // Extract conference ID from QR data
        if (parsedQRData.conferenceId) {
          conferenceId = parsedQRData.conferenceId;
        }
      } catch (e) {
        console.log("📱 QR data is not JSON format");
      }

      // Store QR data for display
      setScannedQRData(parsedQRData);

      // If no conference ID in QR, try to find from conferences list
      if (!conferenceId && conferences.length > 0) {
        // Use the first active conference as default
        const activeConference =
          conferences.find((c) => c.status === "active") || conferences[0];
        conferenceId = activeConference.id;
        setCurrentConference(activeConference);
        setSelectedConference(conferenceId.toString());
      }

      if (!conferenceId) {
        setPopupMessage({
          message: "Không thể xác định hội nghị từ mã QR",
          type: "error",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
        return;
      }

      // Validate QR code first
      const validation = await checkInAPI.validateQRCode(qrData, conferenceId);

      if (!validation.valid || !validation.attendee) {
        setPopupMessage({
          message: "Mã QR không hợp lệ",
          type: "error",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
        return;
      }

      console.log("✅ QR validation successful:", validation.attendee);

      // Show QR info if available
      if (parsedQRData && parsedQRData.attendee) {
        setShowQRInfo(true);
      }

      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        checkInMethod: "qr",
      });

      if (response.success && response.data) {
        // Reload checkin records for the current conference
        await loadCheckInRecords(conferenceId);

        // Show popup success message
        setPopupMessage({
          message: `✅ Check-in thành công cho ${response.data.attendeeName}`,
          type: "success",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
      } else {
        setPopupMessage({
          message: response.message || "Lỗi khi check-in",
          type: "error",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
      }
    } catch (err) {
      console.error("QR scan error:", err);
      setPopupMessage({
        message: "Lỗi khi xử lý mã QR",
        type: "error",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };

  const handleQRScanError = (error: string) => {
    setIsScanning(false);
    setPopupMessage({
      message: error,
      type: "error",
      isVisible: true,
    });

    // Auto-hide popup after 5 seconds
    setTimeout(() => {
      setPopupMessage((prev) => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleManualCheckInSuccess = async (attendee: Attendee) => {
    try {
      // Set current conference if not set
      if (!selectedConference && attendee.conferenceId) {
        setSelectedConference(attendee.conferenceId.toString());
        const conference = conferences.find(
          (c) => c.id === attendee.conferenceId
        );
        if (conference) {
          setCurrentConference(conference);
        }
      }

      // Create check-in record from attendee data
      const checkInRecord: CheckInRecord = {
        id: Date.now(),
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        checkInTime: new Date().toLocaleString("vi-VN"),
        status: "success",
        qrCode: attendee.qrCode,
        conferenceId: attendee.conferenceId,
      };

      // Reload checkin records for the current conference
      if (attendee.conferenceId) {
        await loadCheckInRecords(attendee.conferenceId);
      }

      setPopupMessage({
        message: `Check-in thành công cho ${attendee.name}`,
        type: "success",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    } catch (err) {
      console.error("Manual check-in error:", err);
      setPopupMessage({
        message: "Lỗi khi check-in thủ công",
        type: "error",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };

  const handleManualCheckInError = (error: string) => {
    setPopupMessage({
      message: error,
      type: "error",
      isVisible: true,
    });

    // Auto-hide popup after 5 seconds
    setTimeout(() => {
      setPopupMessage((prev) => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleDeleteRecord = async (recordId: number, qrCode: string) => {
    try {
      const response = await checkInAPI.deleteCheckInRecord(recordId, qrCode);

      if (response.success) {
        // Reload checkin records
        if (selectedConference) {
          await loadCheckInRecords(parseInt(selectedConference));
        }

        setPopupMessage({
          message: response.message,
          type: "success",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
      } else {
        setPopupMessage({
          message: response.message,
          type: "error",
          isVisible: true,
        });

        // Auto-hide popup after 5 seconds
        setTimeout(() => {
          setPopupMessage((prev) => ({ ...prev, isVisible: false }));
        }, 5000);
      }
    } catch (err) {
      console.error("Delete record error:", err);
      setPopupMessage({
        message: "Lỗi khi xóa check-in",
        type: "error",
        isVisible: true,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* API Status */}
          {/* <APIStatus onRetry={loadInitialData} /> */}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <QrCode className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Hệ thống Check-in</h1>
                <p className="text-muted-foreground">
                  Quét QR code hoặc check-in thủ công cho tham dự viên
                </p>
              </div>
            </div>
          </div>

          {/* Current Conference Info */}
          {currentConference && (
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-700">
                      Hội nghị hiện tại
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {currentConference.name} - {currentConference.date}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Conference Info */}
          {currentConference && (
            <ConferenceInfo
              conference={currentConference}
              totalAttendees={conferences.length * 10} // Mock data
              checkedInCount={
                checkInRecords.filter((r) => r.status === "success").length
              }
            />
          )}

          {/* Stats Cards */}
          <StatsCards
            records={checkInRecords}
            conferences={conferences}
            selectedConference={selectedConference}
          />

          {/* Check-in Methods Tabs */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Chọn Phương thức Check-in
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn một trong hai phương thức dưới đây
                </p>
              </div>
            </div>

            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger
                  value="qr"
                  className="flex items-center space-x-2 text-base font-medium"
                >
                  <QrCode className="h-5 w-5" />
                  <span>Quét QR Code</span>
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="flex items-center space-x-2 text-base font-medium"
                >
                  <Users className="h-5 w-5" />
                  <span>Check-in Thủ công</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="mt-6">
                <div className="space-y-6">
                  <QRScanner
                    onScanSuccess={handleQRScanSuccess}
                    onScanError={handleQRScanError}
                    isScanning={isScanning}
                    onStartScan={() => setIsScanning(true)}
                    onStopScan={() => setIsScanning(false)}
                  />

                  {/* QR Attendee Info */}
                  {showQRInfo && scannedQRData && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Thông tin từ QR Code
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQRInfo(false)}
                        >
                          Ẩn thông tin
                        </Button>
                      </div>
                      <QRAttendeeInfo qrData={scannedQRData} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="manual" className="mt-6">
                <ManualCheckInForm
                  onCheckInSuccess={handleManualCheckInSuccess}
                  onCheckInError={handleManualCheckInError}
                  conferences={conferences}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Usage Guide */}
          <UsageGuide />

          {/* Check-in Records */}
          <CheckInRecordsList
            records={checkInRecords}
            isLoading={isLoading}
            selectedConference={selectedConference}
            onDeleteRecord={handleDeleteRecord}
          />
        </div>
      </div>

      {/* Popup Message */}
      {popupMessage.isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center space-x-3">
              {popupMessage.type === "success" && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
              {popupMessage.type === "error" && (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              {popupMessage.type === "warning" && (
                <XCircle className="h-8 w-8 text-yellow-500" />
              )}
              {popupMessage.type === "info" && (
                <CheckCircle className="h-8 w-8 text-blue-500" />
              )}
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  {popupMessage.message}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPopupMessage((prev) => ({ ...prev, isVisible: false }))
                }
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
