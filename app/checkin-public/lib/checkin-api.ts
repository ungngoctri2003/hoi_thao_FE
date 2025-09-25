import { API_CONFIG, MOCK_DATA } from "../config/api-config";
import { type Attendee, type Conference } from "../types";

interface CheckInRequest {
  attendeeId?: number;
  qrCode?: string;
  conferenceId: number;
  checkInMethod: "qr" | "manual";
  attendeeInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    attendeeName: string | null;
    attendeeEmail: string | null;
    checkInTime: string;
    status: "success" | "failed" | "duplicate";
    qrCode: string | null;
    conferenceId: number;
  };
  error?: string;
}

class CheckInAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Check-in attendee
  async checkInAttendee(request: CheckInRequest): Promise<CheckInResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        // Return mock response if API is not available
        console.warn("Check-in API not available, using mock response");
        const mockResponse: CheckInResponse = {
          success: true,
          message: "Check-in thành công (Mock)",
          data: {
            id: Date.now(),
            attendeeName: request.attendeeInfo?.name || "Tham dự viên",
            attendeeEmail: request.attendeeInfo?.email || "email@example.com",
            checkInTime: new Date().toLocaleString("vi-VN"),
            status: "success",
            qrCode: request.qrCode || "MOCK_QR",
            conferenceId: request.conferenceId,
          },
        };
        return mockResponse;
      }

      const data = await response.json();
      console.log("Check-in API response:", data);

      // Handle different response formats
      const responseData = data.data || data;

      return {
        success: true,
        message: "Check-in thành công",
        data: {
          id: responseData.id || responseData.ID || Date.now(),
          attendeeName:
            responseData.attendeeName ||
            responseData.ATTENDEE_NAME ||
            responseData.attendee_name ||
            "N/A",
          attendeeEmail:
            responseData.attendeeEmail ||
            responseData.ATTENDEE_EMAIL ||
            responseData.attendee_email ||
            "N/A",
          checkInTime:
            responseData.checkInTime ||
            responseData.CHECKIN_TIME ||
            responseData.checkin_time ||
            new Date().toLocaleString("vi-VN"),
          status: responseData.status || responseData.STATUS || "success",
          qrCode:
            responseData.qrCode ||
            responseData.QR_CODE ||
            responseData.qr_code ||
            "N/A",
          conferenceId:
            responseData.conferenceId ||
            responseData.CONFERENCE_ID ||
            responseData.conference_id ||
            0,
        },
      };
    } catch (error) {
      console.error("Check-in error:", error);
      // Return mock response on error
      const mockResponse: CheckInResponse = {
        success: true,
        message: "Check-in thành công (Mock)",
        data: {
          id: Date.now(),
          attendeeName: request.attendeeInfo?.name || "Tham dự viên",
          attendeeEmail: request.attendeeInfo?.email || "email@example.com",
          checkInTime: new Date().toLocaleString("vi-VN"),
          status: "success",
          qrCode: request.qrCode || "MOCK_QR",
          conferenceId: request.conferenceId,
        },
      };
      return mockResponse;
    }
  }

  // Search attendees
  async searchAttendees(
    query: string,
    conferenceId: number
  ): Promise<Attendee[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${
          API_CONFIG.ENDPOINTS.ATTENDEES_SEARCH
        }?q=${encodeURIComponent(query)}&conferenceId=${conferenceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // Return mock data if API is not available or requires authentication
        console.warn(
          "Search attendees API not available or requires authentication, using mock data"
        );
        const mockAttendees = MOCK_DATA.ATTENDEES.filter(
          (attendee) => attendee.conferenceId === conferenceId
        );

        // Filter by query
        return mockAttendees.filter(
          (attendee) =>
            attendee.name.toLowerCase().includes(query.toLowerCase()) ||
            attendee.email.toLowerCase().includes(query.toLowerCase()) ||
            attendee.phone?.includes(query) ||
            attendee.qrCode.toLowerCase().includes(query.toLowerCase())
        );
      }

      const data = await response.json();
      console.log("Search API response:", data);

      // Map backend response format to frontend format
      const attendees = data.data || [];
      return attendees.map((attendee: any) => ({
        id: attendee.ID || attendee.id,
        name: attendee.NAME || attendee.name,
        email: attendee.EMAIL || attendee.email,
        phone: attendee.PHONE || attendee.phone,
        qrCode: attendee.QR_CODE || attendee.qrCode,
        conferenceId: conferenceId,
        isRegistered:
          attendee.REGISTRATION_STATUS === "registered" ||
          attendee.isRegistered ||
          true,
      }));
    } catch (error) {
      console.error("Search attendees error:", error);
      // Return mock data on error
      const mockAttendees = MOCK_DATA.ATTENDEES.filter(
        (attendee) => attendee.conferenceId === conferenceId
      );

      // Filter by query
      return mockAttendees.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(query.toLowerCase()) ||
          attendee.email.toLowerCase().includes(query.toLowerCase()) ||
          attendee.phone?.includes(query) ||
          attendee.qrCode.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Get conferences
  async getConferences(): Promise<Conference[]> {
    try {
      // Use public endpoint (no authentication required)
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.CONFERENCES}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        // Return mock data if API is not available
        console.warn("Conferences API not available, using mock data");
        return MOCK_DATA.CONFERENCES as Conference[];
      }

      const data = await response.json();
      const conferences = data.data || data || [];

      // Map backend response format to frontend format
      return conferences
        .map((conference: any) => ({
          id: conference.ID || conference.id,
          name: conference.NAME || conference.name,
          date: conference.START_DATE
            ? new Date(conference.START_DATE).toLocaleDateString("vi-VN")
            : conference.date || "N/A",
          status: (conference.STATUS || conference.status || "active") as
            | "active"
            | "inactive",
        }))
        .filter(
          (conference: Conference) =>
            conference.id !== undefined && conference.id !== null
        );
    } catch (error) {
      console.error("Get conferences error:", error);
      // Return mock data on error
      return MOCK_DATA.CONFERENCES as Conference[];
    }
  }

  // Get check-in records
  async getCheckInRecords(conferenceId?: number): Promise<any[]> {
    try {
      // Use the correct endpoint from config
      const url = conferenceId
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_RECORDS}?conferenceId=${conferenceId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_RECORDS}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Return mock data if API is not available or requires authentication
        console.warn(
          "Check-in records API not available or requires authentication, using mock data"
        );
        return MOCK_DATA.CHECKIN_RECORDS.filter(
          (record) => !conferenceId || record.conferenceId === conferenceId
        );
      }

      const data = await response.json();
      console.log("Check-in records API response:", data);

      const records = data.data || data || [];

      // Map backend response format to frontend format
      return records.map((record: any) => {
        // Backend now returns: ID, REGISTRATION_ID, CHECKIN_TIME, METHOD, STATUS, ATTENDEE_NAME, ATTENDEE_EMAIL, ATTENDEE_PHONE, QR_CODE, CONFERENCE_ID
        const checkInTime =
          record.CHECKIN_TIME || record.checkInTime || record.checkin_time;
        let formattedTime = "N/A";

        if (checkInTime) {
          try {
            const date = new Date(checkInTime);
            formattedTime = date.toLocaleString("vi-VN");
          } catch (e) {
            formattedTime = checkInTime.toString();
          }
        }

        return {
          id: record.ID || record.id || Date.now(),
          attendeeName:
            record.ATTENDEE_NAME ||
            record.attendeeName ||
            record.attendee_name ||
            "N/A",
          attendeeEmail:
            record.ATTENDEE_EMAIL ||
            record.attendeeEmail ||
            record.attendee_email ||
            "N/A",
          checkInTime: formattedTime,
          status: record.STATUS || record.status || "success",
          qrCode: record.QR_CODE || record.qrCode || record.qr_code || "N/A",
          conferenceId:
            record.CONFERENCE_ID ||
            record.conferenceId ||
            record.conference_id ||
            0,
        };
      });
    } catch (error) {
      console.error("Get check-in records error:", error);
      // Return mock data on error
      return MOCK_DATA.CHECKIN_RECORDS.filter(
        (record) => !conferenceId || record.conferenceId === conferenceId
      );
    }
  }

  // Delete check-in record
  async deleteCheckInRecord(
    checkInId: number,
    qrCode: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_RECORDS}/${checkInId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrCode }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error?.message || "Lỗi khi xóa check-in",
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || "Xóa check-in thành công",
      };
    } catch (error) {
      console.error("Delete check-in error:", error);
      return {
        success: false,
        message: "Lỗi khi xóa check-in",
      };
    }
  }

  // Validate QR code
  async validateQRCode(
    qrCode: string,
    conferenceId: number
  ): Promise<{ valid: boolean; attendee?: Attendee; qrData?: any }> {
    try {
      // Parse QR code to extract attendee information
      let attendeeId: number | null = null;
      let qrConferenceId: number | null = null;
      let qrData: any = null;

      // Check if QR code is a URL first
      if (qrCode.startsWith("http")) {
        console.log("📱 QR code is a URL:", qrCode);
        // Extract attendee ID and conference ID from URL
        const urlMatch = qrCode.match(/\/attendee\/(\d+)\?conf=(\d+)/);
        if (urlMatch) {
          attendeeId = parseInt(urlMatch[1]);
          qrConferenceId = parseInt(urlMatch[2]);
          console.log("📱 Extracted from URL:", { attendeeId, qrConferenceId });
        } else {
          console.warn("❌ Invalid URL format in QR code");
          return { valid: false };
        }
      } else {
        // Try to parse as JSON first (from name card)
        try {
          qrData = JSON.parse(qrCode);
          console.log("📱 Parsed QR data:", qrData);

          if (qrData.id) {
            attendeeId = qrData.id;
            qrConferenceId = qrData.conf;
            console.log("📱 Parsed name card QR code:", {
              attendeeId,
              qrConferenceId,
              hasFullData: !!qrData.attendee,
            });

            // If QR code contains full attendee data, use it directly
            if (qrData.a) {
              console.log(
                "✅ QR code contains full attendee data, using it directly"
              );
              const attendee: Attendee = {
                id: qrData.a.id,
                name: qrData.a.n,
                email: qrData.a.e,
                phone: qrData.a.p,
                qrCode: qrCode,
                conferenceId: qrConferenceId || conferenceId,
                isRegistered: true,
              };

              // Validate checksum if present
              if (qrData.checksum) {
                const expectedChecksum = this.generateChecksum(
                  attendeeId,
                  qrConferenceId || conferenceId
                );
                if (qrData.checksum !== expectedChecksum) {
                  console.warn("❌ QR code checksum validation failed");
                  return { valid: false };
                }
              }

              return { valid: true, attendee, qrData };
            }
          } else {
            console.log("📱 QR data doesn't match expected format:", {
              id: qrData.id,
              hasId: !!qrData.id,
            });
          }
        } catch (e) {
          console.log("📱 QR data is not JSON format, trying string format");
          // Not JSON, try to parse as string format
          const parts = qrCode.split(":");
          if (parts.length >= 2 && parts[0] === "ATTENDEE") {
            attendeeId = parseInt(parts[1]);
            if (parts.length >= 4 && parts[2] === "CONF") {
              qrConferenceId = parseInt(parts[3]);
            }
            console.log("📱 Parsed string QR code:", {
              attendeeId,
              qrConferenceId,
            });
          }
        }
      }

      if (!attendeeId) {
        console.warn("❌ Invalid QR code format:", qrCode);
        return { valid: false };
      }

      // Check if conference ID matches (if specified in QR code)
      if (qrConferenceId && qrConferenceId !== conferenceId) {
        console.warn("❌ QR code conference mismatch:", {
          qrConferenceId,
          conferenceId,
        });
        return { valid: false };
      }

      // If we have attendeeId but no full attendee data, try to find from mock data
      if (attendeeId && !qrData?.attendee) {
        console.log(
          "📱 Looking up attendee from mock data for ID:",
          attendeeId
        );
        const mockAttendees = MOCK_DATA.ATTENDEES.filter(
          (attendee) => attendee.conferenceId === conferenceId
        );

        const attendee = mockAttendees.find((a) => a.id === attendeeId);
        if (attendee) {
          console.log("✅ Found attendee in mock data:", attendee);
          return { valid: true, attendee, qrData };
        }
      }

      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_VALIDATE_QR}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qrCode,
            conferenceId,
            attendeeId,
            qrConferenceId,
          }),
        }
      );

      if (!response.ok) {
        // Return mock validation if API is not available or requires authentication
        console.warn(
          "Validate QR code API not available or requires authentication, using mock validation"
        );
        const mockAttendees = MOCK_DATA.ATTENDEES.filter(
          (attendee) => attendee.conferenceId === conferenceId
        );

        // Find attendee by ID or QR code
        const attendee = mockAttendees.find(
          (a) => a.id === attendeeId || a.qrCode === qrCode
        );

        if (attendee) {
          console.log("✅ Mock validation successful:", attendee);
          return { valid: true, attendee, qrData };
        } else {
          console.warn("❌ Mock validation failed: attendee not found");
          return { valid: false };
        }
      }

      const data = await response.json();
      console.log("✅ QR validation API response:", data);
      return data;
    } catch (error) {
      console.error("Validate QR code error:", error);
      // Return mock validation on error
      const mockAttendees = MOCK_DATA.ATTENDEES.filter(
        (attendee) => attendee.conferenceId === conferenceId
      );

      // Try to find attendee by QR code
      const attendee = mockAttendees.find((a) => a.qrCode === qrCode);
      return { valid: !!attendee, attendee };
    }
  }

  // Generate checksum for QR code validation
  private generateChecksum(attendeeId: number, conferenceId: number): string {
    const data = `${attendeeId}-${conferenceId}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

export const checkInAPI = new CheckInAPI();
export type { CheckInRequest, CheckInResponse, Attendee, Conference };
