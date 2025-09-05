"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { useConferenceId } from './use-conference-id';
import { apiClient, UserConferenceAssignment } from '@/lib/api';

export interface ConferencePermission {
  conferenceId: number;
  conferenceName: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export function useConferencePermissions() {
  const [conferencePermissions, setConferencePermissions] = useState<ConferencePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConferenceId, setCurrentConferenceId] = useState<number | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { conferenceId: urlConferenceId, isLoading: urlConferenceIdLoading } = useConferenceId();

  useEffect(() => {
    const fetchConferencePermissions = async () => {
      console.log('useConferencePermissions - fetchConferencePermissions called', { isAuthenticated, user, authLoading });
      
      // Wait for auth to finish loading
      if (authLoading) {
        console.log('useConferencePermissions - auth still loading, waiting...');
        return;
      }
      
      if (!isAuthenticated || !user) {
        console.log('useConferencePermissions - not authenticated or no user, setting empty permissions');
        setConferencePermissions([]);
        setCurrentConferenceId(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('useConferencePermissions - starting API call for user:', user.id);
        setIsLoading(true);
        // Get user's conference assignments
        const response = await apiClient.getMyAssignments();
        
        // Transform assignments to conference permissions
        console.log('useConferencePermissions - response.data:', response.data);
        const permissions: ConferencePermission[] = response.data.map((assignment: UserConferenceAssignment) => ({
          conferenceId: assignment.conferenceId,
          conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
          permissions: typeof assignment.permissions === 'string' 
            ? JSON.parse(assignment.permissions) 
            : assignment.permissions || {},
          isActive: assignment.isActive === 1
        }));

        console.log('useConferencePermissions - permissions:', permissions);
        
        // Use only data from API, no fallback hardcoded data
        setConferencePermissions(permissions);
        
        // Set current conference ID
        console.log('🔍 [DEBUG] useConferencePermissions - urlConferenceId:', urlConferenceId);
        console.log('🔍 [DEBUG] useConferencePermissions - permissions:', permissions.map(p => ({ id: p.conferenceId, name: p.conferenceName, active: p.isActive })));
        
        if (urlConferenceId && permissions.some(p => p.conferenceId === urlConferenceId && p.isActive)) {
          // Use conference ID from URL if user has access to it
          console.log('🔍 [DEBUG] useConferencePermissions - using URL conferenceId:', urlConferenceId);
          setCurrentConferenceId(urlConferenceId);
        } else if (permissions.length > 0) {
          // Set first active conference as current if none selected
          const activeConference = permissions.find(p => p.isActive);
          if (activeConference) {
            console.log('🔍 [DEBUG] useConferencePermissions - using first active conference:', activeConference.conferenceId);
            setCurrentConferenceId(activeConference.conferenceId);
          } else if (permissions.length > 0) {
            // If no active conference found, use the first one
            console.log('🔍 [DEBUG] useConferencePermissions - using first conference:', permissions[0].conferenceId);
            setCurrentConferenceId(permissions[0].conferenceId);
          }
        } else {
          // No permissions available, clear current conference
          console.log('🔍 [DEBUG] useConferencePermissions - no permissions available, clearing currentConferenceId');
          setCurrentConferenceId(null);
        }
      } catch (error) {
        console.error('useConferencePermissions - Failed to fetch conference permissions:', error);
        console.log('useConferencePermissions - User role:', user.role);
        // No fallback data - show empty state when API fails
        setConferencePermissions([]);
        setCurrentConferenceId(null);
      } finally {
        console.log('useConferencePermissions - Setting isLoading to false');
        setIsLoading(false);
      }
    };

    // Fetch permissions when dependencies change
    fetchConferencePermissions();

    // Listen for permission changes
    const handlePermissionChange = () => {
      fetchConferencePermissions();
    };

    window.addEventListener('permissions-changed', handlePermissionChange);
    
    return () => {
      window.removeEventListener('permissions-changed', handlePermissionChange);
    };
  }, [user, isAuthenticated, authLoading]); // Add authLoading to dependencies

  // Separate effect to handle conferenceId changes
  useEffect(() => {
    if (urlConferenceId && conferencePermissions.length > 0) {
      const hasAccess = conferencePermissions.some(p => p.conferenceId === urlConferenceId && p.isActive);
      if (hasAccess) {
        console.log('🔍 [DEBUG] useConferencePermissions - updating currentConferenceId to URL conferenceId:', urlConferenceId);
        setCurrentConferenceId(urlConferenceId);
      }
    }
  }, [urlConferenceId, conferencePermissions]);

  // Check if user has permission for current conference
  const hasConferencePermission = (permissionCode: string, conferenceId?: number): boolean => {
    // If auth is still loading, return false to prevent premature redirects
    if (authLoading || isLoading) return false;
    
    const targetConferenceId = conferenceId || currentConferenceId;
    
    if (!targetConferenceId) return false;

    const conferencePermission = conferencePermissions.find(
      cp => cp.conferenceId === targetConferenceId && cp.isActive
    );

    if (!conferencePermission) return false;

    return conferencePermission.permissions[permissionCode] === true;
  };

  // Check if user has permission for any conference
  const hasAnyConferencePermission = (permissionCode: string): boolean => {
    // If auth is still loading, return false to prevent premature redirects
    if (authLoading || isLoading) return false;
    
    return conferencePermissions.some(cp => 
      cp.isActive && cp.permissions[permissionCode] === true
    );
  };

  // Check if user has permission for all active conferences
  const hasAllConferencePermission = (permissionCode: string): boolean => {
    // If auth is still loading, return false to prevent premature redirects
    if (authLoading || isLoading) return false;
    
    const activeConferences = conferencePermissions.filter(cp => cp.isActive);
    if (activeConferences.length === 0) return false;

    return activeConferences.every(cp => cp.permissions[permissionCode] === true);
  };

  // Get all permissions for current conference
  const getCurrentConferencePermissions = (): Record<string, boolean> => {
    if (!currentConferenceId) return {};

    const conferencePermission = conferencePermissions.find(
      cp => cp.conferenceId === currentConferenceId && cp.isActive
    );

    return conferencePermission?.permissions || {};
  };

  // Get all permissions for specific conference
  const getConferencePermissions = (conferenceId: number): Record<string, boolean> => {
    const conferencePermission = conferencePermissions.find(
      cp => cp.conferenceId === conferenceId && cp.isActive
    );

    return conferencePermission?.permissions || {};
  };

  // Get available conferences for user
  const getAvailableConferences = (): ConferencePermission[] => {
    const available = conferencePermissions.filter(cp => cp.isActive);
    console.log('getAvailableConferences - conferencePermissions:', conferencePermissions);
    console.log('getAvailableConferences - available:', available);
    return available;
  };

  // Check if user has access to specific conference
  const hasConferenceAccess = (conferenceId: number): boolean => {
    return conferencePermissions.some(cp => 
      cp.conferenceId === conferenceId && cp.isActive
    );
  };

  // Get conference name by ID
  const getConferenceName = (conferenceId: number): string => {
    const conference = conferencePermissions.find(cp => cp.conferenceId === conferenceId);
    return conference?.conferenceName || `Hội nghị #${conferenceId}`;
  };

  // Switch to different conference
  const switchConference = (conferenceId: number) => {
    if (hasConferenceAccess(conferenceId)) {
      setCurrentConferenceId(conferenceId);
    }
  };

  // Refresh permissions
  const refreshPermissions = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.getMyAssignments();
      
      const permissions: ConferencePermission[] = response.data.map((assignment: UserConferenceAssignment) => ({
        conferenceId: assignment.conferenceId,
        conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
        permissions: typeof assignment.permissions === 'string' 
          ? JSON.parse(assignment.permissions) 
          : assignment.permissions || {},
        isActive: assignment.isActive === 1
      }));

      setConferencePermissions(permissions);
    } catch (error) {
      console.error('Failed to refresh conference permissions:', error);
    }
  };

  return {
    conferencePermissions,
    currentConferenceId,
    isLoading: isLoading || authLoading,
    hasConferencePermission,
    hasAnyConferencePermission,
    hasAllConferencePermission,
    getCurrentConferencePermissions,
    getConferencePermissions,
    getAvailableConferences,
    hasConferenceAccess,
    getConferenceName,
    switchConference,
    refreshPermissions,
  };
}
