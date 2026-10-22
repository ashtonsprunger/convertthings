import {
  parseConversionQuery,
  findCategoryMatch,
  parseCompoundConversion,
  getSearchSuggestions,
  checkUnsupportedDomain,
  findAllUnits,
  findUnit
} from './parser';

describe('Smart Convert Search Parser Engine', () => {
  describe('Category Intent Detection', () => {
    test('detects direct category IDs and names', () => {
      expect(findCategoryMatch('cooking')?.id).toBe('cooking');
      expect(findCategoryMatch('temperature')?.id).toBe('temperature');
      expect(findCategoryMatch('length')?.id).toBe('length');
      expect(findCategoryMatch('mass')?.id).toBe('mass');
      expect(findCategoryMatch('speed')?.id).toBe('speed');
    });

    test('detects category synonyms and colloquial keywords', () => {
      expect(findCategoryMatch('kitchen')?.id).toBe('cooking');
      expect(findCategoryMatch('baking')?.id).toBe('cooking');
      expect(findCategoryMatch('culinary')?.id).toBe('cooking');
      expect(findCategoryMatch('temp')?.id).toBe('temperature');
      expect(findCategoryMatch('weather')?.id).toBe('temperature');
      expect(findCategoryMatch('gas mileage')?.id).toBe('fuel');
      expect(findCategoryMatch('storage')?.id).toBe('digital');
      expect(findCategoryMatch('hard drive')?.id).toBe('digital');
      expect(findCategoryMatch('bandwidth')?.id).toBe('data_rate');
      expect(findCategoryMatch('body weight')?.id).toBe('mass');
    });

    test('ignores conversational lead-in phrases when matching category', () => {
      expect(findCategoryMatch('go to cooking')?.id).toBe('cooking');
      expect(findCategoryMatch('open kitchen')?.id).toBe('cooking');
      expect(findCategoryMatch('show temperature')?.id).toBe('temperature');
    });
  });

  describe('Conversational & Natural Language Queries', () => {
    test('parses queries with conversational preambles', () => {
      const res1 = parseConversionQuery('what is 100 km in miles');
      expect(res1).not.toBeNull();
      expect(res1.fromUnit.id).toBe('km');
      expect(res1.toUnit.id).toBe('mi');
      expect(res1.value).toBe(100);

      const res2 = parseConversionQuery('how much is 72 f in c');
      expect(res2).not.toBeNull();
      expect(res2.fromUnit.id).toBe('f');
      expect(res2.toUnit.id).toBe('c');

      const res3 = parseConversionQuery('can you convert 50 mph to kmh');
      expect(res3).not.toBeNull();
      expect(res3.fromUnit.id).toBe('mph');
      expect(res3.toUnit.id).toBe('kmh');

      const res4 = parseConversionQuery('tell me 100 c in f');
      expect(res4).not.toBeNull();
      expect(res4.result).toBe(212);
    });

    test('parses queries with trailing question marks', () => {
      const res = parseConversionQuery('100 km to miles?');
      expect(res).not.toBeNull();
      expect(res.fromUnit.id).toBe('km');
      expect(res.toUnit.id).toBe('mi');
    });

    test('parses cubic yards queries and abbreviations', () => {
      const res1 = parseConversionQuery('3 cubic yards to cubic feet');
      expect(res1).not.toBeNull();
      expect(res1.fromUnit.id).toBe('cuyd');
      expect(res1.toUnit.id).toBe('cuft');
      expect(res1.result).toBe(81);

      const res2 = parseConversionQuery('54 cu ft to cu yd');
      expect(res2).not.toBeNull();
      expect(res2.fromUnit.id).toBe('cuft');
      expect(res2.toUnit.id).toBe('cuyd');
      expect(res2.result).toBe(2);

      const res3 = parseConversionQuery('1 cu yd');
      expect(res3).not.toBeNull();
      expect(res3.fromUnit.id).toBe('cuyd');
      expect(res3.toUnit.id).toBe('cuft');
      expect(res3.result).toBe(27);
    });
  });

  describe('Punctuation, Abbreviations, and Directional Symbols', () => {
    test('parses unit abbreviations with periods', () => {
      const res1 = parseConversionQuery('100 sq. ft. to sq. m.');
      expect(res1).not.toBeNull();
      expect(res1.fromUnit.id).toBe('sqft');
      expect(res1.toUnit.id).toBe('sqm');
      expect(parseFloat(res1.result)).toBeCloseTo(9.2903, 3);

      const res2 = parseConversionQuery('50 lbs. to kg.');
      expect(res2).not.toBeNull();
      expect(res2.fromUnit.id).toBe('lb');
      expect(res2.toUnit.id).toBe('kg');
    });

    test('parses directional arrow notations', () => {
      const res1 = parseConversionQuery('100 km -> miles');
      expect(res1).not.toBeNull();
      expect(res1.fromUnit.id).toBe('km');
      expect(res1.toUnit.id).toBe('mi');

      const res2 = parseConversionQuery('100 km => miles');
      expect(res2).not.toBeNull();
      expect(res2.fromUnit.id).toBe('km');
      expect(res2.toUnit.id).toBe('mi');
    });

    test('parses colon separated units', () => {
      const res = parseConversionQuery('100 km:mi');
      expect(res).not.toBeNull();
      expect(res.fromUnit.id).toBe('km');
      expect(res.toUnit.id).toBe('mi');
    });
  });

  describe('Compound Physical Units', () => {
    test('parses imperial height expressions with ticks and labels', () => {
      // 5'11 to cm -> 71 inches = 180.34 cm
      const res1 = parseCompoundConversion("5'11 to cm");
      expect(res1).not.toBeNull();
      expect(res1.isCompound).toBe(true);
      expect(res1.value).toBe(71);
      expect(res1.toUnit.id).toBe('cm');
      expect(parseFloat(res1.result)).toBeCloseTo(180.34, 2);
      expect(res1.compoundDisplay).toBe('5 ft 11 in');

      // 5 ft 11 in to cm
      const res2 = parseCompoundConversion('5 ft 11 in to cm');
      expect(res2).not.toBeNull();
      expect(res2.value).toBe(71);
      expect(parseFloat(res2.result)).toBeCloseTo(180.34, 2);

      // Height with meters target
      const res3 = parseCompoundConversion('6 feet 2 inches in meters');
      expect(res3).not.toBeNull();
      expect(res3.value).toBe(74);
      expect(res3.toUnit.id).toBe('m');
      expect(parseFloat(res3.result)).toBeCloseTo(1.8796, 2);
    });

    test('parses compound time duration expressions', () => {
      // 1 hr 30 min in seconds -> 90 min = 5400 s
      const res1 = parseCompoundConversion('1 hr 30 min in seconds');
      expect(res1).not.toBeNull();
      expect(res1.isCompound).toBe(true);
      expect(res1.value).toBe(90);
      expect(res1.toUnit.id).toBe('s');
      expect(res1.result).toBe(5400);

      // 2 hours 15 mins to minutes -> 135 min
      const res2 = parseCompoundConversion('2 hours 15 mins to minutes');
      expect(res2).not.toBeNull();
      expect(res2.value).toBe(135);
      expect(res2.toUnit.id).toBe('min');
      expect(res2.result).toBe(135);
    });

    test('parses compound mass expressions', () => {
      // 5 lbs 8 oz to kg -> 88 oz = 2.494758 kg
      const res = parseCompoundConversion('5 lbs 8 oz to kg');
      expect(res).not.toBeNull();
      expect(res.isCompound).toBe(true);
      expect(res.value).toBe(88);
      expect(res.toUnit.id).toBe('kg');
      expect(parseFloat(res.result)).toBeCloseTo(2.4948, 2);

      // 2 lbs 4 oz to g (idea one from ideas.md)
      const res2 = parseCompoundConversion('2 lbs 4 oz to g');
      expect(res2).not.toBeNull();
      expect(res2.isCompound).toBe(true);
      expect(res2.value).toBe(36);
      expect(res2.toUnit.id).toBe('g');
      expect(parseFloat(res2.result)).toBeCloseTo(1020.58, 2);
      expect(res2.compoundDisplay).toBe('2 lb 4 oz');
    });

    test('parses mixed inputs with conjunctions and commas', () => {
      // "5 feet and 10 inches to cm"
      const res1 = parseCompoundConversion('5 feet and 10 inches to cm');
      expect(res1).not.toBeNull();
      expect(res1.value).toBe(70);
      expect(res1.toUnit.id).toBe('cm');
      expect(parseFloat(res1.result)).toBeCloseTo(177.8, 1);

      // "2 pounds and 4 ounces to g"
      const res2 = parseCompoundConversion('2 pounds and 4 ounces to g');
      expect(res2).not.toBeNull();
      expect(res2.value).toBe(36);
      expect(res2.toUnit.id).toBe('g');
      expect(parseFloat(res2.result)).toBeCloseTo(1020.58, 2);

      // "5 ft, 10 in to cm"
      const res3 = parseCompoundConversion('5 ft, 10 in to cm');
      expect(res3).not.toBeNull();
      expect(res3.value).toBe(70);
    });

    test('parses mixed inputs with fractions and decimals', () => {
      // "5 ft 10 1/2 in to cm"
      const res1 = parseCompoundConversion('5 ft 10 1/2 in to cm');
      expect(res1).not.toBeNull();
      expect(res1.value).toBe(70.5);
      expect(parseFloat(res1.result)).toBeCloseTo(179.07, 2);

      // "2 lbs 4.5 oz to g"
      const res2 = parseCompoundConversion('2 lbs 4.5 oz to g');
      expect(res2).not.toBeNull();
      expect(res2.value).toBe(36.5);
      expect(parseFloat(res2.result)).toBeCloseTo(1034.76, 2);
    });

    test('parses 3-part compound time expressions', () => {
      // "1 hr 30 min 15 sec to s" -> 5415 s
      const res = parseCompoundConversion('1 hr 30 min 15 sec to s');
      expect(res).not.toBeNull();
      expect(res.value).toBe(5415);
      expect(res.toUnit.id).toBe('s');
      expect(res.result).toBe(5415);
      expect(res.compoundDisplay).toBe('1 h 30 min 15 s');
    });

    test('parses yard, stone, volume, and kitchen compound units', () => {
      // 2 yd 1 ft to in -> 7 ft = 84 in
      const resYd = parseCompoundConversion('2 yd 1 ft to in');
      expect(resYd).not.toBeNull();
      expect(resYd.value).toBe(7);
      expect(resYd.fromUnit.id).toBe('ft');
      expect(resYd.result).toBe(84);
      expect(resYd.toUnit.id).toBe('in');

      // 11 st 4 lb to kg -> 71.6676 kg
      const resSt = parseCompoundConversion('11 st 4 lb to kg');
      expect(resSt).not.toBeNull();
      expect(resSt.toUnit.id).toBe('kg');
      expect(parseFloat(resSt.result)).toBeCloseTo(71.6676, 2);

      // 1 gal 2 qt to l -> 5.6781 L
      const resVol = parseCompoundConversion('1 gal 2 qt to l');
      expect(resVol).not.toBeNull();
      expect(resVol.toUnit.id).toBe('l');
      expect(parseFloat(resVol.result)).toBeCloseTo(5.6781, 2);

      // 1 cup 2 tbsp to ml -> 266.16 mL
      const resCook = parseCompoundConversion('1 cup 2 tbsp to ml');
      expect(resCook).not.toBeNull();
      expect(resCook.toUnit.id).toBe('ml');
      expect(parseFloat(resCook.result)).toBeCloseTo(266.16, 2);
    });

    test('parses natural questions with compound units', () => {
      const res1 = parseCompoundConversion('how many cm in 5 ft 10 in');
      expect(res1).not.toBeNull();
      expect(res1.toUnit.id).toBe('cm');
      expect(parseFloat(res1.result)).toBeCloseTo(177.8, 1);

      const res2 = parseCompoundConversion('how many grams in 2 lbs 4 oz');
      expect(res2).not.toBeNull();
      expect(res2.toUnit.id).toBe('g');
      expect(parseFloat(res2.result)).toBeCloseTo(1020.58, 2);
    });
  });

  describe('Word Numbers & Kitchen Fractions', () => {
    test('parses English fractional words in culinary queries', () => {
      const resHalf = parseConversionQuery('half a cup to tbsp');
      expect(resHalf).not.toBeNull();
      expect(resHalf.value).toBe(0.5);
      expect(resHalf.fromUnit.id).toBe('cup_us');
      expect(resHalf.toUnit.id).toBe('tbsp_us');
      expect(resHalf.result).toBe(8);

      const resQuarter = parseConversionQuery('quarter cup to ml');
      expect(resQuarter).not.toBeNull();
      expect(resQuarter.value).toBe(0.25);
      expect(resQuarter.fromUnit.id).toBe('cup_us');
      expect(resQuarter.toUnit.id).toBe('ml');
    });

    test('parses leading "a" or "an" article as 1', () => {
      const res = parseConversionQuery('a mile in feet');
      expect(res).not.toBeNull();
      expect(res.value).toBe(1);
      expect(res.fromUnit.id).toBe('mi');
      expect(res.toUnit.id).toBe('ft');
      expect(res.result).toBe(5280);
    });
  });

  describe('Single Units and Missing Values', () => {
    test('auto-completes single units with default value 1 and complementary unit', () => {
      const resMiles = parseConversionQuery('miles');
      expect(resMiles).not.toBeNull();
      expect(resMiles.value).toBe(1);
      expect(resMiles.fromUnit.id).toBe('mi');
      expect(resMiles.toUnit.id).toBe('km');

      const resC = parseConversionQuery('celsius');
      expect(resC).not.toBeNull();
      expect(resC.value).toBe(1);
      expect(resC.fromUnit.id).toBe('c');
      expect(resC.toUnit.id).toBe('f');
    });

    test('parses unit pair without explicit value', () => {
      const res = parseConversionQuery('km miles');
      expect(res).not.toBeNull();
      expect(res.value).toBe(1);
      expect(res.fromUnit.id).toBe('km');
      expect(res.toUnit.id).toBe('mi');
    });
  });

  describe('Typo Tolerance', () => {
    test('tolerates common misspellings of unit names', () => {
      const res1 = parseConversionQuery('100 celcius to fahrenheit');
      expect(res1).not.toBeNull();
      expect(res1.fromUnit.id).toBe('c');
      expect(res1.toUnit.id).toBe('f');
      expect(res1.result).toBe(212);

      const res2 = parseConversionQuery('100 farenheit to celsius');
      expect(res2).not.toBeNull();
      expect(res2.fromUnit.id).toBe('f');
      expect(res2.toUnit.id).toBe('c');

      const res3 = parseConversionQuery('10 kilomters to miles');
      expect(res3).not.toBeNull();
      expect(res3.fromUnit.id).toBe('km');
      expect(res3.toUnit.id).toBe('mi');
    });
  });

  describe('Unsupported Domains & Friendly Fallbacks', () => {
    test('detects currency queries', () => {
      expect(checkUnsupportedDomain('100 usd to eur')?.domain).toBe('currency');
      expect(checkUnsupportedDomain('$50 in euros')?.domain).toBe('currency');
      expect(checkUnsupportedDomain('1 bitcoin to dollars')?.domain).toBe('currency');
    });

    test('detects timezone queries', () => {
      expect(checkUnsupportedDomain('5pm est to pst')?.domain).toBe('timezone');
      expect(checkUnsupportedDomain('gmt to utc')?.domain).toBe('timezone');
    });
  });

  describe('Suggestion Palette Generator (getSearchSuggestions)', () => {
    test('provides categories and history for empty query', () => {
      const mockHistory = [
        { categoryId: 'length', categoryName: 'Length', fromUnitId: 'km', toUnitId: 'mi', fromValue: '100', toValue: '62.14', fromSymbol: 'km', toSymbol: 'mi' }
      ];
      const suggestions = getSearchSuggestions('', { history: mockHistory });
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe('history');
      expect(suggestions.some((s) => s.type === 'category')).toBe(true);
    });

    test('generates category navigation and popular items for category search', () => {
      const suggestions = getSearchSuggestions('cooking');
      expect(suggestions.length).toBeGreaterThan(1);
      expect(suggestions[0].type).toBe('category');
      expect(suggestions[0].payload.action).toBe('navigate_category');
      expect(suggestions[0].payload.categoryId).toBe('cooking');
      expect(suggestions[1].type).toBe('conversion');
    });

    test('generates instant match for full conversion queries with domain category icon and equation', () => {
      const suggestions = getSearchSuggestions('100 km to miles');
      expect(suggestions.length).toBe(1); // Exact match isolated to 1 card
      expect(suggestions[0].type).toBe('conversion');
      expect(suggestions[0].badge).toBe('Instant Match');
      expect(suggestions[0].icon).toBe('Ruler'); // Category icon for length
      expect(suggestions[0].categoryId).toBe('length');
      expect(suggestions[0].equation).toBeDefined();
      expect(suggestions[0].equation.fromVal).toBe('100');
      expect(suggestions[0].equation.toUnit).toBe('Miles');
      expect(suggestions[0].payload.value).toBe(100);

      // Verify domain icons for other categories
      const tempMatch = getSearchSuggestions('72 f in c');
      expect(tempMatch[0].icon).toBe('Thermometer');
      expect(tempMatch[0].categoryId).toBe('temperature');

      const massMatch = getSearchSuggestions('150 lbs to kg');
      expect(massMatch[0].icon).toBe('Scale');
      expect(massMatch[0].categoryId).toBe('mass');

      const cookingMatch = getSearchSuggestions('1 cup to ml');
      expect(cookingMatch[0].icon).toBe('ChefHat');
      expect(cookingMatch[0].categoryId).toBe('cooking');

      // Verify compound height query
      const heightMatch = getSearchSuggestions("5'11 to cm");
      expect(heightMatch[0].icon).toBe('Ruler');
      expect(heightMatch[0].equation.fromVal).toBe('5 ft 11 in');
      expect(heightMatch[0].equation.toUnit).toBe('Centimeters');
    });

    test('generates instant match for fraction queries preserving displayValue string', () => {
      const fracMatch = getSearchSuggestions('1/8 in to mm');
      expect(fracMatch.length).toBe(1);
      expect(fracMatch[0].type).toBe('conversion');
      expect(fracMatch[0].payload.value).toBe(0.125);
      expect(fracMatch[0].payload.displayValue).toBe('1/8');

      // Also incomplete fraction query like "1/8 in"
      const incFrac = getSearchSuggestions('1/8 in');
      expect(incFrac.length).toBeGreaterThan(0);
      expect(incFrac[0].payload.displayValue).toBe('1/8');
    });

    test('generates suggestions for incomplete queries with domain icon and equation', () => {
      const suggestions = getSearchSuggestions('100 km to');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].badge).toBe('Suggested');
      expect(suggestions[0].icon).toBe('Ruler');
      expect(suggestions[0].equation).toBeDefined();
    });

    test('generates notice for unsupported currency queries', () => {
      const suggestions = getSearchSuggestions('100 usd to eur');
      expect(suggestions.length).toBe(1);
      expect(suggestions[0].type).toBe('unsupported');
      expect(suggestions[0].badge).toBe('Notice');
    });
  });

  describe('Explicit Value Tracking for Non-Intrusive Focus', () => {
    test('marks queries with specific numbers as hasExplicitValue: true', () => {
      expect(parseConversionQuery('100 km to miles')?.hasExplicitValue).toBe(true);
      expect(parseConversionQuery('72 f in c')?.hasExplicitValue).toBe(true);
      expect(parseCompoundConversion("5'11 to cm")?.hasExplicitValue).toBe(true);
      expect(parseConversionQuery('50 lbs to kg')?.hasExplicitValue).toBe(true);
      expect(parseConversionQuery('half a cup to tbsp')?.hasExplicitValue).toBe(true);
    });

    test('marks queries without numbers as hasExplicitValue: false', () => {
      expect(parseConversionQuery('km to miles')?.hasExplicitValue).toBe(false);
      expect(parseConversionQuery('celsius')?.hasExplicitValue).toBe(false);
      expect(parseConversionQuery('miles')?.hasExplicitValue).toBe(false);
      expect(parseConversionQuery('km miles')?.hasExplicitValue).toBe(false);
    });
  });

  describe('Phase 2 Natural Language Queries', () => {
    test('parses specialized and common Phase 2 queries', () => {
      // Troy ounces
      const troyRes = parseConversionQuery('1 troy oz to g');
      expect(troyRes).not.toBeNull();
      expect(troyRes.fromUnit.id).toBe('oz_t');
      expect(troyRes.toUnit.id).toBe('g');
      expect(parseFloat(troyRes.result)).toBeCloseTo(31.1035, 2);

      // Centiliters to Liters
      const clRes = parseConversionQuery('100 cl to l');
      expect(clRes).not.toBeNull();
      expect(clRes.fromUnit.id).toBe('cl');
      expect(clRes.toUnit.id).toBe('l');
      expect(clRes.result).toBe(1);

      // Metric cup to ml
      const metricCupRes = parseConversionQuery('1 metric cup to ml');
      expect(metricCupRes).not.toBeNull();
      expect(metricCupRes.fromUnit.id).toBe('cup_metric');
      expect(metricCupRes.result).toBe(250);

      // Astronomical unit to km
      const auRes = parseConversionQuery('1 au to km');
      expect(auRes).not.toBeNull();
      expect(auRes.fromUnit.id).toBe('au');
      expect(parseFloat(auRes.result)).toBeCloseTo(149597870.7, 1);

      // Mil to inches
      const milRes = parseConversionQuery('1000 mil to in');
      expect(milRes).not.toBeNull();
      expect(milRes.fromUnit.id).toBe('mil');
      expect(milRes.toUnit.id).toBe('in');
      expect(parseFloat(milRes.result)).toBeCloseTo(1, 6);
      expect(milRes.formattedResult).toBe('1');

      // EV efficiency query
      const evRes = parseConversionQuery('3 mi/kwh to kwh/100km');
      expect(evRes).not.toBeNull();
      expect(evRes.fromUnit.id).toBe('mi_kwh');
      expect(evRes.toUnit.id).toBe('kwh_100km');
      expect(parseFloat(evRes.result)).toBeCloseTo(20.71, 1);
    });
  });

  describe('Phase 2.5 Omnibox Parity & Colloquial Aliases', () => {
    test('parses natural conversion queries using trade colloquialisms', () => {
      // Gold oz to grams
      const goldOzRes = parseConversionQuery('1 gold oz to grams');
      expect(goldOzRes).not.toBeNull();
      expect(goldOzRes.fromUnit.id).toBe('oz_t');
      expect(goldOzRes.toUnit.id).toBe('g');
      expect(parseFloat(goldOzRes.result)).toBeCloseTo(31.1035, 2);

      // Gold ounce in kg
      const goldOunceRes = parseConversionQuery('10 gold ounce in kg');
      expect(goldOunceRes).not.toBeNull();
      expect(goldOunceRes.fromUnit.id).toBe('oz_t');
      expect(goldOunceRes.toUnit.id).toBe('kg');
      expect(parseFloat(goldOunceRes.result)).toBeCloseTo(0.311, 3);

      // Single unit query: "gold oz"
      const singleGoldOz = parseConversionQuery('gold oz');
      expect(singleGoldOz).not.toBeNull();
      expect(singleGoldOz.fromUnit.id).toBe('oz_t');
      expect(singleGoldOz.toUnit.id).toBe('g');

      // Equine horse hands
      const horseRes = parseConversionQuery('16 hands to feet');
      expect(horseRes).not.toBeNull();
      expect(horseRes.fromUnit.id).toBe('hand');
      expect(horseRes.toUnit.id).toBe('ft');
      expect(parseFloat(horseRes.result)).toBeCloseTo(5.333, 2);

      // Food calories
      const calRes = parseConversionQuery('2000 food calories to kj');
      expect(calRes).not.toBeNull();
      expect(calRes.fromUnit.id).toBe('kcal');
      expect(calRes.toUnit.id).toBe('kj');
      expect(parseFloat(calRes.result)).toBeCloseTo(8368, 0);

      // Tire pressure (psi)
      const psiRes = parseConversionQuery('32 tire psi to bar');
      expect(psiRes).not.toBeNull();
      expect(psiRes.fromUnit.id).toBe('psi');
      expect(psiRes.toUnit.id).toBe('bar');
      expect(parseFloat(psiRes.result)).toBeCloseTo(2.206, 2);

      // Machining thou
      const thouRes = parseConversionQuery('10 thou to mm');
      expect(thouRes).not.toBeNull();
      expect(thouRes.fromUnit.id).toBe('mil');
      expect(thouRes.toUnit.id).toBe('mm');
      expect(parseFloat(thouRes.result)).toBeCloseTo(0.254, 3);
    });

    test('getSearchSuggestions returns semantic topic recommendations', () => {
      // Searching "gold" returns Troy Ounce and Pennyweight
      const goldSugg = getSearchSuggestions('gold');
      expect(goldSugg.length).toBeGreaterThanOrEqual(1);
      const hasTroy = goldSugg.some((s) => s.payload?.fromUnitId === 'oz_t');
      expect(hasTroy).toBe(true);

      // Searching "jewelry" returns jewelry-badged units
      const jewelrySugg = getSearchSuggestions('jewelry');
      expect(jewelrySugg.length).toBeGreaterThanOrEqual(1);
      const jewelryUnits = jewelrySugg.map((s) => s.payload?.fromUnitId);
      expect(jewelryUnits.some((id) => ['oz_t', 'dwt', 'ct'].includes(id))).toBe(true);

      // Searching "astronomy" returns space units
      const astroSugg = getSearchSuggestions('astronomy');
      expect(astroSugg.length).toBeGreaterThanOrEqual(1);
      const astroUnits = astroSugg.map((s) => s.payload?.fromUnitId);
      expect(astroUnits.some((id) => ['au', 'ly', 'pc'].includes(id))).toBe(true);

      // Searching "horse" returns Hand
      const horseSugg = getSearchSuggestions('horse');
      expect(horseSugg.length).toBeGreaterThanOrEqual(1);
      expect(horseSugg.some((s) => s.payload?.fromUnitId === 'hand')).toBe(true);

      // Searching "tire pressure" returns PSI
      const tireSugg = getSearchSuggestions('tire pressure');
      expect(tireSugg.length).toBeGreaterThanOrEqual(1);
      expect(tireSugg.some((s) => s.payload?.fromUnitId === 'psi')).toBe(true);
    });
  });

  describe('Phase 3 Natural Language & Intent Tests (Frequency & Torque)', () => {
    test('parses frequency equations and colloquial terms', () => {
      // 600 rpm to hz
      const rpmRes = parseConversionQuery('600 rpm to hz');
      expect(rpmRes).not.toBeNull();
      expect(rpmRes.categoryId).toBe('frequency');
      expect(rpmRes.fromUnit.id).toBe('rpm');
      expect(rpmRes.toUnit.id).toBe('hz');
      expect(rpmRes.result).toBe(10);

      // 3.5 GHz in MHz
      const ghzRes = parseConversionQuery('3.5 ghz in mhz');
      expect(ghzRes).not.toBeNull();
      expect(ghzRes.categoryId).toBe('frequency');
      expect(ghzRes.fromUnit.id).toBe('ghz');
      expect(ghzRes.toUnit.id).toBe('mhz');
      expect(ghzRes.result).toBe(3500);

      // Single unit query with complementary default (rpm -> hz)
      const singleRpm = parseConversionQuery('1200 rpm');
      expect(singleRpm).not.toBeNull();
      expect(singleRpm.categoryId).toBe('frequency');
      expect(singleRpm.fromUnit.id).toBe('rpm');
      expect(singleRpm.toUnit.id).toBe('hz');
      expect(singleRpm.result).toBe(20);
    });

    test('parses torque equations and disambiguates from length/energy', () => {
      // 100 nm to ftlb (Newton-meters to Pound-feet)
      const nmTorque = parseConversionQuery('100 nm to ftlb');
      expect(nmTorque).not.toBeNull();
      expect(nmTorque.categoryId).toBe('torque');
      expect(nmTorque.fromUnit.id).toBe('nm');
      expect(nmTorque.toUnit.id).toBe('ftlb');
      expect(parseFloat(nmTorque.result)).toBeCloseTo(73.7562, 3);

      // 100 ft-lb to nm
      const ftlbTorque = parseConversionQuery('100 ft-lb to nm');
      expect(ftlbTorque).not.toBeNull();
      expect(ftlbTorque.categoryId).toBe('torque');
      expect(ftlbTorque.fromUnit.id).toBe('ftlb');
      expect(ftlbTorque.toUnit.id).toBe('nm');
      expect(parseFloat(ftlbTorque.result)).toBeCloseTo(135.5818, 3);

      // 15 ft-lbs in in-lbs
      const inlbTorque = parseConversionQuery('15 ft-lbs in in-lbs');
      expect(inlbTorque).not.toBeNull();
      expect(inlbTorque.categoryId).toBe('torque');
      expect(inlbTorque.fromUnit.id).toBe('ftlb');
      expect(inlbTorque.toUnit.id).toBe('inlb');
      expect(inlbTorque.result).toBe(180);
    });

    test('resolves frequency and torque category search intent', () => {
      expect(findCategoryMatch('frequency')?.id).toBe('frequency');
      expect(findCategoryMatch('torque')?.id).toBe('torque');
      expect(findCategoryMatch('lug nut')?.id).toBe('torque');
      expect(findCategoryMatch('hertz')?.id).toBe('frequency');
    });
  });

  describe('Phase 4 Natural Language & Intent Tests (Force, Flow Rate, Typography)', () => {
    test('parses force equations and units', () => {
      // 100 n to lbf
      const nRes = parseConversionQuery('100 n to lbf');
      expect(nRes).not.toBeNull();
      expect(nRes.categoryId).toBe('force');
      expect(nRes.fromUnit.id).toBe('n');
      expect(nRes.toUnit.id).toBe('lbf');
      expect(parseFloat(nRes.result)).toBeCloseTo(22.4809, 3);

      // 10 kn to lbf
      const knRes = parseConversionQuery('10 kn to lbf');
      expect(knRes).not.toBeNull();
      expect(knRes.categoryId).toBe('force');
      expect(knRes.fromUnit.id).toBe('kn');
      expect(knRes.toUnit.id).toBe('lbf');
      expect(parseFloat(knRes.result)).toBeCloseTo(2248.089, 2);

      // 1 kip in kn
      const kipRes = parseConversionQuery('1 kip in kn');
      expect(kipRes).not.toBeNull();
      expect(kipRes.categoryId).toBe('force');
      expect(kipRes.fromUnit.id).toBe('kip');
      expect(kipRes.toUnit.id).toBe('kn');
      expect(parseFloat(kipRes.result)).toBeCloseTo(4.4482, 3);
    });

    test('parses volumetric flow rate equations (CFM, L/s, GPM)', () => {
      // 100 cfm to l/s
      const cfmRes = parseConversionQuery('100 cfm to l/s');
      expect(cfmRes).not.toBeNull();
      expect(cfmRes.categoryId).toBe('flow_rate');
      expect(cfmRes.fromUnit.id).toBe('cfm');
      expect(cfmRes.toUnit.id).toBe('l_s');
      expect(parseFloat(cfmRes.result)).toBeCloseTo(47.1947, 3);

      // 5 gpm to l/min
      const gpmRes = parseConversionQuery('5 gpm to l/min');
      expect(gpmRes).not.toBeNull();
      expect(gpmRes.categoryId).toBe('flow_rate');
      expect(gpmRes.fromUnit.id).toBe('gpm_us');
      expect(gpmRes.toUnit.id).toBe('l_min');
      expect(parseFloat(gpmRes.result)).toBeCloseTo(18.927, 2);
    });

    test('parses typography equations (px, rem, pt)', () => {
      // 16 px to rem
      const pxRes = parseConversionQuery('16 px to rem');
      expect(pxRes).not.toBeNull();
      expect(pxRes.categoryId).toBe('typography');
      expect(pxRes.fromUnit.id).toBe('px');
      expect(pxRes.toUnit.id).toBe('rem');
      expect(pxRes.result).toBe(1);

      // 1.5 rem to px
      const remRes = parseConversionQuery('1.5 rem to px');
      expect(remRes).not.toBeNull();
      expect(remRes.categoryId).toBe('typography');
      expect(remRes.fromUnit.id).toBe('rem');
      expect(remRes.toUnit.id).toBe('px');
      expect(remRes.result).toBe(24);

      // 12 pt to px
      const ptRes = parseConversionQuery('12 pt to px');
      expect(ptRes).not.toBeNull();
      expect(ptRes.categoryId).toBe('typography');
      expect(ptRes.fromUnit.id).toBe('pt');
      expect(ptRes.toUnit.id).toBe('px');
      expect(ptRes.result).toBe(16);
    });

    test('resolves force, flow rate, and typography search intent', () => {
      expect(findCategoryMatch('force')?.id).toBe('force');
      expect(findCategoryMatch('flow rate')?.id).toBe('flow_rate');
      expect(findCategoryMatch('typography')?.id).toBe('typography');
      expect(findCategoryMatch('font size')?.id).toBe('typography');
      expect(findCategoryMatch('airflow')?.id).toBe('flow_rate');
    });
  });

  describe('Phase 5 Natural Language & Intent Tests (Electric Current & Illuminance)', () => {
    test('parses electric current and battery capacity queries (A, mA, mAh, Ah)', () => {
      // 10 a to ma
      const aRes = parseConversionQuery('10 a to ma');
      expect(aRes).not.toBeNull();
      expect(aRes.categoryId).toBe('current');
      expect(aRes.fromUnit.id).toBe('a');
      expect(aRes.toUnit.id).toBe('ma');
      expect(aRes.result).toBe(10000);

      // 5000 mah to ah
      const mahRes = parseConversionQuery('5000 mah to ah');
      expect(mahRes).not.toBeNull();
      expect(mahRes.categoryId).toBe('current');
      expect(mahRes.fromUnit.id).toBe('mah');
      expect(mahRes.toUnit.id).toBe('ah');
      expect(mahRes.result).toBe(5);

      // 500 ma in a
      const maRes = parseConversionQuery('500 ma in a');
      expect(maRes).not.toBeNull();
      expect(maRes.categoryId).toBe('current');
      expect(maRes.fromUnit.id).toBe('ma');
      expect(maRes.toUnit.id).toBe('a');
      expect(maRes.result).toBe(0.5);
    });

    test('parses illuminance equations (lux, fc, foot-candles)', () => {
      // 500 lx to fc
      const lxRes = parseConversionQuery('500 lx to fc');
      expect(lxRes).not.toBeNull();
      expect(lxRes.categoryId).toBe('illuminance');
      expect(lxRes.fromUnit.id).toBe('lx');
      expect(lxRes.toUnit.id).toBe('fc');
      expect(parseFloat(lxRes.result)).toBeCloseTo(46.45, 1);

      // 50 fc to lx
      const fcRes = parseConversionQuery('50 fc to lx');
      expect(fcRes).not.toBeNull();
      expect(fcRes.categoryId).toBe('illuminance');
      expect(fcRes.fromUnit.id).toBe('fc');
      expect(fcRes.toUnit.id).toBe('lx');
      expect(parseFloat(fcRes.result)).toBeCloseTo(538.195, 1);

      // 500 lux in foot candles
      const luxRes = parseConversionQuery('500 lux in foot candles');
      expect(luxRes).not.toBeNull();
      expect(luxRes.categoryId).toBe('illuminance');
      expect(luxRes.fromUnit.id).toBe('lx');
      expect(luxRes.toUnit.id).toBe('fc');
      expect(parseFloat(luxRes.result)).toBeCloseTo(46.45, 1);
    });

    test('resolves current and illuminance category search intent', () => {
      expect(findCategoryMatch('current')?.id).toBe('current');
      expect(findCategoryMatch('amperage')?.id).toBe('current');
      expect(findCategoryMatch('battery capacity')?.id).toBe('current');
      expect(findCategoryMatch('illuminance')?.id).toBe('illuminance');
      expect(findCategoryMatch('lighting')?.id).toBe('illuminance');
      expect(findCategoryMatch('foot candle')?.id).toBe('illuminance');
    });
  });
});

