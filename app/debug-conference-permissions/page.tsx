"use client";

import { ConferencePermissionsDebug } from '@/components/debug/conference-permissions-debug';

export default function DebugConferencePermissionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Conference Permissions</h1>
      <ConferencePermissionsDebug />
    </div>
  );
}
