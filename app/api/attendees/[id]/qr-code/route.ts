import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendeeId = parseInt(params.id);

    if (isNaN(attendeeId)) {
      return NextResponse.json(
        { error: "Invalid attendee ID" },
        { status: 400 }
      );
    }

    // Get conference ID from query params if provided
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get("conferenceId");
    const includeFullData = searchParams.get("includeFullData") === "true";

    // Generate QR code data
    let qrData: any = {
      attendeeId,
      conferenceId: conferenceId ? parseInt(conferenceId) : null,
      timestamp: Date.now(),
      type: "attendee_registration",
    };

    // If includeFullData is true, we'll need to fetch attendee and conference data
    // For now, we'll create a basic structure that can be enhanced
    if (includeFullData && conferenceId) {
      qrData = {
        type: "attendee_registration",
        attendeeId,
        conferenceId: parseInt(conferenceId),
        timestamp: Date.now(),
        // Note: In a real implementation, you would fetch this data from the database
        attendee: {
          id: attendeeId,
          // These would be fetched from database
          name: "Attendee Name",
          email: "attendee@example.com",
        },
        conference: {
          id: parseInt(conferenceId),
          // These would be fetched from database
          name: "Conference Name",
        },
        version: "1.0",
      };
    }

    const qrString = JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrString,
        qrCodeDataUrl,
        attendeeId,
        conferenceId: conferenceId ? parseInt(conferenceId) : null,
        generatedAt: new Date().toISOString(),
        includeFullData,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attendeeId = parseInt(params.id);

    if (isNaN(attendeeId)) {
      return NextResponse.json(
        { error: "Invalid attendee ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { conferenceId, customData } = body;

    // Generate QR code data with custom data if provided
    const qrData = {
      attendeeId,
      conferenceId: conferenceId || null,
      customData: customData || null,
      timestamp: Date.now(),
      type: "attendee_registration",
    };

    const qrString = JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrString,
        qrCodeDataUrl,
        attendeeId,
        conferenceId: conferenceId || null,
        customData: customData || null,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
