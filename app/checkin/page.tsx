"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  QrCode, 
  Search, 
  Download, 
  UserCheck, 
  Clock, 
  CheckCircle,
  XCircle,
  Smartphone,
  Camera,
  RefreshCw
} from "lucide-react";

interface CheckInRecord {
  id: number;
  attendeeName: string;
  attendeeEmail: string;
  checkInTime: string;
  status: 'success' | 'failed' | 'duplicate';
  qrCode: string;
  conferenceId: number;
}

export default function CheckInPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockRecords: CheckInRecord[] = [
      {
        id: 1,
        attendeeName: "Nguyễn Văn A",
        attendeeEmail: "nguyenvana@email.com",
        checkInTime: "2024-01-20 09:15:30",
        status: "success",
        qrCode: "QR001",
        conferenceId: currentConferenceId || 1
      },
      {
        id: 2,
        attendeeName: "Trần Thị B",
        attendeeEmail: "tranthib@email.com",
        checkInTime: "2024-01-20 09:22:15",
        status: "success",
        qrCode: "QR002",
        conferenceId: currentConferenceId || 1
      },
      {
        id: 3,
        attendeeName: "Lê Văn C",
        attendeeEmail: "levanc@email.com",
        checkInTime: "2024-01-20 09:30:45",
        status: "duplicate",
        qrCode: "QR001",
        conferenceId: currentConferenceId || 1
      }
    ];

    setTimeout(() => {
      setCheckInRecords(mockRecords);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredRecords = checkInRecords.filter(record =>
    record.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.qrCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: "Thành công", color: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { label: "Thất bại", color: "bg-red-100 text-red-800", icon: XCircle },
      duplicate: { label: "Trùng lặp", color: "bg-yellow-100 text-yellow-800", icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
                </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;
  const canManage = hasConferencePermission("checkin.manage");

  if (!canManage) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền quản lý check-in
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const startScanning = () => {
    setIsScanning(true);
    // Simulate QR scanning
    setTimeout(() => {
      setIsScanning(false);
      // Add new check-in record
      const newRecord: CheckInRecord = {
        id: Date.now(),
        attendeeName: "Người dùng mới",
        attendeeEmail: "newuser@email.com",
        checkInTime: new Date().toLocaleString(),
        status: "success",
        qrCode: `QR${Date.now()}`,
        conferenceId: currentConferenceId || 1
      };
      setCheckInRecords(prev => [newRecord, ...prev]);
    }, 2000);
  };

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <ConferencePermissionGuard 
        requiredPermissions={["checkin.manage"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <QrCode className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Check-in QR</h1>
              <p className="text-muted-foreground">
                Quét QR code để check-in tham dự viên
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button onClick={startScanning} disabled={isScanning}>
              {isScanning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {isScanning ? "Đang quét..." : "Quét QR Code"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Check-in thành công</p>
                  <p className="text-2xl font-bold">
                    {checkInRecords.filter(r => r.status === "success").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Check-in thất bại</p>
                  <p className="text-2xl font-bold">
                    {checkInRecords.filter(r => r.status === "failed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Trùng lặp</p>
                  <p className="text-2xl font-bold">
                    {checkInRecords.filter(r => r.status === "duplicate").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <QrCode className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng quét</p>
                  <p className="text-2xl font-bold">{checkInRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Máy quét QR Code</CardTitle>
            <CardDescription>
              Sử dụng camera để quét mã QR của tham dự viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {isScanning ? (
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Đang quét QR code...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Nhấn "Quét QR Code" để bắt đầu</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={startScanning} disabled={isScanning}>
                  <Camera className="h-4 w-4 mr-2" />
                  {isScanning ? "Đang quét..." : "Bắt đầu quét"}
                </Button>
                <Button variant="outline">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mở ứng dụng di động
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, QR code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Xuất Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Records */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử Check-in ({filteredRecords.length})</CardTitle>
            <CardDescription>
              Danh sách tất cả các lần check-in đã thực hiện
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{record.attendeeName}</p>
                        <p className="text-sm text-muted-foreground">{record.attendeeEmail}</p>
                        <p className="text-xs text-muted-foreground">QR: {record.qrCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{record.checkInTime}</p>
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}