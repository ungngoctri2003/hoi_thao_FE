"use client";

import { useState, useEffect, useMemo } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useAttendeeConferences } from "@/hooks/use-attendee-conferences";
import { AttendeeDialog } from "@/components/attendees/attendee-dialog";
import { DeleteAttendeeDialog } from "@/components/attendees/delete-attendee-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Star,
  Heart,
  Share2,
  MoreVertical,
  QrCode,
  ExternalLink,
  Copy,
  Settings,
  Bell,
  Award,
  Trophy,
  Medal,
  Crown
} from "lucide-react";

// Using the API types instead of local interface

export default function AttendeesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterConference, setFilterConference] = useState<string>("all");
  const [filterCheckinStatus, setFilterCheckinStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('list');
  const [sortBy, setSortBy] = useState<string>("name");
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showAttendeeDialog, setShowAttendeeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<any>(null);

  // State for all conferences
  const [allConferences, setAllConferences] = useState<any[]>([]);
  const [conferencesLoading, setConferencesLoading] = useState(false);

  // Use the hook to fetch attendees with their conferences
  const {
    attendeesWithConferences,
    isLoading,
    error,
    pagination,
    refetch
  } = useAttendeeConferences({
    page: currentPage,
    limit: pageSize,
    filters: {
      name: searchTerm || undefined,
      gender: filterGender !== "all" ? filterGender : undefined,
    },
    search: searchTerm || undefined,
    autoFetch: true
  });

  // Extract attendees and conferences from the combined data
  const attendees = attendeesWithConferences.map(item => ({
    ...item,
    // Remove conferences and registrations from the base attendee object
    conferences: undefined,
    registrations: undefined
  }));

  // Fetch all conferences from database
  useEffect(() => {
    const fetchAllConferences = async () => {
      try {
        setConferencesLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/conferences`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllConferences(data.data || []);
          console.log('🏛️ Fetched all conferences:', data.data?.length || 0);
        } else {
          console.error('Failed to fetch conferences:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching conferences:', error);
      } finally {
        setConferencesLoading(false);
      }
    };

    fetchAllConferences();
  }, []);

  // Filter attendees based on current filters - memoized to prevent unnecessary re-renders
  const filteredAttendees = useMemo(() => {
    console.log('🔍 Filtering attendees:', { 
      total: attendees.length, 
      searchTerm, 
      filterGender, 
      filterConference,
      sortBy 
    });
    
    const filtered = attendees.filter(attendee => {
      const matchesSearch = searchTerm === "" || 
                           attendee.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attendee.EMAIL.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (attendee.COMPANY && attendee.COMPANY.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGender = filterGender === "all" || attendee.GENDER === filterGender;
      
      // Filter by conference
      let matchesConference = true;
      if (filterConference !== "all") {
        const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
        const attendeeConferences = attendeeWithConferences?.conferences || [];
        const conferenceId = parseInt(filterConference);
        matchesConference = attendeeConferences.some(conf => conf.ID === conferenceId);
      }
      
      // Filter by checkin status
      let matchesCheckinStatus = true;
      if (filterCheckinStatus !== "all") {
        const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
        const overallStatus = attendeeWithConferences?.overallStatus || 'registered';
        
        console.log('🔍 Filtering by checkin status:', {
          attendeeId: attendee.ID,
          attendeeName: attendee.NAME,
          overallStatus,
          filterCheckinStatus,
          matches: overallStatus === filterCheckinStatus
        });
        
        matchesCheckinStatus = overallStatus === filterCheckinStatus;
      }
      
      return matchesSearch && matchesGender && matchesConference && matchesCheckinStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.NAME.localeCompare(b.NAME);
        case "company":
          return (a.COMPANY || "").localeCompare(b.COMPANY || "");
        case "createdAt":
          return new Date(b.CREATED_AT).getTime() - new Date(a.CREATED_AT).getTime();
        case "email":
          return a.EMAIL.localeCompare(b.EMAIL);
        default:
          return 0;
      }
    });
    
    console.log('🔍 Filtered result:', filtered.length);
    return filtered;
  }, [attendees, attendeesWithConferences, searchTerm, filterGender, filterConference, filterCheckinStatus, sortBy]);

  // Debug logs
  console.log('📊 Attendees data:', { 
    attendeesCount: attendees.length, 
    conferencesCount: allConferences.length,
    isLoading,
    error,
    pagination 
  });
  
  console.log('📊 Conferences data:', allConferences);
  console.log('📊 Filtered attendees:', filteredAttendees.length);
  console.log('📊 Conferences loading:', conferencesLoading);
  
  // Check if data is loading
  if (isLoading) {
    console.log('⏳ Still loading...');
  }
  
  if (error) {
    console.log('❌ Error:', error);
  }
  
  // Debug: Check if we have data but it's not showing
  if (attendees.length > 0 && filteredAttendees.length === 0) {
    console.log('⚠️ Data exists but filtered out:', { 
      attendees: attendees.length, 
      filtered: filteredAttendees.length,
      searchTerm,
      filterGender,
      filterConference,
      filterCheckinStatus
    });
  }
  
  // Debug: Check if we have conferences but they're not showing
  if (allConferences.length > 0) {
    console.log('🏛️ Conferences available:', allConferences.map(c => c.NAME));
  } else if (!conferencesLoading) {
    console.log('🏛️ No conferences available');
  } else {
    console.log('🏛️ Loading conferences...');
  }
  
  // Debug: Check if we have attendees but they're not showing
  if (attendees.length > 0) {
    console.log('👥 Attendees available:', attendees.map(a => a.NAME));
  } else {
    console.log('👥 No attendees available');
  }

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return null;
    const genderConfig = {
      male: { label: "Nam", color: "bg-blue-100 text-blue-800" },
      female: { label: "Nữ", color: "bg-pink-100 text-pink-800" },
      other: { label: "Khác", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = genderConfig[gender as keyof typeof genderConfig] || genderConfig.other;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getRegistrationStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const statusConfig = {
      "not-registered": { label: "Chưa đăng ký", color: "bg-gray-100 text-gray-600" },
      registered: { label: "Đã đăng ký", color: "bg-blue-100 text-blue-800" },
      "checked-in": { label: "Đã check-in", color: "bg-green-100 text-green-800" },
      "checked-out": { label: "Đã check-out", color: "bg-orange-100 text-orange-800" },
      cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
      "no-show": { label: "Không tham dự", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.registered;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getCheckinStatusBadge = (status: 'not-registered' | 'registered' | 'checked-in' | 'checked-out' | 'no-show' | 'cancelled') => {
    const statusConfig = {
      "not-registered": { label: "Chưa đăng ký", color: "bg-gray-100 text-gray-600", icon: "⭕" },
      registered: { label: "Đã đăng ký", color: "bg-blue-100 text-blue-800", icon: "📝" },
      "checked-in": { label: "Đã check-in", color: "bg-green-100 text-green-800", icon: "✅" },
      "checked-out": { label: "Đã check-out", color: "bg-orange-100 text-orange-800", icon: "🚪" },
      cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: "❌" },
      "no-show": { label: "Không tham dự", color: "bg-gray-100 text-gray-800", icon: "⏰" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  };

  const toggleAttendeeSelection = (attendeeId: number) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const selectAllAttendees = () => {
    setSelectedAttendees(filteredAttendees.map(a => a.ID));
  };

  const clearSelection = () => {
    setSelectedAttendees([]);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle CRUD operations
  const handleCreateAttendee = async (data: any) => {
    try {
      console.log('Creating attendee:', data);
      
      // Call API to create attendee
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/attendees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create attendee');
      }

      const result = await response.json();
      console.log('Attendee created successfully:', result);
      
      // Refresh data
      await refetch();
      setShowAttendeeDialog(false);
    } catch (error) {
      console.error('Error creating attendee:', error);
    }
  };

  const handleUpdateAttendee = async (data: any) => {
    if (!selectedAttendee?.ID) return;
    try {
      console.log('Updating attendee:', selectedAttendee.ID, data);
      
      // Call API to update attendee
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/attendees/${selectedAttendee.ID}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update attendee');
      }

      const result = await response.json();
      console.log('Attendee updated successfully:', result);
      
      // Refresh data
      await refetch();
      setShowAttendeeDialog(false);
    } catch (error) {
      console.error('Error updating attendee:', error);
    }
  };

  const handleDeleteAttendee = (attendee: any) => {
    setAttendeeToDelete(attendee);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!attendeeToDelete) return;

    try {
      console.log('Deleting attendee:', attendeeToDelete.ID);
      
      // Call API to delete attendee
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/attendees/${attendeeToDelete.ID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete attendee');
      }

      console.log('Attendee deleted successfully');
      
      // Refresh data
      await refetch();
      
      // Close dialog
      setShowDeleteDialog(false);
      setAttendeeToDelete(null);
    } catch (error) {
      console.error('Error deleting attendee:', error);
    }
  };

  // Handle dialog actions
  const handleViewAttendee = (attendee: any) => {
    // Find the full attendee data with conferences and registrations
    const fullAttendeeData = attendeesWithConferences.find(a => a.ID === attendee.ID);
    setSelectedAttendee(fullAttendeeData || attendee);
    setDialogMode('view');
    setShowAttendeeDialog(true);
  };

  const handleEditAttendee = (attendee: any) => {
    // Find the full attendee data with conferences and registrations
    const fullAttendeeData = attendeesWithConferences.find(a => a.ID === attendee.ID);
    setSelectedAttendee(fullAttendeeData || attendee);
    setDialogMode('edit');
    setShowAttendeeDialog(true);
  };

  const handleCreateNewAttendee = () => {
    setSelectedAttendee(null);
    setDialogMode('create');
    setShowAttendeeDialog(true);
  };

  const handleSaveAttendee = async (data: any) => {
    if (dialogMode === 'create') {
      await handleCreateAttendee(data);
    } else if (dialogMode === 'edit') {
      await handleUpdateAttendee(data);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredAttendees.map(attendee => {
        const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
        return {
          'ID': attendee.ID,
          'Họ và tên': attendee.NAME,
          'Email': attendee.EMAIL,
          'Số điện thoại': attendee.PHONE || '',
          'Công ty': attendee.COMPANY || '',
          'Chức vụ': attendee.POSITION || '',
          'Giới tính': attendee.GENDER || '',
          'Ngày sinh': attendee.DATE_OF_BIRTH ? new Date(attendee.DATE_OF_BIRTH).toLocaleDateString('vi-VN') : '',
          'Trạng thái': attendeeWithConferences?.overallStatus === 'not-registered' ? 'Chưa đăng ký' :
                       attendeeWithConferences?.overallStatus === 'registered' ? 'Đã đăng ký' :
                       attendeeWithConferences?.overallStatus === 'checked-in' ? 'Đã check-in' :
                       attendeeWithConferences?.overallStatus === 'checked-out' ? 'Đã check-out' :
                       attendeeWithConferences?.overallStatus === 'cancelled' ? 'Đã hủy' :
                       attendeeWithConferences?.overallStatus === 'no-show' ? 'Không tham dự' : 'Chưa xác định',
          'Số hội nghị': attendeeWithConferences?.conferences.length || 0,
          'Hội nghị': attendeeWithConferences?.conferences.map(c => c.NAME).join(', ') || 'Chưa có',
          'Lần check-in cuối': attendeeWithConferences?.lastCheckinTime ? 
                               new Date(attendeeWithConferences.lastCheckinTime).toLocaleString('vi-VN') : '',
          'Lần check-out cuối': attendeeWithConferences?.lastCheckoutTime ? 
                                new Date(attendeeWithConferences.lastCheckoutTime).toLocaleString('vi-VN') : '',
          'Ngày tạo': new Date(attendee.CREATED_AT).toLocaleString('vi-VN'),
          'Yêu cầu ăn uống': attendee.DIETARY || '',
          'Nhu cầu đặc biệt': attendee.SPECIAL_NEEDS || ''
        };
      });

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_tham_du_vien_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Bulk actions
  const handleBulkEmail = () => {
    if (selectedAttendees.length === 0) {
      return;
    }

    const selectedAttendeesData = filteredAttendees.filter(attendee => 
      selectedAttendees.includes(attendee.ID)
    );

    const emailList = selectedAttendeesData.map(attendee => attendee.EMAIL).join(', ');
    
    // Open default email client
    const subject = encodeURIComponent('Thông báo từ hệ thống quản lý hội nghị');
    const body = encodeURIComponent('Xin chào,\n\nĐây là thông báo từ hệ thống quản lý hội nghị.\n\nTrân trọng!');
    window.open(`mailto:${emailList}?subject=${subject}&body=${body}`);
  };

  const handleBulkExport = () => {
    if (selectedAttendees.length === 0) {
      return;
    }

    try {
      const selectedAttendeesData = filteredAttendees.filter(attendee => 
        selectedAttendees.includes(attendee.ID)
      );

      // Prepare data for export
      const exportData = selectedAttendeesData.map(attendee => {
        const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
        return {
          'ID': attendee.ID,
          'Họ và tên': attendee.NAME,
          'Email': attendee.EMAIL,
          'Số điện thoại': attendee.PHONE || '',
          'Công ty': attendee.COMPANY || '',
          'Chức vụ': attendee.POSITION || '',
          'Giới tính': attendee.GENDER || '',
          'Trạng thái': attendeeWithConferences?.overallStatus === 'not-registered' ? 'Chưa đăng ký' :
                       attendeeWithConferences?.overallStatus === 'registered' ? 'Đã đăng ký' :
                       attendeeWithConferences?.overallStatus === 'checked-in' ? 'Đã check-in' :
                       attendeeWithConferences?.overallStatus === 'checked-out' ? 'Đã check-out' :
                       attendeeWithConferences?.overallStatus === 'cancelled' ? 'Đã hủy' :
                       attendeeWithConferences?.overallStatus === 'no-show' ? 'Không tham dự' : 'Chưa xác định',
          'Số hội nghị': attendeeWithConferences?.conferences.length || 0,
          'Hội nghị': attendeeWithConferences?.conferences.map(c => c.NAME).join(', ') || 'Chưa có'
        };
      });

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_da_chon_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting selected data:', error);
    }
  };

  const handleBulkEdit = () => {
    if (selectedAttendees.length === 0) {
      return;
    }

    if (selectedAttendees.length > 10) {
      return;
    }
  };

  // Check if user is admin for global attendees management
  const isAdmin = user?.role === 'admin';
  const canManage = isAdmin || hasConferencePermission("attendees.manage");
  const canView = isAdmin || hasConferencePermission("attendees.view");

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
                </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;

  // Only admin can access global attendees management
  if (!isAdmin) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Chỉ quản trị viên mới có thể truy cập quản lý người tham dự toàn bộ hội nghị
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <ConferencePermissionGuard 
        requiredPermissions={["attendees.view"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Quản lý người tham dự hội nghị</h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi thông tin chi tiết của người tham dự từ tất cả hội nghị
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : viewMode === 'grid' ? 'cards' : 'list')}>
              {viewMode === 'list' && <Calendar className="h-4 w-4 mr-2" />}
              {viewMode === 'grid' && <Eye className="h-4 w-4 mr-2" />}
              {viewMode === 'cards' && <Users className="h-4 w-4 mr-2" />}
              {viewMode === 'list' ? 'Danh sách' : viewMode === 'grid' ? 'Lưới' : 'Thẻ'}
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Xuất Excel
            </Button>
            {canManage && (
              <Button onClick={handleCreateNewAttendee}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tham dự viên
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng tham dự viên</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                  <p className="text-xs text-muted-foreground">Tất cả hội nghị</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Đã đăng ký</p>
                  <p className="text-2xl font-bold">{filteredAttendees.length}</p>
                  <p className="text-xs text-muted-foreground">Kết quả hiện tại</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Hội nghị</p>
                  <p className="text-2xl font-bold">
                    {conferencesLoading ? "..." : allConferences.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {conferencesLoading ? "Đang tải..." : "Tổng số hội nghị"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Đã lọc</p>
                  <p className="text-2xl font-bold">{filteredAttendees.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {filterConference !== "all" ? `Hội nghị: ${allConferences.find(c => c.ID.toString() === filterConference)?.NAME || "Không xác định"}` : "Kết quả hiện tại"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Bộ lọc nâng cao</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Giới tính</label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hội nghị</label>
                  <select
                    value={filterConference}
                    onChange={(e) => setFilterConference(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={conferencesLoading}
                  >
                    <option value="all">
                      {conferencesLoading ? "Đang tải hội nghị..." : "Tất cả hội nghị"}
                    </option>
                    {allConferences.map((conference) => (
                      <option key={conference.ID} value={conference.ID.toString()}>
                        {conference.NAME}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                  <select
                    value={filterCheckinStatus}
                    onChange={(e) => setFilterCheckinStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="not-registered">⭕ Chưa đăng ký</option>
                    <option value="registered">📝 Đã đăng ký</option>
                    <option value="checked-in">✅ Đã check-in</option>
                    <option value="checked-out">🚪 Đã check-out</option>
                    <option value="cancelled">❌ Đã hủy</option>
                    <option value="no-show">⏰ Không tham dự</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Sắp xếp theo</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="name">Tên</option>
                    <option value="company">Công ty</option>
                    <option value="createdAt">Ngày tạo</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Số lượng mỗi trang</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterGender("all");
                    setFilterConference("all");
                    setFilterCheckinStatus("all");
                    setSearchTerm("");
                    setSortBy("name");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedAttendees.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    Đã chọn {selectedAttendees.length} tham dự viên
                  </span>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Bỏ chọn tất cả
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handleBulkEmail}>
                    <Mail className="h-4 w-4 mr-1" />
                    Gửi email
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkExport}>
                    <Download className="h-4 w-4 mr-1" />
                    Xuất danh sách
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    Chỉnh sửa hàng loạt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, công ty, kỹ năng, sở thích..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Tất cả giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                <Button variant="outline" onClick={() => setShowBulkActions(!showBulkActions)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Hành động hàng loạt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees Display */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách tham dự viên ({filteredAttendees.length})</CardTitle>
                  <CardDescription>
                    Danh sách chi tiết tất cả người tham dự hội nghị
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllAttendees}>
                    Chọn tất cả
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button onClick={refetch} variant="outline">
                      Thử lại
                    </Button>
                  </div>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Không tìm thấy tham dự viên nào</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tổng attendees: {attendees.length}, Conferences: {conferencesLoading ? "Đang tải..." : allConferences.length}
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                          onChange={selectedAttendees.length === filteredAttendees.length ? clearSelection : selectAllAttendees}
                        />
                      </TableHead>
                      <TableHead>Thông tin</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Công ty</TableHead>
                      <TableHead>Hội nghị</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      {canManage && <TableHead>Hành động</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.map((attendee) => {
                      // Find the attendee's conferences from the original data
                      const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
                      const attendeeConferences = attendeeWithConferences?.conferences || [];
                      
                      console.log('🎯 Rendering attendee:', attendee.NAME, 'Conferences:', attendeeConferences.length);
                      return (
                      <TableRow key={attendee.ID} className="hover:bg-gray-50">
                        <TableCell>
                          <input 
                            type="checkbox" 
                            checked={selectedAttendees.includes(attendee.ID)}
                            onChange={() => toggleAttendeeSelection(attendee.ID)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {attendee.AVATAR_URL ? (
                                <img 
                                  src={attendee.AVATAR_URL} 
                                  alt={attendee.NAME}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{attendee.NAME}</p>
                              <p className="text-sm text-muted-foreground">{attendee.POSITION || "Chưa cập nhật"}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                {getGenderBadge(attendee.GENDER)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{attendee.EMAIL}</span>
                            </div>
                            {attendee.PHONE && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{attendee.PHONE}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{attendee.COMPANY || "Chưa cập nhật"}</p>
                            <p className="text-sm text-muted-foreground">{attendee.POSITION || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate">
                            <p className="text-sm font-medium">
                              {attendeeConferences.length > 0 ? attendeeConferences[0].NAME : "Chưa có hội nghị"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attendeeConferences.length > 1 ? `+${attendeeConferences.length - 1} hội nghị khác` : ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getCheckinStatusBadge(attendeeWithConferences?.overallStatus || 'registered')}
                            {attendeeWithConferences?.lastCheckinTime && (
                              <p className="text-xs text-muted-foreground">
                                Check-in: {new Date(attendeeWithConferences.lastCheckinTime).toLocaleString('vi-VN')}
                              </p>
                            )}
                            {attendeeWithConferences?.lastCheckoutTime && (
                              <p className="text-xs text-muted-foreground">
                                Check-out: {new Date(attendeeWithConferences.lastCheckoutTime).toLocaleString('vi-VN')}
                              </p>
                            )}
                            {attendeeWithConferences?.registrations && attendeeWithConferences.registrations.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {attendeeWithConferences.registrations.length} đăng ký
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getGenderBadge(attendee.GENDER)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(attendee.CREATED_AT).toLocaleDateString('vi-VN')}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(attendee.CREATED_AT).toLocaleTimeString('vi-VN')}
                            </p>
                          </div>
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={() => handleViewAttendee(attendee)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditAttendee(attendee)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteAttendee(attendee)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && !error && attendees.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, pagination.total)} trong tổng số {pagination.total} kết quả
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAttendees.map((attendee) => {
              // Find the attendee's conferences from the original data
              const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
              const attendeeConferences = attendeeWithConferences?.conferences || [];
              
              console.log('🎯 Grid view - Rendering attendee:', attendee.NAME, 'Conferences:', attendeeConferences.length);
              return (
              <Card key={attendee.ID} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {attendee.AVATAR_URL ? (
                        <img 
                          src={attendee.AVATAR_URL} 
                          alt={attendee.NAME}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{attendee.NAME}</CardTitle>
                      <CardDescription className="truncate">{attendee.POSITION || "Chưa cập nhật"}</CardDescription>
                      <div className="flex items-center space-x-1 mt-1">
                        {getGenderBadge(attendee.GENDER)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.EMAIL}</span>
                    </div>
                    {attendee.PHONE && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{attendee.PHONE}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.COMPANY || "Chưa cập nhật"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Hội nghị:</span>
                      <span className="font-medium">{attendeeConferences.length > 0 ? attendeeConferences[0].NAME : "Chưa có"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Trạng thái:</span>
                      <div className="flex items-center space-x-1">
                        {getCheckinStatusBadge(attendeeWithConferences?.overallStatus || 'registered')}
                      </div>
                    </div>
                    {attendeeWithConferences?.lastCheckinTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Check-in:</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(attendeeWithConferences.lastCheckinTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {attendeeWithConferences?.lastCheckoutTime && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Check-out:</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(attendeeWithConferences.lastCheckoutTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span>Ngày tạo:</span>
                      <span className="font-medium">{new Date(attendee.CREATED_AT).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewAttendee(attendee)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    {canManage && (
                      <Button size="sm" variant="outline" onClick={() => handleEditAttendee(attendee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAttendees.map((attendee) => {
              // Find the attendee's conferences from the original data
              const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendee.ID);
              const attendeeConferences = attendeeWithConferences?.conferences || [];
              
              console.log('🎯 Cards view - Rendering attendee:', attendee.NAME, 'Conferences:', attendeeConferences.length);
              return (
              <Card key={attendee.ID} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {attendee.AVATAR_URL ? (
                          <img 
                            src={attendee.AVATAR_URL} 
                            alt={attendee.NAME}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="h-8 w-8 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{attendee.NAME}</CardTitle>
                        <CardDescription className="text-base">{attendee.POSITION || "Chưa cập nhật"}</CardDescription>
                        <p className="text-sm text-muted-foreground">{attendee.COMPANY || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getGenderBadge(attendee.GENDER)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.EMAIL}</span>
                    </div>
                    {attendee.PHONE && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{attendee.PHONE}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{attendee.COMPANY || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{attendeeConferences.length > 0 ? attendeeConferences[0].NAME : "Chưa có hội nghị"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      {getCheckinStatusBadge(attendeeWithConferences?.overallStatus || 'registered')}
                    </div>
                    {attendeeWithConferences?.lastCheckinTime && (
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Check-in:</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(attendeeWithConferences.lastCheckinTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    {attendeeWithConferences?.lastCheckoutTime && (
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Check-out:</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(attendeeWithConferences.lastCheckoutTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(attendee.CREATED_AT).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  {attendee.DIETARY && (
                    <div>
                      <p className="text-sm font-medium mb-2">Yêu cầu ăn uống:</p>
                      <p className="text-sm text-muted-foreground">{attendee.DIETARY}</p>
                    </div>
                  )}

                  {attendee.SPECIAL_NEEDS && (
                    <div>
                      <p className="text-sm font-medium mb-2">Nhu cầu đặc biệt:</p>
                      <p className="text-sm text-muted-foreground">{attendee.SPECIAL_NEEDS}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{attendee.ID}</p>
                      <p className="text-xs text-muted-foreground">ID</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {attendee.GENDER || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">Giới tính</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => handleViewAttendee(attendee)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Xem chi tiết
                    </Button>
                    {canManage && (
                      <Button size="sm" variant="outline" onClick={() => handleEditAttendee(attendee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}

        {/* Attendee Dialog */}
        <AttendeeDialog
          attendee={selectedAttendee}
          conferences={allConferences}
          isOpen={showAttendeeDialog}
          onClose={() => setShowAttendeeDialog(false)}
          onSave={handleSaveAttendee}
          onRefresh={refetch}
          mode={dialogMode}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteAttendeeDialog
          attendee={attendeeToDelete}
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setAttendeeToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}