"use client";

import { useState, useEffect } from "react";
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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Plus,
  Download,
  Eye,
  Settings,
  FileText,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient, UserConferenceAssignment } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Conference {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "draft" | "active" | "completed" | "cancelled";
  maxAttendees: number;
  currentAttendees: number;
  category?: string;
  permissions?: Record<string, boolean>;
  assignmentId?: number;
  assignedAt?: string;
}

const statusLabels = {
  registered: "Đã đăng ký",
  attended: "Đã tham dự",
  missed: "Đã bỏ lỡ",
  upcoming: "Sắp diễn ra",
  managing: "Đang quản lý",
  draft: "Bản nháp",
  active: "Đang diễn ra",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attended: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  missed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  upcoming:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  managing:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function MyEventsContent() {
  const { user } = useAuth();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [actionLoading, setActionLoading] = useState<
    Record<number, string | null>
  >({});

  useEffect(() => {
    fetchConferences();
  }, [user]);

  const fetchConferences = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let conferencesData: Conference[] = [];

      if (user.role === "admin") {
        // Admin: Get all conferences
        const response = await apiClient.getConferences();
        conferencesData = response.data.map((conf: any) => ({
          id: conf.id,
          name: conf.name,
          description: conf.description || "",
          startDate: conf.startDate,
          endDate: conf.endDate,
          location: conf.location || "",
          status: conf.status,
          maxAttendees: conf.capacity || 0,
          currentAttendees: 0, // Will be calculated separately if needed
          category: conf.category,
        }));
      } else if (user.role === "staff") {
        // Staff: Get conferences from assignments
        const assignmentsResponse = await apiClient.getMyAssignments();
        const assignments = assignmentsResponse.data;

        if (assignments.length > 0) {
          const conferenceIds = assignments.map(
            (assignment: UserConferenceAssignment) => assignment.conferenceId
          );
          const conferencesResponse = await apiClient.getConferences();
          const allConferences = conferencesResponse.data;

          conferencesData = allConferences
            .filter((conf: any) => conferenceIds.includes(conf.id))
            .map((conf: any) => {
              const assignment = assignments.find(
                (a: UserConferenceAssignment) => a.conferenceId === conf.id
              );
              return {
                id: conf.id,
                name: conf.name,
                description: conf.description || "",
                startDate: conf.startDate,
                endDate: conf.endDate,
                location: conf.location || "",
                status: conf.status,
                maxAttendees: conf.capacity || 0,
                currentAttendees: 0,
                category: conf.category,
                permissions: assignment?.permissions,
                assignmentId: assignment?.id,
                assignedAt: assignment?.assignedAt,
              };
            });
        }
      } else {
        // Attendee: Get conferences from registrations
        const registrationsResponse = await apiClient.getMyRegistrations();
        const registrations = registrationsResponse.data;

        if (registrations.length > 0) {
          conferencesData = registrations.map((registration: any) => ({
            id: registration.conferenceId,
            name:
              registration.conference?.name ||
              `Hội nghị ${registration.conferenceId}`,
            description: registration.conference?.description || "",
            startDate:
              registration.conference?.startDate || new Date().toISOString(),
            endDate:
              registration.conference?.endDate || new Date().toISOString(),
            location: registration.conference?.location || "",
            status: registration.conference?.status || "active",
            maxAttendees: registration.conference?.capacity || 0,
            currentAttendees: 0,
            category: registration.conference?.category,
            permissions: registration?.permissions,
            assignmentId: registration?.id,
            assignedAt: registration?.createdAt,
          }));
        }
      }

      setConferences(conferencesData);
    } catch (err: any) {
      console.error("Error fetching conferences:", err);
      setError(err.message || "Không thể tải danh sách hội nghị");
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải danh sách hội nghị. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEventStatus = (conference: Conference): string => {
    const now = new Date();
    const startDate = new Date(conference.startDate);
    const endDate = new Date(conference.endDate);

    // For admin, map conference status to event status
    if (user?.role === "admin") {
      switch (conference.status) {
        case "draft":
          return "draft";
        case "active":
          if (now < startDate) {
            return "upcoming";
          } else if (now >= startDate && now <= endDate) {
            return "managing";
          } else {
            return "attended";
          }
        case "completed":
          return "attended";
        case "cancelled":
          return "missed";
        default:
          return "upcoming";
      }
    }

    // For staff, consider both conference status and time
    if (user?.role === "staff") {
      if (conference.status === "cancelled") {
        return "missed";
      }
      if (conference.status === "completed") {
        return "attended";
      }
      if (conference.status === "draft") {
        return "upcoming";
      }
      if (conference.status === "active") {
        if (now < startDate) {
          return "upcoming";
        } else if (now >= startDate && now <= endDate) {
          return "managing";
        } else {
          return "attended";
        }
      }
      // Default fallback
      if (now < startDate) {
        return "upcoming";
      } else if (now >= startDate && now <= endDate) {
        return "managing";
      } else {
        return "attended";
      }
    }

    // For attendees, determine status based on time and conference status
    if (conference.status === "cancelled") {
      return "missed";
    }

    if (now < startDate) {
      return "upcoming";
    } else if (now >= startDate && now <= endDate) {
      return "attended";
    } else {
      return "attended";
    }
  };

  const filteredEvents = conferences.filter((conference) => {
    const matchesSearch =
      conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conference.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || conference.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...Array.from(
      new Set(
        conferences.map((conference) => conference.category).filter(Boolean)
      )
    ),
  ];

  const getEventsByStatus = (status: string) => {
    if (status === "all") {
      return filteredEvents;
    }

    return filteredEvents.filter((conference) => {
      if (user?.role === "admin") {
        // For admin, use the computed event status
        return getEventStatus(conference) === status;
      } else {
        // For staff and attendee, use the computed event status
        return getEventStatus(conference) === status;
      }
    });
  };

  // Handle conference registration
  const handleRegister = async (conferenceId: number) => {
    if (!user) return;

    setActionLoading((prev) => ({ ...prev, [conferenceId]: "registering" }));

    try {
      await apiClient.registerForConference(conferenceId);

      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã đăng ký tham dự hội nghị thành công.",
      });

      // Refresh the conferences list
      await fetchConferences();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Lỗi đăng ký",
        description: error.message || "Không thể đăng ký tham dự hội nghị.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [conferenceId]: null }));
    }
  };

  // Handle conference unregistration
  const handleUnregister = async (conferenceId: number) => {
    if (!user) return;

    setActionLoading((prev) => ({ ...prev, [conferenceId]: "unregistering" }));

    try {
      await apiClient.unregisterFromConference(conferenceId);

      toast({
        title: "Hủy đăng ký thành công",
        description: "Bạn đã hủy đăng ký tham dự hội nghị.",
      });

      // Refresh the conferences list
      await fetchConferences();
    } catch (error: any) {
      console.error("Unregistration error:", error);
      toast({
        title: "Lỗi hủy đăng ký",
        description: error.message || "Không thể hủy đăng ký tham dự hội nghị.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [conferenceId]: null }));
    }
  };

  // Handle view details
  const handleViewDetails = (conferenceId: number) => {
    // Navigate to conference details page
    window.open(`/conferences/${conferenceId}`, "_blank");
  };

  // Handle download certificate
  const handleDownloadCertificate = async (conferenceId: number) => {
    setActionLoading((prev) => ({ ...prev, [conferenceId]: "downloading" }));

    try {
      // Call API to generate and download certificate
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/certificates/${conferenceId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải chứng chỉ");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${conferenceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Tải chứng chỉ thành công",
        description: "Chứng chỉ đã được tải về máy của bạn.",
      });
    } catch (error: any) {
      console.error("Certificate download error:", error);
      toast({
        title: "Lỗi tải chứng chỉ",
        description: error.message || "Không thể tải chứng chỉ.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [conferenceId]: null }));
    }
  };

  // Handle manage conference
  const handleManageConference = (conferenceId: number) => {
    // Navigate to conference management page
    window.open(`/conferences/${conferenceId}/manage`, "_blank");
  };

  // Handle quick actions for staff
  const handleQuickAction = async (conferenceId: number, action: string) => {
    setActionLoading((prev) => ({ ...prev, [conferenceId]: action }));

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/conferences/${conferenceId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Không thể ${action} hội nghị`);
      }

      switch (action) {
        case "start":
          toast({
            title: "Hội nghị đã bắt đầu",
            description:
              "Hội nghị đã được chuyển sang trạng thái đang diễn ra.",
          });
          break;
        case "complete":
          toast({
            title: "Hội nghị đã hoàn thành",
            description: "Hội nghị đã được chuyển sang trạng thái hoàn thành.",
          });
          break;
        case "cancel":
          toast({
            title: "Hội nghị đã bị hủy",
            description: "Hội nghị đã được chuyển sang trạng thái hủy.",
          });
          break;
        default:
          throw new Error("Hành động không hợp lệ");
      }

      // Refresh the conferences list
      await fetchConferences();
    } catch (error: any) {
      console.error("Quick action error:", error);
      toast({
        title: "Lỗi thực hiện hành động",
        description: error.message || "Không thể thực hiện hành động này.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [conferenceId]: null }));
    }
  };

  // Handle view reports
  const handleViewReports = (conferenceId: number) => {
    // Navigate to conference reports page
    window.open(`/conferences/${conferenceId}/reports`, "_blank");
  };

  // Handle download reports
  const handleDownloadReports = async (conferenceId: number) => {
    setActionLoading((prev) => ({
      ...prev,
      [conferenceId]: "downloading-reports",
    }));

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
        }/conferences/${conferenceId}/reports/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải báo cáo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conference-${conferenceId}-reports.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Tải báo cáo thành công",
        description: "Báo cáo đã được tải về máy của bạn.",
      });
    } catch (error: any) {
      console.error("Download reports error:", error);
      toast({
        title: "Lỗi tải báo cáo",
        description: error.message || "Không thể tải báo cáo.",
        variant: "destructive",
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [conferenceId]: null }));
    }
  };

  const EventCard = ({ conference }: { conference: Conference }) => {
    const eventStatus = getEventStatus(conference);
    const startDate = new Date(conference.startDate);
    const endDate = new Date(conference.endDate);
    const isLoading = actionLoading[conference.id];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{conference.name}</CardTitle>
              <CardDescription>{conference.description}</CardDescription>
            </div>
            <Badge
              className={statusColors[eventStatus as keyof typeof statusColors]}
            >
              {statusLabels[eventStatus as keyof typeof statusLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {startDate.toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {startDate.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{conference.location}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {conference.currentAttendees}/{conference.maxAttendees} người
                tham dự
              </span>
            </div>
          </div>

          {conference.category && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Danh mục:</span>{" "}
              {conference.category}
            </div>
          )}

          {user?.role === "admin" && conference.permissions && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Quyền hạn:</span>{" "}
              {Object.keys(conference.permissions).join(", ")}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {eventStatus === "upcoming" && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(conference.id)}
                  disabled={isLoading === "viewing"}
                >
                  {isLoading === "viewing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </>
                  )}
                </Button>
                {user?.role === "attendee" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRegister(conference.id)}
                    disabled={isLoading === "registering"}
                    className="flex-1"
                  >
                    {isLoading === "registering" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Đăng ký
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            {eventStatus === "registered" && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewDetails(conference.id)}
                  disabled={isLoading === "viewing"}
                >
                  {isLoading === "viewing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang tải...
                    </>
                  ) : (
                    "Xem chi tiết"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnregister(conference.id)}
                  disabled={isLoading === "unregistering"}
                  className="flex-1"
                >
                  {isLoading === "unregistering" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang hủy...
                    </>
                  ) : (
                    "Hủy đăng ký"
                  )}
                </Button>
              </>
            )}
            {eventStatus === "attended" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleDownloadCertificate(conference.id)}
                disabled={isLoading === "downloading"}
              >
                {isLoading === "downloading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Tải chứng chỉ
                  </>
                )}
              </Button>
            )}
            {eventStatus === "missed" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => handleViewDetails(conference.id)}
                disabled={isLoading === "viewing"}
              >
                {isLoading === "viewing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang tải...
                  </>
                ) : (
                  "Xem lại"
                )}
              </Button>
            )}
            {eventStatus === "managing" && (
              <>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleManageConference(conference.id)}
                  disabled={isLoading === "managing"}
                >
                  {isLoading === "managing" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Quản lý
                    </>
                  )}
                </Button>
                <div className="flex gap-2 flex-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewReports(conference.id)}
                    disabled={isLoading === "viewing"}
                    className="flex-1"
                  >
                    {isLoading === "viewing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Xem báo cáo
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReports(conference.id)}
                    disabled={isLoading === "downloading-reports"}
                    className="flex-1"
                  >
                    {isLoading === "downloading-reports" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Tải báo cáo
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
            {eventStatus === "upcoming" && user?.role === "staff" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction(conference.id, "start")}
                disabled={isLoading === "start"}
                className="flex-1"
              >
                {isLoading === "start" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang bắt đầu...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu hội nghị
                  </>
                )}
              </Button>
            )}
            {eventStatus === "managing" && user?.role === "staff" && (
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction(conference.id, "complete")}
                  disabled={isLoading === "complete"}
                  className="flex-1"
                >
                  {isLoading === "complete" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang hoàn thành...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Hoàn thành
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleQuickAction(conference.id, "cancel")}
                  disabled={isLoading === "cancel"}
                  className="flex-1"
                >
                  {isLoading === "cancel" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang hủy...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Hủy hội nghị
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getPageTitle = () => {
    if (user?.role === "admin") {
      return "Tất cả hội nghị";
    } else if (user?.role === "staff") {
      return "Hội nghị quản lý";
    } else {
      return "Sự kiện của tôi";
    }
  };

  const getPageDescription = () => {
    if (user?.role === "admin") {
      return "Quản lý và theo dõi tất cả các hội nghị trong hệ thống";
    } else if (user?.role === "staff") {
      return "Quản lý và theo dõi các hội nghị được giao cho bạn";
    } else {
      return "Quản lý và theo dõi các sự kiện bạn đã đăng ký tham dự";
    }
  };

  const getTabConfig = () => {
    if (user?.role === "admin") {
      return [
        { value: "all", label: "Tất cả" },
        { value: "draft", label: "Bản nháp" },
        { value: "upcoming", label: "Sắp diễn ra" },
        { value: "managing", label: "Đang diễn ra" },
        { value: "attended", label: "Đã hoàn thành" },
        { value: "missed", label: "Đã hủy" },
      ];
    } else if (user?.role === "staff") {
      return [
        { value: "all", label: "Tất cả" },
        { value: "upcoming", label: "Sắp tới" },
        { value: "managing", label: "Đang quản lý" },
        { value: "attended", label: "Đã hoàn thành" },
        { value: "missed", label: "Đã hủy" },
      ];
    } else {
      return [
        { value: "all", label: "Tất cả" },
        { value: "upcoming", label: "Sắp tới" },
        { value: "registered", label: "Đã đăng ký" },
        { value: "attended", label: "Đã tham dự" },
        { value: "missed", label: "Đã bỏ lỡ" },
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Không thể tải dữ liệu
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchConferences}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  const tabConfig = getTabConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">{getPageTitle()}</h1>
        <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hội nghị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.slice(1).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConferences}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          user?.role === "admin" ? "lg:grid-cols-5" : "lg:grid-cols-4"
        } gap-4 mb-6`}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng số hội nghị
                </p>
                <p className="text-2xl font-bold">{conferences.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sắp diễn ra
                </p>
                <p className="text-2xl font-bold">
                  {getEventsByStatus("upcoming").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đã tham dự
                </p>
                <p className="text-2xl font-bold">
                  {getEventsByStatus("attended").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {user?.role === "admin" ? "Đang diễn ra" : "Đang quản lý"}
                </p>
                <p className="text-2xl font-bold">
                  {user?.role === "admin"
                    ? getEventsByStatus("managing").length
                    : getEventsByStatus("managing").length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        {user?.role === "admin" && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Bản nháp
                  </p>
                  <p className="text-2xl font-bold">
                    {getEventsByStatus("draft").length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${tabConfig.length}, 1fr)` }}
        >
          {tabConfig.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({getEventsByStatus(tab.value).length})
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {getEventsByStatus(tab.value).map((conference) => (
                <EventCard key={conference.id} conference={conference} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredEvents.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {user?.role === "admin"
              ? "Chưa có hội nghị nào"
              : user?.role === "staff"
              ? "Chưa được giao quản lý hội nghị"
              : "Chưa đăng ký hội nghị nào"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {user?.role === "admin"
              ? "Chưa có hội nghị nào trong hệ thống."
              : user?.role === "staff"
              ? "Liên hệ quản trị viên để được giao quản lý hội nghị."
              : "Đăng ký tham dự hội nghị để xem chúng ở đây."}
          </p>
        </div>
      )}
    </div>
  );
}
