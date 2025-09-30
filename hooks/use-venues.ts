import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface VenueFloor {
  id: number;
  name: string;
  description?: string;
  conferenceId?: number;
  conferenceName?: string;
}

export interface VenueRoom {
  id: number;
  floorId: number;
  name: string;
  capacity: number;
  description?: string;
  roomType?: string;
  features: string[];
  status: 'available' | 'occupied' | 'maintenance';
  floorName?: string;
  conferenceId?: number;
  conferenceName?: string;
}

export interface VenueAmenity {
  name: string;
  icon: string;
  location: string;
  description: string;
}

export interface UseVenuesReturn {
  floors: VenueFloor[];
  rooms: VenueRoom[];
  amenities: VenueAmenity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVenues(conferenceId?: number, useMockData: boolean = false): UseVenuesReturn {
  const [floors, setFloors] = useState<VenueFloor[]>([]);
  const [rooms, setRooms] = useState<VenueRoom[]>([]);
  const [amenities, setAmenities] = useState<VenueAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (conferenceId) {
        queryParams.append("conferenceId", conferenceId.toString());
      }
      if (useMockData) {
        queryParams.append("mock", "true");
      }

      // Fetch venue data from our API route
      const response = await fetch(`/api/venue/public${queryParams.toString() ? `?${queryParams.toString()}` : ""}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch venue data');
      }

      const { floors, rooms, amenities } = result.data;

      setFloors(floors || []);
      setRooms(rooms || []);
      setAmenities(amenities || []);

      // Log if using mock data
      if (result.error && result.error.includes('mock data')) {
        console.log('Using mock venue data - backend unavailable');
      }

    } catch (err) {
      console.error('Error fetching venue data:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu địa điểm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenueData();
  }, [conferenceId]);

  return {
    floors,
    rooms,
    amenities,
    loading,
    error,
    refetch: fetchVenueData,
  };
}
