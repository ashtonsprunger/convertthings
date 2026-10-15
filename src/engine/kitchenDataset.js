/**
 * ConvertThings Kitchen Studio Dataset
 * Data-Driven culinary dataset providing pantry staples, exact gram-density factors,
 * and unified unit definitions matching the core ConvertThings schema.
 *
 * All factors are exact linear conversions relative to grams (baseUnit: 'g', factor = 1).
 * Densities derived from USDA FoodData Central and King Arthur Baking standards.
 * 1 US Cup = 236.5882365 mL.
 */

export const CUP_ML = 236.5882365;

/**
 * Standard culinary pantry groups for shelf expansion and navigation.
 */
export const PANTRY_GROUPS = [
  'Flours & Grains',
  'Sugars & Sweeteners',
  'Dairy & Fats',
  'Liquids & Syrups',
  'Baking Essentials',
];

/**
 * 14 Core Kitchen Pantry Staples.
 * Each item mirrors the standard CATEGORIES schema 1:1, adding `group` and `gPerCup`.
 */
export const KITCHEN_CATEGORIES = [
  {
    id: 'flour_ap',
    name: 'All-Purpose Flour',
    shortName: 'Flour (AP)',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0,
    density_g_ml: 120.0 / CUP_ML,
    description: 'Spooned & leveled standard: 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'flour_bread',
    name: 'Bread Flour',
    shortName: 'Bread Flour',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 127.0,
    density_g_ml: 127.0 / CUP_ML,
    description: 'High-protein flour: 1 cup = 127 grams (~4.48 oz).',
  },
  {
    id: 'flour_whole_wheat',
    name: 'Whole Wheat Flour',
    shortName: 'Whole Wheat',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0,
    density_g_ml: 120.0 / CUP_ML,
    description: 'Whole grain flour: 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'flour_cake',
    name: 'Cake Flour',
    shortName: 'Cake Flour',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 114.0,
    density_g_ml: 114.0 / CUP_ML,
    description: 'Fine low-protein flour: 1 cup = 114 grams (~4.02 oz).',
  },
  {
    id: 'sugar_granulated',
    name: 'Granulated Sugar',
    shortName: 'White Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 200.0,
    density_g_ml: 200.0 / CUP_ML,
    description: 'White table sugar: 1 cup = 200 grams (~7.05 oz).',
  },
  {
    id: 'sugar_brown',
    name: 'Packed Brown Sugar',
    shortName: 'Brown Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 220.0,
    density_g_ml: 220.0 / CUP_ML,
    description: 'Firmly packed brown sugar: 1 cup = 220 grams (~7.76 oz).',
  },
  {
    id: 'sugar_powdered',
    name: 'Powdered Sugar',
    shortName: 'Powdered Sugar',
    icon: 'Sparkles',
    group: 'Sugars & Sweeteners',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 120.0,
    density_g_ml: 120.0 / CUP_ML,
    description: 'Icing sugar (sifted): 1 cup = 120 grams (~4.23 oz).',
  },
  {
    id: 'butter',
    name: 'Butter',
    shortName: 'Butter',
    icon: 'Box',
    group: 'Dairy & Fats',
    defaultFrom: 'stick_butter',
    defaultTo: 'g',
    gPerCup: 226.796185,
    density_g_ml: 226.796185 / CUP_ML,
    description: '1 stick = 1/2 cup = 8 tbsp = 113.4 grams (4 oz).',
  },
  {
    id: 'milk',
    name: 'Whole Milk',
    shortName: 'Milk',
    icon: 'Droplet',
    group: 'Dairy & Fats',
    defaultFrom: 'cup_us',
    defaultTo: 'ml',
    gPerCup: 244.0,
    density_g_ml: 244.0 / CUP_ML,
    description: 'Standard dairy milk: 1 cup = 244 grams (~8.6 oz).',
  },
  {
    id: 'oil_cooking',
    name: 'Cooking Oil',
    shortName: 'Cooking Oil',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 216.0,
    density_g_ml: 216.0 / CUP_ML,
    description: 'Vegetable, olive & canola oils: 1 cup = 216 grams (~7.62 oz).',
  },
  {
    id: 'honey',
    name: 'Honey & Molasses',
    shortName: 'Honey',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 340.0,
    density_g_ml: 340.0 / CUP_ML,
    description: 'Dense syrups: 1 cup = 340 grams (~12 oz).',
  },
  {
    id: 'cocoa_powder',
    name: 'Cocoa Powder',
    shortName: 'Cocoa Powder',
    icon: 'Sparkles',
    group: 'Baking Essentials',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 100.0,
    density_g_ml: 100.0 / CUP_ML,
    description: 'Unsweetened cocoa powder: 1 cup = 100 grams (~3.53 oz).',
  },
  {
    id: 'rolled_oats',
    name: 'Rolled Oats',
    shortName: 'Rolled Oats',
    icon: 'Wheat',
    group: 'Flours & Grains',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 90.0,
    density_g_ml: 90.0 / CUP_ML,
    description: 'Old-fashioned rolled oats: 1 cup = 90 grams (~3.17 oz).',
  },
  {
    id: 'chocolate_chips',
    name: 'Chocolate Chips',
    shortName: 'Choc Chips',
    icon: 'Sparkles',
    group: 'Baking Essentials',
    defaultFrom: 'cup_us',
    defaultTo: 'g',
    gPerCup: 170.0,
    density_g_ml: 170.0 / CUP_ML,
    description: 'Semi-sweet chips: 1 cup = 170 grams (~6.0 oz).',
  },
  {
    id: 'water',
    name: 'Water & Clear Liquids',
    shortName: 'Water',
    icon: 'Droplet',
    group: 'Liquids & Syrups',
    defaultFrom: 'cup_us',
    defaultTo: 'ml',
    gPerCup: CUP_ML,
    density_g_ml: 1.0,
    description: 'Pure liquid volume: 1 mL = 1 gram, 1 cup = 236.6 grams.',
  },
];

/**
 * Builds the complete array of units for an ingredient category.
 * Every unit has an exact linear factor relative to grams (baseUnit: 'g', factor = 1).
 *
 * @param {number} gPerCup - Density in grams per 1 US Cup
 * @param {boolean} [isButter=false] - Whether to include sticks of butter
 * @returns {Array<object>} Units matching the ConvertThings UNIT_DEFINITIONS schema
 */
export function buildIngredientUnits(gPerCup, isButter = false) {
  const gPerMl = gPerCup / CUP_ML;

  const units = [
    // --- Scale Weights (baseUnit = 'g', factor = 1.0) ---
    {
      id: 'g',
      name: 'Gram',
      plural: 'Grams',
      symbol: 'g',
      factor: 1.0,
      tier: 'common',
      subtitle: 'Standard digital scale weight',
      aliases: ['gram', 'grams', 'g'],
    },
    {
      id: 'oz',
      name: 'Ounce',
      plural: 'Ounces',
      symbol: 'oz',
      factor: 28.349523125,
      tier: 'common',
      subtitle: 'Scale weight (16 oz = 1 lb)',
      aliases: ['ounce', 'ounces', 'oz'],
    },
    {
      id: 'lb',
      name: 'Pound',
      plural: 'Pounds',
      symbol: 'lb',
      factor: 453.59237,
      tier: 'common',
      subtitle: 'Bulk scale weight',
      aliases: ['pound', 'pounds', 'lb', 'lbs'],
    },
    {
      id: 'kg',
      name: 'Kilogram',
      plural: 'Kilograms',
      symbol: 'kg',
      factor: 1000.0,
      tier: 'specialized',
      subtitle: '1,000 grams',
      aliases: ['kilogram', 'kilograms', 'kg'],
    },

    // --- Volume Measures (factor = grams per 1 unit of this volume) ---
    {
      id: 'cup_us',
      name: 'US Cup',
      plural: 'US Cups',
      symbol: 'cup',
      factor: gPerCup,
      tier: 'common',
      subtitle: 'Standard US measuring cup (236.6 mL)',
      aliases: ['cup', 'cups', 'c', 'us cup'],
    },
    {
      id: 'tbsp_us',
      name: 'US Tablespoon',
      plural: 'US Tablespoons',
      symbol: 'tbsp',
      factor: gPerCup / 16,
      tier: 'common',
      subtitle: '1/16 cup (14.8 mL)',
      aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'],
    },
    {
      id: 'tsp_us',
      name: 'US Teaspoon',
      plural: 'US Teaspoons',
      symbol: 'tsp',
      factor: gPerCup / 48,
      tier: 'common',
      subtitle: '1/3 tbsp (4.93 mL)',
      aliases: ['teaspoon', 'teaspoons', 'tsp'],
    },
    {
      id: 'floz_us',
      name: 'Fluid Ounce',
      plural: 'Fluid Ounces',
      symbol: 'fl oz',
      factor: gPerCup / 8,
      tier: 'common',
      subtitle: 'Fluid volume (2 tbsp / 29.6 mL)',
      aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz'],
    },
    {
      id: 'ml',
      name: 'Milliliter',
      plural: 'Milliliters',
      symbol: 'mL',
      factor: gPerMl,
      tier: 'common',
      subtitle: 'Metric liquid volume',
      aliases: ['milliliter', 'milliliters', 'ml', 'mL'],
    },
    {
      id: 'cup_metric',
      name: 'Metric Cup (250 mL)',
      plural: 'Metric Cups',
      symbol: 'metric cup',
      factor: gPerMl * 250.0,
      tier: 'specialized',
      subtitle: 'Commonwealth standard (250 mL)',
      aliases: ['metric cup', 'metric cups'],
    },
    {
      id: 'tbsp_metric',
      name: 'Metric Tablespoon (15 mL)',
      plural: 'Metric Tablespoons',
      symbol: 'metric tbsp',
      factor: gPerMl * 15.0,
      tier: 'specialized',
      subtitle: '15 mL metric spoon',
      aliases: ['metric tbsp', 'metric tablespoon'],
    },
    {
      id: 'l',
      name: 'Liter',
      plural: 'Liters',
      symbol: 'L',
      factor: gPerMl * 1000.0,
      tier: 'specialized',
      subtitle: '1,000 mL',
      aliases: ['liter', 'liters', 'l', 'L'],
    },
    {
      id: 'pinch',
      name: 'Pinch',
      plural: 'Pinches',
      symbol: 'pinch',
      factor: (gPerCup / 48) / 16,
      tier: 'specialized',
      subtitle: '1/16 tsp (~0.31 mL)',
      aliases: ['pinch', 'pinches'],
    },
    {
      id: 'dash',
      name: 'Dash',
      plural: 'Dashes',
      symbol: 'dash',
      factor: (gPerCup / 48) / 8,
      tier: 'specialized',
      subtitle: '1/8 tsp (~0.62 mL)',
      aliases: ['dash', 'dashes'],
    },
  ];

  if (isButter) {
    // Standard US stick of butter: 1/2 US cup = 8 tbsp = 113.3980925 grams (4 oz)
    units.push({
      id: 'stick_butter',
      name: 'Stick of Butter',
      plural: 'Sticks of Butter',
      symbol: 'stick',
      factor: 113.3980925,
      tier: 'common',
      subtitle: '1 stick = 1/2 cup = 8 tbsp (113.4g)',
      aliases: ['stick', 'sticks', 'stick of butter', 'sticks of butter', 'stick butter'],
    });
  }

  return units;
}

/**
 * Complete KITCHEN_UNIT_DEFINITIONS mapping each pantry staple to its units.
 * Identical schema to UNIT_DEFINITIONS.
 */
export const KITCHEN_UNIT_DEFINITIONS = Object.fromEntries(
  KITCHEN_CATEGORIES.map((cat) => [
    cat.id,
    {
      name: cat.name,
      baseUnit: 'g',
      units: buildIngredientUnits(cat.gPerCup, cat.id === 'butter'),
    },
  ])
);

/**
 * Checks if a category ID belongs to Kitchen Studio.
 */
export function isKitchenCategory(categoryId) {
  if (!categoryId) return false;
  return KITCHEN_CATEGORIES.some((c) => c.id === categoryId);
}

/**
 * Retrieves a kitchen category definition by ID.
 * Defaults to 'flour_ap' if not found.
 */
export function getKitchenCategory(categoryId) {
  if (!categoryId) return KITCHEN_CATEGORIES[0];
  const clean = String(categoryId).trim().toLowerCase();
  return KITCHEN_CATEGORIES.find((c) => c.id === clean) || KITCHEN_CATEGORIES[0];
}

/**
 * Retrieves a unit definition from the kitchen dataset.
 */
export function getKitchenUnit(categoryId, unitId) {
  const cat = KITCHEN_UNIT_DEFINITIONS[categoryId];
  if (!cat) return null;
  return cat.units.find((u) => u.id === unitId) || null;
}

/**
 * Retrieves all units for a kitchen category.
 */
export function getKitchenUnitsForCategory(categoryId) {
  const cat = KITCHEN_UNIT_DEFINITIONS[categoryId];
  return cat ? cat.units : [];
}

/**
 * Ingredient synonyms for Omnibox entity resolution and natural language parsing.
 */
export const KITCHEN_INGREDIENT_SYNONYMS = {
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
  water: ['water', 'tap water', 'filtered water'],
};

/**
 * Matches a query string to a kitchen ingredient category.
 */
export function matchKitchenIngredient(query) {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct ID match
  const byId = KITCHEN_CATEGORIES.find((c) => c.id === clean);
  if (byId) return byId;

  // 2. Direct Name / ShortName match
  const byName = KITCHEN_CATEGORIES.find(
    (c) => c.name.toLowerCase() === clean || c.shortName.toLowerCase() === clean
  );
  if (byName) return byName;

  // 3. Synonym matches (ordered longest first)
  for (const [ingId, synonyms] of Object.entries(KITCHEN_INGREDIENT_SYNONYMS)) {
    for (const syn of synonyms) {
      if (clean === syn || clean === `${syn}s`) {
        return getKitchenCategory(ingId);
      }
    }
  }

  return null;
}

/**
 * Extracts a kitchen ingredient entity and remaining text from a mixed query.
 * e.g., "1 cup flour to grams" -> { category: flour_ap, remainingText: "1 cup to grams" }
 */
export function extractKitchenIngredient(text) {
  if (!text || typeof text !== 'string') return { category: null, remainingText: text || '' };

  let working = text.trim();
  working = working.replace(/\bof\b/gi, ' ');

  const allEntries = [];
  for (const [ingId, synonyms] of Object.entries(KITCHEN_INGREDIENT_SYNONYMS)) {
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
        category: getKitchenCategory(ingId),
        remainingText: remaining,
      };
    }
  }

  return { category: null, remainingText: text.trim() };
}

/**
 * Calculates measuring drawer spoon equivalents for a given volume in mL or cups.
 * Converts odd fractional quantities into practical real-world drawer spoons (tbsp, tsp, 1/2 tsp, 1/4 tsp).
 *
 * @param {number} mL - Volume in milliliters
 * @returns {string} Human-friendly measuring drawer representation
 */
export function getKitchenDrawerBreakdown(mL) {
  if (!mL || mL <= 0 || isNaN(mL) || !isFinite(mL)) return '';

  const TBSP_ML = 14.78676478125;
  const TSP_ML = 4.92892159375;

  let remaining = mL;
  const parts = [];

  // Whole tablespoons
  if (remaining >= TBSP_ML) {
    const tbsp = Math.floor(remaining / TBSP_ML);
    remaining -= tbsp * TBSP_ML;
    parts.push(`${tbsp} tbsp`);
  }

  // Teaspoons
  if (remaining >= TSP_ML * 0.9) {
    const tsp = Math.floor(remaining / TSP_ML + 0.05);
    if (tsp > 0) {
      parts.push(`${tsp} tsp`);
      remaining -= tsp * TSP_ML;
    }
  } else if (remaining >= TSP_ML * 0.45) {
    parts.push('1/2 tsp');
  } else if (remaining >= TSP_ML * 0.2) {
    parts.push('1/4 tsp');
  }

  return parts.join(' + ');
}
