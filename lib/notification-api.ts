"use client";

import { useAuth } from '@/hooks/use-auth';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'permission' | 'conference' | 'session' | 'registration' | 'general';
  is_read: boolean;
  is_archived: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  active_count: number;
}

export interface NotificationFilters {
  type?: string;
  category?: string;
  is_read?: boolean;
  is_archived?: boolean;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface NotificationPreferences {
  id: number;
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  categories?: any;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

class NotificationAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseUrl}/api/notifications${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    const data = await response.json();
    return data.data || data;
  }

  // Get user's notifications
  async getNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    stats: NotificationStats;
    pagination: {
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request(`/?${queryString}`);
  }

  // Get notification statistics
  async getStats(): Promise<NotificationStats> {
    return this.request('/stats');
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    return this.request(`/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    return this.request('/read-all', {
      method: 'PATCH',
    });
  }

  // Archive notification
  async archive(notificationId: number): Promise<void> {
    return this.request(`/${notificationId}/archive`, {
      method: 'PATCH',
    });
  }

  // Delete notification
  async delete(notificationId: number): Promise<void> {
    return this.request(`/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    return this.request('/preferences');
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return this.request('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // Send notification to specific user (Admin only)
  async sendNotification(
    userId: number,
    data: {
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      category?: 'system' | 'permission' | 'conference' | 'session' | 'registration' | 'general';
      data?: any;
      expires_at?: string;
    }
  ): Promise<Notification> {
    return this.request(`/send/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Send notification from template (Admin only)
  async sendFromTemplate(
    userId: number,
    data: {
      template_name: string;
      variables?: Record<string, any>;
      data?: any;
      expires_at?: string;
    }
  ): Promise<Notification> {
    return this.request(`/send-template/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Broadcast notification to all users (Admin only)
  async broadcast(data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'permission' | 'conference' | 'session' | 'registration' | 'general';
    data?: any;
    expires_at?: string;
  }): Promise<{ createdCount: number; totalUsers: number }> {
    return this.request('/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Broadcast notification from template (Admin only)
  async broadcastFromTemplate(data: {
    template_name: string;
    variables?: Record<string, any>;
    data?: any;
    expires_at?: string;
  }): Promise<{ createdCount: number; totalUsers: number }> {
    return this.request('/broadcast-template', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cleanup expired notifications (Admin only)
  async cleanup(): Promise<{ deletedCount: number }> {
    return this.request('/cleanup', {
      method: 'POST',
    });
  }
}

export const notificationAPI = new NotificationAPI();
