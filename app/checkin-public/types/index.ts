export interface CheckInRecord {
  id: number;
  attendeeName: string | null;
  attendeeEmail: string | null;
  checkInTime: string;
  status: 'success' | 'failed' | 'duplicate';
  qrCode: string | null;
  conferenceId: number;
  method?: 'qr' | 'manual';
  registrationId?: number;
  attendeePhone?: string | null;
  actionType?: 'checkin' | 'checkout'; // Type of action: checkin (entry) or checkout (exit)
}

export interface Attendee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  qrCode: string;
  conferenceId: number;
  isRegistered: boolean;
}

export interface Conference {
  id: number;
  name: string;
  date: string;
  status: 'active' | 'inactive';
}
