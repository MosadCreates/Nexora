const fs = require('fs');
const path = require('path');

const srcFile = process.argv[2];
const destFile = process.argv[3];

if (!srcFile || !destFile) {
  console.log('Usage: node restore_files.js <src> <dest>');
  process.exit(1);
}

try {
  const buffer = fs.readFileSync(srcFile);
  let content = buffer.toString('utf16le');
  
  if (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFE) {
    content = content.substring(1);
  }

  // Ensure directory exists
  const dir = path.dirname(destFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(destFile, content, 'utf8');
  console.log(`Successfully restored ${srcFile} to ${destFile}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
