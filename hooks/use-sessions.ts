import { useState, useEffect, useMemo } from 'react';
import { apiClient, SessionInfo } from '@/lib/api';

export interface UseSessionsParams {
  conferenceId?: number;
  status?: string;
  search?: string;
  track?: string;
}

export interface UseSessionsReturn {
  sessions: SessionInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSessions(params: UseSessionsParams = {}): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use public sessions endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/sessions?${new URLSearchParams({
        ...(params.conferenceId && { conferenceId: params.conferenceId.toString() }),
        ...(params.status && { status: params.status }),
      })}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      let sessions = data.data || [];

      // Map backend fields to frontend format
      const mappedSessions: SessionInfo[] = sessions.map((session: any) => ({
        id: session.ID ?? session.id,
        conferenceId: session.CONFERENCE_ID ?? session.conferenceId,
        name: session.TITLE ?? session.name,
        description: session.DESCRIPTION ?? session.description,
        startTime: session.START_TIME ?? session.startTime,
        endTime: session.END_TIME ?? session.endTime,
        location: session.LOCATION ?? session.location,
        roomId: session.ROOM_ID ?? session.roomId,
        roomName: session.ROOM_NAME ?? session.roomName,
        speaker: session.SPEAKER ?? session.speaker,
        status: session.STATUS ?? session.status,
        createdAt: session.CREATED_AT ?? session.createdAt,
      }));

      setSessions(mappedSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [params.conferenceId, params.status, params.track]);

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
  };
}

// Hook for getting sessions grouped by day
export function useSessionsByDay(params: UseSessionsParams = {}) {
  const { sessions, loading, error, refetch } = useSessions(params);
  
  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(params.search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(params.search);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [params.search]);
  
  // Apply client-side filters
  let filteredSessions = sessions;
  
  if (params.status) {
    filteredSessions = filteredSessions.filter(session => 
      session.status?.toLowerCase() === params.status?.toLowerCase()
    );
  }

  if (debouncedSearch) {
    const searchTerm = debouncedSearch.toLowerCase();
    filteredSessions = filteredSessions.filter(session =>
      session.name?.toLowerCase().includes(searchTerm) ||
      session.speaker?.toLowerCase().includes(searchTerm) ||
      session.description?.toLowerCase().includes(searchTerm)
    );
  }
  
  const sessionsByDay = filteredSessions.reduce((acc, session) => {
    if (!session.startTime) return acc;
    
    const sessionDate = new Date(session.startTime);
    const dateKey = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: sessionDate,
        sessions: []
      };
    }
    
    acc[dateKey].sessions.push(session);
    return acc;
  }, {} as Record<string, { date: Date; sessions: SessionInfo[] }>);

  // Convert to array and sort by date
  const days = Object.entries(sessionsByDay)
    .map(([dateKey, data]) => ({
      id: dateKey,
      date: data.date,
      sessions: data.sessions.sort((a, b) => 
        new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()
      )
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    days,
    sessions: filteredSessions,
    loading,
    error,
    refetch,
  };
}
