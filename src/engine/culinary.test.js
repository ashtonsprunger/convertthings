import {
  CULINARY_INGREDIENTS,
  CULINARY_MASS_UNITS,
  getCulinaryIngredient,
  isCulinaryMassUnit,
  convertCulinary,
  getCulinaryFormula,
  getCulinaryWorkbenchUnits,
} from './culinary';

describe('ConvertThings Culinary & Baking Engine', () => {
  test('exposes comprehensive ingredient database with USDA & KAB standards', () => {
    expect(CULINARY_INGREDIENTS.length).toBeGreaterThanOrEqual(12);

    const apFlour = getCulinaryIngredient('flour_ap');
    expect(apFlour).toBeDefined();
    expect(apFlour.g_per_cup).toBe(120.0);

    const whiteSugar = getCulinaryIngredient('sugar_granulated');
    expect(whiteSugar).toBeDefined();
    expect(whiteSugar.g_per_cup).toBe(200.0);

    const butter = getCulinaryIngredient('butter');
    expect(butter).toBeDefined();
    expect(butter.g_per_stick).toBe(113.4);
  });

  test('correctly identifies culinary mass units vs volume units', () => {
    expect(isCulinaryMassUnit('g')).toBe(true);
    expect(isCulinaryMassUnit('oz')).toBe(true);
    expect(isCulinaryMassUnit('lb')).toBe(true);
    expect(isCulinaryMassUnit('kg')).toBe(true);
    expect(isCulinaryMassUnit('cup_us')).toBe(false);
    expect(isCulinaryMassUnit('tbsp_us')).toBe(false);
    expect(isCulinaryMassUnit('ml')).toBe(false);
  });

  describe('Volume to Mass Conversions (Baking Weight)', () => {
    test('converts cups of all-purpose flour to grams accurately (1 cup = 120g)', () => {
      const grams = convertCulinary(1, 'cup_us', 'g', 'flour_ap');
      expect(grams).toBeCloseTo(120.0, 1);

      const halfCup = convertCulinary(0.5, 'cup_us', 'g', 'flour_ap');
      expect(halfCup).toBeCloseTo(60.0, 1);

      const twoCups = convertCulinary(2, 'cup_us', 'g', 'flour_ap');
      expect(twoCups).toBeCloseTo(240.0, 1);
    });

    test('converts cups of granulated white sugar to grams accurately (1 cup = 200g)', () => {
      const grams = convertCulinary(1, 'cup_us', 'g', 'sugar_granulated');
      expect(grams).toBeCloseTo(200.0, 1);

      const quarterCup = convertCulinary(0.25, 'cup_us', 'g', 'sugar_granulated');
      expect(quarterCup).toBeCloseTo(50.0, 1);
    });

    test('converts cups of packed brown sugar to grams accurately (1 cup = 220g)', () => {
      const grams = convertCulinary(1, 'cup_us', 'g', 'sugar_brown');
      expect(grams).toBeCloseTo(220.0, 1);
    });

    test('converts butter sticks to grams (1 stick = 113.4g)', () => {
      const grams = convertCulinary(1, 'stick_butter', 'g', 'butter');
      expect(grams).toBeCloseTo(113.4, 1);

      const twoSticks = convertCulinary(2, 'stick_butter', 'g', 'butter');
      expect(twoSticks).toBeCloseTo(226.8, 1);
    });

    test('converts tablespoons of cocoa powder to grams', () => {
      // 1 cup = 16 tbsp = 100g -> 1 tbsp = 6.25g
      const grams = convertCulinary(1, 'tbsp_us', 'g', 'cocoa_powder');
      expect(grams).toBeCloseTo(6.25, 1);
    });

    test('converts cups of flour to ounces', () => {
      // 120g / 28.3495 = ~4.23 oz
      const oz = convertCulinary(1, 'cup_us', 'oz', 'flour_ap');
      expect(oz).toBeCloseTo(4.2328, 2);
    });
  });

  describe('Mass to Volume Conversions (Scale Weight to Measuring Tools)', () => {
    test('converts 120 grams of all-purpose flour to exactly 1 cup', () => {
      const cups = convertCulinary(120, 'g', 'cup_us', 'flour_ap');
      expect(cups).toBeCloseTo(1.0, 2);
    });

    test('converts 200 grams of sugar to exactly 1 cup', () => {
      const cups = convertCulinary(200, 'g', 'cup_us', 'sugar_granulated');
      expect(cups).toBeCloseTo(1.0, 2);
    });

    test('converts 113.4 grams of butter to 1 stick', () => {
      const sticks = convertCulinary(113.4, 'g', 'stick_butter', 'butter');
      expect(sticks).toBeCloseTo(1.0, 2);
    });

    test('converts 50 grams of sugar to tablespoons', () => {
      // 200g = 16 tbsp -> 50g = 4 tbsp
      const tbsp = convertCulinary(50, 'g', 'tbsp_us', 'sugar_granulated');
      expect(tbsp).toBeCloseTo(4.0, 1);
    });
  });

  describe('Volume to Volume & Mass to Mass (Density Invariance)', () => {
    test('volume to volume conversion is independent of ingredient density', () => {
      const tbspFlour = convertCulinary(1, 'cup_us', 'tbsp_us', 'flour_ap');
      const tbspSugar = convertCulinary(1, 'cup_us', 'tbsp_us', 'sugar_granulated');
      expect(tbspFlour).toBeCloseTo(16.0, 2);
      expect(tbspSugar).toBeCloseTo(16.0, 2);
    });

    test('mass to mass conversion is independent of ingredient density', () => {
      const ozGFlour = convertCulinary(1, 'oz', 'g', 'flour_ap');
      const ozGSugar = convertCulinary(1, 'oz', 'g', 'sugar_granulated');
      expect(ozGFlour).toBeCloseTo(28.3495, 2);
      expect(ozGSugar).toBeCloseTo(28.3495, 2);
    });
  });

  describe('Culinary Formulas & Explanations', () => {
    test('generates transparent density footnote and calculation instructions', () => {
      const formula = getCulinaryFormula('cup_us', 'g', 'flour_ap');
      expect(formula.isCrossDimensional).toBe(true);
      expect(formula.equation).toContain('cup');
      expect(formula.equation).toContain('g');
      expect(formula.instruction).toContain('density');
      expect(formula.densityNote).toContain('120 grams');
    });

    test('returns isCrossDimensional: false for standard volume to volume', () => {
      const formula = getCulinaryFormula('cup_us', 'tbsp_us', 'liquid');
      expect(formula.isCrossDimensional).toBe(false);
    });
  });

  describe('Workbench Unit Aggregation', () => {
    test('returns standard volume units when ingredient is liquid', () => {
      const units = getCulinaryWorkbenchUnits('liquid');
      expect(units.some((u) => u.id === 'cup_us')).toBe(true);
      expect(units.some((u) => u.id === 'g')).toBe(false);
    });

    test('adds mass units (g, oz, lb, kg) when baking ingredient is active', () => {
      const units = getCulinaryWorkbenchUnits('flour_ap');
      expect(units.some((u) => u.id === 'cup_us')).toBe(true);
      expect(units.some((u) => u.id === 'g')).toBe(true);
      expect(units.some((u) => u.id === 'oz')).toBe(true);
      expect(units.some((u) => u.id === 'lb')).toBe(true);
      expect(units.some((u) => u.id === 'kg')).toBe(true);
    });
  });
});
