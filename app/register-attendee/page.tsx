"use client"

import React from "react"
import { AttendeeRegistrationForm } from "@/components/attendees/attendee-registration-form"
import { useNotification } from "@/hooks/use-notification"

export default function RegisterAttendeePage() {
  const { showSuccess, showError } = useNotification()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-indigo-200/30 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-purple-200/30 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-4">
              Đăng ký tham dự hội nghị
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tham gia các hội nghị chuyên nghiệp và kết nối với cộng đồng. 
              Điền thông tin để đăng ký tham dự.
            </p>
          </div>

          {/* Registration Form */}
          <AttendeeRegistrationForm />
        </div>
      </div>
    </div>
  )
}
