// WebSocket service for real-time notifications and role changes
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {
    // Initialize WebSocket connection when service is created
    this.initializeConnection();
  }

  private initializeConnection(): void {
    // Only connect if we're in the browser and have a token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.connect();
      }
    }
  }

  public connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No access token found, skipping WebSocket connection');
        return;
      }

      console.log('Connecting to WebSocket...');
      
      // Connect to WebSocket server
      this.socket = io('http://localhost:4000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnected = false;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user-specific room for role change notifications
      const userId = this.getCurrentUserId();
      if (userId) {
        this.socket?.emit('join-room', `user:${userId}`);
        console.log(`Joined room: user:${userId}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached, stopping reconnection');
        this.socket?.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Rejoin user room after reconnection
      const userId = this.getCurrentUserId();
      if (userId) {
        this.socket?.emit('join-room', `user:${userId}`);
      }
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`WebSocket reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after all attempts');
      this.isConnected = false;
    });

    // Listen for role change notifications
    this.socket.on('role-changed', (data) => {
      console.log('Role change notification received:', data);
      
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('role-changed', {
          detail: data
        }));
      }
    });

    // Listen for permission updates
    this.socket.on('permissions-updated', (data) => {
      console.log('Permissions updated notification received:', data);
      
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permissions-updated', {
          detail: data
        }));
      }
    });

    // Listen for general notifications
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      
      // Dispatch custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('websocket-notification', {
          detail: data
        }));
      }
    });
  }

  private getCurrentUserId(): number | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  }

  // Method to send messages to server
  public emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
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

  // Get connection status
  public getConnectionStatus(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
