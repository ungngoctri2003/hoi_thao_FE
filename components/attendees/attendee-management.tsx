"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiClient, AttendeeInfo, CreateAttendeeRequest } from "@/lib/api";
import { useNotification } from "@/hooks/use-notification";
import { useAuth } from "@/hooks/use-auth";
import { AuthErrorHandler } from "../auth/auth-error-handler";

// Extend AttendeeInfo to include registration status
interface AttendeeWithRegistration extends AttendeeInfo {
  registrationStatus?: "registered" | "checked-in" | "cancelled" | "no-show";
  conferenceName?: string;
  registrationDate?: string;
}

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "checked-in":
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "no-show": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const statusLabels = {
  registered: "Đã đăng ký",
  "checked-in": "Đã check-in",
  cancelled: "Đã hủy",
  "no-show": "Vắng mặt",
};

export function AttendeeManagement() {
  const [attendees, setAttendees] = useState<AttendeeWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conferenceFilter, setConferenceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAttendee, setNewAttendee] = useState<Partial<CreateAttendeeRequest>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    dietary: "",
    specialNeeds: "",
  });
  const { showSuccess, showError } = useNotification();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Debug authentication state
  console.log('AttendeeManagement - Auth state:', {
    isAuthenticated,
    authLoading,
    user: user ? { id: user.id, email: user.email, role: user.role, permissions: user.permissions } : null
  });
  
  // Debug permission check - use useMemo to prevent recalculation
  const hasAttendeesPermission = useMemo(() => {
    const hasPermission = user?.permissions?.includes('attendees.write') || 
                         user?.permissions?.includes('attendees.read') || 
                         user?.permissions?.includes('attendees.manage') ||
                         user?.role === 'admin' || user?.role === 'staff';
    
    console.log('Permission check:', {
      hasAttendeesPermission: hasPermission,
      userPermissions: user?.permissions,
      userRole: user?.role,
      includesAttendeesWrite: user?.permissions?.includes('attendees.write'),
      includesAttendeesRead: user?.permissions?.includes('attendees.read'),
      includesAttendeesManage: user?.permissions?.includes('attendees.manage'),
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff'
    });
    
    return hasPermission;
  }, [user?.permissions, user?.role]);

  const conferences = [
    "Tất cả",
    "Hội nghị Công nghệ 2024",
    "Workshop AI & Machine Learning",
    "Seminar Khởi nghiệp",
    "Hội thảo Y tế",
  ];

  // Fetch attendees from API
  const fetchAttendees = async () => {
    console.log('fetchAttendees called with:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      hasAttendeesPermission
    });
    
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated || !user) {
        console.log('fetchAttendees: Not authenticated or no user');
        setError("Bạn cần đăng nhập để truy cập tính năng này. Vui lòng đăng nhập và thử lại.");
        setLoading(false);
        return;
      }

      // Check permissions (already calculated above)
      if (!hasAttendeesPermission) {
        setError("Bạn không có quyền truy cập tính năng này. Cần quyền 'attendees.read', 'attendees.write', hoặc 'attendees.manage'. Vui lòng liên hệ quản trị viên để được cấp quyền.");
        setLoading(false);
        return;
      }
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        filters: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          conference: conferenceFilter !== "all" ? conferenceFilter : undefined,
        }
      };
      
      console.log("Fetching attendees with params:", params);
      const response = await apiClient.getAttendees(params);
      console.log("Attendees response:", response);
      
      if (response && response.data) {
        console.log("Setting attendees data:", response.data);
        setAttendees(response.data);
        setTotalCount(response.meta?.total || response.data.length);
        setTotalPages(response.meta?.totalPages || Math.ceil(response.data.length / itemsPerPage));
      } else {
        console.log("No data in response, setting empty array");
        setAttendees([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (err: any) {
      console.error('fetchAttendees error:', err);
      const errorMessage = err.message || "Không thể tải danh sách người tham dự";
      console.log('Error message:', errorMessage);
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('quyền truy cập')) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
        showError("Phiên hết hạn", "Vui lòng đăng nhập lại để tiếp tục sử dụng tính năng này.");
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('Insufficient permissions')) {
        setError("Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ quản trị viên để được cấp quyền 'attendees.write' hoặc kiểm tra cấu hình backend.");
        showError("Không có quyền", "Bạn cần quyền 'attendees.write' để truy cập tính năng này. Vui lòng liên hệ quản trị viên hoặc kiểm tra cấu hình backend.");
      } else {
        setError(errorMessage);
        showError("Lỗi", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load attendees on component mount and when filters change
  useEffect(() => {
    console.log('useEffect for fetchAttendees triggered:', {
      authLoading,
      isAuthenticated,
      currentPage,
      searchTerm,
      statusFilter,
      conferenceFilter
    });
    
    if (!authLoading && isAuthenticated && hasAttendeesPermission) {
      console.log('Calling fetchAttendees from useEffect');
      fetchAttendees();
    } else {
      console.log('Not calling fetchAttendees:', { authLoading, isAuthenticated, hasAttendeesPermission });
    }
  }, [currentPage, searchTerm, statusFilter, conferenceFilter, authLoading, isAuthenticated, hasAttendeesPermission]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchAttendees();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredAttendees = attendees;
  const paginatedAttendees = attendees;
  
  // Debug attendees state
  console.log('Attendees state:', {
    attendeesLength: attendees.length,
    attendees: attendees.slice(0, 2), // Show first 2 items
    totalCount,
    totalPages,
    currentPage
  });
  
  // Debug paginated attendees
  console.log('Paginated attendees:', {
    paginatedAttendeesLength: paginatedAttendees.length,
    paginatedAttendees: paginatedAttendees.slice(0, 2), // Show first 2 items
    willShowEmpty: paginatedAttendees.length === 0
  });

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddAttendee = async () => {
    if (!newAttendee.name || !newAttendee.email) {
      showError("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.createAttendee(newAttendee as CreateAttendeeRequest);
      showSuccess("Thành công", "Thêm người tham dự thành công");
      setIsDialogOpen(false);
      setNewAttendee({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        dietary: "",
        specialNeeds: "",
      });
      // Refresh the list
      fetchAttendees();
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể thêm người tham dự");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttendee = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người tham dự này?")) {
      return;
    }

    try {
      await apiClient.deleteAttendee(id);
      showSuccess("Thành công", "Xóa người tham dự thành công");
      fetchAttendees();
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể xóa người tham dự");
    }
  };

  const handleUpdateAttendee = async (id: number, data: Partial<CreateAttendeeRequest>) => {
    try {
      await apiClient.updateAttendee(id, data);
      showSuccess("Thành công", "Cập nhật thông tin thành công");
      fetchAttendees();
    } catch (err: any) {
      showError("Lỗi", err.message || "Không thể cập nhật thông tin");
    }
  };

  const handleExportAttendees = () => {
    try {
      const csvContent = [
        ["Tên", "Email", "Số điện thoại", "Công ty", "Chức vụ", "Hội nghị", "Ngày đăng ký", "Trạng thái"],
        ...attendees.map(attendee => [
          attendee.name || "Không có tên",
          attendee.email || "Không có email",
          attendee.phone || "",
          attendee.company || "",
          attendee.position || "",
          attendee.conferenceName || "Chưa đăng ký",
          attendee.registrationDate || (attendee.createdAt ? new Date(attendee.createdAt).toLocaleDateString() : "Không có ngày"),
          statusLabels[attendee.registrationStatus || "registered"]
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `danh-sach-nguoi-tham-du-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Thành công", "Xuất danh sách thành công");
    } catch (err: any) {
      showError("Lỗi", "Không thể xuất danh sách");
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Quản lý người tham dự</h1>
            <p className="text-muted-foreground">Quản lý danh sách và thông tin người tham dự hội thảo</p>
          </div>
        </div>
        
        <AuthErrorHandler 
          error="Bạn cần đăng nhập để truy cập tính năng này"
          onLogin={() => window.location.href = '/login'}
          showRetry={false}
        />
      </div>
    );
  }

  // Show error if user doesn't have permission (already calculated above)
  if (!hasAttendeesPermission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Quản lý người tham dự</h1>
            <p className="text-muted-foreground">Quản lý danh sách và thông tin người tham dự hội thảo</p>
          </div>
        </div>
        
        <AuthErrorHandler 
          error="Bạn không có quyền truy cập tính năng này. Cần quyền 'attendees.read', 'attendees.write', hoặc 'attendees.manage'."
          onLogin={() => window.location.href = '/login'}
          showRetry={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">
            Quản lý người tham dự
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý danh sách người đăng ký
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người tham dự
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm người tham dự mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Họ tên"
                value={newAttendee.name}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={newAttendee.email}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, email: e.target.value })
                }
              />
              <Input
                placeholder="Số điện thoại"
                value={newAttendee.phone}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, phone: e.target.value })
                }
              />
              <Input
                placeholder="Công ty"
                value={newAttendee.company}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, company: e.target.value })
                }
              />
              <Input
                placeholder="Chức vụ"
                value={newAttendee.position}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, position: e.target.value })
                }
              />

              <Input
                placeholder="Nhu cầu ăn uống (ví dụ: Chay, Không)"
                value={newAttendee.dietary}
                onChange={(e) =>
                  setNewAttendee({ ...newAttendee, dietary: e.target.value })
                }
              />
              <Input
                placeholder="Nhu cầu đặc biệt (nếu có)"
                value={newAttendee.specialNeeds}
                onChange={(e) =>
                  setNewAttendee({
                    ...newAttendee,
                    specialNeeds: e.target.value,
                  })
                }
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button
                onClick={handleAddAttendee}
                disabled={!newAttendee.name || !newAttendee.email || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  "Thêm mới"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đăng ký</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã check-in</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.registrationStatus === "checked-in").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ check-in</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.registrationStatus === "registered").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendees.filter((a) => a.registrationStatus === "no-show").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="registered">Đã đăng ký</SelectItem>
                <SelectItem value="checked-in">Đã check-in</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="no-show">Vắng mặt</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={conferenceFilter}
              onValueChange={setConferenceFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Hội nghị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hội nghị</SelectItem>
                <SelectItem value="Hội nghị Công nghệ 2024">
                  Hội nghị Công nghệ 2024
                </SelectItem>
                <SelectItem value="Workshop AI & Machine Learning">
                  Workshop AI & ML
                </SelectItem>
                <SelectItem value="Seminar Khởi nghiệp">
                  Seminar Khởi nghiệp
                </SelectItem>
                <SelectItem value="Hội thảo Y tế">Hội thảo Y tế</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportAttendees} disabled={loading || attendees.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Xuất danh sách
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người tham dự</CardTitle>
          <CardDescription>
            {loading ? "Đang tải..." : `Hiển thị ${paginatedAttendees.length} trong tổng số ${totalCount} người tham dự`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-600">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAttendees}
                className="ml-auto"
              >
                Thử lại
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Đang tải danh sách...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người tham dự</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Công ty</TableHead>
                    <TableHead>Hội nghị</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    console.log('TableBody render check:', {
                      paginatedAttendeesLength: paginatedAttendees.length,
                      willShowEmpty: paginatedAttendees.length === 0,
                      paginatedAttendees: paginatedAttendees.slice(0, 2)
                    });
                    return paginatedAttendees.length === 0;
                  })() ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">Không có người tham dự nào</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAttendees.map((attendee, index) => {
                      const attendeeData = attendee as any; // Type assertion for backend fields
                      console.log(`Rendering attendee ${index}:`, {
                        id: attendeeData.id || attendeeData.ID,
                        name: attendeeData.name || attendeeData.NAME,
                        email: attendeeData.email || attendeeData.EMAIL,
                        fullAttendee: attendeeData
                      });
                      return (
                      <TableRow key={attendeeData.id || attendeeData.ID}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={attendeeData.avatarUrl || attendeeData.AVATAR_URL || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {getInitials(attendeeData.name || attendeeData.NAME)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{attendeeData.name || attendeeData.NAME || 'Không có tên'}</div>
                              <div className="text-sm text-muted-foreground">
                                {attendeeData.position || attendeeData.POSITION || 'Không có chức vụ'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{attendeeData.email || attendeeData.EMAIL || 'Không có email'}</div>
                            <div className="text-sm text-muted-foreground">
                              {attendeeData.phone || attendeeData.PHONE || 'Không có số điện thoại'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{attendeeData.company || attendeeData.COMPANY || 'Không có công ty'}</TableCell>
                        <TableCell>
                          <div className="max-w-48 truncate">
                            {attendeeData.conferenceName || attendeeData.CONFERENCE_NAME || "Chưa đăng ký hội nghị"}
                          </div>
                        </TableCell>
                        <TableCell>{attendeeData.registrationDate || (attendeeData.createdAt || attendeeData.CREATED_AT ? new Date(attendeeData.createdAt || attendeeData.CREATED_AT).toLocaleDateString() : "Không có ngày")}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[(attendeeData.registrationStatus || attendeeData.STATUS || "registered") as keyof typeof statusColors]}>
                            {statusLabels[(attendeeData.registrationStatus || attendeeData.STATUS || "registered") as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              {(attendeeData.registrationStatus || attendeeData.STATUS) === "registered" && (
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Check-in thủ công
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteAttendee(attendeeData.id || attendeeData.ID)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} trong {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
