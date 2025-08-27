"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wifi, Coffee, Car, Utensils, Phone, Zap, Shield, Heart } from "lucide-react"

interface Amenity {
  id: string
  name: string
  type: "connectivity" | "food" | "transport" | "health" | "business" | "security"
  location: string
  status: "available" | "busy" | "maintenance"
  description: string
  hours: string
  icon: string
}

interface VenueAmenitiesProps {
  floor: number
}

export default function VenueAmenities({ floor }: VenueAmenitiesProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    // Generate amenities based on floor
    const generateAmenities = (floorNumber: number): Amenity[] => {
      const baseAmenities: Amenity[] = []

      if (floorNumber === 1) {
        baseAmenities.push(
          {
            id: "wifi-main",
            name: "WiFi miễn phí",
            type: "connectivity",
            location: "Toàn bộ tầng 1",
            status: "available",
            description: "Kết nối internet tốc độ cao, băng thông không giới hạn",
            hours: "24/7",
            icon: "wifi",
          },
          {
            id: "restaurant-main",
            name: "Nhà hàng chính",
            type: "food",
            location: "Phía đông tầng 1",
            status: "available",
            description: "Buffet quốc tế với đa dạng món ăn Á - Âu",
            hours: "07:00 - 22:00",
            icon: "utensils",
          },
          {
            id: "coffee-corner",
            name: "Quầy cà phê",
            type: "food",
            location: "Gần lối vào chính",
            status: "available",
            description: "Cà phê, trà và đồ uống nhẹ",
            hours: "06:00 - 20:00",
            icon: "coffee",
          },
          {
            id: "parking-main",
            name: "Bãi đỗ xe chính",
            type: "transport",
            location: "Tầng hầm B1",
            status: "busy",
            description: "500 chỗ đỗ xe ô tô, 200 chỗ xe máy",
            hours: "24/7",
            icon: "car",
          },
          {
            id: "charging-station",
            name: "Trạm sạc điện thoại",
            type: "connectivity",
            location: "Khu nghỉ ngơi",
            status: "available",
            description: "Sạc không dây và cáp sạc đa năng",
            hours: "24/7",
            icon: "zap",
          },
        )
      } else if (floorNumber === 2) {
        baseAmenities.push(
          {
            id: "wifi-floor2",
            name: "WiFi tốc độ cao",
            type: "connectivity",
            location: "Toàn bộ tầng 2",
            status: "available",
            description: "Mạng riêng cho các phiên workshop và hội nghị",
            hours: "24/7",
            icon: "wifi",
          },
          {
            id: "business-center",
            name: "Trung tâm dịch vụ",
            type: "business",
            location: "Hành lang chính",
            status: "available",
            description: "In ấn, photocopy, fax và dịch vụ văn phòng",
            hours: "08:00 - 18:00",
            icon: "phone",
          },
          {
            id: "break-room-2",
            name: "Phòng nghỉ",
            type: "food",
            location: "Giữa tầng 2",
            status: "available",
            description: "Đồ uống nhẹ và snack miễn phí",
            hours: "08:00 - 18:00",
            icon: "coffee",
          },
          {
            id: "security-desk",
            name: "Bàn bảo vệ",
            type: "security",
            location: "Lối vào tầng 2",
            status: "available",
            description: "Hỗ trợ an ninh và thông tin",
            hours: "24/7",
            icon: "shield",
          },
        )
      } else {
        baseAmenities.push(
          {
            id: "vip-wifi",
            name: "WiFi VIP",
            type: "connectivity",
            location: "VIP Lounge",
            status: "available",
            description: "Kết nối riêng tư với băng thông ưu tiên",
            hours: "24/7",
            icon: "wifi",
          },
          {
            id: "premium-dining",
            name: "Nhà hàng cao cấp",
            type: "food",
            location: "VIP Lounge",
            status: "available",
            description: "Thực đơn cao cấp và dịch vụ cá nhân",
            hours: "11:00 - 22:00",
            icon: "utensils",
          },
          {
            id: "wellness-center",
            name: "Trung tâm sức khỏe",
            type: "health",
            location: "Khu yên tĩnh",
            status: "available",
            description: "Massage, thư giãn và chăm sóc sức khỏe",
            hours: "09:00 - 18:00",
            icon: "heart",
          },
          {
            id: "concierge",
            name: "Dịch vụ concierge",
            type: "business",
            location: "VIP Lounge",
            status: "available",
            description: "Hỗ trợ cá nhân và dịch vụ đặc biệt",
            hours: "08:00 - 20:00",
            icon: "phone",
          },
        )
      }

      return baseAmenities
    }

    setAmenities(generateAmenities(floor))
  }, [floor])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "wifi":
        return <Wifi className="h-5 w-5" />
      case "coffee":
        return <Coffee className="h-5 w-5" />
      case "car":
        return <Car className="h-5 w-5" />
      case "utensils":
        return <Utensils className="h-5 w-5" />
      case "phone":
        return <Phone className="h-5 w-5" />
      case "zap":
        return <Zap className="h-5 w-5" />
      case "shield":
        return <Shield className="h-5 w-5" />
      case "heart":
        return <Heart className="h-5 w-5" />
      default:
        return <Wifi className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "connectivity":
        return "text-blue-500"
      case "food":
        return "text-orange-500"
      case "transport":
        return "text-green-500"
      case "health":
        return "text-red-500"
      case "business":
        return "text-purple-500"
      case "security":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Có sẵn</Badge>
      case "busy":
        return <Badge className="bg-yellow-500">Bận</Badge>
      case "maintenance":
        return <Badge variant="destructive">Bảo trì</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredAmenities =
    selectedType === "all" ? amenities : amenities.filter((amenity) => amenity.type === selectedType)

  const types = [
    { value: "all", label: "Tất cả" },
    { value: "connectivity", label: "Kết nối" },
    { value: "food", label: "Ăn uống" },
    { value: "transport", label: "Di chuyển" },
    { value: "health", label: "Sức khỏe" },
    { value: "business", label: "Dịch vụ" },
    { value: "security", label: "An ninh" },
  ]

  return (
    <div className="space-y-6">
      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAmenities.map((amenity) => (
          <Card key={amenity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${getTypeColor(amenity.type)}`}>{getIcon(amenity.icon)}</div>
                  <div>
                    <CardTitle className="text-lg">{amenity.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{amenity.location}</p>
                  </div>
                </div>
                {getStatusBadge(amenity.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">{amenity.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Giờ hoạt động:</span>
                <span className="font-medium">{amenity.hours}</span>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1" disabled={amenity.status === "maintenance"}>
                  {amenity.type === "transport" ? "Xem bản đồ" : amenity.type === "food" ? "Xem menu" : "Thông tin"}
                </Button>
                {amenity.type === "food" && (
                  <Button size="sm" variant="outline">
                    Đặt bàn
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAmenities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Wifi className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Không có tiện ích</h3>
            <p className="text-gray-600 dark:text-gray-400">Không tìm thấy tiện ích nào cho loại đã chọn</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
