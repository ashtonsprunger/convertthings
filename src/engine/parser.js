/**
 * Natural Language Query Parser for ConvertThings
 * Parses inputs like "100 km to miles", "72 f in c", "150 lbs into kg", "500 sq ft to sqm"
 */

import { UNIT_DEFINITIONS, convertUnits, formatNumber } from './conversions.js';

// Build a fast lookup map of alias -> { categoryId, unit }
const ALIAS_LOOKUP = {};

Object.entries(UNIT_DEFINITIONS).forEach(([categoryId, catDef]) => {
  catDef.units.forEach((unit) => {
    // Add id and symbol
    const keys = [
      unit.id.toLowerCase(),
      unit.symbol.toLowerCase(),
      unit.name.toLowerCase(),
      unit.plural.toLowerCase(),
      ...(unit.aliases || []).map((a) => a.toLowerCase())
    ];

    keys.forEach((key) => {
      if (!key) return;
      // Store in lookup
      if (!ALIAS_LOOKUP[key]) {
        ALIAS_LOOKUP[key] = { categoryId, unit };
      }
    });
  });
});

/**
 * Finds a matching unit for a query string or token.
 */
export function findUnit(token) {
  if (!token) return null;
  const clean = token.trim().toLowerCase().replace(/^°/, '');
  if (ALIAS_LOOKUP[clean]) return ALIAS_LOOKUP[clean];
  if (ALIAS_LOOKUP['°' + clean]) return ALIAS_LOOKUP['°' + clean];

  // Try stripping trailing 's' (e.g. "kilometers" -> "kilometer")
  if (clean.endsWith('s') && ALIAS_LOOKUP[clean.slice(0, -1)]) {
    return ALIAS_LOOKUP[clean.slice(0, -1)];
  }

  // Prefix match for partial names
  for (const [key, val] of Object.entries(ALIAS_LOOKUP)) {
    if (key.length >= 3 && key.startsWith(clean)) {
      return val;
    }
  }

  return null;
}

/**
 * Parses user input into a conversion request.
 * Supports patterns:
 * - "<number> <fromUnit> to/in/into/= <toUnit>" (e.g. "100 km to miles")
 * - "<fromUnit> to/in/into/= <toUnit>" (e.g. "km to miles")
 * - "<number> <fromUnit>" (e.g. "50 mph" -> auto converts to km/h)
 * - "<number> <fromUnit> <toUnit>" (e.g. "100 km mi")
 */
export function parseConversionQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  const query = rawQuery.trim().toLowerCase();
  if (!query) return null;

  // Regex pattern 1: [value]? [unitA] (to|in|into|as|=) [unitB]
  // e.g. "100 km to miles", "72 f in c", "lbs to kg", "1.5 kg to g"
  const patternFull = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?\s*)?([a-z0-9_°'"/²³µ\s]+?)\s+(?:to|in|into|as|=|convert to)\s+([a-z0-9_°'"/²³µ\s]+)$/i;
  const matchFull = query.match(patternFull);

  if (matchFull) {
    const rawVal = matchFull[1]?.trim();
    const val = rawVal ? parseFloat(rawVal) : 1;
    const fromToken = matchFull[2].trim();
    const toToken = matchFull[3].trim();

    const fromMatch = findUnit(fromToken);
    const toMatch = findUnit(toToken);

    if (fromMatch && toMatch) {
      // Must be same category or compatible
      const categoryId = fromMatch.categoryId === toMatch.categoryId ? fromMatch.categoryId : fromMatch.categoryId;
      const converted = convertUnits(val, categoryId, fromMatch.unit.id, toMatch.unit.id);
      return {
        success: true,
        categoryId,
        fromUnit: fromMatch.unit,
        toUnit: toMatch.unit,
        value: val,
        result: converted,
        formattedResult: converted !== null ? formatNumber(converted) : '',
        query: rawQuery,
      };
    }
  }

  // Pattern 2: [value] [unitA] [unitB] (e.g. "100 km miles")
  const patternTwoUnits = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)\s+([a-z°'"/²³µ]+)\s+([a-z°'"/²³µ]+)$/i;
  const matchTwo = query.match(patternTwoUnits);
  if (matchTwo) {
    const val = parseFloat(matchTwo[1]);
    const fromMatch = findUnit(matchTwo[2]);
    const toMatch = findUnit(matchTwo[3]);
    if (fromMatch && toMatch && fromMatch.categoryId === toMatch.categoryId) {
      const converted = convertUnits(val, fromMatch.categoryId, fromMatch.unit.id, toMatch.unit.id);
      return {
        success: true,
        categoryId: fromMatch.categoryId,
        fromUnit: fromMatch.unit,
        toUnit: toMatch.unit,
        value: val,
        result: converted,
        formattedResult: converted !== null ? formatNumber(converted) : '',
        query: rawQuery,
      };
    }
  }

  // Pattern 3: [value] [unitA] -> auto convert to default target unit
  const patternSingle = /^([+-]?[0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?)\s*([a-z0-9_°'"/²³µ\s]+)$/i;
  const matchSingle = query.match(patternSingle);
  if (matchSingle) {
    const val = parseFloat(matchSingle[1]);
    const unitToken = matchSingle[2].trim();
    const match = findUnit(unitToken);
    if (match) {
      const cat = UNIT_DEFINITIONS[match.categoryId];
      // Pick another unit in the same category (e.g., metric -> imperial or vice versa)
      const targetUnit = cat.units.find((u) => u.id !== match.unit.id) || match.unit;
      const converted = convertUnits(val, match.categoryId, match.unit.id, targetUnit.id);
      return {
        success: true,
        categoryId: match.categoryId,
        fromUnit: match.unit,
        toUnit: targetUnit,
        value: val,
        result: converted,
        formattedResult: converted !== null ? formatNumber(converted) : '',
        query: rawQuery,
      };
    }
  }

  return null;
}
