"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  QrCode, 
  Users, 
  Camera, 
  Search,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

export function UsageGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const guideSteps = [
    {
      id: 'select-conference',
      title: 'Chọn Hội nghị',
      icon: CheckCircle,
      description: 'Chọn hội nghị từ dropdown ở đầu trang để bắt đầu check-in',
      details: 'Tất cả các thao tác check-in sẽ áp dụng cho hội nghị đã chọn. Đảm bảo chọn đúng hội nghị trước khi thực hiện check-in.'
    },
    {
      id: 'qr-scan',
      title: 'Quét QR Code',
      icon: QrCode,
      description: 'Sử dụng camera để quét mã QR của tham dự viên',
      details: 'Chuyển sang tab "Quét QR Code", nhấn "Bắt đầu quét" để kích hoạt camera. Đặt mã QR trong khung quét và hệ thống sẽ tự động phát hiện.'
    },
    {
      id: 'manual-checkin',
      title: 'Check-in Thủ công',
      icon: Users,
      description: 'Tìm kiếm và check-in tham dự viên bằng cách nhập thông tin',
      details: 'Chuyển sang tab "Check-in Thủ công", tìm kiếm tham dự viên hoặc sử dụng form check-in thủ công cho tham dự viên mới.'
    },
    {
      id: 'view-records',
      title: 'Xem Lịch sử',
      icon: Search,
      description: 'Xem danh sách tất cả các lần check-in đã thực hiện',
      details: 'Cuộn xuống để xem danh sách lịch sử check-in. Sử dụng thanh tìm kiếm để lọc kết quả theo tên, email hoặc mã QR.'
    },
    {
      id: 'export-data',
      title: 'Xuất Báo cáo',
      icon: CheckCircle,
      description: 'Xuất dữ liệu check-in ra file Excel',
      details: 'Nhấn nút "Xuất báo cáo" để tải file Excel chứa tất cả dữ liệu check-in của hội nghị đã chọn.'
    }
  ];

  const tips = [
    {
      icon: Camera,
      title: 'Camera Tips',
      text: 'Đảm bảo có đủ ánh sáng và mã QR rõ nét khi quét'
    },
    {
      icon: AlertCircle,
      title: 'Lỗi Check-in',
      text: 'Kiểm tra mã QR có hợp lệ và tham dự viên đã đăng ký hội nghị'
    },
    {
      icon: Info,
      title: 'API Status',
      text: 'Hệ thống sẽ tự động chuyển sang chế độ mock nếu API không khả dụng'
    }
  ];

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Hướng dẫn sử dụng</CardTitle>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <CardDescription>
              Hướng dẫn chi tiết cách sử dụng hệ thống check-in
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Các bước thực hiện</h3>
              <div className="space-y-4">
                {guideSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <div key={step.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-primary">Bước {index + 1}</span>
                          <h4 className="font-medium">{step.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <p className="text-xs text-muted-foreground">{step.details}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mẹo sử dụng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium">{tip.title}</h4>
                        <p className="text-xs text-muted-foreground">{tip.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Thao tác nhanh</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  Quét QR
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Check-in Thủ công
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
