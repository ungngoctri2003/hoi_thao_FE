"use client";

import { create } from 'zustand';
import { notificationAPI, Notification as APINotification, NotificationStats } from './notification-api';

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  category?: string;
  is_archived?: boolean;
  expires_at?: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  isLoading: boolean;
  stats: NotificationStats | null;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: number) => Promise<void>;
  archiveNotification: (id: number) => Promise<void>;
  clearAll: () => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  
  // API Actions
  loadNotifications: (filters?: any) => Promise<void>;
  loadStats: () => Promise<void>;
  syncWithAPI: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  isLoading: false,
  stats: null,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Temporary ID for local notifications
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Auto remove after 10 seconds for non-error notifications
    if (notification.type !== 'error') {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 10000);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((notif) => ({ ...notif, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  removeNotification: async (id) => {
    try {
      await notificationAPI.delete(id);
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.read;
        
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  archiveNotification: async (id) => {
    try {
      await notificationAPI.archive(id);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, is_archived: true } : notif
        ),
      }));
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  togglePanel: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },

  setPanelOpen: (open) => {
    set({ isOpen: open });
  },

  loadNotifications: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const response = await notificationAPI.getNotifications(filters);
      const notifications = response.notifications.map((notif: APINotification) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: new Date(notif.created_at),
        read: notif.is_read,
        data: notif.data,
        category: notif.category,
        is_archived: notif.is_archived,
        expires_at: notif.expires_at ? new Date(notif.expires_at) : undefined,
      }));

      set({
        notifications,
        unreadCount: response.stats.unread_count,
        stats: response.stats,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      set({ isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await notificationAPI.getStats();
      set({ stats, unreadCount: stats.unread_count });
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  },

  syncWithAPI: async () => {
    await Promise.all([
      get().loadNotifications(),
      get().loadStats(),
    ]);
  },
}));

// Notification service for easy access
export const notificationService = {
  info: (title: string, message: string, data?: any) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      data,
    });
  },

  success: (title: string, message: string, data?: any) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      data,
    });
  },

  warning: (title: string, message: string, data?: any) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      title,
      message,
      data,
    });
  },

  error: (title: string, message: string, data?: any) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      title,
      message,
      data,
    });
  },

  // Permission change notifications
  permissionChanged: (oldRole?: string, newRole?: string) => {
    const title = newRole ? "Role đã được cập nhật" : "Quyền đã được cập nhật";
    const message = newRole 
      ? `Role của bạn đã thay đổi từ "${oldRole}" thành "${newRole}"`
      : "Một số quyền của bạn đã được thay đổi";
    
    useNotificationStore.getState().addNotification({
      type: 'success',
      title,
      message,
      data: { type: 'permission_change', oldRole, newRole },
    });
  },

  // System notifications
  systemMessage: (title: string, message: string) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      title,
      message,
      data: { type: 'system' },
    });
  },
};
