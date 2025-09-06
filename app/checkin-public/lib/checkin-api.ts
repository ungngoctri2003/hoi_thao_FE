import { API_CONFIG, MOCK_DATA } from '../config/api-config';
import { type Attendee, type Conference } from '../types';

interface CheckInRequest {
  attendeeId?: number;
  qrCode?: string;
  conferenceId: number;
  checkInMethod: 'qr' | 'manual';
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
    status: 'success' | 'failed' | 'duplicate';
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
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        // Return mock response if API is not available
        console.warn('Check-in API not available, using mock response');
        const mockResponse: CheckInResponse = {
          success: true,
          message: 'Check-in thành công (Mock)',
          data: {
            id: Date.now(),
            attendeeName: request.attendeeInfo?.name || 'Tham dự viên',
            attendeeEmail: request.attendeeInfo?.email || 'email@example.com',
            checkInTime: new Date().toLocaleString('vi-VN'),
            status: 'success',
            qrCode: request.qrCode || 'MOCK_QR',
            conferenceId: request.conferenceId
          }
        };
        return mockResponse;
      }

      const data = await response.json();
      console.log('Check-in API response:', data);
      
      // Handle different response formats
      const responseData = data.data || data;
      
      return {
        success: true,
        message: 'Check-in thành công',
        data: {
          id: responseData.id || responseData.ID || Date.now(),
          attendeeName: responseData.attendeeName || responseData.ATTENDEE_NAME || responseData.attendee_name || 'N/A',
          attendeeEmail: responseData.attendeeEmail || responseData.ATTENDEE_EMAIL || responseData.attendee_email || 'N/A',
          checkInTime: responseData.checkInTime || responseData.CHECKIN_TIME || responseData.checkin_time || new Date().toLocaleString('vi-VN'),
          status: responseData.status || responseData.STATUS || 'success',
          qrCode: responseData.qrCode || responseData.QR_CODE || responseData.qr_code || 'N/A',
          conferenceId: responseData.conferenceId || responseData.CONFERENCE_ID || responseData.conference_id || 0
        }
      };
    } catch (error) {
      console.error('Check-in error:', error);
      // Return mock response on error
      const mockResponse: CheckInResponse = {
        success: true,
        message: 'Check-in thành công (Mock)',
        data: {
          id: Date.now(),
          attendeeName: request.attendeeInfo?.name || 'Tham dự viên',
          attendeeEmail: request.attendeeInfo?.email || 'email@example.com',
          checkInTime: new Date().toLocaleString('vi-VN'),
          status: 'success',
          qrCode: request.qrCode || 'MOCK_QR',
          conferenceId: request.conferenceId
        }
      };
      return mockResponse;
    }
  }

  // Search attendees
  async searchAttendees(query: string, conferenceId: number): Promise<Attendee[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ATTENDEES_SEARCH}?q=${encodeURIComponent(query)}&conferenceId=${conferenceId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Return mock data if API is not available or requires authentication
        console.warn('Search attendees API not available or requires authentication, using mock data');
        const mockAttendees = MOCK_DATA.ATTENDEES.filter(attendee => attendee.conferenceId === conferenceId);
        
        // Filter by query
        return mockAttendees.filter(attendee => 
          attendee.name.toLowerCase().includes(query.toLowerCase()) ||
          attendee.email.toLowerCase().includes(query.toLowerCase()) ||
          attendee.phone?.includes(query) ||
          attendee.qrCode.toLowerCase().includes(query.toLowerCase())
        );
      }

      const data = await response.json();
      console.log('Search API response:', data);
      
      // Map backend response format to frontend format
      const attendees = data.data || [];
      return attendees.map((attendee: any) => ({
        id: attendee.ID || attendee.id,
        name: attendee.NAME || attendee.name,
        email: attendee.EMAIL || attendee.email,
        phone: attendee.PHONE || attendee.phone,
        qrCode: attendee.QR_CODE || attendee.qrCode,
        conferenceId: conferenceId,
        isRegistered: attendee.REGISTRATION_STATUS === 'registered' || attendee.isRegistered || true
      }));
    } catch (error) {
      console.error('Search attendees error:', error);
      // Return mock data on error
      const mockAttendees = MOCK_DATA.ATTENDEES.filter(attendee => attendee.conferenceId === conferenceId);
      
      // Filter by query
      return mockAttendees.filter(attendee => 
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
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CONFERENCES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Return mock data if API is not available
        console.warn('Conferences API not available, using mock data');
        return MOCK_DATA.CONFERENCES as Conference[];
      }

      const data = await response.json();
      const conferences = data.data || data || [];
      
      // Map backend response format to frontend format
      return conferences.map((conference: any) => ({
        id: conference.ID || conference.id,
        name: conference.NAME || conference.name,
        date: conference.START_DATE ? 
          new Date(conference.START_DATE).toLocaleDateString('vi-VN') : 
          (conference.date || 'N/A'),
        status: (conference.STATUS || conference.status || 'active') as 'active' | 'inactive'
      })).filter((conference: Conference) => 
        conference.id !== undefined && conference.id !== null
      );
    } catch (error) {
      console.error('Get conferences error:', error);
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Return mock data if API is not available or requires authentication
        console.warn('Check-in records API not available or requires authentication, using mock data');
        return MOCK_DATA.CHECKIN_RECORDS.filter(record => 
          !conferenceId || record.conferenceId === conferenceId
        );
      }

      const data = await response.json();
      console.log('Check-in records API response:', data);
      
      const records = data.data || data || [];
      
      // Map backend response format to frontend format
      return records.map((record: any) => {
        // Backend now returns: ID, REGISTRATION_ID, CHECKIN_TIME, METHOD, STATUS, ATTENDEE_NAME, ATTENDEE_EMAIL, ATTENDEE_PHONE, QR_CODE, CONFERENCE_ID
        const checkInTime = record.CHECKIN_TIME || record.checkInTime || record.checkin_time;
        let formattedTime = 'N/A';
        
        if (checkInTime) {
          try {
            const date = new Date(checkInTime);
            formattedTime = date.toLocaleString('vi-VN');
          } catch (e) {
            formattedTime = checkInTime.toString();
          }
        }
        
        return {
          id: record.ID || record.id || Date.now(),
          attendeeName: record.ATTENDEE_NAME || record.attendeeName || record.attendee_name || 'N/A',
          attendeeEmail: record.ATTENDEE_EMAIL || record.attendeeEmail || record.attendee_email || 'N/A',
          checkInTime: formattedTime,
          status: record.STATUS || record.status || 'success',
          qrCode: record.QR_CODE || record.qrCode || record.qr_code || 'N/A',
          conferenceId: record.CONFERENCE_ID || record.conferenceId || record.conference_id || 0
        };
      });
    } catch (error) {
      console.error('Get check-in records error:', error);
      // Return mock data on error
      return MOCK_DATA.CHECKIN_RECORDS.filter(record => 
        !conferenceId || record.conferenceId === conferenceId
      );
    }
  }


  // Delete check-in record
  async deleteCheckInRecord(checkInId: number, qrCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_RECORDS}/${checkInId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error?.message || 'Lỗi khi xóa check-in'
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Xóa check-in thành công'
      };
    } catch (error) {
      console.error('Delete check-in error:', error);
      return {
        success: false,
        message: 'Lỗi khi xóa check-in'
      };
    }
  }

  // Validate QR code
  async validateQRCode(qrCode: string, conferenceId: number): Promise<{ valid: boolean; attendee?: Attendee }> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_VALIDATE_QR}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode, conferenceId }),
      });

      if (!response.ok) {
        // Return mock validation if API is not available or requires authentication
        console.warn('Validate QR code API not available or requires authentication, using mock validation');
        const mockAttendees = MOCK_DATA.ATTENDEES.filter(attendee => attendee.conferenceId === conferenceId);
        
        const attendee = mockAttendees.find(a => a.qrCode === qrCode);
        return { valid: !!attendee, attendee };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Validate QR code error:', error);
      // Return mock validation on error
      const mockAttendees = MOCK_DATA.ATTENDEES.filter(attendee => attendee.conferenceId === conferenceId);
      
      const attendee = mockAttendees.find(a => a.qrCode === qrCode);
      return { valid: !!attendee, attendee };
    }
  }
}

export const checkInAPI = new CheckInAPI();
export type { CheckInRequest, CheckInResponse, Attendee, Conference };
