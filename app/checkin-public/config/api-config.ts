// API Configuration for Check-in System
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  
  // API Endpoints - Using public endpoints (no authentication required)
  ENDPOINTS: {
    CHECKIN: '/public/checkins/checkin',
    CHECKIN_RECORDS: '/public/checkins', // Use public checkins for listing records
    CHECKIN_VALIDATE_QR: '/public/checkins/validate-qr',
    ATTENDEES_SEARCH: '/public/attendees/search',
    CONFERENCES: '/public/conferences'
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000
  },
  
  // Mock data configuration
  MOCK_DATA: {
    ENABLED: process.env.NODE_ENV === 'development',
    FALLBACK_ON_ERROR: true
  }
};

// Mock data for development and fallback
export const MOCK_DATA = {
  CONFERENCES: [
    { id: 1, name: "Hội nghị Công nghệ 2024", date: "2024-01-20", status: "active" as const },
    { id: 2, name: "Hội nghị Khoa học 2024", date: "2024-01-25", status: "active" as const },
    { id: 3, name: "Hội nghị Y tế 2024", date: "2024-02-01", status: "active" as const },
    { id: 4, name: "Hội nghị Giáo dục 2024", date: "2024-02-10", status: "inactive" as const }
  ],
  
  ATTENDEES: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      qrCode: "QR001",
      conferenceId: 1,
      isRegistered: true
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      qrCode: "QR002",
      conferenceId: 1,
      isRegistered: true
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369258147",
      qrCode: "QR003",
      conferenceId: 1,
      isRegistered: false
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0912345678",
      qrCode: "QR004",
      conferenceId: 2,
      isRegistered: true
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      phone: "0987654321",
      qrCode: "QR005",
      conferenceId: 2,
      isRegistered: true
    }
  ],
  
  CHECKIN_RECORDS: [
    {
      id: 1,
      attendeeName: "Nguyễn Văn A",
      attendeeEmail: "nguyenvana@email.com",
      checkInTime: "2024-01-20 09:15:30",
      status: "success",
      qrCode: "QR001",
      conferenceId: 1
    },
    {
      id: 2,
      attendeeName: "Trần Thị B",
      attendeeEmail: "tranthib@email.com",
      checkInTime: "2024-01-20 09:22:15",
      status: "success",
      qrCode: "QR002",
      conferenceId: 1
    },
    {
      id: 3,
      attendeeName: "Lê Văn C",
      attendeeEmail: "levanc@email.com",
      checkInTime: "2024-01-20 09:30:45",
      status: "duplicate",
      qrCode: "QR001",
      conferenceId: 1
    },
    {
      id: 4,
      attendeeName: "Phạm Thị D",
      attendeeEmail: "phamthid@email.com",
      checkInTime: "2024-01-25 08:45:20",
      status: "success",
      qrCode: "QR004",
      conferenceId: 2
    }
  ]
};
