/**
 * Natural Language Query Parser & Suggestion Engine for ConvertThings
 * Handles:
 * - Conversational queries: "what is 100 km in miles", "how many miles in 100 km"
 * - Directional symbols & abbreviations: "100 km -> miles", "100 sq. ft. to sq. m.", "50 lbs. to kg."
 * - Compound measurements: "5'11 to cm", "5 ft 11 in to cm", "1 hr 30 min in seconds", "5 lbs 8 oz to kg"
 * - Word numbers & fractions: "half a cup to tbsp", "quarter cup to ml", "a mile in feet"
 * - Typo-tolerant unit matching: "celcius to fahrenheit", "kilomters to miles"
 * - Unit exploration & defaults: "miles", "celsius", "km miles", "c f"
 * - Category navigation & synonyms: "cooking", "kitchen", "gas mileage", "storage"
 * - Multi-result suggestion palette: getSearchSuggestions()
 *
 * Enforces strict category integrity: cross-category nonsense (e.g. feet to seconds)
 * is strictly rejected.
 */

import {
  UNIT_DEFINITIONS,
  CATEGORIES,
  convertUnits,
  formatNumber,
  getUnit,
  parseFractionString
} from './conversions.js';

// Category-indexed lookup: { [categoryId]: { [aliasKey]: unit } }
const LOOKUP_BY_CAT = {};
// Global exact lookup: { [aliasKey]: Array<{ categoryId, unit }> }
const GLOBAL_EXACT = {};
// Flat list for prefix and fuzzy matching
const ALL_UNITS_LIST = [];

// Natural complementary unit pairs for single-unit queries (e.g. "50 mph" -> km/h, "miles" -> km)
export const COMPLEMENTARY_PAIRS = {
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

// Rich Category Synonyms and Keywords for Search Intent
export const CATEGORY_SYNONYMS = {
  cooking: ['cooking', 'kitchen', 'recipe', 'recipes', 'baking', 'baker', 'culinary', 'cook'],
  temperature: ['temperature', 'temp', 'weather', 'fever', 'heat', 'cold', 'thermostat', 'thermal'],
  length: ['length', 'distance', 'height', 'elevation', 'depth', 'stature', 'altitude', 'ruler'],
  mass: ['mass', 'weight', 'body weight', 'heavy', 'weighing', 'scales'],
  area: ['area', 'land', 'surface', 'square footage', 'acreage', 'lot size'],
  volume: ['volume', 'capacity', 'liquid', 'fluid', 'cubic'],
  speed: ['speed', 'velocity', 'pace', 'fast'],
  time: ['time', 'duration', 'calendar', 'clock', 'chronology'],
  digital: ['digital', 'storage', 'data', 'memory', 'filesize', 'hard drive', 'ssd', 'disk', 'bytes'],
  data_rate: ['data rate', 'bandwidth', 'internet speed', 'bitrate', 'download speed', 'upload speed', 'throughput'],
  pressure: ['pressure', 'tire pressure', 'psi', 'barometric', 'atmospheric'],
  energy: ['energy', 'calories', 'joules', 'work'],
  power: ['power', 'wattage', 'horsepower', 'watts'],
  angle: ['angle', 'degrees', 'geometry', 'radians', 'trigonometry'],
  fuel: ['fuel', 'gas', 'mileage', 'mpg', 'fuel economy', 'gas mileage', 'consumption', 'petrol'],
};

// Popular preset conversions per category for instant quick-picks
export const POPULAR_CONVERSIONS = {
  cooking: [
    { from: 'cup_us', to: 'tbsp_us', val: 1 },
    { from: 'tbsp_us', to: 'tsp_us', val: 1 },
    { from: 'cup_us', to: 'ml', val: 1 },
    { from: 'floz_us', to: 'ml', val: 1 },
  ],
  length: [
    { from: 'km', to: 'mi', val: 1 },
    { from: 'mi', to: 'km', val: 1 },
    { from: 'm', to: 'ft', val: 1 },
    { from: 'in', to: 'cm', val: 1 },
  ],
  mass: [
    { from: 'kg', to: 'lb', val: 1 },
    { from: 'lb', to: 'kg', val: 1 },
    { from: 'g', to: 'oz', val: 1 },
    { from: 'oz', to: 'g', val: 1 },
  ],
  temperature: [
    { from: 'c', to: 'f', val: 0 },
    { from: 'c', to: 'f', val: 100 },
    { from: 'f', to: 'c', val: 32 },
    { from: 'f', to: 'c', val: 98.6 },
  ],
  volume: [
    { from: 'gal_us', to: 'l', val: 1 },
    { from: 'l', to: 'gal_us', val: 1 },
    { from: 'l', to: 'ml', val: 1 },
  ],
  speed: [
    { from: 'mph', to: 'kmh', val: 60 },
    { from: 'kmh', to: 'mph', val: 100 },
    { from: 'knot', to: 'mph', val: 1 },
  ],
  digital: [
    { from: 'gb', to: 'mb', val: 1 },
    { from: 'tb', to: 'gb', val: 1 },
    { from: 'mb', to: 'kb', val: 1 },
  ],
  fuel: [
    { from: 'mpg_us', to: 'l100km', val: 30 },
    { from: 'l100km', to: 'mpg_us', val: 8 },
  ],
  area: [
    { from: 'sqft', to: 'sqm', val: 1000 },
    { from: 'ac', to: 'ha', val: 1 },
  ],
  pressure: [
    { from: 'psi', to: 'bar', val: 32 },
    { from: 'bar', to: 'psi', val: 2 },
  ],
  time: [
    { from: 'h', to: 'min', val: 1 },
    { from: 'd', to: 'h', val: 1 },
  ],
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
 * Levenshtein distance for typo-tolerant unit matching.
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Scored prefix matching against a list of unit items.
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
 * Supports exact matching, plural stripping, prefix matching, and typo tolerance (Levenshtein).
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
  if (clean.length >= 3) {
    if (categoryHint && LOOKUP_BY_CAT[categoryHint]) {
      const catMatches = findPrefixMatches(clean, ALL_UNITS_LIST.filter((i) => i.categoryId === categoryHint));
      if (catMatches.length > 0) {
        return [{ categoryId: catMatches[0].categoryId, unit: catMatches[0].unit }];
      }
    }

    const globalMatches = findPrefixMatches(clean, ALL_UNITS_LIST);
    if (globalMatches.length > 0) {
      return [{ categoryId: globalMatches[0].categoryId, unit: globalMatches[0].unit }];
    }
  }

  // 4. Fuzzy / Typo tolerance: strictly requires clean.length >= 4.
  // Catches common typos like "celcius", "farenheit", "kilomters", "poundes".
  if (clean.length >= 4) {
    const maxDist = clean.length <= 5 ? 1 : 2;
    const candidates = categoryHint
      ? ALL_UNITS_LIST.filter((i) => i.categoryId === categoryHint)
      : ALL_UNITS_LIST;

    let bestMatch = null;
    let bestDist = Infinity;

    for (const item of candidates) {
      const keys = [
        item.unit.name.toLowerCase(),
        item.unit.plural.toLowerCase(),
        ...(item.unit.aliases || []).map((a) => a.toLowerCase().replace(/^°/, ''))
      ];
      for (const k of keys) {
        if (k.length >= 4 && Math.abs(k.length - clean.length) <= maxDist) {
          const d = levenshteinDistance(clean, k);
          if (d <= maxDist && d < bestDist) {
            bestDist = d;
            bestMatch = item;
          }
        }
      }
    }

    if (bestMatch) {
      return [{ categoryId: bestMatch.categoryId, unit: bestMatch.unit, isFuzzy: true }];
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
 * Checks if a query corresponds to a category name, ID, or domain synonym.
 * E.g. "cooking", "kitchen", "gas mileage", "storage", "temperature".
 * @param {string} queryToken
 * @returns {object|null} Category definition from CATEGORIES
 */
export function findCategoryMatch(queryToken) {
  if (!queryToken) return null;
  const clean = String(queryToken).trim().toLowerCase().replace(/^(in|to|the|show|open|go to)\s+/i, '').trim();
  if (!clean) return null;

  // 1. Direct category ID match
  const directId = CATEGORIES.find((c) => c.id === clean);
  if (directId) return directId;

  // 2. Direct category Name match
  const directName = CATEGORIES.find((c) => c.name.toLowerCase() === clean);
  if (directName) return directName;

  // 3. Exact synonym match
  for (const [catId, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some((s) => s === clean || clean === `${s}s`)) {
      return CATEGORIES.find((c) => c.id === catId);
    }
  }

  // 4. Prefix match on synonyms (token >= 3 chars, e.g. "cook", "temp")
  if (clean.length >= 3) {
    for (const [catId, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
      if (synonyms.some((s) => s.startsWith(clean))) {
        return CATEGORIES.find((c) => c.id === catId);
      }
    }
  }

  return null;
}

/**
 * Checks if query references an unsupported domain (e.g. Currency, Timezones).
 * Provides graceful guidance instead of silent failure.
 */
export function checkUnsupportedDomain(query) {
  if (!query) return null;
  const q = String(query).toLowerCase();

  // 1. Timezone checks first
  const timezoneTerms = ['gmt', 'utc', 'est', 'edt', 'cst', 'cdt', 'mst', 'mdt', 'pst', 'pdt', 'time zone', 'timezone'];
  for (const term of timezoneTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(q)) {
      return { domain: 'timezone', name: 'Time Zones' };
    }
  }

  // 2. Literal currency symbols
  const currencySymbols = ['$', '€', '£', '¥'];
  for (const sym of currencySymbols) {
    if (q.includes(sym)) {
      return { domain: 'currency', name: 'Currency & Crypto' };
    }
  }

  // 3. Word currency terms
  const currencyTerms = ['usd', 'eur', 'euro', 'euros', 'dollar', 'dollars', 'cad', 'aud', 'gbp', 'pound sterling', 'yen', 'jpy', 'rupee', 'inr', 'peso', 'bitcoin', 'btc', 'ethereum', 'eth', 'crypto'];
  for (const term of currencyTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(q)) {
      return { domain: 'currency', name: 'Currency & Crypto' };
    }
  }

  return null;
}

/**
 * Normalizes query string: strips conversational preambles, trailing punctuation,
 * handles abbreviations with periods ("sq. ft.", "lbs."), directional arrows ("->", "=>"),
 * and written number words ("half a cup", "quarter cup").
 */
export function sanitizeQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return '';
  let query = rawQuery.trim().toLowerCase();

  // Strip conversational prefixes
  query = query.replace(/^(?:what is|what's|how much is|can you convert|tell me|give me|convert|calculate)\s+/i, '').trim();

  // Strip trailing question marks
  query = query.replace(/\?+$/, '').trim();

  // Normalize directional arrows to " to "
  query = query.replace(/\s*(?:->|-->|=>|->>|→)\s*/g, ' to ');

  // Normalize colon separator between letters: "km:mi" -> "km to mi"
  query = query.replace(/([a-z0-9])\s*[:]\s*([a-z])/gi, '$1 to $2');

  // Normalize punctuation in unit abbreviations: "sq. ft." -> "sq ft", "lbs." -> "lbs", "in." -> "in", "hr." -> "hr"
  query = query.replace(/\b([a-z]+)\.(?=\s|$)/gi, '$1');

  // Normalize numbers with thousands commas: 1,000,000 -> 1000000
  while (/(\d),(\d)/.test(query)) {
    query = query.replace(/(\d),(\d)/g, '$1$2');
  }

  // Word number normalization
  query = query.replace(/\bhalf\s+(?:a\s+|an\s+)?/gi, '0.5 ');
  query = query.replace(/\bquarter\s+(?:of\s+a\s+|a\s+)?/gi, '0.25 ');
  query = query.replace(/\bone\s+third\s+(?:of\s+a\s+|a\s+)?/gi, '1/3 ');

  // Leading "a" or "an" before unit (e.g. "a mile in feet" -> "1 mile in feet")
  query = query.replace(/^(?:a|an)\s+([a-z])/i, '1 $1');

  return query.trim();
}

/**
 * Parses compound physical units such as:
 * - Imperial Height: "5'11 to cm", "5 ft 11 in to cm", "6 feet 2 inches in meters"
 * - Compound Time: "1 hr 30 min in seconds", "2 hours 15 minutes to minutes"
 * - Compound Mass: "5 lbs 8 oz to kg", "5 lb 6 oz in grams"
 */
export function parseCompoundConversion(rawQuery) {
  if (!rawQuery) return null;
  const query = sanitizeQuery(rawQuery);

  // 1. Imperial Height: feet & inches (e.g. 5'11", 5' 11", 5ft 11in, 5 ft 11 in to cm)
  const heightRegex = /^(?:(\d+)\s*(?:feet|foot|ft|')\s*(\d*(?:\.\d+)?)\s*(?:inches|inch|in|"|'')?|(\d+)\s*'\s*(\d*(?:\.\d+)?)(?:"|'')?)(?:\s*(?:to|in|into|as|=|convert to)\s*([a-z0-9_°'"/²³µ\s]+))?$/i;
  const matchH = query.match(heightRegex);
  if (matchH) {
    const feet = parseInt(matchH[1] || matchH[3], 10);
    const inchesRaw = matchH[2] || matchH[4];
    const inches = inchesRaw ? parseFloat(inchesRaw) : 0;
    const targetToken = matchH[5]?.trim();

    // Must be compound: either explicit inches (> 0) or quote notation ("5'11")
    // Single unit queries like "1 feet to m" or "1 feet to se" are NOT compound queries!
    const isExplicitCompound = inches > 0 || query.includes("'");
    if (!isNaN(feet) && !isNaN(inches) && isExplicitCompound) {
      const totalInches = feet * 12 + inches;
      let targetUnit = null;
      if (targetToken) {
        const found = findUnit(targetToken, 'length');
        if (found && found.categoryId === 'length') {
          targetUnit = found.unit;
        } else {
          return null;
        }
      } else {
        targetUnit = getUnit('length', 'cm');
      }

      if (targetUnit) {
        const converted = convertUnits(totalInches, 'length', 'in', targetUnit.id);
        if (converted !== null && !isNaN(converted) && isFinite(converted)) {
          const fromUnit = getUnit('length', 'in');
          const displayLabel = `${feet} ft ${inches > 0 ? `${inches} in` : ''}`.trim();
          return {
            success: true,
            categoryId: 'length',
            fromUnit,
            toUnit: targetUnit,
            value: totalInches,
            result: converted,
            formattedResult: formatNumber(converted, 'auto', 'length'),
            query: rawQuery,
            isCompound: true,
            compoundDisplay: displayLabel,
            hasExplicitValue: true,
          };
        }
      }
    }
  }

  // 2. Compound Time: hours & minutes (e.g. 1 hr 30 min in seconds, 2 hours 15 mins to minutes)
  const timeRegex = /^(\d+)\s*(?:hours|hour|hrs|hr|h)\s*(\d+(?:\.\d+)?)\s*(?:minutes|minute|mins|min|m)(?:\s*(?:to|in|into|as|=|convert to)\s*([a-z0-9_°'"/²³µ\s]+))?$/i;
  const matchT = query.match(timeRegex);
  if (matchT) {
    const hours = parseInt(matchT[1], 10);
    const minutes = parseFloat(matchT[2]);
    const targetToken = matchT[3]?.trim();
    if (!isNaN(hours) && !isNaN(minutes)) {
      const totalMinutes = hours * 60 + minutes;
      let targetUnit = null;
      if (targetToken) {
        const found = findUnit(targetToken, 'time');
        if (found && found.categoryId === 'time') {
          targetUnit = found.unit;
        } else {
          return null;
        }
      } else {
        targetUnit = getUnit('time', 's');
      }
      if (targetUnit) {
        const converted = convertUnits(totalMinutes, 'time', 'min', targetUnit.id);
        if (converted !== null && !isNaN(converted) && isFinite(converted)) {
          const fromUnit = getUnit('time', 'min');
          const displayLabel = `${hours} hr ${minutes} min`;
          return {
            success: true,
            categoryId: 'time',
            fromUnit,
            toUnit: targetUnit,
            value: totalMinutes,
            result: converted,
            formattedResult: formatNumber(converted, 'auto', 'time'),
            query: rawQuery,
            isCompound: true,
            compoundDisplay: displayLabel,
            hasExplicitValue: true,
          };
        }
      }
    }
  }

  // 3. Compound Mass: pounds & ounces (e.g. 5 lbs 8 oz to kg)
  const massRegex = /^(\d+)\s*(?:pounds|pound|lbs|lb)\s*(\d+(?:\.\d+)?)\s*(?:ounces|ounce|oz)(?:\s*(?:to|in|into|as|=|convert to)\s*([a-z0-9_°'"/²³µ\s]+))?$/i;
  const matchM = query.match(massRegex);
  if (matchM) {
    const pounds = parseInt(matchM[1], 10);
    const ounces = parseFloat(matchM[2]);
    const targetToken = matchM[3]?.trim();
    if (!isNaN(pounds) && !isNaN(ounces)) {
      const totalOunces = pounds * 16 + ounces;
      let targetUnit = null;
      if (targetToken) {
        const found = findUnit(targetToken, 'mass');
        if (found && found.categoryId === 'mass') {
          targetUnit = found.unit;
        } else {
          return null;
        }
      } else {
        targetUnit = getUnit('mass', 'kg');
      }
      if (targetUnit) {
        const converted = convertUnits(totalOunces, 'mass', 'oz', targetUnit.id);
        if (converted !== null && !isNaN(converted) && isFinite(converted)) {
          const fromUnit = getUnit('mass', 'oz');
          const displayLabel = `${pounds} lb ${ounces} oz`;
          return {
            success: true,
            categoryId: 'mass',
            fromUnit,
            toUnit: targetUnit,
            value: totalOunces,
            result: converted,
            formattedResult: formatNumber(converted, 'auto', 'mass'),
            query: rawQuery,
            isCompound: true,
            compoundDisplay: displayLabel,
            hasExplicitValue: true,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Primary Natural Language Conversion Parser.
 * Strictly verifies measurement domains: never matches cross-category nonsense.
 *
 * Supports patterns:
 * - Natural question: "how many miles in 100 km", "what is 72 f in c"
 * - Directional conversion: "100 km to miles", "100 km -> miles", "50 lbs. to kg."
 * - Missing values: "km to miles", "c f", "miles", "celsius"
 * - Compound measurements: "5'11 to cm", "1 hr 30 min to seconds"
 * - Kitchen fractions: "half a cup to tbsp", "1/2 cup to ml"
 * - Typo tolerance: "celcius to fahrenheit"
 *
 * @param {string} rawQuery
 * @returns {object|null}
 */
export function parseConversionQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;

  // 1. Check compound expressions first (height, duration, mass)
  const compoundMatch = parseCompoundConversion(rawQuery);
  if (compoundMatch) return compoundMatch;

  let query = sanitizeQuery(rawQuery);
  if (!query) return null;

  const FRACTION_GLYPHS = '½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞';
  const VALUE_REGEX = `(?:[+-]?\\d+\\s*[-+ ]\\s*\\d+\\/\\d+|[+-]?\\d+\\s*[${FRACTION_GLYPHS}]|[+-]?[${FRACTION_GLYPHS}]|[+-]?\\d+\\/\\d+|[+-]?[0-9]*\\.?[0-9]+(?:e[+-]?[0-9]+)?)`;

  // Pattern 0: Natural question format: "how many [toUnit] in [val]? [fromUnit]"
  const patternHowMany = new RegExp('^(?:how many|how much)\\s+([a-z0-9_°\'"/²³µ\\s]+?)\\s+(?:in|are in|are there in)\\s+(?:(' + VALUE_REGEX + ')\\s*)?(?:a\\s+|an\\s+)?([a-z0-9_°\'"/²³µ\\s]+)$', 'i');
  const matchHowMany = query.match(patternHowMany);
  if (matchHowMany) {
    const toToken = matchHowMany[1].trim();
    const rawVal = matchHowMany[2]?.trim();
    const val = rawVal ? parseFractionString(rawVal) : 1;
    const fromToken = matchHowMany[3].trim();
    if (!isNaN(val)) {
      const fromCandidates = findAllUnits(fromToken);
      for (const fromCand of fromCandidates) {
        const catId = fromCand.categoryId;
        const toCand = findUnit(toToken, catId);
        if (toCand && toCand.categoryId === catId) {
          let targetCat = catId;
          let uFrom = fromCand.unit;
          let uTo = toCand.unit;
          if (getUnit('cooking', uFrom.id) && getUnit('cooking', uTo.id)) {
            targetCat = 'cooking';
            uFrom = getUnit('cooking', uFrom.id);
            uTo = getUnit('cooking', uTo.id);
          }
          const converted = convertUnits(val, targetCat, uFrom.id, uTo.id);
          if (converted !== null && !isNaN(converted) && isFinite(converted)) {
            return {
              success: true,
              categoryId: targetCat,
              fromUnit: uFrom,
              toUnit: uTo,
              value: val,
              result: converted,
              formattedResult: formatNumber(converted, 'auto', targetCat),
              query: rawQuery,
              hasExplicitValue: !!rawVal,
            };
          }
        }
      }
    }
  }

  // Pattern 1: [value]? [unitA] (to|in|into|as|=|convert to) [unitB]
  const patternFull = new RegExp('^(' + VALUE_REGEX + '\\s*)?([a-z0-9_°\'"/²³µ\\s]+?)\\s+(?:to|in|into|as|=|convert to)\\s+([a-z0-9_°\'"/²³µ\\s]+)$', 'i');
  const matchFull = query.match(patternFull);

  if (matchFull) {
    const rawVal = matchFull[1]?.trim();
    const val = rawVal ? parseFractionString(rawVal) : 1;
    if (isNaN(val)) return null;

    const fromToken = matchFull[2].trim();
    const toToken = matchFull[3].trim();

    const fromCandidates = findAllUnits(fromToken);
    if (!fromCandidates || fromCandidates.length === 0) return null;

    for (const fromCand of fromCandidates) {
      const catId = fromCand.categoryId;
      const toCand = findUnit(toToken, catId);
      if (toCand) {
        let targetCat = catId;
        let uFrom = getUnit(targetCat, fromCand.unit.id);
        let uTo = getUnit(targetCat, toCand.unit.id);

        // Support cooking <-> volume cross-category unit overlap, prioritizing cooking for culinary units
        if (catId === 'cooking' || catId === 'volume') {
          if (getUnit('cooking', fromCand.unit.id) && getUnit('cooking', toCand.unit.id)) {
            targetCat = 'cooking';
            uFrom = getUnit('cooking', fromCand.unit.id);
            uTo = getUnit('cooking', toCand.unit.id);
          } else if (!uTo) {
            const altCat = catId === 'cooking' ? 'volume' : 'cooking';
            if (getUnit(altCat, fromCand.unit.id) && getUnit(altCat, toCand.unit.id)) {
              targetCat = altCat;
              uFrom = getUnit(altCat, fromCand.unit.id);
              uTo = getUnit(altCat, toCand.unit.id);
            }
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
              formattedResult: formatNumber(converted, 'auto', targetCat),
              query: rawQuery,
              hasExplicitValue: !!rawVal,
            };
          }
        }
      }
    }

    return null;
  }

  // Pattern 2: [value]? [unitA] [unitB] (e.g. "100 km miles", "km miles", "c f")
  const patternTwoUnits = new RegExp('^(' + VALUE_REGEX + '\\s+)?([a-z°\'"/²³µ]+)\\s+([a-z°\'"/²³µ]+)$', 'i');
  const matchTwo = query.match(patternTwoUnits);
  if (matchTwo) {
    const rawVal = matchTwo[1]?.trim();
    const val = rawVal ? parseFractionString(rawVal) : 1;
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
              formattedResult: formatNumber(converted, 'auto', targetCat),
              query: rawQuery,
              hasExplicitValue: !!rawVal,
            };
          }
        }
      }
    }
    return null;
  }

  // Pattern 3: [value]? [unitA] -> auto-convert to complementary target unit (e.g. "50 mph" -> km/h, "miles" -> km)
  const patternSingle = new RegExp('^(' + VALUE_REGEX + '\\s*)?([a-z0-9_°\'"/²³µ\\s]+)$', 'i');
  const matchSingle = query.match(patternSingle);
  if (matchSingle) {
    const rawVal = matchSingle[1]?.trim();
    const val = rawVal ? parseFractionString(rawVal) : 1;
    if (isNaN(val)) return null;

    const unitToken = matchSingle[2].trim();
    const match = findUnit(unitToken);
    if (match) {
      const catId = match.categoryId;
      const catDef = CATEGORIES.find((c) => c.id === catId);
      const catUnits = UNIT_DEFINITIONS[catId].units;

      // Check natural complementary pair
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
            formattedResult: formatNumber(converted, 'auto', catId),
            query: rawQuery,
            hasExplicitValue: !!rawVal,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Multi-result Suggestion Engine for the Omnibox.
 * Returns ranked suggestions:
 * 1. Category Navigation (e.g. "cooking" -> Go to Cooking & Kitchen + Popular conversions)
 * 2. Instant Conversion Match (Exact pair or Compound)
 * 3. Related / Incomplete conversions
 * 4. Recent history (for empty query)
 * 5. Unsupported domain notice (e.g. Currency)
 *
 * @param {string} rawQuery
 * @param {object} [options]
 * @param {Array} [options.history]
 * @param {Array} [options.favorites]
 * @returns {Array<object>}
 */
export function getSearchSuggestions(rawQuery, options = {}) {
  const suggestions = [];
  const query = (rawQuery || '').trim();

  // 1. Empty state (Focused Omnibox with no text typed)
  if (!query) {
    if (options.history && Array.isArray(options.history) && options.history.length > 0) {
      options.history.slice(0, 3).forEach((h) => {
        const cat = CATEGORIES.find((c) => c.id === h.categoryId);
        const fromValFormatted = formatNumber(Number(h.fromValue) || 1, 'auto', h.categoryId);
        suggestions.push({
          id: `hist-${h.categoryId}-${h.fromUnitId}-${h.toUnitId}-${h.fromValue}`,
          type: 'history',
          categoryId: h.categoryId,
          title: `${fromValFormatted} ${h.fromSymbol} = ${h.toValue} ${h.toSymbol}`,
          subtitle: `Recent Conversion · ${h.categoryName || h.categoryId}`,
          badge: 'Recent',
          icon: cat ? cat.icon : 'Clock',
          equation: {
            fromVal: fromValFormatted,
            fromUnit: h.fromSymbol,
            fromSymbol: h.fromSymbol,
            toVal: h.toValue,
            toUnit: h.toSymbol,
            toSymbol: h.toSymbol,
          },
          payload: {
            action: 'convert',
            categoryId: h.categoryId,
            fromUnitId: h.fromUnitId,
            toUnitId: h.toUnitId,
            value: h.fromValue,
          },
        });
      });
    }

    const quickCats = ['length', 'mass', 'temperature', 'cooking', 'speed', 'digital'];
    quickCats.forEach((catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId);
      if (cat) {
        suggestions.push({
          id: `cat-${cat.id}`,
          type: 'category',
          categoryId: cat.id,
          title: `Explore ${cat.name}`,
          subtitle: `Category · ${UNIT_DEFINITIONS[cat.id]?.units?.length || 10} units`,
          badge: 'Category',
          icon: cat.icon,
          payload: {
            action: 'navigate_category',
            categoryId: cat.id,
          },
        });
      }
    });

    return suggestions;
  }

  // 2. Category Match Intent (e.g. "cooking", "kitchen", "gas mileage", "temp")
  const catMatch = findCategoryMatch(query);
  if (catMatch) {
    const sampleUnits = (UNIT_DEFINITIONS[catMatch.id]?.units || [])
      .slice(0, 4)
      .map((u) => u.plural || u.name)
      .join(', ');

    suggestions.push({
      id: `cat-jump-${catMatch.id}`,
      type: 'category',
      categoryId: catMatch.id,
      title: `Go to ${catMatch.name} Category`,
      subtitle: `Explore ${UNIT_DEFINITIONS[catMatch.id]?.units?.length || 10} units (${sampleUnits}...)`,
      badge: 'Category',
      icon: catMatch.icon,
      payload: {
        action: 'navigate_category',
        categoryId: catMatch.id,
      },
    });

    // Add 2-3 popular conversions in this category
    const popular = POPULAR_CONVERSIONS[catMatch.id] || [];
    popular.slice(0, 3).forEach((pop) => {
      const uFrom = getUnit(catMatch.id, pop.from);
      const uTo = getUnit(catMatch.id, pop.to);
      if (uFrom && uTo) {
        const res = convertUnits(pop.val, catMatch.id, pop.from, pop.to);
        if (res !== null) {
          const formatted = formatNumber(res, 'auto', catMatch.id);
          const fromPlural = uFrom.plural || uFrom.name;
          const toPlural = uTo.plural || uTo.name;
          suggestions.push({
            id: `cat-pop-${catMatch.id}-${pop.from}-${pop.to}-${pop.val}`,
            type: 'conversion',
            categoryId: catMatch.id,
            title: `${pop.val} ${fromPlural} = ${formatted} ${toPlural}`,
            subtitle: `${catMatch.name} · ${uFrom.symbol} → ${uTo.symbol}`,
            badge: 'Popular',
            icon: catMatch.icon,
            equation: {
              fromVal: pop.val,
              fromUnit: fromPlural,
              fromSymbol: uFrom.symbol,
              toVal: formatted,
              toUnit: toPlural,
              toSymbol: uTo.symbol,
            },
            payload: {
              action: 'convert',
              categoryId: catMatch.id,
              fromUnitId: pop.from,
              toUnitId: pop.to,
              value: pop.val,
              hasExplicitValue: false,
            },
          });
        }
      }
    });

    return suggestions;
  }

  // 3. Direct or Compound Conversion Match
  const parsed = parseConversionQuery(query);
  if (parsed && parsed.success) {
    const isCompound = parsed.isCompound;
    const cat = CATEGORIES.find((c) => c.id === parsed.categoryId);
    const catName = cat ? cat.name : parsed.categoryId;
    const catIcon = cat ? cat.icon : (isCompound ? 'Ruler' : 'Sparkles');

    const fromPlural = parsed.fromUnit.plural || parsed.fromUnit.name;
    const toPlural = parsed.toUnit.plural || parsed.toUnit.name;
    const fromValFormatted = formatNumber(parsed.value, 'auto', parsed.categoryId);

    const mainTitle = isCompound
      ? `${parsed.compoundDisplay} = ${parsed.formattedResult} ${toPlural}`
      : `${fromValFormatted} ${fromPlural} = ${parsed.formattedResult} ${toPlural}`;

    suggestions.push({
      id: `conv-main-${parsed.categoryId}-${parsed.fromUnit.id}-${parsed.toUnit.id}`,
      type: isCompound ? 'compound' : 'conversion',
      categoryId: parsed.categoryId,
      title: mainTitle,
      subtitle: `${catName} · ${parsed.fromUnit.symbol} → ${parsed.toUnit.symbol}`,
      badge: isCompound ? 'Height Match' : 'Instant Match',
      icon: catIcon,
      equation: {
        fromVal: isCompound ? parsed.compoundDisplay : fromValFormatted,
        fromUnit: isCompound ? '' : fromPlural,
        fromSymbol: parsed.fromUnit.symbol,
        toVal: parsed.formattedResult,
        toUnit: toPlural,
        toSymbol: parsed.toUnit.symbol,
      },
      payload: {
        action: 'convert',
        categoryId: parsed.categoryId,
        fromUnitId: parsed.fromUnit.id,
        toUnitId: parsed.toUnit.id,
        value: parsed.value,
        formattedResult: parsed.formattedResult,
        hasExplicitValue: isCompound || !!parsed.hasExplicitValue,
      },
    });

    return suggestions;
  }

  // 4. Incomplete query matching (e.g. "100 km to ", "100 km", "50 miles in")
  const incompleteRegex = /^(?:([+-]?[0-9]*\.?[0-9]+)\s*)?([a-z0-9_°'"/²³µ]+)(?:\s+(?:to|in|into|as|=|convert to)\s*)?$/i;
  const matchInc = query.match(incompleteRegex);
  if (matchInc) {
    const rawVal = matchInc[1];
    const val = rawVal ? parseFloat(rawVal) : 1;
    const unitToken = matchInc[2]?.trim();
    const candidate = findUnit(unitToken);

    if (candidate) {
      const catId = candidate.categoryId;
      const cat = CATEGORIES.find((c) => c.id === catId);
      const catName = cat ? cat.name : catId;
      const catIcon = cat ? cat.icon : 'Sparkles';
      const targetUnits = UNIT_DEFINITIONS[catId].units.filter((u) => u.id !== candidate.unit.id).slice(0, 4);

      targetUnits.forEach((tUnit) => {
        const res = convertUnits(val, catId, candidate.unit.id, tUnit.id);
        if (res !== null) {
          const formatted = formatNumber(res, 'auto', catId);
          const valFormatted = formatNumber(val, 'auto', catId);
          const candPlural = candidate.unit.plural || candidate.unit.name;
          const tPlural = tUnit.plural || tUnit.name;

          suggestions.push({
            id: `inc-${catId}-${candidate.unit.id}-${tUnit.id}`,
            type: 'conversion',
            categoryId: catId,
            title: `${valFormatted} ${candPlural} = ${formatted} ${tPlural}`,
            subtitle: `${catName} · ${candidate.unit.symbol} → ${tUnit.symbol}`,
            badge: 'Suggested',
            icon: catIcon,
            equation: {
              fromVal: valFormatted,
              fromUnit: candPlural,
              fromSymbol: candidate.unit.symbol,
              toVal: formatted,
              toUnit: tPlural,
              toSymbol: tUnit.symbol,
            },
            payload: {
              action: 'convert',
              categoryId: catId,
              fromUnitId: candidate.unit.id,
              toUnitId: tUnit.id,
              value: val,
              hasExplicitValue: !!rawVal,
            },
          });
        }
      });

      if (suggestions.length > 0) {
        return suggestions;
      }
    }
  }

  // 5. Check for unsupported domain (Currency, Timezones)
  const unsupp = checkUnsupportedDomain(query);
  if (unsupp) {
    suggestions.push({
      id: `unsupported-${unsupp.domain}`,
      type: 'unsupported',
      title: `${unsupp.name} Not Supported`,
      subtitle: `ConvertThings specializes in physical and computational measurements. Currencies and time zones are not currently supported.`,
      badge: 'Notice',
      icon: 'AlertCircle',
      payload: {
        action: 'unsupported',
      },
    });
    return suggestions;
  }

  return suggestions;
}
