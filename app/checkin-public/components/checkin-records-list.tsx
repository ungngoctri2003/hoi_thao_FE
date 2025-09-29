"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, QrCode, CheckCircle, XCircle, Clock, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { type CheckInRecord } from "../types";

interface CheckInRecordsListProps {
  records: CheckInRecord[];
  isLoading: boolean;
  selectedConference?: string;
  onDeleteRecord?: (recordId: number, qrCode: string) => void;
}

export function CheckInRecordsList({ records, isLoading, selectedConference, onDeleteRecord }: CheckInRecordsListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<number | null>(null);
  const [qrCodeInput, setQrCodeInput] = React.useState("");
  const [showQrInput, setShowQrInput] = React.useState<number | null>(null);

  const filteredRecords = records.filter(record =>
    (record.attendeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.attendeeEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateTime;
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!onDeleteRecord || !qrCodeInput.trim()) return;
    
    setDeletingId(recordId);
    try {
      await onDeleteRecord(recordId, qrCodeInput.trim());
      setShowDeleteConfirm(null);
      setShowQrInput(null);
      setQrCodeInput("");
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartDelete = (recordId: number) => {
    setShowQrInput(recordId);
    setQrCodeInput("");
  };

  const handleCancelDelete = () => {
    setShowQrInput(null);
    setShowDeleteConfirm(null);
    setQrCodeInput("");
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Lịch sử Check-in ({filteredRecords.length})</CardTitle>
          <CardDescription>
            Danh sách tất cả các lần check-in đã thực hiện
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
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

        {/* Records List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {!selectedConference 
                ? "Vui lòng chọn hội nghị để xem lịch sử check-in" 
                : searchTerm 
                  ? "Không tìm thấy kết quả phù hợp" 
                  : "Chưa có lịch sử check-in nào cho hội nghị này"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {record.method === 'qr' ? (
                      <QrCode className="h-5 w-5 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{record.attendeeName || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">{record.attendeeEmail || 'N/A'}</p>
                    {record.attendeePhone && (
                      <p className="text-xs text-muted-foreground">{record.attendeePhone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDateTime(record.checkInTime)}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(record.status)}
                      <Badge variant="outline" className="text-xs">
                        {record.method === 'qr' ? 'QR Code' : 'Thủ công'}
                      </Badge>
                    </div>
                  </div>
                  {onDeleteRecord && (
                    <div className="flex items-center space-x-2">
                      {showQrInput === record.id ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <QrCode className="h-4 w-4 text-primary" />
                              <Input
                                placeholder="Nhập mã QR để xóa"
                                value={qrCodeInput}
                                onChange={(e) => setQrCodeInput(e.target.value)}
                                className="w-56"
                                autoFocus
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRecord(record.id)}
                                disabled={deletingId === record.id || !qrCodeInput.trim()}
                              >
                                {deletingId === record.id ? (
                                  <Clock className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Xác nhận xóa
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelDelete}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartDelete(record.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
