/**
 * ConvertThings Static Pre-Renderer
 * Runs after `react-scripts build` to generate pre-rendered static HTML files
 * for the homepage, Kitchen Studio, all 22 category landing pages, unit pairs,
 * high-intent hubs, and popular aliases.
 *
 * Guarantees rich, complete editorial content, reference tables, worked examples,
 * FAQs, and crawlable navigation/legal links for Googlebot, AdSense (Mediapartners-Google),
 * Bing, and social preview crawlers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CATEGORIES,
  UNIT_DEFINITIONS,
  getUnit,
  convertUnits,
  formatNumber,
  getQuickReferenceTable,
} from '../src/engine/conversions.js';
import { getAllUnitPairs, HUB_ROUTES } from '../src/engine/urlRouter.js';
import { getSeoMetadata, CATEGORY_SEO_INFO } from '../src/engine/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildDir = path.resolve(__dirname, '../build');
const indexHtmlPath = path.resolve(buildDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(`[prerender] Error: ${indexHtmlPath} not found. Please run "npm run build" first.`);
  process.exit(1);
}

const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderStaticFooterHtml() {
  const catLinksHtml = CATEGORIES.map(
    (cat) => `
      <a href="/${cat.id}" class="ct-footer-cat-link ct-cat-${cat.id}">
        <span>${escapeHtml(cat.name)}</span>
      </a>`
  ).join('');

  return `
    <footer class="ct-footer">
      <div class="ct-footer-inner">
        <div class="ct-footer-main">
          <div class="ct-footer-brand-col">
            <a href="/" class="ct-footer-logo" aria-label="ConvertThings Home (Footer)">
              <span class="ct-brand-title">
                <span class="ct-brand-name">Convert</span><span class="ct-brand-accent">Things</span>
              </span>
            </a>
            <p class="ct-footer-desc">
              Fast, high-precision unit conversions for engineering, science, culinary arts, and everyday measurement tasks.
            </p>
            <div class="ct-footer-standards">
              <span>NIST &amp; ISO 80000 Precision Verified</span>
            </div>
          </div>
          <div class="ct-footer-links-col">
            <h4 class="ct-footer-heading">Conversion Categories</h4>
            <div class="ct-footer-category-grid">
              ${catLinksHtml}
            </div>
          </div>
        </div>
        <div class="ct-footer-bottom">
          <p class="ct-footer-copy">&copy; ${new Date().getFullYear()} ConvertThings. All rights reserved.</p>
          <div class="ct-footer-legal-links">
            <a href="/api/mcp" class="ct-footer-legal-link">AI &amp; Developer API</a>
            <a href="/about.html" class="ct-footer-legal-link">About &amp; Contact</a>
            <a href="/privacy.html" class="ct-footer-legal-link">Privacy Policy</a>
            <a href="/terms.html" class="ct-footer-legal-link">Terms of Service</a>
            <a href="https://github.com/ashtonsprunger/convertthings" target="_blank" rel="noopener noreferrer" class="ct-footer-legal-link">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  `.trim();
}

function renderReferenceTableHtml(fromUnit, toUnit, tableRows = []) {
  if (!fromUnit || !toUnit || !tableRows || tableRows.length === 0) return '';
  const fromPlural = fromUnit.plural || fromUnit.name;
  const toPlural = toUnit.plural || toUnit.name;

  const rowsHtml = tableRows
    .map(
      (row) => `
        <tr>
          <td>${row.fromValue} ${escapeHtml(fromUnit.symbol)}</td>
          <td>${escapeHtml(String(row.toValue))} ${escapeHtml(toUnit.symbol)}</td>
        </tr>`
    )
    .join('');

  return `
    <section class="ct-table-card" aria-label="${escapeHtml(fromPlural)} to ${escapeHtml(toPlural)} Reference Table">
      <header class="ct-table-header">
        <h2 class="ct-card-heading">${escapeHtml(fromPlural)} to ${escapeHtml(toPlural)} Conversion Table</h2>
        <p class="ct-card-subtitle">Standard benchmark values from 1 to 1,000 ${escapeHtml(fromUnit.symbol)} in ${escapeHtml(toUnit.symbol)}.</p>
      </header>
      <div class="ct-table-scroll">
        <table class="ct-ref-table">
          <thead>
            <tr>
              <th>${escapeHtml(fromPlural)} (${escapeHtml(fromUnit.symbol)})</th>
              <th>${escapeHtml(toPlural)} (${escapeHtml(toUnit.symbol)})</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </section>
  `.trim();
}

function renderFaqsHtml(faqs = [], headingSubtitle = '') {
  if (!faqs || faqs.length === 0) return '';
  return `
    <section class="ct-faq-card" aria-label="Frequently Asked Questions">
      <header class="ct-faq-header">
        <h3 class="ct-faq-heading ct-card-heading">Frequently Asked Questions</h3>
        ${headingSubtitle ? `<p class="ct-faq-lead ct-card-subtitle">${escapeHtml(headingSubtitle)}</p>` : ''}
      </header>
      <div class="ct-faq-list">
        ${faqs
          .map(
            (faq) => `
          <div class="ct-faq-item open">
            <div class="ct-faq-question-btn">
              <span class="ct-faq-question-text">${escapeHtml(faq.q)}</span>
            </div>
            <div class="ct-faq-answer">
              <p>${escapeHtml(faq.a)}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  `.trim();
}

function renderPopularPairsHtml(categoryId, categoryName) {
  const catInfo = CATEGORY_SEO_INFO[categoryId];
  if (!catInfo?.commonPairs || catInfo.commonPairs.length === 0) return '';

  const cardsHtml = catInfo.commonPairs
    .map((pair) => {
      const u1 = getUnit(categoryId, pair.from);
      const u2 = getUnit(categoryId, pair.to);
      if (!u1 || !u2) return '';
      return `
        <a href="/convert/${u1.id}-to-${u2.id}" class="ct-pair-card" title="Convert ${escapeHtml(u1.plural || u1.name)} to ${escapeHtml(u2.plural || u2.name)}">
          <div class="ct-pair-header">
            <span class="ct-pair-name">${escapeHtml(u1.name)} &#8644; ${escapeHtml(u2.name)}</span>
            <span class="ct-pair-arrow" aria-hidden="true">&rarr;</span>
          </div>
          <div class="ct-pair-tip">${escapeHtml(pair.tip)}</div>
        </a>
      `;
    })
    .join('');

  return `
    <div class="ct-popular-pairs-section">
      <h4 class="ct-pairs-heading">Popular ${escapeHtml(categoryName)} Conversions</h4>
      <div class="ct-popular-pairs-grid">
        ${cardsHtml}
      </div>
    </div>
  `.trim();
}

function renderPageHtml({
  seo,
  fromUnit,
  toUnit,
  categoryId,
  categoryName,
  isRoot = false,
  isKitchenStudio = false,
}) {
  let html = templateHtml;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);

  // 2. Replace Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`
  );

  // 2.5 Replace Robots Tag
  const robotsPolicy = seo.robots || 'index, follow';
  html = html.replace(
    /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="robots" content="${robotsPolicy}" />`
  );

  // 3. Replace Canonical Link
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
    `<link rel="canonical" href="${seo.canonicalUrl}" />`
  );

  // 4. Replace Open Graph Tags
  html = html.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(seo.ogTitle)}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(seo.ogDescription)}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:url" content="${seo.canonicalUrl}" />`
  );

  // 5. Replace Twitter Tags
  html = html.replace(
    /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(seo.ogTitle)}" />`
  );
  html = html.replace(
    /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(seo.ogDescription)}" />`
  );

  // 5.5. Inject Schema.org FAQPage & SoftwareApplication
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ConvertThings Unit Converter',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: seo.description,
    },
  ];

  if (seo.faqs && seo.faqs.length > 0) {
    schemas.unshift({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    });
  }

  html = html.replace(
    '</head>',
    `  <script type="application/ld+json" id="ct-schema-faq">${JSON.stringify(schemas)}</script>\n</head>`
  );

  // 6. Build Rich Server-Side Semantic Content inside <div id="root">
  let contentHtml = '';

  if (isRoot) {
    const defFrom = getUnit('length', 'm');
    const defTo = getUnit('length', 'ft');
    const defTable = getQuickReferenceTable('length', 'm', 'ft');

    const categoryCardsHtml = CATEGORIES.map((cat) => {
      const catInfo = CATEGORY_SEO_INFO[cat.id];
      const unitsList = (UNIT_DEFINITIONS[cat.id]?.units || [])
        .slice(0, 6)
        .map((u) => `${u.name} (${u.symbol})`)
        .join(', ');
      return `
        <div class="ct-pair-card">
          <div class="ct-pair-header">
            <a href="/${cat.id}" class="ct-pair-name"><strong>${escapeHtml(cat.name)} Converter</strong></a>
          </div>
          <p class="ct-pair-tip">${escapeHtml(catInfo?.description || '')}</p>
          <p class="ct-pair-tip"><small>Key units: ${escapeHtml(unitsList)}</small></p>
        </div>
      `;
    }).join('');

    const featuredLinksHtml = [
      { href: '/convert/lb-to-kg', label: 'Pounds to Kilograms (lb to kg)', note: '1 lb = 0.453592 kg' },
      { href: '/convert/kg-to-lb', label: 'Kilograms to Pounds (kg to lb)', note: '1 kg = 2.204623 lb' },
      { href: '/convert/km-to-mi', label: 'Kilometers to Miles (km to mi)', note: '1 km = 0.621371 mi' },
      { href: '/convert/c-to-f', label: 'Celsius to Fahrenheit (°C to °F)', note: '°F = (°C × 9/5) + 32' },
      { href: '/convert/in-to-cm', label: 'Inches to Centimeters (in to cm)', note: '1 in = 2.54 cm' },
      { href: '/convert/ft-to-m', label: 'Feet to Meters (ft to m)', note: '1 ft = 0.3048 m' },
      { href: '/convert/cup_us-to-ml', label: 'US Cups to Milliliters (cup to mL)', note: '1 cup = 236.588 mL' },
      { href: '/convert/gal_us-to-l', label: 'US Gallons to Liters (gal to L)', note: '1 gal = 3.78541 L' },
      { href: '/convert/feet-inches-to-cm', label: 'Height Converter (Feet & Inches to cm)', note: "5'10\" = 177.8 cm" },
      { href: '/convert/fraction-inches-to-mm', label: 'Tape Measure Fractions to mm', note: '13/16" = 20.6375 mm' },
      { href: '/convert/baking-fractions', label: 'Baking Fractions & Kitchen Spoons', note: '1/3 cup = 5 tbsp + 1 tsp' },
      { href: '/convert/cup_us-to-tbsp_us', label: 'US Cups to Tablespoons (cup to tbsp)', note: '1 cup = 16 tbsp' },
    ]
      .map(
        (item) => `
        <a href="${item.href}" class="ct-pair-card">
          <div class="ct-pair-header">
            <span class="ct-pair-name">${escapeHtml(item.label)}</span>
            <span class="ct-pair-arrow" aria-hidden="true">&rarr;</span>
          </div>
          <div class="ct-pair-tip">${escapeHtml(item.note)}</div>
        </a>`
      )
      .join('');

    contentHtml = `
      <div class="ct-card">
        <div class="ct-footnote-card">
          <div class="ct-footnote-row ct-footnote-row-hero">
            <span class="ct-footnote-val ct-val-hero">
              <span class="ct-fn-from"><span class="ct-fn-num">1</span> <span class="ct-fn-sym">m</span></span>
              <span class="ct-fn-operator"> = </span>
              <span class="ct-fn-to"><span class="ct-fn-num">3.28084</span> <span class="ct-fn-sym">ft</span></span>
            </span>
          </div>
          <div class="ct-footnote-row ct-footnote-row-sub">
            <span class="ct-footnote-val ct-val-sub">1 Meter equals 3.28084 Feet</span>
          </div>
        </div>
      </div>

      ${renderReferenceTableHtml(defFrom, defTo, defTable)}

      <article class="ct-seo-section">
        <section class="ct-seo-guide" aria-label="ConvertThings Universal Unit Conversion Guide">
          <header class="ct-seo-header">
            <h1 class="ct-seo-title">${escapeHtml(seo.h1)}</h1>
            <p class="ct-seo-lead">${escapeHtml(seo.description)}</p>
          </header>
          <div class="ct-guide-content">
            <h2 class="ct-guide-heading">Scientific Precision Across 22 Measurement Domains</h2>
            <p class="ct-guide-text">
              ConvertThings is a comprehensive, real-time unit conversion platform built for engineers, scientists, students, tradespeople, and home bakers. Every conversion factor is calibrated against official <strong>NIST Special Publication 811</strong> (National Institute of Standards and Technology) and <strong>ISO/IEC 80000</strong> international metrology definitions, with custom IEEE 754 floating-point normalization that eliminates binary rounding errors.
            </p>
            <p class="ct-guide-text">
              In addition to standard decimal conversions, ConvertThings supports <strong>compound measurements</strong> (such as <code>5 ft 10 in to cm</code> or <code>2 lbs 4 oz to g</code>), <strong>carpenter tape measure fractions</strong> (<code>1/16&Prime; &plusmn; 1/32&Prime;</code> ruler markings), and a dedicated <a href="/cooking">Kitchen &amp; Cooking Converter</a> that breaks odd fractional cups and spoons into practical measuring drawer tools.
            </p>

            <div class="ct-popular-pairs-section">
              <h3 class="ct-pairs-heading">Most Popular Unit Conversions</h3>
              <div class="ct-popular-pairs-grid">
                ${featuredLinksHtml}
              </div>
            </div>

            <div class="ct-popular-pairs-section">
              <h3 class="ct-pairs-heading">All 22 Measurement Categories (228 Standardized Units)</h3>
              <div class="ct-popular-pairs-grid">
                ${categoryCardsHtml}
              </div>
            </div>
          </div>
        </section>

        ${renderFaqsHtml(seo.faqs, 'Verified metrology standards, fraction handling, and culinary measurements.')}
      </article>
    `.trim();
  } else if (fromUnit && toUnit) {
    const fromPlural = fromUnit.plural || fromUnit.name;
    const toPlural = toUnit.plural || toUnit.name;

    let heroEqHtml = '';
    if (seo.isHubPage && seo.directAnswer) {
      const parts = seo.directAnswer.split(' = ');
      const left = parts[0] || '';
      const right = parts[1] || '';
      heroEqHtml = `
          <div class="ct-footnote-row ct-footnote-row-hero">
            <span class="ct-footnote-val ct-val-hero">
              <span class="ct-fn-from"><span class="ct-fn-num">${escapeHtml(left)}</span></span>
              <span class="ct-fn-operator"> = </span>
              <span class="ct-fn-to"><span class="ct-fn-num">${escapeHtml(right)}</span></span>
            </span>
          </div>
          <div class="ct-footnote-row ct-footnote-row-sub">
            <span class="ct-footnote-val ct-val-sub">
              ${escapeHtml(seo.directAnswer)}
            </span>
          </div>
      `;
    } else {
      heroEqHtml = `
          <div class="ct-footnote-row ct-footnote-row-hero">
            <span class="ct-footnote-val ct-val-hero">
              <span class="ct-fn-from"><span class="ct-fn-num">1</span> <span class="ct-fn-sym">${escapeHtml(fromUnit.symbol)}</span></span>
              <span class="ct-fn-operator"> = </span>
              <span class="ct-fn-to"><span class="ct-fn-num">${escapeHtml(seo.baselineAnswer)}</span> <span class="ct-fn-sym">${escapeHtml(toUnit.symbol)}</span></span>
            </span>
          </div>
          <div class="ct-footnote-row ct-footnote-row-sub">
            <span class="ct-footnote-val ct-val-sub">
              1 ${escapeHtml(fromUnit.name)} equals ${escapeHtml(seo.baselineAnswer)} ${escapeHtml(toPlural)}
            </span>
          </div>
      `;
    }

    const workedExamplesHtml =
      seo.workedExamples && seo.workedExamples.length > 0
        ? `
        <div class="ct-worked-examples">
          <h3 class="ct-guide-heading">Step-by-Step Worked Examples (${escapeHtml(fromUnit.symbol)} to ${escapeHtml(toUnit.symbol)})</h3>
          <ul class="ct-examples-list">
            ${seo.workedExamples
              .map(
                (ex) => `
              <li class="ct-guide-text">
                <strong>${escapeHtml(ex.title)}:</strong> ${escapeHtml(ex.explanation)}
              </li>`
              )
              .join('')}
          </ul>
        </div>
      `
        : '';

    const unitDefinitionsHtml =
      seo.fromUnitDetail && seo.toUnitDetail
        ? `
        <div class="ct-unit-definitions">
          <h3 class="ct-guide-heading">Unit Definitions &amp; Metrology Context</h3>
          ${seo.baseUnitInfo ? `<p class="ct-guide-text">${escapeHtml(seo.baseUnitInfo)}</p>` : ''}
          <p class="ct-guide-text"><strong>About ${escapeHtml(fromPlural)} (${escapeHtml(fromUnit.symbol)}):</strong> ${escapeHtml(seo.fromUnitDetail)}</p>
          <p class="ct-guide-text"><strong>About ${escapeHtml(toPlural)} (${escapeHtml(toUnit.symbol)}):</strong> ${escapeHtml(seo.toUnitDetail)}</p>
          ${
            seo.reversePath && seo.reverseAnswer
              ? `<p class="ct-guide-text">Need to convert in the opposite direction? Visit our <a href="${seo.reversePath}">Convert ${escapeHtml(toPlural)} to ${escapeHtml(fromPlural)} (${escapeHtml(toUnit.symbol)} to ${escapeHtml(fromUnit.symbol)})</a> calculator (1 ${escapeHtml(toUnit.symbol)} = ${escapeHtml(seo.reverseAnswer)} ${escapeHtml(fromUnit.symbol)}).</p>`
              : ''
          }
        </div>
      `
        : '';

    const refTableRows = seo.referenceTable || getQuickReferenceTable(categoryId, fromUnit.id, toUnit.id);

    contentHtml = `
      <div class="ct-card">
        <div class="ct-footnote-card">
          ${heroEqHtml}
        </div>
      </div>

      ${renderReferenceTableHtml(fromUnit, toUnit, refTableRows)}

      <article class="ct-seo-section">
        <section class="ct-seo-guide" aria-label="${escapeHtml(fromPlural)} to ${escapeHtml(toPlural)} Conversion Guide">
          <header class="ct-seo-header">
            <h1 class="ct-seo-title">${escapeHtml(seo.h1)}</h1>
            <p class="ct-seo-lead">${escapeHtml(seo.description)}</p>
          </header>
          <div class="ct-guide-content">
            ${
              seo.formulaEquation
                ? `<div class="ct-guide-spotlight">
                    <h2 class="ct-spotlight-title">How to Convert ${escapeHtml(fromPlural)} to ${escapeHtml(toPlural)} (${escapeHtml(fromUnit.symbol)} to ${escapeHtml(toUnit.symbol)})</h2>
                    <p class="ct-spotlight-lead"><strong>1 ${escapeHtml(fromUnit.name)} (${escapeHtml(fromUnit.symbol)})</strong> is equal to <strong>${escapeHtml(seo.baselineAnswer)} ${escapeHtml(toPlural)} (${escapeHtml(toUnit.symbol)})</strong>. ${escapeHtml(seo.formulaInstruction || '')}</p>
                    <div class="ct-spotlight-quickfacts">
                      <div class="ct-spotlight-fact"><span class="ct-fact-label">Quick Answer</span> <span class="ct-fact-value">${escapeHtml(seo.isHubPage ? seo.directAnswer : `1 ${fromUnit.symbol} = ${seo.baselineAnswer} ${toUnit.symbol}`)}</span></div>
                      <div class="ct-spotlight-fact"><span class="ct-fact-label">Formula</span> <span class="ct-fact-value">${escapeHtml(seo.formulaEquation)}</span></div>
                      ${
                        seo.reverseAnswer
                          ? `<div class="ct-spotlight-fact"><span class="ct-fact-label">Inverse Factor</span> <span class="ct-fact-value">1 ${escapeHtml(toUnit.symbol)} = ${escapeHtml(seo.reverseAnswer)} ${escapeHtml(fromUnit.symbol)}</span></div>`
                          : ''
                      }
                    </div>
                  </div>`
                : ''
            }
            ${unitDefinitionsHtml}
            ${workedExamplesHtml}
            ${categoryId ? renderPopularPairsHtml(categoryId, categoryName || categoryId) : ''}
          </div>
        </section>
        ${renderFaqsHtml(seo.faqs, `Verified answers and formulas for converting ${fromPlural.toLowerCase()} to ${toPlural.toLowerCase()}.`)}
      </article>
    `.trim();
  } else {
    // Category Landing Page (e.g. /length, /mass, /temperature)
    const catDef = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
    const catInfo = CATEGORY_SEO_INFO[catDef.id];
    const defFrom = getUnit(catDef.id, catDef.defaultFrom);
    const defTo = getUnit(catDef.id, catDef.defaultTo);
    const defTable = defFrom && defTo ? getQuickReferenceTable(catDef.id, defFrom.id, defTo.id) : [];
    const allUnits = UNIT_DEFINITIONS[catDef.id]?.units || [];
    const baseUnit = getUnit(catDef.id, UNIT_DEFINITIONS[catDef.id]?.baseUnit);

    const unitsDirectoryHtml =
      allUnits.length > 0
        ? `
        <div class="ct-units-directory">
          <h3 class="ct-guide-heading">Supported ${escapeHtml(catDef.name)} Units (${allUnits.length} Units)</h3>
          <ul class="ct-examples-list">
            ${allUnits
              .map((u) => {
                const factorToBase =
                  baseUnit && u.id !== baseUnit.id ? convertUnits(1, catDef.id, u.id, baseUnit.id) : null;
                const factorText =
                  factorToBase !== null
                    ? ` — 1 ${u.symbol} = ${formatNumber(factorToBase, 6)} ${baseUnit.symbol}`
                    : baseUnit && u.id === baseUnit.id
                    ? ' — Primary SI / Base Reference Unit'
                    : '';
                const subText = u.subtitle ? ` (${u.subtitle})` : '';
                return `<li class="ct-guide-text"><strong>${escapeHtml(u.name)} (${escapeHtml(u.symbol)})</strong>${escapeHtml(subText)}${escapeHtml(factorText)}</li>`;
              })
              .join('')}
          </ul>
        </div>
      `
        : '';

    contentHtml = `
      ${defFrom && defTo ? renderReferenceTableHtml(defFrom, defTo, defTable) : ''}
      <article class="ct-seo-section">
        <section class="ct-seo-guide" aria-label="${escapeHtml(catDef.name)} Conversion Guide">
          <header class="ct-seo-header">
            <h1 class="ct-seo-title">${escapeHtml(seo.h1)}</h1>
            <p class="ct-seo-lead">${escapeHtml(seo.description)}</p>
          </header>
          <div class="ct-guide-content">
            <h2 class="ct-guide-heading">Understanding ${escapeHtml(catDef.name)} Conversions</h2>
            <p class="ct-guide-text">${escapeHtml(catInfo?.baseUnitInfo || seo.baseUnitInfo || '')}</p>
            ${unitsDirectoryHtml}
            ${renderPopularPairsHtml(catDef.id, catDef.name)}
          </div>
        </section>
        ${renderFaqsHtml(seo.faqs, `Common questions and verified calculations for ${catDef.name.toLowerCase()} units.`)}
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
        ${renderStaticFooterHtml()}
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
  let retries = 10;
  while (retries > 0) {
    try {
      fs.writeFileSync(targetPath, html, 'utf8');
      break;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      const end = Date.now() + 150;
      while (Date.now() < end) {}
    }
  }
}

console.log('[prerender] Starting static HTML generation...');
const startTime = Date.now();
let count = 0;

// 0. Pre-render Root Homepage (build/index.html)
const rootSeo = getSeoMetadata({ isRoot: true });
const rootHtml = renderPageHtml({ seo: rootSeo, isRoot: true });
writeHtml(indexHtmlPath, rootHtml);
count++;

// 1. Pre-render Category landing pages (e.g. build/length/index.html)
CATEGORIES.forEach((cat) => {
  const seo = getSeoMetadata({ categoryId: cat.id, isCategoryPage: true });
  const html = renderPageHtml({ seo, categoryId: cat.id, categoryName: cat.name });
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
  const html = renderPageHtml({
    seo,
    fromUnit,
    toUnit,
    categoryId: pair.categoryId,
    categoryName: pair.categoryName,
  });
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
  { from: 'cubic-yards', to: 'cubic-feet', cat: 'volume', fromId: 'cuyd', toId: 'cuft' },
  { from: 'cubic-feet', to: 'cubic-yards', cat: 'volume', fromId: 'cuft', toId: 'cuyd' },
  { from: 'newtons', to: 'pounds-force', cat: 'force', fromId: 'n', toId: 'lbf' },
  { from: 'cfm', to: 'lps', cat: 'flow_rate', fromId: 'cfm', toId: 'l_s' },
  { from: 'pixels', to: 'rem', cat: 'typography', fromId: 'px', toId: 'rem' },
  { from: 'rem', to: 'pixels', cat: 'typography', fromId: 'rem', toId: 'px' },
  { from: 'amps', to: 'milliamps', cat: 'current', fromId: 'a', toId: 'ma' },
  { from: 'mah', to: 'ah', cat: 'current', fromId: 'mah', toId: 'ah' },
  { from: 'lux', to: 'foot-candles', cat: 'illuminance', fromId: 'lx', toId: 'fc' },
  { from: 'foot-candles', to: 'lux', cat: 'illuminance', fromId: 'fc', toId: 'lx' },
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
  const html = renderPageHtml({ seo, fromUnit, toUnit, categoryId: alias.cat });
  writeHtml(path.resolve(buildDir, 'convert', `${alias.from}-to-${alias.to}`, 'index.html'), html);
  count++;
});

// 4. Pre-render High-Intent Hub Routes (e.g. build/convert/feet-inches-to-cm/index.html)
HUB_ROUTES.forEach((hub) => {
  const fromUnit = getUnit(hub.categoryId, hub.fromUnitId);
  const toUnit = getUnit(hub.categoryId, hub.toUnitId);
  const seo = getSeoMetadata({
    hubId: hub.id,
    categoryId: hub.categoryId,
    fromUnitId: hub.fromUnitId,
    toUnitId: hub.toUnitId,
    value: hub.defaultValue,
  });
  const html = renderPageHtml({
    seo,
    fromUnit,
    toUnit,
    categoryId: hub.categoryId,
    categoryName: hub.name,
  });
  writeHtml(path.resolve(buildDir, 'convert', hub.slug, 'index.html'), html);
  count++;
});

// 5. Output build/404.html as fallback for GitHub Pages and static web servers
writeHtml(path.resolve(buildDir, '404.html'), rootHtml);

const elapsedMs = Date.now() - startTime;
console.log(`[prerender] Successfully generated ${count} pre-rendered HTML files in ${elapsedMs}ms!`);
