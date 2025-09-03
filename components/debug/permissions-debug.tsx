"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { RefreshCw, User, Shield, AlertCircle } from 'lucide-react';

export function PermissionsDebug() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await apiClient.getCurrentUser();
      setUserInfo(userData);
      console.log('User info from API:', userData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to get permissions from different endpoints
      const endpoints = [
        '/users/me',
        '/profile',
        '/users/me/refresh-permissions'
      ];

      for (const endpoint of endpoints) {
        try {
          // Use fetch directly since request is private
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`http://localhost:3001/api${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log(`Response from ${endpoint}:`, data);
          
          if (data.data?.permissions) {
            setPermissions(data.data.permissions);
            break;
          } else if (data.data?.user?.permissions) {
            setPermissions(data.data.user.permissions);
            break;
          }
        } catch (endpointError) {
          console.warn(`Failed to fetch from ${endpoint}:`, endpointError);
        }
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
      fetchPermissions();
    }
  }, [isAuthenticated]);

  const testAttendeesEndpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAttendees({ page: 1, limit: 5 });
      console.log('Attendees endpoint success:', response);
    } catch (err: any) {
      setError(err.message);
      console.error('Attendees endpoint error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debug Permissions</h1>
        <div className="flex gap-2">
          <Button onClick={fetchUserInfo} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh User Info
          </Button>
          <Button onClick={fetchPermissions} disabled={loading} variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Fetch Permissions
          </Button>
          <Button onClick={testAttendeesEndpoint} disabled={loading} variant="outline">
            <User className="h-4 w-4 mr-2" />
            Test Attendees
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-600 font-medium">Error:</span>
              <span className="text-red-600">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div className="space-y-2">
                <div><strong>ID:</strong> {userInfo.id}</div>
                <div><strong>Name:</strong> {userInfo.name}</div>
                <div><strong>Email:</strong> {userInfo.email}</div>
                <div><strong>Role:</strong> 
                  <Badge className="ml-2" variant={userInfo.role === 'admin' ? 'default' : 'secondary'}>
                    {userInfo.role}
                  </Badge>
                </div>
                <div><strong>Avatar:</strong> {userInfo.avatar || 'None'}</div>
              </div>
            ) : (
              <div className="text-muted-foreground">No user info loaded</div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Backend Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Found {permissions.length} permissions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No permissions found</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Frontend vs Backend Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required for Attendees:</h4>
              <div className="flex gap-2">
                <Badge variant="destructive">attendees.write</Badge>
                <Badge variant="secondary">attendees.read</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">User has:</h4>
              <div className="flex gap-2">
                {permissions.includes('attendees.write') ? (
                  <Badge variant="default">✓ attendees.write</Badge>
                ) : (
                  <Badge variant="destructive">✗ attendees.write</Badge>
                )}
                {permissions.includes('attendees.read') ? (
                  <Badge variant="default">✓ attendees.read</Badge>
                ) : (
                  <Badge variant="secondary">✗ attendees.read</Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Role-based permissions (Frontend):</h4>
              <div className="text-sm text-muted-foreground">
                Admin should have all permissions including attendees.write
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
