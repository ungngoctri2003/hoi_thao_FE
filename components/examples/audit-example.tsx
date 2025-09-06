"use client"

import { useFrontendAudit } from "@/hooks/use-frontend-audit"
import { Button } from "@/components/ui/button"

// Example component showing how to use frontend audit logging
export function AuditExample() {
  const { actions } = useFrontendAudit()

  const handleLogin = () => {
    // Log login action
    actions.login()
    // ... rest of login logic
  }

  const handleLogout = () => {
    // Log logout action
    actions.logout()
    // ... rest of logout logic
  }

  const handleCreateAttendee = () => {
    // Log create action
    actions.create('người tham dự', 'Quản lý người tham dự')
    // ... rest of create logic
  }

  const handleUpdateAttendee = () => {
    // Log update action
    actions.update('người tham dự', 'Quản lý người tham dự')
    // ... rest of update logic
  }

  const handleDeleteAttendee = () => {
    // Log delete action
    actions.delete('người tham dự', 'Quản lý người tham dự')
    // ... rest of delete logic
  }

  const handleRegister = () => {
    // Log registration action
    actions.register('Hội nghị Công nghệ 2024')
    // ... rest of registration logic
  }

  const handleCheckin = () => {
    // Log checkin action
    actions.checkin('Hội nghị Công nghệ 2024')
    // ... rest of checkin logic
  }

  const handleExport = () => {
    // Log export action
    actions.export('danh sách người tham dự', 'Quản lý người tham dự')
    // ... rest of export logic
  }

  const handleSearch = () => {
    // Log search action
    actions.search('Nguyễn Văn A', 'Quản lý người tham dự')
    // ... rest of search logic
  }

  const handleFilter = () => {
    // Log filter action
    actions.filter('trạng thái', 'Quản lý người tham dự')
    // ... rest of filter logic
  }

  const handleSettingsChange = () => {
    // Log settings change
    actions.settingsChange('thông báo')
    // ... rest of settings logic
  }

  const handleProfileUpdate = () => {
    // Log profile update
    actions.profileUpdate()
    // ... rest of profile logic
  }

  const handleCustomAction = () => {
    // Log custom action
    actions.custom('Gửi email thông báo', 'Quản lý người tham dự', 'Gửi email cho 50 người tham dự')
    // ... rest of custom logic
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Ví dụ sử dụng Frontend Audit Logging</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleLogin}>Đăng nhập</Button>
        <Button onClick={handleLogout}>Đăng xuất</Button>
        
        <Button onClick={handleCreateAttendee}>Tạo người tham dự</Button>
        <Button onClick={handleUpdateAttendee}>Cập nhật người tham dự</Button>
        <Button onClick={handleDeleteAttendee}>Xóa người tham dự</Button>
        
        <Button onClick={handleRegister}>Đăng ký tham dự</Button>
        <Button onClick={handleCheckin}>Check-in</Button>
        
        <Button onClick={handleExport}>Xuất dữ liệu</Button>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        <Button onClick={handleFilter}>Lọc dữ liệu</Button>
        
        <Button onClick={handleSettingsChange}>Thay đổi cài đặt</Button>
        <Button onClick={handleProfileUpdate}>Cập nhật hồ sơ</Button>
        <Button onClick={handleCustomAction}>Hành động tùy chỉnh</Button>
      </div>
    </div>
  )
}
