"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { GlobalLoading } from "@/components/ui/global-loading";
import { apiClient } from "@/lib/api";

interface Session {
  ID: number;
  CONFERENCE_ID: number;
  ROOM_ID?: number;
  TITLE: string;
  SPEAKER?: string;
  START_TIME: string;
  END_TIME: string;
  STATUS: "upcoming" | "live" | "completed" | "cancelled";
  DESCRIPTION?: string;
  // Frontend computed fields
  id: number;
  title: string;
  description: string;
  speaker: string;
  speakerEmail: string;
  startTime: string;
  endTime: string;
  room: string;
  track: string;
  conferenceId: number;
  capacity: number;
  registered: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Conference {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "live" | "completed";
}

interface SessionsSystemProps {
  conferenceId: number;
  conferenceName: string;
}

export function SessionsSystem({
  conferenceId,
  conferenceName,
}: SessionsSystemProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speaker: "",
    speakerEmail: "",
    startTime: "",
    endTime: "",
    room: "",
    track: "",
    capacity: 100,
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to reload sessions data
  const reloadSessions = async () => {
    try {
      const sessionsResponse = await apiClient.getSessions(conferenceId);
      console.log("Sessions API response:", sessionsResponse);
      console.log("Conference ID:", conferenceId);

      const sessionsData = (sessionsResponse.data || []).map((session: any) => {
        const mappedSession: Session = {
          ID: session.id,
          CONFERENCE_ID: session.conferenceId,
          ROOM_ID: session.roomId,
          TITLE: session.name,
          SPEAKER: session.speaker || undefined,
          START_TIME: session.startTime,
          END_TIME: session.endTime,
          STATUS: session.status || "upcoming",
          DESCRIPTION: session.description || undefined,
          id: session.id,
          title: session.name,
          description: session.description || "",
          speaker: session.speaker || "Chưa xác định",
          speakerEmail: "",
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.location || "Chưa xác định",
          track: "General",
          conferenceId: session.conferenceId,
          capacity: 100,
          registered: 0,
          status: session.status || "upcoming",
          tags: [],
          createdAt: session.createdAt || new Date().toISOString(),
          updatedAt: session.createdAt || new Date().toISOString(),
        };
        return mappedSession;
      });
      setSessions(sessionsData);
    } catch (error: any) {
      console.error("Error reloading sessions:", error);
      toast.error("Không thể tải lại dữ liệu phiên");
    }
  };

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load conference data
        const conferenceData = await apiClient.getConferenceById(conferenceId);
        setConference({
          id: conferenceData.id,
          name: conferenceData.name,
          startDate: conferenceData.startDate,
          endDate: conferenceData.endDate,
          status: conferenceData.status as "upcoming" | "live" | "completed",
        });

        // Load sessions data
        await reloadSessions();
      } catch (error: any) {
        console.error("Error loading sessions data:", error);
        toast.error("Không thể tải dữ liệu phiên. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [conferenceId, conferenceName]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: {
        label: "Sắp diễn ra",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      },
      live: {
        label: "Đang diễn ra",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
      },
      completed: {
        label: "Đã kết thúc",
        color: "bg-gray-100 text-gray-800",
        icon: CheckCircle,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.upcoming;
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || session.status === selectedStatus;
    const matchesTrack =
      selectedTrack === "all" || session.track === selectedTrack;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  // Pagination logic
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedTrack]);

  const tracks = Array.from(new Set(sessions.map((session) => session.track)));

  const handleCreateSession = () => {
    // Set default times (tomorrow and tomorrow + 1 hour)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowPlusOne = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    setFormData({
      title: "",
      description: "",
      speaker: "",
      speakerEmail: "",
      startTime: tomorrow.toISOString().slice(0, 16), // Format for datetime-local input
      endTime: tomorrowPlusOne.toISOString().slice(0, 16),
      room: "",
      track: "",
      capacity: 100,
      tags: [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      speaker: session.speaker,
      speakerEmail: session.speakerEmail,
      startTime: session.startTime
        ? new Date(session.startTime).toISOString().slice(0, 16)
        : "",
      endTime: session.endTime
        ? new Date(session.endTime).toISOString().slice(0, 16)
        : "",
      room: session.room,
      track: session.track,
      capacity: session.capacity,
      tags: session.tags,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiên này?")) {
      try {
        await apiClient.deleteSession(sessionId);
        await reloadSessions();
        toast.success("Đã xóa phiên thành công");
      } catch (error: any) {
        console.error("Error deleting session:", error);
        toast.error("Không thể xóa phiên. Vui lòng thử lại.");
      }
    }
  };

  const handleSubmitCreate = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.createSession(conferenceId, {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        speaker: formData.speaker,
        speakerEmail: formData.speakerEmail,
        room: formData.room,
        track: formData.track,
        capacity: formData.capacity,
        tags: formData.tags,
      });

      // Reload sessions data
      await reloadSessions();
      setIsCreateDialogOpen(false);
      toast.success("Tạo phiên thành công");
    } catch (error: any) {
      console.error("Error creating session:", error);

      // More specific error messages
      if (error.message?.includes("UNAUTHORIZED")) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.message?.includes("VALIDATION_ERROR")) {
        toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
      } else if (error.message?.includes("NOT_FOUND")) {
        toast.error("Không tìm thấy hội nghị. Vui lòng thử lại.");
      } else {
        toast.error(
          `Không thể tạo phiên: ${error.message || "Vui lòng thử lại."}`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (
      !editingSession ||
      !formData.title ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.updateSession(editingSession.id, {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        speaker: formData.speaker,
        speakerEmail: formData.speakerEmail,
        room: formData.room,
        track: formData.track,
        capacity: formData.capacity,
        tags: formData.tags,
      });

      // Reload sessions data
      await reloadSessions();
      setIsEditDialogOpen(false);
      setEditingSession(null);
      toast.success("Cập nhật phiên thành công");
    } catch (error: any) {
      console.error("Error updating session:", error);
      toast.error("Không thể cập nhật phiên. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const totalSessions = sessions.length;
  const upcomingSessions = sessions.filter(
    (s) => s.status === "upcoming"
  ).length;
  const liveSessions = sessions.filter((s) => s.status === "live").length;
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const totalRegistered = sessions.reduce(
    (sum, session) => sum + session.registered,
    0
  );
  const totalCapacity = sessions.reduce(
    (sum, session) => sum + session.capacity,
    0
  );
  const attendanceRate =
    totalCapacity > 0 ? (totalRegistered / totalCapacity) * 100 : 0;

  if (loading) {
    return (
      <GlobalLoading message="Đang tải dữ liệu phiên..." variant="fullscreen" />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phiên</h1>
          <p className="text-gray-600 mt-2">
            {conference?.name} - Quản lý các phiên của hội nghị
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={reloadSessions} variant="outline" disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>
          <Button
            onClick={handleCreateSession}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo phiên mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng phiên</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sắp diễn ra</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingSessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng đăng ký
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRegistered}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tỷ lệ tham dự
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm phiên, diễn giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                <SelectItem value="live">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Đã kết thúc</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Chủ đề" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chủ đề</SelectItem>
                {tracks.map((track) => (
                  <SelectItem key={track} value={track}>
                    {track}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phiên ({totalItems})</CardTitle>
          <CardDescription>
            Quản lý và theo dõi các phiên của hội nghị {conference?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedSessions.map((session) => (
              <Card
                key={session.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(session.status)}
                        <Badge variant="outline">{session.track}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {session.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {session.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSession(session)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{session.speaker}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {formatDateTime(session.startTime)} -{" "}
                          {formatDateTime(session.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{session.room}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {session.registered}/{session.capacity} người đăng ký
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (session.registered / session.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {paginatedSessions.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Không tìm thấy phiên nào
                </h3>
                <p className="text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)}{" "}
                  trong {totalItems} phiên
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-700">mỗi trang</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Cuối
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo phiên mới</DialogTitle>
            <DialogDescription>
              Tạo một phiên mới cho hội nghị {conference?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề phiên *</label>
                <Input
                  placeholder="Nhập tiêu đề phiên"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Diễn giả</label>
                <Input
                  placeholder="Tên diễn giả"
                  value={formData.speaker}
                  onChange={(e) =>
                    setFormData({ ...formData, speaker: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Mô tả chi tiết về phiên"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Thời gian bắt đầu *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Thời gian kết thúc *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phòng</label>
                <Input
                  placeholder="Tên phòng"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa</label>
                <Input
                  type="number"
                  placeholder="Số lượng người"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Chủ đề</label>
              <Input
                placeholder="Chủ đề phiên"
                value={formData.track}
                onChange={(e) =>
                  setFormData({ ...formData, track: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo phiên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phiên</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin phiên</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tiêu đề phiên *</label>
                <Input
                  placeholder="Nhập tiêu đề phiên"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Diễn giả</label>
                <Input
                  placeholder="Tên diễn giả"
                  value={formData.speaker}
                  onChange={(e) =>
                    setFormData({ ...formData, speaker: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Mô tả chi tiết về phiên"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Thời gian bắt đầu *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Thời gian kết thúc *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phòng</label>
                <Input
                  placeholder="Tên phòng"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa</label>
                <Input
                  type="number"
                  placeholder="Số lượng người"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Chủ đề</label>
              <Input
                placeholder="Chủ đề phiên"
                value={formData.track}
                onChange={(e) =>
                  setFormData({ ...formData, track: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
