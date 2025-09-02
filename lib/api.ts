// API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  requested: boolean;
  passwordSent: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  reset: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  changed: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface AttendeeInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  dietary?: string;
  specialNeeds?: string;
  dateOfBirth?: string;
  gender?: string;
  createdAt: string;
}

export interface RegistrationInfo {
  id: number;
  attendeeId: number;
  conferenceId: number;
  status: string;
  createdAt: string;
}

export interface CreateAttendeeRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  dietary?: string;
  specialNeeds?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface CreateRegistrationRequest {
  attendeeId: number;
  conferenceId: number;
}

export interface PublicRegistrationRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
  company?: string;
  position?: string;
  avatarUrl?: string;
  dietary?: string;
  specialNeeds?: string;
  dateOfBirth?: string;
  gender?: string;
  conferenceId?: number;
}

export interface ConferenceInfo {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  status: string;
  createdAt: string;
}

export interface SessionInfo {
  id: number;
  conferenceId: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  speaker?: string;
  createdAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      // Try to get from cookies first, then localStorage as fallback
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
      if (tokenCookie) {
        return tokenCookie.split('=')[1];
      }
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Set cookie with 7 days expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `accessToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      // Also keep in localStorage as backup
      localStorage.setItem('accessToken', token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Set cookie with 30 days expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `refreshToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      // Also keep in localStorage as backup
      localStorage.setItem('refreshToken', token);
    }
  }

  private removeTokens(): void {
    if (typeof window !== 'undefined') {
      // Remove cookies with same attributes as when setting them
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      // Remove from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    return response.data;
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await this.request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await this.request<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await this.request<ChangePasswordResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    // No logout endpoint in backend, just remove tokens locally
    this.removeTokens();
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      // Get user info from profile endpoint
      const profileResponse = await this.request<any>('/profile', {
        method: 'GET',
      });

      // Get permissions from users/me endpoint
      const meResponse = await this.request<any>('/users/me', {
        method: 'GET',
      });

      // Extract user info from the profile response
      const userData = profileResponse.data.user;
      const attendeeData = profileResponse.data.attendee;
      const permissions = meResponse.data.permissions || [];
      
      // Get role from permissions - check for admin, staff, or default to attendee
      let role = 'attendee';
      if (permissions.includes('roles.admin')) {
        role = 'admin';
      } else if (permissions.includes('conferences.create') || permissions.includes('conferences.update')) {
        role = 'staff';
      }
      
      return {
        id: userData.ID,
        email: userData.EMAIL,
        name: userData.NAME,
        role: role,
        avatar: userData.AVATAR_URL || attendeeData?.AVATAR_URL || null,
        createdAt: userData.CREATED_AT,
        updatedAt: userData.LAST_LOGIN || userData.CREATED_AT,
      };
    } catch (error) {
      console.error('Failed to get current user info:', error);
      // If we can't get user info, throw the error so the auth service can handle it
      throw error;
    }
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserInfo> {
    try {
      console.log('🔄 Updating profile via API:', profileData);
      
      // Update profile - backend will handle role-based table updates
      let userResponse;
      try {
        userResponse = await this.request<any>('/profile', {
          method: 'PATCH',
          body: JSON.stringify(profileData),
        });
        console.log('📤 Profile update response:', userResponse);
      } catch (patchError) {
        const errorMessage = patchError instanceof Error ? patchError.message : String(patchError);
        if (errorMessage.includes('CORS') || errorMessage.includes('PATCH')) {
          console.warn('PATCH method blocked by CORS, trying POST...');
          // Fallback to POST method
          userResponse = await this.request<any>('/profile', {
            method: 'POST',
            body: JSON.stringify({ ...profileData, _method: 'PATCH' }), // Some backends use _method override
          });
          console.log('📤 Profile update response (POST fallback):', userResponse);
        } else {
          throw patchError;
        }
      }

      // Return updated user info
      const updatedUser = await this.getCurrentUser();
      console.log('👤 Updated user info:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.getToken();
  }

  // Attendees endpoints
  async getAttendees(params?: { page?: number; limit?: number; filters?: any; search?: string }): Promise<{ data: AttendeeInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) queryParams.append(`filters[${key}]`, value.toString());
      });
    }

    const endpoint = `/attendees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<AttendeeInfo[]>(endpoint, {
      method: 'GET',
    });

    return {
      data: response.data,
      meta: response.meta || {}
    };
  }

  async getAttendeeById(id: number): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>(`/attendees/${id}`, {
      method: 'GET',
    });

    return response.data;
  }

  async createAttendee(attendeeData: CreateAttendeeRequest): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>('/attendees', {
      method: 'POST',
      body: JSON.stringify(attendeeData),
    });

    return response.data;
  }

  async updateAttendee(id: number, attendeeData: Partial<CreateAttendeeRequest>): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>(`/attendees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(attendeeData),
    });

    return response.data;
  }

  async deleteAttendee(id: number): Promise<void> {
    await this.request(`/attendees/${id}`, {
      method: 'DELETE',
    });
  }

  // Registrations endpoints
  async getRegistrations(params?: { page?: number; limit?: number; attendeeId?: number; conferenceId?: number; status?: string }): Promise<{ data: RegistrationInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.attendeeId) queryParams.append('attendeeId', params.attendeeId.toString());
    if (params?.conferenceId) queryParams.append('conferenceId', params.conferenceId.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/registrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<RegistrationInfo[]>(endpoint, {
      method: 'GET',
    });

    return {
      data: response.data,
      meta: response.meta || {}
    };
  }

  async getRegistrationById(id: number): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>(`/registrations/${id}`, {
      method: 'GET',
    });

    return response.data;
  }

  async createRegistration(registrationData: CreateRegistrationRequest): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });

    return response.data;
  }

  async updateRegistration(id: number, status: string): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>(`/registrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return response.data;
  }

  async deleteRegistration(id: number): Promise<void> {
    await this.request(`/registrations/${id}`, {
      method: 'DELETE',
    });
  }

  async publicRegistration(registrationData: PublicRegistrationRequest): Promise<any> {
    const response = await this.request<any>('/registrations/public', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });

    return response.data;
  }

  async uploadImage(imageData: string): Promise<{ url: string; publicId: string }> {
    try {
      const response = await this.request<{ url: string; publicId: string }>('/upload/image', {
        method: 'POST',
        body: JSON.stringify({ imageData }),
      });

      return response.data;
    } catch (error) {
      // Check if it's a CORS error or endpoint not found
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('CORS') || errorMessage?.includes('cors')) {
        throw new Error('CORS Error: Cannot upload to cloud storage. Please use image URL instead.');
      } else if (errorMessage?.includes('404') || errorMessage?.includes('Not Found')) {
        throw new Error('Upload endpoint not found. Please use image URL instead.');
      } else {
        throw new Error(`Upload failed: ${errorMessage}`);
      }
    }
  }

  // Conferences endpoints
  async getConferences(params?: { page?: number; limit?: number; status?: string }): Promise<{ data: ConferenceInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/conferences${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any[]>(endpoint, {
      method: 'GET',
    });

    const mapped: ConferenceInfo[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      name: row.NAME ?? row.name,
      description: row.DESCRIPTION ?? row.description,
      startDate: row.START_DATE ?? row.startDate,
      endDate: row.END_DATE ?? row.endDate,
      location: row.LOCATION ?? row.location,
      status: row.STATUS ?? row.status,
      createdAt: row.CREATED_AT ?? row.createdAt,
    }));

    return {
      data: mapped,
      meta: response.meta || {}
    };
  }

  async getConferenceById(id: number): Promise<ConferenceInfo> {
    const response = await this.request<any>(`/conferences/${id}`, {
      method: 'GET',
    });

    const row: any = response.data;
    return {
      id: row.ID ?? row.id,
      name: row.NAME ?? row.name,
      description: row.DESCRIPTION ?? row.description,
      startDate: row.START_DATE ?? row.startDate,
      endDate: row.END_DATE ?? row.endDate,
      location: row.LOCATION ?? row.location,
      status: row.STATUS ?? row.status,
      createdAt: row.CREATED_AT ?? row.createdAt,
    };
  }

  // Sessions endpoints (if available)
  async getSessions(conferenceId?: number): Promise<{ data: SessionInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (conferenceId) queryParams.append('conferenceId', conferenceId.toString());

    const endpoint = `/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any[]>(endpoint, {
      method: 'GET',
    });

    const mapped: SessionInfo[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      conferenceId: row.CONFERENCE_ID ?? row.conferenceId,
      name: row.TITLE ?? row.name, // Backend uses TITLE field
      description: row.DESCRIPTION ?? row.description,
      startTime: row.START_TIME ?? row.startTime,
      endTime: row.END_TIME ?? row.endTime,
      location: row.LOCATION ?? row.location,
      speaker: row.SPEAKER ?? row.speaker,
      createdAt: row.CREATED_AT ?? row.createdAt,
    }));

    return {
      data: mapped,
      meta: response.meta || {}
    };
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
