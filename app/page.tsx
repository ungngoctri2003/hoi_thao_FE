"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
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
  Sparkles,
  Zap,
  Globe,
  Heart,
  TrendingUp,
  CheckCircle,
  Play,
  ChevronRight,
  ArrowUpRight,
  Target,
  Layers,
  Lightbulb,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Particles } from "@/components/ui/particles";
import { FloatingCards } from "@/components/ui/floating-cards";
import { LoadingAnimation } from "@/components/ui/loading-animation";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Quản lý Người tham dự",
      description:
        "Đăng ký, theo dõi và quản lý thông tin người tham dự một cách hiệu quả",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Calendar,
      title: "Lập lịch Hội nghị",
      description: "Tạo và quản lý lịch trình hội nghị với giao diện trực quan",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      icon: QrCode,
      title: "Check-in QR Code",
      description:
        "Hệ thống check-in nhanh chóng bằng mã QR với camera tích hợp",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: BarChart3,
      title: "Phân tích AI",
      description: "Báo cáo và phân tích thông minh với AI insights",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      icon: MapPin,
      title: "Bản đồ Tương tác",
      description: "Bản đồ 3D với định vị phòng họp và tiện ích",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
    {
      icon: Award,
      title: "Hệ thống Huy hiệu",
      description: "Gamification với huy hiệu và chứng chỉ số",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Người tham dự", icon: Users },
    { number: "500+", label: "Hội nghị", icon: Calendar },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "24/7", label: "Hỗ trợ", icon: Heart },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Giám đốc Marketing",
      company: "TechCorp Vietnam",
      content:
        "ConferenceHub đã thay đổi hoàn toàn cách chúng tôi tổ chức sự kiện. Giao diện đẹp, tính năng mạnh mẽ!",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Trần Thị B",
      role: "Event Manager",
      company: "EventPro",
      content:
        "AI analytics giúp chúng tôi hiểu rõ hơn về người tham dự và tối ưu hóa trải nghiệm.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Lê Văn C",
      role: "CEO",
      company: "StartupHub",
      content:
        "Từ check-in QR đến bản đồ tương tác, mọi thứ đều được tích hợp hoàn hảo!",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Tốc độ siêu nhanh",
      description: "Tải trang dưới 2 giây, check-in chỉ trong 3 giây",
    },
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description: "Mã hóa end-to-end, tuân thủ GDPR và ISO 27001",
    },
    {
      icon: Globe,
      title: "Đa ngôn ngữ",
      description: "Hỗ trợ 15+ ngôn ngữ, tự động phát hiện ngôn ngữ",
    },
    {
      icon: Smartphone,
      title: "Mobile-first",
      description: "Thiết kế ưu tiên mobile, PWA support",
    },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden relative">
      {/* Particles Effect */}
      <Particles />

      {/* Public Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <Badge className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-300 dark:hover:from-blue-800/50 dark:hover:to-purple-800/50 px-6 py-2 text-sm font-medium border-0 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Hệ thống quản lý hội nghị thông minh
            </Badge>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-800 dark:text-slate-100 mb-8 leading-tight tracking-tight">
              <span className="block">Quản lý Hội nghị</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent animate-pulse">
                Thông minh & Hiệu quả
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Nền tảng quản lý hội nghị toàn diện với{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                AI
              </span>
              , tích hợp{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                QR check-in
              </span>
              ,
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {" "}
                bản đồ tương tác
              </span>{" "}
              và hệ thống phân tích thông minh. Tối ưu hóa trải nghiệm cho người
              tổ chức và người tham dự.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 group"
                >
                  <Rocket className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  Đăng nhập Admin
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-4 text-lg font-semibold bg-white/80 dark:bg-slate-800/80 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/80 hover:bg-white/90 border-2 border-slate-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Xem demo
              </Button>
            </div>

            {/* Floating Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Check-in QR
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Nhanh chóng
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Bản đồ 3D
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Tương tác
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  AI Analytics
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Thông minh
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Gamification
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Huy hiệu
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <FloatingCards />

      {/* Stats Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 dark:from-green-900/50 dark:to-blue-900/50 dark:text-green-300 px-6 py-2 text-sm font-medium border-0 shadow-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Thống kê ấn tượng
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-6">
              Con số biết nói
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Hàng nghìn tổ chức đã tin tưởng và sử dụng ConferenceHub để quản
              lý sự kiện của họ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 font-semibold text-lg">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300 px-6 py-2 text-sm font-medium border-0 shadow-lg">
              <Lightbulb className="w-4 h-4 mr-2" />
              Tính năng nổi bật
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 mb-6">
              Giải pháp toàn diện
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                cho mọi sự kiện
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Từ đăng ký đến check-in, từ phân tích đến networking - tất cả
              trong một nền tảng thống nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700/80 hover:scale-105 hover:-translate-y-2"
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Tìm hiểu thêm
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-300 px-6 py-2 text-sm font-medium border-0 shadow-lg">
              <Target className="w-4 h-4 mr-2" />
              Lợi ích vượt trội
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 mb-6">
              Tại sao chọn
              <span className="block bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                ConferenceHub?
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-300 px-6 py-2 text-sm font-medium border-0 shadow-lg">
              <Heart className="w-4 h-4 mr-2" />
              Khách hàng nói gì
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black text-slate-800 dark:text-slate-100 mb-6">
              Phản hồi từ
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                khách hàng
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-slate-700/20">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white dark:border-slate-700 shadow-lg">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <blockquote className="text-2xl md:text-3xl font-light text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? "bg-blue-500 scale-125"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {testimonials[currentTestimonial].role} tại{" "}
                    {testimonials[currentTestimonial].company}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-800 dark:via-blue-800 dark:to-indigo-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-8 bg-white/10 text-white border-white/20 px-6 py-2 text-sm font-medium shadow-lg">
            <Layers className="w-4 h-4 mr-2" />
            Công nghệ tiên tiến
          </Badge>
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Được xây dựng với
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              công nghệ hàng đầu
            </span>
          </h2>
          <p className="text-xl text-slate-300 dark:text-slate-200 mb-16 max-w-4xl mx-auto leading-relaxed">
            Hệ thống được phát triển với Next.js, AI integration, real-time
            updates, PWA support và bảo mật cao cấp
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Smartphone className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors duration-300">
                PWA Ready
              </h3>
              <p className="text-slate-400 dark:text-slate-300 text-lg leading-relaxed">
                Hoạt động offline, cài đặt như app native với trải nghiệm mượt
                mà
              </p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-purple-400 transition-colors duration-300">
                Real-time
              </h3>
              <p className="text-slate-400 dark:text-slate-300 text-lg leading-relaxed">
                Cập nhật dữ liệu theo thời gian thực với WebSocket và AI
              </p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-green-400 transition-colors duration-300">
                Bảo mật cao
              </h3>
              <p className="text-slate-400 dark:text-slate-300 text-lg leading-relaxed">
                Mã hóa end-to-end, tuân thủ GDPR và ISO 27001
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Sẵn sàng tổ chức
            <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              hội nghị thành công?
            </span>
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tham gia cùng hàng nghìn tổ chức đã tin tưởng ConferenceHub để quản
            lý sự kiện của họ
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-slate-100 dark:text-blue-700 dark:hover:bg-slate-200 px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 group"
              >
                <Rocket className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Đăng nhập ngay
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-12 py-4 text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 group"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Xem demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-indigo-900/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">ConferenceHub</h3>
                  <p className="text-slate-400 text-sm">
                    Hệ thống quản lý hội nghị
                  </p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                Nền tảng quản lý hội nghị thông minh với AI, tích hợp QR
                check-in, bản đồ tương tác và hệ thống phân tích toàn diện.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors duration-300 cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors duration-300 cursor-pointer">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors duration-300 cursor-pointer">
                  <Star className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Tính năng chính</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  Quản lý người tham dự
                </li>
                <li className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  Check-in QR Code
                </li>
                <li className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  Bản đồ tương tác 3D
                </li>
                <li className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  Phân tích AI thông minh
                </li>
                <li className="flex items-center text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  Hệ thống huy hiệu
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Liên hệ</h4>
              <div className="space-y-4">
                <div className="flex items-center text-slate-400">
                  <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Heart className="w-5 h-5 mr-3 text-red-500" />
                  <span>support@conferencehub.vn</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Shield className="w-5 h-5 mr-3 text-green-500" />
                  <span>Bảo mật tuyệt đối</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-center md:text-left mb-4 md:mb-0">
                <p>&copy; 2024 ConferenceHub. Tất cả quyền được bảo lưu.</p>
                <p className="text-sm mt-1">
                  Được phát triển với ❤️ tại Việt Nam
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Chính sách bảo mật
                </span>
                <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Điều khoản sử dụng
                </span>
                <span className="hover:text-white transition-colors duration-300 cursor-pointer">
                  Hỗ trợ
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
