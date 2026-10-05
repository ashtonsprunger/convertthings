import { parseRoute, formatRoutePath, getAllUnitPairs, generateSitemapXml } from './urlRouter';

describe('ConvertThings URL Router', () => {
  test('parses clean unit pair paths with unit IDs', () => {
    const route = parseRoute('/convert/km-to-mi');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('length');
    expect(route.fromUnitId).toBe('km');
    expect(route.toUnitId).toBe('mi');
    expect(route.fromValue).toBe('1');
  });

  test('parses unit pair paths with full names and aliases', () => {
    const route = parseRoute('/convert/kilometers-to-miles');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('length');
    expect(route.fromUnitId).toBe('km');
    expect(route.toUnitId).toBe('mi');
  });

  test('parses specific calculation paths with numbers', () => {
    const route = parseRoute('/convert/100-km-to-miles');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('length');
    expect(route.fromUnitId).toBe('km');
    expect(route.toUnitId).toBe('mi');
    expect(route.fromValue).toBe('100');
  });

  test('parses negative numbers for temperature calculations', () => {
    const route = parseRoute('/convert/-40-c-to-f');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('temperature');
    expect(route.fromUnitId).toBe('c');
    expect(route.toUnitId).toBe('f');
    expect(route.fromValue).toBe('-40');
  });

  test('parses reciprocal fuel economy paths', () => {
    const route = parseRoute('/convert/mpg-to-l100km');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('fuel');
    expect(route.fromUnitId).toBe('mpg_us');
    expect(route.toUnitId).toBe('l100km');
  });

  test('parses cooking unit paths', () => {
    const route = parseRoute('/convert/stick-to-tbsp');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('cooking');
    expect(route.fromUnitId).toBe('stick_butter');
    expect(route.toUnitId).toBe('tbsp_us');
  });

  test('parses direct category paths', () => {
    const route = parseRoute('/cooking');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('cooking');
    expect(route.fromUnitId).toBe('cup_us');
  });

  test('maintains backward compatibility with legacy query parameters', () => {
    const route = parseRoute('/', '?cat=mass&from=kg&to=lb&v=250');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('mass');
    expect(route.fromUnitId).toBe('kg');
    expect(route.toUnitId).toBe('lb');
    expect(route.fromValue).toBe('250');
  });

  test('returns null gracefully on invalid or unmatched paths', () => {
    expect(parseRoute('/convert/invalid-to-unknown')).toBeNull();
    expect(parseRoute('/non-existent-page')).toBeNull();
  });

  test('formats clean route paths', () => {
    expect(formatRoutePath('length', 'km', 'mi', '1')).toBe('/convert/km-to-mi');
    expect(formatRoutePath('length', 'km', 'mi', 1)).toBe('/convert/km-to-mi');
    expect(formatRoutePath('length', 'km', 'mi', '100')).toBe('/convert/100-km-to-mi');
    expect(formatRoutePath('temperature', 'c', 'f', '-40')).toBe('/convert/-40-c-to-f');
  });

  test('generates all unit pairs across all 15 categories', () => {
    const pairs = getAllUnitPairs();
    // 15 categories with 4 to 15 units each yields well over 1,000 distinct pairs
    expect(pairs.length).toBeGreaterThan(1000);
    expect(pairs[0]).toHaveProperty('path');
    expect(pairs[0]).toHaveProperty('categoryId');
  });

  test('generates valid XML sitemap containing homepage, categories, and unit pairs', () => {
    const xml = generateSitemapXml('https://convertthings.com');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://convertthings.com/</loc>');
    expect(xml).toContain('<loc>https://convertthings.com/length</loc>');
    expect(xml).toContain('<loc>https://convertthings.com/convert/m-to-ft</loc>');
  });
});
