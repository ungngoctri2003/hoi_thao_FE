"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { checkInAPI, type CheckInResponse } from "./lib/checkin-api";
import { type CheckInRecord, type Attendee, type Conference } from "./types";
import { 
  QrCode, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function PublicCheckInPage() {
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedConference, setSelectedConference] = useState<string>("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

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
      console.error('Error loading initial data:', err);
      setError("Lỗi khi tải dữ liệu");
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
      console.error('Error loading checkin records:', err);
      setError("Lỗi khi tải lịch sử check-in");
    } finally {
      setIsLoading(false);
    }
  };


  const handleQRScanSuccess = async (qrData: string) => {
    if (!selectedConference) {
      setError("Vui lòng chọn hội nghị trước khi quét QR");
      return;
    }

    try {
      setIsScanning(false);
      setError("");
      
      // Validate QR code first
      const validation = await checkInAPI.validateQRCode(qrData, parseInt(selectedConference));
      
      if (!validation.valid || !validation.attendee) {
        setError("Mã QR không hợp lệ hoặc không thuộc hội nghị này");
        return;
      }

      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: parseInt(selectedConference),
        checkInMethod: 'qr'
      });

      if (response.success && response.data) {
        // Reload checkin records for the current conference
        if (selectedConference) {
          await loadCheckInRecords(parseInt(selectedConference));
        }
        setToast({
          message: `Check-in thành công cho ${response.data.attendeeName}`,
          type: 'success',
          isVisible: true
        });
      } else {
        setToast({
          message: response.message || "Lỗi khi check-in",
          type: 'error',
          isVisible: true
        });
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setToast({
        message: "Lỗi khi xử lý mã QR",
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleQRScanError = (error: string) => {
    setError(error);
    setIsScanning(false);
  };

  const handleManualCheckInSuccess = async (attendee: Attendee) => {
    try {
      setError("");
      
      // Create check-in record from attendee data
      const checkInRecord: CheckInRecord = {
        id: Date.now(),
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        checkInTime: new Date().toLocaleString('vi-VN'),
        status: 'success',
        qrCode: attendee.qrCode,
        conferenceId: attendee.conferenceId
      };

      // Reload checkin records for the current conference
      if (selectedConference) {
        await loadCheckInRecords(parseInt(selectedConference));
      }
      setToast({
        message: `Check-in thành công cho ${attendee.name}`,
        type: 'success',
        isVisible: true
      });
    } catch (err) {
      console.error('Manual check-in error:', err);
      setToast({
        message: "Lỗi khi check-in thủ công",
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleManualCheckInError = (error: string) => {
    setError(error);
  };

  const handleDeleteRecord = async (recordId: number, qrCode: string) => {
    try {
      const response = await checkInAPI.deleteCheckInRecord(recordId, qrCode);
      
      if (response.success) {
        // Reload checkin records
        if (selectedConference) {
          await loadCheckInRecords(parseInt(selectedConference));
        }
        
        setToast({
          message: response.message,
          type: 'success',
          isVisible: true
        });
      } else {
        setToast({
          message: response.message,
          type: 'error',
          isVisible: true
        });
      }
    } catch (err) {
      console.error('Delete record error:', err);
      setToast({
        message: "Lỗi khi xóa check-in",
        type: 'error',
        isVisible: true
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>

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

          {/* Conference Selection */}
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-primary">Bước 1: Chọn Hội nghị</CardTitle>
                  <CardDescription className="text-sm">
                    Vui lòng chọn hội nghị để bắt đầu quá trình check-in
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn hội nghị từ danh sách:
                    </label>
                    <select
                      value={selectedConference}
                      onChange={(e) => setSelectedConference(e.target.value)}
                      className="w-full px-4 py-3 text-lg border-2 border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white shadow-sm"
                    >
                      <option value="">-- Vui lòng chọn hội nghị --</option>
                      {conferences
                        .filter(conference => conference.id !== undefined && conference.id !== null)
                        .map((conference) => (
                          <option 
                            key={conference.id} 
                            value={conference.id.toString()}
                          >
                            {conference.name || 'Unknown Conference'} - {conference.date || 'N/A'}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                {!selectedConference && (
                  <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-amber-700 font-medium">
                      ⚠️ Bạn cần chọn hội nghị trước khi có thể thực hiện check-in
                    </p>
                  </div>
                )}
                
                {selectedConference && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      ✅ Đã chọn hội nghị. Bạn có thể bắt đầu check-in!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conference Info */}
          <ConferenceInfo 
            conference={conferences.find(c => c.id === parseInt(selectedConference)) || null}
            totalAttendees={conferences.length * 10} // Mock data
            checkedInCount={checkInRecords.filter(r => r.status === 'success').length}
          />

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <StatsCards 
            records={checkInRecords}
            conferences={conferences}
            selectedConference={selectedConference}
          />

          {/* Check-in Methods Tabs */}
          {selectedConference ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Bước 2: Chọn Phương thức Check-in</h3>
                  <p className="text-sm text-gray-600">Chọn một trong hai phương thức dưới đây</p>
                </div>
              </div>
              
              <Tabs defaultValue="qr" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="qr" className="flex items-center space-x-2 text-base font-medium">
                    <QrCode className="h-5 w-5" />
                    <span>Quét QR Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center space-x-2 text-base font-medium">
                    <Users className="h-5 w-5" />
                    <span>Check-in Thủ công</span>
                  </TabsTrigger>
                </TabsList>
            
            <TabsContent value="qr" className="mt-6">
              <QRScanner
                onScanSuccess={handleQRScanSuccess}
                onScanError={handleQRScanError}
                isScanning={isScanning}
                onStartScan={() => setIsScanning(true)}
                onStopScan={() => setIsScanning(false)}
              />
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
          ) : (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  Chưa chọn hội nghị
                </h3>
                <p className="text-amber-700 mb-4">
                  Vui lòng chọn hội nghị ở bước 1 để có thể thực hiện check-in
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-amber-600">
                  <span>👆</span>
                  <span>Cuộn lên trên để chọn hội nghị</span>
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
