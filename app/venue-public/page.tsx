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
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function PublicVenuePage() {
  const [selectedFloor, setSelectedFloor] = useState("floor1");
  const [searchTerm, setSearchTerm] = useState("");

  const floors = [
    {
      id: "floor1",
      name: "Tầng 1",
      description: "Sảnh chính, quầy đăng ký, khu vực networking"
    },
    {
      id: "floor2", 
      name: "Tầng 2",
      description: "Phòng họp, workshop rooms"
    },
    {
      id: "floor3",
      name: "Tầng 3", 
      description: "Hội trường chính, phòng VIP"
    }
  ];

  const venues = [
    {
      id: 1,
      name: "Hội trường A",
      floor: "floor3",
      capacity: 500,
      type: "Hội trường",
      description: "Hội trường chính với sức chứa lớn, trang bị hệ thống âm thanh và ánh sáng hiện đại",
      features: ["Âm thanh", "Ánh sáng", "Máy chiếu", "WiFi"],
      status: "available",
      location: "Tầng 3, Phòng 301",
      coordinates: { x: 50, y: 30 }
    },
    {
      id: 2,
      name: "Phòng họp 201",
      floor: "floor2", 
      capacity: 100,
      type: "Phòng họp",
      description: "Phòng họp vừa với bàn tròn, phù hợp cho thảo luận nhóm",
      features: ["Bàn tròn", "Máy chiếu", "WiFi", "Điều hòa"],
      status: "occupied",
      location: "Tầng 2, Phòng 201",
      coordinates: { x: 30, y: 60 }
    },
    {
      id: 3,
      name: "Workshop Room 202",
      floor: "floor2",
      capacity: 50,
      type: "Workshop",
      description: "Phòng workshop với bàn dài, phù hợp cho hands-on training",
      features: ["Bàn dài", "Bảng trắng", "WiFi", "Máy tính"],
      status: "available", 
      location: "Tầng 2, Phòng 202",
      coordinates: { x: 70, y: 60 }
    },
    {
      id: 4,
      name: "Sảnh chính",
      floor: "floor1",
      capacity: 200,
      type: "Sảnh",
      description: "Khu vực đăng ký và networking, có quầy bar và khu vực nghỉ ngơi",
      features: ["Quầy bar", "Khu nghỉ", "WiFi", "Điều hòa"],
      status: "available",
      location: "Tầng 1, Sảnh chính",
      coordinates: { x: 50, y: 80 }
    }
  ];

  const amenities = [
    {
      name: "Quầy đăng ký",
      icon: MapPin,
      location: "Tầng 1, Sảnh chính",
      description: "Đăng ký tham dự và nhận tài liệu"
    },
    {
      name: "Quầy cà phê",
      icon: Coffee,
      location: "Tầng 1, Góc sảnh",
      description: "Cà phê, trà và đồ ăn nhẹ"
    },
    {
      name: "Bãi đỗ xe",
      icon: Car,
      location: "Tầng hầm",
      description: "Bãi đỗ xe miễn phí cho tham dự viên"
    },
    {
      name: "WiFi miễn phí",
      icon: Wifi,
      location: "Toàn bộ tòa nhà",
      description: "Kết nối internet tốc độ cao"
    }
  ];

  const filteredVenues = venues.filter(venue => {
    const matchesFloor = venue.floor === selectedFloor;
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                          variant={selectedFloor === floor.id ? "default" : "outline"}
                          onClick={() => setSelectedFloor(floor.id)}
                          className="w-full justify-start"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="font-medium">{floor.name}</div>
                            <div className="text-sm opacity-80">{floor.description}</div>
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
                        const Icon = amenity.icon;
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
                    {floors.find(f => f.id === selectedFloor)?.name} - 
                    {floors.find(f => f.id === selectedFloor)?.description}
                  </CardTitle>
                  <CardDescription>
                    {filteredVenues.length} phòng họp và khu vực
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredVenues.map((venue) => (
                      <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusBadge(venue.status)}
                                <Badge variant="outline">{venue.type}</Badge>
                                <Badge variant="secondary">{venue.capacity} người</Badge>
                              </div>
                              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                {venue.name}
                              </h3>
                              <p className="text-slate-600 mb-4">{venue.description}</p>
                              <p className="text-sm text-slate-500 mb-4">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                {venue.location}
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
                            {venue.features.map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredVenues.length === 0 && (
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
