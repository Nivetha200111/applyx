// Simple script to generate missing icons
// Run this with Node.js to create the required icon files

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4CAF50" rx="4"/>
  <text x="${size/2}" y="${size/2 + size/8}" text-anchor="middle" fill="white" font-family="Arial" font-size="${size/2}" font-weight="bold">🚀</text>
</svg>
`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Generate SVG icons (you can convert these to PNG using online tools)
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const svg = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Created icon${size}.svg`);
});

console.log('\n✅ Icon files created!');
console.log('📝 Next steps:');
console.log('1. Open chrome-extension/create-icons.html in your browser');
console.log('2. Click "Generate Icons" to create the canvas versions');
console.log('3. Click "Download Icons" to save as PNG files');
console.log('4. Move the downloaded PNG files to chrome-extension/icons/');
console.log('\nOr use an online SVG to PNG converter for the .svg files.');
