import { API_CONFIG, MOCK_DATA } from '../config/api-config';

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
    attendeeName: string;
    attendeeEmail: string;
    checkInTime: string;
    status: 'success' | 'failed' | 'duplicate';
    qrCode: string;
    conferenceId: number;
  };
  error?: string;
}

interface Attendee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  qrCode: string;
  conferenceId: number;
  isRegistered: boolean;
}

interface Conference {
  id: number;
  name: string;
  date: string;
  status: 'active' | 'inactive';
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
      return {
        success: true,
        message: 'Check-in thành công',
        data: data.data
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
      return data.attendees || [];
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
      return data.data || data || [];
    } catch (error) {
      console.error('Get check-in records error:', error);
      // Return mock data on error
      return MOCK_DATA.CHECKIN_RECORDS.filter(record => 
        !conferenceId || record.conferenceId === conferenceId
      );
    }
  }

  // Export check-in records
  async exportCheckInRecords(conferenceId?: number, format: 'excel' | 'csv' = 'excel'): Promise<Blob> {
    try {
      const url = conferenceId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_EXPORT}?conferenceId=${conferenceId}&format=${format}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.CHECKIN_EXPORT}?format=${format}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export check-in records error:', error);
      throw error;
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
