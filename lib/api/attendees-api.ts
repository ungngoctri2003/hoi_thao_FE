const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface Attendee {
  ID: number;
  NAME: string;
  EMAIL: string;
  PHONE: string | null;
  COMPANY: string | null;
  POSITION: string | null;
  AVATAR_URL: string | null;
  DIETARY: string | null;
  SPECIAL_NEEDS: string | null;
  DATE_OF_BIRTH: Date | null;
  GENDER: string | null;
  FIREBASE_UID: string | null;
  CREATED_AT: Date;
}

export interface AttendeeWithRegistration extends Attendee {
  REGISTRATION_STATUS?: string;
  QR_CODE?: string;
  CONFERENCE_ID?: number;
  REGISTRATION_DATE?: Date;
  CHECKIN_TIME?: Date;
  CHECKOUT_TIME?: Date;
}

export interface AttendeeFilters {
  email?: string;
  name?: string;
  company?: string;
  gender?: string;
}

export interface AttendeeListParams {
  page?: number;
  limit?: number;
  filters?: AttendeeFilters;
  search?: string;
}

export interface AttendeeListResponse {
  data: Attendee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Conference {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;
  START_DATE: Date;
  END_DATE: Date;
  STATUS: string;
  VENUE?: string;
  CREATED_AT: Date;
}

export interface Registration {
  ID: number;
  CONFERENCE_ID: number;
  ATTENDEE_ID: number;
  STATUS: string;
  QR_CODE: string;
  REGISTRATION_DATE: Date;
  CHECKIN_TIME?: Date;
  CHECKOUT_TIME?: Date;
}

export interface CheckinStatus {
  registrationId: number;
  conferenceId: number;
  conferenceName: string;
  status: 'not-registered' | 'registered' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  qrCode: string;
  registrationDate: Date;
  checkinTime?: Date;
  checkoutTime?: Date;
}

class AttendeesAPI {
  private baseUrl = `${API_BASE_URL}/attendees`;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 300; // Increased to 300ms between requests
  private readonly MAX_RETRIES = 3; // Maximum retry attempts
  private readonly RETRY_DELAY = 1000; // Base delay for retries (1 second)

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const token = localStorage.getItem('accessToken');
          
          // Rate limiting: ensure minimum interval between requests
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
          }
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
              ...options.headers,
            },
          });

          this.lastRequestTime = Date.now();

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  // Get all attendees with pagination and filters
  async getAttendees(params: AttendeeListParams = {}): Promise<AttendeeListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) searchParams.append(`filters[${key}]`, value);
      });
    }

    const queryString = searchParams.toString();
    return this.request<AttendeeListResponse>(`?${queryString}`);
  }

  // Get attendee by ID
  async getAttendeeById(id: number): Promise<{ data: Attendee }> {
    return this.request<{ data: Attendee }>(`/${id}`);
  }

  // Search attendees
  async searchAttendees(query: string, limit: number = 10): Promise<{ data: Attendee[] }> {
    return this.request<{ data: Attendee[] }>(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Create new attendee
  async createAttendee(data: Omit<Attendee, 'ID' | 'CREATED_AT'>): Promise<{ data: Attendee }> {
    return this.request<{ data: Attendee }>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update attendee
  async updateAttendee(id: number, data: Partial<Omit<Attendee, 'ID' | 'CREATED_AT'>>): Promise<{ data: Attendee }> {
    return this.request<{ data: Attendee }>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Update current user's attendee info
  async updateMe(data: Partial<Omit<Attendee, 'ID' | 'CREATED_AT'>>): Promise<{ data: Attendee }> {
    return this.request<{ data: Attendee }>('/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Delete attendee
  async deleteAttendee(id: number): Promise<void> {
    await this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get attendee registrations
  async getAttendeeRegistrations(id: number): Promise<{ data: Registration[] }> {
    return this.request<{ data: Registration[] }>(`/${id}/registrations`);
  }

  // Register attendee for conference
  async registerForConference(attendeeId: number, conferenceId: number): Promise<{ data: Registration }> {
    return this.request<{ data: Registration }>(`/${attendeeId}/registrations`, {
      method: 'POST',
      body: JSON.stringify({ conferenceId }),
    });
  }

  // Update registration status
  async updateRegistrationStatus(registrationId: number, status: string): Promise<{ data: Registration }> {
    return this.request<{ data: Registration }>(`/registrations/${registrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Check-in attendee
  async checkinAttendee(registrationId: number): Promise<{ data: Registration }> {
    return this.request<{ data: Registration }>(`/registrations/${registrationId}/checkin`, {
      method: 'POST',
    });
  }

  // Check-out attendee
  async checkoutAttendee(registrationId: number): Promise<{ data: Registration }> {
    return this.request<{ data: Registration }>(`/registrations/${registrationId}/checkout`, {
      method: 'POST',
    });
  }
}

class ConferencesAPI {
  private baseUrl = `${API_BASE_URL}/conferences`;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 300; // Increased to 300ms between requests

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const token = localStorage.getItem('accessToken');
          
          // Rate limiting: ensure minimum interval between requests
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
          }
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
              ...options.headers,
            },
          });

          this.lastRequestTime = Date.now();

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  // Get all conferences
  async getConferences(): Promise<{ data: Conference[] }> {
    return this.request<{ data: Conference[] }>('');
  }

  // Get conference by ID
  async getConferenceById(id: number): Promise<{ data: Conference }> {
    return this.request<{ data: Conference }>(`/${id}`);
  }
}

class RegistrationsAPI {
  private baseUrl = `${API_BASE_URL}/registrations`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all registrations
  async getRegistrations(): Promise<{ data: Registration[] }> {
    return this.request<{ data: Registration[] }>('');
  }

  // Get registrations by conference
  async getRegistrationsByConference(conferenceId: number): Promise<{ data: Registration[] }> {
    return this.request<{ data: Registration[] }>(`?conferenceId=${conferenceId}`);
  }
}

// Export API instances
export const attendeesAPI = new AttendeesAPI();
export const conferencesAPI = new ConferencesAPI();
export const registrationsAPI = new RegistrationsAPI();
