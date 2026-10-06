/**
 * Generate ConvertThings brand icons from user assets
 * Inputs:
 * - public/logo-black.png (light mode / black bottom arrow)
 * - public/logo-white.png (dark mode / white bottom arrow)
 * Outputs:
 * - public/logo512.png (512x512 squircle PWA/OG icon)
 * - public/logo192.png (192x192 squircle PWA/Apple Touch icon)
 * - public/favicon.ico (32x32 ICO)
 * - public/favicon-32.png (32x32 PNG)
 * - public/favicon.svg (Light/Dark adaptive SVG favicon)
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  console.log('🎨 Generating ConvertThings brand assets from user logos...');

  const blackLogoPath = 'public/logo-black.png';
  const whiteLogoPath = 'public/logo-white.png';

  if (!fs.existsSync(blackLogoPath) || !fs.existsSync(whiteLogoPath)) {
    throw new Error('Missing public/logo-black.png or public/logo-white.png');
  }

  // 1. Trim transparent padding to get exact bounds
  const whiteTrimmed = await sharp(whiteLogoPath).trim().toBuffer({ resolveWithObject: true });
  const blackTrimmed = await sharp(blackLogoPath).trim().toBuffer({ resolveWithObject: true });

  console.log(`  📐 Logo bounds: ${whiteTrimmed.info.width}x${whiteTrimmed.info.height}`);

  // 2. Prepare Squircle Background for App Icons (512x512)
  const bgSvg = Buffer.from(`
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bg)" stroke="#1e293b" stroke-width="8" />
    </svg>
  `);

  const bgBuffer = await sharp(bgSvg).png().toBuffer();

  // Resize white trimmed logo to fit comfortably in 512x512 squircle
  const logoIn512 = await sharp(whiteTrimmed.data)
    .resize(360, 360, { fit: 'inside' })
    .toBuffer();

  const logo512Buffer = await sharp(bgBuffer)
    .composite([
      {
        input: logoIn512,
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync('public/logo512.png', logo512Buffer);
  console.log('  ✅ Created public/logo512.png (512x512)');

  // 3. Generate logo192.png (192x192)
  const logo192Buffer = await sharp(logo512Buffer)
    .resize(192, 192)
    .png()
    .toBuffer();
  fs.writeFileSync('public/logo192.png', logo192Buffer);
  console.log('  ✅ Created public/logo192.png (192x192)');

  // 4. Generate transparent, unboxed favicon-32.png and Windows favicon.ico
  const png32Buffer = await sharp(blackTrimmed.data)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync('public/favicon-32.png', png32Buffer);

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
  console.log('  ✅ Created public/favicon.ico (32x32 transparent unboxed ICO)');

  // 5. Generate Adaptive SVG Favicon (light & dark browser theme support)
  // For favicon SVG, resize trimmed logos to 64x64 bounds for high resolution
  const blackFaviconPng = await sharp(blackTrimmed.data)
    .resize(60, 60, { fit: 'inside' })
    .png()
    .toBuffer();
  const whiteFaviconPng = await sharp(whiteTrimmed.data)
    .resize(60, 60, { fit: 'inside' })
    .png()
    .toBuffer();

  const blackB64 = blackFaviconPng.toString('base64');
  const whiteB64 = whiteFaviconPng.toString('base64');

  const adaptiveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <style>
    .ct-fav-light { display: block; }
    .ct-fav-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .ct-fav-light { display: none; }
      .ct-fav-dark { display: block; }
    }
  </style>
  <image class="ct-fav-light" href="data:image/png;base64,${blackB64}" width="64" height="64" preserveAspectRatio="xMidYMid meet" />
  <image class="ct-fav-dark" href="data:image/png;base64,${whiteB64}" width="64" height="64" preserveAspectRatio="xMidYMid meet" />
</svg>
`;

  fs.writeFileSync('public/favicon.svg', adaptiveSvg);
  console.log('  ✅ Created public/favicon.svg (Adaptive light/dark SVG)');

  // 6. Synchronize to build/ directory if it exists
  if (fs.existsSync('build')) {
    fs.copyFileSync('public/logo512.png', 'build/logo512.png');
    fs.copyFileSync('public/logo192.png', 'build/logo192.png');
    fs.copyFileSync('public/favicon.ico', 'build/favicon.ico');
    fs.copyFileSync('public/favicon.svg', 'build/favicon.svg');
    fs.copyFileSync('public/logo-black.png', 'build/logo-black.png');
    fs.copyFileSync('public/logo-white.png', 'build/logo-white.png');
    console.log('  ✅ Synchronized all assets to build/ directory');
  }

  console.log('✨ All ConvertThings icons and logos generated successfully!');
}

generate().catch(console.error);
