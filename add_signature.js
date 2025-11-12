const fs = require('fs');
const path = require('path');

const SIGNATURE = '//ft\n';

// Recursively find all page.tsx files
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next' && file !== 'out') {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const frontendDir = path.join(__dirname, 'frontend', 'src', 'app');
const pageFiles = findPageFiles(frontendDir);

console.log(`Found ${pageFiles.length} page files\n`);

let updated = 0;
let skipped = 0;

pageFiles.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check if signature already exists
    if (content.includes('//ft')) {
      console.log(`⏭️  Skipped: ${path.relative(process.cwd(), filePath)}`);
      skipped++;
      return;
    }

    let newContent;

    // If file starts with 'use client', add signature after it
    if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
      const lines = content.split('\n');
      const firstLine = lines[0];
      const rest = lines.slice(1).join('\n');
      newContent = `${firstLine}\n${SIGNATURE}${rest}`;
    } else {
      // Add signature at the very top
      newContent = SIGNATURE + content;
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
    updated++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updated} files`);
console.log(`   Skipped: ${skipped} files`);
console.log(`   Total: ${pageFiles.length} files`);
