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

    const route13 = parseRoute('/convert/13-tbsp_us-to-cup_us');
    expect(route13).not.toBeNull();
    expect(route13.categoryId).toBe('cooking');
    expect(route13.fromUnitId).toBe('tbsp_us');
    expect(route13.toUnitId).toBe('cup_us');
    expect(route13.fromValue).toBe('13');

    // Culinary ounces (fl oz) when paired with cups
    const routeOzCup = parseRoute('/convert/8-oz-to-cups');
    expect(routeOzCup).not.toBeNull();
    expect(routeOzCup.categoryId).toBe('cooking');
    expect(routeOzCup.fromUnitId).toBe('floz_us');
    expect(routeOzCup.toUnitId).toBe('cup_us');

    const routeCupOz = parseRoute('/convert/1-cup-to-oz');
    expect(routeCupOz).not.toBeNull();
    expect(routeCupOz.categoryId).toBe('cooking');
    expect(routeCupOz.fromUnitId).toBe('cup_us');
    expect(routeCupOz.toUnitId).toBe('floz_us');

    // Dry ounces when paired with grams (mass domain)
    const routeOzG = parseRoute('/convert/8-oz-to-g');
    expect(routeOzG).not.toBeNull();
    expect(routeOzG.categoryId).toBe('mass');
    expect(routeOzG.fromUnitId).toBe('oz');
    expect(routeOzG.toUnitId).toBe('g');
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
    expect(formatRoutePath('length', 'km', 'mi', '1,000')).toBe('/convert/1000-km-to-mi');
    expect(formatRoutePath('temperature', 'c', 'f', '-40')).toBe('/convert/-40-c-to-f');
  });

  test('tolerates commas in URL paths and query parameters', () => {
    const route = parseRoute('/convert/1,000-km-to-miles');
    expect(route).not.toBeNull();
    expect(route.fromValue).toBe('1000');

    const routeQuery = parseRoute('/', '?cat=length&from=km&to=mi&v=10,000');
    expect(routeQuery).not.toBeNull();
    expect(routeQuery.fromValue).toBe('10000');
  });

  test('parses decimal numbers and handles trailing dots cleanly', () => {
    const route1 = parseRoute('/convert/0.5-km-to-mi');
    expect(route1).not.toBeNull();
    expect(route1.fromValue).toBe('0.5');

    const route2 = parseRoute('/convert/.5-km-to-mi');
    expect(route2).not.toBeNull();
    expect(route2.fromValue).toBe('.5');

    const route3 = parseRoute('/convert/1.-km-to-mi');
    expect(route3).not.toBeNull();
    expect(route3.fromValue).toBe('1');

    const route4 = parseRoute('/convert/-40.5-c-to-f');
    expect(route4).not.toBeNull();
    expect(route4.fromValue).toBe('-40.5');

    const route5 = parseRoute('/convert/1e5-m-to-ft');
    expect(route5).not.toBeNull();
    expect(route5.fromValue).toBe('1e5');
  });

  test('formats route paths with normalized decimal points', () => {
    expect(formatRoutePath('length', 'km', 'mi', '2.')).toBe('/convert/2-km-to-mi');
    expect(formatRoutePath('length', 'km', 'mi', '1.')).toBe('/convert/km-to-mi');
    expect(formatRoutePath('length', 'km', 'mi', '0.5')).toBe('/convert/0.5-km-to-mi');
  });

  test('formats route paths with precision query parameter only when non-default', () => {
    // Default auto leaves URL clean
    expect(formatRoutePath('length', 'km', 'mi', '1', 'auto')).toBe('/convert/km-to-mi');
    expect(formatRoutePath('length', 'km', 'mi', '100', 'auto')).toBe('/convert/100-km-to-mi');

    // Non-default precisions append ?p=
    expect(formatRoutePath('length', 'km', 'mi', '100', '4')).toBe('/convert/100-km-to-mi?p=4');
    expect(formatRoutePath('length', 'km', 'mi', '1', 'exact')).toBe('/convert/km-to-mi?p=exact');
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1', 'fraction')).toBe('/convert/cup_us-to-tbsp_us?p=fraction');
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1', 'fraction_improper')).toBe('/convert/cup_us-to-tbsp_us?p=fraction_improper');

    // Invalid precision is ignored
    expect(formatRoutePath('length', 'km', 'mi', '1', 'invalid_prec')).toBe('/convert/km-to-mi');
  });

  test('parses precision query parameters via ?p= and ?prec=', () => {
    const route1 = parseRoute('/convert/km-to-mi', '?p=4');
    expect(route1).not.toBeNull();
    expect(route1.precision).toBe('4');

    const route2 = parseRoute('/convert/100-km-to-miles', '?prec=exact');
    expect(route2).not.toBeNull();
    expect(route2.precision).toBe('exact');

    const route3 = parseRoute('/cooking', '?p=fraction');
    expect(route3).not.toBeNull();
    expect(route3.precision).toBe('fraction');

    const route4 = parseRoute('/', '?cat=mass&from=kg&to=lb&v=250&p=2');
    expect(route4).not.toBeNull();
    expect(route4.precision).toBe('2');

    // Invalid precision is ignored
    const routeInvalid = parseRoute('/convert/km-to-mi', '?p=unknown');
    expect(routeInvalid).not.toBeNull();
    expect(routeInvalid.precision).toBeUndefined();
  });


  test('generates all unit pairs across all 15 categories', () => {
    const pairs = getAllUnitPairs();
    // 15 categories with 4 to 15 units each yields well over 1,000 distinct pairs
    expect(pairs.length).toBeGreaterThan(1000);
    expect(pairs[0]).toHaveProperty('path');
    expect(pairs[0]).toHaveProperty('categoryId');
  });

  test('generates valid XML sitemap containing homepage, categories, and unit pairs', () => {
    const xml = generateSitemapXml('https://www.convertthings.com');
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://www.convertthings.com/</loc>');
    expect(xml).toContain('<loc>https://www.convertthings.com/length</loc>');
    expect(xml).toContain('<loc>https://www.convertthings.com/convert/m-to-ft</loc>');
  });
});
