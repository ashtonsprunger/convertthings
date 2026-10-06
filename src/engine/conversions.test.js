import { filterAndSortUnits, getUnitsForCategory, formatDisplayNumber } from './conversions';

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
