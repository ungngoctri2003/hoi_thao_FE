const fs = require('fs');
const path = require('path');
const glob = require('glob');

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove console.log, console.debug, console.warn (but keep console.error)
  const patterns = [
    // Single line console statements
    /^\s*console\.(log|debug|warn)\([^)]*\);?\s*$/gm,
    // Multi-line console statements
    /^\s*console\.(log|debug|warn)\([^)]*$/gm,
    // Trailing console on same line with other code
    /;\s*console\.(log|debug|warn)\([^)]*\);?/g,
  ];

  patterns.forEach(pattern => {
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  });

  // Clean up multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned: ${filePath}`);
    return 1;
  }
  return 0;
}

async function main() {
  const patterns = [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
  ];

  let totalFiles = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
    });

    files.forEach(file => {
      totalFiles += removeConsoleLogs(file);
    });
  }

  console.log(`\n🎉 Đã xóa console debug trong ${totalFiles} files!`);
}

main().catch(console.error);

