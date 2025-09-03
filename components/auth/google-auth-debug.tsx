"use client"

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function GoogleAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        setDebugInfo({
          hasRedirectResult: !!redirectResult,
          redirectResult: redirectResult ? {
            user: {
              uid: redirectResult.user.uid,
              email: redirectResult.user.email,
              displayName: redirectResult.user.displayName,
            },
            providerId: redirectResult.providerId,
            operationType: redirectResult.operationType,
          } : null,
          currentUser: user ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          } : null,
          loading,
          url: window.location.href,
          pathname: window.location.pathname,
        });
      } catch (error) {
        setDebugInfo({
          error: error.message,
          currentUser: user ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          } : null,
          loading,
          url: window.location.href,
          pathname: window.location.pathname,
        });
      }
    };

    checkRedirectResult();
  }, [user, loading]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
      <h3 className="font-bold mb-2">🔍 Google Auth Debug</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-64">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
