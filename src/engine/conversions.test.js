import {
  filterAndSortUnits,
  getUnitsForCategory,
  formatDisplayNumber,
  formatNumber,
  toFraction,
  parseFractionString,
  getCookingCompoundMeasure,
} from './conversions';

describe('filterAndSortUnits', () => {
  test('returns all units in original order when search query is empty or whitespace', () => {
    const digitalUnits = getUnitsForCategory('digital');
    expect(filterAndSortUnits(digitalUnits, '')).toEqual(digitalUnits);
    expect(filterAndSortUnits(digitalUnits, '   ')).toEqual(digitalUnits);
    expect(filterAndSortUnits(digitalUnits, null)).toEqual(digitalUnits);
  });

  test('prioritizes units that start with the search term (Digital Storage: "te")', () => {
    const digitalUnits = getUnitsForCategory('digital');
    const results = filterAndSortUnits(digitalUnits, 'te');

    // Terabytes and Tebibytes must come first because they start with "te"
    expect(results[0].id).toBe('tb'); // Terabyte
    expect(results[1].id).toBe('tib'); // Tebibyte

    // Non-prefix matches that contain "te" (like Bytes, Kilobytes, etc.) must still be included
    const resultIds = results.map((u) => u.id);
    expect(resultIds).toContain('byte');
    expect(resultIds).toContain('kb');
    expect(resultIds).toContain('kib');
    expect(resultIds).toContain('mb');
    expect(resultIds).toContain('mib');
    expect(resultIds).toContain('gb');
    expect(resultIds).toContain('gib');
    expect(resultIds).toContain('pb');

    // Units that do not match at all (e.g. Bit) must be excluded
    expect(resultIds).not.toContain('b');
  });

  test('prioritizes prefix matches over word-boundary and substring matches (Length: "mi")', () => {
    const lengthUnits = getUnitsForCategory('length');
    const results = filterAndSortUnits(lengthUnits, 'mi');

    const resultIds = results.map((u) => u.id);
    // Mile, Millimeter, Micrometer all start with "mi"
    // Nautical Mile has word "Mile" starting with "mi"
    expect(resultIds.indexOf('mi')).toBeLessThan(resultIds.indexOf('nmi'));
    expect(resultIds.indexOf('mm')).toBeLessThan(resultIds.indexOf('nmi'));
    expect(resultIds.indexOf('um')).toBeLessThan(resultIds.indexOf('nmi'));

    // Nautical Mile is still included
    expect(resultIds).toContain('nmi');
  });

  test('prioritizes exact matches at top (Length: "m")', () => {
    const lengthUnits = getUnitsForCategory('length');
    const results = filterAndSortUnits(lengthUnits, 'm');

    // Meter has symbol 'm' and id 'm', so it is an exact match and should be #1
    expect(results[0].id).toBe('m');

    // Next should be prefix matches (Millimeter, Micrometer, Mile)
    const resultIds = results.map((u) => u.id);
    expect(resultIds.slice(1, 4)).toEqual(expect.arrayContaining(['mm', 'um', 'mi']));

    // Followed by word match (Nautical Mile) and substring matches (Kilometer, Centimeter, Nanometer)
    expect(resultIds).toContain('km');
    expect(resultIds).toContain('cm');
    expect(resultIds).toContain('nm');
  });

  test('prioritizes word-boundary matches over arbitrary substring matches (Mass: "ton")', () => {
    const massUnits = getUnitsForCategory('mass');
    const results = filterAndSortUnits(massUnits, 'ton');

    const resultIds = results.map((u) => u.id);
    // Metric Ton (t), US Short Ton (ton_us), Imperial Long Ton (ton_uk) have word "ton"
    // Stone (st) has "ton" inside the word
    expect(resultIds.indexOf('t')).toBeLessThan(resultIds.indexOf('st'));
    expect(resultIds.indexOf('ton_us')).toBeLessThan(resultIds.indexOf('st'));
    expect(resultIds.indexOf('ton_uk')).toBeLessThan(resultIds.indexOf('st'));
    expect(resultIds).toContain('st');
  });

  test('handles temperature degree symbols correctly', () => {
    const tempUnits = getUnitsForCategory('temperature');
    const cResults = filterAndSortUnits(tempUnits, 'c');
    expect(cResults[0].id).toBe('c'); // Celsius

    const fResults = filterAndSortUnits(tempUnits, '°f');
    expect(fResults[0].id).toBe('f'); // Fahrenheit
  });

  test('is case insensitive and trims whitespace', () => {
    const digitalUnits = getUnitsForCategory('digital');
    const res1 = filterAndSortUnits(digitalUnits, 'TE');
    const res2 = filterAndSortUnits(digitalUnits, '  te  ');
    expect(res1.map((u) => u.id)).toEqual(res2.map((u) => u.id));
    expect(res1[0].id).toBe('tb');
  });

  test('returns empty array when no units match', () => {
    const digitalUnits = getUnitsForCategory('digital');
    const results = filterAndSortUnits(digitalUnits, 'xyz123');
    expect(results).toEqual([]);
  });
});

describe('formatDisplayNumber', () => {
  test('formats integers with thousands separators', () => {
    expect(formatDisplayNumber(1000)).toBe('1,000');
    expect(formatDisplayNumber(10000)).toBe('10,000');
    expect(formatDisplayNumber(100000)).toBe('100,000');
    expect(formatDisplayNumber(1000000)).toBe('1,000,000');
    expect(formatDisplayNumber(1000000000)).toBe('1,000,000,000');
    expect(formatDisplayNumber('1000000000000')).toBe('1,000,000,000,000');
  });

  test('formats numbers with decimals by only grouping the integer portion', () => {
    expect(formatDisplayNumber('1000.5')).toBe('1,000.5');
    expect(formatDisplayNumber('1234567.89123456')).toBe('1,234,567.89123456');
    expect(formatDisplayNumber(0.123456)).toBe('0.123456');
    expect(formatDisplayNumber('999.99')).toBe('999.99');
  });

  test('formats negative numbers correctly', () => {
    expect(formatDisplayNumber(-1000)).toBe('-1,000');
    expect(formatDisplayNumber('-1234567.89')).toBe('-1,234,567.89');
    expect(formatDisplayNumber(-40)).toBe('-40');
  });

  test('leaves small numbers and zero unchanged', () => {
    expect(formatDisplayNumber(0)).toBe('0');
    expect(formatDisplayNumber(1)).toBe('1');
    expect(formatDisplayNumber(12)).toBe('12');
    expect(formatDisplayNumber(999)).toBe('999');
  });

  test('preserves scientific/exponential notation without injecting commas', () => {
    expect(formatDisplayNumber('9.46073e15')).toBe('9.46073e15');
    expect(formatDisplayNumber('1e-7')).toBe('1e-7');
    expect(formatDisplayNumber('2.5E10')).toBe('2.5E10');
  });

  test('is idempotent when passed an already formatted string', () => {
    expect(formatDisplayNumber('1,000,000')).toBe('1,000,000');
    expect(formatDisplayNumber('1,234,567.89')).toBe('1,234,567.89');
  });

  test('handles empty, null, undefined, and non-numeric edge cases gracefully', () => {
    expect(formatDisplayNumber('')).toBe('');
    expect(formatDisplayNumber(null)).toBe('');
    expect(formatDisplayNumber(undefined)).toBe('');
    expect(formatDisplayNumber('-')).toBe('-');
  });
});

describe('toFraction', () => {
  test('converts exact decimal fractions to mixed fractions', () => {
    expect(toFraction(1.5)).toBe('1 1/2');
    expect(toFraction(0.5)).toBe('1/2');
    expect(toFraction(1.25)).toBe('1 1/4');
    expect(toFraction(0.75)).toBe('3/4');
    expect(toFraction(1.375)).toBe('1 3/8');
    expect(toFraction(0.125)).toBe('1/8');
    expect(toFraction(0.0625)).toBe('1/16');
    expect(toFraction(0.3125)).toBe('5/16');
  });

  test('snaps near fractions to nearest tape measure and culinary increments', () => {
    expect(toFraction(1.37795)).toBe('1 3/8'); // 35mm in inches
    expect(toFraction(0.3333)).toBe('1/3');
    expect(toFraction(0.6667)).toBe('2/3');
    expect(toFraction(1.251)).toBe('1 1/4');
  });

  test('converts decimal fractions to improper fractions when requested', () => {
    expect(toFraction(1.5, 32, true)).toBe('3/2');
    expect(toFraction(1.375, 32, true)).toBe('11/8');
    expect(toFraction(0.75, 32, true)).toBe('3/4');
    expect(toFraction(2.5, 32, true)).toBe('5/2');
    expect(toFraction(1.3333, 32, true)).toBe('4/3');
    expect(toFraction(-1.25, 32, true)).toBe('-5/4');
    expect(toFraction(5, 32, true)).toBe('5');
  });

  test('handles whole numbers, zero, and negative values', () => {
    expect(toFraction(0)).toBe('0');
    expect(toFraction(5)).toBe('5');
    expect(toFraction(-1.5)).toBe('-1 1/2');
    expect(toFraction(-0.25)).toBe('-1/4');
  });
});

describe('parseFractionString', () => {
  test('parses mixed fractions, simple fractions, and decimals', () => {
    expect(parseFractionString('1 1/2')).toBe(1.5);
    expect(parseFractionString('3/4')).toBe(0.75);
    expect(parseFractionString('1 3/8')).toBe(1.375);
    expect(parseFractionString('2.5')).toBe(2.5);
    expect(parseFractionString('10')).toBe(10);
    expect(parseFractionString('-1 1/4')).toBe(-1.25);
  });

  test('parses improper fractions', () => {
    expect(parseFractionString('11/8')).toBe(1.375);
    expect(parseFractionString('3/2')).toBe(1.5);
    expect(parseFractionString('5/4')).toBe(1.25);
    expect(parseFractionString('-5/2')).toBe(-2.5);
  });
});

describe('formatNumber precision modes', () => {
  test('formats numbers using scientific notation mode', () => {
    expect(formatNumber(1000, 'scientific')).toBe('1e+3');
    expect(formatNumber(0.00045, 'scientific')).toBe('4.5e-4');
    expect(formatNumber(263.64, 'scientific')).toBe('2.6364e+2');
  });

  test('formats numbers using fraction mode', () => {
    expect(formatNumber(1.375, 'fraction')).toBe('1 3/8');
    expect(formatNumber(0.5, 'fraction')).toBe('1/2');
    expect(formatNumber(2, 'fraction')).toBe('2');
  });

  test('formats numbers using improper fraction mode', () => {
    expect(formatNumber(1.375, 'fraction_improper')).toBe('11/8');
    expect(formatNumber(0.5, 'fraction_improper')).toBe('1/2');
    expect(formatNumber(2.5, 'fraction_improper')).toBe('5/2');
    expect(formatNumber(2, 'fraction_improper')).toBe('2');
  });

  test('formats numbers using exact full precision mode', () => {
    expect(formatNumber(1.25, 'exact')).toBe('1.25');
    expect(formatNumber(0.2641720524, 'exact')).toBe('0.2641720524');
    expect(formatNumber(10, 'exact')).toBe('10');
  });

  test('formats numbers using auto mode for cooking as practical culinary fractions', () => {
    expect(formatNumber(0.8125, 'auto', 'cooking')).toBe('13/16'); // 13 tbsp to cup
    expect(formatNumber(0.5, 'auto', 'cooking')).toBe('1/2');      // 1 stick butter to cup
    expect(formatNumber(1.375, 'auto', 'cooking')).toBe('1 3/8');
    expect(formatNumber(0.0625, 'auto', 'cooking')).toBe('1/16');  // 1 tbsp to cup
    expect(formatNumber(0.33333333, 'auto', 'cooking')).toBe('1/3'); // 1 tsp to tbsp
    expect(formatNumber(16, 'auto', 'cooking')).toBe('16');        // 1 cup to tbsp
    expect(formatNumber(3, 'auto', 'cooking')).toBe('3');          // 1 tbsp to tsp
  });
});

describe('getCookingCompoundMeasure', () => {
  test('returns practical compound kitchen measures for odd 16th cup fractions', () => {
    expect(getCookingCompoundMeasure(13 / 16, 'cup_us', 'cooking')).toBe('3/4 cup + 1 tbsp');
    expect(getCookingCompoundMeasure(7 / 16, 'cup_us', 'cooking')).toBe('1/4 cup + 3 tbsp');
    expect(getCookingCompoundMeasure(5 / 16, 'cup_us', 'cooking')).toBe('1/4 cup + 1 tbsp');
    expect(getCookingCompoundMeasure(9 / 16, 'cup_us', 'cooking')).toBe('1/2 cup + 1 tbsp');
    expect(getCookingCompoundMeasure(11 / 16, 'cup_us', 'cooking')).toBe('1/2 cup + 3 tbsp');
    expect(getCookingCompoundMeasure(15 / 16, 'cup_us', 'cooking')).toBe('3/4 cup + 3 tbsp');
    expect(getCookingCompoundMeasure(1 / 16, 'cup_us', 'cooking')).toBe('1 tbsp');
    expect(getCookingCompoundMeasure(2 / 16, 'cup_us', 'cooking')).toBe('2 tbsp');
    expect(getCookingCompoundMeasure(3 / 16, 'cup_us', 'cooking')).toBe('3 tbsp');
    expect(getCookingCompoundMeasure(17 / 16, 'cup_us', 'cooking')).toBe('1 cup + 1 tbsp');
    expect(getCookingCompoundMeasure(29 / 16, 'cup_us', 'cooking')).toBe('1 cup + 3/4 cup + 1 tbsp');
  });

  test('returns null for exact standard measuring cups that require no compound breakdown', () => {
    expect(getCookingCompoundMeasure(0.25, 'cup_us', 'cooking')).toBeNull(); // 1/4 cup
    expect(getCookingCompoundMeasure(0.5, 'cup_us', 'cooking')).toBeNull();  // 1/2 cup
    expect(getCookingCompoundMeasure(0.75, 'cup_us', 'cooking')).toBeNull(); // 3/4 cup
    expect(getCookingCompoundMeasure(1, 'cup_us', 'cooking')).toBeNull();    // 1 cup
    expect(getCookingCompoundMeasure(2, 'cup_us', 'cooking')).toBeNull();    // 2 cups
  });

  test('returns practical tablespoon and teaspoon breakdowns for fractional tablespoons', () => {
    expect(getCookingCompoundMeasure(4 / 3, 'tbsp_us', 'cooking')).toBe('1 tbsp + 1 tsp');
    expect(getCookingCompoundMeasure(5 / 3, 'tbsp_us', 'cooking')).toBe('1 tbsp + 2 tsp');
    expect(getCookingCompoundMeasure(1.5, 'tbsp_us', 'cooking')).toBe('1 tbsp + 1 1/2 tsp');
    expect(getCookingCompoundMeasure(1 / 3, 'tbsp_us', 'cooking')).toBe('1 tsp');
    expect(getCookingCompoundMeasure(2 / 3, 'tbsp_us', 'cooking')).toBe('2 tsp');
    expect(getCookingCompoundMeasure(0.5, 'tbsp_us', 'cooking')).toBe('1 1/2 tsp');
    expect(getCookingCompoundMeasure(1 / 6, 'tbsp_us', 'cooking')).toBe('1/2 tsp');
    expect(getCookingCompoundMeasure(2, 'tbsp_us', 'cooking')).toBeNull(); // clean 2 tbsp
  });

  test('returns practical tablespoon breakdowns for fractional butter sticks', () => {
    expect(getCookingCompoundMeasure(0.5, 'stick_butter', 'cooking')).toBe('4 tbsp (1/4 cup)');
    expect(getCookingCompoundMeasure(1.5, 'stick_butter', 'cooking')).toBe('12 tbsp (3/4 cup)');
    expect(getCookingCompoundMeasure(2, 'stick_butter', 'cooking')).toBe('16 tbsp (1 cup)');
  });
});
