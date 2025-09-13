// WebSocket service for real-time notifications and role changes
import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnecting: boolean = false;
  private hasAttemptedTokenRefresh: boolean = false;
  private isPaused: boolean = false;

  constructor() {
    // Initialize WebSocket connection when service is created
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Only connect if we're in the browser and have a token
    if (typeof window !== "undefined") {
      const token = this.getToken();
      if (token) {
        this.connect();
      }
    }
  }

  public async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("WebSocket connection already in progress");
      return;
    }

    if (this.isPaused) {
      console.log("WebSocket is paused due to repeated failures");
      return;
    }

    this.isConnecting = true;

    try {
      let token = this.getToken();
      if (!token) {
        console.log("No valid access token found, attempting to refresh...");

        // Try to refresh token if no valid token is found
        if (!this.hasAttemptedTokenRefresh) {
          const refreshSuccess = await this.attemptTokenRefresh();
          if (refreshSuccess) {
            token = this.getToken();
            if (!token) {
              console.error(
                "Token refresh succeeded but no token found after refresh"
              );
              this.isConnecting = false;
              return;
            }
          } else {
            console.error(
              "Token refresh failed, skipping WebSocket connection"
            );
            this.isConnecting = false;
            return;
          }
        } else {
          console.error(
            "Token refresh already attempted, skipping WebSocket connection"
          );
          this.isConnecting = false;
          return;
        }
      }

      console.log("Connecting to WebSocket...");
      console.log(
        "Token being sent:",
        token ? `${token.substring(0, 20)}...` : "none"
      );
      console.log("Token length:", token?.length || 0);
      console.log(
        "Token format check:",
        token
          ? token.split(".").length === 3
            ? "Valid JWT format"
            : "Invalid JWT format"
          : "No token"
      );

      // Additional token debugging
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
              exp: payload.exp,
              iat: payload.iat,
              expDate: new Date(payload.exp * 1000).toISOString(),
              currentTime: new Date().toISOString(),
              isExpired: Date.now() >= payload.exp * 1000,
            });
          }
        } catch (error) {
          console.error("Failed to parse token payload:", error);
        }
      }

      // Additional token validation
      if (token) {
        try {
          // Check if token is expired before sending
          const payload = JSON.parse(atob(token.split(".")[1]));
          const now = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = payload.exp - now;

          console.log("Token validation:", {
            expiresAt: new Date(payload.exp * 1000),
            timeUntilExpiry: timeUntilExpiry,
            isExpired: now >= payload.exp,
          });

          if (now >= payload.exp) {
            console.warn("Token is expired, attempting to refresh...");
            // Only try refresh if we haven't already attempted it
            if (!this.hasAttemptedTokenRefresh) {
              const refreshSuccess = await this.attemptTokenRefresh();
              if (refreshSuccess) {
                const newToken = this.getToken();
                if (newToken) {
                  console.log("Token refreshed successfully, reconnecting...");
                  this.connect().catch(console.error);
                  return;
                }
              }
            }
            console.error(
              "Failed to refresh expired token or already attempted"
            );
            return;
          } else if (timeUntilExpiry < 300) {
            // Less than 5 minutes until expiry
            console.warn(
              "Token expires soon, attempting to refresh proactively..."
            );
            if (!this.hasAttemptedTokenRefresh) {
              const refreshSuccess = await this.attemptTokenRefresh();
              if (refreshSuccess) {
                const newToken = this.getToken();
                if (newToken) {
                  console.log("Token refreshed proactively, reconnecting...");
                  this.connect().catch(console.error);
                  return;
                }
              }
            }
          }
          console.log("Token is valid, proceeding with connection");
        } catch (error) {
          console.error("Invalid token format:", error);
          return;
        }
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // Connect to WebSocket server
      this.socket = io("http://localhost:4000", {
        path: "/ws",
        auth: {
          token: token,
        },
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        forceNew: true, // Force new connection
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.isConnected = false;
    } finally {
      this.isConnecting = false;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log("Disconnecting WebSocket...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.hasAttemptedTokenRefresh = false;
      this.isPaused = false;
    }
  }

  public async reconnect(): Promise<void> {
    console.log("Manually reconnecting WebSocket...");
    this.disconnect();
    await this.connect();
  }

  public reset(): void {
    console.log("Resetting WebSocket service...");
    this.disconnect();
    this.isPaused = false;
    this.hasAttemptedTokenRefresh = false;
    this.reconnectAttempts = 0;
  }

  public async forceReconnect(): Promise<void> {
    console.log("Force reconnecting WebSocket...");
    this.reset();
    await this.connect();
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected successfully");
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.hasAttemptedTokenRefresh = false;
      this.isPaused = false;

      // Join user-specific room for role change notifications
      const userId = this.getCurrentUserId();
      if (userId) {
        this.socket?.emit("join-room", `user:${userId}`);
        console.log(`Joined room: user:${userId}`);
      }

      // Dispatch connection event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-connected", {
            detail: { socketId: this.socket?.id },
          })
        );
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.isConnected = false;

      // Dispatch disconnection event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-disconnected", {
            detail: { reason },
          })
        );
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        description: (error as any).description,
        context: (error as any).context,
        type: (error as any).type,
      });

      // Additional debugging for token issues
      if (
        error.message === "Invalid token" ||
        error.message.includes("token")
      ) {
        console.error("Token validation failed on server side");
        const currentToken = this.getToken();
        console.error("Current token:", currentToken ? "exists" : "missing");
        console.error("Token length:", currentToken?.length || 0);

        // Debug token details
        if (currentToken) {
          try {
            const parts = currentToken.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.error("Token payload debug:", {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
                exp: payload.exp,
                expDate: new Date(payload.exp * 1000).toISOString(),
                currentTime: new Date().toISOString(),
                isExpired: Date.now() >= payload.exp * 1000,
              });
            }
          } catch (parseError) {
            console.error("Failed to parse token payload:", parseError);
          }
        }

        // Only try to refresh token once per session
        if (!this.hasAttemptedTokenRefresh) {
          console.log("Attempting token refresh...");
          this.hasAttemptedTokenRefresh = true;
          this.attemptTokenRefresh()
            .then((success) => {
              if (success) {
                console.log("Token refreshed, attempting to reconnect...");
                this.connect().catch(console.error);
              } else {
                console.error(
                  "Failed to refresh token, WebSocket will not connect"
                );
                // Stop reconnection attempts after failed refresh
                this.reconnectAttempts = this.maxReconnectAttempts;
              }
            })
            .catch((refreshError) => {
              console.error("Token refresh error:", refreshError);
              // Stop reconnection attempts after refresh error
              this.reconnectAttempts = this.maxReconnectAttempts;
            });
        } else {
          console.error(
            "Token refresh already attempted, stopping reconnection"
          );
          // Stop reconnection attempts
          this.reconnectAttempts = this.maxReconnectAttempts;
        }
      }

      this.isConnected = false;
      this.reconnectAttempts++;

      // Dispatch error event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-error", {
            detail: { error, reconnectAttempts: this.reconnectAttempts },
          })
        );
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log("Max reconnection attempts reached, pausing WebSocket");
        this.isPaused = true;
        this.socket?.disconnect();

        // Reset pause after 5 minutes
        setTimeout(() => {
          console.log("Resetting WebSocket pause, allowing reconnection");
          this.isPaused = false;
          this.reconnectAttempts = 0;
          this.hasAttemptedTokenRefresh = false;
        }, 5 * 60 * 1000); // 5 minutes
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Rejoin user room after reconnection
      const userId = this.getCurrentUserId();
      if (userId) {
        this.socket?.emit("join-room", `user:${userId}`);
      }
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("WebSocket reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("WebSocket reconnection failed after all attempts");
      this.isConnected = false;
    });

    // Listen for role change notifications
    this.socket.on("role-changed", (data) => {
      console.log("Role change notification received:", data);

      // Dispatch custom event for components to listen to
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("role-changed", {
            detail: data,
          })
        );
      }
    });

    // Listen for permission updates
    this.socket.on("permissions-updated", (data) => {
      console.log("Permissions updated notification received:", data);

      // Dispatch custom event for components to listen to
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("permissions-updated", {
            detail: data,
          })
        );
      }
    });

    // Listen for general notifications
    this.socket.on("notification", (data) => {
      console.log("Notification received:", data);

      // Dispatch custom event for components to listen to
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-notification", {
            detail: data,
          })
        );
      }
    });

    // Listen for messaging events
    this.socket.on("new-message", (data) => {
      console.log("New message received:", data);
      // Dispatch custom event for messaging hook to listen
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-new-message", {
            detail: data,
          })
        );
      }
    });

    this.socket.on("user-typing", (data) => {
      console.log("User typing received:", data);
      // Dispatch custom event for messaging hook to listen
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-user-typing", {
            detail: data,
          })
        );
      }
    });

    this.socket.on("user-stopped-typing", (data) => {
      console.log("User stopped typing received:", data);
      // Dispatch custom event for messaging hook to listen
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-user-stopped-typing", {
            detail: data,
          })
        );
      }
    });

    this.socket.on("message-read", (data) => {
      console.log("Message read received:", data);
      // Dispatch custom event for messaging hook to listen
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("websocket-message-read", {
            detail: data,
          })
        );
      }
    });
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      // Try multiple sources for token (consistent with API client)
      const sources = [
        // 1. Try cookies first
        () => {
          const cookies = document.cookie.split(";");
          const tokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("accessToken=")
          );
          if (tokenCookie) {
            const token = tokenCookie.split("=")[1];
            // Only URL decode if the token appears to be URL encoded
            try {
              if (token.includes("%")) {
                return decodeURIComponent(token);
              }
              return token;
            } catch (error) {
              console.warn("Failed to decode token from cookie:", error);
              return token; // Return as-is if decoding fails
            }
          }
          return null;
        },
        // 2. Try localStorage accessToken
        () => localStorage.getItem("accessToken"),
        // 3. Try localStorage token (legacy)
        () => localStorage.getItem("token"),
        // 4. Try sessionStorage
        () => sessionStorage.getItem("accessToken"),
        () => sessionStorage.getItem("token"),
      ];

      for (const source of sources) {
        try {
          const token = source();
          if (token && token.trim() !== "") {
            // Validate token format before returning
            if (this.isValidTokenFormat(token)) {
              console.log(
                "Valid token found from source:",
                source.name || "unknown"
              );
              return token;
            } else {
              console.warn("Invalid token format found, trying next source");
            }
          }
        } catch (error) {
          console.warn("Error accessing token source:", error);
        }
      }

      console.log("No valid token found in any source");
    }
    return null;
  }

  private isValidTokenFormat(token: string): boolean {
    try {
      // Check if it's a valid JWT format
      const parts = token.split(".");
      if (parts.length !== 3) {
        return false;
      }

      // Try to parse the payload to check if it's valid JSON
      const payload = JSON.parse(atob(parts[1]));

      // Check if token has required fields
      if (!payload.userId || !payload.exp) {
        return false;
      }

      // Check if token is not expired
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) {
        console.warn("Token is expired");
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Token format validation failed:", error);
      return false;
    }
  }

  private getCurrentUserId(): number | null {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || null;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  }

  // Method to send messages to server
  public emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`Emitted event: ${event}`, data);
    } else {
      console.warn("WebSocket not connected, cannot emit event:", event, data);
      // Try to reconnect if not connected
      this.connect();
    }
  }

  // Method to listen for specific events
  public on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Method to remove event listeners
  public off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Messaging specific methods
  public joinConversation(sessionId: number, userId: number): void {
    this.emit("join-conversation", { sessionId, userId });
  }

  public leaveConversation(sessionId: number, userId: number): void {
    this.emit("leave-conversation", { sessionId, userId });
  }

  public sendMessage(data: {
    sessionId: number;
    content: string;
    type: "text" | "image" | "file";
    attendeeId?: number;
    senderId: number;
  }): void {
    this.emit("send-message", data);
  }

  public setTyping(sessionId: number, userId: number, isTyping: boolean): void {
    this.emit("typing", { sessionId, userId, isTyping });
  }

  public stopTyping(sessionId: number, userId: number): void {
    this.emit("stop-typing", { sessionId, userId });
  }

  public markMessageAsRead(messageId: number, userId: number): void {
    this.emit("mark-message-read", { messageId, userId });
  }

  public getConversationHistory(
    sessionId: number,
    userId: number,
    limit?: number,
    offset?: number
  ): void {
    this.emit("get-conversation-history", { sessionId, userId, limit, offset });
  }

  // Get connection status
  public getConnectionStatus(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Token refresh method
  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.log("No refresh token available");
        return false;
      }

      console.log("Attempting to refresh token...");

      // Add a small delay to prevent rapid API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        "http://localhost:4000/api/v1/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "Refresh token is invalid or expired, user needs to login again"
          );
          // Clear all tokens and trigger logout
          this.clearAllTokens();
          this.triggerLogout();
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        // Update tokens in localStorage and cookies
        this.setToken(result.data.accessToken);
        this.setRefreshToken(result.data.refreshToken);
        console.log("Token refresh successful");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  private clearAllTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
    }
  }

  private triggerLogout(): void {
    if (typeof window !== "undefined") {
      // Dispatch logout event for auth service to handle
      const event = new CustomEvent("websocket-logout-required", {
        detail: {
          message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    }
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      // Try cookies first (consistent with API client)
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("refreshToken=")
      );
      if (tokenCookie) {
        return tokenCookie.split("=")[1];
      }

      // Fallback to localStorage
      const token = localStorage.getItem("refreshToken");
      if (token) {
        return token;
      }
    }
    return null;
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
}

// Export singleton instance
export const websocketService = new WebSocketService();
