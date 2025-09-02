// Authentication utilities and context
import { apiClient, UserInfo } from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
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
          };
          this.state.isAuthenticated = true;
        } catch (error) {
          console.error('Failed to get user info during initialization:', error);
          // Token might be invalid, clear it
          apiClient.logout();
          this.state.user = null;
          this.state.isAuthenticated = false;
        }
      } else {
        this.state.user = null;
        this.state.isAuthenticated = false;
      }
      this.state.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      console.log('Starting login process for:', email);
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.login({ email, password });
      console.log('Login API response received');
      
      // Get user info from API after successful login
      try {
        const userInfo = await apiClient.getCurrentUser();
        console.log('User info retrieved:', userInfo);
        this.state.user = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          avatar: userInfo.avatar,
        };
        this.state.isAuthenticated = true;
      } catch (userInfoError) {
        console.error('Failed to get user info after login:', userInfoError);
        // If we can't get user info, still mark as authenticated but with basic info
        this.state.user = {
          id: 0,
          email: email,
          name: email.split('@')[0], // Use email prefix as name fallback
          role: 'attendee',
        };
        this.state.isAuthenticated = true;
        console.log('Using fallback user info:', this.state.user);
      }
      
      this.state.isLoading = false;
      this.notifyListeners();
      console.log('Login process completed, user authenticated:', this.state.isAuthenticated);
    } catch (error) {
      console.error('Login failed:', error);
      this.state.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async register(email: string, name: string, password: string): Promise<void> {
    try {
      console.log('Starting registration process for:', email, name);
      this.state.isLoading = true;
      this.notifyListeners();

      const response = await apiClient.register({ email, name, password });
      console.log('Registration API response received:', response);
      
      // After successful registration, automatically log in
      // Add a small delay to ensure the user is fully created in the database
      console.log('Waiting 500ms before auto-login...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.login(email, password);
      console.log('Auto-login after registration completed');
    } catch (error) {
      console.error('Registration failed:', error);
      this.state.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.notifyListeners();
      
      await apiClient.logout();
      this.state.user = null;
      this.state.isAuthenticated = false;
      this.state.isLoading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Logout failed:', error);
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

  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.changePassword({ currentPassword, newPassword });
  }

  public async updateProfile(profileData: { name?: string; email?: string; avatar?: string }): Promise<void> {
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
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }
}

export const authService = AuthService.getInstance();
