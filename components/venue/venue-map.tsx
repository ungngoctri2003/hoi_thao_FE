"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Clock, Navigation, Zap } from "lucide-react"
import InteractiveFloorPlan from "./interactive-floor-plan"
import SessionLocations from "./session-locations"
import VenueAmenities from "./venue-amenities"

interface VenueStats {
  totalRooms: number
  activeRooms: number
  totalCapacity: number
  currentOccupancy: number
}

export default function VenueMap() {
  const [venueStats, setVenueStats] = useState<VenueStats>({
    totalRooms: 12,
    activeRooms: 8,
    totalCapacity: 2500,
    currentOccupancy: 1847,
  })
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [realTimeMode, setRealTimeMode] = useState(true)

  useEffect(() => {
    // Simulate real-time updates
    if (realTimeMode) {
      const interval = setInterval(() => {
        setVenueStats((prev) => ({
          ...prev,
          currentOccupancy: Math.max(1200, Math.min(2500, prev.currentOccupancy + Math.floor(Math.random() * 20 - 10))),
        }))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [realTimeMode])

  const occupancyPercentage = Math.round((venueStats.currentOccupancy / venueStats.totalCapacity) * 100)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng số phòng</p>
                <p className="text-2xl font-bold">{venueStats.totalRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phòng đang hoạt động</p>
                <p className="text-2xl font-bold">{venueStats.activeRooms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sức chứa tối đa</p>
                <p className="text-2xl font-bold">{venueStats.totalCapacity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Hiện tại</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{venueStats.currentOccupancy.toLocaleString()}</p>
                  <Badge
                    variant={
                      occupancyPercentage > 80 ? "destructive" : occupancyPercentage > 60 ? "default" : "secondary"
                    }
                  >
                    {occupancyPercentage}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Tầng:</span>
            {[1, 2, 3].map((floor) => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFloor(floor)}
              >
                Tầng {floor}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Thời gian thực:</span>
            <Button
              variant={realTimeMode ? "default" : "outline"}
              size="sm"
              onClick={() => setRealTimeMode(!realTimeMode)}
            >
              {realTimeMode ? "Bật" : "Tắt"}
            </Button>
          </div>
          <Button size="sm" className="flex items-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Chỉ đường</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map">Bản đồ</TabsTrigger>
          <TabsTrigger value="sessions">Phiên họp</TabsTrigger>
          <TabsTrigger value="amenities">Tiện ích</TabsTrigger>
          <TabsTrigger value="navigation">Chỉ đường</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <InteractiveFloorPlan floor={selectedFloor} realTimeMode={realTimeMode} occupancyData={venueStats} />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chú thích</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Phòng trống</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Đang diễn ra</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Đầy chỗ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Sắp bắt đầu</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin tầng {selectedFloor}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Số phòng:</span>
                    <span className="text-sm font-medium">
                      {selectedFloor === 1 ? "5" : selectedFloor === 2 ? "4" : "3"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sức chứa:</span>
                    <span className="text-sm font-medium">
                      {selectedFloor === 1 ? "1,200" : selectedFloor === 2 ? "800" : "500"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hiện tại:</span>
                    <span className="text-sm font-medium">
                      {selectedFloor === 1 ? "987" : selectedFloor === 2 ? "542" : "318"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionLocations floor={selectedFloor} />
        </TabsContent>

        <TabsContent value="amenities">
          <VenueAmenities floor={selectedFloor} />
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Chỉ đường thông minh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Từ:</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Lối vào chính</option>
                    <option>Quầy đăng ký</option>
                    <option>Phòng A1</option>
                    <option>Phòng B2</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Đến:</label>
                  <select className="w-full mt-1 p-2 border rounded-md">
                    <option>Phòng hội thảo chính</option>
                    <option>Khu triển lãm</option>
                    <option>Phòng nghỉ</option>
                    <option>Nhà hàng</option>
                  </select>
                </div>
              </div>
              <Button className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Tìm đường đi tối ưu
              </Button>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Đường đi được đề xuất:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Từ lối vào chính, đi thẳng 50m</li>
                  <li>Rẽ phải tại quầy thông tin</li>
                  <li>Lên thang máy lên tầng 2</li>
                  <li>Phòng hội thảo chính ở bên trái</li>
                </ol>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Thời gian ước tính: 3-4 phút</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
