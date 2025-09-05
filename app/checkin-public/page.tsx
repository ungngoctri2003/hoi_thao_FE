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
import { checkInAPI, type CheckInResponse, type Attendee, type Conference } from "./lib/checkin-api";
import { 
  QrCode, 
  Download, 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Calendar
} from "lucide-react";
import Link from "next/link";

interface CheckInRecord {
  id: number;
  attendeeName: string;
  attendeeEmail: string;
  checkInTime: string;
  status: 'success' | 'failed' | 'duplicate';
  qrCode: string;
  conferenceId: number;
}

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

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [conferencesData, recordsData] = await Promise.all([
        checkInAPI.getConferences(),
        checkInAPI.getCheckInRecords()
      ]);
      
      setConferences(conferencesData);
      setCheckInRecords(recordsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError("Lỗi khi tải dữ liệu");
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
        setCheckInRecords(prev => [response.data!, ...prev]);
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
      
      const response = await checkInAPI.checkInAttendee({
        attendeeId: attendee.id,
        qrCode: attendee.qrCode,
        conferenceId: attendee.conferenceId,
        checkInMethod: 'manual',
        attendeeInfo: {
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone
        }
      });

      if (response.success && response.data) {
        setCheckInRecords(prev => [response.data!, ...prev]);
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

  const handleExportRecords = async () => {
    try {
      const conferenceId = selectedConference ? parseInt(selectedConference) : undefined;
      const blob = await checkInAPI.exportCheckInRecords(conferenceId, 'excel');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checkin-records-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError("Lỗi khi xuất báo cáo");
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportRecords}>
                <Download className="h-4 w-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          {/* Conference Selection */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <label className="text-sm font-medium">Chọn hội nghị:</label>
                  <select
                    value={selectedConference}
                    onChange={(e) => setSelectedConference(e.target.value)}
                    className="ml-2 px-3 py-1 border rounded-md"
                  >
                    <option value="">-- Chọn hội nghị --</option>
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
          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr" className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Quét QR Code</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
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

          {/* Usage Guide */}
          <UsageGuide />

          {/* Check-in Records */}
          <CheckInRecordsList
            records={checkInRecords}
            isLoading={isLoading}
            onExport={handleExportRecords}
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
