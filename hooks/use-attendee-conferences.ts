import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  attendeesAPI,
  conferencesAPI,
  type Attendee,
  type Registration,
  type Conference,
} from "@/lib/api/attendees-api";

// Helper functions để tính toán trạng thái
function calculateOverallStatus(
  registrations: Registration[]
):
  | "not-registered"
  | "registered"
  | "checked-in"
  | "checked-out"
  | "no-show"
  | "cancelled" {
  if (registrations.length === 0) {
    console.log("📝 No registrations, returning not-registered");
    return "not-registered";
  }

  console.log(`🔍 Processing ${registrations.length} registrations`);

  // Lấy registration mới nhất dựa trên thời gian registration date
  const latestRegistration = registrations.reduce((latest, current) => {
    const latestTime = latest.REGISTRATION_DATE;
    const currentTime = current.REGISTRATION_DATE;

    // Debug logging
    console.log("🔄 Comparing registrations:", {
      latest: {
        id: latest.ID,
        status: latest.STATUS,
        registrationDate: latest.REGISTRATION_DATE,
      },
      current: {
        id: current.ID,
        status: current.STATUS,
        registrationDate: current.REGISTRATION_DATE,
      },
    });

    const latestDate = new Date(latestTime);
    const currentDate = new Date(currentTime);

    console.log("🕐 Date comparison:", {
      latestDate: latestDate.toISOString(),
      currentDate: currentDate.toISOString(),
      isCurrentNewer: currentDate > latestDate,
    });

    return currentDate > latestDate ? current : latest;
  });

  console.log("🔍 Final registration selected:", {
    id: latestRegistration.ID,
    status: latestRegistration.STATUS,
    registrationDate: latestRegistration.REGISTRATION_DATE,
  });

  // Sử dụng trường STATUS từ API để xác định trạng thái
  const status = latestRegistration.STATUS.toLowerCase();

  // Kiểm tra trạng thái theo thứ tự ưu tiên
  // 1. Cancelled - cao nhất
  if (status === "cancelled") {
    console.log("✅ Status: cancelled");
    return "cancelled";
  }

  // 2. No-show
  if (status === "no-show") {
    console.log("✅ Status: no-show");
    return "no-show";
  }

  // 3. Checked-out
  if (status === "checked-out") {
    console.log("✅ Status: checked-out");
    return "checked-out";
  }

  // 4. Checked-in
  if (status === "checked-in") {
    console.log("✅ Status: checked-in");
    return "checked-in";
  }

  // 5. Registered - mặc định
  console.log("✅ Status: registered (default)");
  return "registered";
}

function getLastCheckinTime(registrations: Registration[]): Date | undefined {
  // Tìm registration có status checked-in hoặc checked-out (đã từng checkin)
  const checkinRegistrations = registrations.filter(
    (reg) =>
      reg.STATUS.toLowerCase() === "checked-in" ||
      reg.STATUS.toLowerCase() === "checked-out"
  );

  if (checkinRegistrations.length === 0) {
    return undefined;
  }

  // Sử dụng registration date làm thời gian checkin gần đây nhất
  const checkinTimes = checkinRegistrations
    .map((reg) => {
      const date = new Date(reg.REGISTRATION_DATE);
      console.log(
        `🕐 Using registration date as checkin time: ${
          reg.REGISTRATION_DATE
        } -> ${date.toISOString()}`
      );
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());

  return checkinTimes.length > 0 ? checkinTimes[0] : undefined;
}

function getLastCheckoutTime(registrations: Registration[]): Date | undefined {
  // Tìm registration có status checked-out
  const checkoutRegistrations = registrations.filter(
    (reg) => reg.STATUS.toLowerCase() === "checked-out"
  );

  if (checkoutRegistrations.length === 0) {
    return undefined;
  }

  // Sử dụng registration date làm thời gian checkout gần đây nhất
  const checkoutTimes = checkoutRegistrations
    .map((reg) => {
      const date = new Date(reg.REGISTRATION_DATE);
      console.log(
        `🕐 Using registration date as checkout time: ${
          reg.REGISTRATION_DATE
        } -> ${date.toISOString()}`
      );
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());

  return checkoutTimes.length > 0 ? checkoutTimes[0] : undefined;
}

export interface AttendeeWithConferences extends Attendee {
  conferences: Conference[];
  registrations: Registration[];
  // Trạng thái tổng hợp
  overallStatus:
    | "not-registered"
    | "registered"
    | "checked-in"
    | "checked-out"
    | "no-show"
    | "cancelled";
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

export function useAttendeeConferences(
  options: UseAttendeeConferencesOptions = {}
): UseAttendeeConferencesReturn {
  const {
    page = 1,
    limit = 20,
    filters = {},
    search = "",
    autoFetch = true,
    conferenceId,
  } = options;

  const [attendeesWithConferences, setAttendeesWithConferences] = useState<
    AttendeeWithConferences[]
  >([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache for conference data to avoid repeated API calls
  const conferenceCache = useRef<Map<number, Conference>>(new Map());

  // Memoize the dependency values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [filters.name, filters.email, filters.company, filters.gender]
  );

  const fetchAttendeesWithConferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔄 Fetching attendees with their conferences...",
        conferenceId ? `for conference ${conferenceId}` : "for all conferences"
      );

      // Use the optimized endpoint that fetches everything in one call
      let attendeesResponse;
      try {
        const filters = {
          ...memoizedFilters,
          ...(conferenceId && { conferenceId }),
        };

        attendeesResponse = await attendeesAPI.getAttendeesWithConferences({
          page,
          limit,
          filters,
          search: search || undefined,
          includeConferences: true,
          includeRegistrations: true,
        });
        console.log("✅ Got attendees with conferences:", {
          count: attendeesResponse.data.length,
          total: attendeesResponse.meta.total,
          page: attendeesResponse.meta.page,
          limit: attendeesResponse.meta.limit,
          totalPages: attendeesResponse.meta.totalPages,
          filters,
          search,
          conferenceId,
        });
      } catch (err) {
        console.error("❌ Error fetching attendees with conferences:", err);
        throw new Error(
          `Failed to fetch attendees: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }

      // If no attendees, return early
      if (!attendeesResponse.data || attendeesResponse.data.length === 0) {
        console.log("📝 No attendees found");
        setAttendeesWithConferences([]);
        setPagination({
          page: attendeesResponse.meta.page,
          limit: attendeesResponse.meta.limit,
          total: attendeesResponse.meta.total,
          totalPages: attendeesResponse.meta.totalPages,
        });
        return;
      }

      // Process the data from the optimized endpoint
      const attendees = attendeesResponse.data;
      const attendeesWithConferencesData: AttendeeWithConferences[] = [];

      for (const attendee of attendees) {
        try {
          // The attendee data already includes conferences and registrations from the backend
          const allConferences = attendee.conferences || [];
          const registrations = attendee.registrations || [];

          // Filter conferences to only include those that the attendee actually registered for
          // Get conference IDs from registrations
          const registeredConferenceIds = registrations.map(reg => reg.CONFERENCE_ID);
          
          // Filter conferences to only include registered ones
          const conferences = allConferences.filter(conference => 
            registeredConferenceIds.includes(conference.ID)
          );

          console.log(`🔍 Conference filtering for ${attendee.NAME}:`, {
            allConferences: allConferences.length,
            registrations: registrations.length,
            registeredConferenceIds,
            filteredConferences: conferences.length,
            conferenceNames: conferences.map(c => c.NAME),
            allConferenceNames: allConferences.map(c => c.NAME)
          });

          console.log(
            `📋 Attendee ${attendee.NAME} has ${allConferences.length} total conferences, ${conferences.length} registered conferences, and ${registrations.length} registrations`
          );

          // If conferenceId is specified, filter to only include attendees registered for that conference
          if (conferenceId) {
            const isRegisteredForConference = registrations.some(
              (reg) => reg.CONFERENCE_ID === conferenceId
            );
            if (!isRegisteredForConference) {
              console.log(
                `🚫 Attendee ${attendee.NAME} not registered for conference ${conferenceId}, skipping`
              );
              continue; // Skip this attendee
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
            registrationsCount: registrations.length,
            conferencesCount: conferences.length,
          });

          attendeesWithConferencesData.push({
            ...attendee,
            conferences,
            registrations,
            overallStatus,
            lastCheckinTime,
            lastCheckoutTime,
          });
        } catch (err) {
          console.error(`Error processing attendee ${attendee.ID}:`, err);
          // Add attendee with default values
          attendeesWithConferencesData.push({
            ...attendee,
            conferences: [],
            registrations: [],
            overallStatus: "not-registered" as const,
            lastCheckinTime: undefined,
            lastCheckoutTime: undefined,
          });
        }
      }

      console.log(
        "✅ Processed attendees with conferences:",
        attendeesWithConferencesData.length
      );

      setAttendeesWithConferences(attendeesWithConferencesData);
      setPagination({
        page: attendeesResponse.meta.page,
        limit: attendeesResponse.meta.limit,
        total: attendeesResponse.meta.total,
        totalPages: attendeesResponse.meta.totalPages,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching attendees";
      setError(errorMessage);
      console.error("❌ Error fetching attendees with conferences:", err);

      // Set empty state on error
      setAttendeesWithConferences([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, memoizedFilters, search, conferenceId]);

  useEffect(() => {
    if (autoFetch) {
      fetchAttendeesWithConferences();
    }
  }, [
    page,
    limit,
    search,
    conferenceId,
    autoFetch,
    fetchAttendeesWithConferences,
  ]);

  return {
    attendeesWithConferences,
    isLoading,
    error,
    pagination,
    refetch: fetchAttendeesWithConferences,
  };
}
