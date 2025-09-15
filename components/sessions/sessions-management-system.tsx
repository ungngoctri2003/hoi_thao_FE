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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Building,
  CalendarDays,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { GlobalLoading } from "@/components/ui/global-loading";
import { apiClient } from "@/lib/api";

interface Session {
  id: number;
  title: string;
  description?: string;
  speaker?: string;
  speakerEmail?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  roomId?: number;
  track?: string;
  conferenceId: number;
  conferenceName?: string;
  capacity?: number;
  registered?: number;
  status: "upcoming" | "live" | "active" | "completed" | "ended" | "cancelled";
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface Conference {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  description?: string;
  roomType?: string;
  features?: string[];
  status: string;
}

export function SessionsManagementSystem() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    speaker: "",
    speakerEmail: "",
    startTime: "",
    endTime: "",
    room: "",
    roomId: "",
    track: "",
    conferenceId: "",
    capacity: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load rooms for selected conference
  const loadRoomsForConference = async (conferenceId: number) => {
    try {
      console.log("Loading rooms for conference:", conferenceId);
      const roomsResponse = await apiClient.getRooms(conferenceId);
      console.log("Rooms response:", roomsResponse);

      // Handle different response formats
      const roomsData = (roomsResponse as any)?.data || roomsResponse || [];
      console.log("Rooms data:", roomsData);

      // Convert backend format to frontend format
      const formattedRooms = Array.isArray(roomsData)
        ? roomsData.map((room) => ({
            id: room.ID || room.id,
            name: room.NAME || room.name,
            capacity: room.CAPACITY || room.capacity,
            description: room.DESCRIPTION || room.description,
            roomType: room.ROOM_TYPE || room.roomType,
            features: room.FEATURES || room.features || [],
            status: room.STATUS || room.status || "active",
          }))
        : [];

      console.log("Formatted rooms:", formattedRooms);
      setRooms(formattedRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
      // Fallback: try to load all rooms
      try {
        console.log("Falling back to load all rooms");
        const allRoomsResponse = await apiClient.getRooms();
        const allRoomsData =
          (allRoomsResponse as any)?.data || allRoomsResponse || [];

        // Convert backend format to frontend format
        const formattedRooms = Array.isArray(allRoomsData)
          ? allRoomsData.map((room) => ({
              id: room.ID || room.id,
              name: room.NAME || room.name,
              capacity: room.CAPACITY || room.capacity,
              description: room.DESCRIPTION || room.description,
              roomType: room.ROOM_TYPE || room.roomType,
              features: room.FEATURES || room.features || [],
              status: room.STATUS || room.status || "active",
            }))
          : [];

        setRooms(formattedRooms);
      } catch (fallbackError) {
        console.error("Error loading all rooms:", fallbackError);
        setRooms([]);
      }
    }
  };

  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);

      // Load conferences
      const conferencesResponse = await apiClient.getConferences();
      setConferences(conferencesResponse.data);

      // Load rooms
      try {
        const roomsResponse = await apiClient.getRooms();
        console.log("Initial rooms response:", roomsResponse);
        const roomsData = (roomsResponse as any)?.data || roomsResponse || [];

        // Convert backend format to frontend format
        const formattedRooms = Array.isArray(roomsData)
          ? roomsData.map((room) => ({
              id: room.ID || room.id,
              name: room.NAME || room.name,
              capacity: room.CAPACITY || room.capacity,
              description: room.DESCRIPTION || room.description,
              roomType: room.ROOM_TYPE || room.roomType,
              features: room.FEATURES || room.features || [],
              status: room.STATUS || room.status || "active",
            }))
          : [];

        console.log("Initial formatted rooms:", formattedRooms);
        setRooms(formattedRooms);
      } catch (error) {
        console.error("Error loading initial rooms:", error);
        setRooms([]);
      }

      // Load sessions
      const sessionsResponse = await apiClient.getSessions();
      const sessionsWithConferenceNames = sessionsResponse.data.map(
        (session) => ({
          id: session.id,
          title: session.name, // API returns 'name' but we need 'title'
          description: session.description,
          speaker: session.speaker,
          speakerEmail: undefined, // Not provided by API
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.roomName || session.location || "Chưa có phòng", // Use room name if available
          roomId: session.roomId, // Now provided by API
          track: undefined, // Not provided by API
          conferenceId: session.conferenceId,
          conferenceName:
            conferencesResponse.data.find(
              (conf) => conf.id === session.conferenceId
            )?.name || "Unknown Conference",
          capacity: undefined, // Not provided by API
          registered: undefined, // Not provided by API
          status: "upcoming" as const, // Default status
          tags: undefined, // Not provided by API
          createdAt: session.createdAt,
          updatedAt: undefined, // Not provided by API
        })
      );
      setSessions(sessionsWithConferenceNames);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      searchTerm === "" ||
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.speaker &&
        session.speaker.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.description &&
        session.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.track &&
        session.track.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesConference =
      selectedConference === "all" ||
      session.conferenceId.toString() === selectedConference;

    const matchesStatus =
      selectedStatus === "all" || session.status === selectedStatus;

    const matchesTrack =
      selectedTrack === "all" ||
      (session.track && session.track === selectedTrack);

    return matchesSearch && matchesConference && matchesStatus && matchesTrack;
  });

  // Pagination logic
  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  // Debug pagination info
  console.log("Pagination Debug:", {
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedSessionsLength: paginatedSessions.length,
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedConference, selectedStatus, selectedTrack]);

  const tracks = Array.from(
    new Set(
      sessions
        .map((session) => session.track)
        .filter((track): track is string => Boolean(track))
    )
  );

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Tiêu đề phiên là bắt buộc");
    }

    if (!formData.conferenceId) {
      errors.push("Vui lòng chọn hội nghị");
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (startTime >= endTime) {
        errors.push("Thời gian kết thúc phải sau thời gian bắt đầu");
      }
    }

    if (formData.speakerEmail && !formData.speakerEmail.includes("@")) {
      errors.push("Email diễn giả không hợp lệ");
    }

    if (
      formData.capacity &&
      (isNaN(parseInt(formData.capacity)) || parseInt(formData.capacity) <= 0)
    ) {
      errors.push("Sức chứa phải là số dương");
    }

    return errors;
  };

  const handleCreateSession = () => {
    setFormData({
      title: "",
      description: "",
      speaker: "",
      speakerEmail: "",
      startTime: "",
      endTime: "",
      room: "",
      roomId: "none",
      track: "",
      conferenceId: "",
      capacity: "",
      tags: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setFormData({
      title: session.title || "",
      description: session.description || "",
      speaker: session.speaker || "",
      speakerEmail: session.speakerEmail || "",
      startTime: session.startTime
        ? new Date(session.startTime).toISOString().slice(0, 16)
        : "",
      endTime: session.endTime
        ? new Date(session.endTime).toISOString().slice(0, 16)
        : "",
      room: session.room || "",
      roomId: session.roomId?.toString() || "none",
      track: session.track || "",
      conferenceId: session.conferenceId.toString(),
      capacity: session.capacity?.toString() || "",
      tags: session.tags?.join(", ") || "",
    });

    // Load rooms for the conference when editing
    if (session.conferenceId) {
      loadRoomsForConference(session.conferenceId);
    }

    setIsEditDialogOpen(true);
  };

  const handleDeleteSession = (session: Session) => {
    setDeletingSession(session);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;

    try {
      await apiClient.deleteSession(deletingSession.id);
      // Reload data to ensure consistency
      await loadData();
      toast.success("Đã xóa phiên thành công");
      setIsDeleteDialogOpen(false);
      setDeletingSession(null);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Không thể xóa phiên. Vui lòng thử lại.");
    }
  };

  const handleSubmitCreate = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionData = {
        title: formData.title,
        description: formData.description || "",
        startTime: formData.startTime || new Date().toISOString(),
        endTime: formData.endTime || new Date().toISOString(),
        speaker: formData.speaker || "",
        speakerEmail: formData.speakerEmail || "",
        room: formData.room || "",
        roomId:
          formData.roomId &&
          formData.roomId !== "" &&
          formData.roomId !== "none"
            ? parseInt(formData.roomId)
            : undefined,
        track: formData.track || "",
        capacity: formData.capacity ? parseInt(formData.capacity) : 100,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      await apiClient.createSession(
        parseInt(formData.conferenceId),
        sessionData
      );

      // Reload data
      await loadData();

      setIsCreateDialogOpen(false);
      toast.success("Tạo phiên thành công");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Không thể tạo phiên. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingSession) {
      toast.error("Không tìm thấy phiên cần chỉnh sửa");
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    try {
      setIsSubmitting(true);
      const sessionData = {
        title: formData.title,
        description: formData.description || "",
        startTime: formData.startTime || new Date().toISOString(),
        endTime: formData.endTime || new Date().toISOString(),
        speaker: formData.speaker || "",
        speakerEmail: formData.speakerEmail || "",
        room: formData.room || "",
        roomId:
          formData.roomId &&
          formData.roomId !== "" &&
          formData.roomId !== "none"
            ? parseInt(formData.roomId)
            : undefined,
        track: formData.track || "",
        capacity: formData.capacity ? parseInt(formData.capacity) : 100,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      await apiClient.updateSession(editingSession.id, sessionData);

      // Reload data
      await loadData();

      setIsEditDialogOpen(false);
      setEditingSession(null);
      toast.success("Cập nhật phiên thành công");
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Không thể cập nhật phiên. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Quản lý tất cả các phiên của các hội nghị
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
                  {sessions.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hội nghị</p>
                <p className="text-2xl font-bold text-gray-900">
                  {conferences.length}
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
                  {sessions.filter((s) => s.status === "upcoming").length}
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
                  {sessions.reduce(
                    (sum, session) => sum + (session.registered ?? 0),
                    0
                  )}
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
            <Select
              value={selectedConference}
              onValueChange={setSelectedConference}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Chọn hội nghị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hội nghị</SelectItem>
                {conferences.map((conference) => (
                  <SelectItem
                    key={conference.id}
                    value={conference.id.toString()}
                  >
                    {conference.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Quản lý và theo dõi tất cả các phiên của các hội nghị
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
                        {session.track && (
                          <Badge variant="outline">{session.track}</Badge>
                        )}
                        <Badge variant="secondary">
                          {session.conferenceName || "Unknown Conference"}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {session.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {session.description ?? "Không có mô tả"}
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
                        onClick={() => handleDeleteSession(session)}
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
                        <span className="font-medium">
                          {session.speaker || "Chưa có diễn giả"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {session.startTime
                            ? formatDateTime(session.startTime)
                            : "Chưa có thời gian"}{" "}
                          -{" "}
                          {session.endTime
                            ? formatDateTime(session.endTime)
                            : "Chưa có thời gian"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{session.room || "Chưa có phòng"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {session.registered ?? 0}/{session.capacity ?? 0}{" "}
                          người đăng ký
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              session.capacity && session.registered
                                ? (session.registered / session.capacity) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.tags && session.tags.length > 0 ? (
                      session.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Chưa có tags
                      </span>
                    )}
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

      {/* Debug Panel - Remove in production */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              <p>Rooms loaded: {rooms.length}</p>
              <p>Conferences loaded: {conferences.length}</p>
              <p>Selected conference: {formData.conferenceId}</p>
              <p>Selected room: {formData.roomId}</p>
              {rooms.length > 0 && (
                <div>
                  <p>Available rooms:</p>
                  <ul className="ml-4">
                    {rooms.map((room) => (
                      <li key={room.id}>
                        - {room.name} (ID: {room.id}, Capacity: {room.capacity})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo phiên mới</DialogTitle>
            <DialogDescription>
              Tạo một phiên mới cho hội nghị
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
                <label className="text-sm font-medium">Thời gian bắt đầu</label>
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
                  Thời gian kết thúc
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
                <Select
                  value={formData.roomId || "none"}
                  onValueChange={(value) => {
                    if (value === "loading") return; // Ignore disabled option

                    if (value === "none") {
                      // No room selected
                      setFormData({
                        ...formData,
                        roomId: "",
                        room: "",
                      });
                      return;
                    }

                    const selectedRoom = rooms.find(
                      (room) => room.id.toString() === value
                    );
                    setFormData({
                      ...formData,
                      roomId: value,
                      room: selectedRoom?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn phòng</SelectItem>
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name} ({room.capacity} chỗ)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {rooms.length === 0
                          ? "Không có phòng nào"
                          : "Đang tải..."}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa</label>
                <Input
                  type="number"
                  placeholder="Số lượng người"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Hội nghị *</label>
                <Select
                  value={formData.conferenceId}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      conferenceId: value,
                      roomId: "none",
                      room: "",
                    });
                    if (value) {
                      loadRoomsForConference(parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hội nghị" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferences.map((conference) => (
                      <SelectItem
                        key={conference.id}
                        value={conference.id.toString()}
                      >
                        {conference.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div>
              <label className="text-sm font-medium">Email diễn giả</label>
              <Input
                type="email"
                placeholder="Email diễn giả"
                value={formData.speakerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, speakerEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
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
                <label className="text-sm font-medium">Thời gian bắt đầu</label>
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
                  Thời gian kết thúc
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
                <Select
                  value={formData.roomId || "none"}
                  onValueChange={(value) => {
                    if (value === "loading") return; // Ignore disabled option

                    if (value === "none") {
                      // No room selected
                      setFormData({
                        ...formData,
                        roomId: "",
                        room: "",
                      });
                      return;
                    }

                    const selectedRoom = rooms.find(
                      (room) => room.id.toString() === value
                    );
                    setFormData({
                      ...formData,
                      roomId: value,
                      room: selectedRoom?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không chọn phòng</SelectItem>
                    {rooms.length > 0 ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.name} ({room.capacity} chỗ)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        {rooms.length === 0
                          ? "Không có phòng nào"
                          : "Đang tải..."}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa</label>
                <Input
                  type="number"
                  placeholder="Số lượng người"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Hội nghị *</label>
                <Select
                  value={formData.conferenceId}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      conferenceId: value,
                      roomId: "none",
                      room: "",
                    });
                    if (value) {
                      loadRoomsForConference(parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hội nghị" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferences.map((conference) => (
                      <SelectItem
                        key={conference.id}
                        value={conference.id.toString()}
                      >
                        {conference.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div>
              <label className="text-sm font-medium">Email diễn giả</label>
              <Input
                type="email"
                placeholder="Email diễn giả"
                value={formData.speakerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, speakerEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="Tags (phân cách bằng dấu phẩy)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingSession(null);
              }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>Xác nhận xóa phiên</span>
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phiên này không? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deletingSession && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {deletingSession.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Diễn giả:</strong>{" "}
                {deletingSession.speaker || "Chưa có diễn giả"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hội nghị:</strong>{" "}
                {deletingSession.conferenceName || "Unknown Conference"}
              </p>
              {deletingSession.startTime && (
                <p className="text-sm text-gray-600">
                  <strong>Thời gian:</strong>{" "}
                  {formatDateTime(deletingSession.startTime)}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingSession(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteSession}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa phiên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
