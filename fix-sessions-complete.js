const fs = require('fs');

const sessionsPath = 'app/sessions/page.tsx';

if (fs.existsSync(sessionsPath)) {
  let content = fs.readFileSync(sessionsPath, 'utf8');
  
  console.log('Fixing sessions page...');
  
  // Fix the broken JSX structure around line 1184-1190
  content = content.replace(
    /        <\/div>\s*<\/MainLayout>\s*\);\s*\}\}\)\s*<\/div>\s*<\/CardContent>\s*<\/Card>\s*\)\}/g,
    '        </div>\n      </MainLayout>\n    );\n  }\n\n  return (\n    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n      <ConferencePermissionGuard \n        requiredPermissions={["sessions.view"]} \n        conferenceId={currentConferenceId ?? undefined}\n      >\n        <div className="space-y-6">'
  );
  
  // Fix the closing tags at the end
  content = content.replace(
    /                 <\/ConferencePermissionGuard>\s*<\/MainLayout>\s*\);\s*\}/g,
    '      </ConferencePermissionGuard>\n    </MainLayout>\n  );\n}'
  );
  
  // Fix any remaining broken JSX structure
  content = content.replace(
    /        <\/div>\s*<\/MainLayout>\s*\);\s*\}\s*return \(\s*<MainLayout[^>]*>\s*<ConferencePermissionGuard[^>]*>\s*<div className="space-y-6">/g,
    '        </div>\n      </MainLayout>\n    );\n  }\n\n  return (\n    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>\n      <ConferencePermissionGuard \n        requiredPermissions={["sessions.view"]} \n        conferenceId={currentConferenceId ?? undefined}\n      >\n        <div className="space-y-6">'
  );
  
  // Ensure proper closing structure
  const lines = content.split('\n');
  let fixedContent = '';
  let braceCount = 0;
  let inJSX = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count braces to track function scope
    if (line.includes('{') && !line.includes('//')) {
      braceCount++;
    }
    if (line.includes('}') && !line.includes('//')) {
      braceCount--;
    }
    
    // Fix the specific broken section
    if (line.includes('})}') && i > 1180 && i < 1190) {
      // Skip this broken line
      continue;
    }
    
    // Fix the closing structure at the end
    if (i === lines.length - 5 && line.includes('</ConferencePermissionGuard>')) {
      fixedContent += '      </ConferencePermissionGuard>\n';
      fixedContent += '    </MainLayout>\n';
      fixedContent += '  );\n';
      fixedContent += '}\n';
      break;
    }
    
    fixedContent += line + '\n';
  }
  
  fs.writeFileSync(sessionsPath, fixedContent, 'utf8');
  console.log('✅ Fixed sessions page structure');
} else {
  console.log('Sessions page not found');
}

