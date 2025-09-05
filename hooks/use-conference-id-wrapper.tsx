"use client";

import { Suspense } from "react";
import { useConferenceId } from "./use-conference-id";

export function useConferenceIdWrapper() {
  return useConferenceId();
}

export function ConferenceIdProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
