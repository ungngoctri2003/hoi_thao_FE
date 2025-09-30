"use client"

import { useCallback } from "react"
import { apiClient } from "@/lib/api"

// Simple hook for frontend audit logging - TEMPORARILY DISABLED
export function useFrontendAudit() {
  const logAction = useCallback(async (action: string, page?: string, details?: string) => {
    // Audit logging temporarily disabled
    console.log('Audit logging disabled:', { action, page, details })
    return
    // try {
    //   await apiClient.logFrontendAction(action, page, details)
    // } catch (error) {
    //   console.warn('Failed to log frontend action:', error)
    // }
  }, [])

  // Helper functions for common actions
  const actions = {
    // Navigation
    navigate: (page: string) => logAction('Truy cập trang', page),
    
    // Authentication
    login: () => logAction('Đăng nhập', 'Xác thực'),
    logout: () => logAction('Đăng xuất', 'Xác thực'),
    
    // CRUD Operations
    create: (itemType: string, page?: string) => logAction(`Tạo mới ${itemType}`, page),
    read: (itemType: string, page?: string) => logAction(`Xem ${itemType}`, page),
    update: (itemType: string, page?: string) => logAction(`Cập nhật ${itemType}`, page),
    delete: (itemType: string, page?: string) => logAction(`Xóa ${itemType}`, page),
    
    // Registration
    register: (conferenceName?: string) => logAction('Đăng ký tham dự', 'Đăng ký', conferenceName),
    unregister: (conferenceName?: string) => logAction('Hủy đăng ký', 'Đăng ký', conferenceName),
    
    // Check-in/Check-out
    checkin: (conferenceName?: string) => logAction('Check-in', 'Check-in', conferenceName),
    checkout: (conferenceName?: string) => logAction('Check-out', 'Check-out', conferenceName),
    
    // Data Export/Import
    export: (dataType: string, page?: string) => logAction(`Xuất dữ liệu ${dataType}`, page),
    import: (dataType: string, page?: string) => logAction(`Nhập dữ liệu ${dataType}`, page),
    
    // Search/Filter
    search: (searchTerm: string, page?: string) => logAction('Tìm kiếm', page, searchTerm),
    filter: (filterType: string, page?: string) => logAction(`Lọc theo ${filterType}`, page),
    
    // Settings
    settingsChange: (settingType: string) => logAction(`Thay đổi cài đặt ${settingType}`, 'Cài đặt'),
    
    // Profile
    profileUpdate: () => logAction('Cập nhật hồ sơ', 'Hồ sơ cá nhân'),
    
    // File Operations
    upload: (fileType: string, page?: string) => logAction(`Tải lên ${fileType}`, page),
    download: (fileType: string, page?: string) => logAction(`Tải xuống ${fileType}`, page),
    
    // Custom action
    custom: (action: string, page?: string, details?: string) => logAction(action, page, details)
  }

  return {
    logAction,
    actions
  }
}
