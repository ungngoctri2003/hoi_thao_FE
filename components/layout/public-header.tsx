"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  MapPin,
  Menu,
  X,
  Calendar,
  Users,
  Home,
  Moon,
  Sun,
  Star,
} from "lucide-react";
import { useTheme } from "next-themes";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const navigationItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: Home,
      description: "Về trang chủ",
      badge: null,
    },
    {
      name: "Check-in",
      href: "/checkin-public",
      icon: QrCode,
      description: "Quét QR code để check-in",
      badge: null,
    },
    {
      name: "Đăng ký",
      href: "/register-attendee",
      icon: Users,
      description: "Đăng ký tham dự hội nghị",
      badge: "Miễn phí",
    },
    {
      name: "Lịch trình",
      href: "/sessions-public",
      icon: Calendar,
      description: "Xem lịch trình hội nghị",
      badge: null,
    },
    {
      name: "Bản đồ",
      href: "/venue-public",
      icon: MapPin,
      description: "Xem bản đồ và địa điểm",
      badge: "3D",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-slate-800/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60"
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Star className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                ConferenceHub
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Hệ thống quản lý hội nghị thông minh
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`flex items-center space-x-2 h-11 px-4 rounded-xl font-medium transition-all duration-300 group relative ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105"
                    }`}
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge
                        className={`ml-2 text-xs px-2 py-0.5 ${
                          item.badge === "Hot"
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            : item.badge === "Miễn phí"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : item.badge === "3D"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="ml-4 h-10 w-10 p-0 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 hover:scale-105"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 p-0 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 hover:scale-105"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-300 hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/20 dark:border-slate-800/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <div className="py-6 space-y-3">
              {/* Main Navigation */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 mb-3">
                  Điều hướng
                </h3>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Card
                        className={`cursor-pointer transition-all duration-300 group ${
                          isActive(item.href)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.02]"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-xl ${
                                  isActive(item.href)
                                    ? "bg-white/20"
                                    : "bg-slate-100 dark:bg-slate-800"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <p
                                  className={`text-sm ${
                                    isActive(item.href)
                                      ? "text-white/80"
                                      : "text-slate-500 dark:text-slate-400"
                                  }`}
                                >
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            {item.badge && (
                              <Badge
                                className={`${
                                  item.badge === "Hot"
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                    : item.badge === "Miễn phí"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : item.badge === "3D"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
