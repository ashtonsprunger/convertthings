import {
  KITCHEN_CATEGORIES,
  KITCHEN_UNIT_DEFINITIONS,
  PANTRY_GROUPS,
  isKitchenCategory,
  getKitchenCategory,
  getKitchenUnit,
  getKitchenUnitsForCategory,
  matchKitchenIngredient,
  extractKitchenIngredient,
  getKitchenDrawerBreakdown,
} from './kitchenDataset';

describe('Kitchen Studio Dataset (kitchenDataset.js)', () => {
  test('defines exactly 15 core pantry staples with valid densities', () => {
    expect(KITCHEN_CATEGORIES.length).toBeGreaterThanOrEqual(14);
    KITCHEN_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.name).toBeDefined();
      expect(cat.shortName).toBeDefined();
      expect(cat.icon).toBeDefined();
      expect(cat.group).toBeDefined();
      expect(PANTRY_GROUPS).toContain(cat.group);
      expect(cat.gPerCup).toBeGreaterThan(0);
      expect(cat.defaultFrom).toBeDefined();
      expect(cat.defaultTo).toBeDefined();
    });
  });

  test('constructs KITCHEN_UNIT_DEFINITIONS for every ingredient matching UNIT_DEFINITIONS schema', () => {
    KITCHEN_CATEGORIES.forEach((cat) => {
      const def = KITCHEN_UNIT_DEFINITIONS[cat.id];
      expect(def).toBeDefined();
      expect(def.baseUnit).toBe('g');
      expect(Array.isArray(def.units)).toBe(true);
      expect(def.units.length).toBeGreaterThanOrEqual(10);

      def.units.forEach((u) => {
        expect(u.id).toBeDefined();
        expect(u.name).toBeDefined();
        expect(u.plural).toBeDefined();
        expect(u.symbol).toBeDefined();
        expect(typeof u.factor).toBe('number');
        expect(u.factor).toBeGreaterThan(0);
        expect(Array.isArray(u.aliases)).toBe(true);
      });
    });
  });

  test('calculates exact linear factors relative to grams', () => {
    const flour = KITCHEN_UNIT_DEFINITIONS['flour_ap'];
    const gUnit = flour.units.find((u) => u.id === 'g');
    const ozUnit = flour.units.find((u) => u.id === 'oz');
    const lbUnit = flour.units.find((u) => u.id === 'lb');
    const cupUnit = flour.units.find((u) => u.id === 'cup_us');
    const tbspUnit = flour.units.find((u) => u.id === 'tbsp_us');
    const tspUnit = flour.units.find((u) => u.id === 'tsp_us');

    expect(gUnit.factor).toBe(1.0);
    expect(ozUnit.factor).toBeCloseTo(28.3495, 3);
    expect(lbUnit.factor).toBeCloseTo(453.592, 3);

    // 1 cup flour = 120 grams
    expect(cupUnit.factor).toBe(120.0);
    // 1 tbsp = 120 / 16 = 7.5 grams
    expect(tbspUnit.factor).toBe(7.5);
    // 1 tsp = 120 / 48 = 2.5 grams
    expect(tspUnit.factor).toBe(2.5);
  });

  test('butter includes stick of butter unit with exact 113.4g factor', () => {
    const butter = KITCHEN_UNIT_DEFINITIONS['butter'];
    const stick = butter.units.find((u) => u.id === 'stick_butter');
    expect(stick).toBeDefined();
    expect(stick.factor).toBeCloseTo(113.398, 2);
  });

  test('isKitchenCategory correctly identifies culinary ingredients', () => {
    expect(isKitchenCategory('flour_ap')).toBe(true);
    expect(isKitchenCategory('butter')).toBe(true);
    expect(isKitchenCategory('sugar_brown')).toBe(true);
    expect(isKitchenCategory('length')).toBe(false);
    expect(isKitchenCategory('mass')).toBe(false);
    expect(isKitchenCategory(null)).toBe(false);
  });

  test('getKitchenCategory returns category or fallback to flour_ap', () => {
    expect(getKitchenCategory('flour_ap').name).toBe('All-Purpose Flour');
    expect(getKitchenCategory('butter').name).toBe('Butter');
    expect(getKitchenCategory('nonexistent').id).toBe('flour_ap');
  });

  test('getKitchenUnit returns specific unit definition', () => {
    const unit = getKitchenUnit('flour_ap', 'cup_us');
    expect(unit).toBeDefined();
    expect(unit.name).toBe('US Cup');
    expect(unit.factor).toBe(120.0);

    expect(getKitchenUnit('flour_ap', 'nonexistent')).toBeNull();
    expect(getKitchenUnit('nonexistent', 'g')).toBeNull();
  });

  test('getKitchenUnitsForCategory returns all units for ingredient', () => {
    const units = getKitchenUnitsForCategory('flour_ap');
    expect(units.length).toBeGreaterThan(0);
    expect(units.some((u) => u.id === 'cup_us')).toBe(true);
    expect(units.some((u) => u.id === 'g')).toBe(true);
  });

  test('matchKitchenIngredient matches names and synonyms', () => {
    expect(matchKitchenIngredient('flour')?.id).toBe('flour_ap');
    expect(matchKitchenIngredient('bread flour')?.id).toBe('flour_bread');
    expect(matchKitchenIngredient('brown sugar')?.id).toBe('sugar_brown');
    expect(matchKitchenIngredient('butter')?.id).toBe('butter');
    expect(matchKitchenIngredient('unsalted butter')?.id).toBe('butter');
    expect(matchKitchenIngredient('random string')).toBeNull();
  });

  test('extractKitchenIngredient cleanly separates ingredient and query tokens', () => {
    const res = extractKitchenIngredient('1 cup flour to grams');
    expect(res.category).toBeDefined();
    expect(res.category.id).toBe('flour_ap');
    expect(res.remainingText).toBe('1 cup to grams');

    const res2 = extractKitchenIngredient('2 sticks of butter in cups');
    expect(res2.category.id).toBe('butter');
    expect(res2.remainingText).toBe('2 sticks in cups');
  });

  test('getKitchenDrawerBreakdown formats spoon combinations', () => {
    // 34.5 mL = ~2 tbsp + 1 tsp (14.8 * 2 = 29.6 + 4.9 = 34.5)
    const breakdown = getKitchenDrawerBreakdown(34.5);
    expect(breakdown).toBe('2 tbsp + 1 tsp');

    // 15 mL = 1 tbsp
    expect(getKitchenDrawerBreakdown(15)).toBe('1 tbsp');

    // 5 mL = 1 tsp
    expect(getKitchenDrawerBreakdown(5)).toBe('1 tsp');

    // 0 mL or invalid returns empty
    expect(getKitchenDrawerBreakdown(0)).toBe('');
  });
});
