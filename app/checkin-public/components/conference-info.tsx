"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, CheckCircle, LogOut } from "lucide-react";

interface Conference {
  id: number;
  name: string;
  date: string;
  status: 'active' | 'inactive';
}

interface ConferenceInfoProps {
  conference: Conference | null;
  totalAttendees?: number;
  checkedInCount?: number;
  checkoutCount?: number;
}

export function ConferenceInfo({ conference, totalAttendees = 0, checkedInCount = 0, checkoutCount = 0 }: ConferenceInfoProps) {
  if (!conference) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Chưa chọn hội nghị</h3>
          <p className="text-muted-foreground">
            Vui lòng chọn hội nghị từ dropdown ở trên để bắt đầu check-in
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Đang diễn ra", color: "bg-green-100 text-green-800" },
      inactive: { label: "Chưa bắt đầu", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const checkInRate = totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0;
  const checkoutRate = totalAttendees > 0 ? Math.round((checkoutCount / totalAttendees) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{conference.name}</CardTitle>
              <CardDescription className="text-base">
                {formatDate(conference.date)}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(conference.status)}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date & Time */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Ngày diễn ra</p>
              <p className="text-sm text-blue-700">{formatDate(conference.date)}</p>
            </div>
          </div>

          {/* Total Attendees */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Tổng tham dự viên</p>
              <p className="text-sm text-green-700">{totalAttendees} người</p>
            </div>
          </div>

          {/* Check-in Rate */}
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">Tỷ lệ check-in</p>
              <p className="text-sm text-purple-700">{checkInRate}% ({checkedInCount}/{totalAttendees})</p>
            </div>
          </div>

          {/* Check-out Rate */}
          <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
            <LogOut className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">Tỷ lệ check-out</p>
              <p className="text-sm text-orange-700">{checkoutRate}% ({checkoutCount}/{totalAttendees})</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalAttendees > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tiến độ check-in</span>
              <span className="font-medium">{checkInRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${checkInRate}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Hội trường A - Tầng 1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
