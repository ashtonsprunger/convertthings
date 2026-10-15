/**
 * ConvertThings Culinary & Baking Engine
 * Provides ingredient density resolution (Volume <-> Mass), baking drawer tools,
 * and standard baking database based on USDA FoodData Central and King Arthur Baking standards.
 */

import { getUnit, convertUnits, formatNumber } from './conversions.js';

/**
 * Standard ingredient densities (grams per US cup).
 * Based on USDA FoodData Central and King Arthur Baking (spooned & leveled method).
 * 1 US Cup = 236.5882365 mL.
 */
export const CULINARY_INGREDIENTS = [
  {
    id: 'liquid',
    name: 'Water & All Liquids',
    shortName: 'Liquids',
    category: 'liquid',
    icon: 'Droplet',
    density_g_ml: 1.0,
    g_per_cup: 236.588,
    description: 'Standard liquid volume (1 g/mL = 1 kg/L).',
  },
  {
    id: 'flour_ap',
    name: 'All-Purpose Flour',
    shortName: 'Flour (AP)',
    category: 'flour',
    icon: 'Wheat',
    density_g_ml: 0.5072,
    g_per_cup: 120.0,
    description: 'Spooned & leveled standard: 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'flour_bread',
    name: 'Bread Flour',
    shortName: 'Bread Flour',
    category: 'flour',
    icon: 'Wheat',
    density_g_ml: 0.5368,
    g_per_cup: 127.0,
    description: 'Higher protein flour: 1 cup = 127 grams (~4.48 oz).',
  },
  {
    id: 'flour_cake',
    name: 'Cake Flour',
    shortName: 'Cake Flour',
    category: 'flour',
    icon: 'Wheat',
    density_g_ml: 0.4818,
    g_per_cup: 114.0,
    description: 'Fine low-protein flour: 1 cup = 114 grams (~4.02 oz).',
  },
  {
    id: 'flour_whole_wheat',
    name: 'Whole Wheat Flour',
    shortName: 'Whole Wheat',
    category: 'flour',
    icon: 'Wheat',
    density_g_ml: 0.5072,
    g_per_cup: 120.0,
    description: 'Whole grain flour: 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'sugar_granulated',
    name: 'Granulated White Sugar',
    shortName: 'Sugar (White)',
    category: 'sugar',
    icon: 'Sparkles',
    density_g_ml: 0.8453,
    g_per_cup: 200.0,
    description: 'White table sugar: 1 cup = 200 grams (~7.05 oz).',
  },
  {
    id: 'sugar_brown',
    name: 'Brown Sugar (Packed)',
    shortName: 'Brown Sugar',
    category: 'sugar',
    icon: 'Sparkles',
    density_g_ml: 0.9299,
    g_per_cup: 220.0,
    description: 'Firmly packed brown sugar: 1 cup = 220 grams (~7.76 oz).',
  },
  {
    id: 'sugar_powdered',
    name: 'Powdered / Confectioners Sugar',
    shortName: 'Powdered Sugar',
    category: 'sugar',
    icon: 'Sparkles',
    density_g_ml: 0.5072,
    g_per_cup: 120.0,
    description: 'Icing sugar (sifted): 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'butter',
    name: 'Butter',
    shortName: 'Butter',
    category: 'dairy',
    icon: 'Box',
    density_g_ml: 0.9595,
    g_per_cup: 227.0,
    g_per_stick: 113.4,
    description: '1 stick = 1/2 cup = 8 tbsp = 113.4 grams (4 oz).',
  },
  {
    id: 'honey',
    name: 'Honey & Molasses',
    shortName: 'Honey / Molasses',
    category: 'syrup',
    icon: 'Droplet',
    density_g_ml: 1.4371,
    g_per_cup: 340.0,
    description: 'Dense syrup: 1 cup = 340 grams (~12 oz).',
  },
  {
    id: 'oil_cooking',
    name: 'Olive Oil & Cooking Oil',
    shortName: 'Cooking Oil',
    category: 'oil',
    icon: 'Droplet',
    density_g_ml: 0.913,
    g_per_cup: 216.0,
    description: 'Plant oils: 1 cup = 216 grams (~7.62 oz).',
  },
  {
    id: 'rolled_oats',
    name: 'Rolled Oats',
    shortName: 'Rolled Oats',
    category: 'grain',
    icon: 'Wheat',
    density_g_ml: 0.3804,
    g_per_cup: 90.0,
    description: 'Old-fashioned oats: 1 cup = 90 grams (~3.17 oz).',
  },
  {
    id: 'cocoa_powder',
    name: 'Cocoa Powder (Unsweetened)',
    shortName: 'Cocoa Powder',
    category: 'baking',
    icon: 'Sparkles',
    density_g_ml: 0.4227,
    g_per_cup: 100.0,
    description: 'Dutch or natural cocoa: 1 cup = 100 grams (~3.53 oz).',
  },
  {
    id: 'milk',
    name: 'Whole Milk',
    shortName: 'Milk',
    category: 'dairy',
    icon: 'Droplet',
    density_g_ml: 1.0313,
    g_per_cup: 244.0,
    description: 'Standard dairy milk: 1 cup = 244 grams (~8.6 oz).',
  },
  {
    id: 'chocolate_chips',
    name: 'Chocolate Chips',
    shortName: 'Chocolate Chips',
    category: 'baking',
    icon: 'Sparkles',
    density_g_ml: 0.7185,
    g_per_cup: 170.0,
    description: 'Semi-sweet chips: 1 cup = 170 grams (~6.0 oz).',
  },
];

/**
 * Standard kitchen mass / weight units available when an ingredient is selected.
 */
export const CULINARY_MASS_UNITS = [
  { id: 'g', symbol: 'g', name: 'Gram', plural: 'Grams', factorToGrams: 1.0, isMass: true },
  { id: 'oz', symbol: 'oz', name: 'Ounce', plural: 'Ounces', factorToGrams: 28.349523125, isMass: true },
  { id: 'lb', symbol: 'lb', name: 'Pound', plural: 'Pounds', factorToGrams: 453.59237, isMass: true },
  { id: 'kg', symbol: 'kg', name: 'Kilogram', plural: 'Kilograms', factorToGrams: 1000.0, isMass: true },
];

/**
 * Retrieves ingredient definition by ID.
 * Defaults to 'liquid' if not found.
 */
export function getCulinaryIngredient(ingredientId) {
  if (!ingredientId) return CULINARY_INGREDIENTS[0];
  const clean = String(ingredientId).trim().toLowerCase();
  return (
    CULINARY_INGREDIENTS.find(
      (ing) => ing.id === clean || ing.shortName.toLowerCase() === clean || ing.name.toLowerCase() === clean
    ) || CULINARY_INGREDIENTS[0]
  );
}

/**
 * Determines whether a unit ID is a culinary mass unit.
 */
export function isCulinaryMassUnit(unitId) {
  if (!unitId) return false;
  return CULINARY_MASS_UNITS.some((u) => u.id === unitId || u.symbol === unitId);
}

/**
 * Volume units in mL (conversion factor from 1 unit to milliliters).
 */
export const CULINARY_VOLUME_TO_ML = {
  ml: 1.0,
  l: 1000.0,
  cup_us: 236.5882365,
  cup_metric: 250.0,
  tbsp_us: 14.78676478125,
  tbsp_metric: 15.0,
  tsp_us: 4.92892159375,
  dsp: 10.0,
  floz_us: 29.5735295625,
  pt_us: 473.176473,
  qt_us: 946.352946,
  gal_us: 3785.411784,
  stick_butter: 118.29411825, // 1 stick = 1/2 US cup = 118.29 mL
  pinch: 0.308057599609375, // 1/16 tsp
  dash: 0.61611519921875, // 1/8 tsp
  tad: 1.2322303984375, // 1/4 tsp
  smidgen: 0.1540287998046875, // 1/32 tsp
  drop: 0.05, // ~1/20 mL
  shot: 44.36029434375, // 1.5 fl oz jigger
};

/**
 * Mass units in grams (conversion factor from 1 unit to grams).
 */
export const CULINARY_MASS_TO_GRAMS = {
  g: 1.0,
  oz: 28.349523125,
  lb: 453.59237,
  kg: 1000.0,
};

/**
 * Converts value between any two culinary units (Volume <-> Volume, Volume <-> Mass, or Mass <-> Mass)
 * taking ingredient density into account.
 *
 * @param {number|string} value Input numeric value
 * @param {string} fromUnitId Source unit ID (volume or mass)
 * @param {string} toUnitId Target unit ID (volume or mass)
 * @param {string} [ingredientId='liquid'] Ingredient key (e.g. 'flour_ap', 'sugar_granulated')
 * @returns {number|null} Converted numeric value or null if invalid
 */
export function convertCulinary(value, fromUnitId, toUnitId, ingredientId = 'liquid') {
  const numericVal = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(numericVal) || !isFinite(numericVal)) return null;

  if (fromUnitId === toUnitId) return numericVal;

  const ingredient = getCulinaryIngredient(ingredientId);
  const CUP_ML = 236.5882365;
  const density = ingredient.g_per_cup ? (ingredient.g_per_cup / CUP_ML) : ingredient.density_g_ml;

  const isFromMass = isCulinaryMassUnit(fromUnitId);
  const isToMass = isCulinaryMassUnit(toUnitId);

  // Special case: stick of butter when ingredient is butter
  if (ingredient.id === 'butter') {
    if (fromUnitId === 'stick_butter' && toUnitId === 'g') {
      return Math.round(numericVal * 113.4 * 1e10) / 1e10;
    }
    if (fromUnitId === 'g' && toUnitId === 'stick_butter') {
      return Math.round((numericVal / 113.4) * 1e10) / 1e10;
    }
  }

  // 1. Volume to Volume (Density cancels out)
  if (!isFromMass && !isToMass) {
    const fromMl = CULINARY_VOLUME_TO_ML[fromUnitId];
    const toMl = CULINARY_VOLUME_TO_ML[toUnitId];
    if (fromMl && toMl) {
      return (numericVal * fromMl) / toMl;
    }
    // Fallback to standard convertUnits in cooking domain
    return convertUnits(numericVal, 'cooking', fromUnitId, toUnitId);
  }

  // 2. Mass to Mass (Density cancels out)
  if (isFromMass && isToMass) {
    const fromG = CULINARY_MASS_TO_GRAMS[fromUnitId];
    const toG = CULINARY_MASS_TO_GRAMS[toUnitId];
    if (fromG && toG) {
      return (numericVal * fromG) / toG;
    }
    return convertUnits(numericVal, 'mass', fromUnitId, toUnitId);
  }

  // 3. Volume to Mass (m = V * density)
  if (!isFromMass && isToMass) {
    const fromMl = CULINARY_VOLUME_TO_ML[fromUnitId];
    const toG = CULINARY_MASS_TO_GRAMS[toUnitId];
    if (!fromMl || !toG) return null;

    const totalMl = numericVal * fromMl;
    const totalGrams = totalMl * density;
    const res = totalGrams / toG;
    return Math.round(res * 1e10) / 1e10;
  }

  // 4. Mass to Volume (V = m / density)
  if (isFromMass && !isToMass) {
    const fromG = CULINARY_MASS_TO_GRAMS[fromUnitId];
    const toMl = CULINARY_VOLUME_TO_ML[toUnitId];
    if (!fromG || !toMl) return null;

    const totalGrams = numericVal * fromG;
    const totalMl = totalGrams / density;
    const res = totalMl / toMl;
    return Math.round(res * 1e10) / 1e10;
  }

  return null;
}

/**
 * Generates an educational step-by-step culinary formula and density explanation.
 *
 * @param {string} fromUnitId
 * @param {string} toUnitId
 * @param {string} ingredientId
 * @returns {object} Formula equation and human explanation
 */
export function getCulinaryFormula(fromUnitId, toUnitId, ingredientId = 'liquid') {
  const ingredient = getCulinaryIngredient(ingredientId);
  const isFromMass = isCulinaryMassUnit(fromUnitId);
  const isToMass = isCulinaryMassUnit(toUnitId);

  // Cross-dimensional: Volume to Mass or Mass to Volume
  if (isFromMass !== isToMass) {
    const unit1Grams = convertCulinary(1, fromUnitId, toUnitId, ingredient.id);
    const formatted1 = unit1Grams !== null ? formatNumber(unit1Grams, 4) : '';

    const fromUnitDef = isFromMass
      ? CULINARY_MASS_UNITS.find((u) => u.id === fromUnitId)
      : getUnit('cooking', fromUnitId);
    const toUnitDef = isToMass
      ? CULINARY_MASS_UNITS.find((u) => u.id === toUnitId)
      : getUnit('cooking', toUnitId);

    const fromSym = fromUnitDef?.symbol || fromUnitId;
    const toSym = toUnitDef?.symbol || toUnitId;

    return {
      isCrossDimensional: true,
      ingredientName: ingredient.name,
      densityNote: ingredient.description,
      equation: `1 ${fromSym} ${ingredient.shortName} ≈ ${formatted1} ${toSym}`,
      instruction: isFromMass
        ? `To convert ${fromSym} of ${ingredient.name.toLowerCase()} to ${toSym}, divide mass by the ingredient density factor (${ingredient.g_per_cup} g/cup).`
        : `To convert ${fromSym} of ${ingredient.name.toLowerCase()} to ${toSym}, multiply volume by the ingredient density (${ingredient.g_per_cup} g/cup).`,
    };
  }

  return {
    isCrossDimensional: false,
    ingredientName: ingredient.name,
    densityNote: null,
    equation: null,
    instruction: null,
  };
}

/**
 * Returns the full list of available units for the Cooking workbench based on whether an ingredient is selected.
 *
 * @param {string} [ingredientId='liquid']
 * @returns {Array<object>} Unified list of units
 */
export function getCulinaryWorkbenchUnits(ingredientId = 'liquid') {
  // Standard cooking volume units
  const volumeUnits = [
    { id: 'cup_us', name: 'US Cup', symbol: 'cup', group: 'Volume' },
    { id: 'tbsp_us', name: 'US Tablespoon', symbol: 'tbsp', group: 'Volume' },
    { id: 'tsp_us', name: 'US Teaspoon', symbol: 'tsp', group: 'Volume' },
    { id: 'ml', name: 'Milliliter', symbol: 'mL', group: 'Volume' },
    { id: 'floz_us', name: 'Fluid Ounce', symbol: 'fl oz', group: 'Volume' },
    { id: 'stick_butter', name: 'Stick of Butter', symbol: 'stick', group: 'Volume' },
    { id: 'l', name: 'Liter', symbol: 'L', group: 'Volume' },
    { id: 'cup_metric', name: 'Metric Cup (250 mL)', symbol: 'metric cup', group: 'Volume' },
    { id: 'tbsp_metric', name: 'Metric Tablespoon', symbol: 'metric tbsp', group: 'Volume' },
    { id: 'dsp', name: 'Dessertspoon', symbol: 'dsp', group: 'Volume' },
    { id: 'pinch', name: 'Pinch', symbol: 'pinch', group: 'Volume' },
    { id: 'dash', name: 'Dash', symbol: 'dash', group: 'Volume' },
    { id: 'tad', name: 'Tad', symbol: 'tad', group: 'Volume' },
    { id: 'smidgen', name: 'Smidgen', symbol: 'smidgen', group: 'Volume' },
    { id: 'drop', name: 'Drop', symbol: 'drop', group: 'Volume' },
    { id: 'shot', name: 'Standard Shot (Jigger)', symbol: 'shot', group: 'Volume' },
    { id: 'pt_us', name: 'US Pint', symbol: 'pt', group: 'Volume' },
    { id: 'qt_us', name: 'US Quart', symbol: 'qt', group: 'Volume' },
    { id: 'gal_us', name: 'US Gallon', symbol: 'gal', group: 'Volume' },
  ];

  // If ingredient is water/liquid, volume is standard
  if (ingredientId === 'liquid') {
    return volumeUnits;
  }

  // If an ingredient is active, prepend standard mass units for seamless baking scales!
  const massUnits = [
    { id: 'g', name: 'Gram', symbol: 'g', group: 'Weight / Mass' },
    { id: 'oz', name: 'Ounce', symbol: 'oz', group: 'Weight / Mass' },
    { id: 'lb', name: 'Pound', symbol: 'lb', group: 'Weight / Mass' },
    { id: 'kg', name: 'Kilogram', symbol: 'kg', group: 'Weight / Mass' },
  ];

  return [...volumeUnits, ...massUnits];
}

/**
 * Standard ingredient synonyms for NLP entity parsing and Omnibox search.
 */
export const CULINARY_INGREDIENT_SYNONYMS = {
  flour_bread: ['bread flour', 'strong flour', 'high protein flour'],
  flour_cake: ['cake flour', 'pastry flour'],
  flour_whole_wheat: ['whole wheat flour', 'whole wheat', 'wholemeal flour', 'wholemeal'],
  flour_ap: ['all purpose flour', 'all-purpose flour', 'ap flour', 'white flour', 'plain flour', 'wheat flour', 'flour'],
  sugar_brown: ['brown sugar', 'packed brown sugar', 'light brown sugar', 'dark brown sugar'],
  sugar_powdered: ['powdered sugar', 'confectioners sugar', 'confectioner sugar', 'icing sugar'],
  sugar_granulated: ['granulated sugar', 'white sugar', 'table sugar', 'granulated white sugar', 'sugar'],
  butter: ['butter', 'unsalted butter', 'salted butter', 'margarine'],
  honey: ['honey', 'molasses', 'maple syrup', 'corn syrup', 'agave syrup', 'syrup'],
  oil_cooking: ['cooking oil', 'vegetable oil', 'olive oil', 'canola oil', 'oil'],
  rolled_oats: ['rolled oats', 'oats', 'oatmeal', 'old-fashioned oats'],
  cocoa_powder: ['cocoa powder', 'cocoa', 'cacao powder', 'cacao'],
  milk: ['whole milk', 'dairy milk', 'milk'],
  chocolate_chips: ['chocolate chips', 'choc chips', 'chocolate morsels'],
  liquid: ['water', 'liquid', 'liquids'],
};

/**
 * Matches an ingredient from a raw token.
 *
 * @param {string} text
 * @returns {object|null}
 */
export function matchCulinaryIngredient(text) {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim().toLowerCase();

  // 1. Direct ID match
  const byId = CULINARY_INGREDIENTS.find((i) => i.id === clean);
  if (byId) return byId;

  // 2. Direct Name / ShortName match
  const byName = CULINARY_INGREDIENTS.find(
    (i) => i.name.toLowerCase() === clean || i.shortName.toLowerCase() === clean
  );
  if (byName) return byName;

  // 3. Synonym matches (ordered so specific terms like 'bread flour' precede 'flour')
  for (const [ingId, synonyms] of Object.entries(CULINARY_INGREDIENT_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean === syn || clean === `${syn}s`) {
        return getCulinaryIngredient(ingId);
      }
    }
  }

  return null;
}

/**
 * Extracts ingredient from a mixed string (e.g. "1 cup flour" -> ingredient: flour_ap, cleanedText: "1 cup").
 *
 * @param {string} text
 * @returns {{ ingredient: object|null, cleanedText: string }}
 */
export function extractCulinaryIngredient(text) {
  if (!text || typeof text !== 'string') return { ingredient: null, cleanedText: text || '' };

  let working = text.trim();
  // Strip "of" (e.g. "cup of flour" -> "cup flour")
  working = working.replace(/\bof\b/gi, ' ');

  // Test multi-word and single-word synonyms ordered longest first
  const allEntries = [];
  for (const [ingId, synonyms] of Object.entries(CULINARY_INGREDIENT_SYNONYMS)) {
    for (const syn of synonyms) {
      allEntries.push({ syn, ingId });
    }
  }
  allEntries.sort((a, b) => b.syn.length - a.syn.length);

  for (const { syn, ingId } of allEntries) {
    const regex = new RegExp(`\\b${syn}\\b`, 'i');
    if (regex.test(working)) {
      const remaining = working.replace(regex, ' ').replace(/\s+/g, ' ').trim();
      return {
        ingredient: getCulinaryIngredient(ingId),
        cleanedText: remaining,
      };
    }
  }

  return { ingredient: null, cleanedText: text.trim() };
}
