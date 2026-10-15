import {
  parseRoute,
  formatRoutePath,
  getAllUnitPairs,
  generateSitemapXml,
  HUB_ROUTES,
  getHubRoute,
  CULINARY_PREFERRED_UNITS,
  getDefaultCategoryForPair,
} from './urlRouter';

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

  test('parses dedicated /kitchen studio destination route', () => {
    const route = parseRoute('/kitchen');
    expect(route).not.toBeNull();
    expect(route.categoryId).toBe('flour_ap');
    expect(route.isKitchenStudio).toBe(true);
    expect(route.ingredient).toBe('flour_ap');
    expect(route.fromUnitId).toBe('cup_us');
    expect(route.toUnitId).toBe('g');

    const butterRoute = parseRoute('/kitchen', '?ing=butter');
    expect(butterRoute).not.toBeNull();
    expect(butterRoute.categoryId).toBe('butter');
    expect(butterRoute.isKitchenStudio).toBe(true);
    expect(butterRoute.ingredient).toBe('butter');
    expect(butterRoute.fromUnitId).toBe('stick_butter');
    expect(butterRoute.toUnitId).toBe('g');

    const sugarRoute = parseRoute('/kitchen', '?ing=sugar_granulated&v=2');
    expect(sugarRoute).not.toBeNull();
    expect(sugarRoute.ingredient).toBe('sugar_granulated');
    expect(sugarRoute.fromValue).toBe('2');
  });

  test('formats /kitchen studio route paths correctly', () => {
    expect(formatRoutePath('cooking', 'cup_us', 'g', '1', 'auto', false, null, 'flour_ap', true)).toBe('/kitchen');
    expect(formatRoutePath('cooking', 'stick_butter', 'g', '1', 'auto', false, null, 'butter', true)).toBe('/kitchen?ing=butter');
    expect(formatRoutePath('cooking', 'cup_us', 'g', '2', 'auto', false, null, 'flour_ap', true)).toBe('/kitchen?v=2');
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

  test('formats and parses fractional values cleanly via query parameter ?v=', () => {
    // Formatting fraction creates ?v=
    expect(formatRoutePath('length', 'in', 'mm', '1/8')).toBe('/convert/in-to-mm?v=1%2F8');
    expect(formatRoutePath('cooking', 'cup_us', 'ml', '3/4')).toBe('/convert/cup_us-to-ml?v=3%2F4');

    // Parsing ?v= with fraction restores fromValue
    const route = parseRoute('/convert/in-to-mm', '?v=1/8');
    expect(route).not.toBeNull();
    expect(route.fromValue).toBe('1/8');

    // Also handles encoded %2F
    const routeEncoded = parseRoute('/convert/in-to-mm', '?v=1%2F8');
    expect(routeEncoded).not.toBeNull();
    expect(routeEncoded.fromValue).toBe('1/8');
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

  test('formats route paths with kitchen=1 query parameter when kitchenMode is active in cooking domain', () => {
    // Cooking with kitchenMode = true adds ?kitchen=1
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1', 'auto', true)).toBe('/convert/cup_us-to-tbsp_us?kitchen=1');
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '2', 'auto', true)).toBe('/convert/2-cup_us-to-tbsp_us?kitchen=1');
    // In Kitchen Mode, precision is omitted from the URL since physical drawer measures are used
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '2', 'fraction', true)).toBe('/convert/2-cup_us-to-tbsp_us?kitchen=1');
    // Cooking with kitchenMode = false remains clean
    expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1', 'auto', false)).toBe('/convert/cup_us-to-tbsp_us');
    // Non-cooking domains never append ?kitchen=1 even if passed true
    expect(formatRoutePath('length', 'm', 'ft', '1', 'auto', true)).toBe('/convert/m-to-ft');
  });

  test('parses kitchen mode query parameters via ?kitchen= and ?mode=', () => {
    const route1 = parseRoute('/convert/cup_us-to-tbsp_us', '?kitchen=1');
    expect(route1).not.toBeNull();
    expect(route1.isKitchenMode).toBe(true);

    const route2 = parseRoute('/convert/cup_us-to-tbsp_us', '?kitchen=true');
    expect(route2).not.toBeNull();
    expect(route2.isKitchenMode).toBe(true);

    const route3 = parseRoute('/convert/cup_us-to-tbsp_us', '?mode=kitchen');
    expect(route3).not.toBeNull();
    expect(route3.isKitchenMode).toBe(true);

    const route4 = parseRoute('/convert/cup_us-to-tbsp_us', '?kitchen=0');
    expect(route4).not.toBeNull();
    expect(route4.isKitchenMode).toBe(false);

    const route5 = parseRoute('/convert/cup_us-to-tbsp_us', '?mode=standard');
    expect(route5).not.toBeNull();
    expect(route5.isKitchenMode).toBe(false);

    const routeDefault = parseRoute('/convert/cup_us-to-tbsp_us');
    expect(routeDefault).not.toBeNull();
    expect(routeDefault.isKitchenMode).toBeUndefined();

    const routeCat = parseRoute('/cooking', '?kitchen=1');
    expect(routeCat).not.toBeNull();
    expect(routeCat.isKitchenMode).toBe(true);
  });


  test('generates all unit pairs across all 22 categories', () => {
    const pairs = getAllUnitPairs();
    // 22 categories with 4 to 23 units each yields well over 1,000 distinct pairs
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

  describe('High-Intent Hub Routes', () => {
    test('exposes defined HUB_ROUTES and getHubRoute helper', () => {
      expect(HUB_ROUTES.length).toBe(4);
      expect(getHubRoute('feet-inches-to-cm')).not.toBeNull();
      expect(getHubRoute('/convert/feet-inches-to-cm')).not.toBeNull();
      expect(getHubRoute('fraction-inches-to-mm')).not.toBeNull();
      expect(getHubRoute('baking-fractions')).not.toBeNull();
      expect(getHubRoute('flour-cups-to-grams')).not.toBeNull();
      expect(getHubRoute('nonexistent-hub')).toBeNull();
    });

    test('parses /convert/flour-cups-to-grams (Culinary Density Hub)', () => {
      const route = parseRoute('/convert/flour-cups-to-grams');
      expect(route).not.toBeNull();
      expect(route.isHubPage).toBe(true);
      expect(route.hubId).toBe('flour-cups-to-grams');
      expect(route.categoryId).toBe('cooking');
      expect(route.fromUnitId).toBe('cup_us');
      expect(route.toUnitId).toBe('g');
      expect(route.fromValue).toBe('1');
      expect(route.ingredient).toBe('flour_ap');
    });

    test('parses /convert/feet-inches-to-cm (Height Hub)', () => {
      const route = parseRoute('/convert/feet-inches-to-cm');
      expect(route).not.toBeNull();
      expect(route.isHubPage).toBe(true);
      expect(route.hubId).toBe('feet-inches-to-cm');
      expect(route.categoryId).toBe('length');
      expect(route.fromUnitId).toBe('ft');
      expect(route.toUnitId).toBe('cm');
      expect(route.fromValue).toBe('5 ft 10 in');
    });

    test('parses /convert/feet-inches-to-cm with custom query value', () => {
      const route = parseRoute('/convert/feet-inches-to-cm', '?v=6ft2in');
      expect(route).not.toBeNull();
      expect(route.isHubPage).toBe(true);
      expect(route.hubId).toBe('feet-inches-to-cm');
      expect(route.fromValue).toBe('6ft2in');
    });

    test('parses /convert/fraction-inches-to-mm (Tape Measure Hub)', () => {
      const route = parseRoute('/convert/fraction-inches-to-mm');
      expect(route).not.toBeNull();
      expect(route.isHubPage).toBe(true);
      expect(route.hubId).toBe('fraction-inches-to-mm');
      expect(route.categoryId).toBe('length');
      expect(route.fromUnitId).toBe('in');
      expect(route.toUnitId).toBe('mm');
      expect(route.fromValue).toBe('13/16');
      expect(route.precision).toBe('fraction_tape');
    });

    test('parses /convert/baking-fractions (Cooking Drawer Hub)', () => {
      const route = parseRoute('/convert/baking-fractions');
      expect(route).not.toBeNull();
      expect(route.isHubPage).toBe(true);
      expect(route.hubId).toBe('baking-fractions');
      expect(route.categoryId).toBe('cooking');
      expect(route.fromUnitId).toBe('cup_us');
      expect(route.toUnitId).toBe('tbsp_us');
      expect(route.fromValue).toBe('1/3');
      expect(route.isKitchenMode).toBe(true);
    });

    test('formats hub route path preserving hub slug when matching hub definition', () => {
      expect(
        formatRoutePath('length', 'ft', 'cm', '5 ft 10 in', 'auto', false, 'feet-inches-to-cm')
      ).toBe('/convert/feet-inches-to-cm');

      // With custom value
      expect(
        formatRoutePath('length', 'ft', 'cm', '6 ft 2 in', 'auto', false, 'feet-inches-to-cm')
      ).toBe('/convert/feet-inches-to-cm?v=6%20ft%202%20in');

      // Tape measure hub
      expect(
        formatRoutePath('length', 'in', 'mm', '13/16', 'fraction_tape', false, 'fraction-inches-to-mm')
      ).toBe('/convert/fraction-inches-to-mm');

      // Baking fractions hub
      expect(
        formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1/3', 'auto', true, 'baking-fractions')
      ).toBe('/convert/baking-fractions');
    });

    test('includes hub pages in XML sitemap with 0.9 priority', () => {
      const xml = generateSitemapXml('https://www.convertthings.com');
      expect(xml).toContain('<loc>https://www.convertthings.com/convert/feet-inches-to-cm</loc>');
      expect(xml).toContain('<loc>https://www.convertthings.com/convert/fraction-inches-to-mm</loc>');
      expect(xml).toContain('<loc>https://www.convertthings.com/convert/baking-fractions</loc>');
    });
  });

  describe('Cooking vs Volume Semantic Disambiguation & Dual-Domain Resolution', () => {
    test('routes pure fluid and industrial volume pairs to volume by default', () => {
      // Liters to Gallons
      const routeLGal = parseRoute('/convert/l-to-gal_us');
      expect(routeLGal).not.toBeNull();
      expect(routeLGal.categoryId).toBe('volume');
      expect(routeLGal.fromUnitId).toBe('l');
      expect(routeLGal.toUnitId).toBe('gal_us');

      // Milliliters to Liters
      const routeMlL = parseRoute('/convert/ml-to-l');
      expect(routeMlL).not.toBeNull();
      expect(routeMlL.categoryId).toBe('volume');

      // Gallons to Quarts
      const routeGalQt = parseRoute('/convert/gal_us-to-qt_us');
      expect(routeGalQt).not.toBeNull();
      expect(routeGalQt.categoryId).toBe('volume');

      // Pints to Fluid Ounces
      const routePtFloz = parseRoute('/convert/pt_us-to-floz_us');
      expect(routePtFloz).not.toBeNull();
      expect(routePtFloz.categoryId).toBe('volume');
    });

    test('routes culinary measuring tool pairs to cooking by default', () => {
      // Cups to Tablespoons
      const routeCupTbsp = parseRoute('/convert/cup_us-to-tbsp_us');
      expect(routeCupTbsp).not.toBeNull();
      expect(routeCupTbsp.categoryId).toBe('cooking');
      expect(routeCupTbsp.fromUnitId).toBe('cup_us');
      expect(routeCupTbsp.toUnitId).toBe('tbsp_us');

      // Cups to Milliliters (culinary cup paired with liquid mL)
      const routeCupMl = parseRoute('/convert/cup_us-to-ml');
      expect(routeCupMl).not.toBeNull();
      expect(routeCupMl.categoryId).toBe('cooking');

      // Tablespoons to Teaspoons
      const routeTbspTsp = parseRoute('/convert/tbsp_us-to-tsp_us');
      expect(routeTbspTsp).not.toBeNull();
      expect(routeTbspTsp.categoryId).toBe('cooking');

      // Teaspoons to Milliliters
      const routeTspMl = parseRoute('/convert/tsp_us-to-ml');
      expect(routeTspMl).not.toBeNull();
      expect(routeTspMl.categoryId).toBe('cooking');

      // Gallons to Cups
      const routeGalCup = parseRoute('/convert/gal_us-to-cup_us');
      expect(routeGalCup).not.toBeNull();
      expect(routeGalCup.categoryId).toBe('cooking');
    });

    test('honors explicit ?cat= query parameter overrides for cross-category selection', () => {
      // Pure fluid measures explicitly selected in cooking
      const routeCookingFluid = parseRoute('/convert/l-to-gal_us', '?cat=cooking');
      expect(routeCookingFluid).not.toBeNull();
      expect(routeCookingFluid.categoryId).toBe('cooking');
      expect(routeCookingFluid.fromUnitId).toBe('l');
      expect(routeCookingFluid.toUnitId).toBe('gal_us');

      // Culinary tool explicitly selected in volume
      const routeVolumeCulinary = parseRoute('/convert/cup_us-to-tbsp_us', '?cat=volume');
      expect(routeVolumeCulinary).not.toBeNull();
      expect(routeVolumeCulinary.categoryId).toBe('volume');
      expect(routeVolumeCulinary.fromUnitId).toBe('cup_us');
      expect(routeVolumeCulinary.toUnitId).toBe('tbsp_us');
    });

    test('honors ?kitchen=1 query parameter to direct fluid measures to cooking domain', () => {
      const routeKitchenFluid = parseRoute('/convert/l-to-gal_us', '?kitchen=1');
      expect(routeKitchenFluid).not.toBeNull();
      expect(routeKitchenFluid.categoryId).toBe('cooking');
      expect(routeKitchenFluid.isKitchenMode).toBe(true);

      const routeKitchenMode = parseRoute('/convert/ml-to-l', '?mode=kitchen');
      expect(routeKitchenMode).not.toBeNull();
      expect(routeKitchenMode.categoryId).toBe('cooking');
      expect(routeKitchenMode.isKitchenMode).toBe(true);
    });

    test('formats clean URLs for natural domain pairs without unnecessary query parameters', () => {
      // Natural volume stays 100% clean
      expect(formatRoutePath('volume', 'l', 'gal_us')).toBe('/convert/l-to-gal_us');
      expect(formatRoutePath('volume', 'ml', 'l')).toBe('/convert/ml-to-l');
      expect(formatRoutePath('volume', 'gal_us', 'qt_us', '5')).toBe('/convert/5-gal_us-to-qt_us');

      // Natural cooking in standard mode stays 100% clean
      expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us')).toBe('/convert/cup_us-to-tbsp_us');
      expect(formatRoutePath('cooking', 'cup_us', 'ml')).toBe('/convert/cup_us-to-ml');
      expect(formatRoutePath('cooking', 'tbsp_us', 'tsp_us', '2')).toBe('/convert/2-tbsp_us-to-tsp_us');
    });

    test('formats URLs with disambiguating ?cat= only when used in non-default category', () => {
      // Pure fluid measures on Cooking tab append ?cat=cooking
      expect(formatRoutePath('cooking', 'l', 'gal_us', '1', 'auto', false)).toBe(
        '/convert/l-to-gal_us?cat=cooking'
      );
      expect(formatRoutePath('cooking', 'ml', 'l', '500', 'auto', false)).toBe(
        '/convert/500-ml-to-l?cat=cooking'
      );

      // Culinary tools on Volume tab append ?cat=volume
      expect(formatRoutePath('volume', 'cup_us', 'tbsp_us', '1', 'auto', false)).toBe(
        '/convert/cup_us-to-tbsp_us?cat=volume'
      );
      expect(formatRoutePath('volume', 'tbsp_us', 'tsp_us', '3', 'auto', false)).toBe(
        '/convert/3-tbsp_us-to-tsp_us?cat=volume'
      );
    });

    test('formats URLs with ?kitchen=1 when kitchen drawer mode is active in cooking', () => {
      // Fluid measures in kitchen drawer mode use ?kitchen=1 (which already implies cooking)
      expect(formatRoutePath('cooking', 'l', 'gal_us', '1', 'auto', true)).toBe(
        '/convert/l-to-gal_us?kitchen=1'
      );
      // Culinary tools in kitchen drawer mode
      expect(formatRoutePath('cooking', 'cup_us', 'tbsp_us', '1', 'auto', true)).toBe(
        '/convert/cup_us-to-tbsp_us?kitchen=1'
      );
    });

    test('correctly partitions all unit pairs with getDefaultCategoryForPair', () => {
      expect(getDefaultCategoryForPair('cup_us', 'tbsp_us')).toBe('cooking');
      expect(getDefaultCategoryForPair('cup_us', 'ml')).toBe('cooking');
      expect(getDefaultCategoryForPair('l', 'gal_us')).toBe('volume');
      expect(getDefaultCategoryForPair('ml', 'l')).toBe('volume');
      expect(getDefaultCategoryForPair('stick_butter', 'tbsp_us')).toBe('cooking');
      expect(getDefaultCategoryForPair('bbl_oil', 'cum')).toBe('volume');
      expect(getDefaultCategoryForPair('km', 'mi')).toBe(null);
    });

    test('getAllUnitPairs produces exactly 2,622 unique canonical routes with 0 duplicates', () => {
      const allPairs = getAllUnitPairs();
      const pathSet = new Set(allPairs.map((p) => p.path));

      expect(allPairs.length).toBe(2622);
      expect(pathSet.size).toBe(2622);

      // Volume canonical pair is in volume
      const lGalPair = allPairs.find((p) => p.fromUnitId === 'l' && p.toUnitId === 'gal_us');
      expect(lGalPair).toBeDefined();
      expect(lGalPair.categoryId).toBe('volume');

      // Culinary canonical pair is in cooking
      const cupTbspPair = allPairs.find((p) => p.fromUnitId === 'cup_us' && p.toUnitId === 'tbsp_us');
      expect(cupTbspPair).toBeDefined();
      expect(cupTbspPair.categoryId).toBe('cooking');
    });

    test('generateSitemapXml contains no duplicate unit pair URLs', () => {
      const xml = generateSitemapXml('https://www.convertthings.com');
      const matchesLGal = xml.match(/<loc>https:\/\/www\.convertthings\.com\/convert\/l-to-gal_us<\/loc>/g);
      expect(matchesLGal).not.toBeNull();
      expect(matchesLGal.length).toBe(1);

      const matchesCupTbsp = xml.match(/<loc>https:\/\/www\.convertthings\.com\/convert\/cup_us-to-tbsp_us<\/loc>/g);
      expect(matchesCupTbsp).not.toBeNull();
      expect(matchesCupTbsp.length).toBe(1);
    });
  });
});

