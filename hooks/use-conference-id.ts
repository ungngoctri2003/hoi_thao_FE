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
        console.log('🔍 [DEBUG] useConferenceId - conferenceIdParam:', conferenceIdParam);
        
        if (conferenceIdParam) {
          const id = parseInt(conferenceIdParam);
          if (!isNaN(id)) {
            console.log('🔍 [DEBUG] useConferenceId - setting conferenceId:', id);
            setConferenceId(id);
          } else {
            console.log('🔍 [DEBUG] useConferenceId - invalid conferenceId:', conferenceIdParam);
            setConferenceId(null);
          }
        } else {
          console.log('🔍 [DEBUG] useConferenceId - no conferenceId in URL');
          setConferenceId(null);
        }
      } catch (error) {
        console.error('🔍 [DEBUG] useConferenceId - error:', error);
        setConferenceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    updateConferenceId();
  }, [pathname]); // Only depend on pathname changes

  console.log('🔍 [DEBUG] useConferenceId - returning:', conferenceId, 'isLoading:', isLoading);
  return { conferenceId, isLoading };
}
