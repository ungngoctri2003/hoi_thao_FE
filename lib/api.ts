// API configuration and utilities
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
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

export interface GoogleLoginRequest {
  firebaseUid: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface GoogleRegisterRequest {
  email: string;
  name: string;
  avatar?: string;
  firebaseUid: string;
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
  permissions?: string[];
}

// Roles Management Interfaces
export interface Role {
  id: number;
  code: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "attendee";
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface CreateRoleRequest {
  code: string;
  name: string;
}

export interface UpdateRoleRequest {
  code?: string;
  name?: string;
}

export interface AssignPermissionRequest {
  permissionId: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password?: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  status?: string;
  password?: string;
  role?: string;
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
  // Backend fields (uppercase)
  ID?: number;
  NAME?: string;
  EMAIL?: string;
  PHONE?: string;
  COMPANY?: string;
  POSITION?: string;
  AVATAR_URL?: string;
  CREATED_AT?: string;
  STATUS?: string;
  CONFERENCE_NAME?: string;
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
  capacity?: number;
  category?: string;
  organizer?: string;
}

export interface UserConferenceAssignment {
  id: number;
  userId: number;
  conferenceId: number;
  permissions: Record<string, boolean>;
  assignedBy: number;
  assignedAt: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  conferenceName?: string;
  conferenceStatus?: string;
  userName?: string;
  userEmail?: string;
}

export interface CreateUserConferenceAssignmentRequest {
  userId: number;
  conferenceId: number;
  permissions: Record<string, boolean>;
}

export interface UpdateUserConferenceAssignmentRequest {
  permissions?: Record<string, boolean>;
  isActive?: number;
}

export interface BulkAssignConferencesRequest {
  userId: number;
  conferenceIds: number[];
  permissions: Record<string, boolean>;
}

export interface SessionInfo {
  id: number;
  conferenceId: number;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  roomId?: number;
  roomName?: string;
  speaker?: string;
  createdAt: string;
}

// Audit Logs Interfaces
export interface AuditLog {
  id: number;
  timestamp: string;
  userId?: number;
  actionName?: string;
  resourceName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failed" | "warning";
  category?: "auth" | "user" | "conference" | "system" | "data";
  // Backend fields (uppercase)
  ID?: number;
  TS?: string;
  USER_ID?: number;
  ACTION_NAME?: string;
  RESOURCE_NAME?: string;
  DETAILS?: string;
  IP_ADDRESS?: string;
  USER_AGENT?: string;
  STATUS?: string;
  CATEGORY?: string;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: number | number[];
  category?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      // Check if token is expired before sending request
      if (this.isTokenExpired(token)) {
        try {
          const refreshSuccess = await this.attemptTokenRefresh();
          if (refreshSuccess) {
            // Get the new token
            const newToken = this.getToken();
            if (newToken) {
              defaultHeaders["Authorization"] = `Bearer ${newToken}`;
            }
          } else {
            // If refresh fails, clear tokens and handle session expiration
            this.removeTokens();
            this.handleSessionExpiration();
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
        } catch (refreshError) {
          console.error("Token refresh failed before request:", refreshError);
          this.removeTokens();
          this.handleSessionExpiration();
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
      } else {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
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

      // Handle responses with no content (204, 205)
      if (response.status === 204 || response.status === 205) {
        return { success: true, data: null } as ApiResponse<T>;
      }

      // Try to parse JSON, but handle cases where there's no content
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, create a basic response object
        data = { message: response.statusText || "No content" };
      }

      if (!response.ok) {
        // Handle 401 Unauthorized with automatic token refresh
        if (
          response.status === 401 &&
          !isRetry &&
          this.shouldAttemptRefresh(endpoint)
        ) {
          // Check if this is an account disabled error
          if (data.error && data.error.code === "ACCOUNT_DISABLED") {
            // Clear tokens and handle account disabled
            this.removeTokens();
            this.handleAccountDisabled();
            throw new Error(
              "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ."
            );
          }

          try {
            const refreshSuccess = await this.attemptTokenRefresh();
            if (refreshSuccess) {
              // Retry the original request with new token
              return this.request<T>(endpoint, options, true);
            } else {
              this.removeTokens();
              this.handleSessionExpiration();
              throw new Error(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            this.removeTokens();
            this.handleSessionExpiration();
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
        }

        // Create more descriptive error messages
        let errorMessage =
          data.message || `HTTP error! status: ${response.status}`;

        // Add specific error handling for common status codes
        switch (response.status) {
          case 400:
            errorMessage = data.message || "Thông tin không hợp lệ";
            break;
          case 401:
            // Check if this is an account disabled error
            if (data.error && data.error.code === "ACCOUNT_DISABLED") {
              errorMessage =
                "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
              this.removeTokens();
              this.handleAccountDisabled();
            }
            // Check if this is a token-related 401
            else if (
              endpoint.includes("/auth/") ||
              endpoint.includes("/profile") ||
              endpoint.includes("/users/me")
            ) {
              // For auth endpoints, clear tokens and handle session expiration
              this.removeTokens();
              errorMessage =
                data.message ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
              // Trigger session expiration handler
              this.handleSessionExpiration();
            } else {
              // For other endpoints, also clear tokens and handle session expiration
              this.removeTokens();
              errorMessage =
                data.message ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
              this.handleSessionExpiration();
            }
            break;
          case 403:
            errorMessage = data.message || "Bị cấm truy cập";
            break;
          case 404:
            errorMessage = data.message || "Không tìm thấy tài nguyên";
            break;
          case 409:
            errorMessage = data.message || "Tài khoản đã tồn tại";
            break;
          case 422:
            errorMessage = data.message || "Dữ liệu không hợp lệ";
            break;
          case 500:
            errorMessage = data.message || "Lỗi máy chủ";
            break;
          default:
            errorMessage = data.message || `Lỗi ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      // Try to get from cookies first, then localStorage as fallback
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        return token;
      }
      const token = localStorage.getItem("accessToken");
      return token;
    }
    return null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      return now >= payload.exp;
    } catch (error) {
      return true; // Consider invalid token as expired
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      // Try to get from cookies first, then localStorage as fallback
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("refreshToken=")
      );
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        return token;
      }
      const token = localStorage.getItem("refreshToken");
      return token;
    }
    return null;
  }

  private shouldAttemptRefresh(endpoint: string): boolean {
    // Don't attempt refresh for auth endpoints (login, register, refresh itself)
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    return !authEndpoints.some((authEndpoint) =>
      endpoint.includes(authEndpoint)
    );
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.refreshToken({ refreshToken });
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear tokens if refresh fails
      this.removeTokens();
      this.handleSessionExpiration();
      return false;
    }
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      // Set cookie with 7 days expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `accessToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      // Also keep in localStorage as backup
      localStorage.setItem("accessToken", token);
    }
  }

  private setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      // Set cookie with 30 days expiration
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `refreshToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      // Also keep in localStorage as backup
      localStorage.setItem("refreshToken", token);
    }
  }

  private removeTokens(): void {
    if (typeof window !== "undefined") {
      // Remove cookies with same attributes as when setting them
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      // Remove from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  private handleSessionExpiration(): void {
    if (typeof window !== "undefined") {
      // Dispatch session expiration event for components to handle
      const event = new CustomEvent("session-expired", {
        detail: {
          message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  private handleAccountDisabled(): void {
    if (typeof window !== "undefined") {
      // Dispatch account disabled event for components to handle
      const event = new CustomEvent("account-disabled", {
        detail: {
          message:
            "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response.data;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return response.data;
  }

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const response = await this.request<ForgotPasswordResponse>(
      "/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  }

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const response = await this.request<ResetPasswordResponse>(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  }

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const response = await this.request<ChangePasswordResponse>(
      "/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // Use direct fetch to avoid infinite loop with request method
    const url = `${this.baseURL}/auth/refresh`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Token refresh failed" }));
      throw new Error(errorData.message || "Token refresh failed");
    }

    const result = await response.json();

    if (result.data) {
      this.setToken(result.data.accessToken);
      this.setRefreshToken(result.data.refreshToken);
    }

    return result.data;
  }

  async logout(): Promise<void> {
    // No logout endpoint in backend, just remove tokens locally
    this.removeTokens();
  }

  async loginWithGoogle(
    googleData: GoogleLoginRequest
  ): Promise<LoginResponse> {
    // Sử dụng Next.js API route thay vì backend
    const response = await fetch("/api/auth/google/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases for Google login
      let errorMessage =
        result.message || `HTTP error! status: ${response.status}`;

      switch (response.status) {
        case 409:
          errorMessage = result.message || "Tài khoản chưa được đăng ký";
          break;
        case 401:
          errorMessage =
            result.message || "Thông tin xác thực Google không hợp lệ";
          break;
        case 400:
          errorMessage = result.message || "Thông tin Google không hợp lệ";
          break;
        default:
          errorMessage =
            result.message || `Lỗi đăng nhập Google: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    if (result.data) {
      this.setToken(result.data.accessToken);
      this.setRefreshToken(result.data.refreshToken);
    }

    return result.data;
  }

  async registerWithGoogle(
    googleData: GoogleRegisterRequest
  ): Promise<RegisterResponse> {
    // Sử dụng Next.js API route thay vì backend
    const response = await fetch("/api/auth/google/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases for Google registration
      let errorMessage =
        result.message || `HTTP error! status: ${response.status}`;

      switch (response.status) {
        case 409:
          errorMessage = result.message || "Tài khoản đã tồn tại";
          break;
        case 400:
          errorMessage = result.message || "Thông tin Google không hợp lệ";
          break;
        case 422:
          errorMessage = result.message || "Dữ liệu Google không hợp lệ";
          break;
        default:
          errorMessage =
            result.message || `Lỗi đăng ký Google: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    return result.data;
  }

  async refreshPermissions(): Promise<UserInfo> {
    try {
      const response = await this.request<any>(
        "/users/me/refresh-permissions",
        {
          method: "GET",
        }
      );

      const userData = response.data.user;

      // Get role from the refreshed data
      let role = "attendee";
      if (userData.role) {
        role = userData.role;
      }

      // Generate permissions based on role if not provided
      let permissions = userData.permissions || [];
      if (role && permissions.length === 0) {
        if (role === "admin") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "conferences.view",
            "conferences.create",
            "conferences.update",
            "conferences.delete",
            "attendees.view",
            "attendees.read",
            "attendees.write",
            "attendees.manage",
            "checkin.manage",
            "roles.manage",
            "audit.view",
            "settings.manage",
            "analytics.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "rooms.manage",
            "rooms.create",
            "rooms.edit",
            "rooms.delete",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ];
        } else if (role === "staff") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "conferences.view",
            "conferences.create",
            "conferences.update",
            "attendees.view",
            "attendees.read",
            "attendees.write",
            "attendees.manage",
            "checkin.manage",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "badges.view",
            "mobile.view",
          ];
        } else if (role === "attendee") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ];
        }
      }

      return {
        id: userData.id || 0,
        email: userData.email || "unknown@example.com",
        name: userData.name || "User",
        role: role,
        avatar: userData.avatar || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: userData.updatedAt || new Date().toISOString(),
        permissions: permissions,
      };
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    try {
      // Try to get user info from profile endpoint first
      let userData,
        attendeeData,
        permissions = [];

      try {
        const profileResponse = await this.request<any>("/profile", {
          method: "GET",
        });
        userData = profileResponse.data.user;
        attendeeData = profileResponse.data.attendee;
      } catch (profileError) {
        console.warn("Profile endpoint failed, trying users/me:", profileError);
        // Fallback to users/me endpoint
        const meResponse = await this.request<any>("/users/me", {
          method: "GET",
        });
        userData = meResponse.data.user || meResponse.data;
        permissions =
          meResponse.data.user?.permissions ||
          meResponse.data.permissions ||
          [];
      }

      // If we still don't have user data, try a simple auth check
      if (!userData) {
        try {
          const authResponse = await this.request<any>("/auth/me", {
            method: "GET",
          });
          userData = authResponse.data;
        } catch (authError) {
          console.warn("Auth/me endpoint also failed:", authError);
          // Last resort: create minimal user info from token
          const token = this.getToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              userData = {
                ID: payload.userId || payload.sub || 0,
                EMAIL: payload.email || "unknown@example.com",
                NAME: payload.name || payload.email?.split("@")[0] || "User",
                AVATAR_URL: payload.avatar || null,
                CREATED_AT: new Date().toISOString(),
                LAST_LOGIN: new Date().toISOString(),
              };
            } catch (tokenError) {
              console.error("Failed to parse token:", tokenError);
              throw new Error("Invalid authentication token");
            }
          } else {
            throw new Error("No authentication token found");
          }
        }
      }

      // Get role from permissions or user data
      let role = "attendee";

      // Priority 1: Check ROLE_CODE from user data (most reliable - from backend)
      if (userData.ROLE_CODE) {
        role = userData.ROLE_CODE;
      }
      // Priority 2: Check role field from users/me endpoint
      else if (userData.role) {
        role = userData.role;
      }
      // Priority 3: Check permissions for admin role
      else if (permissions.includes("roles.admin")) {
        role = "admin";
      }
      // Priority 4: Check permissions for staff role
      else if (
        permissions.includes("conferences.create") ||
        permissions.includes("conferences.update")
      ) {
        role = "staff";
      }
      // Priority 5: Check email pattern for admin (fallback)
      else if (
        userData.EMAIL &&
        userData.EMAIL.toLowerCase().includes("admin")
      ) {
        role = "admin";
      }

      // If we have a role but no permissions, generate permissions based on role
      if (role && permissions.length === 0) {
        if (role === "admin") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "conferences.view",
            "conferences.create",
            "conferences.update",
            "conferences.delete",
            "attendees.view",
            "attendees.read",
            "attendees.write",
            "attendees.manage",
            "checkin.manage",
            "roles.manage",
            "audit.view",
            "settings.manage",
            "analytics.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "rooms.manage",
            "rooms.create",
            "rooms.edit",
            "rooms.delete",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ];
        } else if (role === "staff") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "conferences.view",
            "conferences.create",
            "conferences.update",
            "attendees.view",
            "attendees.read",
            "attendees.write",
            "attendees.manage",
            "checkin.manage",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "badges.view",
            "mobile.view",
          ];
        } else if (role === "attendee") {
          permissions = [
            "dashboard.view",
            "profile.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "rooms.view",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ];
        }
      }

      return {
        id: userData.ID || userData.id || 0,
        email: userData.EMAIL || userData.email || "unknown@example.com",
        name: userData.NAME || userData.name || "User",
        role: role,
        avatar:
          userData.AVATAR_URL ||
          userData.avatar_url ||
          attendeeData?.AVATAR_URL ||
          null,
        createdAt:
          userData.CREATED_AT ||
          userData.created_at ||
          new Date().toISOString(),
        updatedAt:
          userData.LAST_LOGIN ||
          userData.last_login ||
          userData.CREATED_AT ||
          new Date().toISOString(),
        permissions: permissions, // Include permissions in the response
      };
    } catch (error) {
      console.error("Failed to get current user info:", error);
      // If we can't get user info, throw the error so the auth service can handle it
      throw error;
    }
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<UserInfo> {
    try {
      // Update profile - backend will handle role-based table updates
      let userResponse;
      try {
        userResponse = await this.request<any>("/profile", {
          method: "PATCH",
          body: JSON.stringify(profileData),
        });
      } catch (patchError) {
        const errorMessage =
          patchError instanceof Error ? patchError.message : String(patchError);
        if (errorMessage.includes("CORS") || errorMessage.includes("PATCH")) {
          // Fallback to POST method
          userResponse = await this.request<any>("/profile", {
            method: "POST",
            body: JSON.stringify({ ...profileData, _method: "PATCH" }), // Some backends use _method override
          });
        } else {
          throw patchError;
        }
      }

      // Return updated user info
      const updatedUser = await this.getCurrentUser();
      return updatedUser;
    } catch (error) {
      console.error("Failed to update profile:", error);
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
  // Debug method to check permissions
  async debugPermissions(): Promise<any> {
    try {
      const endpoints = [
        "/users/me",
        "/profile",
        "/users/me/refresh-permissions",
      ];
      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = await this.request<any>(endpoint, { method: "GET" });
          results.push({ endpoint, success: true, data: response.data });
        } catch (error: any) {
          results.push({
            endpoint,
            success: false,
            error: error.message || "Unknown error",
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Debug permissions failed:", error);
      throw error;
    }
  }

  async getAttendees(params?: {
    page?: number;
    limit?: number;
    filters?: Record<string, unknown>;
    search?: string;
  }): Promise<{ data: AttendeeInfo[]; meta: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) queryParams.append(`filters[${key}]`, value.toString());
      });
    }

    const endpoint = `/attendees${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Add special header for admin users to bypass permission check
    const headers: Record<string, string> = {};
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          headers["X-Admin-Override"] = "true";
        }
      }
    } catch (error) {
      console.warn("Could not parse user data for admin override:", error);
    }

    const response = await this.request<AttendeeInfo[]>(endpoint, {
      method: "GET",
      headers,
    });

    return {
      data: response.data,
      meta: response.meta || {},
    };
  }

  async getAttendeeById(id: number): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>(`/attendees/${id}`, {
      method: "GET",
    });

    return response.data;
  }

  async createAttendee(
    attendeeData: CreateAttendeeRequest
  ): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>("/attendees", {
      method: "POST",
      body: JSON.stringify(attendeeData),
    });

    return response.data;
  }

  async updateAttendee(
    id: number,
    attendeeData: Partial<CreateAttendeeRequest>
  ): Promise<AttendeeInfo> {
    const response = await this.request<AttendeeInfo>(`/attendees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(attendeeData),
    });

    return response.data;
  }

  async deleteAttendee(id: number): Promise<void> {
    await this.request(`/attendees/${id}`, {
      method: "DELETE",
    });
  }

  // Registrations endpoints
  async getRegistrations(params?: {
    page?: number;
    limit?: number;
    attendeeId?: number;
    conferenceId?: number;
    status?: string;
  }): Promise<{ data: RegistrationInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.attendeeId)
      queryParams.append("attendeeId", params.attendeeId.toString());
    if (params?.conferenceId)
      queryParams.append("conferenceId", params.conferenceId.toString());
    if (params?.status) queryParams.append("status", params.status);

    const endpoint = `/registrations${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.request<RegistrationInfo[]>(endpoint, {
      method: "GET",
    });

    return {
      data: response.data,
      meta: response.meta || {},
    };
  }

  async getRegistrationById(id: number): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>(
      `/registrations/${id}`,
      {
        method: "GET",
      }
    );

    return response.data;
  }

  async createRegistration(
    registrationData: CreateRegistrationRequest
  ): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>("/registrations", {
      method: "POST",
      body: JSON.stringify(registrationData),
    });

    return response.data;
  }

  async updateRegistration(
    id: number,
    status: string
  ): Promise<RegistrationInfo> {
    const response = await this.request<RegistrationInfo>(
      `/registrations/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    return response.data;
  }

  async deleteRegistration(id: number): Promise<void> {
    await this.request(`/registrations/${id}`, {
      method: "DELETE",
    });
  }

  async publicRegistration(
    registrationData: PublicRegistrationRequest
  ): Promise<any> {
    // Use Next.js API route instead of direct backend call
    const response = await fetch("/api/attendees/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = result.message || "Đăng ký thất bại";

      if (response.status === 409) {
        errorMessage =
          result.message ||
          "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.";
      } else if (response.status === 400) {
        errorMessage =
          result.message || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (response.status === 422) {
        errorMessage =
          result.message ||
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.";
      }

      throw new Error(errorMessage);
    }

    return result.data;
  }

  async uploadImage(
    imageData: string
  ): Promise<{ url: string; publicId: string }> {
    try {
      const response = await this.request<{ url: string; publicId: string }>(
        "/upload/image",
        {
          method: "POST",
          body: JSON.stringify({ imageData }),
        }
      );

      return response.data;
    } catch (error) {
      // Check if it's a CORS error or endpoint not found
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes("CORS") || errorMessage?.includes("cors")) {
        throw new Error(
          "CORS Error: Cannot upload to cloud storage. Please use image URL instead."
        );
      } else if (
        errorMessage?.includes("404") ||
        errorMessage?.includes("Not Found")
      ) {
        throw new Error(
          "Upload endpoint not found. Please use image URL instead."
        );
      } else {
        throw new Error(`Upload failed: ${errorMessage}`);
      }
    }
  }

  // Conferences endpoints
  async getConferences(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ data: ConferenceInfo[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const endpoint = `/conferences${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.request<any[]>(endpoint, {
      method: "GET",
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
      capacity: row.CAPACITY ?? row.capacity,
      category: row.CATEGORY ?? row.category,
      organizer: row.ORGANIZER ?? row.organizer,
    }));

    return {
      data: mapped,
      meta: response.meta || {},
    };
  }

  async getConferenceById(id: number): Promise<ConferenceInfo> {
    const response = await this.request<any>(`/conferences/${id}`, {
      method: "GET",
    });

    const row = response.data as Record<string, unknown>;
    return {
      id: Number(row.ID ?? row.id),
      name: String(row.NAME ?? row.name),
      description: String(row.DESCRIPTION ?? row.description),
      startDate: String(row.START_DATE ?? row.startDate),
      endDate: String(row.END_DATE ?? row.endDate),
      location: String(row.LOCATION ?? row.location),
      status: String(row.STATUS ?? row.status),
      createdAt: String(row.CREATED_AT ?? row.createdAt),
      capacity: row.CAPACITY ? Number(row.CAPACITY) : undefined,
      category: row.CATEGORY ? String(row.CATEGORY) : undefined,
      organizer: row.ORGANIZER ? String(row.ORGANIZER) : undefined,
    };
  }

  async createConference(data: {
    NAME: string;
    DESCRIPTION?: string;
    START_DATE?: string;
    END_DATE?: string;
    LOCATION?: string;
    CAPACITY?: number;
    CATEGORY?: string;
    ORGANIZER?: string;
    STATUS?: string;
  }): Promise<ConferenceInfo> {
    const response = await this.request<any>("/conferences", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const row = response.data as Record<string, unknown>;
    return {
      id: Number(row.ID ?? row.id),
      name: String(row.NAME ?? row.name),
      description: String(row.DESCRIPTION ?? row.description),
      startDate: String(row.START_DATE ?? row.startDate),
      endDate: String(row.END_DATE ?? row.endDate),
      location: String(row.LOCATION ?? row.location),
      status: String(row.STATUS ?? row.status),
      createdAt: String(row.CREATED_AT ?? row.createdAt),
      capacity: row.CAPACITY ? Number(row.CAPACITY) : undefined,
      category: row.CATEGORY ? String(row.CATEGORY) : undefined,
      organizer: row.ORGANIZER ? String(row.ORGANIZER) : undefined,
    };
  }

  async updateConference(
    id: number,
    data: {
      NAME?: string;
      DESCRIPTION?: string;
      START_DATE?: string;
      END_DATE?: string;
      LOCATION?: string;
      CAPACITY?: number;
      CATEGORY?: string;
      ORGANIZER?: string;
      STATUS?: string;
    }
  ): Promise<ConferenceInfo> {
    const response = await this.request<any>(`/conferences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    const row = response.data as Record<string, unknown>;
    return {
      id: Number(row.ID ?? row.id),
      name: String(row.NAME ?? row.name),
      description: String(row.DESCRIPTION ?? row.description),
      startDate: String(row.START_DATE ?? row.startDate),
      endDate: String(row.END_DATE ?? row.endDate),
      location: String(row.LOCATION ?? row.location),
      status: String(row.STATUS ?? row.status),
      createdAt: String(row.CREATED_AT ?? row.createdAt),
      capacity: row.CAPACITY ? Number(row.CAPACITY) : undefined,
      category: row.CATEGORY ? String(row.CATEGORY) : undefined,
      organizer: row.ORGANIZER ? String(row.ORGANIZER) : undefined,
    };
  }

  async deleteConference(id: number): Promise<void> {
    await this.request(`/conferences/${id}`, {
      method: "DELETE",
    });
  }

  async updateConferenceStatus(
    id: number,
    status: string
  ): Promise<ConferenceInfo> {
    const response = await this.request<any>(`/conferences/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    const row = response.data as Record<string, unknown>;
    return {
      id: Number(row.ID ?? row.id),
      name: String(row.NAME ?? row.name),
      description: String(row.DESCRIPTION ?? row.description),
      startDate: String(row.START_DATE ?? row.startDate),
      endDate: String(row.END_DATE ?? row.endDate),
      location: String(row.LOCATION ?? row.location),
      status: String(row.STATUS ?? row.status),
      createdAt: String(row.CREATED_AT ?? row.createdAt),
      capacity: row.CAPACITY ? Number(row.CAPACITY) : undefined,
      category: row.CATEGORY ? String(row.CATEGORY) : undefined,
      organizer: row.ORGANIZER ? String(row.ORGANIZER) : undefined,
    };
  }

  // Sessions endpoints (if available)
  async getSessions(
    conferenceId?: number
  ): Promise<{ data: SessionInfo[]; meta: Record<string, unknown> }> {
    const queryParams = new URLSearchParams();
    if (conferenceId)
      queryParams.append("conferenceId", conferenceId.toString());

    const endpoint = `/sessions${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.request<any[]>(endpoint, {
      method: "GET",
    });

    const mapped: SessionInfo[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      conferenceId: row.CONFERENCE_ID ?? row.conferenceId,
      name: row.TITLE ?? row.name, // Backend uses TITLE field
      description: row.DESCRIPTION ?? row.description,
      startTime: row.START_TIME ?? row.startTime,
      endTime: row.END_TIME ?? row.endTime,
      location: row.LOCATION ?? row.location,
      roomId: row.ROOM_ID ?? row.roomId,
      roomName: row.ROOM_NAME ?? row.roomName,
      speaker: row.SPEAKER ?? row.speaker,
      createdAt: row.CREATED_AT ?? row.createdAt,
    }));

    return {
      data: mapped,
      meta: response.meta || {},
    };
  }

  async createSession(
    conferenceId: number,
    sessionData: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      speaker: string;
      speakerEmail: string;
      room: string;
      roomId?: number;
      track: string;
      capacity: number;
      tags?: string[];
    }
  ): Promise<{ data: SessionInfo }> {
    // Convert frontend field names to backend expected format
    const backendSessionData = {
      TITLE: sessionData.title,
      DESCRIPTION: sessionData.description || null,
      START_TIME: sessionData.startTime,
      END_TIME: sessionData.endTime,
      SPEAKER: sessionData.speaker || null,
      ROOM_ID: sessionData.roomId || null,
      STATUS: "upcoming" as const,
    };

    const response = await this.request<SessionInfo>(
      `/conferences/${conferenceId}/sessions`,
      {
        method: "POST",
        body: JSON.stringify(backendSessionData),
      }
    );

    return { data: response.data as SessionInfo };
  }

  async updateSession(
    sessionId: number,
    sessionData: Partial<{
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      speaker: string;
      speakerEmail: string;
      room: string;
      roomId?: number;
      track: string;
      capacity: number;
      tags: string[];
    }>
  ): Promise<{ data: SessionInfo }> {
    // Convert frontend field names to backend expected format
    const backendSessionData: any = {};
    if (sessionData.title !== undefined)
      backendSessionData.TITLE = sessionData.title;
    if (sessionData.description !== undefined)
      backendSessionData.DESCRIPTION = sessionData.description;
    if (sessionData.startTime !== undefined)
      backendSessionData.START_TIME = sessionData.startTime;
    if (sessionData.endTime !== undefined)
      backendSessionData.END_TIME = sessionData.endTime;
    if (sessionData.speaker !== undefined)
      backendSessionData.SPEAKER = sessionData.speaker;
    if (sessionData.roomId !== undefined)
      backendSessionData.ROOM_ID = sessionData.roomId;

    const response = await this.request<SessionInfo>(`/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(backendSessionData),
    });

    return { data: response.data as SessionInfo };
  }

  async deleteSession(sessionId: number): Promise<void> {
    await this.request(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  // Roles Management endpoints
  async getRoles(): Promise<{ data: Role[] }> {
    const response = await this.request<Role[]>("/roles", {
      method: "GET",
    });

    const mapped: Role[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      code: row.CODE ?? row.code,
      name: row.NAME ?? row.name,
    }));

    return { data: mapped };
  }

  async createRole(
    roleData: CreateRoleRequest
  ): Promise<{ data: { id: number } }> {
    const response = await this.request<{ id: number }>("/roles", {
      method: "POST",
      body: JSON.stringify(roleData),
    });

    return { data: response.data };
  }

  async assignPermissionToRole(
    roleId: number,
    permissionData: AssignPermissionRequest
  ): Promise<void> {
    const response = await this.request(`/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify(permissionData),
    });
    // Backend returns 204 No Content, so no need to parse JSON
    return;
  }

  async removePermissionFromRole(
    roleId: number,
    permissionId: number
  ): Promise<void> {
    const response = await this.request(
      `/roles/${roleId}/permissions/${permissionId}`,
      {
        method: "DELETE",
      }
    );
    // Backend returns 204 No Content, so no need to parse JSON
    return;
  }

  // Permissions endpoints
  async getPermissions(): Promise<{ data: Permission[] }> {
    const response = await this.request<Permission[]>("/permissions", {
      method: "GET",
    });

    const mapped: Permission[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      name: row.NAME ?? row.name,
      description: row.DESCRIPTION ?? row.description,
      category: row.CATEGORY ?? row.category,
    }));

    return { data: mapped };
  }

  // Users endpoints
  async getUsers(
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: User[]; meta: any }> {
    const response = await this.request<{ data: any[]; meta: any }>(
      `/users?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    );

    const mapped: User[] = (
      Array.isArray(response.data) ? response.data : []
    ).map((row: any) => ({
      id: String(row.ID ?? row.id),
      name: row.NAME ?? row.name,
      email: row.EMAIL ?? row.email,
      role: (row.ROLE_CODE ?? row.role_code) || "attendee",
      status: (row.STATUS ?? row.status) || "active",
      lastLogin: row.LAST_LOGIN
        ? new Date(row.LAST_LOGIN).toLocaleString("vi-VN")
        : "Chưa đăng nhập",
      createdAt: row.CREATED_AT
        ? new Date(row.CREATED_AT).toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN"),
      avatar: row.AVATAR_URL ?? row.avatar_url,
    }));

    return { data: mapped, meta: response.meta };
  }

  // Get all users (APP_USERS + ATTENDEES)
  async getAllUsers(
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: any[]; meta: any }> {
    const response = await this.request<{ data: any[]; meta: any }>(
      `/users/all?page=${page}&limit=${limit}`,
      {
        method: "GET",
      }
    );

    const mapped = (Array.isArray(response.data) ? response.data : []).map(
      (row: any) => ({
        id: String(row.ID ?? row.id),
        name: row.NAME ?? row.name,
        email: row.EMAIL ?? row.email,
        role: (row.ROLE_CODE ?? row.role_code) || "attendee",
        status: (row.STATUS ?? row.status) || "active",
        lastLogin: row.LAST_LOGIN
          ? new Date(row.LAST_LOGIN).toLocaleString("vi-VN")
          : "Chưa đăng nhập",
        createdAt: row.CREATED_AT
          ? new Date(row.CREATED_AT).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN"),
        avatar: row.AVATAR_URL ?? row.avatar_url,
        userType: (row.USER_TYPE ?? row.userType) || "app_user",
      })
    );

    return { data: mapped, meta: response.meta };
  }

  // Get users who have sent messages
  async getUsersWithMessages(): Promise<{ data: any[] }> {
    // Try the new endpoint first (no auth required)
    try {
      const response = await fetch(
        `${this.baseURL.replace("/api/v1", "")}/messaging/users-with-messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const mapped = (Array.isArray(result.data) ? result.data : []).map(
          (row: any) => ({
            id: String(row.id),
            name: row.name,
            email: row.email,
            role: row.role || "attendee",
            status: row.status || "active",
            lastLogin: row.lastLogin
              ? new Date(row.lastLogin).toLocaleString("vi-VN")
              : "Chưa đăng nhập",
            createdAt: row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("vi-VN")
              : new Date().toLocaleDateString("vi-VN"),
            avatar: row.avatar,
            userType: row.userType || "app_user",
            messageCount: row.messageCount || 0,
            lastMessageTime: row.lastMessageTime
              ? new Date(row.lastMessageTime).toLocaleString("vi-VN")
              : "Chưa có tin nhắn",
          })
        );
        return { data: mapped };
      }
    } catch (error) {
      console.warn(
        "New messaging endpoint failed, falling back to old endpoint:",
        error
      );
    }

    // Fallback to old endpoint with auth
    const response = await this.request<{ data: any[] }>(
      "/users/with-messages",
      {
        method: "GET",
      }
    );

    const mapped = (Array.isArray(response.data) ? response.data : []).map(
      (row: any) => ({
        id: String(row.id),
        name: row.name,
        email: row.email,
        role: row.role || "attendee",
        status: row.status || "active",
        lastLogin: row.lastLogin
          ? new Date(row.lastLogin).toLocaleString("vi-VN")
          : "Chưa đăng nhập",
        createdAt: row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("vi-VN")
          : new Date().toLocaleDateString("vi-VN"),
        avatar: row.avatar,
        userType: row.userType || "app_user",
        messageCount: row.messageCount || 0,
        lastMessageTime: row.lastMessageTime
          ? new Date(row.lastMessageTime).toLocaleString("vi-VN")
          : "Chưa có tin nhắn",
      })
    );

    return { data: mapped };
  }

  // Add user to messaging system
  async addUserToMessaging(
    userId: number
  ): Promise<{ success: boolean; data?: any }> {
    try {
      // Try the new endpoint first (no auth required)
      const response = await fetch(
        `${this.baseURL.replace("/api/v1", "")}/messaging/add-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.warn(
        "Add user to messaging endpoint failed, using fallback:",
        error
      );
    }

    // Fallback: Just return success for now since we'll handle it in frontend
    return { success: true, data: { userId } };
  }

  // Get available users for adding to chat
  async getAvailableUsers(): Promise<{ data: any[] }> {
    // Use direct fetch to bypass /api/v1 prefix
    try {
      const response = await fetch(
        `${this.baseURL.replace("/api/v1", "")}/messaging/available-users`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map the data to the expected format
      const mapped = (Array.isArray(data.data) ? data.data : []).map(
        (row: any) => ({
          id: Number(row.id),
          name: row.name,
          email: row.email,
          role: row.role || "attendee",
          status: row.status || "active",
          lastLogin: row.lastLogin
            ? new Date(row.lastLogin).toLocaleString("vi-VN")
            : "Chưa đăng nhập",
          createdAt: row.createdAt
            ? new Date(row.createdAt).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
          avatar: row.avatar,
          company: row.company,
          position: row.position,
          userType: row.userType || "app_user",
        })
      );

      return { data: mapped };
    } catch (error) {
      console.error("Error fetching available users:", error);
      throw error;
    }
  }

  // Get users by conference category
  async getUsersByConferenceCategory(
    conferenceId?: number
  ): Promise<{ data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (conferenceId) {
        queryParams.append("conferenceId", conferenceId.toString());
      }

      // Use direct fetch to bypass /api/v1 prefix and auth for now
      const url = `${this.baseURL.replace(
        "/api/v1",
        ""
      )}/messaging/users-by-category${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map the data to the expected format
      const mapped = (Array.isArray(data.data) ? data.data : []).map(
        (row: any) => ({
          id: Number(row.ID || row.id),
          name: row.NAME || row.name,
          email: row.EMAIL || row.email,
          role: row.role || "attendee",
          status: row.STATUS || row.status || "active",
          lastLogin:
            row.LAST_LOGIN || row.lastLogin
              ? new Date(row.LAST_LOGIN || row.lastLogin).toLocaleString(
                  "vi-VN"
                )
              : "Chưa đăng nhập",
          createdAt:
            row.CREATED_AT || row.createdAt
              ? new Date(row.CREATED_AT || row.createdAt).toLocaleDateString(
                  "vi-VN"
                )
              : new Date().toLocaleDateString("vi-VN"),
          avatar: row.AVATAR_URL || row.avatar_url || row.avatar,
          company: row.COMPANY || row.company,
          position: row.POSITION || row.position,
          userType: row.USER_TYPE || row.userType || "app_user",
          category: row.CATEGORY || row.category || "system",
          conferenceName: row.CONFERENCE_NAME || row.conferenceName,
        })
      );

      return { data: mapped };
    } catch (error) {
      console.error("Error fetching users by conference category:", error);
      throw error;
    }
  }

  // Get conference users with conference details
  async getConferenceUsersWithDetails(
    conferenceId?: number
  ): Promise<{ data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (conferenceId) {
        queryParams.append("conferenceId", conferenceId.toString());
      }

      // Use direct fetch to bypass /api/v1 prefix and auth for now
      const url = `${this.baseURL.replace(
        "/api/v1",
        ""
      )}/messaging/conference-users-with-details${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Map the data to the expected format
      const mapped = (Array.isArray(data.data) ? data.data : []).map(
        (row: any) => ({
          id: Number(row.ID || row.id),
          name: row.NAME || row.name,
          email: row.EMAIL || row.email,
          role: row.role || "attendee",
          status: row.STATUS || row.status || "active",
          lastLogin:
            row.LAST_LOGIN || row.lastLogin
              ? new Date(row.LAST_LOGIN || row.lastLogin).toLocaleString(
                  "vi-VN"
                )
              : "Chưa đăng nhập",
          createdAt:
            row.CREATED_AT || row.createdAt
              ? new Date(row.CREATED_AT || row.createdAt).toLocaleDateString(
                  "vi-VN"
                )
              : new Date().toLocaleDateString("vi-VN"),
          avatar: row.AVATAR_URL || row.avatar_url || row.avatar,
          company: row.COMPANY || row.company,
          position: row.POSITION || row.position,
          userType: row.USER_TYPE || row.userType || "app_user",
          category: "conference", // Always conference for this endpoint
          conferenceId: row.CONFERENCE_ID || row.conferenceId,
          conferenceName: row.CONFERENCE_NAME || row.conferenceName,
          conferenceStartDate:
            row.CONFERENCE_START_DATE || row.conferenceStartDate,
          conferenceEndDate: row.CONFERENCE_END_DATE || row.conferenceEndDate,
          conferenceAssignedAt:
            row.CONFERENCE_ASSIGNED_AT || row.conferenceAssignedAt,
        })
      );

      return { data: mapped };
    } catch (error) {
      console.error("Error fetching conference users with details:", error);
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<{ data: User }> {
    const response = await this.request<any>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    const mapped: User = {
      id: String(response.data.ID ?? response.data.id),
      name: response.data.NAME ?? response.data.name,
      email: response.data.EMAIL ?? response.data.email,
      role: (response.data.ROLE_CODE ?? response.data.role_code) || "attendee",
      status: (response.data.STATUS ?? response.data.status) || "active",
      lastLogin: response.data.LAST_LOGIN
        ? new Date(response.data.LAST_LOGIN).toLocaleString("vi-VN")
        : "Chưa đăng nhập",
      createdAt: response.data.CREATED_AT
        ? new Date(response.data.CREATED_AT).toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN"),
      avatar: response.data.AVATAR_URL ?? response.data.avatar_url,
    };

    return { data: mapped };
  }

  async updateUser(
    userId: number,
    userData: UpdateUserRequest
  ): Promise<{ data: User }> {
    const response = await this.request<any>(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });

    const mapped: User = {
      id: String(response.data.ID ?? response.data.id),
      name: response.data.NAME ?? response.data.name,
      email: response.data.EMAIL ?? response.data.email,
      role: (response.data.ROLE_CODE ?? response.data.role_code) || "attendee",
      status: (response.data.STATUS ?? response.data.status) || "active",
      lastLogin: response.data.LAST_LOGIN
        ? new Date(response.data.LAST_LOGIN).toLocaleString("vi-VN")
        : "Chưa đăng nhập",
      createdAt: response.data.CREATED_AT
        ? new Date(response.data.CREATED_AT).toLocaleDateString("vi-VN")
        : new Date().toLocaleDateString("vi-VN"),
      avatar: response.data.AVATAR_URL ?? response.data.avatar_url,
    };

    return { data: mapped };
  }

  async deleteUser(userId: number): Promise<void> {
    await this.request(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await this.request(`/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roleId }),
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.request(`/users/${userId}/roles/${roleId}`, {
      method: "DELETE",
    });
  }

  async getUserRoles(userId: number): Promise<{ data: Role[] }> {
    const response = await this.request<Role[]>(`/users/${userId}/roles`, {
      method: "GET",
    });

    const mapped: Role[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      code: row.CODE ?? row.code,
      name: row.NAME ?? row.name,
    }));

    return { data: mapped };
  }

  // Role permissions endpoints
  async getRolePermissions(roleId: number): Promise<{ data: Permission[] }> {
    const response = await this.request<Permission[]>(
      `/roles/${roleId}/permissions`,
      {
        method: "GET",
      }
    );

    const mapped: Permission[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      name: row.NAME ?? row.name,
      description: row.DESCRIPTION ?? row.description,
      category: row.CATEGORY ?? row.category,
    }));

    return { data: mapped };
  }

  async updateRole(
    roleId: number,
    roleData: UpdateRoleRequest
  ): Promise<{ data: Role }> {
    const response = await this.request<any>(`/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(roleData),
    });

    const mapped: Role = {
      id: response.data.ID ?? response.data.id,
      code: response.data.CODE ?? response.data.code,
      name: response.data.NAME ?? response.data.name,
    };

    return { data: mapped };
  }

  async deleteRole(roleId: number): Promise<void> {
    await this.request(`/roles/${roleId}`, {
      method: "DELETE",
    });
  }

  // User Conference Assignments endpoints
  async getUserConferenceAssignments(params?: {
    page?: number;
    limit?: number;
    userId?: number;
    conferenceId?: number;
    isActive?: number;
  }): Promise<{ data: UserConferenceAssignment[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.userId) queryParams.append("userId", params.userId.toString());
    if (params?.conferenceId)
      queryParams.append("conferenceId", params.conferenceId.toString());
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const endpoint = `/user-conference-assignments${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.request<any>(endpoint, {
      method: "GET",
    });

    console.log("getUserConferenceAssignments response:", response);

    return {
      data: response.data || [],
      meta: response.meta || {},
    };
  }

  async getUserAssignments(
    userId: number
  ): Promise<{ data: UserConferenceAssignment[] }> {
    const response = await this.request<UserConferenceAssignment[]>(
      `/user-conference-assignments/user/${userId}`,
      {
        method: "GET",
      }
    );

    return { data: response.data || [] };
  }

  async getMyAssignments(): Promise<{ data: UserConferenceAssignment[] }> {
    const response = await this.request<UserConferenceAssignment[]>(
      `/user-conference-assignments/my-assignments`,
      {
        method: "GET",
      }
    );

    console.log("getMyAssignments response:", response);

    return { data: response.data || [] };
  }

  async getConferenceAssignments(
    conferenceId: number
  ): Promise<{ data: UserConferenceAssignment[] }> {
    const response = await this.request<UserConferenceAssignment[]>(
      `/user-conference-assignments/conference/${conferenceId}`,
      {
        method: "GET",
      }
    );

    return { data: response.data };
  }

  async createUserConferenceAssignment(
    data: CreateUserConferenceAssignmentRequest
  ): Promise<{ data: { id: number } }> {
    const response = await this.request<{ id: number }>(
      "/user-conference-assignments",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return { data: response.data };
  }

  async bulkAssignConferences(
    data: BulkAssignConferencesRequest
  ): Promise<{ data: { successful: any[]; errors: string[] } }> {
    const response = await this.request<{
      successful: any[];
      errors: string[];
    }>("/user-conference-assignments/bulk-assign", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return { data: response.data };
  }

  async updateUserConferenceAssignment(
    id: number,
    data: UpdateUserConferenceAssignmentRequest
  ): Promise<void> {
    await this.request(`/user-conference-assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deactivateUserConferenceAssignment(id: number): Promise<void> {
    await this.request(`/user-conference-assignments/${id}/deactivate`, {
      method: "PATCH",
    });
  }

  async deleteUserConferenceAssignment(id: number): Promise<void> {
    await this.request(`/user-conference-assignments/${id}`, {
      method: "DELETE",
    });
  }

  async checkUserConferencePermission(
    userId: number,
    conferenceId: number,
    permission: string
  ): Promise<{ data: { hasPermission: boolean } }> {
    const response = await this.request<{ hasPermission: boolean }>(
      `/user-conference-assignments/check/${userId}/${conferenceId}/${permission}`,
      {
        method: "GET",
      }
    );

    return { data: response.data };
  }

  async getUserConferencePermissions(
    userId: number
  ): Promise<{ data: Record<number, Record<string, boolean>> }> {
    const response = await this.request<
      Record<number, Record<string, boolean>>
    >(`/user-conference-assignments/permissions/${userId}`, {
      method: "GET",
    });

    return { data: response.data };
  }

  // Audit Logs endpoints
  async getAuditLogs(
    filters?: AuditLogFilters
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append("page", filters.page.toString());
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.userId) {
      if (Array.isArray(filters.userId)) {
        // For multiple user IDs, we'll handle this in the hook
        queryParams.append("userId", filters.userId[0].toString());
      } else {
        queryParams.append("userId", filters.userId.toString());
      }
    }
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.q) queryParams.append("q", filters.q);
    if (filters?.from) queryParams.append("from", filters.from);
    if (filters?.to) queryParams.append("to", filters.to);

    const endpoint = `/audit/logs${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    console.log("Audit logs API call:", { filters, endpoint });

    const response = await this.request<AuditLog[]>(endpoint, {
      method: "GET",
    });

    // Map backend fields to frontend fields
    const mapped: AuditLog[] = (response.data || []).map((row: any) => ({
      id: row.ID ?? row.id,
      timestamp: row.TS ?? row.timestamp ?? row.ts,
      userId: row.USER_ID ?? row.userId,
      actionName: row.ACTION_NAME ?? row.actionName ?? row.action_name,
      resourceName: row.RESOURCE_NAME ?? row.resourceName ?? row.resource_name,
      details: row.DETAILS ?? row.details,
      ipAddress: row.IP_ADDRESS ?? row.ipAddress ?? row.ip_address,
      userAgent: row.USER_AGENT ?? row.userAgent ?? row.user_agent,
      status: (row.STATUS ?? row.status) as "success" | "failed" | "warning",
      category: (row.CATEGORY ?? row.category) as
        | "auth"
        | "user"
        | "conference"
        | "system"
        | "data",
    }));

    return {
      data: mapped,
      meta: response.meta || {},
    };
  }

  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await this.request<any>(`/audit/${id}`, {
      method: "GET",
    });

    const row = response.data;
    return {
      id: row.ID ?? row.id,
      timestamp: row.TS ?? row.timestamp ?? row.ts,
      userId: row.USER_ID ?? row.userId,
      actionName: row.ACTION_NAME ?? row.actionName ?? row.action_name,
      resourceName: row.RESOURCE_NAME ?? row.resourceName ?? row.resource_name,
      details: row.DETAILS ?? row.details,
      ipAddress: row.IP_ADDRESS ?? row.ipAddress ?? row.ip_address,
      userAgent: row.USER_AGENT ?? row.userAgent ?? row.user_agent,
      status: (row.STATUS ?? row.status) as "success" | "failed" | "warning",
      category: (row.CATEGORY ?? row.category) as
        | "auth"
        | "user"
        | "conference"
        | "system"
        | "data",
    };
  }

  // Get user info by ID
  async getUserById(id: number): Promise<{
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null> {
    try {
      const response = await this.request<any>(`/users/${id}`, {
        method: "GET",
      });

      const user = response.data;
      console.log(`User ${id} data from API:`, user);

      const role = user.ROLE_CODE ?? user.role_code ?? user.role ?? "attendee";
      console.log(`Role for user ${id}:`, role);

      return {
        id: user.ID ?? user.id,
        name: user.NAME ?? user.name,
        email: user.EMAIL ?? user.email,
        role: role,
        avatar: user.AVATAR_URL ?? user.avatar_url ?? user.avatar,
      };
    } catch (error) {
      console.warn(`Could not fetch user ${id}:`, error);
      return null;
    }
  }

  // Get multiple users by IDs
  async getUsersByIds(
    ids: number[]
  ): Promise<
    Record<
      number,
      { id: number; name: string; email: string; role: string; avatar?: string }
    >
  > {
    const users: Record<
      number,
      { id: number; name: string; email: string; role: string; avatar?: string }
    > = {};

    // Fetch users in parallel
    const promises = ids.map(async (id) => {
      try {
        const user = await this.getUserById(id);
        if (user) {
          users[id] = user;
        }
      } catch (error) {
        console.warn(`Could not fetch user ${id}:`, error);
      }
    });

    await Promise.all(promises);
    return users;
  }

  // Frontend Audit Logs
  async logFrontendAction(
    action: string,
    page?: string,
    details?: string
  ): Promise<void> {
    try {
      const logData = {
        action,
        page: page || this.getCurrentPage(),
        details,
        timestamp: new Date().toISOString(),
      };

      await this.request("/audit/frontend", {
        method: "POST",
        body: JSON.stringify(logData),
      });
    } catch (error) {
      console.warn("Failed to log frontend action:", error);
    }
  }

  // Get current page name
  private getCurrentPage(): string {
    if (typeof window === "undefined") return "Unknown";

    const path = window.location.pathname;

    // Map common routes to page names
    const pageMap: Record<string, string> = {
      "/": "Trang chủ",
      "/dashboard": "Bảng điều khiển",
      "/attendees": "Quản lý người tham dự",
      "/conferences": "Quản lý hội nghị",
      "/sessions": "Quản lý phiên họp",
      "/registrations": "Quản lý đăng ký",
      "/checkin": "Check-in",
      "/analytics": "Phân tích",
      "/audit": "Nhật ký hệ thống",
      "/profile": "Hồ sơ cá nhân",
      "/settings": "Cài đặt",
      "/users": "Quản lý người dùng",
      "/roles": "Quản lý vai trò",
      "/permissions": "Quản lý quyền",
      "/notifications": "Thông báo",
      "/messages": "Tin nhắn",
      "/matches": "Kết nối",
      "/badges": "Huy hiệu",
      "/certificates": "Chứng chỉ",
      "/venue": "Địa điểm",
    };

    // Find matching page
    for (const [route, pageName] of Object.entries(pageMap)) {
      if (path.startsWith(route)) {
        return pageName;
      }
    }

    // Fallback to path
    return path;
  }

  // Conference Registration API methods
  async registerForConference(
    conferenceId: number
  ): Promise<{ data: { id: number } }> {
    const response = await this.request<{ id: number }>(
      `/conference-registrations/${conferenceId}/register`,
      {
        method: "POST",
      }
    );
    return { data: response.data };
  }

  async unregisterFromConference(conferenceId: number): Promise<void> {
    await this.request(`/conference-registrations/${conferenceId}/unregister`, {
      method: "DELETE",
    });
  }

  async checkRegistrationStatus(
    conferenceId: number
  ): Promise<{ data: { isRegistered: boolean; assignment?: any } }> {
    const response = await this.request<{
      isRegistered: boolean;
      assignment?: any;
    }>(`/conference-registrations/${conferenceId}/status`, {
      method: "GET",
    });
    return { data: response.data };
  }

  async getMyRegistrations(): Promise<{ data: any[] }> {
    const response = await this.request<any[]>(
      "/conference-registrations/my-registrations",
      {
        method: "GET",
      }
    );
    return { data: response.data };
  }

  // Messaging API methods
  async getOrCreateConversationSession(
    conferenceId: number,
    user1Id: number,
    user2Id: number
  ) {
    const response = await this.request("/messaging/sessions", {
      method: "POST",
      body: JSON.stringify({ conferenceId, user1Id, user2Id }),
    });
    return (response.data as any).sessionId;
  }

  async getConversationMessages(
    sessionId: number,
    limit: number = 50,
    offset: number = 0
  ) {
    const response = await this.request(
      `/messaging/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
      }
    );
    return response.data;
  }

  async sendConversationMessage(
    sessionId: number,
    content: string,
    messageType: string = "text",
    attendeeId?: number
  ) {
    const response = await this.request("/messaging/messages", {
      method: "POST",
      body: JSON.stringify({ sessionId, content, messageType, attendeeId }),
    });
    return response.data;
  }

  async markMessageAsRead(messageId: number) {
    const response = await this.request(
      `/messaging/messages/${messageId}/read`,
      {
        method: "PUT",
      }
    );
    return response.success;
  }

  async getUserConversations(userId: number, conferenceId?: number) {
    const url = conferenceId
      ? `/messaging/users-with-messages?conferenceId=${conferenceId}`
      : `/messaging/users-with-messages`;

    const response = await this.request(url, {
      method: "GET",
    });
    return response.data;
  }

  // Rooms Management API
  async getRooms(conferenceId?: number) {
    // For now, always get all rooms since there's no conference-specific endpoint
    const url = `/venue/rooms`;

    console.log("API getRooms called with URL:", url);
    const response = await this.request(url, {
      method: "GET",
    });
    console.log("API getRooms response:", response);

    // Filter rooms by conference if conferenceId is provided
    if (conferenceId && response.data && Array.isArray(response.data)) {
      const filteredRooms = response.data.filter(
        (room: any) =>
          room.CONFERENCE_ID === conferenceId ||
          room.conferenceId === conferenceId
      );
      console.log(
        `Filtered ${filteredRooms.length} rooms for conference ${conferenceId}`
      );
      return { data: filteredRooms };
    }

    return response.data;
  }

  async getRoom(roomId: number) {
    const response = await this.request(`/venue/rooms/${roomId}`, {
      method: "GET",
    });
    return response.data;
  }

  async createRoom(
    floorId: number,
    roomData: {
      name: string;
      capacity: number;
      description?: string;
      roomType?: string;
      features?: string[];
      status?: string;
    }
  ) {
    const response = await this.request(`/venue/floors/${floorId}/rooms`, {
      method: "POST",
      body: JSON.stringify(roomData),
    });
    return response.data;
  }

  async updateRoom(
    roomId: number,
    roomData: {
      name: string;
      capacity: number;
      description?: string;
      roomType?: string;
      features?: string[];
      status?: string;
    }
  ) {
    const response = await this.request(`/venue/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
    return response.data;
  }

  async deleteRoom(roomId: number) {
    const response = await this.request(`/venue/rooms/${roomId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Floors Management API
  async getFloors(conferenceId?: number) {
    const url = conferenceId
      ? `/venue/conferences/${conferenceId}/floors`
      : `/venue/floors`;

    const response = await this.request(url, {
      method: "GET",
    });
    return response.data;
  }

  async getFloor(floorId: number) {
    const response = await this.request(`/venue/floors/${floorId}`, {
      method: "GET",
    });
    return response.data;
  }

  async createFloor(conferenceId: number, floorData: { name: string }) {
    const response = await this.request(
      `/venue/conferences/${conferenceId}/floors`,
      {
        method: "POST",
        body: JSON.stringify(floorData),
      }
    );
    return response.data;
  }

  async updateFloor(floorId: number, floorData: { name: string }) {
    const response = await this.request(`/venue/floors/${floorId}`, {
      method: "PUT",
      body: JSON.stringify(floorData),
    });
    return response.data;
  }

  async deleteFloor(floorId: number) {
    const response = await this.request(`/venue/floors/${floorId}`, {
      method: "DELETE",
    });
    return response.success;
  }

  // Dashboard Analytics API methods
  async getDashboardOverview(): Promise<{
    totalConferences: number;
    totalAttendees: number;
    totalCheckIns: number;
    attendanceRate: number;
    recentActivity: any[];
    upcomingEvents: any[];
  }> {
    const response = await this.request<any>("/analytics/overview", {
      method: "GET",
    });
    const data = response.data || {};
    return {
      totalConferences: data.totalConferences || 0,
      totalAttendees: data.totalAttendees || 0,
      totalCheckIns: data.totalCheckIns || 0,
      attendanceRate: data.attendanceRate || 0,
      recentActivity: data.recentActivity || [],
      upcomingEvents: data.upcomingEvents || [],
    };
  }

  async getConferenceStats(conferenceId?: number): Promise<{
    totalRegistrations: number;
    totalCheckIns: number;
    attendanceRate: number;
    dailyCheckIns: any[];
  }> {
    const url = conferenceId
      ? `/analytics/conferences/${conferenceId}/attendance`
      : "/analytics/overview";

    const response = await this.request<any>(url, {
      method: "GET",
    });
    return (
      response.data || {
        totalRegistrations: 0,
        totalCheckIns: 0,
        attendanceRate: 0,
        dailyCheckIns: [],
      }
    );
  }

  async getRealtimeData(): Promise<{
    checkInsToday: number;
    checkInsLast24h: any[];
    activeUsers: number;
    systemAlerts: any[];
  }> {
    const response = await this.request<any>("/analytics/overview", {
      method: "GET",
    });
    const data = response.data || {};
    return {
      checkInsToday: data.checkInsToday || 0,
      checkInsLast24h: data.checkInsLast24h || [],
      activeUsers: data.activeUsers || 0,
      systemAlerts: data.systemAlerts || [],
    };
  }

  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const response = await this.request<any>(`/analytics/overview`, {
      method: "GET",
    });
    return response.data?.recentActivity || [];
  }

  async getUpcomingEvents(): Promise<any[]> {
    const response = await this.request<any>("/attendee/events/upcoming", {
      method: "GET",
    });
    return response.data?.data || [];
  }

  async getNotifications(): Promise<any[]> {
    const response = await this.request<any>("/attendee/notifications", {
      method: "GET",
    });
    return response.data?.data || [];
  }

  async getCertificates(): Promise<any[]> {
    const response = await this.request<any>("/attendee/certificates", {
      method: "GET",
    });
    return response.data?.data || [];
  }

  async getRegistrationTrends(days: number = 30): Promise<any[]> {
    const response = await this.request<any>("/analytics/overview", {
      method: "GET",
    });
    return response.data?.registrationTrends || [];
  }

  async getAttendanceByEvent(): Promise<
    {
      eventName: string;
      attendanceRate: number;
      totalRegistrations: number;
    }[]
  > {
    const response = await this.request<any>("/analytics/overview", {
      method: "GET",
    });
    return response.data?.attendanceByEvent || [];
  }

  async getSystemAlerts(): Promise<
    {
      type: "warning" | "info" | "error";
      message: string;
      timestamp: string;
    }[]
  > {
    const response = await this.request<any>("/analytics/overview", {
      method: "GET",
    });
    return response.data?.systemAlerts || [];
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
