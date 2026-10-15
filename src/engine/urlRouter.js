/**
 * ConvertThings URL Router & Programmatic SEO Engine
 * Handles clean path routing (e.g. /convert/km-to-mi, /convert/100-km-to-miles),
 * legacy query parameters, canonical URL generation, and XML sitemap generation.
 */

import { CATEGORIES, KITCHEN_CATEGORIES, UNIT_DEFINITIONS, getUnit, isFractionLike, isCompoundLike } from './conversions.js';
import { findUnit, findAllUnits } from './parser.js';

export const VALID_PRECISIONS = [
  'auto',
  '2',
  '4',
  'exact',
  'fraction_tape',
  'fraction',
  'fraction_improper',
  'tape',
  'fraction_16',
  'fraction_32',
  'fraction_64',
];

/**
 * Distinctive culinary tool units that define kitchen cooking intent
 * over general industrial fluid volume.
 */
export const CULINARY_PREFERRED_UNITS = new Set([
  'cup_us',
  'cup_metric',
  'tbsp_us',
  'tbsp_metric',
  'tsp_us',
  'dsp',
  'stick_butter',
  'pinch',
  'dash',
  'tad',
  'smidgen',
  'drop',
  'shot',
]);

/**
 * Resolves the canonical natural default category for a unit pair.
 * For 21 of 22 domains, this is 1-to-1 unambiguous.
 * For the 72 overlapping pairs between cooking and volume:
 * - Pairs containing culinary tools (cups, spoons, pinches, sticks, etc.) default to 'cooking'.
 * - Pairs between pure fluid/bulk measures (L, mL, gal, qt, pt, fl oz) default to 'volume'.
 *
 * @param {string} fromUnitId
 * @param {string} toUnitId
 * @returns {string|null} Canonical category ID or null
 */
export function getDefaultCategoryForPair(fromUnitId, toUnitId) {
  const inCooking = !!(getUnit('cooking', fromUnitId) && getUnit('cooking', toUnitId));
  const inVolume = !!(getUnit('volume', fromUnitId) && getUnit('volume', toUnitId));

  if (inCooking && inVolume) {
    return CULINARY_PREFERRED_UNITS.has(fromUnitId) || CULINARY_PREFERRED_UNITS.has(toUnitId)
      ? 'cooking'
      : 'volume';
  }
  if (inCooking) return 'cooking';
  if (inVolume) return 'volume';
  return null;
}


/**
 * Dedicated High-Intent Hub Routes targeting high-volume search queries
 * like human height (ft & in to cm), tape measure ruler fractions (in to mm),
 * and culinary baking drawer spoon breakdowns.
 */
export const HUB_ROUTES = [
  {
    id: 'feet-inches-to-cm',
    slug: 'feet-inches-to-cm',
    path: '/convert/feet-inches-to-cm',
    categoryId: 'length',
    fromUnitId: 'ft',
    toUnitId: 'cm',
    defaultValue: '5 ft 10 in',
    precision: 'auto',
    isKitchenMode: false,
    name: 'Height Converter (Feet & Inches to cm)',
    shortName: 'Height (ft+in ➔ cm)',
  },
  {
    id: 'fraction-inches-to-mm',
    slug: 'fraction-inches-to-mm',
    path: '/convert/fraction-inches-to-mm',
    categoryId: 'length',
    fromUnitId: 'in',
    toUnitId: 'mm',
    defaultValue: '13/16',
    precision: 'fraction_tape',
    isKitchenMode: false,
    name: 'Tape Measure Converter (Fractional Inches to mm)',
    shortName: 'Tape Measure (Fractions ➔ mm)',
  },
  {
    id: 'baking-fractions',
    slug: 'baking-fractions',
    path: '/convert/baking-fractions',
    categoryId: 'cooking',
    fromUnitId: 'cup_us',
    toUnitId: 'tbsp_us',
    defaultValue: '1/3',
    precision: 'auto',
    isKitchenMode: true,
    name: 'Baking Measurements & Kitchen Drawer Fractions',
    shortName: 'Baking Drawer Fractions',
  },
  {
    id: 'flour-cups-to-grams',
    slug: 'flour-cups-to-grams',
    path: '/convert/flour-cups-to-grams',
    categoryId: 'cooking',
    fromUnitId: 'cup_us',
    toUnitId: 'g',
    defaultValue: '1',
    precision: 'auto',
    isKitchenMode: false,
    ingredient: 'flour_ap',
    name: 'Flour Cups to Grams Converter (Baking Weight)',
    shortName: 'Flour (Cups ➔ Grams)',
  },
];

/**
 * Retrieves hub route definition by ID or slug.
 *
 * @param {string} hubIdOrSlug e.g. 'feet-inches-to-cm'
 * @returns {object|null}
 */
export function getHubRoute(hubIdOrSlug) {
  if (!hubIdOrSlug) return null;
  const clean = String(hubIdOrSlug)
    .trim()
    .toLowerCase()
    .replace(/^\/convert\/?/, '')
    .replace(/^\//, '')
    .replace(/\/$/, '');
  return HUB_ROUTES.find((h) => h.id === clean || h.slug === clean) || null;
}

/**
 * Parses current location (pathname and search) into structured conversion state.
 * Supports:
 * 0. High-intent hub routes: /convert/feet-inches-to-cm, /convert/fraction-inches-to-mm, /convert/baking-fractions, /convert/flour-cups-to-grams
 * 1. Clean unit pair paths: /convert/km-to-mi, /convert/celsius-to-fahrenheit
 * 2. Specific calculation paths: /convert/100-km-to-miles, /convert/72-f-to-c
 * 3. Category paths: /length, /temperature, /cooking
 * 4. Query parameters: ?cat=length&from=km&to=mi&v=100&p=4
 *
 * @param {string} pathname Window location pathname (e.g. '/convert/km-to-mi')
 * @param {string} search Window location search query (e.g. '?v=100&p=4')
 * @returns {object|null} Initial state or null if no route matched
 */
export function parseRoute(pathname = '', search = '') {
  try {
    let precision = undefined;
    let isKitchenMode = undefined;
    let queryCategory = undefined;
    let ingredient = undefined;
    if (search) {
      const pParams = new URLSearchParams(search);
      const rawP = pParams.get('p') || pParams.get('prec');
      if (rawP && VALID_PRECISIONS.includes(rawP.toLowerCase())) {
        precision = rawP.toLowerCase();
      }

      const rawCat = pParams.get('cat') || pParams.get('category');
      if (rawCat && UNIT_DEFINITIONS[rawCat.toLowerCase()]) {
        queryCategory = rawCat.toLowerCase();
      }

      const rawIng = pParams.get('ing') || pParams.get('ingredient');
      if (rawIng) {
        ingredient = rawIng.trim().toLowerCase();
      }

      const rawK = pParams.get('kitchen') ?? pParams.get('mode');
      if (rawK !== null && rawK !== undefined) {
        const cleanK = String(rawK).trim().toLowerCase();
        if (cleanK === '1' || cleanK === 'true' || cleanK === 'kitchen' || cleanK === '') {
          isKitchenMode = true;
        } else if (cleanK === '0' || cleanK === 'false' || cleanK === 'standard') {
          isKitchenMode = false;
        }
      }
    }

    const cleanPath = (pathname || '').trim().toLowerCase();
    const normalizedPath = cleanPath.replace(/\/$/, '') || '/';

    // 0. Dedicated Kitchen & Baking Studio (/kitchen)
    if (normalizedPath === '/kitchen') {
      let ing = ingredient || 'flour_ap';
      let staple = KITCHEN_CATEGORIES.find((k) => k.id === ing) || KITCHEN_CATEGORIES[0];
      let defFrom = staple.defaultFrom || 'cup_us';
      let defTo = staple.defaultTo || 'g';

      let val = '1';
      if (search) {
        const params = new URLSearchParams(search);
        const rawV = params.get('v') ?? params.get('val');
        if (rawV !== null) {
          const cleanV = rawV.trim().replace(/,/g, '');
          if (cleanV !== '' && (!isNaN(cleanV) || isFractionLike(cleanV) || isCompoundLike(cleanV))) {
            val = cleanV;
          }
        }
        const fromP = params.get('from');
        const toP = params.get('to');
        if (fromP && (getUnit(staple.id, fromP) || getUnit('cooking', fromP))) {
          defFrom = fromP;
        }
        if (toP && (getUnit(staple.id, toP) || getUnit('cooking', toP))) {
          defTo = toP;
        }
      }

      return {
        categoryId: staple.id,
        fromUnitId: defFrom,
        toUnitId: defTo,
        fromValue: val,
        isCategoryPage: true,
        isKitchenStudio: true,
        ingredient: staple.id,
        ...(precision ? { precision } : {}),
        isKitchenMode: staple.id === 'water' || staple.id === 'liquid',
      };
    }

    // 0. Check dedicated High-Intent Hub routes
    const matchedHub = HUB_ROUTES.find(
      (h) => normalizedPath === h.path || normalizedPath === `/${h.slug}` || cleanPath === h.path
    );
    if (matchedHub) {
      let value = matchedHub.defaultValue;
      if (search) {
        const params = new URLSearchParams(search);
        const rawQueryVal = params.get('v') ?? params.get('val');
        if (rawQueryVal !== null) {
          const cleanQueryVal = rawQueryVal.trim().replace(/,/g, '');
          if (
            cleanQueryVal !== '' &&
            (!isNaN(cleanQueryVal) || isFractionLike(cleanQueryVal) || isCompoundLike(cleanQueryVal))
          ) {
            value = cleanQueryVal;
          }
        }
      }

      return {
        categoryId: matchedHub.categoryId,
        fromUnitId: matchedHub.fromUnitId,
        toUnitId: matchedHub.toUnitId,
        fromValue: value,
        precision: precision !== undefined ? precision : matchedHub.precision,
        isKitchenMode: isKitchenMode !== undefined ? isKitchenMode : matchedHub.isKitchenMode,
        ...(matchedHub.ingredient || ingredient ? { ingredient: matchedHub.ingredient || ingredient } : {}),
        isHubPage: true,
        hubId: matchedHub.id,
      };
    }

    // 1. Check clean /convert/ routes
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

          const existsInCooking = !!(getUnit('cooking', fromId) && getUnit('cooking', toId));
          const existsInVolume = !!(getUnit('volume', fromId) && getUnit('volume', toId));

          if (
            queryCategory &&
            ((queryCategory === 'cooking' && existsInCooking) ||
              (queryCategory === 'volume' && existsInVolume) ||
              (getUnit(queryCategory, fromId) && getUnit(queryCategory, toId)))
          ) {
            // Explicit ?cat= query param takes precedence whenever both units exist in the requested category
            categoryId = queryCategory;
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (isKitchenMode === true && existsInCooking) {
            // Explicit ?kitchen=1 query param directs ambiguous or cooking units to cooking domain
            categoryId = 'cooking';
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (existsInCooking && existsInVolume) {
            // Both units exist in both Cooking and Volume (the 72 shared pairs).
            // Natural home: culinary tools (cups, spoons, pinches) -> Cooking; pure fluid measures (L, mL, gal, etc.) -> Volume.
            const isCulinaryIntent = CULINARY_PREFERRED_UNITS.has(fromId) || CULINARY_PREFERRED_UNITS.has(toId);
            categoryId = isCulinaryIntent ? 'cooking' : 'volume';
            fromUnitId = fromId;
            toUnitId = toId;
          } else if (existsInCooking) {
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
            // If query param ?v= or ?val= exists, query param can override value
            let value = valStr || '1';
            if (search) {
              const params = new URLSearchParams(search);
              const rawQueryVal = params.get('v') ?? params.get('val');
              if (rawQueryVal !== null) {
                const cleanQueryVal = rawQueryVal.trim().replace(/,/g, '');
                if (cleanQueryVal !== '' && (!isNaN(cleanQueryVal) || isFractionLike(cleanQueryVal) || isCompoundLike(cleanQueryVal))) {
                  value = cleanQueryVal;
                }
              }
            }

            return {
              categoryId,
              fromUnitId,
              toUnitId,
              fromValue: value,
              ...(precision ? { precision } : {}),
              ...(isKitchenMode !== undefined ? { isKitchenMode } : {}),
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
        ...(precision ? { precision } : {}),
        ...(isKitchenMode !== undefined ? { isKitchenMode } : {}),
      };
    }

    // 3. Fallback to query parameters (?cat=...&from=...&to=...&v=...)
    if (search) {
      const params = new URLSearchParams(search);
      const cat = params.get('cat');
      const from = params.get('from');
      const to = params.get('to');
      const rawVal = params.get('v') ?? params.get('val');
      const cleanVal = rawVal !== null ? rawVal.trim().replace(/,/g, '') : null;

      if (cat && UNIT_DEFINITIONS[cat]) {
        const catDef = CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0];
        const validFrom = getUnit(cat, from) ? from : catDef.defaultFrom;
        const validTo = getUnit(cat, to) ? to : catDef.defaultTo;
        const isValidVal = cleanVal !== null && cleanVal !== '' && (!isNaN(cleanVal) || isFractionLike(cleanVal) || isCompoundLike(cleanVal));
        return {
          categoryId: cat,
          fromUnitId: validFrom,
          toUnitId: validTo,
          fromValue: isValidVal ? cleanVal : '1',
          ...(precision ? { precision } : {}),
          ...(isKitchenMode !== undefined ? { isKitchenMode } : {}),
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
 * @param {string} [precision='auto'] Selected precision formatting
 * @param {boolean} [isKitchenMode=false] Whether Kitchen Drawer Mode is active
 * @returns {string} Clean URL path (e.g. '/convert/km-to-mi', '/convert/100-km-to-mi', or '/convert/100-km-to-mi?p=4')
 */
export function formatRoutePath(
  categoryId,
  fromUnitId,
  toUnitId,
  value = '1',
  precision = 'auto',
  isKitchenMode = false,
  hubId = null,
  ingredient = null,
  isKitchenStudio = false
) {
  if (isKitchenStudio) {
    const queryParams = [];
    if (ingredient && ingredient !== 'flour_ap' && ingredient !== 'liquid') {
      queryParams.push(`ing=${encodeURIComponent(ingredient)}`);
    }
    const rawVal = value !== null && value !== undefined ? String(value).trim().replace(/,/g, '') : '1';
    const valStr = rawVal.endsWith('.') ? rawVal.slice(0, -1) : rawVal;
    if (valStr !== '' && valStr !== '1') {
      queryParams.push(`v=${encodeURIComponent(valStr)}`);
    }
    if (precision && precision !== 'auto' && VALID_PRECISIONS.includes(precision)) {
      queryParams.push(`p=${encodeURIComponent(precision)}`);
    }
    return queryParams.length > 0 ? `/kitchen?${queryParams.join('&')}` : '/kitchen';
  }

  if (hubId) {
    const hub = getHubRoute(hubId);
    if (hub && hub.categoryId === categoryId && hub.fromUnitId === fromUnitId && hub.toUnitId === toUnitId) {
      const rawVal = value !== null && value !== undefined ? String(value).trim().replace(/,/g, '') : hub.defaultValue;
      const valStr = rawVal.endsWith('.') ? rawVal.slice(0, -1) : rawVal;
      const hasCustomValue = valStr !== '' && valStr !== hub.defaultValue;
      const queryParams = [];

      if (hasCustomValue) {
        queryParams.push(`v=${encodeURIComponent(valStr)}`);
      }

      if (categoryId === 'cooking' && isKitchenMode !== hub.isKitchenMode) {
        queryParams.push(`kitchen=${isKitchenMode ? '1' : '0'}`);
      } else if (precision && precision !== hub.precision && VALID_PRECISIONS.includes(precision)) {
        queryParams.push(`p=${encodeURIComponent(precision)}`);
      }

      if (queryParams.length > 0) {
        return `${hub.path}?${queryParams.join('&')}`;
      }
      return hub.path;
    }
  }

  if (!fromUnitId || !toUnitId) return '/';

  const rawVal = value !== null && value !== undefined ? String(value).trim().replace(/,/g, '') : '1';
  // Avoid malformed URL segments while typing trailing dots (e.g. "1." -> "1")
  const valStr = rawVal.endsWith('.') ? rawVal.slice(0, -1) : rawVal;
  const hasCustomValue = valStr !== '' && valStr !== '1';

  let path = `/convert/${fromUnitId}-to-${toUnitId}`;
  const queryParams = [];

  if (hasCustomValue) {
    if (!isNaN(valStr)) {
      path = `/convert/${encodeURIComponent(valStr)}-${fromUnitId}-to-${toUnitId}`;
    } else {
      queryParams.push(`v=${encodeURIComponent(valStr)}`);
    }
  }

  const isCookingVolumeShared = !!(
    getUnit('cooking', fromUnitId) &&
    getUnit('cooking', toUnitId) &&
    getUnit('volume', fromUnitId) &&
    getUnit('volume', toUnitId)
  );

  if (isCookingVolumeShared) {
    const defaultCat = (CULINARY_PREFERRED_UNITS.has(fromUnitId) || CULINARY_PREFERRED_UNITS.has(toUnitId))
      ? 'cooking'
      : 'volume';

    if (categoryId === 'cooking') {
      if (isKitchenMode) {
        queryParams.push('kitchen=1');
      } else if (defaultCat !== 'cooking') {
        // Explicitly retain cooking domain for fluid measures (e.g. l-to-gal_us?cat=cooking)
        queryParams.push('cat=cooking');
      }
    } else if (categoryId === 'volume') {
      if (defaultCat !== 'volume') {
        // Explicitly retain volume domain for culinary tools (e.g. cup_us-to-tbsp_us?cat=volume)
        queryParams.push('cat=volume');
      }
    }
  } else if (categoryId === 'cooking' && isKitchenMode) {
    // In Kitchen Mode, output uses physical measuring tools/drawer breakdown
    queryParams.push('kitchen=1');
  }

  if (precision && precision !== 'auto' && VALID_PRECISIONS.includes(precision)) {
    // In Kitchen Mode (cooking drawer tools), precision is omitted
    if (!(categoryId === 'cooking' && isKitchenMode)) {
      queryParams.push(`p=${encodeURIComponent(precision)}`);
    }
  }

  if (categoryId === 'cooking' && ingredient && ingredient !== 'liquid') {
    queryParams.push(`ing=${encodeURIComponent(ingredient)}`);
  }

  if (queryParams.length > 0) {
    return `${path}?${queryParams.join('&')}`;
  }

  return path;
}

/**
 * Generates all unique valid unit pairs across all 22 measurement domains.
 * Deduplicates the 72 overlapping pairs between cooking and volume to their
 * natural canonical category.
 *
 * @returns {Array<object>} Array of unit pair metadata objects
 */
export function getAllUnitPairs() {
  const pairs = [];
  const seenPaths = new Set();

  CATEGORIES.forEach((cat) => {
    const units = UNIT_DEFINITIONS[cat.id]?.units || [];

    for (let i = 0; i < units.length; i++) {
      for (let j = 0; j < units.length; j++) {
        if (i === j) continue;
        const fromUnit = units[i];
        const toUnit = units[j];

        const defaultCat = getDefaultCategoryForPair(fromUnit.id, toUnit.id);
        // Deduplicate pairs shared across multiple categories (e.g. cooking vs volume)
        // by reserving the canonical route exclusively for its natural home
        if (defaultCat && defaultCat !== cat.id) {
          continue;
        }

        const path = `/convert/${fromUnit.id}-to-${toUnit.id}`;
        if (seenPaths.has(path)) continue;
        seenPaths.add(path);

        pairs.push({
          categoryId: cat.id,
          categoryName: cat.name,
          fromUnitId: fromUnit.id,
          toUnitId: toUnit.id,
          fromName: fromUnit.name,
          toName: toUnit.name,
          path,
          url: `https://convertthings.com${path}`,
          isCommonPair: fromUnit.tier === 'common' && toUnit.tier === 'common',
          isIndexable: true,
        });
      }
    }
  });

  return pairs;
}

/**
 * Generates an XML sitemap for search engine bots indexing.
 * Includes the homepage, Kitchen Studio, About/Privacy/Terms pages, high-intent hubs,
 * all 22 category landing pages, and all canonical pre-rendered unit pairs.
 *
 * @param {string} domain Base domain (defaults to 'https://www.convertthings.com')
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

  // 1.5 Dedicated Kitchen & Baking Studio
  xml += `  <url>\n`;
  xml += `    <loc>${domain}/kitchen</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // 1.8 Trust, E-E-A-T & Legal Pages
  ['/about.html', '/privacy.html', '/terms.html'].forEach((legalPath) => {
    xml += `  <url>\n`;
    xml += `    <loc>${domain}${legalPath}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. High-Intent Hub Landing Pages
  HUB_ROUTES.forEach((hub) => {
    xml += `  <url>\n`;
    xml += `    <loc>${domain}${hub.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  // 3. Category Landing Pages
  CATEGORIES.forEach((cat) => {
    xml += `  <url>\n`;
    xml += `    <loc>${domain}/${cat.id}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  // 4. Canonical Pre-Rendered Unit Pairs
  pairs.forEach((pair) => {
    const priority = pair.isCommonPair ? '0.8' : '0.7';
    xml += `  <url>\n`;
    xml += `    <loc>${domain}${pair.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}
