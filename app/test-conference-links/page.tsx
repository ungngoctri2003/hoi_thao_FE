"use client";

import { useConferenceId } from "@/hooks/use-conference-id";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TestConferenceLinksPage() {
  const { conferenceId, isLoading: conferenceIdLoading } = useConferenceId();
  const { 
    conferencePermissions, 
    currentConferenceId, 
    getAvailableConferences,
    isLoading: permissionsLoading 
  } = useConferencePermissions();

  if (conferenceIdLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const availableConferences = getAvailableConferences();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Conference Links</CardTitle>
          <CardDescription>
            Kiểm tra trạng thái của conference links và navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <div>
            <h3 className="font-semibold mb-2">Current State:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>URL Conference ID:</strong> {conferenceId || 'null'}
              </div>
              <div>
                <strong>Current Conference ID:</strong> {currentConferenceId || 'null'}
              </div>
              <div>
                <strong>Available Conferences:</strong> {availableConferences.length}
              </div>
              <div>
                <strong>Conference Permissions:</strong> {conferencePermissions.length}
              </div>
            </div>
          </div>

          {/* Available Conferences */}
          <div>
            <h3 className="font-semibold mb-2">Available Conferences:</h3>
            <div className="space-y-2">
              {availableConferences.map((conference) => (
                <Card key={conference.conferenceId} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{conference.conferenceName}</h4>
                    <Badge variant="outline">ID: {conference.conferenceId}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Test Links:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/attendees?conferenceId=${conference.conferenceId}`}>
                        <Button variant="outline" className="w-full">
                          Attendees
                        </Button>
                      </Link>
                      <Link href={`/conferences/${conference.conferenceId}`}>
                        <Button variant="outline" className="w-full">
                          Conference Page
                        </Button>
                      </Link>
                      <Link href={`/checkin?conferenceId=${conference.conferenceId}`}>
                        <Button variant="outline" className="w-full">
                          Check-in
                        </Button>
                      </Link>
                      <Link href={`/analytics?conferenceId=${conference.conferenceId}`}>
                        <Button variant="outline" className="w-full">
                          Analytics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Test Direct Links */}
          <div>
            <h3 className="font-semibold mb-2">Test Direct Links:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/attendees?conferenceId=1">
                <Button variant="outline" className="w-full">
                  Attendees (Conference 1)
                </Button>
              </Link>
              <Link href="/conferences/1">
                <Button variant="outline" className="w-full">
                  Conference Page (Conference 1)
                </Button>
              </Link>
              <Link href="/attendees?conferenceId=3">
                <Button variant="outline" className="w-full">
                  Attendees (Conference 3)
                </Button>
              </Link>
              <Link href="/conferences/3">
                <Button variant="outline" className="w-full">
                  Conference Page (Conference 3)
                </Button>
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click on any test link above</li>
              <li>Check if the page loads correctly</li>
              <li>Check if the conferenceId is passed correctly in the URL</li>
              <li>Check if the page content shows the correct conference data</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
