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
  MapPin,
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
  Home,
  DoorOpen,
} from "lucide-react";
import { toast } from "sonner";
import { GlobalLoading } from "@/components/ui/global-loading";
import { apiClient } from "@/lib/api";

interface Room {
  ID: number;
  NAME: string;
  CAPACITY: number;
  FLOOR_ID: number;
  FLOOR_NAME?: string;
  CONFERENCE_ID: number;
  CONFERENCE_NAME?: string;
  DESCRIPTION?: string;
  ROOM_TYPE?: string;
  FEATURES?: string[];
  features?: string[];
  STATUS?: string;
  status: "available" | "occupied" | "maintenance" | "reserved";
  createdAt?: string;
  updatedAt?: string;
}

interface Floor {
  ID: number;
  FLOOR_NUMBER: number;
  FLOOR_NAME?: string;
  CONFERENCE_ID: number;
  CONFERENCE_NAME?: string;
  rooms?: Room[];
}

interface Conference {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function RoomsManagementSystem() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    floorId: "",
    description: "",
    roomType: "",
    features: [] as string[],
    status: "available",
  });

  // State for all available features
  const [allFeatures, setAllFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState<string>("");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Load features from database
  useEffect(() => {
    const loadFeatures = () => {
      const featuresSet = new Set<string>();

      // Collect all unique features from rooms
      rooms.forEach((room) => {
        if (room.features && Array.isArray(room.features)) {
          room.features.forEach((feature) => {
            if (feature && typeof feature === "string" && feature.trim()) {
              featuresSet.add(feature.trim());
            }
          });
        }
      });

      // Convert to array and sort
      const uniqueFeatures = Array.from(featuresSet).sort();
      setAllFeatures(uniqueFeatures);
    };

    if (rooms.length > 0) {
      loadFeatures();
    }
  }, [rooms]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadFloors(), loadRooms()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadFloors = async () => {
    try {
      const floors = await apiClient.getFloors();
      setFloors(Array.isArray(floors) ? floors : []);
    } catch (error) {
      console.error("Error loading floors:", error);
      setFloors([]);
    }
  };

  const loadRooms = async () => {
    try {
      const rooms = await apiClient.getRooms();
      console.log("Raw rooms data from API:", rooms);

      // Add default status and use features from backend or generate sample features
      const roomsWithStatus = (Array.isArray(rooms) ? rooms : []).map(
        (room: any) => {
          console.log("Processing room:", {
            ID: room.ID,
            NAME: room.NAME,
            STATUS: room.STATUS,
            FEATURES: room.FEATURES,
            FEATURES_type: typeof room.FEATURES,
            FEATURES_isArray: Array.isArray(room.FEATURES),
          });

          return {
            ...room,
            status: (() => {
              // Get status from database, with proper fallback
              const dbStatus = room.STATUS;
              console.log(`Room ${room.NAME} STATUS from DB:`, dbStatus);

              if (
                dbStatus &&
                ["available", "occupied", "maintenance", "reserved"].includes(
                  dbStatus
                )
              ) {
                return dbStatus as
                  | "available"
                  | "occupied"
                  | "maintenance"
                  | "reserved";
              }

              // Fallback to available if status is invalid or missing
              console.log(`Room ${room.NAME} using fallback status: available`);
              return "available";
            })(),
            features: (() => {
              console.log(`Processing room ${room.NAME}:`, {
                FEATURES: room.FEATURES,
                FEATURES_type: typeof room.FEATURES,
                FEATURES_isArray: Array.isArray(room.FEATURES),
              });

              // Handle different possible FEATURES formats
              if (Array.isArray(room.FEATURES)) {
                if (room.FEATURES.length > 0) {
                  // Clean and validate features using helper function
                  const validFeatures = cleanFeatures(room.FEATURES);
                  console.log(
                    `Valid features for ${room.NAME}:`,
                    validFeatures
                  );
                  return validFeatures;
                } else {
                  // FEATURES is empty array - return empty array
                  console.log(`Empty FEATURES array for ${room.NAME}`);
                  return [];
                }
              }

              // If FEATURES is an object, convert to array or return empty
              if (
                room.FEATURES &&
                typeof room.FEATURES === "object" &&
                !Array.isArray(room.FEATURES)
              ) {
                console.warn(
                  `FEATURES is an object for ${room.NAME}, returning empty array:`,
                  room.FEATURES
                );
                return [];
              }

              // If FEATURES is null, undefined, or empty, return empty array
              console.log(
                `No FEATURES data for ${room.NAME}, returning empty array`
              );
              return [];
            })(),
          };
        }
      );
      setRooms(roomsWithStatus);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  // Helper function to clean and validate features
  const cleanFeatures = (features: any[]): string[] => {
    if (!Array.isArray(features)) return [];

    return features
      .map((feature) => {
        if (typeof feature === "string") {
          const cleaned = feature.trim();
          // Skip invalid or auto-generated values
          if (
            !cleaned ||
            cleaned === "null" ||
            cleaned === "undefined" ||
            cleaned === "[object Object]" ||
            cleaned === "DB_TYPE_CLOB" ||
            cleaned === "Có sẵn" ||
            cleaned === "Không có" ||
            cleaned.startsWith("Tính năng ")
          ) {
            return null;
          }
          return cleaned;
        }
        return null;
      })
      .filter((feature) => feature !== null && feature !== undefined);
  };

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.FLOOR_NAME &&
        typeof room.FLOOR_NAME === "string" &&
        room.FLOOR_NAME.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFloor =
      selectedFloor === "all" || room.FLOOR_ID.toString() === selectedFloor;
    const matchesStatus =
      selectedStatus === "all" || room.status === selectedStatus;
    const matchesRoomType =
      selectedRoomType === "all" || room.ROOM_TYPE === selectedRoomType;

    return matchesSearch && matchesFloor && matchesStatus && matchesRoomType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFloor, selectedStatus, selectedRoomType]);

  // Handle create room
  const handleCreateRoom = async () => {
    try {
      if (!formData.name || !formData.capacity || !formData.floorId) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      const roomData = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        description: formData.description,
        roomType: formData.roomType,
        features: formData.features,
        status: formData.status,
      };

      await apiClient.createRoom(parseInt(formData.floorId), roomData);

      toast.success("Tạo phòng thành công");
      setIsCreateDialogOpen(false);
      resetForm();
      loadRooms();
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Không thể tạo phòng");
    }
  };

  // Handle edit room
  const handleEditRoom = async () => {
    try {
      if (!editingRoom || !formData.name || !formData.capacity) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      const roomData = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        description: formData.description,
        roomType: formData.roomType,
        features: formData.features,
        status: formData.status,
      };

      await apiClient.updateRoom(editingRoom.ID, roomData);

      toast.success("Cập nhật phòng thành công");
      setIsEditDialogOpen(false);
      setEditingRoom(null);
      resetForm();
      loadRooms();
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("Không thể cập nhật phòng");
    }
  };

  // Handle delete room
  const handleDeleteRoom = async () => {
    try {
      if (!deletingRoom) return;

      await apiClient.deleteRoom(deletingRoom.ID);

      toast.success("Xóa phòng thành công");
      setIsDeleteDialogOpen(false);
      setDeletingRoom(null);
      loadRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Không thể xóa phòng");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      floorId: "",
      description: "",
      roomType: "",
      features: [],
      status: "available",
    });
    setNewFeature("");
  };

  // Open edit dialog
  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.NAME,
      capacity: room.CAPACITY.toString(),
      floorId: room.FLOOR_ID.toString(),
      description: room.DESCRIPTION || "",
      roomType: room.ROOM_TYPE || "",
      features: room.features || [],
      status: room.status || "available",
    });
    setNewFeature("");
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (room: Room) => {
    setDeletingRoom(room);
    setIsDeleteDialogOpen(true);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "occupied":
        return "destructive";
      case "maintenance":
        return "secondary";
      case "reserved":
        return "outline";
      default:
        return "default";
    }
  };

  // Get status badge style with colors
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "occupied":
        return "Đang sử dụng";
      case "maintenance":
        return "Bảo trì";
      case "reserved":
        return "Đã đặt";
      default:
        return status;
    }
  };

  // Get room type label
  const getRoomTypeLabel = (roomType: string | undefined) => {
    if (!roomType) return "Chưa xác định";

    switch (roomType) {
      case "meeting":
        return "Phòng họp";
      case "conference":
        return "Hội trường";
      case "training":
        return "Phòng đào tạo";
      case "vip":
        return "Phòng VIP";
      case "workshop":
        return "Xưởng thực hành";
      default:
        return roomType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <GlobalLoading
          message="Đang tải dữ liệu phòng..."
          variant="fullscreen"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-gray-600 mt-2">
            Quản lý tất cả các phòng họp và không gian sự kiện
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phòng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rooms.length}
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Có sẵn</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter((r) => r.status === "available").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đang sử dụng
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {rooms.filter((r) => r.status === "occupied").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bảo trì</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rooms.filter((r) => r.status === "maintenance").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã đặt</p>
                <p className="text-2xl font-bold text-blue-600">
                  {rooms.filter((r) => r.status === "reserved").length}
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn tầng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tầng</SelectItem>
                {floors.map((floor) => (
                  <SelectItem key={floor.ID} value={floor.ID.toString()}>
                    {floor.FLOOR_NAME
                      ? floor.FLOOR_NAME
                      : `Tầng ${floor.FLOOR_NUMBER}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="available" className="text-green-700">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Có sẵn
                  </span>
                </SelectItem>
                <SelectItem value="occupied" className="text-red-700">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Đang sử dụng
                  </span>
                </SelectItem>
                <SelectItem value="maintenance" className="text-yellow-700">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Bảo trì
                  </span>
                </SelectItem>
                <SelectItem value="reserved" className="text-blue-700">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Đã đặt
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedRoomType}
              onValueChange={setSelectedRoomType}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại phòng</SelectItem>
                <SelectItem value="meeting">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    Phòng họp
                  </span>
                </SelectItem>
                <SelectItem value="conference">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    Hội trường
                  </span>
                </SelectItem>
                <SelectItem value="training">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    Phòng đào tạo
                  </span>
                </SelectItem>
                <SelectItem value="vip">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    Phòng VIP
                  </span>
                </SelectItem>
                <SelectItem value="workshop">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    Xưởng thực hành
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                console.log("Manual refresh clicked");
                loadData();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng</CardTitle>
          <CardDescription>
            Hiển thị {paginatedRooms.length} trong tổng số{" "}
            {filteredRooms.length} phòng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Tên phòng</th>
                  <th className="text-left p-3 font-medium">Tầng</th>
                  <th className="text-left p-3 font-medium">Sức chứa</th>
                  <th className="text-left p-3 font-medium">Loại phòng</th>
                  <th className="text-left p-3 font-medium">Trạng thái</th>
                  <th className="text-left p-3 font-medium">Tính năng</th>
                  <th className="text-right p-3 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRooms.map((room) => (
                  <tr key={room.ID} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{room.NAME}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-gray-600">
                        {room.FLOOR_NAME
                          ? room.FLOOR_NAME
                          : `Tầng ${room.FLOOR_ID}`}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{room.CAPACITY}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {getRoomTypeLabel(room.ROOM_TYPE)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={getStatusBadgeVariant(room.status)}
                        className={`${getStatusBadgeStyle(
                          room.status
                        )} font-medium`}
                      >
                        {getStatusLabel(room.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          // Get valid features for display using helper function
                          const validFeatures = cleanFeatures(
                            room.features || []
                          );

                          if (validFeatures.length > 0) {
                            return (
                              <>
                                {validFeatures
                                  .slice(0, 2)
                                  .map((feature, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      {feature}
                                    </Badge>
                                  ))}
                                {validFeatures.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                                  >
                                    +{validFeatures.length - 2}
                                  </Badge>
                                )}
                              </>
                            );
                          } else {
                            return (
                              <span className="text-gray-400 text-sm italic">
                                Chưa có tính năng
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(room)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(room)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Hiển thị {startIndex + 1} -{" "}
                {Math.min(startIndex + itemsPerPage, filteredRooms.length)}{" "}
                trong tổng số {filteredRooms.length} phòng
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="text-sm">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

      {/* Create Room Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo phòng mới</DialogTitle>
            <DialogDescription>
              Thêm phòng họp mới vào hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tên phòng *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên phòng"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa *</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="Nhập sức chứa"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tầng *</label>
                <Select
                  value={formData.floorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, floorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tầng" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.ID} value={floor.ID.toString()}>
                        {floor.FLOOR_NAME
                          ? floor.FLOOR_NAME
                          : `Tầng ${floor.FLOOR_NUMBER}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Loại phòng</label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roomType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Phòng họp</SelectItem>
                    <SelectItem value="conference">Hội trường</SelectItem>
                    <SelectItem value="training">Phòng đào tạo</SelectItem>
                    <SelectItem value="vip">Phòng VIP</SelectItem>
                    <SelectItem value="workshop">Xưởng thực hành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available" className="text-green-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Có sẵn
                      </span>
                    </SelectItem>
                    <SelectItem value="occupied" className="text-red-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Đang sử dụng
                      </span>
                    </SelectItem>
                    <SelectItem value="maintenance" className="text-yellow-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Bảo trì
                      </span>
                    </SelectItem>
                    <SelectItem value="reserved" className="text-blue-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Đã đặt
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả phòng..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tính năng</label>

              {allFeatures.length > 0 ? (
                <>
                  {/* Features checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                    {allFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feature],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(
                                  (f) => f !== feature
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>

                  {/* Selected features count */}
                  <div className="text-xs text-gray-500 mt-2">
                    Đã chọn {formData.features.length} tính năng
                  </div>
                </>
              ) : (
                <div className="border rounded-md p-4 text-center text-gray-500">
                  <p className="text-sm">
                    Chưa có tính năng nào trong hệ thống
                  </p>
                  <p className="text-xs mt-1">
                    Tính năng sẽ được tạo khi bạn thêm phòng mới
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateRoom}>Tạo phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingRoom(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng</DialogTitle>
            <DialogDescription>Cập nhật thông tin phòng</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tên phòng *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên phòng"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sức chứa *</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="Nhập sức chứa"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tầng *</label>
                <Select
                  value={formData.floorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, floorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tầng" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.ID} value={floor.ID.toString()}>
                        {floor.FLOOR_NAME
                          ? floor.FLOOR_NAME
                          : `Tầng ${floor.FLOOR_NUMBER}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Loại phòng</label>
                <Select
                  value={formData.roomType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, roomType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Phòng họp</SelectItem>
                    <SelectItem value="conference">Hội trường</SelectItem>
                    <SelectItem value="training">Phòng đào tạo</SelectItem>
                    <SelectItem value="vip">Phòng VIP</SelectItem>
                    <SelectItem value="workshop">Xưởng thực hành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available" className="text-green-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Có sẵn
                      </span>
                    </SelectItem>
                    <SelectItem value="occupied" className="text-red-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Đang sử dụng
                      </span>
                    </SelectItem>
                    <SelectItem value="maintenance" className="text-yellow-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Bảo trì
                      </span>
                    </SelectItem>
                    <SelectItem value="reserved" className="text-blue-700">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Đã đặt
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả phòng..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tính năng</label>

              {allFeatures.length > 0 ? (
                <>
                  {/* Features checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-md p-3 max-h-60 overflow-y-auto">
                    {allFeatures.map((feature) => (
                      <label
                        key={feature}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feature],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(
                                  (f) => f !== feature
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>

                  {/* Selected features count */}
                  <div className="text-xs text-gray-500 mt-2">
                    Đã chọn {formData.features.length} tính năng
                  </div>
                </>
              ) : (
                <div className="border rounded-md p-4 text-center text-gray-500">
                  <p className="text-sm">
                    Chưa có tính năng nào trong hệ thống
                  </p>
                  <p className="text-xs mt-1">
                    Tính năng sẽ được tạo khi bạn thêm phòng mới
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingRoom(null);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleEditRoom}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa phòng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phòng "{deletingRoom?.NAME}"? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>
              Xóa phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
