const fs = require('fs');
const path = require('path');

// Danh sách các trang conference cần sửa
const conferencePages = [
  'app/networking/page.tsx',
  'app/venue/page.tsx', 
  'app/sessions/page.tsx',
  'app/badges/page.tsx',
  'app/analytics/page.tsx',
  'app/mobile/page.tsx'
];

// Template để thêm imports
const addImports = `import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";`;

// Template để thêm auth logic
const addAuthLogic = `
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();`;

// Template để thêm loading và auth checks
const addAuthChecks = `
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;`;

// Template để wrap với MainLayout
const wrapWithMainLayout = (content) => {
  return `<MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      ${content}
    </MainLayout>`;
};

function fixConferencePage(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, skipping...`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Thêm imports nếu chưa có
    if (!content.includes('import { MainLayout }')) {
      // Tìm dòng import cuối cùng
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      const lastImportIndex = content.lastIndexOf(importLines[importLines.length - 1]);
      const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
      
      content = content.slice(0, insertIndex) + addImports + '\n' + content.slice(insertIndex);
    }
    
    // 2. Thêm auth logic vào function
    if (!content.includes('const { user, isAuthenticated, isLoading: authLoading }')) {
      // Tìm function declaration
      const functionMatch = content.match(/export default function \w+\(\) \{/);
      if (functionMatch) {
        const insertIndex = functionMatch.index + functionMatch[0].length;
        content = content.slice(0, insertIndex) + addAuthLogic + content.slice(insertIndex);
      }
    }
    
    // 3. Thêm auth checks trước permission checks
    if (!content.includes('// Show loading state while auth is loading')) {
      // Tìm permission check đầu tiên
      const permissionMatch = content.match(/const can\w+ = hasConferencePermission/);
      if (permissionMatch) {
        const insertIndex = permissionMatch.index;
        content = content.slice(0, insertIndex) + addAuthChecks + '\n  ' + content.slice(insertIndex);
      }
    }
    
    // 4. Wrap return statement với MainLayout
    if (!content.includes('<MainLayout userRole={userRole}')) {
      // Tìm return statement chính
      const returnMatch = content.match(/return \(\s*<ConferencePermissionGuard/);
      if (returnMatch) {
        const startIndex = returnMatch.index;
        const endIndex = content.lastIndexOf('</ConferencePermissionGuard>') + '</ConferencePermissionGuard>'.length;
        
        const beforeReturn = content.slice(0, startIndex);
        const returnContent = content.slice(startIndex, endIndex);
        const afterReturn = content.slice(endIndex);
        
        // Wrap return content
        const wrappedReturn = `return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      ${returnContent}
    </MainLayout>`;
        
        content = beforeReturn + wrappedReturn + afterReturn;
      }
    }
    
    // 5. Sửa container class
    content = content.replace(/className="container mx-auto p-6 space-y-6"/g, 'className="space-y-6"');
    
    // 6. Thêm MainLayout cho permission error cases
    content = content.replace(
      /if \(!can\w+\) \{\s*return \(\s*<div className="flex items-center justify-center min-h-screen">/g,
      `if (!canManage) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">`
    );
    
    // Đóng MainLayout cho error cases
    content = content.replace(
      /<\/div>\s*<\/div>\s*\);\s*\}/g,
      `</div>
        </div>
      </MainLayout>
    );
  }`
    );
    
    // Ghi file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Chạy script
console.log('🚀 Starting to fix conference pages layout...\n');

conferencePages.forEach(page => {
  fixConferencePage(page);
});

console.log('\n✅ All conference pages have been processed!');
console.log('\n📝 Manual steps needed:');
console.log('1. Check each file for any syntax errors');
console.log('2. Test the pages to ensure they work correctly');
console.log('3. Adjust any specific logic as needed');

