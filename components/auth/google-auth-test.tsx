"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoogleSignInButton } from './google-signin-button';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, UserPlus, LogOut, RefreshCw } from 'lucide-react';

export function GoogleAuthTest() {
  const { user: firebaseUser, loading: firebaseLoading, signInWithGoogle, logout: firebaseLogout } = useFirebaseAuth();
  const { user: backendUser, isAuthenticated, clearAuthState } = useAuth();
  const [testMode, setTestMode] = useState<'login' | 'register'>('login');

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu xác thực?')) {
      clearAuthState();
      firebaseLogout();
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="h-5 w-5" />
          Google Authentication Test
        </CardTitle>
        <CardDescription>
          Test Google authentication flow và kiểm tra trạng thái
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={testMode === 'login' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestMode('login')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Login Mode
          </Button>
          <Button
            variant={testMode === 'register' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTestMode('register')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Register Mode
          </Button>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-2">
          <h3 className="font-medium">Google Sign In ({testMode})</h3>
          <GoogleSignInButton 
            mode={testMode}
            onSuccess={() => {
              console.log('Google sign in success');
            }}
            onError={(error) => {
              console.error('Google sign in error:', error);
            }}
          />
        </div>

        {/* Firebase Auth State */}
        <div className="space-y-2">
          <h3 className="font-medium">Firebase Auth State</h3>
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={firebaseUser ? "default" : "secondary"}>
                {firebaseLoading ? "Loading..." : firebaseUser ? "Signed In" : "Not Signed In"}
              </Badge>
            </div>
            {firebaseUser && (
              <div className="text-sm space-y-1">
                <div><strong>UID:</strong> {firebaseUser.uid}</div>
                <div><strong>Email:</strong> {firebaseUser.email}</div>
                <div><strong>Name:</strong> {firebaseUser.displayName}</div>
                <div><strong>Verified:</strong> {firebaseUser.emailVerified ? 'Yes' : 'No'}</div>
                {firebaseUser.photoURL && <div><strong>Avatar:</strong> {firebaseUser.photoURL}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Backend Auth State */}
        <div className="space-y-2">
          <h3 className="font-medium">Backend Auth State</h3>
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            {backendUser && (
              <div className="text-sm space-y-1">
                <div><strong>ID:</strong> {backendUser.id}</div>
                <div><strong>Email:</strong> {backendUser.email}</div>
                <div><strong>Name:</strong> {backendUser.name}</div>
                <div><strong>Role:</strong> {backendUser.role}</div>
                {backendUser.avatar && <div><strong>Avatar:</strong> {backendUser.avatar}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Token Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Token Information</h3>
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="text-sm">
              <div><strong>Access Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</div>
              <div><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? 'Present' : 'Missing'}</div>
              <div><strong>Cookies:</strong> {document.cookie.includes('accessToken=') ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Clear All Auth
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          
          <Button
            onClick={() => window.location.href = '/test-auth'}
            variant="outline"
            size="sm"
          >
            Go to Auth Test Page
          </Button>
        </div>

        {/* Debug Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Debug Information</h3>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs space-y-1">
              <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
              <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
              <div><strong>Cookies:</strong> {typeof document !== 'undefined' ? document.cookie : 'N/A'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
