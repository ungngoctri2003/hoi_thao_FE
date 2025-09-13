"use client";

import { InlineLoading } from "./global-loading";

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function ButtonLoading({
  loading = false,
  children,
  loadingText = "Đang xử lý...",
  className = "",
}: ButtonLoadingProps) {
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <InlineLoading size="sm" />
        {loadingText}
      </div>
    );
  }

  return <>{children}</>;
}

// Loading wrapper for any element
export function LoadingWrapper({
  loading = false,
  children,
  fallback = null,
  className = "",
}: {
  loading?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {fallback || <InlineLoading size="md" />}
      </div>
    );
  }

  return <>{children}</>;
}
