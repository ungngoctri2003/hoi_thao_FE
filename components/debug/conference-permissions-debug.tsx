"use client";

import { useConferencePermissionsDebug } from '@/hooks/use-conference-permissions-debug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bug, Database, User, Building } from 'lucide-react';

export function ConferencePermissionsDebug() {
  const {
    conferencePermissions,
    currentConferenceId,
    isLoading,
    getAvailableConferences,
    getCurrentConferencePermissions,
    debugInfo,
    refreshPermissions
  } = useConferencePermissionsDebug();

  const availableConferences = getAvailableConferences();
  const currentPermissions = getCurrentConferencePermissions();

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Conference Permissions Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug Info */}
          <div>
            <h4 className="font-medium mb-2">Debug Information</h4>
            <div className="bg-gray-100 p-3 rounded-md text-sm">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </div>

          {/* Loading State */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Loading:</span>
            <Badge variant={isLoading ? "default" : "secondary"}>
              {isLoading ? "Yes" : "No"}
            </Badge>
          </div>

          {/* Current Conference */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Current Conference ID:</span>
            <Badge variant="outline">
              {currentConferenceId || "None"}
            </Badge>
          </div>

          {/* Available Conferences Count */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Available Conferences:</span>
            <Badge variant="outline">
              {availableConferences.length}
            </Badge>
          </div>

          {/* Total Permissions Count */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Total Conference Permissions:</span>
            <Badge variant="outline">
              {conferencePermissions.length}
            </Badge>
          </div>

          {/* Current Permissions Count */}
          <div className="flex items-center gap-2">
            <span className="font-medium">Current Permissions:</span>
            <Badge variant="outline">
              {Object.keys(currentPermissions).length}
            </Badge>
          </div>

          {/* Refresh Button */}
          <Button onClick={refreshPermissions} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Permissions
          </Button>
        </CardContent>
      </Card>

      {/* Available Conferences */}
      {availableConferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Available Conferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableConferences.map((conference) => (
                <div key={conference.conferenceId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{conference.conferenceName}</h4>
                    <Badge variant={conference.isActive ? "default" : "secondary"}>
                      {conference.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    ID: {conference.conferenceId}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(conference.permissions)
                      .filter(([_, hasPermission]) => hasPermission)
                      .map(([permission, _]) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Conference Permissions */}
      {conferencePermissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              All Conference Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conferencePermissions.map((conference) => (
                <div key={conference.conferenceId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{conference.conferenceName}</h4>
                    <div className="flex gap-2">
                      <Badge variant={conference.isActive ? "default" : "secondary"}>
                        {conference.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {Object.keys(conference.permissions).length} permissions
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    ID: {conference.conferenceId}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(conference.permissions).map(([permission, hasPermission]) => (
                      <div key={permission} className="flex items-center gap-2 text-xs">
                        <span className={hasPermission ? "text-green-600" : "text-red-600"}>
                          {hasPermission ? "✓" : "✗"}
                        </span>
                        <span className={hasPermission ? "text-gray-900" : "text-gray-500"}>
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {conferencePermissions.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <User className="h-5 w-5" />
              No Conference Permissions Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                No conference assignments found for this user.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside text-left">
                  <li>User has not been assigned to any conferences</li>
                  <li>API endpoint is not working</li>
                  <li>Database is empty</li>
                  <li>Authentication issues</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
