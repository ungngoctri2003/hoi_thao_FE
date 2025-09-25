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

    // Generate QR code data - ultra simplified for easy scanning
    let qrData: any = {
      id: attendeeId,
      conf: conferenceId ? parseInt(conferenceId) : null,
    };

    // If includeFullData is true, create a URL-based QR code
    if (includeFullData && conferenceId) {
      // Create a short URL that contains full attendee data
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const shortUrl = `${baseUrl}/attendee/${attendeeId}?conf=${conferenceId}`;
      qrData = shortUrl; // QR code will contain just the URL
    }

    const qrString =
      typeof qrData === "string" ? qrData : JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
      width: 600,
      margin: 0,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "L",
      scale: 1,
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

    // Generate QR code data with custom data if provided - ultra simplified
    const qrData = {
      id: attendeeId,
      conf: conferenceId || null,
    };

    const qrString = JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
      width: 600,
      margin: 0,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "L",
      scale: 1,
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
