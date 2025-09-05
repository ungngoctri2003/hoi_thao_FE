"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, XCircle, Clock, QrCode, Users, Calendar } from "lucide-react";

interface CheckInRecord {
  id: number;
  attendeeName: string;
  attendeeEmail: string;
  checkInTime: string;
  status: 'success' | 'failed' | 'duplicate';
  qrCode: string;
  conferenceId: number;
}

interface StatsCardsProps {
  records: CheckInRecord[];
  conferences: Array<{ id: number; name: string; date: string }>;
  selectedConference?: string;
}

export function StatsCards({ records, conferences, selectedConference }: StatsCardsProps) {
  const filteredRecords = selectedConference 
    ? records.filter(record => record.conferenceId === parseInt(selectedConference))
    : records;

  const successCount = filteredRecords.filter(r => r.status === "success").length;
  const failedCount = filteredRecords.filter(r => r.status === "failed").length;
  const duplicateCount = filteredRecords.filter(r => r.status === "duplicate").length;
  const totalCount = filteredRecords.length;

  const selectedConferenceData = selectedConference 
    ? conferences.find(c => c.id === parseInt(selectedConference))
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Check-in thành công</p>
              <p className="text-2xl font-bold text-green-600">{successCount}</p>
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
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{duplicateCount}</p>
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
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conference Info Card */}
      {selectedConferenceData && (
        <Card className="md:col-span-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Hội nghị đang chọn</p>
                <p className="text-lg font-semibold">{selectedConferenceData.name}</p>
                <p className="text-sm text-muted-foreground">{selectedConferenceData.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
