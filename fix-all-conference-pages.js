const fs = require('fs');
const path = require('path');

// Danh sách các trang conference cần sửa
const conferencePages = [
  'app/sessions/page.tsx',
  'app/venue/page.tsx', 
  'app/analytics/page.tsx',
  'app/badges/page.tsx',
  'app/mobile/page.tsx',
  'app/networking/page.tsx',
  'app/checkin/page.tsx',
  'app/attendees/page.tsx'
];

function fixConferencePage(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File ${filePath} does not exist, skipping...`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Fix import syntax errors
    content = content.replace(/import { \nimport { MainLayout }/g, 'import { MainLayout }');
    content = content.replace(/import { \nimport { useAuth }/g, 'import { useAuth }');
    
    // 2. Fix MainLayout wrapper issues in loading states
    content = content.replace(
      /return \(\s*<div className="min-h-screen flex items-center justify-center">\s*<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"><\/div>\s*<\/div>\s*<\/MainLayout>\s*\);/g,
      'return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>\n      </div>\n    );'
    );
    
    // 3. Fix MainLayout wrapper issues in not authenticated states
    content = content.replace(
      /return \(\s*<div className="min-h-screen flex items-center justify-center p-4">\s*<div className="max-w-md w-full">\s*<Card>\s*<CardHeader>\s*<CardTitle className="text-center text-red-600">Chưa đăng nhập<\/CardTitle>\s*<CardDescription className="text-center">\s*Vui lòng đăng nhập để truy cập trang này\s*<\/CardDescription>\s*<\/CardHeader>\s*<\/Card>\s*<\/div>\s*<\/div>\s*<\/MainLayout>\s*\);/g,
      'return (\n      <div className="min-h-screen flex items-center justify-center p-4">\n        <div className="max-w-md w-full">\n          <Card>\n            <CardHeader>\n              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>\n              <CardDescription className="text-center">\n                Vui lòng đăng nhập để truy cập trang này\n              </CardDescription>\n            </CardHeader>\n          </Card>\n        </div>\n      </div>\n    );'
    );
    
    // 4. Fix permission check variable names
    content = content.replace(/if \(!canManage\)/g, 'if (!canView)');
    
    // 5. Fix MainLayout wrapper in permission error cases
    content = content.replace(
      /<MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\s*<div className="flex items-center justify-center min-h-screen">\s*<Card className="w-full max-w-md">\s*<CardHeader>\s*<CardTitle className="text-center text-red-600">Không có quyền truy cập<\/CardTitle>\s*<CardDescription className="text-center">\s*Bạn không có quyền[^<]*<\/CardDescription>\s*<\/CardHeader>\s*<\/Card>\s*<\/div>\s*\);/g,
      '<MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n        <div className="flex items-center justify-center min-h-screen">\n          <Card className="w-full max-w-md">\n            <CardHeader>\n              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>\n              <CardDescription className="text-center">\n                Bạn không có quyền truy cập\n              </CardDescription>\n            </CardHeader>\n          </Card>\n        </div>\n      </MainLayout>\n    );'
    );
    
    // 6. Fix return statement syntax
    content = content.replace(
      /return \(\s*<MainLayout[^>]*>\s*return \(\s*<ConferencePermissionGuard/g,
      'return (\n    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n      <ConferencePermissionGuard'
    );
    
    // 7. Fix closing tags
    content = content.replace(
      /<\/ConferencePermissionGuard>\s*<\/MainLayout>\s*\);/g,
      '      </ConferencePermissionGuard>\n    </MainLayout>\n  );'
    );
    
    // 8. Fix missing closing tags
    content = content.replace(
      /<\/div>\s*<\/div>\s*\);\s*}/g,
      '        </div>\n      </div>\n    );\n  }'
    );
    
    // Ghi file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Chạy script
console.log('🚀 Starting to fix all conference pages...\n');

conferencePages.forEach(page => {
  fixConferencePage(page);
});

console.log('\n✅ All conference pages have been processed!');
console.log('\n📝 Manual steps needed:');
console.log('1. Check each file for any remaining syntax errors');
console.log('2. Test the pages to ensure they work correctly');
console.log('3. Adjust any specific logic as needed');

