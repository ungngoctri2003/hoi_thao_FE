import { NextRequest, NextResponse } from "next/server";

// Backend API base URL
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conferenceId = params.id;

    if (!conferenceId) {
      return NextResponse.json(
        { success: false, error: "Conference ID is required" },
        { status: 400 }
      );
    }

    // Fetch conference details from public endpoint
    const conferenceResponse = await fetch(
      `${BACKEND_API_URL}/public/conferences/${conferenceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!conferenceResponse.ok) {
      console.error("Backend conference API error:", conferenceResponse.status);
      throw new Error(`Backend API error: ${conferenceResponse.status}`);
    }

    const conferenceData = await conferenceResponse.json();

    // Fetch sessions for this conference using public endpoint
    const sessionsResponse = await fetch(
      `${BACKEND_API_URL}/sessions?conferenceId=${conferenceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    let sessions = [];
    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json();
      sessions = sessionsData.data || [];
    } else {
      console.warn("Could not fetch sessions:", sessionsResponse.status);
    }

    // Transform conference data to frontend format
    const conference = {
      id: conferenceData.data?.ID || conferenceData.data?.id,
      name:
        conferenceData.data?.NAME ||
        conferenceData.data?.name ||
        conferenceData.data?.TITLE ||
        conferenceData.data?.title,
      description:
        conferenceData.data?.DESCRIPTION ||
        conferenceData.data?.description ||
        conferenceData.data?.SUMMARY ||
        conferenceData.data?.summary ||
        "",
      startDate:
        conferenceData.data?.START_DATE ||
        conferenceData.data?.startDate ||
        conferenceData.data?.START_TIME ||
        conferenceData.data?.startTime,
      endDate:
        conferenceData.data?.END_DATE ||
        conferenceData.data?.endDate ||
        conferenceData.data?.END_TIME ||
        conferenceData.data?.endTime,
      location:
        conferenceData.data?.LOCATION ||
        conferenceData.data?.location ||
        conferenceData.data?.VENUE ||
        conferenceData.data?.venue ||
        "",
      status: getStatusFromBackend(
        conferenceData.data?.STATUS || conferenceData.data?.status
      ),
      maxAttendees:
        conferenceData.data?.MAX_ATTENDEES ||
        conferenceData.data?.maxAttendees ||
        conferenceData.data?.CAPACITY ||
        conferenceData.data?.capacity ||
        100,
      currentAttendees:
        conferenceData.data?.CURRENT_ATTENDEES ||
        conferenceData.data?.currentAttendees ||
        conferenceData.data?.REGISTERED ||
        conferenceData.data?.registered ||
        0,
      image:
        conferenceData.data?.IMAGE_URL ||
        conferenceData.data?.imageUrl ||
        conferenceData.data?.IMAGE ||
        conferenceData.data?.image ||
        "/images/conference-default.jpg",
      organizer:
        conferenceData.data?.ORGANIZER ||
        conferenceData.data?.organizer ||
        conferenceData.data?.ORGANIZATION ||
        conferenceData.data?.organization ||
        "",
      category:
        conferenceData.data?.CATEGORY ||
        conferenceData.data?.category ||
        conferenceData.data?.TYPE ||
        conferenceData.data?.type ||
        "General",
      checkinRequired:
        conferenceData.data?.CHECKIN_REQUIRED !== false &&
        conferenceData.data?.checkinRequired !== false,
      qrCode:
        conferenceData.data?.QR_CODE ||
        conferenceData.data?.qrCode ||
        conferenceData.data?.CODE ||
        conferenceData.data?.code ||
        `CONF_${conferenceData.data?.ID || conferenceData.data?.id}`,
    };

    // Transform sessions data
    const transformedSessions = sessions.map((session: any) => ({
      id: session.ID || session.id,
      title: session.TITLE || session.title || session.NAME || session.name,
      description:
        session.DESCRIPTION ||
        session.description ||
        session.SUMMARY ||
        session.summary ||
        "",
      startTime:
        session.START_TIME ||
        session.startTime ||
        session.START_DATE ||
        session.startDate,
      endTime:
        session.END_TIME ||
        session.endTime ||
        session.END_DATE ||
        session.endDate,
      location:
        session.LOCATION ||
        session.location ||
        session.ROOM_NAME ||
        session.roomName ||
        session.ROOM ||
        session.room ||
        "",
      speaker:
        session.SPEAKER ||
        session.speaker ||
        session.PRESENTER ||
        session.presenter ||
        "",
      status: getSessionStatus(session.STATUS || session.status),
      maxAttendees:
        session.MAX_ATTENDEES ||
        session.maxAttendees ||
        session.CAPACITY ||
        session.capacity ||
        50,
      currentAttendees:
        session.CURRENT_ATTENDEES ||
        session.currentAttendees ||
        session.REGISTERED ||
        session.registered ||
        0,
      type:
        session.TYPE ||
        session.type ||
        session.CATEGORY ||
        session.category ||
        "Presentation",
    }));

    return NextResponse.json({
      success: true,
      data: {
        conference,
        sessions: transformedSessions,
      },
    });
  } catch (error) {
    console.error("Error fetching conference details:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch conference details",
      },
      { status: 500 }
    );
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

// Helper function to map session status
function getSessionStatus(
  backendStatus: string
): "upcoming" | "active" | "completed" {
  if (!backendStatus) return "upcoming";

  const status = backendStatus.toLowerCase();
  if (status === "active" || status === "ongoing" || status === "in_progress") {
    return "active";
  }
  if (status === "completed" || status === "finished" || status === "ended") {
    return "completed";
  }
  return "upcoming";
}
