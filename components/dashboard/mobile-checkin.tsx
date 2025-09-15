"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Search,
  CheckCircle,
  Clock,
  User,
  Smartphone,
  Camera,
} from "lucide-react";

interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "checked-in" | "pending";
  checkInTime?: string;
}

export function MobileCheckIn() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);

  // Mock data - replace with actual API call
  const attendees: Attendee[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      company: "Công ty ABC",
      status: "pending",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      company: "Công ty XYZ",
      status: "checked-in",
      checkInTime: "2024-01-15T09:30:00Z",
    },
    {
      id: "3",
      name: "Lê Văn C",
      email: "levanc@example.com",
      company: "Công ty DEF",
      status: "pending",
    },
  ];

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (attendee: Attendee) => {
    if (attendee.status === "pending") {
      setSelectedAttendee({
        ...attendee,
        status: "checked-in",
        checkInTime: new Date().toISOString(),
      });
    }
  };

  const handleQRScan = () => {
    setIsScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setIsScanning(false);
      // In real implementation, this would process the QR code
      alert("Chức năng quét QR sẽ được tích hợp với camera");
    }, 2000);
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <Card className="md:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Smartphone className="h-5 w-5 mr-2" />
            Check-in Mobile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Scan Button */}
          <Button
            className="w-full h-12 text-lg"
            onClick={handleQRScan}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Camera className="h-5 w-5 mr-2 animate-pulse" />
                Đang quét...
              </>
            ) : (
              <>
                <QrCode className="h-5 w-5 mr-2" />
                Quét mã QR
              </>
            )}
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người tham dự..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendee List */}
      <div className="space-y-2">
        {filteredAttendees.map((attendee) => (
          <Card key={attendee.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{attendee.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {attendee.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {attendee.company}
                    </p>
                    {attendee.checkInTime && (
                      <p className="text-xs text-green-600">
                        Check-in: {formatTime(attendee.checkInTime)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge
                    variant={
                      attendee.status === "checked-in" ? "default" : "outline"
                    }
                    className={
                      attendee.status === "checked-in"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-200"
                    }
                  >
                    {attendee.status === "checked-in" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Đã check-in
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Chờ check-in
                      </>
                    )}
                  </Badge>
                  {attendee.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(attendee)}
                      className="h-8"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Check-in
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Attendee Confirmation */}
      {selectedAttendee && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Check-in thành công!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {selectedAttendee.name} đã được check-in lúc{" "}
                  {formatTime(selectedAttendee.checkInTime!)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAttendee(null)}
                className="text-green-600 hover:text-green-700"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredAttendees.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">Không tìm thấy kết quả</h3>
            <p className="text-sm text-muted-foreground">
              Thử tìm kiếm với từ khóa khác
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
