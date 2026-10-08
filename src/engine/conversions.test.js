import {
  filterAndSortUnits,
  getUnitsForCategory,
  formatDisplayNumber,
  formatNumber,
  toFraction,
  toTapeMeasureFraction,
  parseFractionString,
  formatFractionForDisplay,
  isFractionLike,
  getCookingCompoundMeasure,
  formatCulinaryFraction,
  convertUnits,
  getSmartEquationDisplay,
  UNIT_DEFINITIONS,
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

  test('formats fraction strings with clear typographic vulgar glyphs and hyphens', () => {
    expect(formatDisplayNumber('1 3/8')).toBe('1 ⅜');
    expect(formatDisplayNumber('3/4')).toBe('¾');
    expect(formatDisplayNumber('1 1/2')).toBe('1 ½');
    expect(formatDisplayNumber('1 13/16')).toBe('1-13/16');
    expect(formatDisplayNumber('11/8')).toBe('11/8');
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

  test('accurately resolves exact small fractions for unit ratios and returns 0 for non-fraction tiny decimals', () => {
    expect(toFraction(3 / 384)).toBe('1/128'); // 3 dashes in cup (0.0078125)
    expect(toFraction(1 / 384)).toBe('1/384'); // 1 dash in cup (0.002604)
    expect(toFraction(0.001)).toBe('1/1000'); // 1 mm in meter or 1 g in kg
    expect(toFraction(0.000125)).toBe('1/8000'); // 1 Mbps in GB/s
    expect(toFraction(1 / 3600)).toBe('1/3600'); // 1 sec in hr
    expect(toFraction(1 / 5280)).toBe('1/5280'); // 1 ft in mi
    expect(toFraction(0.00123456)).toBe('0'); // unresolvable small decimal
  });
});

describe('toTapeMeasureFraction', () => {
  test('snaps decimal values to nearest 1/16th or landmark 8th with +/- 1/32 offset', () => {
    expect(toTapeMeasureFraction(1 / 25.4)).toBe('1/32'); // 1 mm in inches
    expect(toTapeMeasureFraction(35 / 25.4)).toBe('1 3/8'); // 35 mm in inches
    expect(toTapeMeasureFraction(1 / 0.3048)).toBe('3 1/4 +1/32'); // 1 m in ft (3.28084 ft)
    expect(toTapeMeasureFraction(3.40625)).toBe('3 3/8 +1/32'); // 3 + 13/32
    expect(toTapeMeasureFraction(3.34375)).toBe('3 3/8 -1/32'); // 3 + 11/32
    expect(toTapeMeasureFraction(3.96875)).toBe('4 -1/32'); // 3 + 31/32
    expect(toTapeMeasureFraction(0.03125)).toBe('1/32');
    expect(toTapeMeasureFraction(0.0625)).toBe('1/16');
    expect(toTapeMeasureFraction(0.125)).toBe('1/8');
  });

  test('simplifies fractions to lowest terms (halves, quarters, eighths, sixteenths)', () => {
    expect(toTapeMeasureFraction(0.5)).toBe('1/2');
    expect(toTapeMeasureFraction(0.25)).toBe('1/4');
    expect(toTapeMeasureFraction(0.75)).toBe('3/4');
    expect(toTapeMeasureFraction(0.375)).toBe('3/8');
    expect(toTapeMeasureFraction(0.625)).toBe('5/8');
    expect(toTapeMeasureFraction(0.3125)).toBe('5/16');
  });

  test('handles zero, whole numbers, and negatives correctly', () => {
    expect(toTapeMeasureFraction(0)).toBe('0');
    expect(toTapeMeasureFraction(5)).toBe('5');
    expect(toTapeMeasureFraction(-1.5)).toBe('-1 1/2');
    expect(toTapeMeasureFraction(0.01)).toBe('0');
    expect(toTapeMeasureFraction(0.999)).toBe('1');
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

  test('parses hyphenated and plus mixed fractions', () => {
    expect(parseFractionString('1-3/8')).toBe(1.375);
    expect(parseFractionString('1-13/16')).toBe(1.8125);
    expect(parseFractionString('2-1/4')).toBe(2.25);
    expect(parseFractionString('-1-1/2')).toBe(-1.5);
    expect(parseFractionString('1+3/8')).toBe(1.375);
  });

  test('parses Unicode vulgar fraction characters and fraction slashes', () => {
    expect(parseFractionString('1 ⅜')).toBe(1.375);
    expect(parseFractionString('1⅜')).toBe(1.375);
    expect(parseFractionString('⅜')).toBe(0.375);
    expect(parseFractionString('1 ½')).toBe(1.5);
    expect(parseFractionString('½')).toBe(0.5);
    expect(parseFractionString('¾')).toBe(0.75);
    expect(parseFractionString('1 ¼')).toBe(1.25);
    expect(parseFractionString('-1 ⅜')).toBe(-1.375);
    expect(parseFractionString('-½')).toBe(-0.5);
    expect(parseFractionString('1 3⁄8')).toBe(1.375); // Unicode fraction slash U+2044
  });

  test('parses tape measure landmark fractions with +/- 1/32 offsets', () => {
    expect(parseFractionString('3 3/8 +1/32')).toBe(3.40625);
    expect(parseFractionString('3 3/8 -1/32')).toBe(3.34375);
    expect(parseFractionString('3 3/8 + 1/32')).toBe(3.40625);
    expect(parseFractionString('3 ⅜ +1/32')).toBe(3.40625);
    expect(parseFractionString('3 ⅜ -1/32')).toBe(3.34375);
    expect(parseFractionString('1/8 +1/32')).toBe(0.15625);
    expect(parseFractionString('4 -1/32')).toBe(3.96875);
  });

  test('handles empty, null, undefined, and non-numeric edge cases gracefully', () => {
    expect(parseFractionString('')).toBe(0);
    expect(parseFractionString(null)).toBe(0);
    expect(parseFractionString(undefined)).toBe(0);
    expect(parseFractionString('abc')).toBe(0);
  });
});

describe('formatFractionForDisplay', () => {
  test('formats mixed fractions with Unicode vulgar glyphs to eliminate optical ambiguity', () => {
    expect(formatFractionForDisplay('1 3/8')).toBe('1 ⅜');
    expect(formatFractionForDisplay('1 1/2')).toBe('1 ½');
    expect(formatFractionForDisplay('2 1/4')).toBe('2 ¼');
    expect(formatFractionForDisplay('3/4')).toBe('¾');
    expect(formatFractionForDisplay('1/2')).toBe('½');
    expect(formatFractionForDisplay('1/8')).toBe('⅛');
    expect(formatFractionForDisplay('-1 3/8')).toBe('-1 ⅜');
    expect(formatFractionForDisplay('-3/4')).toBe('-¾');
  });

  test('formats mixed 16ths and 32nds with hyphens to prevent optical misreading', () => {
    expect(formatFractionForDisplay('1 13/16')).toBe('1-13/16');
    expect(formatFractionForDisplay('3 9/32')).toBe('3-9/32');
    expect(formatFractionForDisplay('-1 5/16')).toBe('-1-5/16');
  });

  test('preserves simple fractions and improper fractions without whole numbers', () => {
    expect(formatFractionForDisplay('13/16')).toBe('13/16');
    expect(formatFractionForDisplay('11/8')).toBe('11/8');
    expect(formatFractionForDisplay('3/2')).toBe('3/2');
    expect(formatFractionForDisplay('5/4')).toBe('5/4');
  });

  test('formats compound kitchen measurements with clean vulgar fractions', () => {
    expect(formatFractionForDisplay('3/4 cup + 1 tbsp')).toBe('¾ cup + 1 tbsp');
    expect(formatFractionForDisplay('1 tbsp + 1 1/2 tsp')).toBe('1 tbsp + 1 ½ tsp');
    expect(formatFractionForDisplay('4 tbsp (1/4 cup)')).toBe('4 tbsp (¼ cup)');
  });

  test('leaves non-fraction numbers and strings unchanged', () => {
    expect(formatFractionForDisplay('25')).toBe('25');
    expect(formatFractionForDisplay('0')).toBe('0');
    expect(formatFractionForDisplay('')).toBe('');
    expect(formatFractionForDisplay(null)).toBe('');
  });
});

describe('isFractionLike', () => {
  test('detects fraction patterns accurately', () => {
    expect(isFractionLike('1 3/8')).toBe(true);
    expect(isFractionLike('1-3/8')).toBe(true);
    expect(isFractionLike('1 ⅜')).toBe(true);
    expect(isFractionLike('⅜')).toBe(true);
    expect(isFractionLike('11/8')).toBe(true);
    expect(isFractionLike('13/16')).toBe(true);
    expect(isFractionLike('10')).toBe(false);
    expect(isFractionLike('2.5')).toBe(false);
    expect(isFractionLike('0')).toBe(false);
    expect(isFractionLike('')).toBe(false);
    expect(isFractionLike(null)).toBe(false);
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
    expect(formatNumber(0.000125, 'fraction')).toBe('1/8000'); // 1 Mbps in GB/s
    expect(formatNumber(1 / 12, 'fraction')).toBe('1/12'); // 1 in in ft
    expect(formatNumber(1 / 60, 'fraction')).toBe('1/60'); // 1 s in min
  });

  test('formats numbers using improper fraction mode', () => {
    expect(formatNumber(1.375, 'fraction_improper')).toBe('11/8');
    expect(formatNumber(0.5, 'fraction_improper')).toBe('1/2');
    expect(formatNumber(2.5, 'fraction_improper')).toBe('5/2');
    expect(formatNumber(2, 'fraction_improper')).toBe('2');
    expect(formatNumber(0.000125, 'fraction_improper')).toBe('1/8000'); // 1 Mbps in GB/s
    expect(formatNumber(3 / 8000, 'fraction_improper')).toBe('3/8000'); // 3 Mbps in GB/s
    expect(formatNumber(1 / 12, 'fraction_improper')).toBe('1/12'); // 1 in in ft
    expect(formatNumber(1 / 3600, 'fraction_improper')).toBe('1/3600'); // 1 s in hr
  });

  test('formats numbers using tape measure mode with landmark 16ths and +/- 1/32 offsets', () => {
    expect(formatNumber(1.375, 'fraction_tape')).toBe('1 3/8');
    expect(formatNumber(1.37795, 'fraction_tape')).toBe('1 3/8'); // 35mm in inches snaps to 1 3/8
    expect(formatNumber(3.40625, 'fraction_tape')).toBe('3 3/8 +1/32'); // 3 + 13/32
    expect(formatNumber(3.34375, 'fraction_tape')).toBe('3 3/8 -1/32'); // 3 + 11/32
    expect(formatNumber(1 / 25.4, 'fraction_tape')).toBe('1/32'); // 1 mm to in on tape
    expect(formatNumber(1 / 25.4, 'fraction')).toBe('5/127'); // 1 mm to in exact algebraic fraction
    expect(formatNumber(1.375, 'tape')).toBe('1 3/8'); // legacy alias
    expect(formatNumber(1.375, 'fraction_16')).toBe('1 3/8'); // legacy alias
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
    expect(formatNumber(3 / 384, 'auto', 'cooking')).toBe('0.007813'); // 3 dashes to cup: never 1/1
    expect(formatNumber(1 / 384, 'auto', 'cooking')).toBe('0.002604'); // 1 dash to cup: never 1/1
  });

  test('formats numbers using auto mode with clean 4 significant figures for small values and capped decimals for large values', () => {
    expect(formatNumber(1 / 12, 'auto')).toBe('0.08333');
    expect(formatNumber(1 / 25.4, 'auto')).toBe('0.03937');
    expect(formatNumber(1 / 6, 'auto')).toBe('0.1667');
    expect(formatNumber(1 / 3, 'auto')).toBe('0.3333');
    expect(formatNumber(13 / 12, 'auto')).toBe('1.0833');
    expect(formatNumber(2.5, 'auto')).toBe('2.5');
    expect(formatNumber(1000, 'auto')).toBe('1000');
    expect(formatNumber(1234.5678, 'auto')).toBe('1234.57');
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

  test('converts sub-1/4 cup volumes into real-world measuring spoons (e.g. 34 mL -> 2 tbsp + 1 tsp)', () => {
    // 34 mL in cups (~0.1437 cup = 2.299 tbsp) -> 2 tbsp + 1 tsp (98.6% accurate!)
    const cups34mL = convertUnits(34, 'cooking', 'ml', 'cup_us');
    expect(getCookingCompoundMeasure(cups34mL, 'cup_us', 'cooking')).toBe('2 tbsp + 1 tsp');

    // 20 mL in cups (~0.0845 cup = 1.352 tbsp) -> 1 tbsp + 1 tsp
    const cups20mL = convertUnits(20, 'cooking', 'ml', 'cup_us');
    expect(getCookingCompoundMeasure(cups20mL, 'cup_us', 'cooking')).toBe('1 tbsp + 1 tsp');

    // 50 mL in cups (~0.2113 cup = 3.38 tbsp) -> 3 tbsp + 1 tsp
    const cups50mL = convertUnits(50, 'cooking', 'ml', 'cup_us');
    expect(getCookingCompoundMeasure(cups50mL, 'cup_us', 'cooking')).toBe('3 tbsp + 1 tsp');

    // 5 mL in cups (~1 tsp) -> 1 tsp
    const cups5mL = convertUnits(5, 'cooking', 'ml', 'cup_us');
    expect(getCookingCompoundMeasure(cups5mL, 'cup_us', 'cooking')).toBe('1 tsp');

    // 2.5 mL in cups (~0.5 tsp) -> 1/2 tsp
    const cups2_5mL = convertUnits(2.5, 'cooking', 'ml', 'cup_us');
    expect(getCookingCompoundMeasure(cups2_5mL, 'cup_us', 'cooking')).toBe('1/2 tsp');
  });

  test('ensures formatNumber never outputs 5/32 or any 32nds for cooking in auto mode', () => {
    const cups34mL = convertUnits(34, 'cooking', 'ml', 'cup_us');
    const formatted = formatNumber(cups34mL, 'auto', 'cooking');
    // Must be formatted as a clean decimal, NEVER bogus 5/32
    expect(formatted).not.toContain('/32');
    expect(formatted).not.toBe('5/32');
    expect(parseFloat(formatted)).toBeCloseTo(0.1437, 3);
  });
});

describe('formatCulinaryFraction', () => {
  test('recognizes standard culinary fractions and rejects non-culinary decimals', () => {
    expect(formatCulinaryFraction(0.5)).toBe('1/2');
    expect(formatCulinaryFraction(0.25)).toBe('1/4');
    expect(formatCulinaryFraction(0.75)).toBe('3/4');
    expect(formatCulinaryFraction(0.125)).toBe('1/8');
    expect(formatCulinaryFraction(0.375)).toBe('3/8');
    expect(formatCulinaryFraction(0.8125)).toBe('13/16'); // exact 13 tbsp
    expect(formatCulinaryFraction(1.3333)).toBe('1 1/3');
    expect(formatCulinaryFraction(1.6667)).toBe('1 2/3');

    // Continuous non-culinary values must return null (so formatNumber uses clean decimals)
    expect(formatCulinaryFraction(34 / 236.588)).toBeNull(); // 34 mL to cup
    expect(formatCulinaryFraction(20 / 236.588)).toBeNull(); // 20 mL to cup
    expect(formatCulinaryFraction(0.1437)).toBeNull();       // not 5/32
  });
});

describe('getSmartEquationDisplay', () => {
  const inUnit = UNIT_DEFINITIONS.length.units.find((u) => u.id === 'in');
  const ftUnit = UNIT_DEFINITIONS.length.units.find((u) => u.id === 'ft');
  const mUnit = UNIT_DEFINITIONS.length.units.find((u) => u.id === 'm');
  const ozUnit = UNIT_DEFINITIONS.mass.units.find((u) => u.id === 'oz');
  const lbUnit = UNIT_DEFINITIONS.mass.units.find((u) => u.id === 'lb');
  const sUnit = UNIT_DEFINITIONS.time.units.find((u) => u.id === 's');
  const minUnit = UNIT_DEFINITIONS.time.units.find((u) => u.id === 'min');
  const tbspUnit = UNIT_DEFINITIONS.volume.units.find((u) => u.id === 'tbsp_us');
  const cupUnit = UNIT_DEFINITIONS.volume.units.find((u) => u.id === 'cup_us');

  test('formats 1 in to ft as exact fraction 1/12 ft (never 1 in ≈ 1 in)', () => {
    const targetVal = convertUnits(1, 'length', 'in', 'ft');
    const defaultFmt = formatNumber(targetVal, 'auto', 'length');
    const result = getSmartEquationDisplay('length', inUnit, ftUnit, 1, targetVal, defaultFmt);

    expect(result.value).toBe('1/12');
    expect(result.unit).toBe('ft');
    expect(result.isSmart).toBe(true);
    expect(result.isExact).toBe(true);
    expect(result.subtext).toBe('≈ 0.08333 ft');
  });

  test('formats multi-foot imperial conversions as compound architectural feet & inches', () => {
    const targetVal18 = convertUnits(18, 'length', 'in', 'ft');
    const defaultFmt18 = formatNumber(targetVal18, 'auto', 'length');
    const result18 = getSmartEquationDisplay('length', inUnit, ftUnit, 18, targetVal18, defaultFmt18);

    expect(result18.value).toBe('1 ft 6 in');
    expect(result18.unit).toBe('');
    expect(result18.isSmart).toBe(true);
    expect(result18.isExact).toBe(true);

    const targetValM = convertUnits(1, 'length', 'm', 'ft');
    const defaultFmtM = formatNumber(targetValM, 'auto', 'length');
    const resultM = getSmartEquationDisplay('length', mUnit, ftUnit, 1, targetValM, defaultFmtM);

    expect(resultM.value).toBe('3 ft 3 3/8 in');
    expect(resultM.isSmart).toBe(true);
    expect(resultM.isExact).toBe(false);
  });

  test('formats mass sub-pound conversions as clean exact fractions and multi-pound as compound lb + oz', () => {
    // 2 oz in lb = 1/8 lb
    const targetVal2 = convertUnits(2, 'mass', 'oz', 'lb');
    const defaultFmt2 = formatNumber(targetVal2, 'auto', 'mass');
    const result2 = getSmartEquationDisplay('mass', ozUnit, lbUnit, 2, targetVal2, defaultFmt2);

    expect(result2.value).toBe('1/8');
    expect(result2.unit).toBe('lb');
    expect(result2.isSmart).toBe(true);
    expect(result2.isExact).toBe(true);

    // 26 oz in lb = 1 lb 10 oz
    const targetVal26 = convertUnits(26, 'mass', 'oz', 'lb');
    const defaultFmt26 = formatNumber(targetVal26, 'auto', 'mass');
    const result26 = getSmartEquationDisplay('mass', ozUnit, lbUnit, 26, targetVal26, defaultFmt26);

    expect(result26.value).toBe('1 lb 10 oz');
    expect(result26.unit).toBe('');
    expect(result26.isSmart).toBe(true);
    expect(result26.isExact).toBe(true);
  });

  test('formats time sub-unit conversions as clean exact fractions', () => {
    // 45 s in min = 3/4 min
    const targetVal45 = convertUnits(45, 'time', 's', 'min');
    const defaultFmt45 = formatNumber(targetVal45, 'auto', 'time');
    const result45 = getSmartEquationDisplay('time', sUnit, minUnit, 45, targetVal45, defaultFmt45);

    expect(result45.value).toBe('3/4');
    expect(result45.unit).toBe('min');
    expect(result45.isSmart).toBe(true);
    expect(result45.isExact).toBe(true);
  });

  test('formats volume exact unit fractions cleanly', () => {
    // 1 tbsp in cup = 1/16 cup
    const targetValTbsp = convertUnits(1, 'volume', 'tbsp_us', 'cup_us');
    const defaultFmtTbsp = formatNumber(targetValTbsp, 'auto', 'volume');
    const resultTbsp = getSmartEquationDisplay('volume', tbspUnit, cupUnit, 1, targetValTbsp, defaultFmtTbsp);

    expect(resultTbsp.value).toBe('1/16');
    expect(resultTbsp.unit).toBe('cup');
    expect(resultTbsp.isSmart).toBe(true);
    expect(resultTbsp.isExact).toBe(true);
  });
});
