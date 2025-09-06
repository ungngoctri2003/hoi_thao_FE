"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/hooks/use-auth"
import { useSafeAudit } from "@/hooks/use-safe-audit"
import { AuthStatus } from "@/components/auth/auth-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function TestStaffAuditPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { actions } = useSafeAudit()
  const [logs, setLogs] = useState<string[]>([])
  
  const role = (user?.role as "admin" | "staff" | "attendee") || "attendee"
  const name = user?.name || "Test User"

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testStaffActions = async () => {
    const staffActions = [
      { action: 'Truy cập trang Dashboard', page: 'Bảng điều khiển', details: 'Staff accessed dashboard' },
      { action: 'Xem danh sách người tham dự', page: 'Quản lý người tham dự', details: 'Staff viewed attendees list' },
      { action: 'Tạo mới người tham dự', page: 'Quản lý người tham dự', details: 'Staff created new attendee' },
      { action: 'Cập nhật thông tin người tham dự', page: 'Quản lý người tham dự', details: 'Staff updated attendee info' },
      { action: 'Check-in người tham dự', page: 'Check-in', details: 'Staff performed check-in' },
      { action: 'Xem báo cáo tham dự', page: 'Phân tích', details: 'Staff viewed attendance reports' }
    ]

    for (let i = 0; i < staffActions.length; i++) {
      const action = staffActions[i]
      addLog(`Testing: ${action.action}`)
      
      try {
        await actions.custom(action.action, action.page, action.details)
        addLog(`✅ ${action.action} logged successfully`)
      } catch (error) {
        addLog(`❌ ${action.action} failed: ${error}`)
      }
      
      // Small delay between actions
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    addLog('Staff actions test completed!')
  }

  const testNavigation = async () => {
    const pages = ['Dashboard', 'Quản lý người tham dự', 'Check-in', 'Phân tích', 'Cài đặt']
    
    for (const page of pages) {
      addLog(`Navigating to: ${page}`)
      
      try {
        await actions.navigate(page)
        addLog(`✅ Navigation to ${page} logged`)
      } catch (error) {
        addLog(`❌ Navigation to ${page} failed: ${error}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const testCRUD = async () => {
    const operations = [
      { action: 'Tạo mới', item: 'người tham dự', page: 'Quản lý người tham dự' },
      { action: 'Xem', item: 'danh sách người tham dự', page: 'Quản lý người tham dự' },
      { action: 'Cập nhật', item: 'thông tin người tham dự', page: 'Quản lý người tham dự' },
      { action: 'Xóa', item: 'người tham dự', page: 'Quản lý người tham dự' }
    ]
    
    for (const op of operations) {
      addLog(`Testing ${op.action} ${op.item}`)
      
      try {
        await actions.custom(`${op.action} ${op.item}`, op.page, `Staff performed ${op.action.toLowerCase()} operation on ${op.item}`)
        addLog(`✅ ${op.action} ${op.item} logged`)
      } catch (error) {
        addLog(`❌ ${op.action} ${op.item} failed: ${error}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const testCheckin = async () => {
    const checkinActions = [
      { action: 'Check-in', conference: 'Hội nghị Công nghệ 2024', details: 'Staff performed check-in for conference' },
      { action: 'Check-out', conference: 'Hội nghị Công nghệ 2024', details: 'Staff performed check-out for conference' },
      { action: 'Xem lịch sử Check-in', page: 'Check-in', details: 'Staff viewed check-in history' }
    ]
    
    for (const action of checkinActions) {
      addLog(`Testing: ${action.action}`)
      
      try {
        await actions.custom(action.action, action.page || 'Check-in', action.details)
        addLog(`✅ ${action.action} logged`)
      } catch (error) {
        addLog(`❌ ${action.action} failed: ${error}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AuthStatus />
        </div>
      </div>
    )
  }

  return (
    <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Audit System Test</h1>
          <p className="text-muted-foreground">
            Test the audit logging system with staff user actions.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Current user: {name} ({role})
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testStaffActions} className="w-full">
                Test All Staff Actions
              </Button>
              <Button onClick={testNavigation} variant="outline" className="w-full">
                Test Navigation
              </Button>
              <Button onClick={testCRUD} variant="outline" className="w-full">
                Test CRUD Operations
              </Button>
              <Button onClick={testCheckin} variant="outline" className="w-full">
                Test Check-in Actions
              </Button>
              <Button onClick={clearLogs} variant="destructive" className="w-full">
                Clear Logs
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Test Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded border">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">No logs yet. Click a test button to start.</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-sm mb-2 font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Test All Staff Actions:</strong> Tests various staff operations like viewing attendees, creating, updating, etc.</p>
              <p>2. <strong>Test Navigation:</strong> Tests page navigation logging.</p>
              <p>3. <strong>Test CRUD Operations:</strong> Tests Create, Read, Update, Delete operations.</p>
              <p>4. <strong>Test Check-in Actions:</strong> Tests check-in related operations.</p>
              <p>5. <strong>View Audit Logs:</strong> Go to <code>/audit</code> page to see all logged actions in the database.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
