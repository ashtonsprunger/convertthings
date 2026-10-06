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
  });
});
