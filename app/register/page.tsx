"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useAuth } from "@/hooks/use-auth"

export default function RegisterPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Đăng ký</h1>
          <p className="text-muted-foreground">Chọn loại đăng ký phù hợp với nhu cầu của bạn</p>
        </div>

        <Tabs value="attendee" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="attendee">Đăng ký tham dự</TabsTrigger>
            <TabsTrigger value="account">Tạo tài khoản</TabsTrigger>
          </TabsList>

          <TabsContent value="attendee">
            <Card>
              <CardHeader>
                <CardTitle>Đăng ký tham dự hội nghị</CardTitle>
                <CardDescription>
                  Đăng ký tham dự các hội nghị chuyên nghiệp và kết nối với cộng đồng.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Tham gia các hội nghị và sự kiện chuyên nghiệp
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/register-attendee">
                      Đăng ký tham dự
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Cần tạo tài khoản trước?{" "}
                    <Link href="/register-simple" className="text-primary hover:underline">
                      Tạo tài khoản ngay
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Tạo tài khoản hệ thống</CardTitle>
                <CardDescription>
                  Tạo tài khoản để truy cập đầy đủ các tính năng của hệ thống quản lý hội nghị.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Tạo tài khoản đơn giản để bắt đầu sử dụng hệ thống
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/register-simple">
                      Tạo tài khoản mới
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
