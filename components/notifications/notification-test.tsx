"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notificationService } from "@/lib/notification-service";

export function NotificationTest() {
  const testNotifications = [
    {
      type: 'info' as const,
      title: 'Thông tin hệ thống',
      message: 'Hệ thống sẽ được bảo trì vào 22:00 hôm nay.',
    },
    {
      type: 'success' as const,
      title: 'Hoàn thành nhiệm vụ',
      message: 'Bạn đã hoàn thành đăng ký tham gia hội thảo thành công.',
    },
    {
      type: 'warning' as const,
      title: 'Cảnh báo',
      message: 'Phiên họp sắp bắt đầu trong 5 phút.',
    },
    {
      type: 'error' as const,
      title: 'Lỗi hệ thống',
      message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
    },
  ];

  const testPermissionChange = () => {
    notificationService.permissionChanged('attendee', 'staff');
  };

  const testSystemMessage = () => {
    notificationService.systemMessage(
      'Thông báo từ admin',
      'Có cập nhật mới về quy định tham gia hội thảo.'
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Test Notifications</CardTitle>
        <CardDescription>
          Test các loại thông báo khác nhau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {testNotifications.map((notif, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => notificationService[notif.type](notif.title, notif.message)}
            className="w-full justify-start"
          >
            {notif.title}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={testPermissionChange}
          className="w-full justify-start"
        >
          Test Permission Change
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={testSystemMessage}
          className="w-full justify-start"
        >
          Test System Message
        </Button>
      </CardContent>
    </Card>
  );
}
