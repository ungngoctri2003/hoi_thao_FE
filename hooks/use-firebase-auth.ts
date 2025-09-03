import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useNotification } from '@/hooks/use-notification';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    let isProcessing = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (isProcessing) {
        console.log('Already processing auth state change, skipping...');
        return;
      }
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });

        // Check if this is a new sign-in (redirect result)
        try {
          isProcessing = true;
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult && redirectResult.user.uid === firebaseUser.uid) {
            console.log('New Google sign-in detected, calling backend...');
            // Try to determine mode from URL or default to login
            const currentPath = window.location.pathname;
            const mode = currentPath.includes('/register') ? 'register' : 'login';
            await handleGoogleSignInBackend(firebaseUser, mode);
          } else {
            // If no redirect result but user exists, check if we need to call backend
            console.log('No redirect result, checking if backend auth is needed...');
            const hasTokens = localStorage.getItem('accessToken') || document.cookie.includes('accessToken=');
            if (!hasTokens) {
              console.log('No backend tokens found, calling backend auth...');
              const currentPath = window.location.pathname;
              const mode = currentPath.includes('/register') ? 'register' : 'login';
              await handleGoogleSignInBackend(firebaseUser, mode);
            }
          }
        } catch (error) {
          console.error('Error handling redirect result:', error);
        } finally {
          isProcessing = false;
        }
      } else {
        setUser(null);
        // Don't automatically clear backend tokens here to avoid conflicts
        // Backend tokens will be cleared by the explicit logout functions
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to handle backend authentication after Google sign-in
  const handleGoogleSignInBackend = async (firebaseUser: User, mode: "login" | "register" = "login") => {
    try {
      console.log('🔄 Starting backend authentication for:', firebaseUser.email);
      
      // Clear any existing authentication state first
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      
      const userData = {
        email: firebaseUser.email!,
        name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        avatar: firebaseUser.photoURL || undefined,
        firebaseUid: firebaseUser.uid,
      };

      // Use the appropriate endpoint based on mode
      const endpoint = mode === "login" ? "/api/auth/google/login" : "/api/auth/google/register";
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            avatar: firebaseUser.photoURL,
          }),
        });

        const result = await response.json();
        
        if (response.ok) {
          // Store tokens using the same method as apiClient
          if (result.data) {
            // Set cookie with 7 days expiration
            const expires = new Date();
            expires.setDate(expires.getDate() + 7);
            document.cookie = `accessToken=${result.data.accessToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            document.cookie = `refreshToken=${result.data.refreshToken}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            // Also keep in localStorage as backup
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('refreshToken', result.data.refreshToken);
          }
          console.log(`✅ Google ${mode} successful via backend`);
          showSuccess(
            mode === "login" ? "Đăng nhập thành công" : "Đăng ký thành công",
            mode === "login" ? "Chào mừng bạn quay trở lại!" : "Tài khoản đã được tạo thành công!"
          );
          
          // Don't reload page automatically - let the auth service handle state sync
          console.log('Google authentication successful, auth state should sync automatically');
        } else {
          // Handle specific error cases
          const errorMessage = result.message || `HTTP ${response.status}`;
          if (response.status === 409) {
            if (mode === "login") {
              showError("Tài khoản chưa được đăng ký", "Vui lòng đăng ký tài khoản trước khi đăng nhập.");
            } else {
              showError("Tài khoản đã tồn tại", "Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
            }
          } else if (response.status === 401) {
            showError("Đăng nhập thất bại", "Thông tin đăng nhập không chính xác.");
          } else if (response.status === 400) {
            showError("Thông tin không hợp lệ", "Vui lòng kiểm tra lại thông tin đã nhập.");
          } else {
            showError(
              mode === "login" ? "Đăng nhập thất bại" : "Đăng ký thất bại",
              errorMessage
            );
          }
          throw new Error(errorMessage);
        }
      } catch (backendError: any) {
        console.error(`Google ${mode} failed:`, backendError);
        throw backendError;
      }
    } catch (error: any) {
      console.error('Backend authentication failed:', error);
      // Don't throw here to avoid breaking the auth flow
    }
  };

  const signInWithGoogle = async (mode: "login" | "register" = "login") => {
    try {
      setLoading(true);
      setError(null);
      
      // Try popup first, fallback to redirect if popup fails
      console.log('Starting Google sign-in with popup...');
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup sign-in successful:', result);
        
        // Handle the result immediately
        if (result.user) {
          await handleGoogleSignInBackend(result.user, mode);
          
          // Redirect to dashboard after successful backend authentication
          console.log(`🚀 Popup ${mode} successful, redirecting to dashboard...`);
          window.location.href = '/dashboard';
        }
        
        return result;
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect...', popupError);
        // If popup fails (e.g., due to COOP), use redirect
        if (popupError.code === 'auth/popup-closed-by-user') {
          showError("Đăng nhập bị hủy", "Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.");
        } else if (popupError.code === 'auth/popup-blocked') {
          showError("Cửa sổ popup bị chặn", "Vui lòng cho phép popup và thử lại.");
        } else {
          showError("Đăng nhập thất bại", "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
        }
        await signInWithRedirect(auth, googleProvider);
        return null; // Will be handled by redirect result
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear backend tokens first
      console.log('Clearing backend tokens...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Show success message
      showSuccess("Đăng xuất thành công", "Bạn đã đăng xuất khỏi hệ thống.");
      
      // Redirect to login page after successful logout
      console.log('🚀 Logout successful, redirecting to login...');
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
      // Even if logout fails, redirect to login
      window.location.href = '/login';
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  };
}
