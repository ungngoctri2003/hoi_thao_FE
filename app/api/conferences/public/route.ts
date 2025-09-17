import { NextRequest, NextResponse } from "next/server";

// Backend API base URL - update this to match your backend
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";

    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    backendParams.append("page", page);
    backendParams.append("limit", limit);

    // Use the public conferences endpoint for checkin
    const backendUrl = `${BACKEND_API_URL}/public/conferences/checkin?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText);
      throw new Error(`Backend API error: ${response.status}`);
    }

    const backendData = await response.json();

    // Transform backend data to frontend format
    let conferences = [];
    if (backendData.data && Array.isArray(backendData.data)) {
      conferences = backendData.data.map((conf: any) => ({
        id: conf.ID || conf.id,
        name: conf.NAME || conf.name || conf.TITLE || conf.title,
        description:
          conf.DESCRIPTION ||
          conf.description ||
          conf.SUMMARY ||
          conf.summary ||
          "",
        startDate:
          conf.START_DATE ||
          conf.startDate ||
          conf.START_TIME ||
          conf.startTime,
        endDate: conf.END_DATE || conf.endDate || conf.END_TIME || conf.endTime,
        location:
          conf.LOCATION || conf.location || conf.VENUE || conf.venue || "",
        status: getStatusFromBackend(conf.STATUS || conf.status),
        maxAttendees:
          conf.MAX_ATTENDEES ||
          conf.maxAttendees ||
          conf.CAPACITY ||
          conf.capacity ||
          100,
        currentAttendees:
          conf.CURRENT_ATTENDEES ||
          conf.currentAttendees ||
          conf.REGISTERED ||
          conf.registered ||
          0,
        image:
          conf.IMAGE_URL ||
          conf.imageUrl ||
          conf.IMAGE ||
          conf.image ||
          "/images/conference-default.jpg",
        organizer:
          conf.ORGANIZER ||
          conf.organizer ||
          conf.ORGANIZATION ||
          conf.organization ||
          "",
        category:
          conf.CATEGORY || conf.category || conf.TYPE || conf.type || "General",
        checkinRequired:
          conf.CHECKIN_REQUIRED !== false && conf.checkinRequired !== false,
        qrCode:
          conf.QR_CODE ||
          conf.qrCode ||
          conf.CODE ||
          conf.code ||
          `CONF_${conf.ID || conf.id}`,
      }));
    }

    // Apply frontend filters
    let filteredConferences = conferences;

    // Filter by status
    if (status !== "all") {
      filteredConferences = filteredConferences.filter(
        (conf) => conf.status === status
      );
    }

    // Filter by category
    if (category !== "all") {
      filteredConferences = filteredConferences.filter(
        (conf) => conf.category === category
      );
    }

    // Filter by search term
    if (search) {
      filteredConferences = filteredConferences.filter(
        (conf) =>
          conf.name.toLowerCase().includes(search.toLowerCase()) ||
          conf.description.toLowerCase().includes(search.toLowerCase()) ||
          conf.organizer.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by start date
    filteredConferences.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredConferences,
      total: filteredConferences.length,
      meta: backendData.meta || { total: filteredConferences.length },
    });
  } catch (error) {
    console.error("Error fetching conferences:", error);

    // Fallback to empty data instead of error
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      meta: { total: 0 },
      error: "Unable to fetch conferences from backend",
    });
  }
}

// Helper function to map backend status to frontend status
function getStatusFromBackend(
  backendStatus: string
): "active" | "upcoming" | "completed" {
  if (!backendStatus) return "upcoming";

  const status = backendStatus.toLowerCase();
  if (status === "active" || status === "published" || status === "ongoing") {
    return "active";
  }
  if (status === "completed" || status === "finished" || status === "ended") {
    return "completed";
  }
  return "upcoming";
}
