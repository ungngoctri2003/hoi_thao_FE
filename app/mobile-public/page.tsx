"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Apple, 
  Globe,
  Shield,
  Star,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Camera,
  Bell,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function PublicMobilePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Smartphone className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Ứng dụng di động</h1>
                <p className="text-muted-foreground">
                  Tải và sử dụng ứng dụng di động cho hội nghị
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Xem web
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Tải ứng dụng
              </Button>
            </div>
          </div>

          {/* App Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Apple className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">iOS App</p>
                    <p className="text-lg font-bold">4.8★</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Android App</p>
                    <p className="text-lg font-bold">4.6★</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Tổng tải</p>
                    <p className="text-lg font-bold">2,230</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Section */}
          <Card>
            <CardHeader>
              <CardTitle>Tải ứng dụng</CardTitle>
              <CardDescription>
                Tải ứng dụng di động để có trải nghiệm tốt nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* iOS Download */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                      <Apple className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">iOS App</h3>
                      <p className="text-sm text-muted-foreground">Phiên bản 2.1.0</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Apple className="h-4 w-4 mr-2" />
                    Tải từ App Store
                  </Button>
                </div>

                {/* Android Download */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Android App</h3>
                      <p className="text-sm text-muted-foreground">Phiên bản 2.1.0</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Tải từ Google Play
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Check-in QR</h3>
                <p className="text-sm text-muted-foreground">
                  Quét mã QR để check-in nhanh chóng và dễ dàng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lịch trình</h3>
                <p className="text-sm text-muted-foreground">
                  Xem lịch trình chi tiết các phiên họp và sự kiện
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bản đồ</h3>
                <p className="text-sm text-muted-foreground">
                  Tìm đường và định vị các phòng họp, tiện ích
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Networking</h3>
                <p className="text-sm text-muted-foreground">
                  Kết nối và chat với các tham dự viên khác
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Thông báo</h3>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo real-time về sự kiện và cập nhật
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bảo mật</h3>
                <p className="text-sm text-muted-foreground">
                  Dữ liệu được mã hóa và bảo vệ an toàn
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ người dùng</CardTitle>
              <CardDescription>
                Những phản hồi tích cực từ cộng đồng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">5.0/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Ứng dụng rất tiện lợi, check-in nhanh chóng và giao diện thân thiện. 
                    Tôi có thể dễ dàng xem lịch trình và kết nối với mọi người."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">NV</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nguyễn Văn A</p>
                      <p className="text-xs text-muted-foreground">Tham dự viên</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">5.0/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Tính năng bản đồ rất hữu ích, giúp tôi tìm đường dễ dàng. 
                    Ứng dụng hoạt động mượt mà và ổn định."
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">TT</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Trần Thị B</p>
                      <p className="text-xs text-muted-foreground">Tham dự viên</p>
                    </div>
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
