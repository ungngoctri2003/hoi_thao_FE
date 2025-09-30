"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Wifi, 
  Car, 
  Coffee,
  ArrowLeft,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useVenues } from "@/hooks/use-venues";

export default function PublicVenuePage() {
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch venue data from API (will fallback to mock data if backend unavailable)
  const { floors, rooms, amenities, loading, error, refetch } = useVenues();

  // Set default selected floor when floors are loaded
  React.useEffect(() => {
    if (floors.length > 0 && !selectedFloor) {
      setSelectedFloor(floors[0].id.toString());
    }
  }, [floors, selectedFloor]);

  // Filter rooms based on selected floor and search term
  const filteredRooms = rooms.filter(room => {
    const matchesFloor = selectedFloor ? room.floorId.toString() === selectedFloor : true;
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "Có sẵn", color: "bg-green-100 text-green-800" },
      occupied: { label: "Đang sử dụng", color: "bg-red-100 text-red-800" },
      maintenance: { label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      MapPin,
      Coffee,
      Car,
      Wifi,
    };
    return iconMap[iconName] || MapPin;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg text-slate-600">Đang tải thông tin địa điểm...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">
                Không thể tải thông tin địa điểm
              </h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Thử lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
              Bản đồ địa điểm hội nghị
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Khám phá các phòng họp, tiện ích và tìm đường dễ dàng trong tòa nhà hội nghị
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phòng họp, tiện ích..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Bộ lọc
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Floors */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Floors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tầng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {floors.map((floor) => (
                        <Button
                          key={floor.id}
                          variant={selectedFloor === floor.id.toString() ? "default" : "outline"}
                          onClick={() => setSelectedFloor(floor.id.toString())}
                          className="w-full justify-start"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">{floor.name}</div>
                            <div className="text-sm opacity-80">{floor.description || `Tầng ${floor.id}`}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tiện ích</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {amenities.map((amenity, index) => {
                        const Icon = getIconComponent(amenity.icon);
                        return (
                          <div key={index} className="flex items-start space-x-3">
                            <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{amenity.name}</p>
                              <p className="text-xs text-muted-foreground">{amenity.location}</p>
                              <p className="text-xs text-muted-foreground">{amenity.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Venues */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {floors.find(f => f.id.toString() === selectedFloor)?.name || 'Chọn tầng'} - 
                    {floors.find(f => f.id.toString() === selectedFloor)?.description || 'Phòng họp và khu vực'}
                  </CardTitle>
                  <CardDescription>
                    {filteredRooms.length} phòng họp và khu vực
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredRooms.map((room) => (
                      <Card key={room.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusBadge(room.status)}
                                <Badge variant="outline">{room.roomType || 'Phòng họp'}</Badge>
                                <Badge variant="secondary">{room.capacity} người</Badge>
                              </div>
                              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                {room.name}
                              </h3>
                              <p className="text-slate-600 mb-4">{room.description || 'Không có mô tả'}</p>
                              <p className="text-sm text-slate-500 mb-4">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                {room.floorName ? `${room.floorName}, ${room.name}` : room.name}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Navigation className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {room.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredRooms.length === 0 && (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 mb-2">
                          Không tìm thấy phòng họp nào
                        </h3>
                        <p className="text-slate-500">
                          Thử thay đổi tầng hoặc từ khóa tìm kiếm
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
              <CardDescription>
                Cần hỗ trợ? Liên hệ với chúng tôi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Hotline</p>
                    <p className="text-sm text-muted-foreground">1900 1234</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@conference.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Giờ hỗ trợ</p>
                    <p className="text-sm text-muted-foreground">8:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
