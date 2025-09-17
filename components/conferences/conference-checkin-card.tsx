"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  QrCode,
  ExternalLink,
  Building,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, isFuture } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface Conference {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "active" | "upcoming" | "completed";
  maxAttendees: number;
  currentAttendees: number;
  image: string;
  organizer: string;
  category: string;
  checkinRequired: boolean;
  qrCode: string;
}

interface ConferenceCheckinCardProps {
  conference: Conference;
  onCheckin?: (conferenceId: number) => void;
}

export function ConferenceCheckinCard({
  conference,
  onCheckin,
}: ConferenceCheckinCardProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const startDate = new Date(conference.startDate);
  const endDate = new Date(conference.endDate);
  const now = new Date();

  const getDateStatus = () => {
    if (isPast(endDate))
      return {
        status: "completed",
        text: "Đã kết thúc",
        color: "bg-gray-100 text-gray-600",
      };
    if (isToday(startDate))
      return {
        status: "today",
        text: "Hôm nay",
        color: "bg-green-100 text-green-700",
      };
    if (isTomorrow(startDate))
      return {
        status: "tomorrow",
        text: "Ngày mai",
        color: "bg-blue-100 text-blue-700",
      };
    if (isFuture(startDate))
      return {
        status: "upcoming",
        text: "Sắp diễn ra",
        color: "bg-orange-100 text-orange-700",
      };
    return {
      status: "active",
      text: "Đang diễn ra",
      color: "bg-green-100 text-green-700",
    };
  };

  const getAttendanceStatus = () => {
    const percentage =
      (conference.currentAttendees / conference.maxAttendees) * 100;
    if (percentage >= 90)
      return {
        status: "full",
        text: "Gần đầy",
        color: "bg-red-100 text-red-700",
      };
    if (percentage >= 70)
      return {
        status: "busy",
        text: "Đông người",
        color: "bg-yellow-100 text-yellow-700",
      };
    return {
      status: "available",
      text: "Còn chỗ",
      color: "bg-green-100 text-green-700",
    };
  };

  const dateStatus = getDateStatus();
  const attendanceStatus = getAttendanceStatus();

  const handleCheckin = async () => {
    if (!conference.checkinRequired) return;

    setIsCheckingIn(true);
    try {
      // Call real checkin API
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conferenceId: conference.id,
          checkInMethod: "manual",
          attendeeInfo: {
            name: "Guest User", // In real app, get from user context
            email: "guest@example.com",
            phone: "",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        onCheckin?.(conference.id);
      } else {
        console.error("Checkin failed:", result.error);
        // You can add toast notification here
        alert(`Check-in failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Checkin failed:", error);
      alert("Check-in failed. Please try again.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const canCheckin =
    conference.checkinRequired &&
    (dateStatus.status === "today" || dateStatus.status === "active") &&
    attendanceStatus.status !== "full";

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 hover:scale-[1.02] border-0 bg-white dark:bg-slate-800 overflow-hidden relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
              <Badge
                variant="outline"
                className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
              >
                {conference.category}
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
              {conference.name}
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {conference.description}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <Badge
              className={`text-xs px-3 py-1 font-medium ${dateStatus.color} shadow-sm`}
            >
              {dateStatus.text}
            </Badge>
            <Badge
              className={`text-xs px-3 py-1 font-medium ${attendanceStatus.color} shadow-sm`}
            >
              {attendanceStatus.text}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {/* Conference Info */}
        <div className="space-y-4">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {format(startDate, "dd/MM/yyyy", { locale: vi })}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {format(startDate, "HH:mm", { locale: vi })} -{" "}
                {format(endDate, "HH:mm", { locale: vi })}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Địa điểm
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {conference.location}
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3">
              <Building className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Tổ chức
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {conference.organizer}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Info */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Tham dự
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {conference.currentAttendees}/{conference.maxAttendees} người
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {Math.round(
                  (conference.currentAttendees / conference.maxAttendees) * 100
                )}
                %
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Đã đăng ký
              </div>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{
                width: `${
                  (conference.currentAttendees / conference.maxAttendees) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {canCheckin ? (
            <Button
              onClick={handleCheckin}
              disabled={isCheckingIn}
              className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isCheckingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Đang check-in...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 mr-3" />
                  Check-in ngay
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              className="w-full text-slate-500 border-slate-300 dark:border-slate-600 py-3 rounded-xl"
            >
              {dateStatus.status === "completed" ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-3" />
                  Đã kết thúc
                </>
              ) : attendanceStatus.status === "full" ? (
                <>
                  <AlertCircle className="w-5 h-5 mr-3" />
                  Đã đầy
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-3" />
                  Chưa đến giờ
                </>
              )}
            </Button>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
              asChild
            >
              <Link href={`/conferences/${conference.id}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Link>
            </Button>

            {conference.checkinRequired && (
              <div className="flex items-center justify-center px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <QrCode className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  QR
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
