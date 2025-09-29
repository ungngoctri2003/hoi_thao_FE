"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { Particles } from "@/components/ui/particles";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Building,
  ArrowLeft,
  QrCode,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square,
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

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  status: "upcoming" | "active" | "completed";
  maxAttendees: number;
  currentAttendees: number;
  type: string;
}

export default function ConferenceDetailPage() {
  const params = useParams();
  const conferenceId = params.id as string;

  const [conference, setConference] = useState<Conference | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConferenceDetails();
  }, [conferenceId]);

  const fetchConferenceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/conferences/${conferenceId}`);
      const data = await response.json();

      if (data.success) {
        setConference(data.data.conference);
        setSessions(data.data.sessions);
      } else {
        setError(data.error || "Không thể tải thông tin hội nghị");
      }
    } catch (err) {
      console.error("Error fetching conference details:", err);
      setError("Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isPast(end)) {
      return {
        status: "completed",
        text: "Đã kết thúc",
        color: "bg-gray-100 text-gray-600",
      };
    }
    if (isToday(start)) {
      return {
        status: "today",
        text: "Hôm nay",
        color: "bg-green-100 text-green-700",
      };
    }
    if (isTomorrow(start)) {
      return {
        status: "tomorrow",
        text: "Ngày mai",
        color: "bg-blue-100 text-blue-700",
      };
    }
    if (isFuture(start)) {
      return {
        status: "upcoming",
        text: "Sắp diễn ra",
        color: "bg-orange-100 text-orange-700",
      };
    }
    return {
      status: "active",
      text: "Đang diễn ra",
      color: "bg-green-100 text-green-700",
    };
  };

  const getSessionStatus = (session: Session) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    const now = new Date();

    if (isPast(end)) {
      return {
        status: "completed",
        text: "Đã kết thúc",
        color: "bg-gray-100 text-gray-600",
        icon: Square,
      };
    }
    if (now >= start && now <= end) {
      return {
        status: "active",
        text: "Đang diễn ra",
        color: "bg-green-100 text-green-700",
        icon: Play,
      };
    }
    return {
      status: "upcoming",
      text: "Sắp diễn ra",
      color: "bg-blue-100 text-blue-700",
      icon: Clock,
    };
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Lỗi tải thông tin
                </h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
                <Button onClick={fetchConferenceDetails} variant="outline">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Không tìm thấy hội nghị
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Hội nghị này không tồn tại hoặc đã bị xóa.
                </p>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại trang chủ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const dateStatus = getDateStatus(conference.startDate, conference.endDate);
  const startDate = new Date(conference.startDate);
  const endDate = new Date(conference.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden relative">
      {/* Particles Effect */}
      <Particles />

      {/* Public Header */}
      <PublicHeader />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </Link>
      </div>

      {/* Conference Header */}
      <section className="container mx-auto px-4 pb-12">
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Badge
                    variant="outline"
                    className="text-sm border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300"
                  >
                    {conference.category}
                  </Badge>
                  <Badge
                    className={`text-sm px-3 py-1 font-medium ${dateStatus.color} shadow-sm`}
                  >
                    {dateStatus.text}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                  {conference.name}
                </CardTitle>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  {conference.description}
                </p>
              </div>
              
              {/* Check-in Button in Header */}
              {conference.checkinRequired && (
                <div className="ml-6">
                  <Link href="/checkin-public">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      Check-in
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Conference Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {format(startDate, "dd/MM/yyyy", { locale: vi })}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {format(startDate, "HH:mm", { locale: vi })} -{" "}
                    {format(endDate, "HH:mm", { locale: vi })}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Địa điểm
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {conference.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Tổ chức
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {conference.organizer}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Tham dự
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {conference.currentAttendees}/{conference.maxAttendees}{" "}
                    người
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in Button */}
            {conference.checkinRequired && (
              <div className="flex justify-center">
                <Link href="/checkin-public">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <QrCode className="w-5 h-5 mr-3" />
                    Check-in ngay
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Sessions List */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Lịch trình các phiên
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {sessions.length} phiên trong hội nghị này
          </p>
        </div>

        {sessions.length === 0 ? (
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Chưa có phiên nào
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Lịch trình các phiên sẽ được cập nhật sớm. Vui lòng quay lại
                  sau.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => {
              const sessionStatus = getSessionStatus(session);
              const StatusIcon = sessionStatus.icon;
              const sessionStart = new Date(session.startTime);
              const sessionEnd = new Date(session.endTime);

              return (
                <Card
                  key={session.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge
                            className={`text-xs px-3 py-1 font-medium ${sessionStatus.color} shadow-sm`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {sessionStatus.text}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {session.type}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {session.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                          {session.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(sessionStart, "HH:mm", { locale: vi })} -{" "}
                              {format(sessionEnd, "HH:mm", { locale: vi })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <User className="w-4 h-4" />
                            <span>{session.speaker}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                          Tham dự
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                          {session.currentAttendees}/{session.maxAttendees}
                        </div>
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-600 rounded-full mt-2">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (session.currentAttendees /
                                  session.maxAttendees) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
