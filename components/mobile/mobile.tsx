"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Smartphone,
  Download,
  Bell,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Home,
  QrCode,
  Users,
  Calendar,
  Settings,
  MapPin,
} from "lucide-react"

export default function MobilePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [location, setLocation] = useState(false)
  const [offlineData, setOfflineData] = useState(false)

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    // Check online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    checkInstalled()
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === "accepted") {
        setInstallPrompt(null)
        setIsInstalled(true)
      }
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotifications(permission === "granted")
    }
  }

  const requestLocationPermission = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocation(true),
        () => setLocation(false),
      )
    }
  }

  const quickActions = [
    { icon: Home, label: "Dashboard", href: "/dashboard", color: "bg-blue-500" },
    { icon: QrCode, label: "Check-in", href: "/checkin", color: "bg-green-500" },
    { icon: Users, label: "Networking", href: "/networking", color: "bg-purple-500" },
    { icon: Calendar, label: "Sessions", href: "/sessions", color: "bg-orange-500" },
    { icon: MapPin, label: "Venue", href: "/venue", color: "bg-red-500" },
    { icon: Settings, label: "Settings", href: "/settings", color: "bg-gray-500" },
  ]

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Mobile App</h1>
          </div>
          <p className="text-muted-foreground">Trải nghiệm di động tối ưu</p>
        </div>

        {/* Status Bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              Trạng thái kết nối
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "Trực tuyến" : "Ngoại tuyến"}</Badge>
                {isInstalled && <Badge variant="secondary">Đã cài đặt</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <Signal className="h-4 w-4 text-muted-foreground" />
                <Battery className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="actions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="actions">Hành động</TabsTrigger>
            <TabsTrigger value="install">Cài đặt</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Truy cập nhanh</CardTitle>
                <CardDescription>Các tính năng chính của ứng dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col gap-2 bg-transparent"
                      onClick={() => (window.location.href = action.href)}
                    >
                      <div className={`p-2 rounded-full ${action.color}`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="install" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Cài đặt ứng dụng
                </CardTitle>
                <CardDescription>Cài đặt ứng dụng để trải nghiệm tốt hơn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isInstalled ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Cài đặt ứng dụng để:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Truy cập nhanh từ màn hình chính</li>
                        <li>Hoạt động ngoại tuyến</li>
                        <li>Nhận thông báo đẩy</li>
                        <li>Trải nghiệm như ứng dụng gốc</li>
                      </ul>
                    </div>
                    <Button onClick={handleInstall} disabled={!installPrompt} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {installPrompt ? "Cài đặt ứng dụng" : "Không thể cài đặt"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-green-600 font-medium">✓ Ứng dụng đã được cài đặt</div>
                    <p className="text-sm text-muted-foreground">Bạn có thể truy cập ứng dụng từ màn hình chính</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quyền ứng dụng</CardTitle>
                <CardDescription>Quản lý quyền truy cập của ứng dụng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Thông báo đẩy</Label>
                    <p className="text-xs text-muted-foreground">Nhận thông báo về sự kiện</p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        requestNotificationPermission()
                      } else {
                        setNotifications(false)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Vị trí</Label>
                    <p className="text-xs text-muted-foreground">Tìm địa điểm gần bạn</p>
                  </div>
                  <Switch
                    checked={location}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        requestLocationPermission()
                      } else {
                        setLocation(false)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Dữ liệu ngoại tuyến</Label>
                    <p className="text-xs text-muted-foreground">Lưu dữ liệu để sử dụng offline</p>
                  </div>
                  <Switch checked={offlineData} onCheckedChange={setOfflineData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Thông báo mẫu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    if (notifications && "Notification" in window) {
                      new Notification("Hội nghị sắp bắt đầu!", {
                        body: "Phiên 'AI trong tương lai' sẽ bắt đầu trong 10 phút",
                        icon: "/icon-192x192.png",
                        badge: "/icon-192x192.png",
                      })
                    }
                  }}
                  disabled={!notifications}
                >
                  Gửi thông báo thử
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
