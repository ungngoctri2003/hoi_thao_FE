"use client"

import { AttendeeRegistrationForm } from "@/components/attendees/attendee-registration-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Đăng ký tham dự hội nghị</h1>
          <p className="text-muted-foreground">Vui lòng điền đầy đủ thông tin để hoàn tất đăng ký</p>
        </div>
        <AttendeeRegistrationForm />
      </div>
    </div>
  )
}
