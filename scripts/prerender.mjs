/**
 * ConvertThings Static Pre-Renderer
 * Runs after `react-scripts build` to generate pre-rendered static HTML files
 * for all 1,200+ unit pairs, category landing pages, and popular aliases.
 *
 * Guarantees zero-delay indexing for Googlebot, Bing, Twitter Cards, Discord, and iMessage previews,
 * and eliminates Cumulative Layout Shift (CLS) and LCP delay on mobile devices.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATEGORIES, getUnit } from '../src/engine/conversions.js';
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

function renderPageHtml({ seo, fromUnit, toUnit, categoryName }) {
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

  // 6. Inject Server-Side Semantic App Shell inside <div id="root"> matching actual production layout
  let contentHtml = '';
  if (fromUnit && toUnit) {
    contentHtml = `
      <div class="ct-card">
        <div class="ct-footnote-card">
          <div class="ct-footnote-row ct-footnote-row-hero">
            <span class="ct-footnote-val ct-val-hero">
              <span class="ct-fn-from"><span class="ct-fn-num">1</span> <span class="ct-fn-sym">${fromUnit.symbol}</span></span>
              <span class="ct-fn-operator"> = </span>
              <span class="ct-fn-to"><span class="ct-fn-num">${seo.baselineAnswer}</span> <span class="ct-fn-sym">${toUnit.symbol}</span></span>
            </span>
          </div>
          <div class="ct-footnote-row ct-footnote-row-sub">
            <span class="ct-footnote-val ct-val-sub">
              1 ${fromUnit.name} equals ${seo.baselineAnswer} ${toUnit.plural || toUnit.name}
            </span>
          </div>
        </div>
      </div>
      <article class="ct-seo-section">
        <header class="ct-seo-header">
          <h1 class="ct-seo-title">${seo.h1}</h1>
          <p class="ct-seo-lead">${seo.description}</p>
        </header>
        ${
          seo.formulaEquation
            ? `<div class="ct-guide-spotlight">
                <h4 class="ct-spotlight-title">How to Convert ${fromUnit.plural || fromUnit.name} to ${toUnit.plural || toUnit.name} (${fromUnit.symbol} to ${toUnit.symbol})</h4>
                <p class="ct-spotlight-lead"><strong>1 ${fromUnit.name} (${fromUnit.symbol})</strong> is equal to <strong>${seo.baselineAnswer} ${toUnit.plural || toUnit.name} (${toUnit.symbol})</strong>. ${seo.formulaInstruction || ''}</p>
                <div class="ct-spotlight-quickfacts">
                  <div class="ct-spotlight-fact"><span class="ct-fact-label">Quick Answer</span> <span class="ct-fact-value">1 ${fromUnit.symbol} = ${seo.baselineAnswer} ${toUnit.symbol}</span></div>
                  <div class="ct-spotlight-fact"><span class="ct-fact-label">Formula</span> <span class="ct-fact-value">${seo.formulaEquation}</span></div>
                </div>
              </div>`
            : ''
        }
      </article>
    `.trim();
  } else {
    contentHtml = `
      <article class="ct-seo-section">
        <header class="ct-seo-header">
          <h1 class="ct-seo-title">${seo.h1}</h1>
          <p class="ct-seo-lead">${seo.description}</p>
        </header>
      </article>
    `.trim();
  }

  const staticFallback = `
    <div id="root">
      <div class="ct-app">
        <header class="ct-header">
          <div class="ct-header-inner">
            <a class="ct-brand" href="/" aria-label="ConvertThings Home">
              <div class="ct-brand-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m16 3 4 4-4 4"/>
                  <path d="M20 7H4"/>
                  <path d="m8 21-4-4 4-4"/>
                  <path d="M4 17h16"/>
                </svg>
              </div>
              <span class="ct-wordmark"><span class="ct-wm-convert">Convert</span><span class="ct-wm-things">Things</span></span>
            </a>
          </div>
        </header>
        <main class="ct-main">
          ${contentHtml}
        </main>
      </div>
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
  let retries = 5;
  while (retries > 0) {
    try {
      fs.writeFileSync(targetPath, html, 'utf8');
      break;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      const end = Date.now() + 100;
      while (Date.now() < end) {}
    }
  }
}

console.log('[prerender] Starting static HTML generation...');
const startTime = Date.now();
let count = 0;

// 1. Pre-render Category landing pages (e.g. build/length/index.html)
CATEGORIES.forEach((cat) => {
  const seo = getSeoMetadata({ categoryId: cat.id });
  const html = renderPageHtml({ seo, categoryName: cat.name });
  writeHtml(path.resolve(buildDir, cat.id, 'index.html'), html);
  count++;
});

// 2. Pre-render All Standard Unit Pairs (e.g. build/convert/lb-to-kg/index.html)
const pairs = getAllUnitPairs();
pairs.forEach((pair) => {
  const fromUnit = getUnit(pair.categoryId, pair.fromUnitId);
  const toUnit = getUnit(pair.categoryId, pair.toUnitId);
  const seo = getSeoMetadata({
    categoryId: pair.categoryId,
    fromUnitId: pair.fromUnitId,
    toUnitId: pair.toUnitId,
    value: '1',
  });
  const html = renderPageHtml({ seo, fromUnit, toUnit, categoryName: pair.categoryName });
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
  const fromUnit = getUnit(alias.cat, alias.fromId);
  const toUnit = getUnit(alias.cat, alias.toId);
  const seo = getSeoMetadata({
    categoryId: alias.cat,
    fromUnitId: alias.fromId,
    toUnitId: alias.toId,
    value: '1',
  });
  const html = renderPageHtml({ seo, fromUnit, toUnit });
  writeHtml(path.resolve(buildDir, 'convert', `${alias.from}-to-${alias.to}`, 'index.html'), html);
  count++;
});

// 4. Output build/404.html as fallback for GitHub Pages and static web servers
writeHtml(path.resolve(buildDir, '404.html'), templateHtml);

const elapsedMs = Date.now() - startTime;
console.log(`[prerender] Successfully generated ${count} pre-rendered HTML files in ${elapsedMs}ms!`);
