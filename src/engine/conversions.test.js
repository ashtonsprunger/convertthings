import {
  filterAndSortUnits,
  getUnitsForCategory,
  getCommonUnitsForCategory,
  getSpecializedUnitsForCategory,
  isSpecializedUnit,
  formatDisplayNumber,
  formatNumber,
  toFraction,
  toTapeMeasureFraction,
  parseFractionString,
  formatFractionForDisplay,
  formatCompoundForDisplay,
  isFractionLike,
  isCompoundLike,
  parseCompoundValue,
  evaluateInputStatus,
  getCookingCompoundMeasure,
  formatCulinaryFraction,
  convertUnits,
  getCategory,
  getSmartEquationDisplay,
  getFormulaDetails,
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

describe('isCompoundLike and parseCompoundValue', () => {
  test('correctly identifies compound-like input strings', () => {
    expect(isCompoundLike("5'10\"")).toBe(true);
    expect(isCompoundLike('5 ft 10 in')).toBe(true);
    expect(isCompoundLike('2 lbs 4 oz')).toBe(true);
    expect(isCompoundLike('1 hr 30 min')).toBe(true);
    expect(isCompoundLike('1 gal 2 qt')).toBe(true);
    expect(isCompoundLike('1 cup 2 tbsp')).toBe(true);
    expect(isCompoundLike('100')).toBe(false);
    expect(isCompoundLike('2.5')).toBe(false);
    expect(isCompoundLike('')).toBe(false);
    expect(isCompoundLike(null)).toBe(false);
  });

  test('parses compound values accurately to target units', () => {
    // Length: 5 ft 10 in -> 70 in
    expect(parseCompoundValue('5 ft 10 in', 'length', 'in')).toBe(70);
    expect(parseCompoundValue("5'10\"", 'length', 'in')).toBe(70);
    expect(parseCompoundValue("5' 10 1/2\"", 'length', 'in')).toBe(70.5);
    expect(parseCompoundValue('5 ft 10 in', 'length', 'cm')).toBe(177.8);

    // Mass: 2 lbs 4 oz -> 36 oz or 2.25 lb
    expect(parseCompoundValue('2 lbs 4 oz', 'mass', 'oz')).toBe(36);
    expect(parseCompoundValue('2 lbs 4 oz', 'mass', 'lb')).toBe(2.25);
    expect(parseCompoundValue('2 pounds and 4 ounces', 'mass', 'oz')).toBe(36);

    // Time: 1 hr 30 min 15 sec -> 5415 s
    expect(parseCompoundValue('1 hr 30 min', 'time', 'min')).toBe(90);
    expect(parseCompoundValue('1 hr 30 min 15 sec', 'time', 's')).toBe(5415);

    // Volume: 1 gal 2 qt -> 1.5 gal
    expect(parseCompoundValue('1 gal 2 qt', 'volume', 'gal_us')).toBe(1.5);

    // Cooking: 1 cup 2 tbsp -> 18 tbsp
    expect(parseCompoundValue('1 cup 2 tbsp', 'cooking', 'tbsp_us')).toBe(18);

    // Invalid / Cross-category
    expect(parseCompoundValue('5 ft 10 sec', 'length', 'in')).toBeNull();
    expect(parseCompoundValue('not a value', 'length', 'in')).toBeNull();
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
  const cuydUnit = UNIT_DEFINITIONS.volume.units.find((u) => u.id === 'cuyd');
  const cuftUnit = UNIT_DEFINITIONS.volume.units.find((u) => u.id === 'cuft');

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

  test('converts cubic yards to cubic feet and cubic meters accurately', () => {
    // 1 cubic yard = 27 cubic feet exactly
    expect(convertUnits(1, 'volume', 'cuyd', 'cuft')).toBe(27);
    expect(convertUnits(27, 'volume', 'cuft', 'cuyd')).toBe(1);
    expect(convertUnits(2, 'volume', 'cuyd', 'cuft')).toBe(54);

    // 1 cubic yard to liters and cubic meters
    expect(convertUnits(1, 'volume', 'cuyd', 'l')).toBe(764.554857984);
    expect(convertUnits(1, 'volume', 'cuyd', 'cum')).toBeCloseTo(0.764555, 6);
  });

  test('formats cubic feet in cubic yards as exact fraction 1/27 yd³', () => {
    const targetVal = convertUnits(1, 'volume', 'cuft', 'cuyd');
    const defaultFmt = formatNumber(targetVal, 'auto', 'volume');
    const result = getSmartEquationDisplay('volume', cuftUnit, cuydUnit, 1, targetVal, defaultFmt);

    expect(result.value).toBe('1/27');
    expect(result.unit).toBe('yd³');
    expect(result.isSmart).toBe(true);
    expect(result.isExact).toBe(true);
  });
});

describe('Compound Measurement Robustness & Unspaced Parsing Stress Tests', () => {
  test('detects all forms of compound measurements via isCompoundLike', () => {
    // Unspaced / compact
    expect(isCompoundLike('4ft5in')).toBe(true);
    expect(isCompoundLike('5ft10in')).toBe(true);
    expect(isCompoundLike('2lbs4oz')).toBe(true);
    expect(isCompoundLike('1hr30min')).toBe(true);
    expect(isCompoundLike('1h30m')).toBe(true);
    expect(isCompoundLike('1gal2qt')).toBe(true);
    expect(isCompoundLike('1cup2tbsp')).toBe(true);
    expect(isCompoundLike('2tbsp1tsp')).toBe(true);
    // Spaced
    expect(isCompoundLike('4 ft 5 in')).toBe(true);
    expect(isCompoundLike('5 ft 10 in')).toBe(true);
    expect(isCompoundLike('2 lbs 4 oz')).toBe(true);
    expect(isCompoundLike('1 hr 30 min')).toBe(true);
    expect(isCompoundLike('1 gal 2 qt')).toBe(true);
    // Quotes
    expect(isCompoundLike('5\'10"')).toBe(true);
    expect(isCompoundLike('5\'10')).toBe(true);
    expect(isCompoundLike('5\' 10"')).toBe(true);
    expect(isCompoundLike('5\' 10 1/2"')).toBe(true);
    // Single units with keywords
    expect(isCompoundLike('4ft')).toBe(true);
    expect(isCompoundLike('50in')).toBe(true);
    expect(isCompoundLike('2lb')).toBe(true);
    // Non-compounds
    expect(isCompoundLike('10')).toBe(false);
    expect(isCompoundLike('3.14')).toBe(false);
    expect(isCompoundLike('-5')).toBe(false);
    expect(isCompoundLike('1/8')).toBe(false);
    expect(isCompoundLike('')).toBe(false);
    expect(isCompoundLike(null)).toBe(false);
  });

  test('parses unspaced and compact compounds with exact precision in parseCompoundValue', () => {
    // Length: 4ft5in -> inches = 53
    expect(parseCompoundValue('4ft5in', 'length', 'in')).toBe(53);
    // Length: 4ft5in -> cm = 134.62
    expect(parseCompoundValue('4ft5in', 'length', 'cm')).toBe(134.62);
    // Length: 4ft5in -> ft = 4.4166666667
    expect(parseCompoundValue('4ft5in', 'length', 'ft')).toBeCloseTo(4.4166667, 5);
    // Length: 5ft10in -> cm = 177.8
    expect(parseCompoundValue('5ft10in', 'length', 'cm')).toBe(177.8);
    // Length: 5'10" -> cm = 177.8
    expect(parseCompoundValue('5\'10"', 'length', 'cm')).toBe(177.8);
    // Length: 5' 10 1/2" -> in = 70.5
    expect(parseCompoundValue('5\' 10 1/2"', 'length', 'in')).toBe(70.5);

    // Weight/Mass: 2lbs4oz -> oz = 36
    expect(parseCompoundValue('2lbs4oz', 'mass', 'oz')).toBe(36);
    // Weight/Mass: 2lbs4oz -> g = ~1020.58
    expect(parseCompoundValue('2lbs4oz', 'mass', 'g')).toBeCloseTo(1020.5828, 2);

    // Time: 1hr30min -> min = 90
    expect(parseCompoundValue('1hr30min', 'time', 'min')).toBe(90);
    expect(parseCompoundValue('1h30m', 'time', 'min')).toBe(90);
    // Time: 1hr30min -> s = 5400
    expect(parseCompoundValue('1hr30min', 'time', 's')).toBe(5400);

    // Volume: 1gal2qt -> qt = 6
    expect(parseCompoundValue('1gal2qt', 'volume', 'qt_us')).toBe(6);
    // Cooking: 1cup2tbsp -> tbsp = 18
    expect(parseCompoundValue('1cup2tbsp', 'cooking', 'tbsp_us')).toBe(18);
    // Cooking: 2tbsp1tsp -> tsp = 7
    expect(parseCompoundValue('2tbsp1tsp', 'cooking', 'tsp_us')).toBe(7);

    // Single unit in compound parser: 4ft -> in = 48
    expect(parseCompoundValue('4ft', 'length', 'in')).toBe(48);
    // Single unit: 50cm -> in = ~19.685
    expect(parseCompoundValue('50cm', 'length', 'in')).toBeCloseTo(19.685, 3);
  });

  test('formats compound measurements cleanly for display without unit collisions', () => {
    expect(formatCompoundForDisplay('4ft5in')).toBe('4 ft 5 in');
    expect(formatCompoundForDisplay('5ft10in')).toBe('5 ft 10 in');
    expect(formatCompoundForDisplay('2lbs4oz')).toBe('2 lbs 4 oz');
    expect(formatCompoundForDisplay('1hr30m')).toBe('1 hr 30 m');
    expect(formatCompoundForDisplay('5\'10"')).toBe('5 ft 10 in');
    expect(formatCompoundForDisplay('5\' 10"')).toBe('5 ft 10 in');
    expect(formatCompoundForDisplay('1gal2qt')).toBe('1 gal 2 qt');
  });
});

describe('evaluateInputStatus Comprehensive Stress Tests', () => {
  test('correctly identifies valid standard numbers', () => {
    expect(evaluateInputStatus('10', 'length', 'm')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 10 });
    expect(evaluateInputStatus('3.14159', 'length', 'm')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 3.14159 });
    expect(evaluateInputStatus('-5', 'temperature', 'c')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: -5 });
    expect(evaluateInputStatus('1e6', 'digital', 'mb')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 1000000 });
    expect(evaluateInputStatus('0', 'length', 'm')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 0 });
    expect(evaluateInputStatus('', 'length', 'm')).toEqual({ isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 0 });
  });

  test('correctly identifies valid fraction expressions', () => {
    expect(evaluateInputStatus('1/8', 'length', 'in').isValid).toBe(true);
    expect(evaluateInputStatus('1 3/8', 'length', 'in').isValid).toBe(true);
    expect(evaluateInputStatus('3 3/8 +1/32', 'length', 'in').isValid).toBe(true);
    expect(evaluateInputStatus('11/8', 'length', 'in').isValid).toBe(true);
    expect(evaluateInputStatus('½', 'cooking', 'cup_us').isValid).toBe(true);
    expect(evaluateInputStatus('¾', 'volume', 'cup_us').isValid).toBe(true);
  });

  test('correctly identifies valid compound expressions (spaced and unspaced)', () => {
    expect(evaluateInputStatus('4ft5in', 'length', 'ft')).toEqual(expect.objectContaining({ isValid: true, isInvalid: false, isCompound: true }));
    expect(evaluateInputStatus('5 ft 10 in', 'length', 'ft')).toEqual(expect.objectContaining({ isValid: true, isInvalid: false, isCompound: true }));
    expect(evaluateInputStatus('5\'10"', 'length', 'ft')).toEqual(expect.objectContaining({ isValid: true, isInvalid: false, isCompound: true }));
    expect(evaluateInputStatus('2lbs4oz', 'mass', 'lb')).toEqual(expect.objectContaining({ isValid: true, isInvalid: false, isCompound: true }));
    expect(evaluateInputStatus('1hr30min', 'time', 'h')).toEqual(expect.objectContaining({ isValid: true, isInvalid: false, isCompound: true }));
  });

  test('identifies incomplete / pending typing without triggering invalid error state', () => {
    // Lone operators or decimals
    expect(evaluateInputStatus('-', 'temperature', 'c')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    expect(evaluateInputStatus('+', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    expect(evaluateInputStatus('.', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    // Trailing slash while typing fraction
    expect(evaluateInputStatus('1/', 'length', 'in')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    expect(evaluateInputStatus('5 /', 'length', 'in')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    expect(evaluateInputStatus('3 1/', 'length', 'in')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
    expect(evaluateInputStatus('3 3/8 +', 'length', 'in')).toEqual(expect.objectContaining({ isValid: false, isPending: true, isInvalid: false }));
  });

  test('identifies truly invalid expressions and marks them as isInvalid', () => {
    // Gibberish words
    expect(evaluateInputStatus('abc', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    expect(evaluateInputStatus('hello', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    // Malformed decimals
    expect(evaluateInputStatus('12..4', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    expect(evaluateInputStatus('1.2.3', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    // Division by zero
    expect(evaluateInputStatus('1/0', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    // Malformed compound
    expect(evaluateInputStatus('4ft?', 'length', 'ft')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
    expect(evaluateInputStatus('5$$$', 'length', 'm')).toEqual(expect.objectContaining({ isValid: false, isPending: false, isInvalid: true }));
  });
});

describe('Two-Tier Unit Architecture & Progressive Disclosure Helpers', () => {
  test('correctly identifies specialized units with isSpecializedUnit', () => {
    expect(isSpecializedUnit({ id: 'kg', tier: 'common' })).toBe(false);
    expect(isSpecializedUnit({ id: 'ct', tier: 'specialized' })).toBe(true);
    expect(isSpecializedUnit({ id: 'm' })).toBe(false);
    expect(isSpecializedUnit(null)).toBe(false);
  });

  test('partitions category units into common and specialized lists', () => {
    const allMass = getUnitsForCategory('mass');
    const commonMass = getCommonUnitsForCategory('mass');
    const specMass = getSpecializedUnitsForCategory('mass');

    expect(commonMass.length).toBeGreaterThan(0);
    expect(specMass.length).toBeGreaterThan(0);
    expect(commonMass.length + specMass.length).toBe(allMass.length);

    expect(commonMass.some((u) => u.id === 'kg')).toBe(true);
    expect(commonMass.some((u) => u.id === 'lb')).toBe(true);
    expect(specMass.some((u) => u.id === 'ct')).toBe(true);
    expect(specMass.some((u) => u.id === 'gr')).toBe(true);
  });

  test('filterAndSortUnits matches against unit subtitle and badge keywords', () => {
    const massUnits = getUnitsForCategory('mass');
    // Search for "diamonds" which is in Carat's subtitle
    const diamondMatches = filterAndSortUnits(massUnits, 'diamonds');
    expect(diamondMatches.length).toBeGreaterThan(0);
    expect(diamondMatches[0].id).toBe('ct');

    // Search for "jewelry" which is in Carat's badge
    const jewelryMatches = filterAndSortUnits(massUnits, 'jewelry');
    expect(jewelryMatches.length).toBeGreaterThan(0);
    expect(jewelryMatches[0].id).toBe('ct');
  });
});

describe('Phase 2 Unit Precision & Conversions', () => {
  test('Weight & Mass: Troy ounce, Pennyweight, Dalton, Slug, Metric Quintal', () => {
    // 1 Troy Ounce = 31.1034768 g
    const ozTInG = convertUnits(1, 'mass', 'oz_t', 'g');
    expect(ozTInG).toBeCloseTo(31.1034768, 5);

    // 1 Pennyweight = 1.55517384 g
    const dwtInG = convertUnits(1, 'mass', 'dwt', 'g');
    expect(dwtInG).toBeCloseTo(1.55517384, 5);

    // 1 Dalton = 1.660539e-27 kg
    const daInKg = convertUnits(1, 'mass', 'da', 'kg');
    expect(daInKg).toBeCloseTo(1.6605390666e-27, 30);

    // 1 Slug = 14.5939 kg
    const slugInKg = convertUnits(1, 'mass', 'slug', 'kg');
    expect(slugInKg).toBeCloseTo(14.5939029, 4);

    // 1 Quintal = 100 kg
    const qInKg = convertUnits(1, 'mass', 'q', 'kg');
    expect(qInKg).toBe(100);
  });

  test('Volume & Capacity: Centiliter, Deciliter, Imperial Pint/Quart, Oil Barrel, Microliter, Bushel', () => {
    // 1 cL = 10 mL
    expect(convertUnits(1, 'volume', 'cl', 'ml')).toBe(10);
    // 1 dL = 100 mL
    expect(convertUnits(1, 'volume', 'dl', 'ml')).toBe(100);
    // 1 Imperial Pint = 0.56826125 L
    expect(convertUnits(1, 'volume', 'pt_uk', 'l')).toBeCloseTo(0.56826125, 6);
    // 1 Imperial Quart = 1.1365225 L
    expect(convertUnits(1, 'volume', 'qt_uk', 'l')).toBeCloseTo(1.1365225, 6);
    // 1 Oil Barrel = 42 US Gallons
    expect(convertUnits(1, 'volume', 'bbl_oil', 'gal_us')).toBeCloseTo(42, 4);
    // 1 Microliter = 0.001 mL
    expect(convertUnits(1, 'volume', 'ul', 'ml')).toBeCloseTo(0.001, 6);
    // 1 US Bushel = ~35.239 L
    expect(convertUnits(1, 'volume', 'bu', 'l')).toBeCloseTo(35.23907, 3);
  });

  test('Kitchen Mode: Metric Cup, Metric Tbsp, Dessertspoon, Shot, Smidgen, Tad', () => {
    // Metric Cup = 250 mL
    expect(convertUnits(1, 'cooking', 'cup_metric', 'ml')).toBe(250);
    // Metric Tablespoon = 15 mL
    expect(convertUnits(1, 'cooking', 'tbsp_metric', 'ml')).toBe(15);
    // Dessertspoon = 10 mL
    expect(convertUnits(1, 'cooking', 'dsp', 'ml')).toBe(10);
    // Shot = 1.5 US fl oz
    expect(convertUnits(1, 'cooking', 'shot', 'floz_us')).toBeCloseTo(1.5, 4);
    // Smidgen = 1/32 tsp
    expect(convertUnits(1, 'cooking', 'smidgen', 'tsp_us')).toBeCloseTo(1 / 32, 4);
    // Tad = 1/4 tsp
    expect(convertUnits(1, 'cooking', 'tad', 'tsp_us')).toBeCloseTo(0.25, 4);
  });

  test('Length & Distance: AU, Parsec, Ångström, Mil, Fathom, Hand', () => {
    // 1 AU = 149,597,870.7 km
    expect(convertUnits(1, 'length', 'au', 'km')).toBeCloseTo(149597870.7, 1);
    // 1 Parsec = ~3.26156 Light-Years
    expect(convertUnits(1, 'length', 'pc', 'ly')).toBeCloseTo(3.26156, 3);
    // 1 Ångström = 0.1 nm
    expect(convertUnits(1, 'length', 'angstrom', 'nm')).toBeCloseTo(0.1, 6);
    // 1 Mil = 0.001 in
    expect(convertUnits(1, 'length', 'mil', 'in')).toBeCloseTo(0.001, 6);
    // 1 Fathom = 6 ft
    expect(convertUnits(1, 'length', 'fathom', 'ft')).toBeCloseTo(6, 4);
    // 1 Hand = 4 in
    expect(convertUnits(1, 'length', 'hand', 'in')).toBeCloseTo(4, 4);
  });

  test('Digital & Data Rate: Nibble, PiB, EB, EiB, Tbps, TB/s, MiB/s', () => {
    // 1 Nibble = 4 bits
    expect(convertUnits(1, 'digital', 'nibble', 'b')).toBe(4);
    // 1 PiB = 1024 TiB
    expect(convertUnits(1, 'digital', 'pib', 'tib')).toBe(1024);
    // 1 EB = 1000 PB
    expect(convertUnits(1, 'digital', 'eb', 'pb')).toBe(1000);
    // 1 EiB = 1024 PiB
    expect(convertUnits(1, 'digital', 'eib', 'pib')).toBe(1024);
    // 1 Tbps = 1000 Gbps
    expect(convertUnits(1, 'data_rate', 'tbps', 'gbps')).toBe(1000);
    // 1 TB/s = 8 Tbps
    expect(convertUnits(1, 'data_rate', 'tbs', 'tbps')).toBe(8);
    // 1 MiB/s = 1024 KiB/s
    expect(convertUnits(1, 'data_rate', 'mibs', 'byps')).toBe(1048576);
  });

  test('Pressure, Energy, Power: inH2O, cmH2O, ksi, Therm, MWh, Ton of Ref, mW', () => {
    // 1 inH2O = ~249.0889 Pa
    expect(convertUnits(1, 'pressure', 'inh2o', 'pa')).toBeCloseTo(249.0889, 2);
    // 1 cmH2O = 98.0665 Pa
    expect(convertUnits(1, 'pressure', 'cmh2o', 'pa')).toBeCloseTo(98.0665, 4);
    // 1 ksi = 1000 psi
    expect(convertUnits(1, 'pressure', 'ksi', 'psi')).toBeCloseTo(1000, 4);
    // 1 Therm = 100,000 BTU
    expect(convertUnits(1, 'energy', 'therm', 'btu')).toBeCloseTo(100000, 0);
    // 1 MWh = 1000 kWh
    expect(convertUnits(1, 'energy', 'mwh', 'kwh')).toBe(1000);
    // 1 Ton of Refrigeration = 12,000 BTU/h
    expect(convertUnits(1, 'power', 'ton_ref', 'btu_h')).toBeCloseTo(12000, 0);
    // 1 mW = 0.001 W
    expect(convertUnits(1, 'power', 'mw_milli', 'w')).toBe(0.001);
  });

  test('Fuel Economy: mi/kWh and kWh/100km EV conversion reciprocity', () => {
    // 3 mi/kWh -> ~20.712 kWh/100 km
    const kwhPer100 = convertUnits(3, 'fuel', 'mi_kwh', 'kwh_100km');
    expect(kwhPer100).toBeCloseTo(20.71237, 3);

    // 20.71237 kWh/100km -> 3 mi/kWh
    const miPerKwh = convertUnits(kwhPer100, 'fuel', 'kwh_100km', 'mi_kwh');
    expect(miPerKwh).toBeCloseTo(3, 4);
  });

  describe('Phase 3: Core SI Categories (Frequency & Torque)', () => {
    test('Frequency conversions (Hz, kHz, MHz, GHz, THz, RPM, rad/s, deg/s)', () => {
      // 1 Hz = 60 RPM
      expect(convertUnits(1, 'frequency', 'hz', 'rpm')).toBe(60);
      // 600 RPM = 10 Hz
      expect(convertUnits(600, 'frequency', 'rpm', 'hz')).toBe(10);
      // 3.5 GHz = 3500 MHz
      expect(convertUnits(3.5, 'frequency', 'ghz', 'mhz')).toBe(3500);
      // 1 MHz = 1000 kHz
      expect(convertUnits(1, 'frequency', 'mhz', 'khz')).toBe(1000);
      // 2.4 THz = 2400 GHz
      expect(convertUnits(2.4, 'frequency', 'thz', 'ghz')).toBe(2400);
      // 2π rad/s = 1 Hz
      expect(convertUnits(2 * Math.PI, 'frequency', 'rad_s', 'hz')).toBeCloseTo(1, 6);
      // 360 deg/s = 1 Hz
      expect(convertUnits(360, 'frequency', 'deg_s', 'hz')).toBeCloseTo(1, 6);
    });

    test('Torque conversions (N·m, lb-ft, lb-in, kgf·m, kN·m, oz-in)', () => {
      // 100 N·m = ~73.7562 lb-ft
      expect(convertUnits(100, 'torque', 'nm', 'ftlb')).toBeCloseTo(73.7562, 3);
      // 100 lb-ft = ~135.5818 N·m
      expect(convertUnits(100, 'torque', 'ftlb', 'nm')).toBeCloseTo(135.5818, 3);
      // 1 lb-ft = 12 lb-in
      expect(convertUnits(1, 'torque', 'ftlb', 'inlb')).toBeCloseTo(12, 6);
      // 12 lb-in = 1 lb-ft
      expect(convertUnits(12, 'torque', 'inlb', 'ftlb')).toBeCloseTo(1, 6);
      // 1 kgf·m = 9.80665 N·m
      expect(convertUnits(1, 'torque', 'kgfm', 'nm')).toBeCloseTo(9.80665, 4);
      // 1 kN·m = 1000 N·m
      expect(convertUnits(1, 'torque', 'knm', 'nm')).toBe(1000);
      // 1 lb-in = 16 oz-in
      expect(convertUnits(1, 'torque', 'inlb', 'ozin')).toBeCloseTo(16, 5);
    });

    test('Formula generation for frequency and torque', () => {
      const freqFormula = getFormulaDetails('frequency', 'rpm', 'hz');
      expect(freqFormula.equation).toBe('Hz = RPM / 60');
      expect(freqFormula.instruction).toContain('Divide the revolutions per minute value by 60');

      const torqueFormula = getFormulaDetails('torque', 'ftlb', 'inlb');
      expect(torqueFormula.equation).toContain('lb-in = lb-ft × 12');
    });
  });

  describe('Phase 4: Trade & Developer Categories (Force, Flow Rate, Typography)', () => {
    test('Force conversions (N, kN, MN, lbf, kgf, dyn, kip, ozf)', () => {
      // 1 lbf = 4.448222 N
      expect(convertUnits(1, 'force', 'lbf', 'n')).toBeCloseTo(4.448222, 5);
      // 100 N = ~22.4809 lbf
      expect(convertUnits(100, 'force', 'n', 'lbf')).toBeCloseTo(22.48089, 4);
      // 1 kN = 1000 N
      expect(convertUnits(1, 'force', 'kn', 'n')).toBe(1000);
      // 1 MN = 1000 kN
      expect(convertUnits(1, 'force', 'mn', 'kn')).toBe(1000);
      // 1 kgf = 9.80665 N
      expect(convertUnits(1, 'force', 'kgf', 'n')).toBeCloseTo(9.80665, 5);
      // 1 N = 100,000 dyn
      expect(convertUnits(1, 'force', 'n', 'dyn')).toBeCloseTo(100000, 5);
      // 1 kip = 1000 lbf
      expect(convertUnits(1, 'force', 'kip', 'lbf')).toBeCloseTo(1000, 4);
      // 1 lbf = 16 ozf
      expect(convertUnits(1, 'force', 'lbf', 'ozf')).toBeCloseTo(16, 5);
    });

    test('Volumetric Flow Rate conversions (CFM, L/s, L/min, m³/h, m³/s, GPM, GPH)', () => {
      // 100 CFM = ~47.1947 L/s
      expect(convertUnits(100, 'flow_rate', 'cfm', 'l_s')).toBeCloseTo(47.19474, 3);
      // 100 L/s = ~211.888 CFM
      expect(convertUnits(100, 'flow_rate', 'l_s', 'cfm')).toBeCloseTo(211.888, 2);
      // 1 L/s = 60 L/min
      expect(convertUnits(1, 'flow_rate', 'l_s', 'l_min')).toBeCloseTo(60, 4);
      // 1 m³/s = 3600 m³/h
      expect(convertUnits(1, 'flow_rate', 'm3_s', 'm3_h')).toBe(3600);
      // 1 US GPM = ~3.78541 L/min
      expect(convertUnits(1, 'flow_rate', 'gpm_us', 'l_min')).toBeCloseTo(3.78541, 4);
      // 1 US GPM = 60 GPH
      expect(convertUnits(1, 'flow_rate', 'gpm_us', 'gph_us')).toBeCloseTo(60, 4);
    });

    test('Typography & Digital Design conversions (px, pt, rem, em, pc, in_css, mm_css)', () => {
      // 16 px = 1 rem
      expect(convertUnits(16, 'typography', 'px', 'rem')).toBe(1);
      // 1.5 rem = 24 px
      expect(convertUnits(1.5, 'typography', 'rem', 'px')).toBe(24);
      // 12 pt = 16 px
      expect(convertUnits(12, 'typography', 'pt', 'px')).toBe(16);
      // 16 px = 12 pt
      expect(convertUnits(16, 'typography', 'px', 'pt')).toBe(12);
      // 1 pc = 16 px
      expect(convertUnits(1, 'typography', 'pc', 'px')).toBe(16);
      // 1 pc = 12 pt
      expect(convertUnits(1, 'typography', 'pc', 'pt')).toBe(12);
      // 1 CSS in = 96 px
      expect(convertUnits(1, 'typography', 'in_css', 'px')).toBe(96);
      // 1 CSS in = 25.4 CSS mm
      expect(convertUnits(1, 'typography', 'in_css', 'mm_css')).toBeCloseTo(25.4, 4);
      // 1 rem = 1 em (both 16px baseline)
      expect(convertUnits(1, 'typography', 'rem', 'em')).toBe(1);
    });

    test('Formula generation for force, flow rate, and typography', () => {
      const forceFormula = getFormulaDetails('force', 'kn', 'n');
      expect(forceFormula.equation).toBe('N = kN × 1000');

      const flowFormula = getFormulaDetails('flow_rate', 'm3_s', 'm3_h');
      expect(flowFormula.equation).toBe('m³/h = m³/s × 3600');

      const typoFormula = getFormulaDetails('typography', 'px', 'rem');
      expect(typoFormula.equation).toBe('rem = px / 16');
    });
  });

  describe('Phase 5: Scientific & Electrical Domain Expansion (Electric Current & Illuminance)', () => {
    test('Electric Current & Battery Charge conversions (A, mA, µA, kA, Ah, mAh, abA, statA)', () => {
      // 1 A = 1,000 mA
      expect(convertUnits(1, 'current', 'a', 'ma')).toBe(1000);
      // 500 mA = 0.5 A
      expect(convertUnits(500, 'current', 'ma', 'a')).toBe(0.5);
      // 1 mA = 1,000 µA
      expect(convertUnits(1, 'current', 'ma', 'ua')).toBeCloseTo(1000, 5);
      // 1 kA = 1,000 A
      expect(convertUnits(1, 'current', 'ka', 'a')).toBe(1000);
      // 5,000 mAh = 5 Ah
      expect(convertUnits(5000, 'current', 'mah', 'ah')).toBe(5);
      // 20 Ah = 20,000 mAh
      expect(convertUnits(20, 'current', 'ah', 'mah')).toBe(20000);
      // 1 abA = 10 A
      expect(convertUnits(1, 'current', 'ab_a', 'a')).toBe(10);
      // 1 A = 0.1 abA
      expect(convertUnits(1, 'current', 'a', 'ab_a')).toBe(0.1);
      // statA conversion
      expect(convertUnits(1, 'current', 'ab_a', 'stat_a')).toBeCloseTo(29979245800, -2);
    });

    test('Illuminance conversions (lx, fc, ph, nox, klx)', () => {
      // 1 fc ≈ 10.76391 lx
      expect(convertUnits(1, 'illuminance', 'fc', 'lx')).toBeCloseTo(10.76391, 4);
      // 10.76391 lx ≈ 1 fc
      expect(convertUnits(10.76391, 'illuminance', 'lx', 'fc')).toBeCloseTo(1, 4);
      // 1 phot = 10,000 lx
      expect(convertUnits(1, 'illuminance', 'ph', 'lx')).toBe(10000);
      // 1 nox = 0.001 lx (1 millilux)
      expect(convertUnits(1, 'illuminance', 'nox', 'lx')).toBe(0.001);
      // 1 klx = 1,000 lx
      expect(convertUnits(1, 'illuminance', 'klx', 'lx')).toBe(1000);
      // 100 klx = 100,000 lx (direct sunlight)
      expect(convertUnits(100, 'illuminance', 'klx', 'lx')).toBe(100000);
    });

    test('Formula generation for electric current and illuminance', () => {
      const currentFormula = getFormulaDetails('current', 'a', 'ma');
      expect(currentFormula.equation).toBe('mA = A × 1000');

      const illuminanceFormula = getFormulaDetails('illuminance', 'klx', 'lx');
      expect(illuminanceFormula.equation).toBe('lx = klx × 1000');
    });
  });

  describe('Kitchen Studio Native Conversion Engine', () => {
    test('getCategory retrieves both engineering domains and kitchen staples', () => {
      expect(getCategory('length')?.name).toBe('Length & Distance');
      expect(getCategory('flour_ap')?.name).toBe('All-Purpose Flour');
      expect(getCategory('butter')?.name).toBe('Butter');
      expect(getCategory('sugar_granulated')?.name).toBe('Granulated Sugar');
      expect(getCategory('unknown_xyz')).toBeNull();
    });

    test('getUnitsForCategory returns units for kitchen ingredients', () => {
      const flourUnits = getUnitsForCategory('flour_ap');
      expect(flourUnits.length).toBeGreaterThanOrEqual(10);
      expect(flourUnits.some((u) => u.id === 'cup_us')).toBe(true);
      expect(flourUnits.some((u) => u.id === 'g')).toBe(true);
      expect(flourUnits.some((u) => u.id === 'oz')).toBe(true);
    });

    test('convertUnits natively converts volume to weight with exact density factors', () => {
      // 1 US Cup All-Purpose Flour = 120 grams
      expect(convertUnits(1, 'flour_ap', 'cup_us', 'g')).toBe(120);
      // 240 grams flour = 2 cups
      expect(convertUnits(240, 'flour_ap', 'g', 'cup_us')).toBe(2);
      // 1 cup sugar = 200 grams
      expect(convertUnits(1, 'sugar_granulated', 'cup_us', 'g')).toBe(200);
      // 1 stick butter = 113.398 grams = 8 tbsp = 0.5 cups
      expect(convertUnits(1, 'butter', 'stick_butter', 'tbsp_us')).toBeCloseTo(8, 2);
      expect(convertUnits(1, 'butter', 'stick_butter', 'cup_us')).toBeCloseTo(0.5, 2);
    });

    test('getFormulaDetails produces clean formula for kitchen conversions', () => {
      const details = getFormulaDetails('flour_ap', 'cup_us', 'g');
      expect(details.equation).toContain('g =');
    });
  });
});


