"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Calendar, 
  Users, 
  MapPin,
  Settings,
  UserPlus,
  Shield,
  FileText,
  Building,
  Loader2,
  X,
  Info,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { apiClient, ConferenceInfo, User } from "@/lib/api";

interface Conference extends ConferenceInfo {
  registered?: number;
  capacity?: number;
  category?: string;
  organizer?: string;
  permissions?: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
  assignedUsers?: Array<{
    userId: string;
    userName: string;
    userRole: string;
    permissions: string[];
  }>;
}

// Helper function to convert API data to Conference format
const convertApiConferenceToConference = (apiConference: ConferenceInfo): Conference => {
  return {
    ...apiConference,
    registered: 0, // This will be fetched separately if needed
    assignedUsers: [] // This will be fetched separately
  };
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const statusLabels: Record<string, string> = {
  draft: "Bản nháp",
  active: "Đang diễn ra",
  completed: "Đã kết thúc",
};

// Define available permissions for conference management
const CONFERENCE_PERMISSIONS = [
  { key: "conferences.view", label: "Xem hội nghị" },
  { key: "conferences.update", label: "Cập nhật hội nghị" },
  { key: "attendees.view", label: "Xem người tham dự" },
  { key: "attendees.manage", label: "Quản lý người tham dự" },
  { key: "checkin.manage", label: "Quản lý check-in" },
  { key: "sessions.view", label: "Xem phiên" },
  { key: "sessions.manage", label: "Quản lý phiên" },
  { key: "analytics.view", label: "Xem phân tích" }
];

// Format date to Vietnamese format (DD/MM/YYYY)
const formatDateToVietnamese = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function ConferenceManagementSystem() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [conferenceToDelete, setConferenceToDelete] = useState<Conference | null>(null);
  const [viewingConference, setViewingConference] = useState<Conference | null>(null);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    capacity: 0,
    category: "",
    organizer: "",
    status: "draft"
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});

  const itemsPerPage = 10;
  const categories = ["Tất cả", "Công nghệ", "Giáo dục", "Kinh doanh", "Y tế"];

  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  // Check permissions using the permission system
  // Admin has all permissions, staff/attendees need specific permissions
  const canCreate = isAdmin || hasPermission('conferences.create');
  const canEdit = isAdmin || hasPermission('conferences.update') || hasPermission('conferences.edit');
  const canDelete = isAdmin || hasPermission('conferences.delete');
  const canManage = isAdmin || hasPermission('conferences.update') || hasPermission('conferences.manage');

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load conferences
        const conferencesResponse = await apiClient.getConferences({
          page: 1,
          limit: 1000 // Load all conferences for now
        });
        
        const convertedConferences = conferencesResponse.data.map(convertApiConferenceToConference);
        
        // Load assigned users for each conference
        const conferencesWithAssignments = await Promise.all(
          convertedConferences.map(async (conference) => {
            try {
              const assignmentsResponse = await apiClient.getConferenceAssignments(Number(conference.id));
              const assignedUsers = assignmentsResponse.data
                .map(assignment => ({
                  userId: assignment.userId.toString(),
                  userName: assignment.userName || 'Unknown User',
                  userRole: 'staff', // Default role for assignments
                  permissions: Object.keys(assignment.permissions).filter(key => assignment.permissions[key])
                }));
              
              return {
                ...conference,
                assignedUsers
              };
            } catch (error) {
              console.error(`Failed to load assignments for conference ${conference.id}:`, error);
              return {
                ...conference,
                assignedUsers: []
              };
            }
          })
        );
        
        setConferences(conferencesWithAssignments);
        
        // Load users (exclude admin and attendee, only show staff for permission assignment)
        const usersResponse = await apiClient.getUsers(1, 1000);
        const filteredUsers = usersResponse.data.filter(user => user.role === 'staff');
        setUsers(filteredUsers);
        
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối backend.');
        // Set empty data to prevent UI from breaking
        setConferences([]);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    try {
      const conferencesResponse = await apiClient.getConferences({
        page: 1,
        limit: 1000
      });
      
      const convertedConferences = conferencesResponse.data.map(convertApiConferenceToConference);
      
      // Load assigned users for each conference
      const conferencesWithAssignments = await Promise.all(
        convertedConferences.map(async (conference) => {
          try {
            const assignmentsResponse = await apiClient.getConferenceAssignments(Number(conference.id));
            const assignedUsers = assignmentsResponse.data
              .map(assignment => ({
                userId: assignment.userId.toString(),
                userName: assignment.userName || 'Unknown User',
                userRole: 'staff', // Default role for assignments
                permissions: Object.keys(assignment.permissions).filter(key => assignment.permissions[key])
              }));
            
            return {
              ...conference,
              assignedUsers
            };
          } catch (error) {
            console.error(`Failed to load assignments for conference ${conference.id}:`, error);
            return {
              ...conference,
              assignedUsers: []
            };
          }
        })
      );
      
      setConferences(conferencesWithAssignments);
      
      // Trigger sidebar refresh
      window.dispatchEvent(new CustomEvent('conferences-updated'));
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Không thể tải lại dữ liệu. Vui lòng kiểm tra kết nối backend.');
    }
  };

  const filteredConferences = conferences.filter((conference) => {
    const matchesSearch =
      conference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conference.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conference.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || conference.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || (conference.category || "") === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredConferences.length / itemsPerPage);
  const paginatedConferences = filteredConferences.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateConference = () => {
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      capacity: 0,
      category: "",
      organizer: "",
      status: "draft"
    });
    setSelectedUsers([]);
    setUserPermissions({});
    setIsCreateDialogOpen(true);
  };

  const handleEditConference = async (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      name: conference.name,
      description: conference.description || "",
      startDate: conference.startDate,
      endDate: conference.endDate,
      location: conference.location || "",
      capacity: conference.capacity || 0,
      category: conference.category || "",
      organizer: conference.organizer || "",
      status: conference.status || "draft"
    });
    
    // Load current assignments for this conference
    try {
      const assignments = await apiClient.getConferenceAssignments(Number(conference.id));
      
      const selectedUserIds: string[] = [];
      const userPerms: Record<string, string[]> = {};
      
      assignments.data.forEach(assignment => {
          const userId = String(assignment.userId);
          selectedUserIds.push(userId);
          
          // Convert permission object to array
          const permissions: string[] = [];
          Object.entries(assignment.permissions).forEach(([key, value]) => {
            if (value) {
              permissions.push(key);
            }
          });
          userPerms[userId] = permissions;
        });
      
      setSelectedUsers(selectedUserIds);
      setUserPermissions(userPerms);
    } catch (error) {
      console.error('Failed to load current assignments:', error);
      // Fallback to existing data
      setSelectedUsers(conference.assignedUsers?.map(u => u.userId) || []);
      setUserPermissions(
        conference.assignedUsers?.reduce((acc, u) => {
          acc[u.userId] = u.permissions;
          return acc;
        }, {} as Record<string, string[]>) || {}
      );
    }
    
    setIsEditDialogOpen(true);
  };

  const handleViewConference = (conference: Conference) => {
    setViewingConference(conference);
    setIsViewDialogOpen(true);
  };

  const handleDeleteConference = (conference: Conference) => {
    setConferenceToDelete(conference);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteConference = async () => {
    if (!conferenceToDelete) return;
    
    try {
      setIsSaving(true);
      await apiClient.deleteConference(Number(conferenceToDelete.id));
      await refreshData();
      setIsDeleteDialogOpen(false);
      setConferenceToDelete(null);
      toast.success("Hội nghị đã được xóa thành công!");
    } catch (error) {
      console.error('Failed to delete conference:', error);
      toast.error("Không thể xóa hội nghị. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleManagePermissions = async (conference: Conference) => {
    try {
      setSelectedConference(conference);
      
      // Load current assignments for this conference
      const assignments = await apiClient.getConferenceAssignments(Number(conference.id));
      
      const selectedUserIds: string[] = [];
      const userPerms: Record<string, string[]> = {};
      
      assignments.data.forEach(assignment => {
          const userId = String(assignment.userId);
          selectedUserIds.push(userId);
          
          // Convert permission object to array
          const permissions: string[] = [];
          Object.entries(assignment.permissions).forEach(([key, value]) => {
            if (value) {
              permissions.push(key);
            }
          });
          userPerms[userId] = permissions;
        });
      
      setSelectedUsers(selectedUserIds);
      setUserPermissions(userPerms);
      setIsPermissionDialogOpen(true);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // You might want to show a toast notification here
    }
  };

  const handleSaveConference = async () => {
    try {
      setIsSaving(true);
      
      // Prepare data for API
      const conferenceData = {
        NAME: formData.name,
        DESCRIPTION: formData.description,
        START_DATE: formData.startDate,
        END_DATE: formData.endDate,
        LOCATION: formData.location,
        CAPACITY: formData.capacity,
        CATEGORY: formData.category,
        ORGANIZER: formData.organizer,
        STATUS: formData.status as 'draft' | 'active' | 'completed'
      };

      let conferenceId: number;

      if (editingConference) {
        // Update existing conference
        await apiClient.updateConference(Number(editingConference.id), conferenceData);
        conferenceId = Number(editingConference.id);
        await refreshData();
        setIsEditDialogOpen(false);
      } else {
        // Create new conference
        const response = await apiClient.createConference(conferenceData);
        conferenceId = response.id; // The API returns ConferenceInfo directly
        await refreshData();
        setIsCreateDialogOpen(false);
      }

      // Save user permissions if any users are selected
      if (selectedUsers.length > 0 && conferenceId) {
        try {
          // Remove existing assignments for this conference (for edit case, exclude admin)
          if (editingConference) {
            const currentAssignments = await apiClient.getConferenceAssignments(conferenceId);
            for (const assignment of currentAssignments.data) {
              await apiClient.deleteUserConferenceAssignment(assignment.id);
            }
          }
          
          // Create new assignments
          for (const userId of selectedUsers) {
            const permissions = userPermissions[userId] || [];
            const permissionMap: Record<string, boolean> = {};
            
            // Convert array to object format
            permissions.forEach(permission => {
              permissionMap[permission] = true;
            });
            
            await apiClient.createUserConferenceAssignment({
              userId: Number(userId),
              conferenceId: conferenceId,
              permissions: permissionMap
            });
          }
          
          // Refresh data to show updated permissions
          await refreshData();
          toast.success("Phân quyền người dùng đã được lưu thành công!");
        } catch (permissionError) {
          console.error('Failed to save permissions:', permissionError);
          toast.error("Hội nghị đã được lưu nhưng có lỗi khi lưu phân quyền. Vui lòng thử lại.");
        }
      } else {
        // If no users selected, just show success message
        if (editingConference) {
          toast.success("Hội nghị đã được cập nhật thành công!");
        } else {
          toast.success("Hội nghị đã được tạo thành công!");
        }
      }
    
      setEditingConference(null);
    } catch (error) {
      console.error('Failed to save conference:', error);
      toast.error("Không thể lưu hội nghị. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedConference) return;
    
    try {
      setIsSaving(true);
      
      // Get current assignments for this conference
      const currentAssignments = await apiClient.getConferenceAssignments(Number(selectedConference.id));
      
      // Remove existing assignments
      for (const assignment of currentAssignments.data) {
        await apiClient.deleteUserConferenceAssignment(assignment.id);
      }
      
      // Create new assignments
      for (const userId of selectedUsers) {
        const permissions = userPermissions[userId] || [];
        const permissionMap: Record<string, boolean> = {};
        
        // Convert array to object format
        permissions.forEach(permission => {
          permissionMap[permission] = true;
        });
        
        await apiClient.createUserConferenceAssignment({
          userId: Number(userId),
          conferenceId: Number(selectedConference.id),
          permissions: permissionMap
        });
      }
      
      await refreshData();
      setIsPermissionDialogOpen(false);
      setSelectedConference(null);
      setSelectedUsers([]);
      setUserPermissions({});
      toast.success("Phân quyền đã được lưu thành công!");
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error("Không thể lưu phân quyền. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
      // Set default permissions for new user
      if (!userPermissions[userId] || userPermissions[userId].length === 0) {
        setUserPermissions({...userPermissions, [userId]: ["conferences.view"]});
      }
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      const newPermissions = {...userPermissions};
      delete newPermissions[userId];
      setUserPermissions(newPermissions);
    }
  };

  const handlePermissionChange = (userId: string, permission: string, checked: boolean) => {
    const currentPermissions = userPermissions[userId] || [];
    if (checked) {
      setUserPermissions({
        ...userPermissions,
        [userId]: [...currentPermissions, permission]
      });
    } else {
      setUserPermissions({
        ...userPermissions,
        [userId]: currentPermissions.filter(p => p !== permission)
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Tên hội nghị", "Mô tả", "Ngày bắt đầu", "Ngày kết thúc", "Địa điểm", "Sức chứa", "Đã đăng ký", "Trạng thái", "Danh mục", "Người tổ chức"],
      ...filteredConferences.map(conference => [
        conference.name,
        conference.description || "",
        conference.startDate,
        conference.endDate,
        conference.location || "",
        (conference.capacity || 0).toString(),
        (conference.registered || 0).toString(),
        statusLabels[conference.status] || "Unknown",
        conference.category || "",
        conference.organizer || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `conferences_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Fallback UI when no data and not loading
  if (conferences.length === 0 && !isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Quản lý hội nghị</h1>
            <p className="text-muted-foreground">Tạo, chỉnh sửa và quản lý các hội nghị</p>
          </div>
          <div className="flex space-x-2">
            {canCreate && (
              <Button onClick={handleCreateConference}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo hội nghị mới
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        <Card className="p-12">
          <div className="text-center">
            <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Chưa có hội nghị nào</h3>
            <p className="text-muted-foreground mb-6">
              {conferences.length === 0 && users.length === 0 
                ? "Không thể kết nối đến backend server. Vui lòng kiểm tra kết nối."
                : "Bắt đầu tạo hội nghị đầu tiên của bạn."
              }
            </p>
            {canCreate && (
              <Button onClick={handleCreateConference}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo hội nghị mới
              </Button>
            )}
            {conferences.length === 0 && users.length === 0 && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Quản lý hội nghị</h1>
          <p className="text-muted-foreground">Tạo, chỉnh sửa và quản lý các hội nghị</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToCSV} disabled={isSaving}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
          {canCreate && (
            <Button onClick={handleCreateConference} disabled={isSaving}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo hội nghị mới
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hội nghị</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conferences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conferences.filter((c) => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người đăng ký</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conferences.reduce((sum, c) => sum + (c.registered || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (conferences.reduce((sum, c) => sum + (c.registered || 0), 0) /
                  conferences.reduce((sum, c) => sum + (c.capacity || 1), 0)) *
                  100,
              )}
              %
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
                  placeholder="Tìm kiếm hội nghị..."
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
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="active">Đang diễn ra</SelectItem>
                <SelectItem value="completed">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="Công nghệ">Công nghệ</SelectItem>
                <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                <SelectItem value="Y tế">Y tế</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conference Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hội nghị</CardTitle>
          <CardDescription>
            Hiển thị {paginatedConferences.length} trong tổng số {filteredConferences.length} hội nghị
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên hội nghị</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Đã đăng ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Phân quyền</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedConferences.map((conference) => (
                  <TableRow key={conference.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{conference.name}</div>
                        <div className="text-sm text-muted-foreground">{conference.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDateToVietnamese(conference.startDate)}</div>
                        <div className="text-sm text-muted-foreground">{formatDateToVietnamese(conference.endDate)}</div>
                      </div>
                    </TableCell>
                    <TableCell>{conference.location || "N/A"}</TableCell>
                    <TableCell>{conference.capacity || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{conference.registered || 0}</span>
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(((conference.registered || 0) / (conference.capacity || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[conference.status] || statusColors.draft}>
                        {statusLabels[conference.status] || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{conference.category || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {conference.assignedUsers?.length || 0} nhân viên
                            <span className="text-xs text-muted-foreground ml-1">(+ admin có tất cả quyền)</span>
                          </span>
                          {conference.assignedUsers && conference.assignedUsers.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {conference.assignedUsers
                                .slice(0, 2)
                                .map(user => user.userName)
                                .join(', ')}
                              {conference.assignedUsers.length > 2 && 
                                ` +${conference.assignedUsers.length - 2} khác`}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewConference(conference)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEditConference(conference)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleManagePermissions(conference)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Phân quyền
                          </DropdownMenuItem>
                          {canDelete && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteConference(conference)} 
                              className="text-red-600"
                              disabled={isSaving}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isSaving ? "Đang xóa..." : "Xóa"}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Conference Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingConference(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConference ? "Chỉnh sửa hội nghị" : "Tạo hội nghị mới"}
            </DialogTitle>
            <DialogDescription>
              {editingConference 
                ? "Cập nhật thông tin hội nghị" 
                : "Điền thông tin để tạo hội nghị mới"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên hội nghị *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nhập tên hội nghị"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Nhập mô tả hội nghị"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Ngày kết thúc *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Địa điểm *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Nhập địa điểm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Sức chứa *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    placeholder="Nhập sức chứa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Công nghệ">Công nghệ</SelectItem>
                      <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                      <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                      <SelectItem value="Y tế">Y tế</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="organizer">Người tổ chức *</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  placeholder="Nhập tên người tổ chức"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="active">Đang diễn ra</SelectItem>
                    <SelectItem value="completed">Đã kết thúc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - User Assignment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <h3 className="text-lg font-medium">Phân quyền người dùng</h3>
              </div>
              
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Không có nhân viên nào để phân quyền</p>
                    <p className="text-xs mt-1">(Admin đã có tất cả quyền mặc định, chỉ staff mới cần phân quyền)</p>
                  </div>
                )}
              </div>
              
              {/* Permission Settings for Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Quyền hạn cho người dùng đã chọn:</h4>
                  <div className="space-y-4 max-h-40 overflow-y-auto border rounded-lg p-4">
                    {selectedUsers.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <div key={userId} className="space-y-3 p-3 bg-muted/30 rounded-md">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{user?.name}</div>
                            <div className="text-xs text-muted-foreground">{user?.email}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {CONFERENCE_PERMISSIONS.map((permission) => (
                              <div key={permission.key} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                                <Checkbox
                                  id={`${userId}-${permission.key}`}
                                  checked={userPermissions[userId]?.includes(permission.key) || false}
                                  onCheckedChange={(checked) => handlePermissionChange(userId, permission.key, checked as boolean)}
                                />
                                <Label htmlFor={`${userId}-${permission.key}`} className="text-xs cursor-pointer whitespace-nowrap flex-1">
                                  {permission.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingConference(null);
            }} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSaveConference} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingConference ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                editingConference ? "Cập nhật" : "Tạo mới"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Management Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý phân quyền hội nghị</DialogTitle>
            <DialogDescription>
              Phân quyền cho người dùng đối với hội nghị: <strong>{selectedConference?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - User Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Chọn người dùng</h4>
              <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-3">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                      <Checkbox
                        id={`perm-user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`perm-user-${user.id}`} className="cursor-pointer">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Không có nhân viên nào để phân quyền</p>
                    <p className="text-sm mt-2">(Admin đã có tất cả quyền mặc định, chỉ staff mới cần phân quyền)</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Column - Permission Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Quyền hạn cho người dùng đã chọn</h4>
              {selectedUsers.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-3">
                  {selectedUsers.map((userId) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <div key={userId} className="space-y-3 p-3 bg-muted/30 rounded-md">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{user?.name}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                          <Badge variant="outline" className="text-xs">
                            {user?.role}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {CONFERENCE_PERMISSIONS.map((permission) => (
                            <div key={permission.key} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                              <Checkbox
                                id={`perm-${userId}-${permission.key}`}
                                checked={userPermissions[userId]?.includes(permission.key) || false}
                                onCheckedChange={(checked) => handlePermissionChange(userId, permission.key, checked as boolean)}
                              />
                              <Label htmlFor={`perm-${userId}-${permission.key}`} className="text-sm cursor-pointer whitespace-nowrap flex-1">
                                {permission.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn người dùng để phân quyền</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSavePermissions} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu phân quyền"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Conference Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Chi tiết hội nghị
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Thông tin chi tiết về hội nghị
                </DialogDescription>
              </div>
              {viewingConference && (
                <Badge 
                  className={`text-sm px-3 py-1 ${statusColors[viewingConference.status] || statusColors.draft}`}
                >
                  {statusLabels[viewingConference.status] || "Unknown"}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {viewingConference && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {viewingConference.name}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {viewingConference.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="ml-6 flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Danh mục</div>
                      <div className="font-medium">{viewingConference.category || "N/A"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Người tổ chức</div>
                      <div className="font-medium">{viewingConference.organizer || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Thông tin thời gian
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</Label>
                        <div className="text-base font-medium">{formatDateToVietnamese(viewingConference.startDate)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</Label>
                        <div className="text-base font-medium">{formatDateToVietnamese(viewingConference.endDate)}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        Địa điểm
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base font-medium">{viewingConference.location || "N/A"}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Column - Statistics */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        Thống kê tham dự
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {viewingConference.capacity || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Sức chứa</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {viewingConference.registered || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Đã đăng ký</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tỷ lệ lấp đầy</span>
                          <span className="font-medium">
                            {Math.round(((viewingConference.registered || 0) / (viewingConference.capacity || 1)) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((viewingConference.registered || 0) / (viewingConference.capacity || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center">
                        <Info className="h-5 w-5 mr-2 text-primary" />
                        Thông tin bổ sung
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                        <Badge 
                          className={`w-fit ${statusColors[viewingConference.status] || statusColors.draft}`}
                        >
                          {statusLabels[viewingConference.status] || "Unknown"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Danh mục</Label>
                        <div className="text-base font-medium">{viewingConference.category || "N/A"}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Người tổ chức</Label>
                        <div className="text-base font-medium">{viewingConference.organizer || "N/A"}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Assigned Users Section */}
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Người dùng được phân quyền
                    <Badge variant="outline" className="ml-2">
                      {viewingConference.assignedUsers?.length || 0} nhân viên
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewingConference.assignedUsers && viewingConference.assignedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {viewingConference.assignedUsers.map((user) => (
                        <div key={user.userId} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-xl border hover:bg-muted/50 transition-colors">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base">{user.userName}</div>
                            <div className="text-sm text-muted-foreground capitalize">{user.userRole}</div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {CONFERENCE_PERMISSIONS.find(p => p.key === permission)?.label || permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Chưa có nhân viên nào được phân quyền</p>
                      <p className="text-sm mt-2">Admin đã có tất cả quyền mặc định. Sử dụng nút "Phân quyền" để thêm staff</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-6 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
            <div className="text-sm text-muted-foreground">
              Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Đóng
              </Button>
              {canEdit && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditConference(viewingConference!);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Xác nhận xóa hội nghị</span>
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hội nghị này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          
          {conferenceToDelete && (
            <div className="py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="font-medium text-lg">{conferenceToDelete.name}</div>
                <div className="text-sm text-muted-foreground">
                  {conferenceToDelete.description || "Không có mô tả"}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>📅 {formatDateToVietnamese(conferenceToDelete.startDate)} - {formatDateToVietnamese(conferenceToDelete.endDate)}</span>
                  <span>📍 {conferenceToDelete.location || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[conferenceToDelete.status] || statusColors.draft}>
                    {statusLabels[conferenceToDelete.status] || "Unknown"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Sức chứa: {conferenceToDelete.capacity || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConferenceToDelete(null);
              }} 
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteConference} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa hội nghị
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
