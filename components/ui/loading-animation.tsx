"use client";

import { useState, useEffect } from "react";

export function LoadingAnimation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
            </div>
          </div>

          {/* Spinning ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <div className="w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            ConferenceHub
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Đang tải hệ thống quản lý hội nghị...
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
