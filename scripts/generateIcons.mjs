/**
 * Generate ConvertThings brand icons
 * Generates:
 * - public/logo512.png (512x512)
 * - public/logo192.png (192x192)
 * - public/favicon-32.png (32x32)
 * - public/favicon.ico (PNG-compressed 32x32 icon)
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#06b6d4" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Squircle rounded background -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="8" />

  <!-- ConvertThings Bidirectional Arrows (viewBox 0 0 48 48 scaled up) -->
  <g transform="translate(64, 64) scale(8)" filter="url(#glow)">
    <!-- Top Arrow: pointing right -->
    <path d="M5 14h26V8l12 8.75L31 25.5v-6H5z" fill="url(#arrowGrad)" />
    <!-- Bottom Arrow: pointing left -->
    <path d="M43 34H17v6L5 31.25 17 22.5v6h26z" fill="url(#arrowGrad)" />
  </g>
</svg>
`);

async function generate() {
  console.log('🎨 Generating ConvertThings brand assets...');

  // 1. logo512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/logo512.png');
  console.log('  ✅ Created public/logo512.png (512x512)');

  // 2. logo192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/logo192.png');
  console.log('  ✅ Created public/logo192.png (192x192)');

  // 3. favicon 32x32 PNG
  const png32Buffer = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  // Create valid Windows ICO with 32x32 PNG payload
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // type: 1 = ICO
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoDirEntry = Buffer.alloc(16);
  icoDirEntry.writeUInt8(32, 0); // width
  icoDirEntry.writeUInt8(32, 1); // height
  icoDirEntry.writeUInt8(0, 2); // palette
  icoDirEntry.writeUInt8(0, 3); // reserved
  icoDirEntry.writeUInt16LE(1, 4); // color planes
  icoDirEntry.writeUInt16LE(32, 6); // bits per pixel
  icoDirEntry.writeUInt32LE(png32Buffer.length, 8); // image size
  icoDirEntry.writeUInt32LE(6 + 16, 12); // image offset

  const icoBuffer = Buffer.concat([icoHeader, icoDirEntry, png32Buffer]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('  ✅ Created public/favicon.ico (32x32 ICO)');

  // Also copy to build if build directory exists
  if (fs.existsSync('build')) {
    fs.copyFileSync('public/logo512.png', 'build/logo512.png');
    fs.copyFileSync('public/logo192.png', 'build/logo192.png');
    fs.copyFileSync('public/favicon.ico', 'build/favicon.ico');
    console.log('  ✅ Synchronized to build/ directory');
  }

  console.log('✨ All ConvertThings icons generated successfully!');
}

generate().catch(console.error);
