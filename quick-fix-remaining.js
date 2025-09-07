const fs = require('fs');

// Fix sessions page
const sessionsPath = 'app/sessions/page.tsx';
if (fs.existsSync(sessionsPath)) {
  let content = fs.readFileSync(sessionsPath, 'utf8');
  
  // Fix the specific syntax errors
  content = content.replace(
    /if \(!canView\) \{\s*return \(\s*<MainLayout[^>]*>\s*<div className="flex items-center justify-center min-h-screen">\s*<Card className="w-full max-w-md">\s*<CardHeader>\s*<CardTitle className="text-center text-red-600">Không có quyền truy cập<\/CardTitle>\s*<CardDescription className="text-center">\s*Bạn không có quyền[^<]*<\/CardDescription>\s*<\/CardHeader>\s*<\/Card>\s*<\/div>\s*\);\s*\}/g,
    'if (!canView) {\n    return (\n      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n        <div className="flex items-center justify-center min-h-screen">\n          <Card className="w-full max-w-md">\n            <CardHeader>\n              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>\n              <CardDescription className="text-center">\n                Bạn không có quyền xem phiên họp\n              </CardDescription>\n            </CardHeader>\n          </Card>\n        </div>\n      </MainLayout>\n    );\n  }'
  );
  
  // Fix return statement
  content = content.replace(
    /return \(\s*<MainLayout[^>]*>\s*return \(\s*<ConferencePermissionGuard/g,
    'return (\n    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n      <ConferencePermissionGuard'
  );
  
  // Fix closing tags
  content = content.replace(
    /<\/ConferencePermissionGuard>\s*<\/MainLayout>\s*\);\s*\}/g,
    '      </ConferencePermissionGuard>\n    </MainLayout>\n  );\n}'
  );
  
  fs.writeFileSync(sessionsPath, content, 'utf8');
  console.log('✅ Fixed sessions page');
}

console.log('✅ Quick fix completed!');

