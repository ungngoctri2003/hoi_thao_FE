import { NextRequest, NextResponse } from "next/server";

// Backend API base URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get("conferenceId");
    const useMockData = searchParams.get("mock") === "true";

    // If mock data is requested or backend is not available, return mock data
    if (useMockData) {
      console.log("Using mock data for venue");
      return NextResponse.json({
        success: true,
        data: getMockVenueData()
      });
    }

    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    if (conferenceId) {
      backendParams.append("conferenceId", conferenceId);
    }

    console.log(`Fetching venue data from backend: ${BACKEND_API_URL}`);

    // For public venue access, we'll use mock data since backend requires authentication
    // In a real scenario, you might want to create public endpoints or use a different approach
    console.log("Using mock data for public venue access (backend requires authentication)");
    
    return NextResponse.json({
      success: true,
      data: getMockVenueData(),
      message: "Using mock data - backend requires authentication for public access"
    });

  } catch (error) {
    console.error("Error fetching venue data:", error);

    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: getMockVenueData(),
      error: "Using mock data - backend unavailable"
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
