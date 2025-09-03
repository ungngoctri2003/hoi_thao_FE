// Script to fix authentication state issues
// This script will clear all authentication data and reset the state

function clearAllAuthData() {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authState');
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ All authentication data cleared');
    
    // Reload the page to reset state
    console.log('🔄 Reloading page to reset authentication state...');
    window.location.reload();
  }
}

// Auto-run the script
clearAllAuthData();
