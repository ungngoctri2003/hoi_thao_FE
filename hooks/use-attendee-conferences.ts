import { useState, useEffect, useCallback } from 'react';
import { attendeesAPI, conferencesAPI, type Attendee, type Registration, type Conference } from '@/lib/api/attendees-api';

// Helper functions để tính toán trạng thái
function calculateOverallStatus(registrations: Registration[]): 'not-registered' | 'registered' | 'checked-in' | 'checked-out' | 'no-show' | 'cancelled' {
  if (registrations.length === 0) {
    console.log('📝 No registrations, returning not-registered');
    return 'not-registered';
  }

  console.log(`🔍 Processing ${registrations.length} registrations`);

  // Lấy registration mới nhất dựa trên thời gian registration date
  const latestRegistration = registrations.reduce((latest, current) => {
    const latestTime = latest.REGISTRATION_DATE;
    const currentTime = current.REGISTRATION_DATE;
    
    // Debug logging
    console.log('🔄 Comparing registrations:', {
      latest: {
        id: latest.ID,
        status: latest.STATUS,
        registrationDate: latest.REGISTRATION_DATE
      },
      current: {
        id: current.ID,
        status: current.STATUS,
        registrationDate: current.REGISTRATION_DATE
      }
    });
    
    const latestDate = new Date(latestTime);
    const currentDate = new Date(currentTime);
    
    console.log('🕐 Date comparison:', {
      latestDate: latestDate.toISOString(),
      currentDate: currentDate.toISOString(),
      isCurrentNewer: currentDate > latestDate
    });
    
    return currentDate > latestDate ? current : latest;
  });

  console.log('🔍 Final registration selected:', {
    id: latestRegistration.ID,
    status: latestRegistration.STATUS,
    registrationDate: latestRegistration.REGISTRATION_DATE
  });

  // Sử dụng trường STATUS từ API để xác định trạng thái
  const status = latestRegistration.STATUS.toLowerCase();
  
  // Kiểm tra trạng thái theo thứ tự ưu tiên
  // 1. Cancelled - cao nhất
  if (status === 'cancelled') {
    console.log('✅ Status: cancelled');
    return 'cancelled';
  }

  // 2. No-show
  if (status === 'no-show') {
    console.log('✅ Status: no-show');
    return 'no-show';
  }

  // 3. Checked-out
  if (status === 'checked-out') {
    console.log('✅ Status: checked-out');
    return 'checked-out';
  }

  // 4. Checked-in
  if (status === 'checked-in') {
    console.log('✅ Status: checked-in');
    return 'checked-in';
  }

  // 5. Registered - mặc định
  console.log('✅ Status: registered (default)');
  return 'registered';
}

function getLastCheckinTime(registrations: Registration[]): Date | undefined {
  // Tìm registration có status checked-in hoặc checked-out (đã từng checkin)
  const checkinRegistrations = registrations.filter(reg => 
    reg.STATUS.toLowerCase() === 'checked-in' || reg.STATUS.toLowerCase() === 'checked-out'
  );
  
  if (checkinRegistrations.length === 0) {
    return undefined;
  }
  
  // Sử dụng registration date làm thời gian checkin gần đây nhất
  const checkinTimes = checkinRegistrations
    .map(reg => {
      const date = new Date(reg.REGISTRATION_DATE);
      console.log(`🕐 Using registration date as checkin time: ${reg.REGISTRATION_DATE} -> ${date.toISOString()}`);
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());
  
  return checkinTimes.length > 0 ? checkinTimes[0] : undefined;
}

function getLastCheckoutTime(registrations: Registration[]): Date | undefined {
  // Tìm registration có status checked-out
  const checkoutRegistrations = registrations.filter(reg => 
    reg.STATUS.toLowerCase() === 'checked-out'
  );
  
  if (checkoutRegistrations.length === 0) {
    return undefined;
  }
  
  // Sử dụng registration date làm thời gian checkout gần đây nhất
  const checkoutTimes = checkoutRegistrations
    .map(reg => {
      const date = new Date(reg.REGISTRATION_DATE);
      console.log(`🕐 Using registration date as checkout time: ${reg.REGISTRATION_DATE} -> ${date.toISOString()}`);
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());
  
  return checkoutTimes.length > 0 ? checkoutTimes[0] : undefined;
}

export interface AttendeeWithConferences extends Attendee {
  conferences: Conference[];
  registrations: Registration[];
  // Trạng thái tổng hợp
  overallStatus: 'not-registered' | 'registered' | 'checked-in' | 'checked-out' | 'no-show' | 'cancelled';
  lastCheckinTime?: Date;
  lastCheckoutTime?: Date;
}

export interface UseAttendeeConferencesOptions {
  page?: number;
  limit?: number;
  filters?: {
    email?: string;
    name?: string;
    company?: string;
    gender?: string;
  };
  search?: string;
  autoFetch?: boolean;
  conferenceId?: number; // Add conferenceId filter
}

export interface UseAttendeeConferencesReturn {
  attendeesWithConferences: AttendeeWithConferences[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => Promise<void>;
}

export function useAttendeeConferences(options: UseAttendeeConferencesOptions = {}): UseAttendeeConferencesReturn {
  const {
    page = 1,
    limit = 20,
    filters = {},
    search = '',
    autoFetch = true,
    conferenceId
  } = options;

  const [attendeesWithConferences, setAttendeesWithConferences] = useState<AttendeeWithConferences[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendeesWithConferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Fetching attendees with their conferences...', conferenceId ? `for conference ${conferenceId}` : 'for all conferences');

      // Get attendees list
      const attendeesResponse = await attendeesAPI.getAttendees({
        page,
        limit,
        filters,
        search: search || undefined
      });

      console.log('✅ Got attendees:', attendeesResponse.data.length);

      // For each attendee, get their registrations and associated conferences
      const attendeesWithConferencesData: (AttendeeWithConferences | null)[] = await Promise.all(
        attendeesResponse.data.map(async (attendee) => {
          try {
            // Get attendee's registrations
            const registrationsResponse = await attendeesAPI.getAttendeeRegistrations(attendee.ID);
            const registrations = registrationsResponse.data;

            console.log(`📋 Attendee ${attendee.NAME} has ${registrations.length} registrations`);
            console.log(`📋 Raw registrations data:`, registrations);
            
            // Debug: Check registration statuses
            const statuses = registrations.map(reg => reg.STATUS);
            const hasCheckedIn = registrations.some(reg => reg.STATUS.toLowerCase() === 'checked-in');
            const hasCheckedOut = registrations.some(reg => reg.STATUS.toLowerCase() === 'checked-out');
            console.log(`🔍 Registration analysis for ${attendee.NAME}:`, {
              statuses,
              hasCheckedIn,
              hasCheckedOut,
              registrations: registrations.map(reg => ({
                id: reg.ID,
                status: reg.STATUS,
                registrationDate: reg.REGISTRATION_DATE
              }))
            });

            // Get conference details for each registration
            const conferences: Conference[] = [];
            for (const registration of registrations) {
              try {
                const conferenceResponse = await conferencesAPI.getConferenceById(registration.CONFERENCE_ID);
                conferences.push(conferenceResponse.data);
              } catch (err) {
                console.error(`Error fetching conference ${registration.CONFERENCE_ID}:`, err);
              }
            }

            // If conferenceId is specified, filter to only include attendees registered for that conference
            if (conferenceId) {
              const isRegisteredForConference = registrations.some(reg => reg.CONFERENCE_ID === conferenceId);
              if (!isRegisteredForConference) {
                console.log(`🚫 Attendee ${attendee.NAME} not registered for conference ${conferenceId}, skipping`);
                return null; // Skip this attendee
              }
            }

            // Tính toán trạng thái tổng hợp
            const overallStatus = calculateOverallStatus(registrations);
            const lastCheckinTime = getLastCheckinTime(registrations);
            const lastCheckoutTime = getLastCheckoutTime(registrations);

            console.log(`🎯 Final status calculation for ${attendee.NAME}:`, {
              overallStatus,
              lastCheckinTime,
              lastCheckoutTime,
              registrationsCount: registrations.length
            });

            return {
              ...attendee,
              conferences,
              registrations,
              overallStatus,
              lastCheckinTime,
              lastCheckoutTime
            };
          } catch (err) {
            console.error(`Error fetching registrations for attendee ${attendee.ID}:`, err);
            return {
              ...attendee,
              conferences: [],
              registrations: [],
              overallStatus: 'not-registered' as const,
              lastCheckinTime: undefined,
              lastCheckoutTime: undefined
            };
          }
        })
      );

      // Filter out null values (attendees not registered for the specific conference)
      const filteredData = attendeesWithConferencesData.filter((attendee): attendee is AttendeeWithConferences => attendee !== null);
      console.log('✅ Processed attendees with conferences:', filteredData.length);

      setAttendeesWithConferences(filteredData);
      setPagination({
        page: attendeesResponse.meta.page,
        limit: attendeesResponse.meta.limit,
        total: attendeesResponse.meta.total,
        totalPages: attendeesResponse.meta.totalPages
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching attendees with conferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, JSON.stringify(filters), search, conferenceId]);

  useEffect(() => {
    if (autoFetch) {
      fetchAttendeesWithConferences();
    }
  }, [fetchAttendeesWithConferences, autoFetch]);

  return {
    attendeesWithConferences,
    isLoading,
    error,
    pagination,
    refetch: fetchAttendeesWithConferences
  };
}
