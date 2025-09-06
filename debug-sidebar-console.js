// Debug script for sidebar attendees management
console.log('🔍 Debug Sidebar Attendees Management');

// Function to debug sidebar navigation
function debugSidebarNavigation() {
    console.log('\n📋 Debug Sidebar Navigation');
    
    // Check if we're in the right context
    if (typeof window === 'undefined') {
        console.log('❌ This script should run in browser context');
        return;
    }
    
    // Check for React components
    const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
    if (!reactRoot) {
        console.log('❌ React app not found');
        return;
    }
    
    console.log('✅ React app found');
    
    // Check for sidebar element
    const sidebar = document.querySelector('[class*="sidebar"]') || 
                   document.querySelector('[data-testid="sidebar"]') ||
                   document.querySelector('nav');
    
    if (!sidebar) {
        console.log('❌ Sidebar element not found');
        return;
    }
    
    console.log('✅ Sidebar element found');
    
    // Check for attendees link
    const attendeesLink = sidebar.querySelector('a[href="/attendees"]') ||
                         sidebar.querySelector('[href="/attendees"]');
    
    if (!attendeesLink) {
        console.log('❌ Attendees link not found in sidebar');
        console.log('Available links:', Array.from(sidebar.querySelectorAll('a')).map(a => a.href));
    } else {
        console.log('✅ Attendees link found');
        console.log('Link text:', attendeesLink.textContent);
        console.log('Link href:', attendeesLink.href);
        console.log('Link visible:', attendeesLink.offsetParent !== null);
    }
}

// Function to check user authentication
function debugUserAuth() {
    console.log('\n🔐 Debug User Authentication');
    
    // Check localStorage for user data
    const userData = localStorage.getItem('user') || localStorage.getItem('authUser');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ User data found in localStorage:', user);
            console.log('User role:', user.role);
            console.log('User permissions:', user.permissions);
        } catch (e) {
            console.log('❌ Error parsing user data:', e);
        }
    } else {
        console.log('❌ No user data found in localStorage');
    }
    
    // Check sessionStorage
    const sessionUser = sessionStorage.getItem('user') || sessionStorage.getItem('authUser');
    if (sessionUser) {
        try {
            const user = JSON.parse(sessionUser);
            console.log('✅ User data found in sessionStorage:', user);
        } catch (e) {
            console.log('❌ Error parsing session user data:', e);
        }
    }
    
    // Check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    
    if (cookies.userRole || cookies.role) {
        console.log('✅ User role found in cookies:', cookies.userRole || cookies.role);
    }
}

// Function to check React state
function debugReactState() {
    console.log('\n⚛️ Debug React State');
    
    // Try to find React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log('✅ React DevTools found');
        
        // Get React fiber
        const reactFiber = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.getFiberRoots(1).values().next().value;
        if (reactFiber) {
            console.log('✅ React fiber found');
            
            // Try to find sidebar component
            let current = reactFiber;
            while (current) {
                if (current.type && current.type.name === 'Sidebar') {
                    console.log('✅ Sidebar component found');
                    console.log('Props:', current.memoizedProps);
                    break;
                }
                current = current.child;
            }
        }
    } else {
        console.log('❌ React DevTools not found');
    }
}

// Function to check CSS
function debugCSS() {
    console.log('\n🎨 Debug CSS');
    
    const sidebar = document.querySelector('[class*="sidebar"]');
    if (!sidebar) {
        console.log('❌ Sidebar not found for CSS debug');
        return;
    }
    
    const computedStyle = window.getComputedStyle(sidebar);
    console.log('Sidebar display:', computedStyle.display);
    console.log('Sidebar visibility:', computedStyle.visibility);
    console.log('Sidebar opacity:', computedStyle.opacity);
    
    // Check for attendees link specifically
    const attendeesLink = sidebar.querySelector('a[href="/attendees"]');
    if (attendeesLink) {
        const linkStyle = window.getComputedStyle(attendeesLink);
        console.log('Attendees link display:', linkStyle.display);
        console.log('Attendees link visibility:', linkStyle.visibility);
        console.log('Attendees link opacity:', linkStyle.opacity);
    }
}

// Function to simulate sidebar logic
function simulateSidebarLogic() {
    console.log('\n🧮 Simulate Sidebar Logic');
    
    // Mock data
    const allNavigationItems = [
        { 
            href: "/conference-management", 
            label: "Quản lý hội nghị", 
            adminOnly: false,
            requiredPermissions: ["conferences.manage"]
        },
        { 
            href: "/attendees", 
            label: "Quản lý người tham dự", 
            adminOnly: true,
            requiredPermissions: ["attendees.manage"]
        }
    ];
    
    const roles = ['admin', 'staff', 'attendee'];
    
    roles.forEach(role => {
        console.log(`\nTesting role: ${role}`);
        
        const filteredItems = allNavigationItems.filter(item => {
            // Special handling for conference management - only show to admin
            if (item.href === '/conference-management') {
                return role === 'admin';
            }
            
            // Special handling for global attendees management - only show to admin
            if (item.href === '/attendees' && item.adminOnly) {
                return role === 'admin';
            }
            
            // Admin always has access to attendees management regardless of permissions
            if (item.href === '/attendees' && role === 'admin') {
                return true;
            }
            
            return true; // Other items
        });
        
        const hasAttendees = filteredItems.some(item => item.href === '/attendees');
        console.log(`  Should show attendees: ${hasAttendees ? 'YES' : 'NO'}`);
        console.log(`  Filtered items: ${filteredItems.map(item => item.label).join(', ')}`);
    });
}

// Function to check network requests
function debugNetworkRequests() {
    console.log('\n🌐 Debug Network Requests');
    
    // Check if there are any failed requests
    const performanceEntries = performance.getEntriesByType('navigation');
    if (performanceEntries.length > 0) {
        console.log('Navigation timing:', performanceEntries[0]);
    }
    
    // Check for any console errors
    const originalError = console.error;
    console.error = function(...args) {
        console.log('🚨 Console Error:', args);
        originalError.apply(console, args);
    };
}

// Main debug function
function runDebug() {
    console.log('🚀 Starting Sidebar Debug...');
    
    debugUserAuth();
    debugSidebarNavigation();
    debugReactState();
    debugCSS();
    simulateSidebarLogic();
    debugNetworkRequests();
    
    console.log('\n✅ Debug completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Check if user role is "admin"');
    console.log('2. Check if sidebar component is re-rendering');
    console.log('3. Check if CSS is hiding the element');
    console.log('4. Check if permissions are loaded correctly');
}

// Run debug
runDebug();

// Export for manual testing
window.debugSidebar = {
    debugUserAuth,
    debugSidebarNavigation,
    debugReactState,
    debugCSS,
    simulateSidebarLogic,
    runDebug
};
