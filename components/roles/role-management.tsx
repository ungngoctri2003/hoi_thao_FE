"use client";

import { useState, useEffect, useCallback } from "react";
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
import { GlobalLoading } from "@/components/ui/global-loading";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Users,
  Key,
  Settings,
  Eye,
  UserPlus,
  Plus,
  Calendar,
} from "lucide-react";
import { UserRoleDialog } from "./user-role-dialog";
import { UserDetailDialog } from "./user-detail-dialog";
import { CreateRoleDialog } from "./create-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { ConferenceAssignmentDialog } from "./conference-assignment-dialog";
import { ConferenceAssignmentsList } from "./conference-assignments-list";
import { UserConferenceList } from "./user-conference-list";
import { AuthErrorHandler } from "../auth/auth-error-handler";
import {
  apiClient,
  Role,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/lib/api";
import { toast } from "sonner";

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const roleLabels = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  attendee: "Tham dự",
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  suspended: "Tạm khóa",
};

export function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [
    isConferenceAssignmentDialogOpen,
    setIsConferenceAssignmentDialogOpen,
  ] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [viewingUserConferences, setViewingUserConferences] =
    useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for client-side filtering
  const itemsPerPage = 10;

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Listen for conference updates
  useEffect(() => {
    const handleConferenceUpdate = () => {
      loadData();
    };

    window.addEventListener("conferences-updated", handleConferenceUpdate);

    return () => {
      window.removeEventListener("conferences-updated", handleConferenceUpdate);
    };
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  // Load users when page changes or filters change
  useEffect(() => {
    loadUsers();
  }, [currentPage, debouncedSearchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      // For now, we'll load all users and do client-side filtering
      // In a real app, you'd want to implement server-side filtering
      const usersResponse = await apiClient.getUsers(1, 1000); // Load more users for filtering

      // Debug: Log user data to check avatar field
      console.log(
        "Users data from API:",
        usersResponse.data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
        }))
      );

      setAllUsers(usersResponse.data);

      // Apply client-side filtering
      const filtered = usersResponse.data.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      });

      // Apply pagination to filtered results
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = filtered.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalUsers(filtered.length);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const rolesResponse = await apiClient.getRoles();

      setRoles(rolesResponse.data);

      // Load users separately with filtering
      await loadUsers();
    } catch (error: any) {
      console.error("Error loading data:", error);
      const errorMessage = error?.message || "Không thể tải dữ liệu";

      if (
        errorMessage.includes("quyền truy cập") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("401")
      ) {
        toast.error(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
        );
        // Set empty data instead of showing error
        setRoles([]);
        setUsers([]);
      } else if (
        errorMessage.includes("403") ||
        errorMessage.includes("Forbidden")
      ) {
        toast.error(
          "Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ quản trị viên."
        );
        // Set empty data instead of showing error
        setRoles([]);
        setUsers([]);
      } else {
        toast.error(`Lỗi tải dữ liệu: ${errorMessage}`);
        // Set empty data on error
        setRoles([]);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setIsUserDetailDialogOpen(true);
  };

  const handleAssignConferences = (user: User) => {
    setAssigningUser(user);
    setIsConferenceAssignmentDialogOpen(true);
  };

  const handleViewUserConferences = (user: User) => {
    setViewingUserConferences(user);
  };

  const handleToggleUserStatus = async (
    userId: string,
    newStatus: "active" | "inactive" | "suspended"
  ) => {
    try {
      // Find the user to get current data
      const currentUser = allUsers.find((u) => u.id === userId);
      if (!currentUser) {
        toast.error("Không tìm thấy người dùng");
        return;
      }

      const updateData: UpdateUserRequest = {
        name: currentUser.name,
        email: currentUser.email,
        status: newStatus,
      };

      console.log("Updating user status:", { userId, newStatus, updateData });

      const response = await apiClient.updateUser(Number(userId), updateData);

      // Use the response data directly as it contains the updated information
      setUsers(users.map((u) => (u.id === userId ? response.data : u)));
      setAllUsers(allUsers.map((u) => (u.id === userId ? response.data : u)));

      const statusMessages = {
        active: "mở khóa",
        inactive: "khóa",
        suspended: "tạm khóa",
      };
      toast.success(`Đã ${statusMessages[newStatus]} tài khoản thành công`);
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      const errorMessage =
        error?.message || "Không thể thay đổi trạng thái người dùng";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleUnlockAllAccounts = async () => {
    try {
      const disabledUsers = allUsers.filter((u) => u.status !== "active");

      if (disabledUsers.length === 0) {
        toast.info("Tất cả tài khoản đều đang hoạt động");
        return;
      }

      toast.info(`Đang mở khóa ${disabledUsers.length} tài khoản...`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of disabledUsers) {
        try {
          const updateData: UpdateUserRequest = {
            name: user.name,
            email: user.email,
            status: "active",
          };

          const response = await apiClient.updateUser(
            Number(user.id),
            updateData
          );

          // Update the user in both arrays
          setUsers(users.map((u) => (u.id === user.id ? response.data : u)));
          setAllUsers(
            allUsers.map((u) => (u.id === user.id ? response.data : u))
          );

          successCount++;
        } catch (error) {
          console.error(`Error unlocking user ${user.email}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Đã mở khóa ${successCount} tài khoản thành công`);
      }

      if (errorCount > 0) {
        toast.error(`Không thể mở khóa ${errorCount} tài khoản`);
      }
    } catch (error: any) {
      console.error("Error unlocking all accounts:", error);
      toast.error("Lỗi khi mở khóa tài khoản");
    }
  };

  const handleEditRole = (role: Role) => {
    console.log("Editing role:", role);
    setEditingRole(role);
    setIsEditRoleDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (editingUser) {
        const updateData: UpdateUserRequest = {
          name: userData.name,
          email: userData.email,
          status: userData.status,
          role: userData.role,
        };
        console.log("Updating user with data:", updateData);
        const response = await apiClient.updateUser(
          Number(editingUser.id),
          updateData
        );
        console.log("User updated successfully:", response.data);

        // Use the response data directly as it contains the updated information
        setUsers(
          users.map((u) => (u.id === editingUser.id ? response.data : u))
        );
        setAllUsers(
          allUsers.map((u) => (u.id === editingUser.id ? response.data : u))
        );
        toast.success("Cập nhật người dùng thành công");
      } else {
        const createData: CreateUserRequest = {
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "attendee",
        };

        console.log("Creating user with data:", createData);
        const response = await apiClient.createUser(createData);
        setAllUsers([...allUsers, response.data]);
        // Reload users to apply current filters
        await loadUsers();
        toast.success("Tạo người dùng thành công");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      const errorMessage = error?.message || "Không thể lưu người dùng";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await apiClient.deleteUser(userId);
      setAllUsers(allUsers.filter((u) => Number(u.id) !== userId));
      // Reload users to apply current filters
      await loadUsers();
      toast.success("Xóa người dùng thành công");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorMessage = error?.message || "Không thể xóa người dùng";
      toast.error(errorMessage);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name.trim() === "") {
      return "U";
    }

    return name
      .trim()
      .split(" ")
      .filter((n) => n.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2); // Giới hạn tối đa 2 ký tự
  };

  const getRoleStats = () => {
    return {
      total: allUsers.length,
      admin: allUsers.filter((u) => u.role === "admin").length,
      staff: allUsers.filter((u) => u.role === "staff").length,
      attendee: allUsers.filter((u) => u.role === "attendee").length,
      active: allUsers.filter((u) => u.status === "active").length,
    };
  };

  const stats = getRoleStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <GlobalLoading
            message="Đang tải quản lý vai trò..."
            variant="default"
            size="md"
          />
        </div>
      </div>
    );
  }

  // Show message if no data and not loading (likely auth issue)
  if (!loading && roles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold">Quản lý vai trò</h1>
            <p className="text-muted-foreground">
              Phân quyền và quản lý người dùng hệ thống
            </p>
          </div>
        </div>

        <AuthErrorHandler
          error="Không có quyền truy cập tính năng này"
          onLogin={() => (window.location.href = "/login")}
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Quản lý vai trò</h1>
          <p className="text-muted-foreground">
            Phân quyền và quản lý người dùng hệ thống
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsCreateRoleDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo vai trò
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
          <Button
            variant="outline"
            onClick={handleUnlockAllAccounts}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <Key className="mr-2 h-4 w-4" />
            Mở khóa tất cả
          </Button>
        </div>
      </div>

      {/* Warning for disabled accounts */}
      {allUsers.filter((u) => u.status !== "active").length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Có {allUsers.filter((u) => u.status !== "active").length} tài
                khoản bị khóa
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Những tài khoản này không thể đăng nhập. Click "Mở khóa tất cả"
                để khắc phục.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng vai trò</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Vai trò</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="conference-assignments">
            Giao hội nghị
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Roles List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách vai trò</CardTitle>
              <CardDescription>
                Hiển thị {roles.length} vai trò từ hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có vai trò nào trong hệ thống
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                      <Card key={role.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{role.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Code: {role.code}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {role.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                roleColors[
                                  role.code as keyof typeof roleColors
                                ] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {role.code}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
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
                      placeholder="Tìm kiếm theo tên, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                    <SelectItem value="attendee">Tham dự</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="suspended">Tạm khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Hiển thị {users.length} trong tổng số {totalUsers} người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Đăng nhập cuối</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Không tìm thấy người dùng nào
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    user.avatar && user.avatar.trim() !== ""
                                      ? user.avatar
                                      : undefined
                                  }
                                  alt={`${user.name} avatar`}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                roleColors[user.role as keyof typeof roleColors]
                              }
                            >
                              {roleLabels[user.role as keyof typeof roleLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusColors[
                                  user.status as keyof typeof statusColors
                                ]
                              }
                            >
                              {
                                statusLabels[
                                  user.status as keyof typeof statusColors
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                          <TableCell>{user.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                {user.role === "staff" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewUserConferences(user)
                                      }
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Xem hội nghị
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAssignConferences(user)
                                      }
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Giao hội nghị
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Improved logic: always toggle to opposite of current status
                                    let newStatus:
                                      | "active"
                                      | "inactive"
                                      | "suspended";
                                    if (user.status === "active") {
                                      newStatus = "inactive";
                                    } else if (user.status === "inactive") {
                                      newStatus = "active";
                                    } else if (user.status === "suspended") {
                                      newStatus = "active";
                                    } else {
                                      newStatus = "active"; // Default fallback
                                    }
                                    handleToggleUserStatus(user.id, newStatus);
                                  }}
                                >
                                  <Settings className="mr-2 h-4 w-4" />
                                  {user.status === "active"
                                    ? "Khóa tài khoản"
                                    : "Mở khóa tài khoản"}
                                </DropdownMenuItem>
                                {user.status === "inactive" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleUserStatus(
                                        user.id,
                                        "suspended"
                                      )
                                    }
                                  >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Tạm khóa tài khoản
                                  </DropdownMenuItem>
                                )}
                                {user.status === "suspended" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleUserStatus(user.id, "active")
                                    }
                                  >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Mở khóa tài khoản
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteUser(Number(user.id))
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
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
        </TabsContent>

        <TabsContent value="conference-assignments" className="space-y-4">
          {/* Conference Assignments Management */}
          <ConferenceAssignmentsList
            onEdit={(assignment) => {
              // Edit assignment is handled internally by ConferenceAssignmentsList
              console.log("Edit assignment:", assignment);
            }}
            onDelete={(assignmentId) => {
              // Delete assignment is handled internally by ConferenceAssignmentsList
              console.log("Delete assignment:", assignmentId);
            }}
            // Remove onCreateNew prop to use internal handling
          />
        </TabsContent>
      </Tabs>

      <UserRoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
      <UserDetailDialog
        open={isUserDetailDialogOpen}
        onOpenChange={setIsUserDetailDialogOpen}
        user={viewingUser}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleUserStatus}
      />
      <CreateRoleDialog
        open={isCreateRoleDialogOpen}
        onOpenChange={setIsCreateRoleDialogOpen}
        onRoleCreated={loadData}
      />
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        role={editingRole}
        onRoleUpdated={() => {
          // Reload data to get updated roles
          loadData();
        }}
      />
      <ConferenceAssignmentDialog
        open={isConferenceAssignmentDialogOpen}
        onOpenChange={setIsConferenceAssignmentDialogOpen}
        user={assigningUser}
        onAssignmentCreated={() => {
          // Reload data to refresh assignments
          loadData();
        }}
      />

      {/* User Conference List Modal */}
      {viewingUserConferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                Hội nghị của {viewingUserConferences.name}
              </h2>
              <Button
                variant="outline"
                onClick={() => setViewingUserConferences(null)}
              >
                Đóng
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <UserConferenceList
                userId={Number(viewingUserConferences.id)}
                userName={viewingUserConferences.name}
                userEmail={viewingUserConferences.email}
                onEdit={(assignment) => {
                  console.log("Edit assignment:", assignment);
                }}
                onDelete={(assignmentId) => {
                  console.log("Delete assignment:", assignmentId);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
