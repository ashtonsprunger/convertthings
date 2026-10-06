/**
 * ConvertThings Static Pre-Renderer
 * Runs after `react-scripts build` to generate pre-rendered static HTML files
 * for all 1,200+ unit pairs, category landing pages, and popular aliases.
 *
 * Guarantees zero-delay indexing for Googlebot, Bing, Twitter Cards, Discord, and iMessage previews.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES } from '../src/engine/conversions.js';
import { getAllUnitPairs } from '../src/engine/urlRouter.js';
import { getSeoMetadata } from '../src/engine/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDir = path.resolve(__dirname, '../build');
const indexHtmlPath = path.resolve(buildDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(`[prerender] Error: ${indexHtmlPath} not found. Please run "npm run build" first.`);
  process.exit(1);
}

const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

function renderPageHtml(seo) {
  let html = templateHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`);

  // 2. Replace Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${seo.description.replace(/"/g, '&quot;')}" />`
  );

  // 3. Replace Canonical Link
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${seo.canonicalUrl}" />`
  );

  // 4. Replace Open Graph Tags
  html = html.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${seo.ogTitle.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${seo.ogDescription.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:url" content="${seo.canonicalUrl}" />`
  );

  // 5. Replace Twitter Tags
  html = html.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:title" content="${seo.ogTitle.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:description" content="${seo.ogDescription.replace(/"/g, '&quot;')}" />`
  );

  // 6. Inject Server-Side Semantic Fallback inside <div id="root">
  const staticFallback = `
    <div id="root">
      <main class="ct-static-seo-shell" style="padding:2rem 1rem;max-width:880px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <h1 style="font-size:1.85rem;margin-bottom:0.75rem;color:#0f172a;">${seo.h1}</h1>
        <p style="font-size:1.05rem;line-height:1.6;color:#334155;margin-bottom:1rem;">${seo.description}</p>
        ${
          seo.directAnswer
            ? `<div style="background:#f1f5f9;border-left:4px solid #06b6d4;padding:0.85rem 1.25rem;border-radius:4px;margin-bottom:1rem;">
                <strong style="color:#0f172a;">Quick Answer:</strong> <span style="font-family:monospace;font-size:1.1rem;font-weight:600;">${seo.directAnswer}</span>
                ${seo.formulaEquation ? `<br/><span style="font-size:0.9rem;color:#64748b;">Formula: ${seo.formulaEquation}</span>` : ''}
              </div>`
            : ''
        }
      </main>
    </div>
  `.trim();

  html = html.replace(/<div id=["']root["']>\s*<\/div>/i, staticFallback);

  return html;
}

function writeHtml(targetPath, html) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, html, 'utf8');
}

console.log('[prerender] Starting static HTML generation...');
const startTime = Date.now();
let count = 0;

// 1. Pre-render Category landing pages (e.g. build/length/index.html)
CATEGORIES.forEach((cat) => {
  const seo = getSeoMetadata({ categoryId: cat.id });
  const html = renderPageHtml(seo);
  writeHtml(path.resolve(buildDir, cat.id, 'index.html'), html);
  count++;
});

// 2. Pre-render All Standard Unit Pairs (e.g. build/convert/lb-to-kg/index.html)
const pairs = getAllUnitPairs();
pairs.forEach((pair) => {
  const seo = getSeoMetadata({
    categoryId: pair.categoryId,
    fromUnitId: pair.fromUnitId,
    toUnitId: pair.toUnitId,
    value: '1',
  });
  const html = renderPageHtml(seo);
  writeHtml(path.resolve(buildDir, 'convert', `${pair.fromUnitId}-to-${pair.toUnitId}`, 'index.html'), html);
  count++;
});

// 3. Pre-render Common High-Volume Aliases (e.g. lbs-to-kg, miles-to-km)
const POPULAR_ALIASES = [
  { from: 'lbs', to: 'kg', cat: 'mass', fromId: 'lb', toId: 'kg' },
  { from: 'kg', to: 'lbs', cat: 'mass', fromId: 'kg', toId: 'lb' },
  { from: 'miles', to: 'km', cat: 'length', fromId: 'mi', toId: 'km' },
  { from: 'km', to: 'miles', cat: 'length', fromId: 'km', toId: 'mi' },
  { from: 'celsius', to: 'fahrenheit', cat: 'temperature', fromId: 'c', toId: 'f' },
  { from: 'fahrenheit', to: 'celsius', cat: 'temperature', fromId: 'f', toId: 'c' },
  { from: 'feet', to: 'meters', cat: 'length', fromId: 'ft', toId: 'm' },
  { from: 'meters', to: 'feet', cat: 'length', fromId: 'm', toId: 'ft' },
  { from: 'inches', to: 'cm', cat: 'length', fromId: 'in', toId: 'cm' },
  { from: 'cm', to: 'inches', cat: 'length', fromId: 'cm', toId: 'in' },
  { from: 'grams', to: 'ounces', cat: 'mass', fromId: 'g', toId: 'oz' },
  { from: 'ounces', to: 'grams', cat: 'mass', fromId: 'oz', toId: 'g' },
  { from: 'cups', to: 'ml', cat: 'cooking', fromId: 'cup_us', toId: 'ml' },
  { from: 'ml', to: 'cups', cat: 'cooking', fromId: 'ml', toId: 'cup_us' },
  { from: 'gallons', to: 'liters', cat: 'volume', fromId: 'gal_us', toId: 'l' },
  { from: 'liters', to: 'gallons', cat: 'volume', fromId: 'l', toId: 'gal_us' },
];

POPULAR_ALIASES.forEach((alias) => {
  const seo = getSeoMetadata({
    categoryId: alias.cat,
    fromUnitId: alias.fromId,
    toUnitId: alias.toId,
    value: '1',
  });
  const html = renderPageHtml(seo);
  writeHtml(path.resolve(buildDir, 'convert', `${alias.from}-to-${alias.to}`, 'index.html'), html);
  count++;
});

const elapsedMs = Date.now() - startTime;
console.log(`[prerender] Successfully generated ${count} pre-rendered HTML files in ${elapsedMs}ms!`);
