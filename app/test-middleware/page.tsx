"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function TestMiddlewarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">
            Test Middleware
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Trang này được tạo để test middleware - nếu bạn thấy trang này thì middleware đã hoạt động đúng!
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Middleware hoạt động đúng!</span>
            </CardTitle>
            <CardDescription>
              Trang này có thể truy cập mà không cần đăng nhập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nếu bạn thấy trang này, có nghĩa là:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Middleware đã được cập nhật đúng</li>
                <li>Route /test-middleware đã được thêm vào publicRoutes</li>
                <li>Không cần đăng nhập để truy cập trang này</li>
              </ul>
              
              <div className="pt-4">
                <Link href="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
