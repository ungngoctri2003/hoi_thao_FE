// Authentication utilities and context
import { apiClient, UserInfo } from "./api";
import { toast } from "@/hooks/use-toast";
import { websocketService } from "./websocket"; // WebSocket service for real-time notifications
import { notificationService } from "./notification-service";

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };

  private constructor() {
    this.initializeAuth();
    this.setupSessionExpirationHandler();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      const token = apiClient.getCurrentToken();
      if (token) {
        // Verify token and get user info from API
        try {
          const userInfo = await apiClient.getCurrentUser();
          this.state.user = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            role: userInfo.role,
            avatar: userInfo.avatar,
            permissions: userInfo.permissions,
          };
          this.state.isAuthenticated = true;
          console.log(
            "Auth initialized with valid token, user:",
            this.state.user
          );

          // Connect WebSocket for real-time notifications
          websocketService.connect().catch(console.error);

          // Add welcome notification
          notificationService.success(
            "Đăng nhập thành công!",
            `Chào mừng ${this.state.user.name} đến với hệ thống quản lý hội thảo.`
          );
        } catch (error) {
          console.error(
            "Failed to get user info during initialization:",
            error
          );
          // Token might be invalid, clear it
          apiClient.logout();
          this.state.user = null;
          this.state.isAuthenticated = false;

          // Check if this is a session expiration error or account disabled
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("Phiên đăng nhập đã hết hạn") ||
            errorMessage.includes("401")
          ) {
            // Don't show toast here as it will be handled by the session expiration handler
            console.log("Session expired during initialization");
          } else if (
            errorMessage.includes("Tài khoản đã bị khóa") ||
            errorMessage.includes("Account is disabled")
          ) {
            // Don't show toast here as it will be handled by the account disabled handler
            console.log("Account disabled during initialization");
          }
        }
      } else {
        this.state.user = null;
        this.state.isAuthenticated = false;
        console.log("Auth initialized without token");
      }
      this.state.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error("Auth initialization failed:", error);
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      console.log("Starting login process for:", email);
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.login({ email, password });
      console.log("Login API response received");

      // Get user info from API after successful login
      try {
        const userInfo = await apiClient.getCurrentUser();
        console.log("User info retrieved:", userInfo);
        this.state.user = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          avatar: userInfo.avatar,
          permissions: userInfo.permissions,
        };
        this.state.isAuthenticated = true;
      } catch (userInfoError) {
        console.error("Failed to get user info after login:", userInfoError);
        // If we can't get user info, still mark as authenticated but with basic info
        this.state.user = {
          id: 0,
          email: email,
          name: email.split("@")[0], // Use email prefix as name fallback
          role: "attendee",
          permissions: [
            "dashboard.view",
            "profile.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ],
        };
        this.state.isAuthenticated = true;
        console.log("Using fallback user info:", this.state.user);
      }

      this.state.isLoading = false;
      this.notifyListeners();
      console.log(
        "Login process completed, user authenticated:",
        this.state.isAuthenticated
      );

      // Connect WebSocket for real-time notifications
      websocketService.connect().catch(console.error);
    } catch (error: any) {
      console.error("Login failed:", error);
      this.state.isLoading = false;
      this.notifyListeners();

      // Handle specific error cases
      const errorMessage = error.message || "Đăng nhập thất bại";
      if (
        errorMessage.includes("Tài khoản đã bị khóa") ||
        errorMessage.includes("Account is disabled")
      ) {
        toast({
          title: "Tài khoản đã bị khóa",
          description:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          variant: "destructive",
          duration: 8000,
        });
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("Invalid credentials")
      ) {
        toast({
          title: "Đăng nhập thất bại",
          description:
            "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("404") ||
        errorMessage.includes("User not found")
      ) {
        toast({
          title: "Tài khoản chưa được đăng ký",
          description:
            "Email này chưa được đăng ký. Vui lòng đăng ký tài khoản trước.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("400") ||
        errorMessage.includes("Bad Request")
      ) {
        toast({
          title: "Thông tin không hợp lệ",
          description: "Vui lòng kiểm tra lại thông tin đăng nhập.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }

      throw error;
    }
  }

  public async register(
    email: string,
    name: string,
    password: string
  ): Promise<void> {
    try {
      console.log("Starting registration process for:", email, name);
      this.state.isLoading = true;
      this.notifyListeners();

      // Clear any existing authentication state before registration
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.notifyListeners();

      const response = await apiClient.register({ email, name, password });
      console.log("Registration API response received:", response);

      // After successful registration, show success message and redirect to login
      this.state.isLoading = false;
      this.notifyListeners();

      toast({
        title: "Đăng ký thành công",
        description:
          "Tài khoản đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.",
        variant: "success",
        duration: 5000,
      });

      console.log("Registration completed successfully");
    } catch (error: any) {
      console.error("Registration failed:", error);
      this.state.isLoading = false;
      this.notifyListeners();

      // Handle specific error cases
      const errorMessage = error.message || "Đăng ký thất bại";
      if (
        errorMessage.includes("409") ||
        errorMessage.includes("Conflict") ||
        errorMessage.includes("already exists")
      ) {
        toast({
          title: "Tài khoản đã tồn tại",
          description:
            "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("400") ||
        errorMessage.includes("Bad Request")
      ) {
        toast({
          title: "Thông tin không hợp lệ",
          description: "Vui lòng kiểm tra lại thông tin đăng ký.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("422") ||
        errorMessage.includes("Validation")
      ) {
        toast({
          title: "Dữ liệu không hợp lệ",
          description: "Vui lòng kiểm tra lại các trường thông tin bắt buộc.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Đăng ký thất bại",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }

      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.notifyListeners();

      // Disconnect WebSocket
      websocketService.disconnect();

      await apiClient.logout();
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.state.isLoading = false;
      this.notifyListeners();

      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống.",
        variant: "success",
        duration: 4000,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails on server, clear local state
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    await apiClient.forgotPassword({ email });
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.resetPassword({ token, password });
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.changePassword({ currentPassword, newPassword });
  }

  public async updateProfile(profileData: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<void> {
    try {
      const updatedUserInfo = await apiClient.updateProfile(profileData);
      // Update the current user state
      this.state.user = {
        id: updatedUserInfo.id,
        email: updatedUserInfo.email,
        name: updatedUserInfo.name,
        role: updatedUserInfo.role,
        avatar: updatedUserInfo.avatar,
      };
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  public async loginWithGoogle(googleData: {
    firebaseUid: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<void> {
    try {
      console.log("Starting Google login process for:", googleData.email);
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.loginWithGoogle(googleData);
      console.log("Google login API response received");

      // Get user info from API after successful login
      try {
        const userInfo = await apiClient.getCurrentUser();
        console.log("User info retrieved:", userInfo);
        this.state.user = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          avatar: userInfo.avatar,
          permissions: userInfo.permissions,
        };
        this.state.isAuthenticated = true;
      } catch (userInfoError) {
        console.error(
          "Failed to get user info after Google login:",
          userInfoError
        );
        // If we can't get user info, still mark as authenticated but with basic info
        this.state.user = {
          id: 0,
          email: googleData.email,
          name: googleData.name,
          role: "attendee",
          avatar: googleData.avatar,
          permissions: [
            "dashboard.view",
            "profile.view",
            "networking.view",
            "venue.view",
            "sessions.view",
            "badges.view",
            "mobile.view",
            "my-events.view",
          ],
        };
        this.state.isAuthenticated = true;
        console.log("Using fallback user info:", this.state.user);
      }

      this.state.isLoading = false;
      this.notifyListeners();
      console.log(
        "Google login process completed, user authenticated:",
        this.state.isAuthenticated
      );

      // Connect WebSocket for real-time notifications
      websocketService.connect().catch(console.error);
    } catch (error: any) {
      console.error("Google login failed:", error);
      this.state.isLoading = false;
      this.notifyListeners();

      // Handle specific error cases
      const errorMessage = error.message || "Đăng nhập Google thất bại";
      if (
        errorMessage.includes("Tài khoản đã bị khóa") ||
        errorMessage.includes("Account is disabled")
      ) {
        toast({
          title: "Tài khoản đã bị khóa",
          description:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          variant: "destructive",
          duration: 8000,
        });
      } else if (
        errorMessage.includes("409") ||
        errorMessage.includes("Conflict") ||
        errorMessage.includes("already exists")
      ) {
        toast({
          title: "Tài khoản chưa được đăng ký",
          description:
            "Email này chưa được đăng ký. Vui lòng đăng ký tài khoản trước.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized")
      ) {
        toast({
          title: "Đăng nhập Google thất bại",
          description: "Thông tin xác thực Google không hợp lệ.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Đăng nhập Google thất bại",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }

      throw error;
    }
  }

  public async registerWithGoogle(googleData: {
    email: string;
    name: string;
    avatar?: string;
    firebaseUid: string;
  }): Promise<void> {
    try {
      console.log(
        "Starting Google registration process for:",
        googleData.email,
        googleData.name
      );
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.registerWithGoogle(googleData);
      console.log("Google registration API response received:", response);

      // After successful registration, automatically log in
      // Add a small delay to ensure the user is fully created in the database
      console.log("Waiting 500ms before auto-login...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.loginWithGoogle(googleData);
      console.log("Auto-login after Google registration completed");
    } catch (error: any) {
      console.error("Google registration failed:", error);
      this.state.isLoading = false;
      this.notifyListeners();

      // Handle specific error cases
      const errorMessage = error.message || "Đăng ký Google thất bại";
      if (
        errorMessage.includes("409") ||
        errorMessage.includes("Conflict") ||
        errorMessage.includes("already exists")
      ) {
        toast({
          title: "Tài khoản đã tồn tại",
          description:
            "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.",
          variant: "destructive",
          duration: 6000,
        });
      } else if (
        errorMessage.includes("400") ||
        errorMessage.includes("Bad Request")
      ) {
        toast({
          title: "Thông tin không hợp lệ",
          description: "Vui lòng kiểm tra lại thông tin đăng ký Google.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Đăng ký Google thất bại",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }

      throw error;
    }
  }

  public getState(): AuthState {
    console.log("AuthService.getState() called, current state:", this.state);
    return { ...this.state };
  }

  public async reinitialize(): Promise<void> {
    console.log("Re-initializing auth service...");
    this.state.isLoading = true;
    this.notifyListeners();
    await this.initializeAuth();
  }

  public async refreshPermissions(): Promise<void> {
    try {
      console.log("Refreshing user permissions...");
      const oldRole = this.state.user?.role;
      this.state.isLoading = true;
      this.notifyListeners();

      const userInfo = await apiClient.refreshPermissions();
      this.state.user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role,
        avatar: userInfo.avatar,
      };
      this.state.isAuthenticated = true;
      this.state.isLoading = false;
      this.notifyListeners();

      console.log("Permissions refreshed successfully:", this.state.user);

      // Show different messages based on whether role actually changed
      if (oldRole && oldRole !== userInfo.role) {
        toast({
          title: "Quyền đã được cập nhật",
          description: `Role của bạn đã thay đổi từ "${oldRole}" thành "${userInfo.role}". Giao diện sẽ được cập nhật tự động.`,
          variant: "success",
          duration: 6000,
        });
      } else {
        toast({
          title: "Quyền đã được làm mới",
          description: `Thông tin quyền hiện tại: ${userInfo.role}`,
          variant: "success",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Failed to refresh permissions:", error);
      this.state.isLoading = false;
      this.notifyListeners();

      toast({
        title: "Lỗi cập nhật quyền",
        description: "Không thể cập nhật quyền. Vui lòng đăng nhập lại.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }

  public clearAuthState(): void {
    console.log("Clearing authentication state...");
    this.state.user = null;
    this.state.isAuthenticated = false;
    this.state.isLoading = false;
    this.notifyListeners();

    // Also clear tokens from API client
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("authState");

      // Clear cookies
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
    }

    console.log("Authentication state cleared");
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error("Error in auth listener:", error);
      }
    });
  }

  private setupSessionExpirationHandler(): void {
    if (typeof window !== "undefined") {
      // Listen for session expiration events from API client
      window.addEventListener("session-expired", (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log("Session expired event received:", customEvent.detail);

        // Update auth state to reflect session expiration
        this.state.user = null;
        this.state.isAuthenticated = false;
        this.state.isLoading = false;
        this.notifyListeners();
      });

      // Listen for account disabled events from API client
      window.addEventListener("account-disabled", (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log("Account disabled event received:", customEvent.detail);

        // Update auth state to reflect account disabled
        this.state.user = null;
        this.state.isAuthenticated = false;
        this.state.isLoading = false;
        this.notifyListeners();

        // Show specific toast for account disabled
        toast({
          title: "Tài khoản đã bị khóa",
          description: customEvent.detail.message,
          variant: "destructive",
          duration: 8000,
        });
      });

      // Listen for WebSocket logout required events
      window.addEventListener("websocket-logout-required", (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log(
          "WebSocket logout required event received:",
          customEvent.detail
        );

        // Update auth state to reflect session expiration
        this.state.user = null;
        this.state.isAuthenticated = false;
        this.state.isLoading = false;
        this.notifyListeners();

        // Show specific toast for session expiration
        toast({
          title: "Phiên đăng nhập đã hết hạn",
          description: customEvent.detail.message,
          variant: "destructive",
          duration: 8000,
        });
      });
    }
  }
}

export const authService = AuthService.getInstance();
