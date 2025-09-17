import { NextRequest, NextResponse } from "next/server";

// Backend API base URL
const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:4000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conferenceId, attendeeInfo, qrCode, checkInMethod } = body;

    if (!conferenceId) {
      return NextResponse.json(
        { success: false, error: "Conference ID is required" },
        { status: 400 }
      );
    }

    // Prepare check-in data for backend
    const checkinData = {
      conferenceId: Number(conferenceId),
      checkInMethod: checkInMethod || "manual",
      ...(qrCode && { qrCode }),
      ...(attendeeInfo && { attendeeInfo }),
    };

    const response = await fetch(`${BACKEND_API_URL}/public/checkins/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkinData),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend check-in error:", errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.message || "Check-in failed",
          code: errorData.error?.code || "CHECKIN_FAILED",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Check-in successful",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Check-in failed. Please try again.",
        code: "NETWORK_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get("conferenceId");
    const qrCode = searchParams.get("qrCode");

    if (!conferenceId) {
      return NextResponse.json(
        { success: false, error: "Conference ID is required" },
        { status: 400 }
      );
    }

    // Validate QR code if provided
    if (qrCode) {
      const response = await fetch(
        `${BACKEND_API_URL}/public/checkins/validate-qr`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrCode, conferenceId: Number(conferenceId) }),
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "QR code validation failed" },
          { status: response.status }
        );
      }

      const result = await response.json();
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    // Get check-ins for conference
    const response = await fetch(
      `${BACKEND_API_URL}/public/checkins?conferenceId=${conferenceId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch check-ins" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
