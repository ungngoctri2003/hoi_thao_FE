"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  Mail, 
  Wifi,
  Car,
  Bus,
  Train,
  Plane,
  Coffee,
  Utensils,
  Car as Parking,
  Accessibility
} from "lucide-react";

export default function VenuePage() {
  const [selectedFloor, setSelectedFloor] = useState(1);

  const venueInfo = {
    name: "Trung tâm Hội nghị Quốc gia",
    address: "Số 1 Thăng Long, Nam Từ Liêm, Hà Nội",
    phone: "+84 24 3825 1234",
    email: "info@ncc.gov.vn",
    website: "www.ncc.gov.vn",
    capacity: "1000 người",
    parking: "500 chỗ đỗ xe",
    wifi: "Miễn phí",
    accessibility: "Có hỗ trợ người khuyết tật"
  };

  const floors = [
    {
      id: 1,
      name: "Tầng 1 - Sảnh chính",
      rooms: [
        { name: "Sảnh đăng ký", capacity: "200", features: ["Check-in", "Thông tin", "Quầy lễ tân"] },
        { name: "Hội trường A", capacity: "500", features: ["Sân khấu chính", "Âm thanh", "Ánh sáng"] },
        { name: "Phòng VIP", capacity: "50", features: ["Khách mời", "Nghỉ ngơi", "Coffee"] }
      ]
    },
    {
      id: 2,
      name: "Tầng 2 - Phòng họp",
      rooms: [
        { name: "Phòng họp 201", capacity: "100", features: ["Họp nhóm", "Thuyết trình", "Video call"] },
        { name: "Phòng họp 202", capacity: "80", features: ["Workshop", "Thảo luận", "Bảng trắng"] },
        { name: "Phòng họp 203", capacity: "60", features: ["Họp kín", "Tư vấn", "Máy chiếu"] }
      ]
    },
    {
      id: 3,
      name: "Tầng 3 - Khu vực networking",
      rooms: [
        { name: "Khu networking", capacity: "200", features: ["Giao lưu", "Kết nối", "Coffee break"] },
        { name: "Khu triển lãm", capacity: "300", features: ["Gian hàng", "Sản phẩm", "Demo"] },
        { name: "Khu ăn uống", capacity: "150", features: ["Buffet", "Đồ uống", "Nghỉ ngơi"] }
      ]
    }
  ];

  const facilities = [
    { icon: Wifi, name: "WiFi miễn phí", description: "Kết nối internet tốc độ cao" },
    { icon: Parking, name: "Bãi đỗ xe", description: "500 chỗ đỗ xe miễn phí" },
    { icon: Coffee, name: "Khu cà phê", description: "Cà phê và đồ uống đa dạng" },
    { icon: Utensils, name: "Nhà hàng", description: "Buffet và món ăn địa phương" },
    { icon: Accessibility, name: "Thân thiện", description: "Hỗ trợ người khuyết tật" },
    { icon: Phone, name: "Hỗ trợ 24/7", description: "Đội ngũ hỗ trợ chuyên nghiệp" }
  ];

  const transportation = [
    { icon: Car, name: "Xe ô tô", description: "Bãi đỗ xe rộng rãi, miễn phí" },
    { icon: Bus, name: "Xe buýt", description: "Tuyến 01, 02, 03 - Dừng ngay trước cửa" },
    { icon: Train, name: "Tàu điện", description: "Ga Cát Linh - 5 phút đi bộ" },
    { icon: Plane, name: "Sân bay", description: "Nội Bài - 45 phút bằng taxi" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
            Bản đồ địa điểm hội nghị
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Khám phá không gian hội nghị với bản đồ tương tác và thông tin chi tiết
          </p>
        </div>

        {/* Venue Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              <span>Thông tin địa điểm</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{venueInfo.name}</h3>
                  <p className="text-slate-600 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venueInfo.address}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span>{venueInfo.phone}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span>{venueInfo.email}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{venueInfo.capacity}</p>
                    <p className="text-sm text-slate-600">Sức chứa</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{venueInfo.parking}</p>
                    <p className="text-sm text-slate-600">Chỗ đỗ xe</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">WiFi miễn phí</Badge>
                  <Badge variant="secondary">Thân thiện người khuyết tật</Badge>
                  <Badge variant="secondary">Hỗ trợ 24/7</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Floor Plan */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Sơ đồ tầng</CardTitle>
                <CardDescription>
                  Chọn tầng để xem chi tiết các phòng và khu vực
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Floor Tabs */}
                <div className="flex space-x-2 mb-6">
                  {floors.map((floor) => (
                    <Button
                      key={floor.id}
                      variant={selectedFloor === floor.id ? "default" : "outline"}
                      onClick={() => setSelectedFloor(floor.id)}
                      className="flex-1"
                    >
                      {floor.name}
                    </Button>
                  ))}
                </div>

                {/* Floor Content */}
                <div className="space-y-4">
                  {floors
                    .filter(floor => floor.id === selectedFloor)
                    .map((floor) => (
                      <div key={floor.id}>
                        <h3 className="text-lg font-semibold mb-4">{floor.name}</h3>
                        <div className="grid gap-4">
                          {floor.rooms.map((room, index) => (
                            <Card key={index} className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-slate-800">{room.name}</h4>
                                  <p className="text-sm text-slate-600">Sức chứa: {room.capacity}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {room.features.map((feature, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Navigation className="h-4 w-4 mr-1" />
                                  Chỉ đường
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Tiện ích</CardTitle>
                <CardDescription>Các dịch vụ và tiện ích có sẵn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facilities.map((facility, index) => {
                    const Icon = facility.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{facility.name}</p>
                          <p className="text-xs text-slate-600">{facility.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle>Phương tiện di chuyển</CardTitle>
                <CardDescription>Cách đến địa điểm hội nghị</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transportation.map((transport, index) => {
                    const Icon = transport.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transport.name}</p>
                          <p className="text-xs text-slate-600">{transport.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Chỉ đường Google Maps
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Gọi điện đặt chỗ
                </Button>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Liên hệ email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}