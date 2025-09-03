// Script to stop Google authentication infinite loop
// This script will clear all auth data and stop any running processes

function stopGoogleAuthLoop() {
  console.log('🛑 Stopping Google authentication loop...');
  
  // Clear all authentication data
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
    
    // Stop any running intervals or timeouts
    for (let i = 1; i < 99999; i++) {
      window.clearTimeout(i);
      window.clearInterval(i);
    }
    
    console.log('✅ All timers cleared');
    
    // Redirect to a safe page
    console.log('🔄 Redirecting to login page...');
    window.location.href = '/login';
  }
}

// Auto-run the script
stopGoogleAuthLoop();
