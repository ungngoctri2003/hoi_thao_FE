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

      // Get attendees list with better error handling
      let attendeesResponse;
      try {
        attendeesResponse = await attendeesAPI.getAttendees({
          page,
          limit,
          filters: memoizedFilters,
          search: search || undefined,
        });
        console.log("✅ Got attendees:", attendeesResponse.data.length);
      } catch (err) {
        console.error("❌ Error fetching attendees:", err);
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

      // Process attendees in smaller batches to avoid overwhelming the API
      const batchSize = 3; // Reduced batch size to avoid overwhelming server
      const attendees = attendeesResponse.data;
      const attendeesWithConferencesData: (AttendeeWithConferences | null)[] =
        [];

      for (let i = 0; i < attendees.length; i += batchSize) {
        const batch = attendees.slice(i, i + batchSize);
        console.log(
          `🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            attendees.length / batchSize
          )}`
        );

        const batchResults = await Promise.allSettled(
          batch.map(async (attendee) => {
            try {
              // Get attendee's registrations with timeout
              const registrationsResponse = (await Promise.race([
                attendeesAPI.getAttendeeRegistrations(attendee.ID),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Registration fetch timeout")),
                    10000
                  )
                ),
              ])) as { data: Registration[] };

              const registrations = registrationsResponse.data || [];

              console.log(
                `📋 Attendee ${attendee.NAME} has ${registrations.length} registrations`
              );

              // Get conference details for each registration (with error handling and caching)
              const conferences: Conference[] = [];
              if (registrations.length > 0) {
                const conferencePromises = registrations.map(
                  async (registration) => {
                    try {
                      // Check cache first
                      const cachedConference = conferenceCache.current.get(
                        registration.CONFERENCE_ID
                      );
                      if (cachedConference) {
                        console.log(
                          `📦 Using cached conference ${registration.CONFERENCE_ID}`
                        );
                        return cachedConference;
                      }

                      // Retry logic for conference fetching
                      let lastError;
                      for (let retry = 0; retry < 3; retry++) {
                        try {
                          const conferenceResponse = (await Promise.race([
                            conferencesAPI.getConferenceById(
                              registration.CONFERENCE_ID
                            ),
                            new Promise((_, reject) =>
                              setTimeout(
                                () =>
                                  reject(new Error("Conference fetch timeout")),
                                15000 // Increased timeout to 15 seconds
                              )
                            ),
                          ])) as { data: Conference };

                          // Cache the conference data
                          conferenceCache.current.set(
                            registration.CONFERENCE_ID,
                            conferenceResponse.data
                          );
                          return conferenceResponse.data;
                        } catch (err) {
                          lastError = err;
                          console.warn(
                            `⚠️ Conference fetch attempt ${
                              retry + 1
                            }/3 failed for ${registration.CONFERENCE_ID}:`,
                            err
                          );
                          if (retry < 2) {
                            // Wait before retry
                            await new Promise((resolve) =>
                              setTimeout(resolve, 2000)
                            );
                          }
                        }
                      }

                      // All retries failed
                      console.error(
                        `❌ All retries failed for conference ${registration.CONFERENCE_ID}:`,
                        lastError
                      );
                      return null;
                    } catch (err) {
                      console.error(
                        `Error fetching conference ${registration.CONFERENCE_ID}:`,
                        err
                      );
                      return null;
                    }
                  }
                );

                const conferenceResults = await Promise.allSettled(
                  conferencePromises
                );
                conferences.push(
                  ...conferenceResults
                    .filter(
                      (result): result is PromiseFulfilledResult<Conference> =>
                        result.status === "fulfilled" && result.value !== null
                    )
                    .map((result) => result.value)
                );
              }

              // If conferenceId is specified, filter to only include attendees registered for that conference
              if (conferenceId) {
                const isRegisteredForConference = registrations.some(
                  (reg) => reg.CONFERENCE_ID === conferenceId
                );
                if (!isRegisteredForConference) {
                  console.log(
                    `🚫 Attendee ${attendee.NAME} not registered for conference ${conferenceId}, skipping`
                  );
                  return null; // Skip this attendee
                }
              }

              // If no conferences were fetched successfully, create a fallback conference object
              if (conferences.length === 0 && registrations.length > 0) {
                console.log(
                  `⚠️ No conference data for attendee ${attendee.NAME}, creating fallback`
                );
                conferences.push({
                  ID: registrations[0].CONFERENCE_ID,
                  NAME: `Conference ${registrations[0].CONFERENCE_ID}`,
                  DESCRIPTION: "Conference details not available",
                  START_DATE: new Date(),
                  END_DATE: new Date(),
                  STATUS: "unknown",
                  VENUE: "Unknown",
                  CREATED_AT: new Date(),
                });
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
              });

              return {
                ...attendee,
                conferences,
                registrations,
                overallStatus,
                lastCheckinTime,
                lastCheckoutTime,
              };
            } catch (err) {
              console.error(`Error processing attendee ${attendee.ID}:`, err);
              return {
                ...attendee,
                conferences: [],
                registrations: [],
                overallStatus: "not-registered" as const,
                lastCheckinTime: undefined,
                lastCheckoutTime: undefined,
              };
            }
          })
        );

        // Process batch results
        batchResults.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value !== null) {
            attendeesWithConferencesData.push(result.value);
          } else if (result.status === "rejected") {
            console.error(`Batch item ${i + index} failed:`, result.reason);
            // Add attendee with default values
            const attendee = batch[index];
            attendeesWithConferencesData.push({
              ...attendee,
              conferences: [],
              registrations: [],
              overallStatus: "not-registered" as const,
              lastCheckinTime: undefined,
              lastCheckoutTime: undefined,
            });
          }
        });

        // Add delay between batches to avoid overwhelming the server
        if (i + batchSize < attendees.length) {
          console.log("⏳ Waiting before next batch...");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      // Filter out null values (attendees not registered for the specific conference)
      const filteredData = attendeesWithConferencesData.filter(
        (attendee): attendee is AttendeeWithConferences => attendee !== null
      );
      console.log(
        "✅ Processed attendees with conferences:",
        filteredData.length
      );

      setAttendeesWithConferences(filteredData);
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
