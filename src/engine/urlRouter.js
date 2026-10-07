/**
 * ConvertThings URL Router & Programmatic SEO Engine
 * Handles clean path routing (e.g. /convert/km-to-mi, /convert/100-km-to-miles),
 * legacy query parameters, canonical URL generation, and XML sitemap generation.
 */

import { CATEGORIES, UNIT_DEFINITIONS, getUnit } from './conversions.js';
import { findUnit, findAllUnits } from './parser.js';

/**
 * Parses current location (pathname and search) into structured conversion state.
 * Supports:
 * 1. Clean unit pair paths: /convert/km-to-mi, /convert/celsius-to-fahrenheit
 * 2. Specific calculation paths: /convert/100-km-to-miles, /convert/72-f-to-c
 * 3. Category paths: /length, /temperature, /cooking
 * 4. Query parameters: ?cat=length&from=km&to=mi&v=100
 *
 * @param {string} pathname Window location pathname (e.g. '/convert/km-to-mi')
 * @param {string} search Window location search query (e.g. '?v=100')
 * @returns {object|null} Initial state or null if no route matched
 */
export function parseRoute(pathname = '', search = '') {
  try {
    // 1. Check clean /convert/ routes
    const cleanPath = (pathname || '').trim().toLowerCase();

    if (cleanPath.startsWith('/convert/')) {
      const rawSlug = cleanPath.replace(/^\/convert\/?/, '').replace(/\/$/, '');
      const slug = decodeURIComponent(rawSlug);
      // Match optional value prefix: e.g. "100-km-to-miles", "-40-c-to-f", "0.5_cup-to-ml", "1.-km-to-mi", or "km-to-mi"
      const pairMatch = slug.match(/^(?:([+-]?(?:[0-9,]+(?:\.[0-9]*)?|\.[0-9]+)(?:e[+-]?[0-9]+)?)[-_])?([a-z0-9_°'/²³µ]+)-to-([a-z0-9_°'/²³µ]+)$/i);

      if (pairMatch) {
        const rawValStr = pairMatch[1] ? pairMatch[1].replace(/,/g, '') : undefined;
        const valStr = rawValStr ? rawValStr.replace(/\.$/, '') : undefined;
        const fromToken = pairMatch[2];
        const toToken = pairMatch[3];

        const fromCandidates = findAllUnits(fromToken);
        let fromMatch = null;
        let toMatch = null;

        for (const fromCand of fromCandidates) {
          const toCand = findUnit(toToken, fromCand.categoryId);
          if (
            toCand &&
            (toCand.categoryId === fromCand.categoryId ||
              getUnit(fromCand.categoryId, toCand.unit.id) ||
              getUnit(toCand.categoryId, fromCand.unit.id))
          ) {
            fromMatch = fromCand;
            toMatch = toCand;
            break;
          }
        }

        if (fromMatch && toMatch) {
          let categoryId = null;
          let fromUnitId = null;
          let toUnitId = null;

          let fromId = fromMatch.unit.id;
          let toId = toMatch.unit.id;

          // If both units exist in cooking (e.g. tbsp, tsp, cup, stick of butter), prioritize cooking category
          if (getUnit('cooking', fromId) && getUnit('cooking', toId)) {
            categoryId = 'cooking';
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (fromMatch.categoryId === toMatch.categoryId) {
            categoryId = fromMatch.categoryId;
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (getUnit(fromMatch.categoryId, toId)) {
            // Target unit also exists in fromUnit's category (e.g., cooking/volume overlap)
            categoryId = fromMatch.categoryId;
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (getUnit(toMatch.categoryId, fromId)) {
            // Source unit also exists in toUnit's category
            categoryId = toMatch.categoryId;
            fromUnitId = fromId;
            toUnitId = toId;
          }

          if (categoryId && fromUnitId && toUnitId) {
            // If query param ?v= exists, query param can override value
            let value = valStr || '1';
            if (search) {
              const params = new URLSearchParams(search);
              const rawQueryVal = params.get('v');
              if (rawQueryVal !== null) {
                const cleanQueryVal = rawQueryVal.replace(/,/g, '');
                if (!isNaN(cleanQueryVal)) {
                  value = cleanQueryVal;
                }
              }
            }

            return {
              categoryId,
              fromUnitId,
              toUnitId,
              fromValue: value,
            };
          }
        }
      }
    }

    // 2. Check direct category paths (e.g. /length, /cooking)
    const categorySlug = cleanPath.replace(/^\//, '').replace(/\/$/, '');
    const matchedCategory = CATEGORIES.find((c) => c.id === categorySlug);
    if (matchedCategory) {
      return {
        categoryId: matchedCategory.id,
        fromUnitId: matchedCategory.defaultFrom,
        toUnitId: matchedCategory.defaultTo,
        fromValue: '1',
        isCategoryPage: true,
      };
    }

    // 3. Fallback to query parameters (?cat=...&from=...&to=...&v=...)
    if (search) {
      const params = new URLSearchParams(search);
      const cat = params.get('cat');
      const from = params.get('from');
      const to = params.get('to');
      const rawVal = params.get('v');
      const cleanVal = rawVal !== null ? rawVal.replace(/,/g, '') : null;

      if (cat && UNIT_DEFINITIONS[cat]) {
        const catDef = CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0];
        const validFrom = getUnit(cat, from) ? from : catDef.defaultFrom;
        const validTo = getUnit(cat, to) ? to : catDef.defaultTo;
        return {
          categoryId: cat,
          fromUnitId: validFrom,
          toUnitId: validTo,
          fromValue: cleanVal !== null && !isNaN(cleanVal) ? cleanVal : '1',
        };
      }
    }
  } catch (err) {
    console.debug('Error parsing route:', err);
  }

  return null;
}

/**
 * Builds the canonical relative URL path for a conversion state.
 *
 * @param {string} categoryId Category identifier
 * @param {string} fromUnitId Source unit ID
 * @param {string} toUnitId Target unit ID
 * @param {string|number} value Current calculation value
 * @returns {string} Clean URL path (e.g. '/convert/km-to-mi' or '/convert/100-km-to-mi')
 */
export function formatRoutePath(categoryId, fromUnitId, toUnitId, value = '1') {
  if (!fromUnitId || !toUnitId) return '/';

  const rawVal = value !== null && value !== undefined ? String(value).trim().replace(/,/g, '') : '1';
  // Avoid malformed URL segments while typing trailing dots (e.g. "1." -> "1")
  const valStr = rawVal.endsWith('.') ? rawVal.slice(0, -1) : rawVal;
  const hasCustomValue = valStr !== '' && valStr !== '1' && !isNaN(valStr);

  if (hasCustomValue) {
    return `/convert/${encodeURIComponent(valStr)}-${fromUnitId}-to-${toUnitId}`;
  }

  return `/convert/${fromUnitId}-to-${toUnitId}`;
}

/**
 * Generates all unique valid unit pairs across all 15 measurement domains.
 *
 * @returns {Array<object>} Array of unit pair metadata objects
 */
export function getAllUnitPairs() {
  const pairs = [];

  CATEGORIES.forEach((cat) => {
    const units = UNIT_DEFINITIONS[cat.id]?.units || [];

    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units.length; j++) {
        if (i === j) continue;
        const fromUnit = units[i];
        const toUnit = units[j];

        pairs.push({
          categoryId: cat.id,
          categoryName: cat.name,
          fromUnitId: fromUnit.id,
          toUnitId: toUnit.id,
          fromName: fromUnit.name,
          toName: toUnit.name,
          path: `/convert/${fromUnit.id}-to-${toUnit.id}`,
          url: `https://convertthings.com/convert/${fromUnit.id}-to-${toUnit.id}`,
        });
      }
    }
  });

  return pairs;
}

/**
 * Generates an XML sitemap for search engine bots indexing.
 *
 * @param {string} domain Base domain (defaults to 'https://convertthings.com')
 * @returns {string} Valid XML sitemap string
 */
export function generateSitemapXml(domain = 'https://www.convertthings.com') {
  const today = new Date().toISOString().split('T')[0];
  const pairs = getAllUnitPairs();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n`;
  xml += `    <loc>${domain}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 2. Category Landing Pages
  CATEGORIES.forEach((cat) => {
    xml += `  <url>\n`;
    xml += `    <loc>${domain}/${cat.id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. High-Value Unit Pairs
  pairs.forEach((pair) => {
    xml += `  <url>\n`;
    xml += `    <loc>${domain}${pair.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}
