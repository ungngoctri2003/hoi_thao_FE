"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { 
  QrCode, 
  MapPin, 
  Smartphone, 
  Calendar,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

export default function TestPublicPages() {
  const publicPages = [
    {
      name: "Trang chủ",
      href: "/",
      icon: Calendar,
      description: "Trang chủ với thông tin tổng quan về hội nghị",
      status: "working"
    },
    {
      name: "Check-in QR (Công khai)",
      href: "/checkin-public",
      icon: QrCode,
      description: "Trang check-in QR không cần đăng nhập",
      status: "working"
    },
    {
      name: "Bản đồ địa điểm (Công khai)",
      href: "/venue-public",
      icon: MapPin,
      description: "Trang bản đồ và địa điểm không cần đăng nhập",
      status: "working"
    },
    {
      name: "Ứng dụng di động (Công khai)",
      href: "/mobile-public",
      icon: Smartphone,
      description: "Trang tải ứng dụng di động không cần đăng nhập",
      status: "working"
    },
    {
      name: "Lịch trình (Công khai)",
      href: "/sessions-public",
      icon: Calendar,
      description: "Trang lịch trình hội nghị không cần đăng nhập",
      status: "working"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
            Test các trang công khai
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Kiểm tra tất cả các trang có thể truy cập mà không cần đăng nhập
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicPages.map((page, index) => {
            const Icon = page.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">{page.status}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {page.description}
                  </CardDescription>
                  <Link href={page.href}>
                    <Button className="w-full">
                      Truy cập trang
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Hướng dẫn sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Tất cả các trang đã được tạo</p>
                  <p className="text-sm text-muted-foreground">
                    Các trang công khai đã được tạo và có thể truy cập mà không cần đăng nhập
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Middleware đã được cập nhật</p>
                  <p className="text-sm text-muted-foreground">
                    Các route công khai đã được thêm vào middleware để cho phép truy cập tự do
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Header navigation đã được cập nhật</p>
                  <p className="text-sm text-muted-foreground">
                    PublicHeader và trang chủ đã được cập nhật để link đến các trang công khai mới
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}