"use client"

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function GoogleAuthDebugEnhanced() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, loading } = useFirebaseAuth();

  const refreshDebugInfo = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        
        // Check tokens
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const cookies = document.cookie;
        const hasAccessTokenCookie = cookies.includes('accessToken=');
        const hasRefreshTokenCookie = cookies.includes('refreshToken=');
        
        // Check current URL
        const currentUrl = window.location.href;
        const isCallbackPage = currentUrl.includes('/auth/google/callback');
        
        setDebugInfo({
          timestamp: new Date().toISOString(),
          refreshKey,
          firebase: {
            user: user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            } : null,
            loading,
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
          },
          tokens: {
            localStorage: {
              accessToken: accessToken ? 'Present' : 'Not found',
              refreshToken: refreshToken ? 'Present' : 'Not found',
            },
            cookies: {
              accessToken: hasAccessTokenCookie ? 'Present' : 'Not found',
              refreshToken: hasRefreshTokenCookie ? 'Present' : 'Not found',
            },
            allCookies: cookies,
          },
          url: {
            current: currentUrl,
            isCallbackPage,
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
          },
          authState: {
            isAuthenticated: !!(accessToken || hasAccessTokenCookie),
            hasFirebaseUser: !!user,
            hasBackendTokens: !!(accessToken || hasAccessTokenCookie),
            shouldRedirect: !!(user && (accessToken || hasAccessTokenCookie)),
          }
        });
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          refreshKey,
          firebase: {
            user: user ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            } : null,
            loading,
          },
          tokens: {
            localStorage: {
              accessToken: localStorage.getItem('accessToken') ? 'Present' : 'Not found',
              refreshToken: localStorage.getItem('refreshToken') ? 'Present' : 'Not found',
            },
            cookies: {
              accessToken: document.cookie.includes('accessToken=') ? 'Present' : 'Not found',
              refreshToken: document.cookie.includes('refreshToken=') ? 'Present' : 'Not found',
            },
          },
          url: {
            current: window.location.href,
            isCallbackPage: window.location.href.includes('/auth/google/callback'),
            pathname: window.location.pathname,
          },
        });
      }
    };

    checkRedirectResult();
  }, [user, loading, refreshKey]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-lg text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-green-400">🔍 Google Auth Debug Enhanced</h3>
        <button 
          onClick={refreshDebugInfo}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="text-yellow-400">
          <strong>Status:</strong> {debugInfo.authState?.shouldRedirect ? '✅ Ready to redirect' : '⏳ Waiting...'}
        </div>
        
        <div className="text-blue-400">
          <strong>Firebase:</strong> {debugInfo.firebase?.user ? '✅ Authenticated' : '❌ Not authenticated'}
        </div>
        
        <div className="text-green-400">
          <strong>Backend:</strong> {debugInfo.authState?.hasBackendTokens ? '✅ Has tokens' : '❌ No tokens'}
        </div>
        
        <div className="text-purple-400">
          <strong>Page:</strong> {debugInfo.url?.isCallbackPage ? '🔄 Callback' : '📄 Other'}
        </div>
      </div>
      
      <details className="mt-2">
        <summary className="cursor-pointer text-gray-300 hover:text-white">Show Full Debug Info</summary>
        <pre className="whitespace-pre-wrap overflow-auto max-h-64 mt-2 text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}
