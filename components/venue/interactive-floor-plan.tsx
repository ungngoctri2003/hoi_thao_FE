"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Wifi, Coffee } from "lucide-react"

interface Room {
  id: string
  name: string
  capacity: number
  currentOccupancy: number
  status: "empty" | "active" | "full" | "upcoming"
  type: "conference" | "workshop" | "exhibition" | "break" | "restaurant"
  position: { x: number; y: number; width: number; height: number }
  currentSession?: string
  nextSession?: string
  amenities: string[]
}

interface FloorPlanProps {
  floor: number
  realTimeMode: boolean
  occupancyData: any
}

export default function InteractiveFloorPlan({ floor, realTimeMode, occupancyData }: FloorPlanProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)

  useEffect(() => {
    // Generate floor plan data based on floor
    const generateRooms = (floorNumber: number): Room[] => {
      const baseRooms: Room[] = []

      if (floorNumber === 1) {
        baseRooms.push(
          {
            id: "main-hall",
            name: "Hội trường chính",
            capacity: 500,
            currentOccupancy: 387,
            status: "active",
            type: "conference",
            position: { x: 20, y: 20, width: 200, height: 120 },
            currentSession: "Keynote: Tương lai của AI",
            nextSession: "Panel thảo luận",
            amenities: ["wifi", "projector", "sound", "recording"],
          },
          {
            id: "workshop-a",
            name: "Phòng Workshop A",
            capacity: 100,
            currentOccupancy: 78,
            status: "active",
            type: "workshop",
            position: { x: 250, y: 20, width: 120, height: 80 },
            currentSession: "Hands-on React Development",
            amenities: ["wifi", "computers", "whiteboard"],
          },
          {
            id: "exhibition",
            name: "Khu triển lãm",
            capacity: 300,
            currentOccupancy: 156,
            status: "active",
            type: "exhibition",
            position: { x: 20, y: 160, width: 180, height: 100 },
            amenities: ["wifi", "power", "display"],
          },
          {
            id: "restaurant",
            name: "Nhà hàng",
            capacity: 200,
            currentOccupancy: 89,
            status: "active",
            type: "restaurant",
            position: { x: 250, y: 120, width: 120, height: 100 },
            amenities: ["wifi", "food", "drinks"],
          },
          {
            id: "break-area",
            name: "Khu nghỉ ngơi",
            capacity: 150,
            currentOccupancy: 45,
            status: "empty",
            type: "break",
            position: { x: 220, y: 240, width: 150, height: 60 },
            amenities: ["wifi", "coffee", "seating"],
          },
        )
      } else if (floorNumber === 2) {
        baseRooms.push(
          {
            id: "conf-room-b1",
            name: "Phòng hội nghị B1",
            capacity: 150,
            currentOccupancy: 142,
            status: "full",
            type: "conference",
            position: { x: 30, y: 30, width: 140, height: 90 },
            currentSession: "Blockchain & Fintech",
            amenities: ["wifi", "projector", "sound"],
          },
          {
            id: "conf-room-b2",
            name: "Phòng hội nghị B2",
            capacity: 120,
            currentOccupancy: 0,
            status: "upcoming",
            type: "conference",
            position: { x: 200, y: 30, width: 140, height: 90 },
            nextSession: "Machine Learning Workshop",
            amenities: ["wifi", "projector", "whiteboard"],
          },
          {
            id: "workshop-b",
            name: "Phòng Workshop B",
            capacity: 80,
            currentOccupancy: 67,
            status: "active",
            type: "workshop",
            position: { x: 30, y: 150, width: 120, height: 80 },
            currentSession: "UX Design Principles",
            amenities: ["wifi", "computers", "design-tools"],
          },
          {
            id: "meeting-rooms",
            name: "Phòng họp nhỏ",
            capacity: 60,
            currentOccupancy: 23,
            status: "active",
            type: "conference",
            position: { x: 200, y: 150, width: 140, height: 80 },
            currentSession: "Startup Pitch Sessions",
            amenities: ["wifi", "projector"],
          },
        )
      } else {
        baseRooms.push(
          {
            id: "vip-lounge",
            name: "VIP Lounge",
            capacity: 50,
            currentOccupancy: 28,
            status: "active",
            type: "break",
            position: { x: 50, y: 50, width: 120, height: 80 },
            amenities: ["wifi", "premium-food", "quiet"],
          },
          {
            id: "exec-meeting",
            name: "Phòng họp điều hành",
            capacity: 30,
            currentOccupancy: 15,
            status: "active",
            type: "conference",
            position: { x: 200, y: 50, width: 100, height: 80 },
            currentSession: "Executive Roundtable",
            amenities: ["wifi", "projector", "privacy"],
          },
          {
            id: "quiet-zone",
            name: "Khu yên tĩnh",
            capacity: 40,
            currentOccupancy: 12,
            status: "empty",
            type: "break",
            position: { x: 50, y: 160, width: 150, height: 60 },
            amenities: ["wifi", "quiet", "charging"],
          },
        )
      }

      return baseRooms
    }

    setRooms(generateRooms(floor))
  }, [floor])

  useEffect(() => {
    // Simulate real-time occupancy updates
    if (realTimeMode) {
      const interval = setInterval(() => {
        setRooms((prevRooms) =>
          prevRooms.map((room) => ({
            ...room,
            currentOccupancy: Math.max(
              0,
              Math.min(room.capacity, room.currentOccupancy + Math.floor(Math.random() * 10 - 5)),
            ),
          })),
        )
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [realTimeMode])

  const getRoomColor = (room: Room) => {
    const occupancyRate = room.currentOccupancy / room.capacity
    switch (room.status) {
      case "empty":
        return "bg-green-500"
      case "active":
        return occupancyRate > 0.8 ? "bg-red-500" : "bg-yellow-500"
      case "full":
        return "bg-red-500"
      case "upcoming":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-3 w-3" />
      case "coffee":
      case "food":
      case "drinks":
        return <Coffee className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden" style={{ height: "400px" }}>
            {/* SVG Floor Plan */}
            <svg width="100%" height="100%" viewBox="0 0 400 320" className="absolute inset-0">
              {/* Floor outline */}
              <rect x="10" y="10" width="380" height="300" fill="none" stroke="#e5e7eb" strokeWidth="2" />

              {/* Rooms */}
              {rooms.map((room) => (
                <g key={room.id}>
                  <rect
                    x={room.position.x}
                    y={room.position.y}
                    width={room.position.width}
                    height={room.position.height}
                    className={`${getRoomColor(room)} ${hoveredRoom === room.id ? "opacity-80" : "opacity-60"} cursor-pointer transition-opacity`}
                    stroke="#374151"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredRoom(room.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => setSelectedRoom(room)}
                  />
                  <text
                    x={room.position.x + room.position.width / 2}
                    y={room.position.y + room.position.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs font-medium pointer-events-none"
                    style={{ fontSize: "10px" }}
                  >
                    {room.name}
                  </text>
                  <text
                    x={room.position.x + room.position.width / 2}
                    y={room.position.y + room.position.height / 2 + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white text-xs pointer-events-none"
                    style={{ fontSize: "8px" }}
                  >
                    {room.currentOccupancy}/{room.capacity}
                  </text>
                </g>
              ))}

              {/* Entrances and exits */}
              <rect x="190" y="10" width="20" height="5" fill="#10b981" />
              <text x="200" y="25" textAnchor="middle" className="fill-gray-600 text-xs">
                Lối vào chính
              </text>

              <rect x="10" y="150" width="5" height="20" fill="#10b981" />
              <text x="25" y="165" className="fill-gray-600 text-xs">
                Lối thoát hiểm
              </text>
            </svg>

            {/* Real-time indicator */}
            {realTimeMode && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Thời gian thực</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Room Details Modal */}
      {selectedRoom && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedRoom.name}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedRoom.currentOccupancy}/{selectedRoom.capacity}
                    </span>
                  </div>
                  <Badge
                    variant={
                      selectedRoom.status === "active"
                        ? "default"
                        : selectedRoom.status === "full"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {selectedRoom.status === "active"
                      ? "Đang hoạt động"
                      : selectedRoom.status === "full"
                        ? "Đầy chỗ"
                        : selectedRoom.status === "upcoming"
                          ? "Sắp bắt đầu"
                          : "Trống"}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedRoom(null)}>
                Đóng
              </Button>
            </div>

            {selectedRoom.currentSession && (
              <div className="mb-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Đang diễn ra:</p>
                <p className="text-sm">{selectedRoom.currentSession}</p>
              </div>
            )}

            {selectedRoom.nextSession && (
              <div className="mb-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tiếp theo:</p>
                <p className="text-sm">{selectedRoom.nextSession}</p>
              </div>
            )}

            <div className="mb-3">
              <p className="text-sm font-medium mb-2">Tiện ích:</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Chỉ đường</span>
              </Button>
              <Button size="sm" variant="outline">
                Đặt chỗ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
