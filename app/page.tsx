"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PublicHeader } from "@/components/layout/public-header"
import {
  ArrowRight,
  Users,
  Calendar,
  QrCode,
  BarChart3,
  MapPin,
  Award,
  Smartphone,
  Wifi,
  Shield,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Users,
      title: "Quản lý Người tham dự",
      description: "Đăng ký, theo dõi và quản lý thông tin người tham dự một cách hiệu quả",
    },
    {
      icon: Calendar,
      title: "Lập lịch Hội nghị",
      description: "Tạo và quản lý lịch trình hội nghị với giao diện trực quan",
    },
    {
      icon: QrCode,
      title: "Check-in QR Code",
      description: "Hệ thống check-in nhanh chóng bằng mã QR với camera tích hợp",
    },
    {
      icon: BarChart3,
      title: "Phân tích AI",
      description: "Báo cáo và phân tích thông minh với AI insights",
    },
    {
      icon: MapPin,
      title: "Bản đồ Tương tác",
      description: "Bản đồ 3D với định vị phòng họp và tiện ích",
    },
    {
      icon: Award,
      title: "Hệ thống Huy hiệu",
      description: "Gamification với huy hiệu và chứng chỉ số",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Người tham dự" },
    { number: "500+", label: "Hội nghị" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Hỗ trợ" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Public Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
              <Star className="w-3 h-3 mr-1" />
              Hệ thống quản lý hội nghị thông minh
            </Badge>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 mb-6 leading-tight">
              Quản lý Hội nghị
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Thông minh & Hiệu quả
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Nền tảng quản lý hội nghị toàn diện với AI, tích hợp QR check-in, bản đồ tương tác và hệ thống phân tích
              thông minh. Tối ưu hóa trải nghiệm cho người tổ chức và người tham dự.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
                >
                  Đăng nhập Admin
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                Xem demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
              Truy cập nhanh các tính năng chính
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Không cần đăng nhập, bạn có thể truy cập ngay các tính năng dành cho người tham dự
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/checkin-public">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Check-in QR</h3>
                  <p className="text-slate-600 text-sm mb-4">Quét mã QR để check-in tham dự hội nghị</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Truy cập ngay
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/venue-public">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Bản đồ địa điểm</h3>
                  <p className="text-slate-600 text-sm mb-4">Xem bản đồ và tìm đường đến hội nghị</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Xem bản đồ
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mobile-public">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Ứng dụng di động</h3>
                  <p className="text-slate-600 text-sm mb-4">Tải ứng dụng di động cho trải nghiệm tốt nhất</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Tải ứng dụng
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sessions">
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Lịch trình</h3>
                  <p className="text-slate-600 text-sm mb-4">Xem lịch trình và phiên họp của hội nghị</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Xem lịch trình
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700">Tính năng nổi bật</Badge>
            <h2 className="text-4xl font-serif font-bold text-slate-800 mb-4">Giải pháp toàn diện cho mọi sự kiện</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Từ đăng ký đến check-in, từ phân tích đến networking - tất cả trong một nền tảng thống nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Shield className="w-3 h-3 mr-1" />
            Công nghệ tiên tiến
          </Badge>
          <h2 className="text-4xl font-serif font-bold mb-6">Được xây dựng với công nghệ hàng đầu</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Hệ thống được phát triển với Next.js, AI integration, real-time updates, PWA support và bảo mật cao cấp
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">PWA Ready</h3>
              <p className="text-slate-400">Hoạt động offline, cài đặt như app native</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-slate-400">Cập nhật dữ liệu theo thời gian thực</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bảo mật cao</h3>
              <p className="text-slate-400">Mã hóa end-to-end, tuân thủ GDPR</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">Sẵn sàng tổ chức hội nghị thành công?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn tổ chức đã tin tưởng ConferenceHub để quản lý sự kiện của họ
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-50 px-8 py-3">
              Đăng nhập ngay
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl">ConferenceHub</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 ConferenceHub. Tất cả quyền được bảo lưu.</p>
              <p className="text-sm mt-1">Được phát triển với ❤️ tại Việt Nam</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
