"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { apiClient, UserConferenceAssignment } from '@/lib/api';

export interface ConferencePermission {
  conferenceId: number;
  conferenceName: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
}

export function useConferencePermissionsDebug() {
  const [conferencePermissions, setConferencePermissions] = useState<ConferencePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentConferenceId, setCurrentConferenceId] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchConferencePermissions = async () => {
      console.log('🔍 [DEBUG] useConferencePermissions - fetchConferencePermissions called', { 
        isAuthenticated, 
        user: user ? { id: user.id, email: user.email, role: user.role } : null 
      });
      
      setDebugInfo(prev => ({ ...prev, step: 'Starting fetch', timestamp: new Date().toISOString() }));
      
      if (!isAuthenticated || !user) {
        console.log('🔍 [DEBUG] useConferencePermissions - not authenticated or no user, setting empty permissions');
        setConferencePermissions([]);
        setIsLoading(false);
        setDebugInfo(prev => ({ ...prev, step: 'Not authenticated', error: 'No user or not authenticated' }));
        return;
      }

      try {
        console.log('🔍 [DEBUG] useConferencePermissions - starting API call for user:', user.id);
        setIsLoading(true);
        setDebugInfo(prev => ({ ...prev, step: 'Making API call', userId: user.id }));
        
        // Get user's conference assignments
        const response = await apiClient.getMyAssignments();
        
        console.log('🔍 [DEBUG] useConferencePermissions - API response:', response);
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'API response received', 
          responseData: response,
          dataLength: response.data?.length || 0
        }));
        
        // Transform assignments to conference permissions
        const permissions: ConferencePermission[] = response.data.map((assignment: UserConferenceAssignment) => {
          console.log('🔍 [DEBUG] Processing assignment:', assignment);
          return {
            conferenceId: assignment.conferenceId,
            conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
            permissions: typeof assignment.permissions === 'string' 
              ? JSON.parse(assignment.permissions) 
              : assignment.permissions || {},
            isActive: assignment.isActive === 1
          };
        });

        console.log('🔍 [DEBUG] useConferencePermissions - transformed permissions:', permissions);
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Permissions transformed', 
          permissionsCount: permissions.length,
          permissions: permissions
        }));
        
        // Use only data from API, no fallback hardcoded data
        setConferencePermissions(permissions);
        
        // Set first active conference as current if none selected
        if (permissions.length > 0 && !currentConferenceId) {
          const activeConference = permissions.find(p => p.isActive);
          if (activeConference) {
            console.log('🔍 [DEBUG] Setting current conference to active:', activeConference.conferenceId);
            setCurrentConferenceId(activeConference.conferenceId);
          } else if (permissions.length > 0) {
            // If no active conference found, use the first one
            console.log('🔍 [DEBUG] Setting current conference to first:', permissions[0].conferenceId);
            setCurrentConferenceId(permissions[0].conferenceId);
          }
        }
        
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Success', 
          currentConferenceId: currentConferenceId,
          finalPermissions: permissions
        }));
        
      } catch (error) {
        console.error('🔍 [DEBUG] useConferencePermissions - Failed to fetch conference permissions:', error);
        console.log('🔍 [DEBUG] useConferencePermissions - User role:', user.role);
        setDebugInfo(prev => ({ 
          ...prev, 
          step: 'Error', 
          error: error.message,
          errorStack: error.stack
        }));
        
        // No fallback data - show empty state when API fails
        setConferencePermissions([]);
        setCurrentConferenceId(null);
      } finally {
        console.log('🔍 [DEBUG] useConferencePermissions - Setting isLoading to false');
        setIsLoading(false);
        setDebugInfo(prev => ({ ...prev, step: 'Completed', isLoading: false }));
      }
    };

    fetchConferencePermissions();

    // Listen for permission changes
    const handlePermissionChange = () => {
      console.log('🔍 [DEBUG] Permission change event received, refetching...');
      fetchConferencePermissions();
    };

    window.addEventListener('permissions-changed', handlePermissionChange);
    
    return () => {
      window.removeEventListener('permissions-changed', handlePermissionChange);
    };
  }, [user, isAuthenticated, currentConferenceId]);

  // Check if user has permission for current conference
  const hasConferencePermission = (permissionCode: string, conferenceId?: number): boolean => {
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
    return conferencePermissions.some(cp => 
      cp.isActive && cp.permissions[permissionCode] === true
    );
  };

  // Check if user has permission for all active conferences
  const hasAllConferencePermission = (permissionCode: string): boolean => {
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
    console.log('🔍 [DEBUG] getAvailableConferences - conferencePermissions:', conferencePermissions);
    console.log('🔍 [DEBUG] getAvailableConferences - available:', available);
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
    isLoading,
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
    debugInfo, // Add debug info to return
  };
}
