import { getSeoMetadata } from './seo';

describe('SEO Metadata Engine', () => {
  test('generates grammatically correct, high-CTR title for standard pair without custom value', () => {
    const meta = getSeoMetadata({
      categoryId: 'mass',
      fromUnitId: 'lb',
      toUnitId: 'kg',
      value: '1',
    });

    expect(meta.title).toBe('Convert Pounds to Kilograms (lb to kg) | ConvertThings');
    expect(meta.h1).toBe('Convert Pounds to Kilograms');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/convert/lb-to-kg');
    expect(meta.directAnswer).toBe('1 lb = 0.453592 kg');
    expect(meta.description).toContain('1 lb = 0.453592 kg');
    expect(meta.description).toContain('Convert pounds to kilograms (lb to kg)');
  });

  test('generates singular title when value is explicitly 1 in custom path', () => {
    const meta = getSeoMetadata({
      categoryId: 'mass',
      fromUnitId: 'lb',
      toUnitId: 'kg',
      value: '1.0', // non-default string format
    });

    expect(meta.title).toBe('1.0 Pound to Kilograms (1.0 lb to kg) | ConvertThings');
    expect(meta.h1).toBe('1.0 Pound to Kilograms');
  });

  test('generates correct plural title and calculation for custom value 100', () => {
    const meta = getSeoMetadata({
      categoryId: 'mass',
      fromUnitId: 'lb',
      toUnitId: 'kg',
      value: '100',
    });

    expect(meta.title).toBe('100 Pounds to Kilograms (100 lb to kg) | ConvertThings');
    expect(meta.h1).toBe('100 Pounds to Kilograms');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/convert/100-lb-to-kg');
    expect(meta.description).toContain('100 lb = 45.359237 kg');
  });

  test('generates proper title and description for temperature conversion', () => {
    const meta = getSeoMetadata({
      categoryId: 'temperature',
      fromUnitId: 'c',
      toUnitId: 'f',
      value: '100',
    });

    expect(meta.title).toBe('100 Celsius to Fahrenheit (100 °C to °F) | ConvertThings');
    expect(meta.description).toContain('100 °C = 212 °F');
    expect(meta.formulaEquation).toBe('°F = (°C × 9/5) + 32');
  });

  test('generates category landing page metadata when units are missing', () => {
    const meta = getSeoMetadata({
      categoryId: 'length',
    });

    expect(meta.title).toBe('Length & Distance Converter - Fast, Accurate Unit Conversion | ConvertThings');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/length');
    expect(meta.description).toContain('Free online length & distance converter');
  });

  test('falls back gracefully to homepage metadata for empty/invalid params', () => {
    const meta = getSeoMetadata({});
    expect(meta.title).toBe('ConvertThings - Instant, Accurate Online Unit Converter');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/');
    expect(meta.description).toContain('22 domains');
  });

  test('returns homepage metadata when isRoot is explicitly true', () => {
    const meta = getSeoMetadata({ isRoot: true, categoryId: 'length', fromUnitId: 'm', toUnitId: 'ft' });
    expect(meta.title).toBe('ConvertThings - Instant, Accurate Online Unit Converter');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/');
  });

  test('returns category landing page metadata when isCategoryPage is explicitly true', () => {
    const meta = getSeoMetadata({ categoryId: 'mass', fromUnitId: 'kg', toUnitId: 'lb', isCategoryPage: true });
    expect(meta.title).toBe('Weight & Mass Converter - Fast, Accurate Unit Conversion | ConvertThings');
    expect(meta.canonicalUrl).toBe('https://www.convertthings.com/mass');
    expect(meta.description).toContain('Free online weight & mass converter');
  });

  describe('High-Intent Hub SEO Metadata', () => {
    test('generates specialized metadata for feet-inches-to-cm height hub', () => {
      const meta = getSeoMetadata({ hubId: 'feet-inches-to-cm' });
      expect(meta.title).toContain('Height Converter: Feet & Inches to cm');
      expect(meta.canonicalUrl).toBe('https://www.convertthings.com/convert/feet-inches-to-cm');
      expect(meta.directAnswer).toBe('5 ft 10 in = 177.8 cm');
      expect(meta.formulaEquation).toContain('Height (cm)');
      expect(meta.faqs.length).toBeGreaterThanOrEqual(4);
      expect(meta.faqs[0].q).toContain('5 ft 10 in');
    });

    test('generates specialized metadata for fraction-inches-to-mm tape measure hub', () => {
      const meta = getSeoMetadata({ hubId: 'fraction-inches-to-mm' });
      expect(meta.title).toContain('Tape Measure Fraction to mm Converter');
      expect(meta.canonicalUrl).toBe('https://www.convertthings.com/convert/fraction-inches-to-mm');
      expect(meta.directAnswer).toBe('13/16 in = 20.6375 mm');
      expect(meta.faqs.some((f) => f.q.includes('13/16'))).toBe(true);
    });

    test('generates specialized metadata for baking-fractions cooking hub', () => {
      const meta = getSeoMetadata({ hubId: 'baking-fractions' });
      expect(meta.title).toContain('Baking Measurement Converter');
      expect(meta.canonicalUrl).toBe('https://www.convertthings.com/convert/baking-fractions');
      expect(meta.directAnswer).toContain('1/3 cup = 5 tbsp + 1 tsp');
      expect(meta.faqs.some((f) => f.q.includes('1/3 cup'))).toBe(true);
    });
  });

  describe('Pair-Specific Editorial Content & Indexability', () => {
    test('populates pair-specific FAQs, worked examples, unit details, and reference table for standard pairs', () => {
      const meta = getSeoMetadata({
        categoryId: 'mass',
        fromUnitId: 'lb',
        toUnitId: 'kg',
        value: '1',
      });

      expect(meta.reverseAnswer).toBe('2.204623');
      expect(meta.reversePath).toBe('/convert/kg-to-lb');
      expect(meta.fromUnitDetail).toContain('Pound (lb)');
      expect(meta.toUnitDetail).toContain('Kilogram (kg)');
      expect(meta.workedExamples.length).toBe(3);
      expect(meta.referenceTable.length).toBe(10);
      expect(meta.faqs.length).toBeGreaterThanOrEqual(4);
      expect(meta.faqs[0].q.toLowerCase()).toContain('how many kilograms are in 1 pound');
      expect(meta.isIndexable).toBe(true);
      expect(meta.robots).toBe('index, follow');
    });

    test('marks canonical specialized unit pairs as index, follow and custom number permutations as noindex, follow', () => {
      const canonicalSpecialized = getSeoMetadata({
        categoryId: 'volume',
        fromUnitId: 'cucm',
        toUnitId: 'ml',
        value: '1',
      });
      expect(canonicalSpecialized.isIndexable).toBe(true);
      expect(canonicalSpecialized.robots).toBe('index, follow');

      const customValPermutation = getSeoMetadata({
        categoryId: 'mass',
        fromUnitId: 'lb',
        toUnitId: 'kg',
        value: '100',
      });
      expect(customValPermutation.isIndexable).toBe(false);
      expect(customValPermutation.robots).toBe('noindex, follow');
    });
  });
});
