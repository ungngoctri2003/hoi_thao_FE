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

  const guideOptions = [
    {
      id: 'select-conference',
      title: '1. Chọn Hội nghị',
      icon: CheckCircle,
      description: 'Bước đầu tiên bắt buộc',
      details: 'Chọn hội nghị từ dropdown ở đầu trang. Tất cả các thao tác check-in sẽ áp dụng cho hội nghị đã chọn.'
    },
    {
      id: 'checkin-methods',
      title: '2. Chọn Phương thức Check-in',
      icon: Users,
      description: 'Bạn có thể chọn một trong hai phương thức sau:',
      details: 'Hai phương thức check-in độc lập, bạn có thể sử dụng bất kỳ phương thức nào phù hợp.',
      options: [
        {
          title: 'Quét QR Code',
          icon: QrCode,
          description: 'Sử dụng camera để quét mã QR của tham dự viên',
          details: 'Chuyển sang tab "Quét QR Code", nhấn "Bắt đầu quét" để kích hoạt camera. Đặt mã QR trong khung quét và hệ thống sẽ tự động phát hiện.'
        },
        {
          title: 'Check-in Thủ công',
          icon: Users,
          description: 'Tìm kiếm và check-in tham dự viên đã đăng ký',
          details: 'Chuyển sang tab "Check-in Thủ công", tìm kiếm tham dự viên bằng tên, email, số điện thoại hoặc mã QR.'
        }
      ]
    },
    {
      id: 'view-records',
      title: '3. Xem Lịch sử Check-in',
      icon: Search,
      description: 'Theo dõi và quản lý lịch sử check-in',
      details: 'Cuộn xuống để xem danh sách lịch sử check-in của hội nghị đã chọn. Sử dụng thanh tìm kiếm để lọc kết quả theo tên, email hoặc mã QR.'
    }
  ];

  const tips = [
    {
      icon: Camera,
      title: 'QR Code Tips',
      text: 'Đảm bảo có đủ ánh sáng và mã QR rõ nét khi quét. Camera sẽ quét toàn màn hình.'
    },
    {
      icon: Search,
      title: 'Tìm kiếm Tips',
      text: 'Có thể tìm kiếm bằng tên, email, số điện thoại hoặc mã QR. Kết quả sẽ tự động cập nhật sau khi check-in.'
    },
    {
      icon: AlertCircle,
      title: 'Lỗi Check-in',
      text: 'Kiểm tra mã QR có hợp lệ và tham dự viên đã đăng ký hội nghị. Hệ thống sẽ hiển thị lỗi rõ ràng.'
    },
    {
      icon: Info,
      title: 'Lịch sử Check-in',
      text: 'Lịch sử chỉ hiển thị data của hội nghị được chọn. Có thể tìm kiếm và lọc kết quả.'
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
            {/* Guide Options */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hướng dẫn sử dụng</h3>
              <div className="space-y-6">
                {guideOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div key={option.id} className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{option.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                          <p className="text-xs text-muted-foreground">{option.details}</p>
                        </div>
                      </div>
                      
                      {/* Sub-options for check-in methods */}
                      {option.options && (
                        <div className="ml-8 space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Các phương thức có sẵn:</p>
                          {option.options.map((subOption, subIndex) => {
                            const SubIconComponent = subOption.icon;
                            return (
                              <div key={subIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                                    <SubIconComponent className="h-3 w-3 text-primary" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{subOption.title}</h5>
                                  <p className="text-xs text-muted-foreground mb-1">{subOption.description}</p>
                                  <p className="text-xs text-muted-foreground">{subOption.details}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCode className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Quét QR Code</span>
                  </div>
                  <p className="text-xs text-blue-700">Sử dụng camera để quét mã QR nhanh chóng</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Tìm kiếm & Check-in</span>
                  </div>
                  <p className="text-xs text-green-700">Tìm kiếm tham dự viên và check-in thủ công</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
