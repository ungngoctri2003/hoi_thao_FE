"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  MapPin,
  Smartphone,
  Calendar,
  ArrowUpRight,
  User,
} from "lucide-react";
import Link from "next/link";

const quickAccessItems = [
  {
    href: "/checkin-public",
    icon: QrCode,
    title: "Check-in QR",
    description: "Quét mã QR để check-in tham dự hội nghị",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    hoverColor: "hover:from-green-600 hover:to-emerald-600",
  },
  {
    href: "/venue-public",
    icon: MapPin,
    title: "Bản đồ địa điểm",
    description: "Xem bản đồ và tìm đường đến hội nghị",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    hoverColor: "hover:from-blue-600 hover:to-cyan-600",
  },
  {
    href: "/register-attendee",
    icon: User,
    title: "Đăng ký miễn phí",
    description: "Đăng ký miễn phí để trải nghiệm tốt nhất",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    hoverColor: "hover:from-purple-600 hover:to-pink-600",
  },
  {
    href: "/sessions",
    icon: Calendar,
    title: "Lịch trình",
    description: "Xem lịch trình và phiên họp của hội nghị",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    hoverColor: "hover:from-orange-600 hover:to-red-600",
  },
];

export function FloatingCards() {
  return (
    <section className="py-24 px-4 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-300 text-sm font-medium mb-6 shadow-lg">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Truy cập nhanh các tính năng chính
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-6">
            Không cần đăng nhập
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              truy cập ngay
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Bạn có thể truy cập ngay các tính năng dành cho người tham dự mà
            không cần tài khoản
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-700/80 hover:scale-105 hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  ></div>

                  <CardContent className="p-6 text-center relative z-10">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${item.color} ${item.hoverColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all duration-300"
                    >
                      Truy cập ngay
                      <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
