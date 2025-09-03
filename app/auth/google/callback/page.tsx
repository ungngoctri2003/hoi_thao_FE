"use client"

import { GoogleAuthRedirectHandler } from '@/components/auth/google-auth-redirect-handler';
import { GoogleAuthDebug } from '@/components/auth/google-auth-debug';
import { GoogleAuthDebugEnhanced } from '@/components/auth/google-auth-debug-enhanced';

export default function GoogleAuthCallbackPage() {
  return (
    <>
      <GoogleAuthRedirectHandler />
      <GoogleAuthDebug />
      <GoogleAuthDebugEnhanced />
    </>
  );
}
