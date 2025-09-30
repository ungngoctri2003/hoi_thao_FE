"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/layout/public-header";
import { useSessionsByDay } from "@/hooks/use-sessions";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  Star,
  Bookmark,
  Share2,
  Filter,
  Search,
  Loader2
} from "lucide-react";

export default function SessionsPublicPage() {
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("all");

  // Fetch sessions from API
  const { days, sessions, loading, error, refetch } = useSessionsByDay({
    search: searchTerm || undefined,
    status: selectedTrack !== "all" ? selectedTrack : undefined,
  });

  // Set first day as selected when data loads
  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0].id);
    }
  }, [days, selectedDay]);

  const tracks = [
    { id: "all", name: "Tất cả", color: "bg-gray-100 text-gray-800" },
    { id: "upcoming", name: "Sắp diễn ra", color: "bg-blue-100 text-blue-800" },
    { id: "live", name: "Đang diễn ra", color: "bg-red-100 text-red-800" },
    { id: "completed", name: "Đã kết thúc", color: "bg-gray-100 text-gray-800" }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      live: { label: "Đang diễn ra", color: "bg-red-100 text-red-800", icon: "🔴" },
      upcoming: { label: "Sắp diễn ra", color: "bg-blue-100 text-blue-800", icon: "⏰" },
      completed: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-800", icon: "✅" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    
    return (
      <Badge className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  // Get selected day data
  const selectedDayData = days.find(day => day.id === selectedDay);
  const filteredSessions = selectedDayData?.sessions || [];

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Format time for display
  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
            Lịch trình hội nghị
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Khám phá các phiên họp, workshop và sự kiện networking trong hội nghị
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only show if not loading and no error */}
        {!loading && !error && (
          <>
            {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phiên họp, diễn giả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Days and Tracks */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Days */}
              <Card>
                <CardHeader>
                  <CardTitle>Ngày diễn ra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {days.map((day) => (
                      <Button
                        key={day.id}
                        variant={selectedDay === day.id ? "default" : "outline"}
                        onClick={() => setSelectedDay(day.id)}
                        className="w-full justify-start"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">{formatDate(day.date).split(',')[0]}</div>
                          <div className="text-sm opacity-80">{formatDate(day.date).split(',')[1]}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracks */}
              <Card>
                <CardHeader>
                  <CardTitle>Chủ đề</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tracks.map((track) => (
                      <Button
                        key={track.id}
                        variant={selectedTrack === track.id ? "default" : "outline"}
                        onClick={() => setSelectedTrack(track.id)}
                        className="w-full justify-start"
                      >
                        <span className={`px-2 py-1 rounded text-xs mr-2 ${track.color}`}>
                          {track.name}
                        </span>
                        {track.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Sessions */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  Phiên họp ({filteredSessions.length})
                </CardTitle>
                <CardDescription>
                  {selectedDayData ? formatDate(selectedDayData.date) : 'Chọn ngày để xem phiên họp'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusBadge(session.status || 'upcoming')}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">
                              {session.name}
                            </h3>
                            <p className="text-slate-600 mb-4">{session.description || 'Không có mô tả'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{session.speaker || 'Chưa có diễn giả'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-slate-500" />
                              <span>{session.startTime && session.endTime ? formatTime(session.startTime, session.endTime) : 'Chưa có thời gian'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-500" />
                              <span>{session.roomName || session.location || 'Chưa có địa điểm'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span>Phiên họp</span>
                            </div>
                          </div>
                        </div>

                      </CardContent>
                    </Card>
                  ))}

                  {filteredSessions.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        Không tìm thấy phiên họp nào
                      </h3>
                      <p className="text-slate-500">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
