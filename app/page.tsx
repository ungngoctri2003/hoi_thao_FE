"use client";

import { ConferenceCheckinList } from "@/components/conferences/conference-checkin-list";
import { PublicHeader } from "@/components/layout/public-header";
import { useState, useEffect } from "react";
import { Particles } from "@/components/ui/particles";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { QrCode, CheckCircle, Users, Calendar } from "lucide-react";

export default function ConferenceCheckinPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCheckin = (conferenceId: number) => {
    // Handle checkin success
    // You can add toast notification or redirect logic here
  };

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
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-indigo-400/10"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <QrCode className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100">
                Check-in Hội nghị
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Chọn hội nghị bạn muốn tham dự và thực hiện check-in nhanh chóng
              với{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                QR Code
              </span>{" "}
              hoặc{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                thông tin cá nhân
              </span>
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Check-in nhanh
                </h3>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Tham dự dễ dàng
                </h3>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-slate-700/20">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                  Lịch trình rõ ràng
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conferences List Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <ConferenceCheckinList onCheckin={handleCheckin} />
        </div>
      </section>
    </div>
  );
}
