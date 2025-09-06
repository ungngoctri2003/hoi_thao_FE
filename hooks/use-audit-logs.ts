"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, AuditLog, AuditLogFilters } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UserInfo {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

interface UseAuditLogsReturn {
  logs: AuditLog[]
  loading: boolean
  error: string | null
  total: number
  page: number
  limit: number
  totalPages: number
  filters: AuditLogFilters
  setFilters: (filters: Partial<AuditLogFilters>) => void
  refresh: () => Promise<void>
  exportLogs: () => Promise<void>
  users: Record<number, UserInfo>
  getUserInfo: (userId: number) => UserInfo | null
}

export function useAuditLogs(initialFilters: AuditLogFilters = {}): UseAuditLogsReturn {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [users, setUsers] = useState<Record<number, UserInfo>>({})
  const [filters, setFiltersState] = useState<AuditLogFilters>({
    page: 1,
    limit: 10,
    ...initialFilters
  })

  const { toast } = useToast()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // If multiple users are selected, fetch data for each user separately
      if (filters.userId && Array.isArray(filters.userId)) {
        const allLogs: AuditLog[] = []
        let totalCount = 0
        
        // Fetch logs for each selected user
        for (const userId of filters.userId) {
          try {
            const userFilters = { ...filters, userId }
            const response = await apiClient.getAuditLogs(userFilters)
            allLogs.push(...response.data)
            totalCount += response.meta?.total || 0
          } catch (userError) {
            console.warn(`Could not fetch logs for user ${userId}:`, userError)
          }
        }
        
        // Remove duplicates and sort by timestamp
        const uniqueLogs = allLogs.filter((log, index, self) => 
          index === self.findIndex(l => l.id === log.id)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        setLogs(uniqueLogs)
        setTotal(uniqueLogs.length)
        
        // Fetch user information for all unique user IDs
        const userIds = [...new Set(uniqueLogs.map(log => log.userId).filter((id): id is number => Boolean(id)))]
        if (userIds.length > 0) {
          try {
            const usersData = await apiClient.getUsersByIds(userIds)
            setUsers(prevUsers => ({ ...prevUsers, ...usersData }))
          } catch (userError) {
            console.warn('Could not fetch user information:', userError)
          }
        }
      } else {
        // Single user or no user filter - use original logic
        const response = await apiClient.getAuditLogs(filters)
        setLogs(response.data)
        setTotal(response.meta?.total || 0)
        
        // Fetch user information for all unique user IDs
        const userIds = [...new Set(response.data.map(log => log.userId).filter((id): id is number => Boolean(id)))]
        if (userIds.length > 0) {
          try {
            const usersData = await apiClient.getUsersByIds(userIds)
            setUsers(prevUsers => ({ ...prevUsers, ...usersData }))
          } catch (userError) {
            console.warn('Could not fetch user information:', userError)
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải nhật ký audit'
      setError(errorMessage)
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  // Fetch all users for dropdown
  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await apiClient.getUsers(1, 100) // Get first 100 users
      const usersMap: Record<number, UserInfo> = {}
      response.data.forEach((user: any) => {
        usersMap[user.id] = {
          id: parseInt(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      })
      setUsers(prevUsers => ({ ...prevUsers, ...usersMap }))
    } catch (err) {
      console.warn('Could not fetch all users:', err)
    }
  }, [])

  const setFilters = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setFiltersState(prev => {
      const updated = {
        ...prev,
        ...newFilters,
        page: newFilters.page || 1 // Reset to first page when filters change
      }
      console.log('Updated filters:', updated)
      return updated
    })
  }, [])

  const refresh = useCallback(async () => {
    await fetchLogs()
  }, [fetchLogs])

  const exportLogs = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch all logs for export (without pagination)
      const exportFilters = { ...filters, page: 1, limit: 10000 }
      const response = await apiClient.getAuditLogs(exportFilters)
      
      // Convert to CSV format
      const csvHeaders = [
        'ID',
        'Thời gian',
        'Người dùng',
        'Hành động',
        'Tài nguyên',
        'Chi tiết',
        'IP Address',
        'User Agent',
        'Trạng thái',
        'Danh mục'
      ]
      
      const csvRows = response.data.map(log => [
        log.id,
        log.timestamp,
        log.userId || '',
        log.actionName || '',
        log.resourceName || '',
        log.details || '',
        log.ipAddress || '',
        log.userAgent || '',
        log.status || '',
        log.category || ''
      ])
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Thành công",
        description: "Đã xuất nhật ký audit thành công",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xuất nhật ký'
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Fetch all users on mount for dropdown
  useEffect(() => {
    fetchAllUsers()
  }, [fetchAllUsers])

  const totalPages = Math.ceil(total / (filters.limit || 10))

  const getUserInfo = useCallback((userId: number): UserInfo | null => {
    return users[userId] || null
  }, [users])

  return {
    logs,
    loading,
    error,
    total,
    page: filters.page || 1,
    limit: filters.limit || 10,
    totalPages,
    filters,
    setFilters,
    refresh,
    exportLogs,
    users,
    getUserInfo
  }
}
