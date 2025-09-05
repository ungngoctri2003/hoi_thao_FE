"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  MapPin, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building,
  Map,
  Navigation,
  Clock,
  Users,
  Wifi,
  Car,
  Coffee,
  Building2
} from "lucide-react";

interface VenueFloor {
  id: number;
  name: string;
  description: string;
  floorNumber: number;
  conferenceId: number;
}

interface VenueRoom {
  id: number;
  name: string;
  capacity: number;
  floorId: number;
  amenities: string[];
  isAvailable: boolean;
}

export default function VenuePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [floors, setFloors] = useState<VenueFloor[]>([]);
  const [rooms, setRooms] = useState<VenueRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFloors: VenueFloor[] = [
      {
        id: 1,
        name: "Tầng 1 - Sảnh chính",
        description: "Sảnh đăng ký và khu vực chung",
        floorNumber: 1,
        conferenceId: currentConferenceId || 1
      },
      {
        id: 2,
        name: "Tầng 2 - Phòng họp",
        description: "Các phòng họp và thuyết trình",
        floorNumber: 2,
        conferenceId: currentConferenceId || 1
      },
      {
        id: 3,
        name: "Tầng 3 - Khu vực VIP",
        description: "Khu vực dành cho khách VIP",
        floorNumber: 3,
        conferenceId: currentConferenceId || 1
      }
    ];

    const mockRooms: VenueRoom[] = [
      {
        id: 1,
        name: "Phòng A101",
        capacity: 50,
        floorId: 1,
        amenities: ["Máy chiếu", "Wifi", "Điều hòa"],
        isAvailable: true
      },
      {
        id: 2,
        name: "Phòng A102",
        capacity: 30,
        floorId: 1,
        amenities: ["Máy chiếu", "Wifi", "Bảng trắng"],
        isAvailable: false
      },
      {
        id: 3,
        name: "Phòng B201",
        capacity: 100,
        floorId: 2,
        amenities: ["Máy chiếu", "Wifi", "Hệ thống âm thanh", "Sân khấu"],
        isAvailable: true
      },
      {
        id: 4,
        name: "Phòng VIP301",
        capacity: 20,
        floorId: 3,
        amenities: ["Máy chiếu 4K", "Wifi", "Điều hòa", "Ghế VIP", "Coffee"],
        isAvailable: true
      }
    ];

    setTimeout(() => {
      setFloors(mockFloors);
      setRooms(mockRooms);
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = selectedFloor === null || room.floorId === selectedFloor;
    return matchesSearch && matchesFloor;
  });

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      "Máy chiếu": Building,
      "Wifi": Wifi,
      "Điều hòa": Clock,
      "Bảng trắng": Edit,
      "Hệ thống âm thanh": Users,
      "Sân khấu": Map,
      "Ghế VIP": Coffee,
      "Coffee": Coffee,
      "Parking": Car,
      "WC": Building2
    };
    return iconMap[amenity] || Building;
  };

  
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
  const canView = hasConferencePermission("venue.view");

  if (!canView) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền xem thông tin địa điểm
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
      requiredPermissions={["venue.view"]} 
      conferenceId={currentConferenceId ?? undefined}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Bản đồ địa điểm</h1>
              <p className="text-muted-foreground">
                Quản lý và xem thông tin địa điểm hội nghị
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm tầng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng tầng</p>
                  <p className="text-2xl font-bold">{floors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Map className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Tổng phòng</p>
                  <p className="text-2xl font-bold">{rooms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Phòng trống</p>
                  <p className="text-2xl font-bold">
                    {rooms.filter(r => r.isAvailable).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Sức chứa</p>
                  <p className="text-2xl font-bold">
                    {rooms.reduce((sum, room) => sum + room.capacity, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedFloor || ""}
                  onChange={(e) => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Tất cả tầng</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floors and Rooms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floors List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Danh sách tầng</CardTitle>
              <CardDescription>
                {floors.length} tầng trong tòa nhà
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {floors.map(floor => (
                  <div 
                    key={floor.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFloor === floor.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFloor(selectedFloor === floor.id ? null : floor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{floor.name}</h4>
                        <p className="text-sm text-muted-foreground">{floor.description}</p>
                      </div>
                      <Badge variant="outline">
                        {rooms.filter(r => r.floorId === floor.id).length} phòng
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rooms List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Danh sách phòng</CardTitle>
              <CardDescription>
                {filteredRooms.length} phòng được tìm thấy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRooms.map(room => {
                    const floor = floors.find(f => f.id === room.floorId);
                    return (
                      <Card key={room.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                            <Badge 
                              variant={room.isAvailable ? "default" : "secondary"}
                              className={room.isAvailable ? "bg-green-100 text-green-800" : ""}
                            >
                              {room.isAvailable ? "Trống" : "Đã sử dụng"}
                            </Badge>
                          </div>
                          <CardDescription>
                            {floor?.name} • Sức chứa: {room.capacity} người
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {/* Amenities */}
                            <div>
                              <p className="text-sm font-medium mb-2">Tiện ích:</p>
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.map((amenity, index) => {
                                  const IconComponent = getAmenityIcon(amenity);
                                  return (
                                    <Badge key={index} variant="outline" className="text-xs flex items-center space-x-1">
                                      <IconComponent className="h-3 w-3" />
                                      <span>{amenity}</span>
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 pt-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Chỉnh sửa
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Map className="h-4 w-4 mr-1" />
                                Xem vị trí
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle>Bản đồ tương tác</CardTitle>
            <CardDescription>
              Xem vị trí các phòng và tầng trong tòa nhà
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Map className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Bản đồ tương tác sẽ được hiển thị ở đây</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tích hợp với Google Maps hoặc bản đồ tùy chỉnh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}