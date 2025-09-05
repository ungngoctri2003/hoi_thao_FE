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
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }
      
      if (!isAuthenticated || !user) {
        setConferencePermissions([]);
        setCurrentConferenceId(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // For admin users, get all conferences and give them all permissions
        if (user.role === 'admin') {
          const conferencesResponse = await apiClient.getConferences({ page: 1, limit: 1000 });
          
          // Transform all conferences to conference permissions with full admin permissions
          const permissions: ConferencePermission[] = conferencesResponse.data.map((conference) => ({
            conferenceId: conference.id,
            conferenceName: conference.name,
            permissions: {
              'conferences.view': true,
              'conferences.create': true,
              'conferences.update': true,
              'conferences.delete': true,
              'conferences.manage': true,
              'attendees.view': true,
              'attendees.manage': true,
              'checkin.manage': true,
              'sessions.view': true,
              'sessions.manage': true,
              'analytics.view': true,
              'networking.view': true,
              'venue.view': true,
              'badges.view': true,
              'mobile.view': true
            },
            isActive: true
          }));
          
          setConferencePermissions(permissions);
          
          // Set current conference ID
          if (urlConferenceId && permissions.some(p => p.conferenceId === urlConferenceId)) {
            setCurrentConferenceId(urlConferenceId);
          } else if (permissions.length > 0) {
            setCurrentConferenceId(permissions[0].conferenceId);
          } else {
            setCurrentConferenceId(null);
          }
        } else {
          // For staff and attendees, get their conference assignments
          const response = await apiClient.getMyAssignments();
          
          // Transform assignments to conference permissions
          const permissions: ConferencePermission[] = response.data.map((assignment: UserConferenceAssignment) => ({
            conferenceId: assignment.conferenceId,
            conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
            permissions: typeof assignment.permissions === 'string' 
              ? JSON.parse(assignment.permissions) 
              : assignment.permissions || {},
            isActive: assignment.isActive === 1
          }));
          
          setConferencePermissions(permissions);
          
          // Set current conference ID
          if (urlConferenceId && permissions.some(p => p.conferenceId === urlConferenceId && p.isActive)) {
            setCurrentConferenceId(urlConferenceId);
          } else if (permissions.length > 0) {
            const activeConference = permissions.find(p => p.isActive);
            if (activeConference) {
              setCurrentConferenceId(activeConference.conferenceId);
            } else if (permissions.length > 0) {
              setCurrentConferenceId(permissions[0].conferenceId);
            }
          } else {
            setCurrentConferenceId(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch conference permissions:', error);
        setConferencePermissions([]);
        setCurrentConferenceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch permissions when dependencies change
    fetchConferencePermissions();

    // Listen for permission changes
    const handlePermissionChange = () => {
      fetchConferencePermissions();
    };

    // Listen for conference updates
    const handleConferenceUpdate = () => {
      fetchConferencePermissions();
    };

    window.addEventListener('permissions-changed', handlePermissionChange);
    window.addEventListener('conferences-updated', handleConferenceUpdate);
    
    return () => {
      window.removeEventListener('permissions-changed', handlePermissionChange);
      window.removeEventListener('conferences-updated', handleConferenceUpdate);
    };
  }, [user, isAuthenticated, authLoading]); // Add authLoading to dependencies

  // Separate effect to handle conferenceId changes
  useEffect(() => {
    if (urlConferenceId && conferencePermissions.length > 0) {
      const hasAccess = conferencePermissions.some(p => p.conferenceId === urlConferenceId && p.isActive);
      if (hasAccess) {
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
      // For admin users, get all conferences and give them all permissions
      if (user.role === 'admin') {
        const conferencesResponse = await apiClient.getConferences({ page: 1, limit: 1000 });
        
        const permissions: ConferencePermission[] = conferencesResponse.data.map((conference) => ({
          conferenceId: conference.id,
          conferenceName: conference.name,
          permissions: {
            'conferences.view': true,
            'conferences.create': true,
            'conferences.update': true,
            'conferences.delete': true,
            'conferences.manage': true,
            'attendees.view': true,
            'attendees.manage': true,
            'checkin.manage': true,
            'sessions.view': true,
            'sessions.manage': true,
            'analytics.view': true,
            'networking.view': true,
            'venue.view': true,
            'badges.view': true,
            'mobile.view': true
          },
          isActive: true
        }));
        
        setConferencePermissions(permissions);
      } else {
        // For staff and attendees, get their conference assignments
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
      }
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
