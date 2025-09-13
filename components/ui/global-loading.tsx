"use client";

import { useState, useEffect } from "react";

interface GlobalLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "fullscreen";
  className?: string;
}

export function GlobalLoading({
  message = "Đang tải...",
  size = "md",
  variant = "default",
  className = "",
}: GlobalLoadingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const containerClasses = {
    default: "flex items-center justify-center p-8",
    minimal: "flex items-center justify-center p-4",
    fullscreen:
      "fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 z-50 flex items-center justify-center",
  };

  if (variant === "fullscreen") {
    return (
      <div className={`${containerClasses[variant]} ${className}`}>
        <div className="text-center">
          <div className="relative mb-8">
            {/* Animated logo */}
            <div
              className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse`}
            >
              <div className="w-1/2 h-1/2 bg-white rounded-xl flex items-center justify-center">
                <div className="w-2/3 h-2/3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
              </div>
            </div>

            {/* Spinning ring */}
            <div className={`absolute inset-0 ${sizeClasses[size]} mx-auto`}>
              <div className="w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
            </div>
          </div>

          {/* Loading text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h2
              className={`${textSizes[size]} font-bold text-slate-800 dark:text-slate-100 mb-2`}
            >
              ConferenceHub
            </h2>
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
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

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      <div className="text-center">
        <div className="relative mb-4">
          {/* Animated logo */}
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-pulse`}
          >
            <div className="w-1/2 h-1/2 bg-white rounded-lg flex items-center justify-center">
              <div className="w-2/3 h-2/3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded"></div>
            </div>
          </div>

          {/* Spinning ring */}
          <div className={`absolute inset-0 ${sizeClasses[size]} mx-auto`}>
            <div className="w-full h-full border-2 border-blue-200 dark:border-blue-800 rounded-full border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p
            className={`${textSizes[size]} text-slate-600 dark:text-slate-300 font-medium`}
          >
            {message}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Inline loading component for buttons and small elements
export function InlineLoading({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-blue-200 dark:border-blue-800 rounded-full border-t-blue-600 dark:border-t-blue-400 animate-spin`}
    ></div>
  );
}

// Skeleton loading component
export function SkeletonLoading({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          {i < lines - 1 && (
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mt-2"></div>
          )}
        </div>
      ))}
    </div>
  );
}
