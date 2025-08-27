"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  User,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react"
import { QRScanner } from "./qr-scanner"
import { CheckinHistory } from "./checkin-history"

interface AttendeeData {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  conference: string
  registrationDate: string
  status: "registered" | "checked-in" | "cancelled"
  qrCode: string
  avatar?: string
}

const mockAttendees: AttendeeData[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "0901234567",
    company: "Tech Corp",
    position: "Kỹ sư phần mềm",
    conference: "Hội nghị Công nghệ 2024",
    registrationDate: "2024-11-15",
    status: "registered",
    qrCode: "QR001234567",
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "tran.thi.binh@email.com",
    phone: "0912345678",
    company: "AI Academy",
    position: "Giảng viên",
    conference: "Workshop AI & Machine Learning",
    registrationDate: "2024-11-18",
    status: "registered",
    qrCode: "QR001234568",
  },
  {
    id: "3",
    name: "Lê Văn Cường",
    email: "le.van.cuong@email.com",
    phone: "0923456789",
    company: "Startup Hub",
    position: "CEO",
    conference: "Seminar Khởi nghiệp",
    registrationDate: "2024-11-20",
    status: "checked-in",
    qrCode: "QR001234569",
  },
]

interface CheckinResult {
  success: boolean
  message: string
  attendee?: AttendeeData
  type: "success" | "error" | "warning" | "duplicate"
}

export function QRCheckinSystem() {
  const [attendees, setAttendees] = useState<AttendeeData[]>(mockAttendees)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<CheckinResult | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [todayStats, setTodayStats] = useState({
    total: 450,
    checkedIn: 287,
    pending: 163,
  })

  const handleQRScan = async (qrData: string) => {
    if (isProcessing) return
    setIsProcessing(true)

    // Simulate processing delay
    setTimeout(() => {
      const result = processCheckin(qrData)
      setLastScanResult(result)
      setIsProcessing(false)

      // Update stats if successful
      if (result.success && result.type === "success") {
        setTodayStats((prev) => ({
          ...prev,
          checkedIn: prev.checkedIn + 1,
          pending: prev.pending - 1,
        }))
      }
    }, 1000)
  }

  const processCheckin = (qrData: string): CheckinResult => {
    // Find attendee by QR code
    const attendee = attendees.find((a) => a.qrCode === qrData)

    if (!attendee) {
      return {
        success: false,
        message: "Mã QR không hợp lệ hoặc không tìm thấy thông tin người tham dự",
        type: "error",
      }
    }

    if (attendee.status === "cancelled") {
      return {
        success: false,
        message: "Đăng ký đã bị hủy. Vui lòng liên hệ ban tổ chức",
        attendee,
        type: "error",
      }
    }

    if (attendee.status === "checked-in") {
      return {
        success: false,
        message: "Người tham dự đã check-in trước đó",
        attendee,
        type: "duplicate",
      }
    }

    // Successful check-in
    const updatedAttendees = attendees.map((a) => (a.id === attendee.id ? { ...a, status: "checked-in" as const } : a))
    setAttendees(updatedAttendees)

    return {
      success: true,
      message: "Check-in thành công!",
      attendee,
      type: "success",
    }
  }

  const handleManualCheckin = () => {
    if (!manualCode.trim()) return
    handleQRScan(manualCode.trim())
    setManualCode("")
  }

  const handleSearchCheckin = (attendee: AttendeeData) => {
    handleQRScan(attendee.qrCode)
  }

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getResultIcon = (type: CheckinResult["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case "error":
        return <XCircle className="h-8 w-8 text-red-600" />
      case "duplicate":
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case "warning":
        return <AlertTriangle className="h-8 w-8 text-orange-600" />
      default:
        return null
    }
  }

  const getResultColor = (type: CheckinResult["type"]) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      case "duplicate":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      case "warning":
        return "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Hệ thống Check-in QR</h1>
          <p className="text-muted-foreground">Quét mã QR hoặc tìm kiếm để check-in người tham dự</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Đang hoạt động</span>
          </Badge>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cần check-in</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
            <p className="text-xs text-muted-foreground">Hôm nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã check-in</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.checkedIn}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((todayStats.checkedIn / todayStats.total) * 100)}% hoàn thành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa check-in</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.pending}</div>
            <p className="text-xs text-muted-foreground">Còn lại</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Scanner */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="scanner" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scanner">Quét QR</TabsTrigger>
              <TabsTrigger value="manual">Nhập thủ công</TabsTrigger>
              <TabsTrigger value="search">Tìm kiếm</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5" />
                    <span>Quét mã QR</span>
                  </CardTitle>
                  <CardDescription>Hướng camera vào mã QR trên thẻ tham dự</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Button
                        onClick={() => setIsCameraActive(!isCameraActive)}
                        variant={isCameraActive ? "destructive" : "default"}
                        size="lg"
                      >
                        {isCameraActive ? (
                          <>
                            <CameraOff className="mr-2 h-4 w-4" />
                            Tắt camera
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Bật camera
                          </>
                        )}
                      </Button>
                    </div>

                    {isCameraActive && (
                      <div className="relative">
                        <QRScanner onScan={handleQRScan} isActive={isCameraActive} />
                        {isProcessing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center space-x-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Đang xử lý...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Nhập mã thủ công</CardTitle>
                  <CardDescription>Nhập mã QR hoặc mã tham dự để check-in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manualCode">Mã QR / Mã tham dự</Label>
                      <Input
                        id="manualCode"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Nhập mã (VD: QR001234567)"
                        onKeyPress={(e) => e.key === "Enter" && handleManualCheckin()}
                      />
                    </div>
                    <Button
                      onClick={handleManualCheckin}
                      disabled={!manualCode.trim() || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Check-in
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>Tìm kiếm người tham dự</CardTitle>
                  <CardDescription>Tìm và check-in người tham dự theo tên, email hoặc công ty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm người tham dự..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredAttendees.slice(0, 10).map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={attendee.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{getInitials(attendee.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{attendee.name}</div>
                              <div className="text-sm text-muted-foreground">{attendee.company}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                attendee.status === "checked-in"
                                  ? "default"
                                  : attendee.status === "registered"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {attendee.status === "checked-in"
                                ? "Đã check-in"
                                : attendee.status === "registered"
                                  ? "Chưa check-in"
                                  : "Đã hủy"}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => handleSearchCheckin(attendee)}
                              disabled={attendee.status !== "registered" || isProcessing}
                            >
                              Check-in
                            </Button>
                          </div>
                        </div>
                      ))}
                      {searchTerm && filteredAttendees.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Không tìm thấy người tham dự</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Check-in Result */}
        <div className="space-y-4">
          {lastScanResult && (
            <Card className={`border-2 ${getResultColor(lastScanResult.type)}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getResultIcon(lastScanResult.type)}
                  <span>{lastScanResult.success ? "Thành công" : "Thất bại"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription>{lastScanResult.message}</AlertDescription>
                  </Alert>

                  {lastScanResult.attendee && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={lastScanResult.attendee.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{getInitials(lastScanResult.attendee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lastScanResult.attendee.name}</div>
                          <div className="text-sm text-muted-foreground">{lastScanResult.attendee.position}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span>{lastScanResult.attendee.company}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>{lastScanResult.attendee.conference}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>Đăng ký: {lastScanResult.attendee.registrationDate}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" onClick={() => setLastScanResult(null)} className="w-full">
                    Đóng
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Check-ins */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckinHistory />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
