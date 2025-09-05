"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useConferenceId() {
  const [conferenceId, setConferenceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const updateConferenceId = () => {
      try {
        // Get conferenceId from URL search params
        const urlParams = new URLSearchParams(window.location.search);
        const conferenceIdParam = urlParams.get('conferenceId');
        
        if (conferenceIdParam) {
          const id = parseInt(conferenceIdParam);
          if (!isNaN(id)) {
            setConferenceId(id);
          } else {
            setConferenceId(null);
          }
        } else {
          setConferenceId(null);
        }
      } catch (error) {
        console.error('Error parsing conferenceId:', error);
        setConferenceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    updateConferenceId();
  }, [pathname]); // Only depend on pathname changes

  return { conferenceId, isLoading };
}
