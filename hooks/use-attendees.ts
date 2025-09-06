import { useState, useEffect, useCallback, useMemo } from 'react';
import { attendeesAPI, conferencesAPI, registrationsAPI, type Attendee, type AttendeeWithRegistration, type AttendeeListParams, type Conference, type Registration } from '@/lib/api/attendees-api';
import { useDebouncedApi } from './use-debounced-api';

export interface UseAttendeesOptions {
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
}

export interface UseAttendeesReturn {
  attendees: Attendee[];
  conferences: Conference[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => Promise<void>;
  searchAttendees: (query: string) => Promise<Attendee[]>;
  createAttendee: (data: Omit<Attendee, 'ID' | 'CREATED_AT'>) => Promise<Attendee>;
  updateAttendee: (id: number, data: Partial<Omit<Attendee, 'ID' | 'CREATED_AT'>>) => Promise<Attendee>;
  deleteAttendee: (id: number) => Promise<void>;
  getAttendeeById: (id: number) => Promise<Attendee>;
  getAttendeeRegistrations: (id: number) => Promise<Registration[]>;
}

export function useAttendees(options: UseAttendeesOptions = {}): UseAttendeesReturn {
  const {
    page = 1,
    limit = 20,
    filters = {},
    search = '',
    autoFetch = true
  } = options;

  const currentPage = page;
  const pageSize = limit;

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const debouncedApi = useDebouncedApi({
    debounceMs: 800 // Increased debounce time to reduce API calls
  });

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (!autoFetch) return;

    const fetchData = async () => {
      const params: AttendeeListParams = {
        page,
        limit,
        filters,
        search: search || undefined
      };

      console.log('🔄 Fetching attendees with params:', params);

      await debouncedApi.executeWithDebounce(async () => {
        console.log('📡 Making API calls for attendees and conferences');
        const [attendeesResponse, conferencesResponse] = await Promise.all([
          attendeesAPI.getAttendees(params),
          conferencesAPI.getConferences()
        ]);

        console.log('✅ API calls completed, updating state');
        setAttendees(attendeesResponse.data);
        setConferences(conferencesResponse.data);
        setPagination({
          page: attendeesResponse.meta.page,
          limit: attendeesResponse.meta.limit,
          total: attendeesResponse.meta.total,
          totalPages: attendeesResponse.meta.totalPages
        });
      });
    };

    fetchData();
  }, [page, limit, JSON.stringify(filters), search, autoFetch, debouncedApi.executeWithDebounce]);

  const fetchAttendees = useCallback(async (): Promise<void> => {
    const params: AttendeeListParams = {
      page,
      limit,
      filters,
      search: search || undefined
    };

    console.log('🔄 Manual fetch attendees with params:', params);

    await debouncedApi.executeWithDebounce(async () => {
      console.log('📡 Making API calls for attendees and conferences');
      const [attendeesResponse, conferencesResponse] = await Promise.all([
        attendeesAPI.getAttendees(params),
        conferencesAPI.getConferences()
      ]);

      console.log('✅ API calls completed, updating state');
      setAttendees(attendeesResponse.data);
      setConferences(conferencesResponse.data);
      setPagination({
        page: attendeesResponse.meta.page,
        limit: attendeesResponse.meta.limit,
        total: attendeesResponse.meta.total,
        totalPages: attendeesResponse.meta.totalPages
      });
    });
  }, [page, limit, JSON.stringify(filters), search, debouncedApi.executeWithDebounce]);

  const searchAttendees = useCallback(async (query: string): Promise<Attendee[]> => {
    try {
      const response = await attendeesAPI.searchAttendees(query);
      return response.data;
    } catch (err) {
      console.error('Error searching attendees:', err);
      throw err;
    }
  }, []);

  const createAttendee = useCallback(async (data: Omit<Attendee, 'ID' | 'CREATED_AT'>): Promise<Attendee> => {
    try {
      const response = await attendeesAPI.createAttendee(data);
      // Add the new attendee to the current list if we're on the first page
      if (currentPage === 1) {
        setAttendees(prev => [response.data, ...prev]);
        setPagination(prev => ({
          ...prev,
          total: prev.total + 1
        }));
      }
      return response.data;
    } catch (err) {
      console.error('Error creating attendee:', err);
      throw err;
    }
  }, [currentPage]);

  const updateAttendee = useCallback(async (id: number, data: Partial<Omit<Attendee, 'ID' | 'CREATED_AT'>>): Promise<Attendee> => {
    try {
      const response = await attendeesAPI.updateAttendee(id, data);
      // Update the attendee in the current list instead of refetching
      setAttendees(prev => prev.map(attendee => 
        attendee.ID === id ? { ...attendee, ...response.data } : attendee
      ));
      return response.data;
    } catch (err) {
      console.error('Error updating attendee:', err);
      throw err;
    }
  }, []);

  const deleteAttendee = useCallback(async (id: number): Promise<void> => {
    try {
      await attendeesAPI.deleteAttendee(id);
      // Remove the attendee from the current list instead of refetching
      setAttendees(prev => prev.filter(attendee => attendee.ID !== id));
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('Error deleting attendee:', err);
      throw err;
    }
  }, []);

  const getAttendeeById = useCallback(async (id: number): Promise<Attendee> => {
    try {
      const response = await attendeesAPI.getAttendeeById(id);
      return response.data;
    } catch (err) {
      console.error('Error fetching attendee by ID:', err);
      throw err;
    }
  }, []);

  const getAttendeeRegistrations = useCallback(async (id: number): Promise<Registration[]> => {
    try {
      const response = await attendeesAPI.getAttendeeRegistrations(id);
      return response.data;
    } catch (err) {
      console.error('Error fetching attendee registrations:', err);
      throw err;
    }
  }, []);

  return {
    attendees,
    conferences,
    isLoading: debouncedApi.isLoading,
    error: debouncedApi.error,
    pagination,
    refetch: fetchAttendees,
    searchAttendees,
    createAttendee,
    updateAttendee,
    deleteAttendee,
    getAttendeeById,
    getAttendeeRegistrations
  };
}

// Hook for attendee details
export function useAttendeeDetails(id: number | null) {
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendeeDetails = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [attendeeResponse, registrationsResponse] = await Promise.all([
        attendeesAPI.getAttendeeById(id),
        attendeesAPI.getAttendeeRegistrations(id)
      ]);

      setAttendee(attendeeResponse.data);
      setRegistrations(registrationsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching attendee details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAttendeeDetails();
  }, [fetchAttendeeDetails]);

  return {
    attendee,
    registrations,
    isLoading,
    error,
    refetch: fetchAttendeeDetails
  };
}

// Hook for conferences
export function useConferences() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConferences = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await conferencesAPI.getConferences();
      setConferences(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching conferences:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  return {
    conferences,
    isLoading,
    error,
    refetch: fetchConferences
  };
}
