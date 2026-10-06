/**
 * Natural Language Query Parser for ConvertThings
 * Parses inputs like:
 * - "100 km to miles", "72 f in c", "150 lbs into kg", "500 sq ft to sqm"
 * - "convert 100 km to miles"
 * - "how many miles in 100 km", "how many feet in a meter"
 * - "50 mph" (auto converts to paired opposite e.g. km/h)
 * - "100 km mi"
 *
 * Enforces strict category integrity: cross-category nonsense (e.g. feet to seconds)
 * is strictly rejected. Prefix matching is only permitted for tokens >= 3 characters.
 */

import { UNIT_DEFINITIONS, CATEGORIES, convertUnits, formatNumber, getUnit } from './conversions.js';

// Category-indexed lookup: { [categoryId]: { [aliasKey]: unit } }
const LOOKUP_BY_CAT = {};
// Global exact lookup: { [aliasKey]: Array<{ categoryId, unit }> }
const GLOBAL_EXACT = {};
// Flat list for prefix matching
const ALL_UNITS_LIST = [];

// Natural complementary unit pairs for single-unit queries (e.g. "50 mph" -> km/h)
const COMPLEMENTARY_PAIRS = {
  length: { m: 'ft', ft: 'm', km: 'mi', mi: 'km', cm: 'in', in: 'cm', mm: 'in', yd: 'm', nmi: 'km', ly: 'km' },
  mass: { kg: 'lb', lb: 'kg', g: 'oz', oz: 'g', mg: 'gr', t: 'ton_us', ton_us: 't', st: 'kg' },
  temperature: { c: 'f', f: 'c', k: 'c', r: 'f' },
  area: { sqm: 'sqft', sqft: 'sqm', sqkm: 'sqmi', sqmi: 'sqkm', ac: 'ha', ha: 'ac' },
  volume: { l: 'gal_us', gal_us: 'l', ml: 'floz_us', floz_us: 'ml', cup_us: 'ml' },
  speed: { kmh: 'mph', mph: 'kmh', mps: 'mph', knot: 'kmh', mach: 'mph' },
  time: { h: 'min', min: 's', s: 'ms', d: 'h', wk: 'd', yr: 'd' },
  digital: { gb: 'mb', mb: 'gb', tb: 'gb', kb: 'mb', b: 'byte', byte: 'b' },
  data_rate: { mbps: 'mbs', mbs: 'mbps', gbps: 'gbs', kbps: 'kbs' },
  pressure: { bar: 'psi', psi: 'bar', pa: 'psi', kpa: 'psi', atm: 'psi', torr: 'psi' },
  energy: { j: 'cal', cal: 'j', kj: 'kcal', kcal: 'kj', kwh: 'j', btu: 'j' },
  power: { kw: 'hp', hp: 'kw', w: 'hp', mw: 'kw' },
  angle: { deg: 'rad', rad: 'deg', grad: 'deg', arcmin: 'deg', arcsec: 'deg' },
  fuel: { mpg_us: 'l100km', l100km: 'mpg_us', mpg_uk: 'l100km', kml: 'mpg_us' },
  cooking: { cup_us: 'tbsp_us', tbsp_us: 'tsp_us', tsp_us: 'ml', floz_us: 'ml' },
};

// Build fast indexes
Object.entries(UNIT_DEFINITIONS).forEach(([catId, catDef]) => {
  LOOKUP_BY_CAT[catId] = {};
  catDef.units.forEach((unit) => {
    ALL_UNITS_LIST.push({ categoryId: catId, unit });

    const exactKeys = [
      unit.id.toLowerCase(),
      unit.symbol.toLowerCase().replace(/^°/, ''),
      unit.name.toLowerCase(),
      unit.plural.toLowerCase(),
      ...(unit.aliases || []).map((a) => a.toLowerCase().replace(/^°/, ''))
    ].filter(Boolean);

    const uniqueKeys = [...new Set(exactKeys)];

    uniqueKeys.forEach((key) => {
      if (!LOOKUP_BY_CAT[catId][key]) {
        LOOKUP_BY_CAT[catId][key] = unit;
      }
      if (!GLOBAL_EXACT[key]) {
        GLOBAL_EXACT[key] = [];
      }
      if (!GLOBAL_EXACT[key].some((e) => e.categoryId === catId && e.unit.id === unit.id)) {
        GLOBAL_EXACT[key].push({ categoryId: catId, unit });
      }
    });
  });
});

/**
 * Helper to perform scored prefix matching against a list of unit items.
 */
function findPrefixMatches(clean, list) {
  const matches = [];
  for (const item of list) {
    const candidateKeys = [
      item.unit.name.toLowerCase(),
      item.unit.plural.toLowerCase(),
      item.unit.id.toLowerCase(),
      ...(item.unit.aliases || []).map((a) => a.toLowerCase().replace(/^°/, ''))
    ];

    for (const k of candidateKeys) {
      if (k.startsWith(clean)) {
        matches.push({
          ...item,
          diff: k.length - clean.length,
          matchKey: k
        });
        break;
      }
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => a.diff - b.diff);
  }
  return matches;
}

/**
 * Finds all candidate units matching a token, optionally prioritized by category hint.
 * @param {string} token
 * @param {string|null} categoryHint
 * @returns {Array<{ categoryId: string, unit: object }>}
 */
export function findAllUnits(token, categoryHint = null) {
  if (!token) return [];
  const clean = String(token).trim().toLowerCase().replace(/^°/, '');
  if (!clean) return [];

  // 1. Exact match within categoryHint if provided
  if (categoryHint && LOOKUP_BY_CAT[categoryHint]) {
    if (LOOKUP_BY_CAT[categoryHint][clean]) {
      return [{ categoryId: categoryHint, unit: LOOKUP_BY_CAT[categoryHint][clean] }];
    }
    // Plural s stripping (only for words >= 3 chars, e.g. "meters" -> "meter")
    if (clean.length > 2 && clean.endsWith('s') && LOOKUP_BY_CAT[categoryHint][clean.slice(0, -1)]) {
      return [{ categoryId: categoryHint, unit: LOOKUP_BY_CAT[categoryHint][clean.slice(0, -1)] }];
    }

    // Check shared domain overlap (cooking <-> volume)
    const compatCat = categoryHint === 'cooking' ? 'volume' : categoryHint === 'volume' ? 'cooking' : null;
    if (compatCat && LOOKUP_BY_CAT[compatCat]) {
      if (LOOKUP_BY_CAT[compatCat][clean]) {
        return [{ categoryId: compatCat, unit: LOOKUP_BY_CAT[compatCat][clean] }];
      }
      if (clean.length > 2 && clean.endsWith('s') && LOOKUP_BY_CAT[compatCat][clean.slice(0, -1)]) {
        return [{ categoryId: compatCat, unit: LOOKUP_BY_CAT[compatCat][clean.slice(0, -1)] }];
      }
    }
  }

  // 2. Global exact match across all categories
  if (GLOBAL_EXACT[clean] && GLOBAL_EXACT[clean].length > 0) {
    return GLOBAL_EXACT[clean];
  }
  if (clean.length > 2 && clean.endsWith('s') && GLOBAL_EXACT[clean.slice(0, -1)]) {
    return GLOBAL_EXACT[clean.slice(0, -1)];
  }

  // 3. Prefix matching: strictly requires clean.length >= 3.
  // 1-character and 2-character tokens MUST be exact symbols/IDs (e.g. "m", "km", "ft").
  // Never prefix-match on "se", "me", "a", "p", etc.
  if (clean.length >= 3) {
    // If categoryHint provided, check categoryHint first
    if (categoryHint && LOOKUP_BY_CAT[categoryHint]) {
      const catMatches = findPrefixMatches(clean, ALL_UNITS_LIST.filter((i) => i.categoryId === categoryHint));
      if (catMatches.length > 0) {
        return [{ categoryId: catMatches[0].categoryId, unit: catMatches[0].unit }];
      }
    }

    // Global prefix match across all units
    const globalMatches = findPrefixMatches(clean, ALL_UNITS_LIST);
    if (globalMatches.length > 0) {
      return [{ categoryId: globalMatches[0].categoryId, unit: globalMatches[0].unit }];
    }
  }

  return [];
}

/**
 * Finds a single matching unit for a query token.
 * @param {string} token
 * @param {string|null} categoryHint
 * @returns {{ categoryId: string, unit: object }|null}
 */
export function findUnit(token, categoryHint = null) {
  const all = findAllUnits(token, categoryHint);
  return all.length > 0 ? all[0] : null;
}

/**
 * Parses user input into a validated conversion request.
 * Strictly verifies measurement domains: never matches cross-category nonsense.
 *
 * Supports patterns:
 * - "how many [toUnit] in/are in [val]? [fromUnit]" (e.g. "how many miles in 100 km")
 * - "[val]? [fromUnit] (to|in|into|as|=|convert to) [toUnit]" (e.g. "100 km to miles", "72 f in c")
 * - "[val] [fromUnit] [toUnit]" (e.g. "100 km mi")
 * - "[val] [fromUnit]" (e.g. "50 mph" -> auto converts to km/h)
 *
 * @param {string} rawQuery
 * @returns {object|null}
 */
export function parseConversionQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  let query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  // Strip leading "convert " if present (e.g. "convert 100 km to miles")
  if (query.startsWith('convert ')) {
    query = query.replace(/^convert\s+/i, '').trim();
  }

  // Pattern 0: Natural question format: "how many [toUnit] in [val]? [fromUnit]"
  const patternHowMany = /^(?:how many|how much)\s+([a-z0-9_°'"/²³µ\s]+?)\s+(?:in|are in|are there in)\s+(?:([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)\s*)?(?:a\s+|an\s+)?([a-z0-9_°'"/²³µ\s]+)$/i;
  const matchHowMany = query.match(patternHowMany);
  if (matchHowMany) {
    const toToken = matchHowMany[1].trim();
    const rawVal = matchHowMany[2]?.trim();
    const val = rawVal ? parseFloat(rawVal) : 1;
    const fromToken = matchHowMany[3].trim();
    if (!isNaN(val)) {
      const fromCandidates = findAllUnits(fromToken);
      for (const fromCand of fromCandidates) {
        const catId = fromCand.categoryId;
        const toCand = findUnit(toToken, catId);
        if (toCand && toCand.categoryId === catId) {
          const converted = convertUnits(val, catId, fromCand.unit.id, toCand.unit.id);
          if (converted !== null && !isNaN(converted) && isFinite(converted)) {
            return {
              success: true,
              categoryId: catId,
              fromUnit: fromCand.unit,
              toUnit: toCand.unit,
              value: val,
              result: converted,
              formattedResult: formatNumber(converted),
              query: rawQuery,
            };
          }
        }
      }
    }
  }

  // Pattern 1: [value]? [unitA] (to|in|into|as|=|convert to) [unitB]
  const patternFull = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?\s*)?([a-z0-9_°'"/²³µ\s]+?)\s+(?:to|in|into|as|=|convert to)\s+([a-z0-9_°'"/²³µ\s]+)$/i;
  const matchFull = query.match(patternFull);

  if (matchFull) {
    const rawVal = matchFull[1]?.trim();
    const val = rawVal ? parseFloat(rawVal) : 1;
    if (isNaN(val)) return null;

    const fromToken = matchFull[2].trim();
    const toToken = matchFull[3].trim();

    const fromCandidates = findAllUnits(fromToken);
    if (!fromCandidates || fromCandidates.length === 0) return null;

    for (const fromCand of fromCandidates) {
      const catId = fromCand.categoryId;
      // Search toToken with category hint
      const toCand = findUnit(toToken, catId);
      if (toCand) {
        let targetCat = catId;
        let uFrom = getUnit(targetCat, fromCand.unit.id);
        let uTo = getUnit(targetCat, toCand.unit.id);

        // Support cooking <-> volume cross-category unit overlap
        if (!uTo && (catId === 'cooking' || catId === 'volume')) {
          const altCat = catId === 'cooking' ? 'volume' : 'cooking';
          if (getUnit(altCat, fromCand.unit.id) && getUnit(altCat, toCand.unit.id)) {
            targetCat = altCat;
            uFrom = getUnit(altCat, fromCand.unit.id);
            uTo = getUnit(altCat, toCand.unit.id);
          }
        }

        if (uFrom && uTo && targetCat) {
          const converted = convertUnits(val, targetCat, uFrom.id, uTo.id);
          if (converted !== null && !isNaN(converted) && isFinite(converted)) {
            return {
              success: true,
              categoryId: targetCat,
              fromUnit: uFrom,
              toUnit: uTo,
              value: val,
              result: converted,
              formattedResult: formatNumber(converted),
              query: rawQuery,
            };
          }
        }
      }
    }

    return null;
  }

  // Pattern 2: [value] [unitA] [unitB] (e.g. "100 km miles")
  const patternTwoUnits = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)\s+([a-z°'"/²³µ]+)\s+([a-z°'"/²³µ]+)$/i;
  const matchTwo = query.match(patternTwoUnits);
  if (matchTwo) {
    const val = parseFloat(matchTwo[1]);
    if (isNaN(val)) return null;

    const fromToken = matchTwo[2].trim();
    const toToken = matchTwo[3].trim();
    const fromCandidates = findAllUnits(fromToken);

    for (const fromCand of fromCandidates) {
      const catId = fromCand.categoryId;
      const toCand = findUnit(toToken, catId);
      if (toCand) {
        let targetCat = catId;
        let uFrom = getUnit(targetCat, fromCand.unit.id);
        let uTo = getUnit(targetCat, toCand.unit.id);

        if (!uTo && (catId === 'cooking' || catId === 'volume')) {
          const altCat = catId === 'cooking' ? 'volume' : 'cooking';
          if (getUnit(altCat, fromCand.unit.id) && getUnit(altCat, toCand.unit.id)) {
            targetCat = altCat;
            uFrom = getUnit(altCat, fromCand.unit.id);
            uTo = getUnit(altCat, toCand.unit.id);
          }
        }

        if (uFrom && uTo && targetCat) {
          const converted = convertUnits(val, targetCat, uFrom.id, uTo.id);
          if (converted !== null && !isNaN(converted) && isFinite(converted)) {
            return {
              success: true,
              categoryId: targetCat,
              fromUnit: uFrom,
              toUnit: uTo,
              value: val,
              result: converted,
              formattedResult: formatNumber(converted),
              query: rawQuery,
            };
          }
        }
      }
    }
    return null;
  }

  // Pattern 3: [value] [unitA] -> auto convert to complementary target unit
  const patternSingle = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)\s*([a-z0-9_°'"/²³µ\s]+)$/i;
  const matchSingle = query.match(patternSingle);
  if (matchSingle) {
    const val = parseFloat(matchSingle[1]);
    if (isNaN(val)) return null;

    const unitToken = matchSingle[2].trim();
    const match = findUnit(unitToken);
    if (match) {
      const catId = match.categoryId;
      const catDef = CATEGORIES.find((c) => c.id === catId);
      const catUnits = UNIT_DEFINITIONS[catId].units;

      // Check natural pair
      let targetId = COMPLEMENTARY_PAIRS[catId]?.[match.unit.id];
      if (!targetId) {
        if (catDef && catDef.defaultFrom && catDef.defaultTo) {
          targetId = match.unit.id === catDef.defaultFrom ? catDef.defaultTo : catDef.defaultFrom;
        }
      }
      if (!targetId || targetId === match.unit.id) {
        const alt = catUnits.find((u) => u.id !== match.unit.id);
        targetId = alt ? alt.id : match.unit.id;
      }

      const targetUnit = getUnit(catId, targetId);
      if (targetUnit) {
        const converted = convertUnits(val, catId, match.unit.id, targetUnit.id);
        if (converted !== null && !isNaN(converted) && isFinite(converted)) {
          return {
            success: true,
            categoryId: catId,
            fromUnit: match.unit,
            toUnit: targetUnit,
            value: val,
            result: converted,
            formattedResult: formatNumber(converted),
            query: rawQuery,
          };
        }
      }
    }
  }

  return null;
}
