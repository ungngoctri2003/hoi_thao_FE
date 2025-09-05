"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  QrCode, 
  MapPin, 
  Smartphone, 
  Menu, 
  X,
  Calendar,
  Users,
  Home
} from "lucide-react";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: Home,
      description: "Về trang chủ"
    },
    {
      name: "Check-in",
      href: "/checkin-public",
      icon: QrCode,
      description: "Quét QR code để check-in"
    },
      {
      name: "Đăng ký tham dự",
      href: "/register-attendee",
      icon: Calendar,
      description: "Đăng ký tham dự hội nghị"
    },
    {
      name: "Lịch trình",
      href: "/sessions-public",
      icon: Calendar,
      description: "Xem lịch trình hội nghị"
    },
    {
      name: "Bản đồ địa điểm",
      href: "/venue-public",
      icon: MapPin,
      description: "Xem bản đồ và địa điểm hội nghị"
    },
    {
      name: "Ứng dụng di động",
      href: "/mobile-public",
      icon: Smartphone,
      description: "Tải ứng dụng di động"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Conference Management</h1>
              <p className="text-xs text-muted-foreground">Hệ thống quản lý hội nghị</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="flex items-center space-x-2 h-10 px-4"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          <div className="md:hidden border-t">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        isActive(item.href) 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm opacity-80">{item.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
