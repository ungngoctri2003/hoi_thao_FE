"use client"

import { useState, useEffect } from 'react';
import { authService, AuthState } from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((newState) => {
      console.log('useAuth - Auth state changed:', newState);
      setAuthState(newState);
    });
    
    // Get initial state
    const initialState = authService.getState();
    console.log('useAuth - Initial auth state:', initialState);
    setAuthState(initialState);

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (email: string, name: string, password: string) => {
    await authService.register(email, name, password);
  };

  const logout = async () => {
    await authService.logout();
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await authService.resetPassword(token, password);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authService.changePassword(currentPassword, newPassword);
  };

  const updateProfile = async (profileData: { name?: string; email?: string; avatar?: string }) => {
    await authService.updateProfile(profileData);
  };

  const loginWithGoogle = async (googleData: { firebaseUid: string; email: string; name: string; avatar?: string }) => {
    await authService.loginWithGoogle(googleData);
  };

  const registerWithGoogle = async (googleData: { email: string; name: string; avatar?: string; firebaseUid: string }) => {
    await authService.registerWithGoogle(googleData);
  };

  const clearAuthState = () => {
    authService.clearAuthState();
  };

  const refreshPermissions = async () => {
    await authService.refreshPermissions();
  };

  return {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    loginWithGoogle,
    registerWithGoogle,
    clearAuthState,
    refreshPermissions,
  };
}
