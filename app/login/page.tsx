"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Home, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/hooks/use-notification";
import { useTheme } from "next-themes";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { GlobalLoading, InlineLoading } from "@/components/ui/global-loading";
import { GoogleAuthRedirectHandler } from "@/components/auth/google-auth-redirect-handler";
import { AccountDisabledNotice } from "@/components/auth/account-disabled-notice";
import { AccountDisabledAlert } from "@/components/auth/account-disabled-alert";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const { showError } = useNotification();
  const { theme, setTheme } = useTheme();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
      // The redirect will happen automatically when isAuthenticated becomes true
    } catch (err: any) {
      showError(
        "Đăng nhập thất bại",
        err.message || "Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    }
  };

  return (
    <>
      <GoogleAuthRedirectHandler />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header with Back Button and Theme Toggle */}
        <div className="relative z-10 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Về trang chủ</span>
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
          {/* Account Disabled Notice */}
          <div className="absolute top-4 left-4 right-4 max-w-2xl mx-auto">
            <AccountDisabledNotice email={email} />
          </div>

          <div className="w-full max-w-md">
            <Card className="border-0 shadow-2xl bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-blue-100 dark:to-indigo-200 bg-clip-text text-transparent">
                      Chào mừng trở lại
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-blue-200 mt-2">
                      Đăng nhập để tiếp tục sử dụng hệ thống
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700 dark:text-blue-100"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 border-slate-200 dark:border-blue-800 dark:bg-gray-800/50 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 dark:text-blue-100"
                    >
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-12 border-slate-200 dark:border-blue-800 dark:bg-gray-800/50 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400 dark:text-blue-300" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400 dark:text-blue-300" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200 hover:underline font-medium"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !email.trim() || !password.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <InlineLoading size="sm" />
                        Đang đăng nhập...
                      </div>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-blue-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-4 text-slate-500 dark:text-blue-200 font-medium">
                      Hoặc
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <div className="space-y-4">
                  <GoogleSignInButton
                    mode="login"
                    size="lg"
                    className="h-12 border-slate-200 dark:border-blue-800 dark:bg-gray-800/50 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:border-slate-300 dark:hover:border-blue-600 hover:scale-[1.02] font-medium"
                    onSuccess={() => {
                      const redirectTo =
                        searchParams.get("redirect") || "/dashboard";
                      router.push(redirectTo);
                    }}
                    onError={(error) => {
                      showError("Đăng nhập Google thất bại", error);
                    }}
                  />

                  {/* Register section */}
                  <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-blue-200 mb-4">
                      Chưa có tài khoản?
                    </p>
                    <Link href="/register-simple">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-12 border-slate-200 dark:border-blue-800 dark:bg-gray-800/50 hover:bg-slate-50 dark:hover:bg-gray-700/50 hover:border-slate-300 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.02] font-medium"
                      >
                        Tạo tài khoản mới
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Disabled Alert */}
        <AccountDisabledAlert email={email} />
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <GlobalLoading
          message="Đang tải trang đăng nhập..."
          variant="fullscreen"
        />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
