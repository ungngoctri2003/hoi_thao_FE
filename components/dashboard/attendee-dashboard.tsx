"use client";

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
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter, 
  Download, 
  Bell, 
  Award, 
  FileText, 
  QrCode,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Bookmark,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { RoleInfoPanel } from "@/components/layout/role-info-panel";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";
import { RealtimeNotifications } from "@/components/dashboard/realtime-notifications";
import { RealtimeStatus } from "@/components/dashboard/realtime-status";

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const statusLabels = {
  registered: "Đã đăng ký",
  completed: "Đã tham dự",
  cancelled: "Đã hủy",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function AttendeeDashboard() {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [stats, setStats] = useState({
    registeredEvents: 0,
    attendedEvents: 0,
    averageRating: 0,
    totalPoints: 0,
    achievements: 0,
    upcomingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("my-events");

  useEffect(() => {
    const fetchAttendeeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [myRegistrations, allConferences, notificationsData, certificatesData] = await Promise.all([
          apiClient.getMyRegistrations(),
          apiClient.getUpcomingEvents(),
          apiClient.getNotifications?.() || Promise.resolve({ data: [] }),
          apiClient.getCertificates?.() || Promise.resolve({ data: [] }),
        ]);

        // Process my events with more details
        const processedMyEvents =
          myRegistrations.data?.map((registration: any) => ({
            id: registration.id,
            name:
              registration.conference?.NAME ||
              registration.conference?.name ||
              "Sự kiện",
            description: registration.conference?.DESCRIPTION || registration.conference?.description || "",
            date: new Date(
              registration.conference?.START_DATE ||
                registration.conference?.startDate
            ).toLocaleDateString("vi-VN"),
            time: `${new Date(
              registration.conference?.START_DATE ||
                registration.conference?.startDate
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(
              registration.conference?.END_DATE ||
                registration.conference?.endDate
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            location:
              registration.conference?.LOCATION ||
              registration.conference?.location ||
              "Địa điểm",
            status:
              registration.status === "completed" ? "completed" : 
              registration.status === "confirmed" ? "confirmed" :
              registration.status === "pending" ? "pending" : "registered",
            rating: registration.rating || null,
            priority: registration.priority || "medium",
            points: registration.points || 0,
            certificate: registration.certificate || null,
            isBookmarked: registration.isBookmarked || false,
            isLiked: registration.isLiked || false,
            comments: registration.comments || [],
            checkInTime: registration.checkInTime || null,
            checkOutTime: registration.checkOutTime || null,
          })) || [];

        // Process upcoming events
        const processedUpcomingEvents =
          allConferences?.map((conference: any) => ({
            id: conference.id,
            name: conference.NAME || conference.name,
            description: conference.DESCRIPTION || conference.description || "",
            date: new Date(
              conference.START_DATE || conference.startDate
            ).toLocaleDateString("vi-VN"),
            time: `${new Date(
              conference.START_DATE || conference.startDate
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(
              conference.END_DATE || conference.endDate
            ).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`,
            location: conference.LOCATION || conference.location || "Địa điểm",
            attendees: conference.totalRegistrations || 0,
            maxAttendees: conference.maxAttendees || 0,
            price: conference.price || 0,
            category: conference.category || "General",
            tags: conference.tags || [],
            isBookmarked: false,
            isLiked: false,
          })) || [];

        setMyEvents(processedMyEvents);
        setUpcomingEvents(processedUpcomingEvents);
        setAllEvents([...processedMyEvents, ...processedUpcomingEvents]);
        setNotifications(notificationsData.data || []);
        setCertificates(certificatesData.data || []);

        // Calculate enhanced stats
        const registeredCount = processedMyEvents.length;
        const attendedCount = processedMyEvents.filter(
          (event) => event.status === "completed"
        ).length;
        const upcomingCount = processedMyEvents.filter(
          (event) => event.status === "registered" || event.status === "confirmed"
        ).length;
        const ratings = processedMyEvents
          .filter((event) => event.rating)
          .map((event) => event.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        const totalPoints = processedMyEvents.reduce((sum, event) => sum + (event.points || 0), 0);
        const achievements = processedMyEvents.filter(event => event.certificate).length;

        setStats({
          registeredEvents: registeredCount,
          attendedEvents: attendedCount,
          averageRating: avgRating,
          totalPoints,
          achievements,
          upcomingCount,
        });
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching attendee data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendeeData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchAttendeeData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter events based on search and filters
  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || event.status === filterStatus;
    const matchesPriority = filterPriority === "all" || event.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleBookmark = async (eventId: number) => {
    try {
      // Toggle bookmark status
      setMyEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isBookmarked: !event.isBookmarked } : event
      ));
      setUpcomingEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isBookmarked: !event.isBookmarked } : event
      ));
      // API call would go here
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleLike = async (eventId: number) => {
    try {
      // Toggle like status
      setMyEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isLiked: !event.isLiked } : event
      ));
      setUpcomingEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, isLiked: !event.isLiked } : event
      ));
      // API call would go here
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleRegister = async (eventId: number) => {
    try {
      // Register for event
      console.log("Registering for event:", eventId);
      // API call would go here
    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  const handleCancelRegistration = async (eventId: number) => {
    try {
      // Cancel registration
      console.log("Cancelling registration for event:", eventId);
      // API call would go here
    } catch (error) {
      console.error("Error cancelling registration:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold">
            Chào mừng trở lại, {user?.name || "Người dùng"}!
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Quản lý các sự kiện và hội nghị của bạn
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Cập nhật lần cuối: </span>
              <span className="sm:hidden">Cập nhật: </span>
              <span>{lastUpdated.toLocaleTimeString("vi-VN")}</span>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              <Activity className="h-3 w-3 mr-1" />
              Đang hoạt động
            </Badge>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Xuất lịch
          </Button>
          <Button size="sm">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sự kiện đã đăng ký
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registeredEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingCount} sắp tới
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã tham dự</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendedEvents}</div>
            <p className="text-xs text-muted-foreground">Thành công</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm đánh giá TB
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Từ {myEvents.filter((event) => event.rating).length} đánh giá
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Điểm thưởng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chứng chỉ</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.achievements}</div>
            <p className="text-xs text-muted-foreground">Đã nhận</p>
          </CardContent>
        </Card>

        {/* Role Info Panel */}
        <RoleInfoPanel />
      </div>

      {/* Real-time Status & Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <RealtimeStatus />
        <RealtimeNotifications />
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Tìm kiếm và lọc sự kiện
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm sự kiện, địa điểm, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="registered">Đã đăng ký</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Đã tham dự</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="my-events">Sự kiện của tôi</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="my-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện của tôi</CardTitle>
              <CardDescription>
                Danh sách các sự kiện bạn đã đăng ký và tham dự
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.filter(event => myEvents.some(myEvent => myEvent.id === event.id)).map((event, index) => (
                  <div
                    key={index}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <h4 className="font-medium text-lg">{event.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              statusColors[event.status as keyof typeof statusColors]
                            }
                          >
                            {statusLabels[event.status as keyof typeof statusLabels]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              priorityColors[event.priority as keyof typeof priorityColors]
                            }
                          >
                            {event.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        {event.points > 0 && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{event.points} điểm</span>
                          </div>
                        )}
                      </div>

                      {event.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-muted-foreground">
                            Đánh giá:
                          </span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < event.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {event.checkInTime && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Check-in: {new Date(event.checkInTime).toLocaleString("vi-VN")}</span>
                          {event.checkOutTime && (
                            <span>Check-out: {new Date(event.checkOutTime).toLocaleString("vi-VN")}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-y-2 lg:space-x-0 mt-4 lg:mt-0">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookmark(event.id)}
                        >
                          <Bookmark className={`h-4 w-4 ${event.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLike(event.id)}
                        >
                          <Heart className={`h-4 w-4 ${event.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {event.status === "registered" && (
                          <>
                            <Button size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCancelRegistration(event.id)}
                            >
                              Hủy đăng ký
                            </Button>
                          </>
                        )}
                        {event.status === "completed" && (
                          <>
                            <Button size="sm">
                              <Award className="mr-2 h-4 w-4" />
                              Xem chứng chỉ
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Đánh giá
                            </Button>
                          </>
                        )}
                        {event.status === "confirmed" && (
                          <Button size="sm">
                            <QrCode className="mr-2 h-4 w-4" />
                            Mã QR
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện sắp tới</CardTitle>
              <CardDescription>Các sự kiện mở đăng ký</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.filter(event => upcomingEvents.some(upcomingEvent => upcomingEvent.id === event.id)).map((event, index) => (
                  <div
                    key={index}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <h4 className="font-medium text-lg">{event.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{event.category}</Badge>
                          {event.price > 0 && (
                            <Badge variant="secondary">
                              {event.price.toLocaleString()} VNĐ
                            </Badge>
                          )}
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees}/{event.maxAttendees || "∞"} chỗ</span>
                        </div>
                      </div>

                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-y-2 lg:space-x-0 mt-4 lg:mt-0">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBookmark(event.id)}
                        >
                          <Bookmark className={`h-4 w-4 ${event.isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLike(event.id)}
                        >
                          <Heart className={`h-4 w-4 ${event.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button 
                        onClick={() => handleRegister(event.id)}
                        className="w-full sm:w-auto"
                      >
                        Đăng ký
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chứng chỉ của tôi</CardTitle>
              <CardDescription>
                Danh sách các chứng chỉ bạn đã nhận được
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificates.length > 0 ? (
                  certificates.map((certificate, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          <h4 className="font-medium">{certificate.name}</h4>
                          <Badge variant="outline">Chứng chỉ</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {certificate.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Ngày cấp: {new Date(certificate.issuedDate).toLocaleDateString("vi-VN")}</span>
                          <span>Mã: {certificate.code}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                        <Button size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Bạn chưa có chứng chỉ nào</p>
                    <p className="text-sm">Tham dự các sự kiện để nhận chứng chỉ!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo</CardTitle>
              <CardDescription>
                Các thông báo quan trọng và cập nhật mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 border rounded-lg ${
                        !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {notification.type === "success" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {notification.type === "warning" && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        {notification.type === "info" && (
                          <Bell className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Không có thông báo nào</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
