const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const sharp = require('sharp');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// The SVG content
const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="64" height="64" rx="8" fill="#1a1a2e"/>
  
  <!-- Tetris blocks -->
  <!-- I piece (cyan) -->
  <rect x="16" y="16" width="8" height="8" fill="#00f7ff" rx="1"/>
  <rect x="24" y="16" width="8" height="8" fill="#00f7ff" rx="1"/>
  <rect x="32" y="16" width="8" height="8" fill="#00f7ff" rx="1"/>
  <rect x="40" y="16" width="8" height="8" fill="#00f7ff" rx="1"/>
  
  <!-- L piece (orange) -->
  <rect x="16" y="32" width="8" height="8" fill="#ffa500" rx="1"/>
  <rect x="16" y="40" width="8" height="8" fill="#ffa500" rx="1"/>
  <rect x="24" y="40" width="8" height="8" fill="#ffa500" rx="1"/>
  
  <!-- O piece (yellow) -->
  <rect x="40" y="32" width="8" height="8" fill="#ffff00" rx="1"/>
  <rect x="48" y="32" width="8" height="8" fill="#ffff00" rx="1"/>
  <rect x="40" y="40" width="8" height="8" fill="#ffff00" rx="1"/>
  <rect x="48" y="40" width="8" height="8" fill="#ffff00" rx="1"/>
  
  <!-- T piece (purple) -->
  <rect x="24" y="48" width="8" height="8" fill="#9b59b6" rx="1"/>
  <rect x="32" y="48" width="8" height="8" fill="#9b59b6" rx="1"/>
  <rect x="40" y="48" width="8" height="8" fill="#9b59b6" rx="1"/>
  <rect x="32" y="40" width="8" height="8" fill="#9b59b6" rx="1"/>
</svg>`;

// Save the SVG file
fs.writeFileSync('public/favicon.svg', svgContent);

// Function to generate PNG icons
async function generateIcons() {
  try {
    // Create a sharp instance from the SVG
    const image = sharp(Buffer.from(svgContent));
    
    // Generate favicon.ico (16x16, 24x24, 32x32, 48x48, 64x64)
    const faviconSizes = [16, 32, 48, 64];
    const favicon = [];
    
    for (const size of faviconSizes) {
      const buffer = await image
        .resize(size, size)
        .png()
        .toBuffer();
      favicon.push({ size, buffer });
      
      // Save individual favicon files
      if (size === 16) await fs.promises.writeFile('public/favicon-16x16.png', buffer);
      if (size === 32) await fs.promises.writeFile('public/favicon-32x32.png', buffer);
    }
    
    // Generate apple-touch-icon.png (180x180)
    await image
      .resize(180, 180)
      .png()
      .toFile('public/apple-touch-icon.png');
    
    // Generate android-chrome-192x192.png
    await image
      .resize(192, 192)
      .png()
      .toFile('public/android-chrome-192x192.png');
    
    // Generate android-chrome-512x512.png
    await image
      .resize(512, 512)
      .png()
      .toFile('public/android-chrome-512x512.png');
    
    console.log('✅ All favicon files generated successfully!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Run the generation
generateIcons();
