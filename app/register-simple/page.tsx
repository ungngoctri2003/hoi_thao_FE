"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useNotification } from "@/hooks/use-notification"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { AttendeeRegistrationForm } from "@/components/attendees/attendee-registration-form"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("attendee")
  const router = useRouter()
  const { register, isLoading, isAuthenticated, user } = useAuth()
  const { showError, showSuccess } = useNotification()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError("Thiếu thông tin", "Vui lòng nhập họ tên")
      return false
    }
    if (!formData.email.trim()) {
      showError("Thiếu thông tin", "Vui lòng nhập email")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showError("Email không hợp lệ", "Vui lòng nhập địa chỉ email hợp lệ")
      return false
    }
    if (!formData.password) {
      showError("Thiếu thông tin", "Vui lòng nhập mật khẩu")
      return false
    }
    if (formData.password.length < 6) {
      showError("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Mật khẩu không khớp", "Mật khẩu xác nhận không khớp với mật khẩu")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await register(formData.email, formData.name, formData.password)
      setSuccess(true)
      showSuccess("Đăng ký thành công", "Tài khoản đã được tạo thành công")
      // Navigation will be handled by the useEffect above
      // Also try to redirect after a short delay
      setTimeout(() => {
        if (isAuthenticated && user) {
          router.push("/dashboard")
        }
      }, 1000)
    } catch (err: any) {
      showError("Đăng ký thất bại", err.message || "Vui lòng thử lại sau ít phút")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-serif font-bold">Đăng ký thành công!</CardTitle>
            <CardDescription>
              {isAuthenticated && user ? (
                <>
                  Chào mừng <strong>{user.name}</strong>! Tài khoản của bạn đã được tạo và đăng nhập thành công.
                </>
              ) : (
                "Tài khoản của bạn đã được tạo thành công. Bạn có thể đăng nhập ngay bây giờ."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated && user ? (
              <Button 
                onClick={() => router.push("/dashboard")} 
                className="w-full"
              >
                Đến trang chủ
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => router.push("/login")} 
                  className="w-full"
                >
                  Đăng nhập ngay
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard")} 
                  className="w-full"
                >
                  Đến trang chủ
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900">
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-200/30 dark:bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-emerald-200/30 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-teal-200/30 dark:bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(5, 150, 105, 0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">Đăng ký</h1>
            <p className="text-muted-foreground">Chọn loại đăng ký phù hợp với nhu cầu của bạn</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="attendee">Đăng ký tham dự</TabsTrigger>
              <TabsTrigger value="account">Tạo tài khoản</TabsTrigger>
            </TabsList>

            <TabsContent value="attendee">
              <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-2xl rounded-lg">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif font-bold mb-2">Đăng ký tham dự hội nghị</h2>
                    <p className="text-muted-foreground">Tham gia các hội nghị và sự kiện chuyên nghiệp</p>
                  </div>
                  <AttendeeRegistrationForm />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-serif font-bold">Tạo tài khoản hệ thống</CardTitle>
                  <CardDescription>Tạo tài khoản để truy cập đầy đủ tính năng hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          required
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          required
                          className="pr-10"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                      disabled={isLoading || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Đang đăng ký...
                        </div>
                      ) : (
                        "Đăng ký"
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Hoặc
                      </span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <GoogleSignInButton 
                    mode="register"
                    onSuccess={() => {
                      router.push("/dashboard")
                    }}
                    onError={(error) => {
                      showError("Đăng ký Google thất bại", error)
                    }}
                  />

                  {/* Login section */}
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Đã có tài khoản?
                      </p>
                      <Link href="/login">
                        <Button 
                          variant="outline" 
                          className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary hover:text-primary-foreground"
                        >
                          Đăng nhập ngay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}