import { NextRequest, NextResponse } from "next/server";

// Backend API base URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get("conferenceId");

    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    if (conferenceId) {
      backendParams.append("conferenceId", conferenceId);
    }

    console.log(`Fetching venue data from backend: ${BACKEND_API_URL}`);

    // Try to fetch from backend with authentication
    // Note: This endpoint requires proper authentication headers
    const [floorsResponse, roomsResponse] = await Promise.all([
      fetch(`${BACKEND_API_URL}/venue/floors${backendParams.toString() ? `?${backendParams.toString()}` : ""}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if available
          // "Authorization": `Bearer ${token}`,
        },
        // Shorter timeout for faster fallback
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`${BACKEND_API_URL}/venue/rooms${backendParams.toString() ? `?${backendParams.toString()}` : ""}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if available
          // "Authorization": `Bearer ${token}`,
        },
        // Shorter timeout for faster fallback
        signal: AbortSignal.timeout(5000),
      })
    ]);

    if (!floorsResponse.ok || !roomsResponse.ok) {
      console.error("Backend API error:", {
        floors: floorsResponse.status,
        rooms: roomsResponse.status,
        floorsText: await floorsResponse.text().catch(() => ''),
        roomsText: await roomsResponse.text().catch(() => '')
      });
      throw new Error(`Backend API error: ${floorsResponse.status} / ${roomsResponse.status}`);
    }

    const floorsData = await floorsResponse.json();
    const roomsData = await roomsResponse.json();

    console.log("Backend data received:", { floors: floorsData, rooms: roomsData });

    // Transform backend data to frontend format
    const floors = (floorsData.data || []).map((floor: any) => ({
      id: floor.ID || floor.id,
      name: floor.NAME || floor.name || floor.floorNumber,
      description: floor.DESCRIPTION || floor.description,
      conferenceId: floor.CONFERENCE_ID || floor.conferenceId,
      conferenceName: floor.CONFERENCE_NAME || floor.conferenceName,
    }));

    const rooms = (roomsData.data || []).map((room: any) => ({
      id: room.ID || room.id,
      floorId: room.FLOOR_ID || room.floorId,
      name: room.NAME || room.name,
      capacity: room.CAPACITY || room.capacity || 0,
      description: room.DESCRIPTION || room.description,
      roomType: room.ROOM_TYPE || room.roomType,
      features: Array.isArray(room.FEATURES) ? room.FEATURES : (room.features || []),
      status: (room.STATUS || room.status || 'available') as 'available' | 'occupied' | 'maintenance',
      floorName: room.FLOOR_NAME || room.floorName,
      conferenceId: room.CONFERENCE_ID || room.conferenceId,
      conferenceName: room.CONFERENCE_NAME || room.conferenceName,
    }));

    return NextResponse.json({
      success: true,
      data: {
        floors,
        rooms,
        amenities: getDefaultAmenities()
      }
    });

  } catch (error) {
    console.error("Error fetching venue data:", error);

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: getMockVenueData(),
      error: "Using mock data - backend unavailable or requires authentication"
    });
  }
}

// Mock data for testing
function getMockVenueData() {
  return {
    floors: [
      {
        id: 1,
        name: "Tầng 1",
        description: "Sảnh chính, quầy đăng ký, khu vực networking",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      },
      {
        id: 2,
        name: "Tầng 2",
        description: "Phòng họp, workshop rooms",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      },
      {
        id: 3,
        name: "Tầng 3",
        description: "Hội trường chính, phòng VIP",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      }
    ],
    rooms: [
      {
        id: 1,
        floorId: 3,
        name: "Hội trường A",
        capacity: 500,
        description: "Hội trường chính với sức chứa lớn, trang bị hệ thống âm thanh và ánh sáng hiện đại",
        roomType: "Hội trường",
        features: ["Âm thanh", "Ánh sáng", "Máy chiếu", "WiFi"],
        status: "available",
        floorName: "Tầng 3",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      },
      {
        id: 2,
        floorId: 2,
        name: "Phòng họp 201",
        capacity: 100,
        description: "Phòng họp vừa với bàn tròn, phù hợp cho thảo luận nhóm",
        roomType: "Phòng họp",
        features: ["Bàn tròn", "Máy chiếu", "WiFi", "Điều hòa"],
        status: "occupied",
        floorName: "Tầng 2",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      },
      {
        id: 3,
        floorId: 2,
        name: "Workshop Room 202",
        capacity: 50,
        description: "Phòng workshop với bàn dài, phù hợp cho hands-on training",
        roomType: "Workshop",
        features: ["Bàn dài", "Bảng trắng", "WiFi", "Máy tính"],
        status: "available",
        floorName: "Tầng 2",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      },
      {
        id: 4,
        floorId: 1,
        name: "Sảnh chính",
        capacity: 200,
        description: "Khu vực đăng ký và networking, có quầy bar và khu vực nghỉ ngơi",
        roomType: "Sảnh",
        features: ["Quầy bar", "Khu nghỉ", "WiFi", "Điều hòa"],
        status: "available",
        floorName: "Tầng 1",
        conferenceId: 1,
        conferenceName: "Hội nghị Công nghệ 2024"
      }
    ],
    amenities: getDefaultAmenities()
  };
}

// Default amenities
function getDefaultAmenities() {
  return [
    {
      name: "Quầy đăng ký",
      icon: "MapPin",
      location: "Tầng 1, Sảnh chính",
      description: "Đăng ký tham dự và nhận tài liệu"
    },
    {
      name: "Quầy cà phê",
      icon: "Coffee",
      location: "Tầng 1, Góc sảnh",
      description: "Cà phê, trà và đồ ăn nhẹ"
    },
    {
      name: "Bãi đỗ xe",
      icon: "Car",
      location: "Tầng hầm",
      description: "Bãi đỗ xe miễn phí cho tham dự viên"
    },
    {
      name: "WiFi miễn phí",
      icon: "Wifi",
      location: "Toàn bộ tòa nhà",
      description: "Kết nối internet tốc độ cao"
    }
  ];
}

