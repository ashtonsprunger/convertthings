export const CATEGORIES = [
  { id: 'length', name: 'Length & Distance', icon: 'Ruler', defaultFrom: 'm', defaultTo: 'ft' },
  { id: 'mass', name: 'Weight & Mass', icon: 'Scale', defaultFrom: 'kg', defaultTo: 'lb' },
  { id: 'temperature', name: 'Temperature', icon: 'Thermometer', defaultFrom: 'c', defaultTo: 'f' },
  { id: 'volume', name: 'Volume & Capacity', icon: 'Droplet', defaultFrom: 'l', defaultTo: 'gal_us' },
  { id: 'cooking', name: 'Kitchen & Cooking', icon: 'ChefHat', defaultFrom: 'cup_us', defaultTo: 'tbsp_us' },
  { id: 'area', name: 'Area', icon: 'Square', defaultFrom: 'sqm', defaultTo: 'sqft' },
  { id: 'speed', name: 'Speed', icon: 'Gauge', defaultFrom: 'kmh', defaultTo: 'mph' },
  { id: 'time', name: 'Time', icon: 'Clock', defaultFrom: 'h', defaultTo: 'min' },
  { id: 'fuel', name: 'Fuel Economy', icon: 'Fuel', defaultFrom: 'mpg_us', defaultTo: 'l100km' },
  { id: 'digital', name: 'Digital Storage', icon: 'HardDrive', defaultFrom: 'gb', defaultTo: 'mb' },
  { id: 'data_rate', name: 'Data Transfer Rate', icon: 'Zap', defaultFrom: 'mbps', defaultTo: 'mbs' },
  { id: 'pressure', name: 'Pressure', icon: 'Compass', defaultFrom: 'bar', defaultTo: 'psi' },
  { id: 'energy', name: 'Energy', icon: 'Sparkles', defaultFrom: 'j', defaultTo: 'cal' },
  { id: 'power', name: 'Power', icon: 'Lightbulb', defaultFrom: 'kw', defaultTo: 'hp' },
  { id: 'torque', name: 'Torque', icon: 'Wrench', defaultFrom: 'nm', defaultTo: 'ftlb' },
  { id: 'force', name: 'Force', icon: 'Crosshair', defaultFrom: 'n', defaultTo: 'lbf' },
  { id: 'angle', name: 'Angle', icon: 'RotateCw', defaultFrom: 'deg', defaultTo: 'rad' },
  { id: 'frequency', name: 'Frequency', icon: 'Waveform', defaultFrom: 'hz', defaultTo: 'khz' },
  { id: 'flow_rate', name: 'Volumetric Flow Rate', icon: 'Waves', defaultFrom: 'cfm', defaultTo: 'l_s' },
  { id: 'typography', name: 'Typography', icon: 'Type', defaultFrom: 'px', defaultTo: 'rem' },
  { id: 'current', name: 'Electric Current', icon: 'BatteryCharging', defaultFrom: 'a', defaultTo: 'ma' },
  { id: 'illuminance', name: 'Illuminance', icon: 'Sun', defaultFrom: 'lx', defaultTo: 'fc' },
];

/**
 * Unit Registry
 * Each category defines units with:
 * - id: unique unit key
 * - name: full singular name
 * - plural: full plural name
 * - symbol: display symbol / abbreviation
 * - toBase: function or number factor to convert to base unit
 * - fromBase: function or number factor to convert from base unit
 * - aliases: alternative names / symbols for search & natural language parsing
 */
export const UNIT_DEFINITIONS = {
  length: {
    baseUnit: 'm',
    units: [
      { id: 'm', name: 'Meter', plural: 'Meters', symbol: 'm', factor: 1, tier: 'common', aliases: ['meter', 'meters', 'metre', 'metres'] },
      { id: 'km', name: 'Kilometer', plural: 'Kilometers', symbol: 'km', factor: 1000, tier: 'common', aliases: ['kilometer', 'kilometers', 'kilometre', 'kilo', 'km'] },
      { id: 'cm', name: 'Centimeter', plural: 'Centimeters', symbol: 'cm', factor: 0.01, tier: 'common', aliases: ['centimeter', 'centimeters', 'centimetre', 'cm'] },
      { id: 'mm', name: 'Millimeter', plural: 'Millimeters', symbol: 'mm', factor: 0.001, tier: 'common', aliases: ['millimeter', 'millimeters', 'millimetre', 'mm'] },
      { id: 'um', name: 'Micrometer', plural: 'Micrometers', symbol: 'µm', factor: 1e-6, tier: 'specialized', subtitle: 'Microns (cells, fibers)', aliases: ['micrometer', 'micrometers', 'micron', 'microns', 'um', 'µm'] },
      { id: 'nm', name: 'Nanometer', plural: 'Nanometers', symbol: 'nm', factor: 1e-9, tier: 'specialized', subtitle: 'Nanotechnology & light wavelengths', aliases: ['nanometer', 'nanometers', 'nm'] },
      { id: 'mi', name: 'Mile', plural: 'Miles', symbol: 'mi', factor: 1609.344, tier: 'common', aliases: ['mile', 'miles', 'mi'] },
      { id: 'yd', name: 'Yard', plural: 'Yards', symbol: 'yd', factor: 0.9144, tier: 'common', aliases: ['yard', 'yards', 'yd'] },
      { id: 'ft', name: 'Foot', plural: 'Feet', symbol: 'ft', factor: 0.3048, tier: 'common', aliases: ['foot', 'feet', 'ft', "'"] },
      { id: 'in', name: 'Inch', plural: 'Inches', symbol: 'in', factor: 0.0254, tier: 'common', aliases: ['inch', 'inches', 'in', '"'] },
      { id: 'nmi', name: 'Nautical Mile', plural: 'Nautical Miles', symbol: 'nmi', factor: 1852, tier: 'specialized', subtitle: 'Maritime & aviation navigation', badge: 'Nautical', aliases: ['nautical mile', 'nautical miles', 'nmi', 'nmile'] },
      { id: 'ly', name: 'Light-Year', plural: 'Light-Years', symbol: 'ly', factor: 9.4607304725808e15, tier: 'specialized', subtitle: 'Interstellar astronomical distance', badge: 'Space', aliases: ['light year', 'light-year', 'light years', 'ly', 'space distance', 'astronomy'] },
      { id: 'au', name: 'Astronomical Unit', plural: 'Astronomical Units', symbol: 'AU', factor: 149597870700, tier: 'specialized', subtitle: 'Earth-Sun distance (Solar system)', badge: 'Space', aliases: ['astronomical unit', 'astronomical units', 'au', 'earth sun distance', 'astronomy'] },
      { id: 'pc', name: 'Parsec', plural: 'Parsecs', symbol: 'pc', factor: 3.0856775814913673e16, tier: 'specialized', subtitle: 'Astrophysics (~3.26 light-years)', badge: 'Space', aliases: ['parsec', 'parsecs', 'pc', 'astrophysics', 'astronomy'] },
      { id: 'angstrom', name: 'Ångström', plural: 'Ångströms', symbol: 'Å', factor: 1e-10, tier: 'specialized', subtitle: '0.1 nm (Crystallography & semiconductors)', aliases: ['angstrom', 'angstroms', 'ångström', 'ångströms', 'å'] },
      { id: 'mil', name: 'Mil (Thou)', plural: 'Mils', symbol: 'mil', factor: 0.0000254, tier: 'specialized', subtitle: '0.001 in (PCB traces, sheet metal, paint)', badge: 'Machining', aliases: ['mil', 'mils', 'thou', 'paint mil', 'coating mil', 'pcb mil'] },
      { id: 'fathom', name: 'Fathom', plural: 'Fathoms', symbol: 'ftm', factor: 1.8288, tier: 'specialized', subtitle: '6 feet (Nautical depth)', badge: 'Maritime', aliases: ['fathom', 'fathoms', 'ftm', 'fthm', 'water depth', 'nautical fathom'] },
      { id: 'hand', name: 'Hand', plural: 'Hands', symbol: 'hh', factor: 0.1016, tier: 'specialized', subtitle: '4 inches (Equine horse height)', badge: 'Equestrian', aliases: ['hand', 'hands', 'hh', 'horse hand', 'horse hands', 'hands high', 'equine hand'] },
    ]
  },
  mass: {
    baseUnit: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram', plural: 'Kilograms', symbol: 'kg', factor: 1, tier: 'common', aliases: ['kilogram', 'kilograms', 'kilo', 'kilos', 'kg'] },
      { id: 'g', name: 'Gram', plural: 'Grams', symbol: 'g', factor: 0.001, tier: 'common', aliases: ['gram', 'grams', 'g'] },
      { id: 'mg', name: 'Milligram', plural: 'Milligrams', symbol: 'mg', factor: 1e-6, tier: 'common', aliases: ['milligram', 'milligrams', 'mg'] },
      { id: 'ug', name: 'Microgram', plural: 'Micrograms', symbol: 'µg', factor: 1e-9, tier: 'specialized', subtitle: 'Microscopic & clinical doses', aliases: ['microgram', 'micrograms', 'ug', 'µg'] },
      { id: 't', name: 'Metric Ton', plural: 'Metric Tons', symbol: 't', factor: 1000, tier: 'common', subtitle: '1,000 kg (Tonne)', aliases: ['metric ton', 'tonne', 'tonnes', 'metric tonnes', 't'] },
      { id: 'lb', name: 'Pound', plural: 'Pounds', symbol: 'lb', factor: 0.45359237, tier: 'common', aliases: ['pound', 'pounds', 'lb', 'lbs'] },
      { id: 'oz', name: 'Ounce', plural: 'Ounces', symbol: 'oz', factor: 0.028349523125, tier: 'common', subtitle: 'Everyday weight (16 oz = 1 lb)', aliases: ['ounce', 'ounces', 'oz'] },
      { id: 'st', name: 'Stone', plural: 'Stone', symbol: 'st', factor: 6.35029318, tier: 'common', subtitle: '14 lbs (UK body weight)', badge: 'UK', aliases: ['stone', 'stones', 'st', 'uk stone', 'body weight stone'] },
      { id: 'ton_us', name: 'US Short Ton', plural: 'US Short Tons', symbol: 'ton (US)', factor: 907.18474, tier: 'common', subtitle: '2,000 lbs (US short ton)', badge: 'US', aliases: ['short ton', 'us ton', 'ton'] },
      { id: 'ton_uk', name: 'Imperial Long Ton', plural: 'Imperial Long Tons', symbol: 'ton (UK)', factor: 1016.0469088, tier: 'specialized', subtitle: '2,240 lbs (UK long ton)', badge: 'UK', aliases: ['long ton', 'imperial ton', 'uk ton'] },
      { id: 'ct', name: 'Carat', plural: 'Carats', symbol: 'ct', factor: 0.0002, tier: 'specialized', subtitle: 'Diamonds & gemstones', badge: 'Jewelry', aliases: ['carat', 'carats', 'ct', 'diamond carat', 'gemstone carat', 'diamond weight'] },
      { id: 'gr', name: 'Grain', plural: 'Grains', symbol: 'gr', factor: 0.00006479891, tier: 'specialized', subtitle: 'Gunpowder, arrows & pharmacy', aliases: ['grain', 'grains', 'gr'] },
      { id: 'oz_t', name: 'Troy Ounce', plural: 'Troy Ounces', symbol: 'oz t', factor: 0.0311034768, tier: 'specialized', subtitle: 'Gold, silver & bullion (31.1 g)', badge: 'Jewelry', aliases: ['troy ounce', 'troy ounces', 'oz t', 'ozt', 'troy oz', 'gold oz', 'gold ounce', 'gold ounces', 'silver ounce', 'bullion ounce'] },
      { id: 'dwt', name: 'Pennyweight', plural: 'Pennyweights', symbol: 'dwt', factor: 0.00155517384, tier: 'specialized', subtitle: 'Scrap gold & dental alloys (1.555 g)', badge: 'Jewelry', aliases: ['pennyweight', 'pennyweights', 'dwt', 'scrap gold', 'gold dwt', 'dental alloy', 'dental gold'] },
      { id: 'da', name: 'Dalton (Atomic Mass Unit)', plural: 'Daltons', symbol: 'Da', factor: 1.66053906660e-27, tier: 'specialized', subtitle: 'Chemistry & molecular biology', badge: 'Science', aliases: ['dalton', 'daltons', 'da', 'atomic mass unit', 'atomic mass units', 'amu', 'molecular weight'] },
      { id: 'slug', name: 'Slug', plural: 'Slugs', symbol: 'slug', factor: 14.5939029, tier: 'specialized', subtitle: 'Aerospace & mechanics (lbf·s²/ft)', aliases: ['slug', 'slugs'] },
      { id: 'q', name: 'Metric Quintal', plural: 'Metric Quintals', symbol: 'q', factor: 100, tier: 'specialized', subtitle: 'Agricultural grain standard (100 kg)', badge: 'Agri', aliases: ['quintal', 'quintals', 'metric quintal', 'q'] },
    ]
  },
  temperature: {
    baseUnit: 'c',
    units: [
      {
        id: 'c',
        name: 'Celsius',
        plural: 'Celsius',
        symbol: '°C',
        tier: 'common',
        toBase: (v) => v,
        fromBase: (v) => v,
        aliases: ['celsius', 'centigrade', 'c', '°c', 'degrees c']
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        plural: 'Fahrenheit',
        symbol: '°F',
        tier: 'common',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
        aliases: ['fahrenheit', 'f', '°f', 'degrees f']
      },
      {
        id: 'k',
        name: 'Kelvin',
        plural: 'Kelvin',
        symbol: 'K',
        tier: 'common',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
        aliases: ['kelvin', 'k', 'degrees kelvin']
      },
      {
        id: 'r',
        name: 'Rankine',
        plural: 'Rankine',
        symbol: '°R',
        tier: 'specialized',
        subtitle: 'Thermodynamics (Absolute °F)',
        toBase: (v) => ((v - 491.67) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 491.67,
        aliases: ['rankine', 'r', '°r']
      }
    ]
  },
  area: {
    baseUnit: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter', plural: 'Square Meters', symbol: 'm²', factor: 1, tier: 'common', aliases: ['square meter', 'square meters', 'sq meter', 'sq meters', 'sq m', 'sqm', 'm2', 'm²', 'sq metre', 'sq metres'] },
      { id: 'sqkm', name: 'Square Kilometer', plural: 'Square Kilometers', symbol: 'km²', factor: 1e6, tier: 'common', aliases: ['square kilometer', 'square kilometers', 'sq km', 'sqkm', 'km2', 'km²'] },
      { id: 'sqcm', name: 'Square Centimeter', plural: 'Square Centimeters', symbol: 'cm²', factor: 0.0001, tier: 'specialized', subtitle: 'Square centimeters', aliases: ['square centimeter', 'square centimeters', 'sq cm', 'sqcm', 'cm2', 'cm²'] },
      { id: 'sqmm', name: 'Square Millimeter', plural: 'Square Millimeters', symbol: 'mm²', factor: 1e-6, tier: 'specialized', subtitle: 'Square millimeters', aliases: ['square millimeter', 'sq mm', 'sqmm', 'mm2', 'mm²'] },
      { id: 'sqmi', name: 'Square Mile', plural: 'Square Miles', symbol: 'mi²', factor: 2589988.110336, tier: 'common', aliases: ['square mile', 'square miles', 'sq mi', 'sqmi', 'mi2', 'mi²'] },
      { id: 'sqyd', name: 'Square Yard', plural: 'Square Yards', symbol: 'yd²', factor: 0.83612736, tier: 'common', aliases: ['square yard', 'square yards', 'sq yd', 'sqyd', 'yd2', 'yd²'] },
      { id: 'sqft', name: 'Square Foot', plural: 'Square Feet', symbol: 'ft²', factor: 0.09290304, tier: 'common', aliases: ['square foot', 'square feet', 'sq ft', 'sqft', 'ft2', 'ft²'] },
      { id: 'sqin', name: 'Square Inch', plural: 'Square Inches', symbol: 'in²', factor: 0.00064516, tier: 'common', aliases: ['square inch', 'square inches', 'sq in', 'sqin', 'in2', 'in²'] },
      { id: 'ac', name: 'Acre', plural: 'Acres', symbol: 'ac', factor: 4046.8564224, tier: 'common', aliases: ['acre', 'acres', 'ac'] },
      { id: 'ha', name: 'Hectare', plural: 'Hectares', symbol: 'ha', factor: 10000, tier: 'common', aliases: ['hectare', 'hectares', 'ha'] },
    ]
  },
  volume: {
    baseUnit: 'l',
    units: [
      { id: 'l', name: 'Liter', plural: 'Liters', symbol: 'L', factor: 1, tier: 'common', aliases: ['liter', 'liters', 'litre', 'litres', 'l'] },
      { id: 'ml', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', factor: 0.001, tier: 'common', aliases: ['milliliter', 'milliliters', 'millilitre', 'ml'] },
      { id: 'cl', name: 'Centiliter', plural: 'Centiliters', symbol: 'cL', factor: 0.01, tier: 'common', subtitle: 'European beverage & wine bottles (75 cL)', aliases: ['centiliter', 'centiliters', 'centilitre', 'centilitres', 'cl'] },
      { id: 'dl', name: 'Deciliter', plural: 'Deciliters', symbol: 'dL', factor: 0.1, tier: 'common', subtitle: 'Nordic & European recipe standard (100 mL)', aliases: ['deciliter', 'deciliters', 'decilitre', 'decilitres', 'dl'] },
      { id: 'cum', name: 'Cubic Meter', plural: 'Cubic Meters', symbol: 'm³', factor: 1000, tier: 'specialized', subtitle: '1,000 liters (Bulk cargo & shipping)', aliases: ['cubic meter', 'cubic meters', 'm3', 'm³'] },
      { id: 'cucm', name: 'Cubic Centimeter', plural: 'Cubic Centimeters', symbol: 'cm³', factor: 0.001, tier: 'specialized', subtitle: '1 mL / 1 cc (Engine displacement)', aliases: ['cubic centimeter', 'cubic centimeters', 'cc', 'cm3', 'cm³'] },
      { id: 'gal_us', name: 'US Gallon', plural: 'US Gallons', symbol: 'gal (US)', factor: 3.785411784, tier: 'common', aliases: ['gallon', 'gallons', 'gal', 'us gallon'] },
      { id: 'qt_us', name: 'US Quart', plural: 'US Quarts', symbol: 'qt (US)', factor: 0.946352946, tier: 'common', aliases: ['quart', 'quarts', 'qt'] },
      { id: 'pt_us', name: 'US Pint', plural: 'US Pints', symbol: 'pt (US)', factor: 0.473176473, tier: 'common', aliases: ['pint', 'pints', 'pt'] },
      { id: 'pt_uk', name: 'Imperial Pint', plural: 'Imperial Pints', symbol: 'pt (UK)', factor: 0.56826125, tier: 'common', subtitle: '20 fl oz (British pub pint)', badge: 'UK', aliases: ['imperial pint', 'imperial pints', 'uk pint', 'uk pints', 'pt uk', 'pt imp'] },
      { id: 'qt_uk', name: 'Imperial Quart', plural: 'Imperial Quarts', symbol: 'qt (UK)', factor: 1.1365225, tier: 'specialized', subtitle: '40 fl oz (British imperial quart)', badge: 'UK', aliases: ['imperial quart', 'imperial quarts', 'uk quart', 'uk quarts', 'qt uk', 'qt imp'] },
      { id: 'cup_us', name: 'US Cup', plural: 'US Cups', symbol: 'cup', factor: 0.2365882365, tier: 'common', aliases: ['cup', 'cups'] },
      { id: 'floz_us', name: 'US Fluid Ounce', plural: 'US Fluid Ounces', symbol: 'fl oz (US)', factor: 0.0295735295625, tier: 'common', subtitle: 'Liquid ounces (drinks & recipes)', aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz', 'oz', 'ounce', 'ounces', 'fl. oz'] },
      { id: 'tbsp_us', name: 'US Tablespoon', plural: 'US Tablespoons', symbol: 'tbsp', factor: 0.01478676478125, tier: 'common', aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'] },
      { id: 'tsp_us', name: 'US Teaspoon', plural: 'US Teaspoons', symbol: 'tsp', factor: 0.00492892159375, tier: 'common', aliases: ['teaspoon', 'teaspoons', 'tsp'] },
      { id: 'gal_uk', name: 'Imperial Gallon', plural: 'Imperial Gallons', symbol: 'gal (UK)', factor: 4.54609, tier: 'specialized', subtitle: '4.546 L (UK imperial gallon)', badge: 'UK', aliases: ['imperial gallon', 'uk gallon', 'gal uk'] },
      { id: 'floz_uk', name: 'Imperial Fluid Ounce', plural: 'Imperial Fluid Ounces', symbol: 'fl oz (UK)', factor: 0.0284130625, tier: 'specialized', subtitle: '28.41 mL (UK imperial fluid ounce)', badge: 'UK', aliases: ['imperial fluid ounce', 'fl oz uk'] },
      { id: 'bbl_oil', name: 'Oil Barrel', plural: 'Oil Barrels', symbol: 'bbl', factor: 158.987294928, tier: 'specialized', subtitle: '42 US gallons (Crude oil benchmark)', badge: 'Commodities', aliases: ['oil barrel', 'oil barrels', 'barrel of oil', 'bbl', 'bbls', 'crude oil barrel', 'oil bbl', 'barrel of crude'] },
      { id: 'cuft', name: 'Cubic Foot', plural: 'Cubic Feet', symbol: 'ft³', factor: 28.316846592, tier: 'specialized', subtitle: 'Refrigerators & storage', aliases: ['cubic foot', 'cubic feet', 'cu ft', 'cu. ft.', 'ft3', 'ft³'] },
      { id: 'cuyd', name: 'Cubic Yard', plural: 'Cubic Yards', symbol: 'yd³', factor: 764.554857984, tier: 'specialized', subtitle: 'Mulch, concrete & soil', aliases: ['cubic yard', 'cubic yards', 'cu yd', 'cu yds', 'cu. yd.', 'cu. yds.', 'cuyd', 'yd3', 'yd³', 'cubic yd', 'cubic yds'] },
      { id: 'cuin', name: 'Cubic Inch', plural: 'Cubic Inches', symbol: 'in³', factor: 0.016387064, tier: 'specialized', subtitle: 'Engine displacement', aliases: ['cubic inch', 'cubic inches', 'cu in', 'cu. in.', 'in3', 'in³'] },
      { id: 'ul', name: 'Microliter', plural: 'Microliters', symbol: 'µL', factor: 1e-6, tier: 'specialized', subtitle: 'Laboratory pipetting & biology (1 mm³)', badge: 'Lab', aliases: ['microliter', 'microliters', 'microlitre', 'microlitres', 'ul', 'µl'] },
      { id: 'bu', name: 'Bushel (US Dry)', plural: 'Bushels (US Dry)', symbol: 'bu', factor: 35.23907016688, tier: 'specialized', subtitle: 'Agricultural grain trade (wheat, corn)', badge: 'Agri', aliases: ['bushel', 'bushels', 'bu', 'us bushel'] },
    ]
  },
  speed: {
    baseUnit: 'mps',
    units: [
      { id: 'mps', name: 'Meter per Second', plural: 'Meters per Second', symbol: 'm/s', factor: 1, tier: 'common', aliases: ['meter per second', 'meters per second', 'mps', 'm/s'] },
      { id: 'kmh', name: 'Kilometer per Hour', plural: 'Kilometers per Hour', symbol: 'km/h', factor: 1 / 3.6, tier: 'common', aliases: ['kilometer per hour', 'km/h', 'kmh', 'kph'] },
      { id: 'mph', name: 'Mile per Hour', plural: 'Miles per Hour', symbol: 'mph', factor: 0.44704, tier: 'common', aliases: ['mile per hour', 'miles per hour', 'mph'] },
      { id: 'knot', name: 'Knot', plural: 'Knots', symbol: 'kn', factor: 1852 / 3600, tier: 'specialized', subtitle: 'Nautical & aviation speed', badge: 'Maritime', aliases: ['knot', 'knots', 'kn', 'kt'] },
      { id: 'fps', name: 'Foot per Second', plural: 'Feet per Second', symbol: 'ft/s', factor: 0.3048, tier: 'specialized', subtitle: 'Ballistics & projectile motion', aliases: ['foot per second', 'feet per second', 'fps', 'ft/s'] },
      { id: 'mach', name: 'Mach (Standard Sea Level)', plural: 'Mach', symbol: 'Ma', factor: 340.29, tier: 'specialized', subtitle: 'Speed of sound (Sea level)', badge: 'Aero', aliases: ['mach', 'ma'] },
    ]
  },
  time: {
    baseUnit: 's',
    units: [
      { id: 's', name: 'Second', plural: 'Seconds', symbol: 's', factor: 1, tier: 'common', aliases: ['second', 'seconds', 'sec', 's'] },
      { id: 'ms', name: 'Millisecond', plural: 'Milliseconds', symbol: 'ms', factor: 0.001, tier: 'common', aliases: ['millisecond', 'milliseconds', 'ms'] },
      { id: 'us', name: 'Microsecond', plural: 'Microseconds', symbol: 'µs', factor: 1e-6, tier: 'specialized', subtitle: 'Microseconds', aliases: ['microsecond', 'microseconds', 'us', 'µs'] },
      { id: 'ns', name: 'Nanosecond', plural: 'Nanoseconds', symbol: 'ns', factor: 1e-9, tier: 'specialized', subtitle: 'Nanoseconds', aliases: ['nanosecond', 'nanoseconds', 'ns'] },
      { id: 'min', name: 'Minute', plural: 'Minutes', symbol: 'min', factor: 60, tier: 'common', aliases: ['minute', 'minutes', 'min', 'm'] },
      { id: 'h', name: 'Hour', plural: 'Hours', symbol: 'h', factor: 3600, tier: 'common', aliases: ['hour', 'hours', 'hr', 'hrs', 'h'] },
      { id: 'd', name: 'Day', plural: 'Days', symbol: 'd', factor: 86400, tier: 'common', aliases: ['day', 'days', 'd'] },
      { id: 'wk', name: 'Week', plural: 'Weeks', symbol: 'wk', factor: 604800, tier: 'common', aliases: ['week', 'weeks', 'wk', 'wks'] },
      { id: 'mo', name: 'Month (Average)', plural: 'Months', symbol: 'mo', factor: 2629800, tier: 'common', aliases: ['month', 'months', 'mo'] },
      { id: 'yr', name: 'Year (365.25 days)', plural: 'Years', symbol: 'yr', factor: 31557600, tier: 'common', aliases: ['year', 'years', 'yr', 'yrs'] },
      { id: 'dec', name: 'Decade', plural: 'Decades', symbol: 'decade', factor: 315576000, tier: 'specialized', subtitle: 'Decades (10 years)', aliases: ['decade', 'decades'] },
      { id: 'cent', name: 'Century', plural: 'Centuries', symbol: 'century', factor: 3155760000, tier: 'specialized', subtitle: 'Centuries (100 years)', aliases: ['century', 'centuries'] },
    ]
  },
  digital: {
    baseUnit: 'b',
    units: [
      { id: 'b', name: 'Bit', plural: 'Bits', symbol: 'b', factor: 1, tier: 'common', aliases: ['bit', 'bits', 'b'] },
      { id: 'nibble', name: 'Nibble', plural: 'Nibbles', symbol: 'nibble', factor: 4, tier: 'specialized', subtitle: '4 bits / 0.5 byte (Hexadecimal digit)', aliases: ['nibble', 'nibbles', 'nybble', 'nybbles'] },
      { id: 'byte', name: 'Byte', plural: 'Bytes', symbol: 'B', factor: 8, tier: 'common', aliases: ['byte', 'bytes', 'B'] },
      { id: 'kb', name: 'Kilobyte (Decimal)', plural: 'Kilobytes', symbol: 'KB', factor: 8 * 1e3, tier: 'common', aliases: ['kilobyte', 'kilobytes', 'kb'] },
      { id: 'kib', name: 'Kibibyte (Binary)', plural: 'Kibibytes', symbol: 'KiB', factor: 8 * 1024, tier: 'specialized', subtitle: 'Binary standard (Base-2 / 1024)', aliases: ['kibibyte', 'kibibytes', 'kib'] },
      { id: 'mb', name: 'Megabyte (Decimal)', plural: 'Megabytes', symbol: 'MB', factor: 8 * 1e6, tier: 'common', aliases: ['megabyte', 'megabytes', 'mb'] },
      { id: 'mib', name: 'Mebibyte (Binary)', plural: 'Mebibytes', symbol: 'MiB', factor: 8 * (1024 ** 2), tier: 'specialized', subtitle: 'Binary standard (Base-2 / 1024)', aliases: ['mebibyte', 'mebibytes', 'mib'] },
      { id: 'gb', name: 'Gigabyte (Decimal)', plural: 'Gigabytes', symbol: 'GB', factor: 8 * 1e9, tier: 'common', aliases: ['gigabyte', 'gigabytes', 'gb'] },
      { id: 'gib', name: 'Gibibyte (Binary)', plural: 'Gibibytes', symbol: 'GiB', factor: 8 * (1024 ** 3), tier: 'specialized', subtitle: 'Binary standard (Base-2 / 1024)', aliases: ['gibibyte', 'gibibytes', 'gib'] },
      { id: 'tb', name: 'Terabyte (Decimal)', plural: 'Terabytes', symbol: 'TB', factor: 8 * 1e12, tier: 'common', aliases: ['terabyte', 'terabytes', 'tb'] },
      { id: 'tib', name: 'Tebibyte (Binary)', plural: 'Tebibytes', symbol: 'TiB', factor: 8 * (1024 ** 4), tier: 'specialized', subtitle: 'Binary standard (Base-2 / 1024)', aliases: ['tebibyte', 'tebibytes', 'tib'] },
      { id: 'pb', name: 'Petabyte (Decimal)', plural: 'Petabytes', symbol: 'PB', factor: 8 * 1e15, tier: 'specialized', subtitle: 'Petabytes (1,000 TB)', aliases: ['petabyte', 'petabytes', 'pb'] },
      { id: 'pib', name: 'Pebibyte (Binary)', plural: 'Pebibytes', symbol: 'PiB', factor: 8 * (1024 ** 5), tier: 'specialized', subtitle: '1,024 TiB (Binary IEC standard)', aliases: ['pebibyte', 'pebibytes', 'pib'] },
      { id: 'eb', name: 'Exabyte (Decimal)', plural: 'Exabytes', symbol: 'EB', factor: 8 * 1e18, tier: 'specialized', subtitle: '1,000 PB (Cloud & data center scale)', aliases: ['exabyte', 'exabytes', 'eb'] },
      { id: 'eib', name: 'Exbibyte (Binary)', plural: 'Exbibytes', symbol: 'EiB', factor: 8 * (1024 ** 6), tier: 'specialized', subtitle: '1,024 PiB (Binary IEC standard)', aliases: ['exbibyte', 'exbibytes', 'eib'] },
    ]
  },
  data_rate: {
    baseUnit: 'bps',
    units: [
      { id: 'bps', name: 'Bit per Second', plural: 'Bits per Second', symbol: 'bps', factor: 1, tier: 'common', aliases: ['bps', 'bit/s', 'bits per second'] },
      { id: 'kbps', name: 'Kilobit per Second', plural: 'Kilobits per Second', symbol: 'Kbps', factor: 1e3, tier: 'common', aliases: ['kbps', 'kbit/s', 'kilobits per second'] },
      { id: 'mbps', name: 'Megabit per Second', plural: 'Megabits per Second', symbol: 'Mbps', factor: 1e6, tier: 'common', aliases: ['mbps', 'mbit/s', 'megabits per second'] },
      { id: 'gbps', name: 'Gigabit per Second', plural: 'Gigabits per Second', symbol: 'Gbps', factor: 1e9, tier: 'common', aliases: ['gbps', 'gbit/s', 'gigabits per second'] },
      { id: 'tbps', name: 'Terabit per Second', plural: 'Terabits per Second', symbol: 'Tbps', factor: 1e12, tier: 'specialized', subtitle: 'Fiber optic & datacenter backbones', aliases: ['terabit per second', 'terabits per second', 'tbps', 'tbit/s'] },
      { id: 'byps', name: 'Byte per Second', plural: 'Bytes per Second', symbol: 'B/s', factor: 8, tier: 'specialized', subtitle: 'Bytes per second (File transfer rate)', aliases: ['byte per second', 'bytes per second', 'b/s'] },
      { id: 'kbs', name: 'Kilobyte per Second', plural: 'Kilobytes per Second', symbol: 'KB/s', factor: 8 * 1e3, tier: 'specialized', subtitle: 'Kilobytes per second', aliases: ['kb/s', 'kbs', 'kilobytes per second'] },
      { id: 'mbs', name: 'Megabyte per Second', plural: 'Megabytes per Second', symbol: 'MB/s', factor: 8 * 1e6, tier: 'specialized', subtitle: 'Megabytes per second', aliases: ['mb/s', 'mbs', 'megabytes per second'] },
      { id: 'mibs', name: 'Mebibyte per Second', plural: 'Mebibytes per Second', symbol: 'MiB/s', factor: 8 * 1048576, tier: 'specialized', subtitle: 'File copy dialogs & torrent clients', aliases: ['mebibyte per second', 'mebibytes per second', 'mib/s', 'mibs'] },
      { id: 'gbs', name: 'Gigabyte per Second', plural: 'Gigabytes per Second', symbol: 'GB/s', factor: 8 * 1e9, tier: 'specialized', subtitle: 'Gigabytes per second', aliases: ['gb/s', 'gbs', 'gigabytes per second'] },
      { id: 'tbs', name: 'Terabyte per Second', plural: 'Terabytes per Second', symbol: 'TB/s', factor: 8 * 1e12, tier: 'specialized', subtitle: 'GPU memory bandwidth (HBM3e)', aliases: ['terabyte per second', 'terabytes per second', 'tb/s', 'tbs'] },
    ]
  },
  pressure: {
    baseUnit: 'pa',
    units: [
      { id: 'pa', name: 'Pascal', plural: 'Pascals', symbol: 'Pa', factor: 1, tier: 'specialized', subtitle: 'Base SI unit (N/m²)', aliases: ['pascal', 'pascals', 'pa'] },
      { id: 'kpa', name: 'Kilopascal', plural: 'Kilopascals', symbol: 'kPa', factor: 1000, tier: 'common', aliases: ['kilopascal', 'kilopascals', 'kpa'] },
      { id: 'mpa', name: 'Megapascal', plural: 'Megapascals', symbol: 'MPa', factor: 1e6, tier: 'specialized', subtitle: 'Megapascals (Materials engineering)', aliases: ['megapascal', 'megapascals', 'mpa'] },
      { id: 'bar', name: 'Bar', plural: 'Bars', symbol: 'bar', factor: 100000, tier: 'common', aliases: ['bar', 'bars'] },
      { id: 'mbar', name: 'Millibar', plural: 'Millibars', symbol: 'mbar', factor: 100, tier: 'specialized', subtitle: 'Millibars (Barometric pressure)', aliases: ['millibar', 'millibars', 'mbar'] },
      { id: 'psi', name: 'Pound per Square Inch', plural: 'Pounds per Square Inch', symbol: 'psi', factor: 6894.757293168, tier: 'common', aliases: ['psi', 'lb/in2', 'pounds per square inch', 'tire psi', 'tire pressure'] },
      { id: 'ksi', name: 'Kilopound per Square Inch', plural: 'Kilopounds per Square Inch', symbol: 'ksi', factor: 6894757.293168, tier: 'specialized', subtitle: '1,000 psi (Steel tensile strength)', aliases: ['kilopound per square inch', 'ksi', 'kips per square inch', 'kpsi'] },
      { id: 'atm', name: 'Standard Atmosphere', plural: 'Standard Atmospheres', symbol: 'atm', factor: 101325, tier: 'common', aliases: ['atmosphere', 'atmospheres', 'atm'] },
      { id: 'torr', name: 'Torr / mmHg', plural: 'Torr', symbol: 'Torr', factor: 133.322368421, tier: 'specialized', subtitle: 'Torr / mmHg (Vacuum & blood pressure)', aliases: ['torr', 'mmhg', 'millimeter of mercury'] },
      { id: 'inhg', name: 'Inch of Mercury', plural: 'Inches of Mercury', symbol: 'inHg', factor: 3386.389, tier: 'specialized', subtitle: 'Inches of Mercury (Aviation altimeters)', aliases: ['inhg', 'inch of mercury'] },
      { id: 'hpa', name: 'Hectopascal', plural: 'Hectopascals', symbol: 'hPa', factor: 100, tier: 'specialized', subtitle: 'Hectopascals (Meteorology)', aliases: ['hectopascal', 'hectopascals', 'hpa'] },
      { id: 'inh2o', name: 'Inch of Water', plural: 'Inches of Water', symbol: 'inH₂O', factor: 249.08891, tier: 'specialized', subtitle: 'HVAC duct & fan static pressure', badge: 'HVAC', aliases: ['inch of water', 'inches of water', 'inh2o', 'in h2o', 'in wc', 'inwg'] },
      { id: 'cmh2o', name: 'Centimeter of Water', plural: 'Centimeters of Water', symbol: 'cmH₂O', factor: 98.0665, tier: 'specialized', subtitle: 'CPAP & medical respiratory pressure', badge: 'Medical', aliases: ['centimeter of water', 'centimeters of water', 'cmh2o', 'cm h2o', 'cm wc', 'cmwg'] },
    ]
  },
  energy: {
    baseUnit: 'j',
    units: [
      { id: 'j', name: 'Joule', plural: 'Joules', symbol: 'J', factor: 1, tier: 'common', aliases: ['joule', 'joules', 'j'] },
      { id: 'kj', name: 'Kilojoule', plural: 'Kilojoules', symbol: 'kJ', factor: 1000, tier: 'specialized', subtitle: 'Kilojoules', aliases: ['kilojoule', 'kilojoules', 'kj'] },
      { id: 'cal', name: 'Calorie (Gram/Small)', plural: 'Calories', symbol: 'cal', factor: 4.184, tier: 'common', aliases: ['calorie', 'calories', 'cal'] },
      { id: 'kcal', name: 'Kilocalorie (Food Calorie)', plural: 'Kilocalories', symbol: 'kcal', factor: 4184, tier: 'common', aliases: ['kilocalorie', 'kilocalories', 'kcal', 'food calorie', 'food calories', 'diet calorie', 'dietary calorie', 'large calorie', 'cal'] },
      { id: 'wh', name: 'Watt-hour', plural: 'Watt-hours', symbol: 'Wh', factor: 3600, tier: 'common', aliases: ['watt-hour', 'watt hour', 'wh'] },
      { id: 'kwh', name: 'Kilowatt-hour', plural: 'Kilowatt-hours', symbol: 'kWh', factor: 3.6e6, tier: 'common', aliases: ['kilowatt-hour', 'kilowatt hour', 'kwh'] },
      { id: 'mwh', name: 'Megawatt-hour', plural: 'Megawatt-hours', symbol: 'MWh', factor: 3.6e9, tier: 'specialized', subtitle: 'Commercial battery & grid storage (1,000 kWh)', aliases: ['megawatt-hour', 'megawatt-hours', 'megawatthour', 'mwh'] },
      { id: 'ev', name: 'Electronvolt', plural: 'Electronvolts', symbol: 'eV', factor: 1.602176634e-19, tier: 'specialized', subtitle: 'Electronvolts (Particle physics)', aliases: ['electronvolt', 'electronvolts', 'ev'] },
      { id: 'btu', name: 'British Thermal Unit', plural: 'BTU', symbol: 'BTU', factor: 1055.05585262, tier: 'common', aliases: ['btu', 'british thermal unit'] },
      { id: 'therm', name: 'Therm', plural: 'Therms', symbol: 'thm', factor: 105505585.262, tier: 'specialized', subtitle: 'US natural gas utility billing (100,000 BTU)', badge: 'Utilities', aliases: ['therm', 'therms', 'thm', 'us therm', 'gas therm', 'natural gas therm', 'utility therm'] },
      { id: 'ftlb', name: 'Foot-pound', plural: 'Foot-pounds', symbol: 'ft⋅lb', factor: 1.3558179483314, tier: 'specialized', subtitle: 'Foot-pounds (Mechanical work)', aliases: ['foot pound', 'ft lb', 'ft-lb'] },
    ]
  },
  power: {
    baseUnit: 'w',
    units: [
      { id: 'w', name: 'Watt', plural: 'Watts', symbol: 'W', factor: 1, tier: 'common', aliases: ['watt', 'watts', 'w'] },
      { id: 'mw_milli', name: 'Milliwatt', plural: 'Milliwatts', symbol: 'mW', factor: 0.001, tier: 'specialized', subtitle: 'RF transmitters, Wi-Fi & laser output', aliases: ['milliwatt', 'milliwatts', 'mw'] },
      { id: 'kw', name: 'Kilowatt', plural: 'Kilowatts', symbol: 'kW', factor: 1000, tier: 'common', aliases: ['kilowatt', 'kilowatts', 'kw'] },
      { id: 'mw', name: 'Megawatt', plural: 'Megawatts', symbol: 'MW', factor: 1e6, tier: 'specialized', subtitle: 'Megawatts (Power generation)', aliases: ['megawatt', 'megawatts', 'mw'] },
      { id: 'hp', name: 'Horsepower (Mechanical/US)', plural: 'Horsepower', symbol: 'hp', factor: 745.69987158227022, tier: 'common', aliases: ['horsepower', 'hp'] },
      { id: 'hp_metric', name: 'Metric Horsepower (PS)', plural: 'Metric Horsepower', symbol: 'PS', factor: 735.49875, tier: 'specialized', subtitle: 'Metric Horsepower (PS / DIN)', aliases: ['metric horsepower', 'ps', 'cv'] },
      { id: 'btu_h', name: 'BTU per Hour', plural: 'BTU per Hour', symbol: 'BTU/h', factor: 0.29307107, tier: 'specialized', subtitle: 'BTU per hour (Heating / cooling)', aliases: ['btu per hour', 'btu/h', 'btuh'] },
      { id: 'ton_ref', name: 'Ton of Refrigeration', plural: 'Tons of Refrigeration', symbol: 'TR', factor: 3516.8528420667, tier: 'specialized', subtitle: '12,000 BTU/h (AC & heat pump cooling)', badge: 'HVAC', aliases: ['ton of refrigeration', 'tons of refrigeration', 'refrigeration ton', 'refrigeration tons', 'ton ref', 'tr', 'ac ton', 'cooling ton'] },
    ]
  },
  angle: {
    baseUnit: 'deg',
    units: [
      { id: 'deg', name: 'Degree', plural: 'Degrees', symbol: '°', factor: 1, tier: 'common', aliases: ['degree', 'degrees', 'deg', '°'] },
      { id: 'rad', name: 'Radian', plural: 'Radians', symbol: 'rad', factor: 180 / Math.PI, tier: 'common', aliases: ['radian', 'radians', 'rad'] },
      { id: 'grad', name: 'Gradian', plural: 'Gradians', symbol: 'grad', factor: 0.9, tier: 'specialized', subtitle: 'Gradians (100 per right angle)', aliases: ['gradian', 'gradians', 'grad'] },
      { id: 'arcmin', name: 'Arcminute', plural: 'Arcminutes', symbol: 'arcmin', factor: 1 / 60, tier: 'specialized', subtitle: 'Arcminutes (1/60th of a degree)', aliases: ['arcminute', 'arcminutes', 'arcmin', "'"] },
      { id: 'arcsec', name: 'Arcsecond', plural: 'Arcseconds', symbol: 'arcsec', factor: 1 / 3600, tier: 'specialized', subtitle: 'Arcseconds (1/3600th of a degree)', aliases: ['arcsecond', 'arcseconds', 'arcsec', '"'] },
      { id: 'rev', name: 'Revolution (Turn)', plural: 'Revolutions', symbol: 'rev', factor: 360, tier: 'specialized', subtitle: 'Full revolutions (Turns)', aliases: ['revolution', 'revolutions', 'turn', 'turns', 'rev'] },
    ]
  },
  fuel: {
    baseUnit: 'l100km',
    units: [
      {
        id: 'l100km',
        name: 'Liters per 100 km',
        plural: 'Liters per 100 km',
        symbol: 'L/100km',
        tier: 'common',
        toBase: (v) => v,
        fromBase: (v) => v,
        aliases: ['l/100km', 'liters per 100 km', 'litres per 100km']
      },
      {
        id: 'mpg_us',
        name: 'Miles per Gallon (US)',
        plural: 'Miles per Gallon (US)',
        symbol: 'mpg (US)',
        tier: 'common',
        toBase: (v) => (v > 0 ? 235.214583 / v : 0),
        fromBase: (v) => (v > 0 ? 235.214583 / v : 0),
        aliases: ['mpg', 'mpg us', 'miles per gallon']
      },
      {
        id: 'mpg_uk',
        name: 'Miles per Gallon (UK)',
        plural: 'Miles per Gallon (UK)',
        symbol: 'mpg (UK)',
        tier: 'common',
        toBase: (v) => (v > 0 ? 282.4809363 / v : 0),
        fromBase: (v) => (v > 0 ? 282.4809363 / v : 0),
        aliases: ['mpg uk', 'imperial mpg', 'mpg imp']
      },
      {
        id: 'kml',
        name: 'Kilometers per Liter',
        plural: 'Kilometers per Liter',
        symbol: 'km/L',
        tier: 'common',
        toBase: (v) => (v > 0 ? 100 / v : 0),
        fromBase: (v) => (v > 0 ? 100 / v : 0),
        aliases: ['km/l', 'kml', 'kilometers per liter']
      },
      {
        id: 'mi_kwh',
        name: 'Miles per Kilowatt-hour',
        plural: 'Miles per Kilowatt-hour',
        symbol: 'mi/kWh',
        tier: 'common',
        subtitle: 'US electric vehicle efficiency',
        badge: 'EV',
        toBase: (v) => (v > 0 ? 6.9786258 / v : 0),
        fromBase: (v) => (v > 0 ? 6.9786258 / v : 0),
        aliases: ['miles per kwh', 'miles per kilowatt-hour', 'mi/kwh', 'mpkwh', 'mi per kwh', 'ev efficiency', 'electric car mileage']
      },
      {
        id: 'kwh_100km',
        name: 'Kilowatt-hours per 100 km',
        plural: 'Kilowatt-hours per 100 km',
        symbol: 'kWh/100km',
        tier: 'common',
        subtitle: 'European electric vehicle consumption',
        badge: 'EV',
        toBase: (v) => v * 0.1123098,
        fromBase: (v) => (v > 0 ? v / 0.1123098 : 0),
        aliases: ['kwh/100km', 'kwh per 100 km', 'kilowatt-hours per 100 km', 'kwh per 100km', 'ev consumption']
      }
    ]
  },
  cooking: {
    baseUnit: 'ml',
    units: [
      { id: 'ml', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', factor: 1, tier: 'common', aliases: ['ml', 'milliliter', 'milliliters'] },
      { id: 'cup_us', name: 'US Cup', plural: 'US Cups', symbol: 'cup', factor: 236.5882365, tier: 'common', aliases: ['cup', 'cups', 'c'] },
      { id: 'cup_metric', name: 'Metric Cup', plural: 'Metric Cups', symbol: 'cup (metric)', factor: 250, tier: 'common', subtitle: 'Australia, NZ, UK, Canada (250 mL)', badge: 'Metric', aliases: ['metric cup', 'metric cups'] },
      { id: 'tbsp_us', name: 'US Tablespoon', plural: 'US Tablespoons', symbol: 'tbsp', factor: 14.78676478125, tier: 'common', aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs', 'tb'] },
      { id: 'tbsp_metric', name: 'Metric Tablespoon', plural: 'Metric Tablespoons', symbol: 'tbsp (metric)', factor: 15, tier: 'common', subtitle: 'International metric tablespoon (15 mL)', badge: 'Metric', aliases: ['metric tablespoon', 'metric tablespoons', 'metric tbsp'] },
      { id: 'tsp_us', name: 'US Teaspoon', plural: 'US Teaspoons', symbol: 'tsp', factor: 4.92892159375, tier: 'common', aliases: ['teaspoon', 'teaspoons', 'tsp', 't'] },
      { id: 'dsp', name: 'Dessertspoon', plural: 'Dessertspoons', symbol: 'dsp', factor: 10, tier: 'specialized', subtitle: 'British & Commonwealth recipes (2 tsp / 10 mL)', badge: 'UK', aliases: ['dessertspoon', 'dessertspoons', 'dsp', 'dstspn'] },
      { id: 'floz_us', name: 'Fluid Ounce', plural: 'Fluid Ounces', symbol: 'fl oz', factor: 29.5735295625, tier: 'common', subtitle: 'Liquid ounces', aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz', 'oz', 'ounce', 'ounces', 'fl. oz', 'fluid oz'] },
      { id: 'shot', name: 'Standard Shot (Jigger)', plural: 'Standard Shots', symbol: 'shot', factor: 44.36029434375, tier: 'specialized', subtitle: '1.5 US fl oz (Bartending & cocktails)', badge: 'Bar', aliases: ['shot', 'shots', 'jigger', 'jiggers'] },
      { id: 'pinch', name: 'Pinch', plural: 'Pinches', symbol: 'pinch', factor: 0.3080575996, tier: 'specialized', subtitle: '1/16 tsp (Kitchen pinch)', aliases: ['pinch', 'pinches'] },
      { id: 'dash', name: 'Dash', plural: 'Dashes', symbol: 'dash', factor: 0.6161151992, tier: 'specialized', subtitle: '1/8 tsp (Kitchen dash)', aliases: ['dash', 'dashes'] },
      { id: 'tad', name: 'Tad', plural: 'Tads', symbol: 'tad', factor: 1.2322303984, tier: 'specialized', subtitle: '1/4 tsp (Kitchen tad)', aliases: ['tad', 'tads'] },
      { id: 'smidgen', name: 'Smidgen', plural: 'Smidgens', symbol: 'smdg', factor: 0.1540287998, tier: 'specialized', subtitle: '1/32 tsp (0.15 mL)', aliases: ['smidgen', 'smidgens', 'smdg'] },
      { id: 'drop', name: 'Drop', plural: 'Drops', symbol: 'drop', factor: 0.05, tier: 'specialized', subtitle: '0.05 mL (Liquid droplet)', aliases: ['drop', 'drops', 'gtt'] },
      { id: 'stick_butter', name: 'Stick of Butter (US)', plural: 'Sticks of Butter', symbol: 'stick', factor: 118.29411825, tier: 'common', subtitle: '1/2 cup (US butter stick)', aliases: ['stick of butter', 'stick butter', 'butter stick', 'sticks'] },
      { id: 'l', name: 'Liter', plural: 'Liters', symbol: 'L', factor: 1000, tier: 'specialized', subtitle: '1,000 mL', aliases: ['liter', 'liters', 'l'] },
      { id: 'pt_us', name: 'US Pint', plural: 'US Pints', symbol: 'pt', factor: 473.176473, tier: 'specialized', subtitle: 'US Pints (16 fl oz)', aliases: ['pint', 'pints', 'pt'] },
      { id: 'qt_us', name: 'US Quart', plural: 'US Quarts', symbol: 'qt', factor: 946.352946, tier: 'specialized', subtitle: 'US Quarts (32 fl oz)', aliases: ['quart', 'quarts', 'qt'] },
      { id: 'gal_us', name: 'US Gallon', plural: 'US Gallons', symbol: 'gal', factor: 3785.411784, tier: 'specialized', subtitle: 'US Gallons (128 fl oz)', aliases: ['gallon', 'gallons', 'gal'] },
    ]
  },
  frequency: {
    baseUnit: 'hz',
    units: [
      { id: 'hz', name: 'Hertz', plural: 'Hertz', symbol: 'Hz', factor: 1, tier: 'common', subtitle: 'Base SI unit (1 cycle/sec)', aliases: ['hertz', 'hz', 'cycle per second', 'cycles per second', 'cps'] },
      { id: 'khz', name: 'Kilohertz', plural: 'Kilohertz', symbol: 'kHz', factor: 1e3, tier: 'common', subtitle: 'Audio & AM radio (1,000 Hz)', aliases: ['kilohertz', 'khz'] },
      { id: 'mhz', name: 'Megahertz', plural: 'Megahertz', symbol: 'MHz', factor: 1e6, tier: 'common', subtitle: 'FM radio, clock frequencies (10^6 Hz)', aliases: ['megahertz', 'mhz'] },
      { id: 'ghz', name: 'Gigahertz', plural: 'Gigahertz', symbol: 'GHz', factor: 1e9, tier: 'common', subtitle: 'CPUs, Wi-Fi & 5G cellular (10^9 Hz)', badge: 'Computing', aliases: ['gigahertz', 'ghz'] },
      { id: 'thz', name: 'Terahertz', plural: 'Terahertz', symbol: 'THz', factor: 1e12, tier: 'specialized', subtitle: 'Infrared & spectroscopy (10^12 Hz)', badge: 'Optics', aliases: ['terahertz', 'thz'] },
      { id: 'rpm', name: 'Revolutions per Minute', plural: 'Revolutions per Minute', symbol: 'RPM', factor: 1 / 60, tier: 'common', subtitle: 'Motor & engine rotation', badge: 'Automotive', aliases: ['revolutions per minute', 'revolution per minute', 'rpm', 'rev/min', 'rotations per minute', 'motor rpm', 'engine rpm'] },
      { id: 'rad_s', name: 'Radians per Second', plural: 'Radians per Second', symbol: 'rad/s', factor: 1 / (2 * Math.PI), tier: 'specialized', subtitle: 'Angular velocity (ω = 2πf)', badge: 'Physics', aliases: ['radians per second', 'radian per second', 'rad/s', 'rad per sec', 'rad/sec', 'angular velocity'] },
      { id: 'deg_s', name: 'Degrees per Second', plural: 'Degrees per Second', symbol: '°/s', factor: 1 / 360, tier: 'specialized', subtitle: 'Gyroscopes & rotational tracking', badge: 'Sensors', aliases: ['degrees per second', 'degree per second', 'deg/s', 'deg per sec', 'deg/sec', 'rotational rate'] },
    ]
  },
  torque: {
    baseUnit: 'nm',
    units: [
      { id: 'nm', name: 'Newton-meter', plural: 'Newton-meters', symbol: 'N·m', factor: 1, tier: 'common', subtitle: 'SI metric standard', badge: 'Metric', aliases: ['newton meter', 'newton meters', 'newton-meter', 'newton-meters', 'newton metre', 'newton metres', 'nm', 'n*m', 'n-m', 'n.m'] },
      { id: 'ftlb', name: 'Pound-foot', plural: 'Pound-feet', symbol: 'lb-ft', factor: 1.3558179483314004, tier: 'common', subtitle: 'US automotive lug nuts & engine specs', badge: 'Automotive', aliases: ['pound foot', 'pound feet', 'pound-foot', 'pound-feet', 'foot pound', 'foot pounds', 'foot-pound', 'foot-pounds', 'ft lb', 'ft-lb', 'ftlb', 'ft-lbs', 'ft lbs', 'lbf ft', 'lbf-ft', 'lb ft', 'lb-ft', 'lug nut torque', 'wheel torque'] },
      { id: 'inlb', name: 'Pound-inch', plural: 'Pound-inches', symbol: 'lb-in', factor: 0.1129848290276167, tier: 'common', subtitle: 'Bicycle torque & small fasteners', badge: 'Bicycle', aliases: ['pound inch', 'pound inches', 'pound-inch', 'pound-inches', 'inch pound', 'inch pounds', 'inch-pound', 'inch-pounds', 'in lb', 'in-lb', 'inlb', 'in-lbs', 'in lbs', 'lbf in', 'lbf-in', 'lb in', 'lb-in', 'bike torque'] },
      { id: 'kgfm', name: 'Kilogram-force Meter', plural: 'Kilogram-force Meters', symbol: 'kgf·m', factor: 9.80665, tier: 'specialized', subtitle: 'European & Japanese legacy specs (9.807 N·m)', aliases: ['kilogram-force meter', 'kilogram force meter', 'kilogram-force meters', 'kilogram force meters', 'kgf m', 'kgf-m', 'kgfm', 'kg-m', 'kg m'] },
      { id: 'knm', name: 'Kilonewton-meter', plural: 'Kilonewton-meters', symbol: 'kN·m', factor: 1000, tier: 'specialized', subtitle: 'Heavy industrial, wind turbines & structural', badge: 'Heavy Industry', aliases: ['kilonewton meter', 'kilonewton meters', 'kilonewton-meter', 'kilonewton-meters', 'knm', 'kn-m', 'kn m', 'kn*m'] },
      { id: 'ozin', name: 'Ounce-force Inch', plural: 'Ounce-force Inches', symbol: 'oz-in', factor: 0.007061551814226044, tier: 'specialized', subtitle: 'Stepper motors, RC servos & robotics', badge: 'Robotics', aliases: ['ounce-force inch', 'ounce force inch', 'ounce-force inches', 'ounce force inches', 'inch ounce', 'inch ounces', 'oz in', 'oz-in', 'ozin', 'ozf in', 'ozf-in', 'servo torque', 'stepper torque'] },
    ]
  },
  force: {
    baseUnit: 'n',
    units: [
      { id: 'n', name: 'Newton', plural: 'Newtons', symbol: 'N', factor: 1, tier: 'common', subtitle: 'SI metric standard (1 kg⋅m/s²)', aliases: ['newton', 'newtons', 'n'] },
      { id: 'kn', name: 'Kilonewton', plural: 'Kilonewtons', symbol: 'kN', factor: 1000, tier: 'common', subtitle: 'Climbing gear & aerospace rocketry', badge: 'Engineering', aliases: ['kilonewton', 'kilonewtons', 'kn'] },
      { id: 'mn', name: 'Meganewton', plural: 'Meganewtons', symbol: 'MN', factor: 1e6, tier: 'specialized', subtitle: 'Rocket thrust & mega-structures', badge: 'Aerospace', aliases: ['meganewton', 'meganewtons', 'mn'] },
      { id: 'lbf', name: 'Pound-force', plural: 'Pounds-force', symbol: 'lbf', factor: 4.4482216152605, tier: 'common', subtitle: 'US engineering standard (1 lb × g)', aliases: ['pound force', 'pounds force', 'pound-force', 'pounds-force', 'lbf', 'lbs force', 'lb force'] },
      { id: 'kgf', name: 'Kilogram-force', plural: 'Kilograms-force', symbol: 'kgf', factor: 9.80665, tier: 'common', subtitle: 'Metric technical unit (kilopond)', aliases: ['kilogram-force', 'kilogram force', 'kilograms-force', 'kilograms force', 'kgf', 'kp', 'kilopond', 'kiloponds'] },
      { id: 'dyn', name: 'Dyne', plural: 'Dynes', symbol: 'dyn', factor: 1e-5, tier: 'specialized', subtitle: 'CGS physics standard (1 g⋅cm/s²)', aliases: ['dyne', 'dynes', 'dyn'] },
      { id: 'kip', name: 'Kip', plural: 'Kips', symbol: 'kip', factor: 4448.2216152605, tier: 'specialized', subtitle: '1,000 lbf (Civil & structural engineering)', badge: 'Engineering', aliases: ['kip', 'kips', 'kilopound force'] },
      { id: 'ozf', name: 'Ounce-force', plural: 'Ounces-force', symbol: 'ozf', factor: 0.27801385095378125, tier: 'specialized', subtitle: 'Precision small mechanisms & springs', aliases: ['ounce-force', 'ounce force', 'ounces-force', 'ounces force', 'ozf'] },
    ]
  },
  flow_rate: {
    baseUnit: 'm3_s',
    units: [
      { id: 'cfm', name: 'Cubic Feet per Minute', plural: 'Cubic Feet per Minute', symbol: 'CFM', factor: 0.0004719474432, tier: 'common', subtitle: 'HVAC airflow & PC cooling fans', badge: 'HVAC', aliases: ['cubic feet per minute', 'cubic foot per minute', 'cfm', 'cu ft/min', 'cu ft per min', 'airflow cfm'] },
      { id: 'l_s', name: 'Liter per Second', plural: 'Liters per Second', symbol: 'L/s', factor: 0.001, tier: 'common', subtitle: 'Plumbing & hydraulic flows', aliases: ['liter per second', 'liters per second', 'litre per second', 'litres per second', 'l/s', 'lps'] },
      { id: 'l_min', name: 'Liter per Minute', plural: 'Liters per Minute', symbol: 'L/min', factor: 0.001 / 60, tier: 'common', subtitle: 'Medical oxygen & tap water flow', aliases: ['liter per minute', 'liters per minute', 'litre per minute', 'litres per minute', 'l/min', 'lpm'] },
      { id: 'm3_h', name: 'Cubic Meter per Hour', plural: 'Cubic Meters per Hour', symbol: 'm³/h', factor: 1 / 3600, tier: 'common', subtitle: 'Industrial ventilation & pumps', aliases: ['cubic meter per hour', 'cubic meters per hour', 'cubic metre per hour', 'cubic metres per hour', 'm3/h', 'm3h', 'm³/h'] },
      { id: 'm3_s', name: 'Cubic Meter per Second', plural: 'Cubic Meters per Second', symbol: 'm³/s', factor: 1, tier: 'specialized', subtitle: 'SI base unit (Hydroelectric & river discharge)', aliases: ['cubic meter per second', 'cubic meters per second', 'cubic metre per second', 'cubic metres per second', 'm3/s', 'm3s', 'm³/s'] },
      { id: 'gpm_us', name: 'US Gallon per Minute', plural: 'US Gallons per Minute', symbol: 'GPM', factor: 0.003785411784 / 60, tier: 'common', subtitle: 'US plumbing, pumps & fire hydrants', badge: 'Plumbing', aliases: ['gallons per minute', 'gallon per minute', 'gpm', 'gpm_us', 'us gpm', 'water gpm'] },
      { id: 'gph_us', name: 'US Gallon per Hour', plural: 'US Gallons per Hour', symbol: 'GPH', factor: 0.003785411784 / 3600, tier: 'specialized', subtitle: 'Fuel consumption & aquarium filtration', aliases: ['gallons per hour', 'gallon per hour', 'gph', 'gph_us', 'us gph'] },
    ]
  },
  typography: {
    baseUnit: 'px',
    units: [
      { id: 'px', name: 'Pixel', plural: 'Pixels', symbol: 'px', factor: 1, tier: 'common', subtitle: 'CSS digital display baseline (96 DPI)', aliases: ['pixel', 'pixels', 'px'] },
      { id: 'pt', name: 'Point', plural: 'Points', symbol: 'pt', factor: 96 / 72, tier: 'common', subtitle: '1/72 inch (Print, typography & iOS font size)', badge: 'Print', aliases: ['point', 'points', 'pt', 'font point', 'font points'] },
      { id: 'rem', name: 'Rem', plural: 'Rems', symbol: 'rem', factor: 16, tier: 'common', subtitle: 'Root em (16 px browser standard)', badge: 'Web', aliases: ['rem', 'rems', 'root em', 'root rem'] },
      { id: 'em', name: 'Em', plural: 'Ems', symbol: 'em', factor: 16, tier: 'common', subtitle: 'Relative font size (16 px standard)', badge: 'Web', aliases: ['em', 'ems'] },
      { id: 'pc', name: 'Pica', plural: 'Picas', symbol: 'pc', factor: 16, tier: 'specialized', subtitle: '12 points / 16 px (Book & editorial typesetting)', badge: 'Print', aliases: ['pica', 'picas', 'pc'] },
      { id: 'in_css', name: 'CSS Inch', plural: 'CSS Inches', symbol: 'in (CSS)', factor: 96, tier: 'specialized', subtitle: '96 CSS pixels (CSS Print spec)', aliases: ['css inch', 'css inches', 'css in', 'in css'] },
      { id: 'mm_css', name: 'CSS Millimeter', plural: 'CSS Millimeters', symbol: 'mm (CSS)', factor: 96 / 25.4, tier: 'specialized', subtitle: '3.78 px (CSS Print spec)', aliases: ['css mm', 'css millimeter', 'css millimeters', 'mm css'] },
    ]
  },
  current: {
    baseUnit: 'a',
    units: [
      { id: 'a', name: 'Ampere', plural: 'Amperes', symbol: 'A', factor: 1, tier: 'common', subtitle: 'Base SI unit of electric current (1 C/s)', aliases: ['ampere', 'amperes', 'amp', 'amps', 'a'] },
      { id: 'ma', name: 'Milliampere', plural: 'Milliamperes', symbol: 'mA', factor: 0.001, tier: 'common', subtitle: 'Electronics & microcontroller circuits', badge: 'Electronics', aliases: ['milliampere', 'milliamperes', 'milliamp', 'milliamps', 'ma'] },
      { id: 'ua', name: 'Microampere', plural: 'Microamperes', symbol: 'µA', factor: 1e-6, tier: 'specialized', subtitle: 'Low-power standby & IoT sensors (10⁻⁶ A)', badge: 'IoT', aliases: ['microampere', 'microamperes', 'microamp', 'microamps', 'ua', 'µa', 'uA', 'µA'] },
      { id: 'ka', name: 'Kiloampere', plural: 'Kiloamperes', symbol: 'kA', factor: 1000, tier: 'specialized', subtitle: 'Power grids & lightning discharges', badge: 'Power Grid', aliases: ['kiloampere', 'kiloamperes', 'kiloamp', 'kiloamps', 'ka'] },
      { id: 'ah', name: 'Ampere-hour', plural: 'Ampere-hours', symbol: 'Ah', factor: 1, tier: 'common', subtitle: 'Battery capacity over 1 hour (3,600 C)', badge: 'Battery', aliases: ['ampere hour', 'ampere hours', 'ampere-hour', 'ampere-hours', 'amp hour', 'amp hours', 'ah'] },
      { id: 'mah', name: 'Milliampere-hour', plural: 'Milliampere-hours', symbol: 'mAh', factor: 0.001, tier: 'common', subtitle: 'Phone, laptop & power bank battery capacity', badge: 'Battery', aliases: ['milliampere hour', 'milliampere hours', 'milliampere-hour', 'milliampere-hours', 'milliamp hour', 'milliamp hours', 'mah'] },
      { id: 'ab_a', name: 'Abampere (Biot)', plural: 'Abamperes', symbol: 'abA', factor: 10, tier: 'specialized', subtitle: '10 Amperes (Electromagnetic CGS unit)', aliases: ['abampere', 'abamperes', 'biot', 'aba'] },
      { id: 'stat_a', name: 'Statampere', plural: 'Statamperes', symbol: 'statA', factor: 1 / 2997924580, tier: 'specialized', subtitle: 'Electrostatic CGS unit (~0.334 nA)', aliases: ['statampere', 'statamperes', 'stata'] },
    ]
  },
  illuminance: {
    baseUnit: 'lx',
    units: [
      { id: 'lx', name: 'Lux', plural: 'Lux', symbol: 'lx', factor: 1, tier: 'common', subtitle: 'SI standard illuminance (1 lumen/m²)', aliases: ['lux', 'lx', 'lumen per square meter', 'lumens per square meter'] },
      { id: 'fc', name: 'Foot-candle', plural: 'Foot-candles', symbol: 'fc', factor: 1 / 0.09290304, tier: 'common', subtitle: 'US architectural & photography lighting (1 lm/ft²)', badge: 'Lighting', aliases: ['foot candle', 'foot candles', 'foot-candle', 'foot-candles', 'fc', 'ft-c', 'ftc'] },
      { id: 'ph', name: 'Phot', plural: 'Phots', symbol: 'ph', factor: 10000, tier: 'specialized', subtitle: 'CGS optical standard (10,000 lux / 1 lm/cm²)', aliases: ['phot', 'phots', 'ph'] },
      { id: 'nox', name: 'Nox', plural: 'Nox', symbol: 'nox', factor: 0.001, tier: 'specialized', subtitle: 'Night vision & astronomy optics (1 millilux)', badge: 'Optics', aliases: ['nox', 'millilux'] },
      { id: 'klx', name: 'Kilolux', plural: 'Kilolux', symbol: 'klx', factor: 1000, tier: 'specialized', subtitle: 'Direct sunlight & greenhouse horticulture', badge: 'Solar', aliases: ['kilolux', 'klx', 'kilo lux'] },
    ]
  }
};

/**
 * Retrieves category definition across standard measurement domains.
 */
export function getCategory(categoryId) {
  if (!categoryId) return null;
  const clean = String(categoryId).trim().toLowerCase();
  return CATEGORIES.find((c) => c.id === clean) || null;
}

/**
 * Returns the unit definition object by category and unit ID.
 */
export function getUnit(categoryId, unitId) {
  const cat = UNIT_DEFINITIONS[categoryId];
  if (!cat) return null;
  return cat.units.find((u) => u.id === unitId) || null;
}

/**
 * Returns all units for a category.
 */
export function getUnitsForCategory(categoryId) {
  const cat = UNIT_DEFINITIONS[categoryId];
  return cat ? cat.units : [];
}

/**
 * Returns whether a unit belongs to the specialized/trade tier.
 */
export function isSpecializedUnit(unit) {
  return unit?.tier === 'specialized';
}

/**
 * Returns all common/everyday units for a category (tier !== 'specialized').
 */
export function getCommonUnitsForCategory(categoryId) {
  const units = getUnitsForCategory(categoryId);
  return units.filter((u) => u.tier !== 'specialized');
}

/**
 * Returns all specialized/trade units for a category (tier === 'specialized').
 */
export function getSpecializedUnitsForCategory(categoryId) {
  const units = getUnitsForCategory(categoryId);
  return units.filter((u) => u.tier === 'specialized');
}

/**
 * High-precision conversion between two units in the same category.
 * @param {number} value
 * @param {string} categoryId
 * @param {string} fromUnitId
 * @param {string} toUnitId
 * @returns {number|null}
 */
export function convertUnits(value, categoryId, fromUnitId, toUnitId) {
  if (value === null || value === undefined || isNaN(value)) return null;
  if (fromUnitId === toUnitId) return Number(value);

  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);

  if (!fromUnit || !toUnit) return null;

  // Convert to base
  let baseValue;
  if (typeof fromUnit.toBase === 'function') {
    baseValue = fromUnit.toBase(Number(value));
  } else if (fromUnit.factor !== undefined) {
    baseValue = Number(value) * fromUnit.factor;
  } else {
    return null;
  }

  // Convert from base
  let targetValue;
  if (typeof toUnit.fromBase === 'function') {
    targetValue = toUnit.fromBase(baseValue);
  } else if (toUnit.factor !== undefined) {
    targetValue = baseValue / toUnit.factor;
  } else {
    return null;
  }

  return targetValue;
}

/**
 * Format numeric output cleanly without floating point weirdness (e.g. 0.30000000000000004).
 * Supports smart adaptive precision ('auto') or user-specified fixed decimal places.
 *
 * In 'auto' mode:
 * - Extremely large (>= 1e14) or tiny (< 1e-6) numbers format in scientific notation.
 * - Small numbers (< 1) guarantee at least 4 significant figures so they NEVER round to 0.
 * - Standard human-scale numbers (< 1,000) round to at most 4 decimals, stripping trailing zeros.
 * - Large numbers (>= 1,000) cap at 2 decimal places to maintain readability.
 * - Temperature conversions round to at most 2 decimal places for clean display.
 */
/**
 * Convert a decimal number to a practical mixed or improper fraction string.
 * e.g., 1.375 -> "1 3/8" (mixed) or "11/8" (improper), 0.75 -> "3/4", 2 -> "2"
 * High-precision algorithm accurately resolves exact rational conversions across all domains
 * (e.g., 1/8000 for Mbps to GB/s, 1/60 for sec to min, 1/3600 for sec to hr,
 * 1/12 for in to ft, 1/5280 for ft to mi, 1/1000 for mm to m, 1/1024 for B to KiB)
 * while also snapping continuous measurements to nearest tape increments (1/16, 1/32, 1/64)
 * and thirds (1/3, 2/3).
 */
export function toFraction(val, maxDenominator = 32, improper = false) {
  if (val === null || val === undefined || isNaN(val)) return '';
  const num = Number(val);
  if (!isFinite(num)) return num.toString();
  if (num === 0) return '0';

  const isNeg = num < 0;
  const abs = Math.abs(num);
  const whole = Math.floor(abs);
  const frac = abs - whole;

  // Exact or near-exact whole number
  if (frac < 1e-9) {
    return (isNeg ? '-' : '') + whole.toString();
  }
  if (frac > 1 - 1e-9) {
    return (isNeg ? '-' : '') + (whole + 1).toString();
  }

  // 1. Exact reciprocal integer unit fraction (e.g. 1/8000, 1/1000, 1/1024, 1/3600, 1/60, 1/12, 1/5280, 1/63360, 1/7, 1/24, 1/384, 1/768)
  const inv = 1 / frac;
  const roundInv = Math.round(inv);
  if (roundInv >= 1 && roundInv <= 10000000 && Math.abs(inv - roundInv) < 1e-5) {
    if (improper && whole > 0) {
      const impNum = whole * roundInv + 1;
      return (isNeg ? '-' : '') + impNum + '/' + roundInv;
    }
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + '1/' + roundInv;
  }

  // 2. Common thirds check within 0.015 tolerance (e.g. 1/3 ~ 0.3333, 2/3 ~ 0.6667)
  if (Math.abs(frac - 1 / 3) < 0.015) {
    if (improper && whole > 0) return (isNeg ? '-' : '') + (whole * 3 + 1) + '/3';
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + '1/3';
  }
  if (Math.abs(frac - 2 / 3) < 0.015) {
    if (improper && whole > 0) return (isNeg ? '-' : '') + (whole * 3 + 2) + '/3';
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + '2/3';
  }

  // 3. Check tape measure binary denominators (2, 4, 8, 16, 32, 64) with snap tolerance of 0.0045
  // (matches 1.375 -> 3/8, 1.37795 -> 3/8, 1.251 -> 1/4, 1 m to ft = 3.28084 -> 9/32)
  const effectiveMaxDenom = maxDenominator || 32;
  let bestTapeNum = 0;
  let bestTapeDenom = 1;
  let minTapeDiff = Infinity;

  for (let denom = 2; denom <= effectiveMaxDenom; denom *= 2) {
    const numerator = Math.round(frac * denom);
    if (numerator <= 0 || numerator >= denom) continue;
    const diff = Math.abs(frac - numerator / denom);
    if (diff < minTapeDiff) {
      minTapeDiff = diff;
      bestTapeNum = numerator;
      bestTapeDenom = denom;
      if (diff < 0.0001) break;
    }
  }

  if (bestTapeNum > 0 && minTapeDiff < 0.0045) {
    const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
    const common = gcd(bestTapeNum, bestTapeDenom);
    const redNum = bestTapeNum / common;
    const redDen = bestTapeDenom / common;

    if (improper && whole > 0) {
      const impNum = whole * redDen + redNum;
      return (isNeg ? '-' : '') + impNum + '/' + redDen;
    }
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + redNum + '/' + redDen;
  }

  // 4. Exact rational multiples (e.g. 3/8000, 7/8000, 5/12, 11/8000, 3/128)
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = frac;
  let exactMatch = null;

  for (let iter = 0; iter < 20; iter++) {
    const a = Math.floor(b);
    const h = a * h1 + h2;
    const k = a * k1 + k2;
    if (k > 10000000) break;

    h2 = h1; h1 = h;
    k2 = k1; k1 = k;

    const rem = b - a;
    const diff = Math.abs(frac - h1 / k1);
    if (rem < 1e-10 || diff < 1e-12) {
      exactMatch = { num: h1, den: k1 };
      break;
    }

    b = 1 / rem;
    if (!isFinite(b)) break;
  }

  if (exactMatch) {
    const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(exactMatch.num, exactMatch.den);
    const redNum = exactMatch.num / g;
    const redDen = exactMatch.den / g;

    if (frac < 0.005 && effectiveMaxDenom <= 64) {
      const isClean =
        redNum <= 50 &&
        redDen <= 10000 &&
        (redDen <= 64 ||
          (redDen & (redDen - 1)) === 0 ||
          redDen % 100 === 0 ||
          3600 % redDen === 0 ||
          5280 % redDen === 0 ||
          8000 % redDen === 0);
      if (!isClean) {
        return whole > 0 ? (isNeg ? '-' : '') + whole : '0';
      }
    }

    if (improper && whole > 0) {
      const impNum = whole * redDen + redNum;
      return (isNeg ? '-' : '') + impNum + '/' + redDen;
    }
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + redNum + '/' + redDen;
  }

  // 5. Tape measure fallback (if bestTapeNum > 0)
  if (bestTapeNum > 0) {
    const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
    const common = gcd(bestTapeNum, bestTapeDenom);
    const redNum = bestTapeNum / common;
    const redDen = bestTapeDenom / common;

    if (improper && whole > 0) {
      const impNum = whole * redDen + redNum;
      return (isNeg ? '-' : '') + impNum + '/' + redDen;
    }
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + redNum + '/' + redDen;
  }

  // Fallback for near-whole
  if (frac < 0.005) {
    return whole > 0 ? (isNeg ? '-' : '') + whole : '0';
  }
  if (frac > 0.995) {
    return (isNeg ? '-' : '') + (whole + 1).toString();
  }

  return whole > 0 ? (isNeg ? '-' : '') + whole : '0';
}

/**
 * Convert a decimal number to a standard imperial tape measure graduation string.
 * Snaps to the nearest 1/32" mark on a physical tape measure.
 * Even 32nds simplify directly to the nearest 1/16", 1/8", 1/4", 1/2", or whole inch.
 * Odd 32nds display using the landmark 8th/whole inch mark with a +/- 1/32" offset
 * (e.g. "3 3/8 +1/32", "3 3/8 -1/32", "1/32", "4 -1/32").
 *
 * @param {number|string} val
 * @returns {string} e.g. "1/16", "3 3/8 +1/32", "1 3/8", "0"
 */
export function toTapeMeasureFraction(val) {
  if (val === null || val === undefined || isNaN(val)) return '';
  const num = Number(val);
  if (!isFinite(num)) return num.toString();
  if (num === 0) return '0';

  const isNeg = num < 0;
  const abs = Math.abs(num);
  let whole = Math.floor(abs);
  const frac = abs - whole;

  const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
  const reduce = (n, d) => {
    const g = gcd(n, d);
    return `${n / g}/${d / g}`;
  };

  // Round to nearest 1/32"
  const units32 = Math.round(frac * 32);

  if (units32 === 0) {
    return whole > 0 ? (isNeg ? '-' : '') + whole.toString() : '0';
  }
  if (units32 === 32) {
    whole += 1;
    return (isNeg ? '-' : '') + whole.toString();
  }

  // Even 32nd: exact 16th (or 8th, quarter, half)
  if (units32 % 2 === 0) {
    const fracStr = reduce(units32, 32);
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + fracStr;
  }

  // Odd 32nd: landmark 8th/whole mark with +/- 1/32 offset
  // Landmark is nearest multiple of 4 on a 32nd scale (an 8th mark: 0, 4, 8, 12, 16, 20, 24, 28, 32)
  const landmark32 = Math.round(units32 / 4) * 4;
  const offset = units32 - landmark32;
  const offsetSign = offset > 0 ? '+' : '-';

  if (landmark32 === 0) {
    // 1/32: first tick line on the tape
    const wStr = whole > 0 ? whole + ' ' : '';
    return (isNeg ? '-' : '') + wStr + '1/32';
  }

  if (landmark32 === 32) {
    // 31/32: one tick line before the next whole inch
    return (isNeg ? '-' : '') + (whole + 1) + ' -1/32';
  }

  const landmarkFrac = reduce(landmark32, 32);
  const wStr = whole > 0 ? whole + ' ' : '';
  return (isNeg ? '-' : '') + wStr + landmarkFrac + ' ' + offsetSign + '1/32';
}

export const VULGAR_FRACTIONS = {
  '½': 1 / 2,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '¼': 1 / 4,
  '¾': 3 / 4,
  '⅕': 1 / 5,
  '⅖': 2 / 5,
  '⅗': 3 / 5,
  '⅘': 4 / 5,
  '⅙': 1 / 6,
  '⅚': 5 / 6,
  '⅛': 1 / 8,
  '⅜': 3 / 8,
  '⅝': 5 / 8,
  '⅞': 7 / 8,
};

export const FRACTION_TO_VULGAR = {
  '1/2': '½',
  '1/3': '⅓',
  '2/3': '⅔',
  '1/4': '¼',
  '3/4': '¾',
  '1/5': '⅕',
  '2/5': '⅖',
  '3/5': '⅗',
  '4/5': '⅘',
  '1/6': '⅙',
  '5/6': '⅚',
  '1/8': '⅛',
  '3/8': '⅜',
  '5/8': '⅝',
  '7/8': '⅞',
};

export const VULGAR_TO_FRACTION = {
  '½': '1/2',
  '⅓': '1/3',
  '⅔': '2/3',
  '¼': '1/4',
  '¾': '3/4',
  '⅕': '1/5',
  '⅖': '2/5',
  '⅗': '3/5',
  '⅘': '4/5',
  '⅙': '1/6',
  '⅚': '5/6',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

/**
 * Check if a value represents or contains a fraction (slash, vulgar glyph, or mixed fraction).
 */
export function isFractionLike(val) {
  if (val === null || val === undefined || val === '') return false;
  const s = String(val).trim();
  return (
    s.includes('/') ||
    s.includes('⁄') ||
    Object.keys(VULGAR_FRACTIONS).some((g) => s.includes(g)) ||
    /^[+-]?\d+\s*-\s*\d+\/\d+/.test(s)
  );
}

/**
 * Check if a string represents a compound measurement (e.g. "5 ft 10 in", "4ft5in", "5'11\"", "2 lbs 4 oz", "1 hr 30 min").
 */
export function isCompoundLike(val) {
  if (val === null || val === undefined || val === '') return false;
  const s = String(val).trim();
  if (!s) return false;
  if (/'|"/.test(s)) return true;

  // Separate stuck digits and letters/symbols so word boundaries match:
  // e.g. "4ft5in" -> "4 ft 5 in", "2lbs4oz" -> "2 lbs 4 oz", "1hr30m" -> "1 hr 30 m"
  const normalized = s
    .replace(/(\d)([a-zµ°'"])/gi, '$1 $2')
    .replace(/([a-zµ°'"])([-+]?\d)/gi, '$1 $2');

  return (
    /'|"/.test(normalized) ||
    /\b(?:ft|feet|foot|in|inch|inches|yd|yard|yards|mi|mile|miles|lb|lbs|pound|pounds|oz|ounce|ounces|st|stone|stones|ton|tons|hr|hrs|hour|hours|min|mins|minute|minutes|sec|secs|second|seconds|gal|gallon|gallons|qt|quart|quarts|pt|pint|pints|cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|cm|mm|km|meter|meters)\b/i.test(normalized) ||
    /\d+\s*[hmsd]\s*\d+\s*[hmsd]/i.test(normalized)
  );
}

/**
 * Format a compound measurement string cleanly for display in equations and labels.
 * Formats unspaced "4ft5in" -> "4 ft 5 in", "2lbs4oz" -> "2 lbs 4 oz", "5'10\"" -> "5 ft 10 in".
 *
 * @param {string} val
 * @returns {string}
 */
export function formatCompoundForDisplay(val) {
  if (val === null || val === undefined || val === '') return '';
  let s = String(val).trim();
  if (!s) return '';

  // Normalize quotes: 5'10" or 5' 10" -> 5 ft 10 in
  s = s.replace(/(\d+)\s*'\s*(\d+)\s*(?:"|''|in|inches|inch)?/gi, (m, f, i) => `${f} ft ${i ? `${i} in` : ''}`);
  s = s.replace(/(\d+)\s*'\s*$/g, '$1 ft');
  s = s.replace(/(\d+)\s*(?:"|'')$/g, '$1 in');

  // Separate stuck digits and letters/symbols
  s = s
    .replace(/(\d)([a-zµ°])/gi, '$1 $2')
    .replace(/([a-zµ°])([-+]?\d)/gi, '$1 $2');

  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/**
 * Format a fraction string or compound measurement for clean, unambiguous human display.
 * - Transforms mixed fractions like "1 3/8" into "1 ⅜" and "3/4" into "¾".
 * - For 16ths/32nds without single Unicode glyphs, formats as "1-13/16" to eliminate
 *   the visual optical illusion where "1 13/16" or "1 3/8" looks like "13/8" in bold text.
 * - Preserves improper fractions like "11/8" and "3/2" as standard mathematical improper fractions.
 *
 * @param {string|number} val
 * @returns {string}
 */
export function formatFractionForDisplay(val) {
  if (val === null || val === undefined || val === '') return '';
  let s = String(val).trim();
  if (!s) return '';

  // If already contains vulgar glyphs, return as-is
  if (Object.keys(VULGAR_FRACTIONS).some((g) => s.includes(g))) {
    return s;
  }

  // 1. Direct match: single mixed fraction e.g. "1 3/8", "-1 3/8", "1-3/8"
  const mixedMatch = s.match(/^([+-]?\d+)\s*[- ]\s*(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const isNeg = mixedMatch[1].startsWith('-');
    const whole = Math.abs(parseInt(mixedMatch[1], 10));
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    const fracKey = `${num}/${den}`;

    if (FRACTION_TO_VULGAR[fracKey]) {
      return `${isNeg ? '-' : ''}${whole} ${FRACTION_TO_VULGAR[fracKey]}`;
    }
    // For non-vulgar denominators (e.g. 16, 32), format with clear hyphen
    return `${isNeg ? '-' : ''}${whole}-${num}/${den}`;
  }

  // 2. Direct match: simple fraction e.g. "3/4", "-1/2", "13/16", "11/8"
  const simpleMatch = s.match(/^([+-]?)(\d+)\/(\d+)$/);
  if (simpleMatch) {
    const sign = simpleMatch[1];
    const num = parseInt(simpleMatch[2], 10);
    const den = parseInt(simpleMatch[3], 10);
    const fracKey = `${num}/${den}`;

    // Only convert proper fractions to vulgar glyphs (keep improper like "11/8" intact)
    if (FRACTION_TO_VULGAR[fracKey]) {
      return `${sign}${FRACTION_TO_VULGAR[fracKey]}`;
    }
    return s;
  }

  // 3. Substring replacement for compound kitchen measurements:
  // e.g. "3/4 cup + 1 tbsp" -> "¾ cup + 1 tbsp"
  // e.g. "1 tbsp + 1 1/2 tsp" -> "1 tbsp + 1 ½ tsp"
  // e.g. "4 tbsp (1/4 cup)" -> "4 tbsp (¼ cup)"
  if (s.includes('/')) {
    // Replace mixed fractions inside compound text first
    s = s.replace(/(\b\d+)\s+(\d+\/\d+)\b/g, (match, whole, frac) => {
      if (FRACTION_TO_VULGAR[frac]) {
        return `${whole} ${FRACTION_TO_VULGAR[frac]}`;
      }
      return `${whole}-${frac}`;
    });

    // Replace standalone fractions inside compound text
    s = s.replace(/\b(\d+\/\d+)\b/g, (match, frac) => {
      if (FRACTION_TO_VULGAR[frac]) {
        return FRACTION_TO_VULGAR[frac];
      }
      return match;
    });
    return s;
  }

  return s;
}

/**
 * Parse a number or fraction string into a numeric float.
 * Supports:
 * - Mixed fractions: "1 3/8", "1-3/8", "1+3/8", "-1 3/8"
 * - Unicode vulgar fractions: "1 ⅜", "1⅜", "⅜", "1 ½", "¾", "-1 ⅜", "-½"
 * - Simple & improper fractions: "3/4", "11/8", "13/16", "-5/2"
 * - Fraction slash (⁄): "1 3⁄8"
 * - Standard decimal numbers & integers: "1.5", "10", "0"
 *
 * @param {string|number} val
 * @returns {number}
 */
export function parseFractionString(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let s = String(val).trim();
  if (!s) return 0;

  // 1. Normalize fraction slashes (standard '/' and Unicode fraction slash '⁄')
  s = s.replace(/⁄/g, '/');

  // 2. Normalize Unicode vulgar fractions to ascii fractions (e.g. '3 ⅜ +1/32' -> '3 3/8 +1/32', '1⅜' -> '1 3/8', '-½' -> '-1/2')
  for (const [glyph, fracStr] of Object.entries(VULGAR_TO_FRACTION)) {
    if (s.includes(glyph)) {
      s = s.replace(new RegExp('(\\d)' + glyph, 'g'), '$1 ' + fracStr);
      s = s.replace(new RegExp(glyph, 'g'), fracStr);
    }
  }
  s = s.replace(/\s+/g, ' ').trim();
  if (s.startsWith('- ')) {
    s = '-' + s.slice(2).trim();
  }

  // 3. Tape Measure landmark + offset: e.g. "3 3/8 +1/32", "3 3/8 -1/32", "3 3/8 + 1/32"
  const offsetMatch = s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)\s*([+-])\s*(\d+)\s*\/\s*(\d+)$/);
  if (offsetMatch) {
    const whole = parseFloat(offsetMatch[1]);
    const num1 = parseFloat(offsetMatch[2]);
    const den1 = parseFloat(offsetMatch[3]);
    const sign = offsetMatch[4] === '+' ? 1 : -1;
    const num2 = parseFloat(offsetMatch[5]);
    const den2 = parseFloat(offsetMatch[6]);
    const base = (whole >= 0 ? 1 : -1) * (Math.abs(whole) + num1 / den1);
    return base + sign * (num2 / den2);
  }

  // 4. Simple fraction + offset: e.g. "1/8 +1/32", "1/8 -1/32"
  const simpleOffsetMatch = s.match(/^(\d+)\s*\/\s*(\d+)\s*([+-])\s*(\d+)\s*\/\s*(\d+)$/);
  if (simpleOffsetMatch) {
    const num1 = parseFloat(simpleOffsetMatch[1]);
    const den1 = parseFloat(simpleOffsetMatch[2]);
    const sign = simpleOffsetMatch[3] === '+' ? 1 : -1;
    const num2 = parseFloat(simpleOffsetMatch[4]);
    const den2 = parseFloat(simpleOffsetMatch[5]);
    return num1 / den1 + sign * (num2 / den2);
  }

  // 5. Whole number + offset with space before sign: e.g. "4 -1/32", "4 - 1/32", "3 +1/32"
  const wholeOffsetMatch = s.match(/^([+-]?\d+)\s+([+-])\s*(\d+)\s*\/\s*(\d+)$/);
  if (wholeOffsetMatch) {
    const whole = parseFloat(wholeOffsetMatch[1]);
    const sign = wholeOffsetMatch[2] === '+' ? 1 : -1;
    const num = parseFloat(wholeOffsetMatch[3]);
    const den = parseFloat(wholeOffsetMatch[4]);
    return whole + sign * (num / den);
  }

  if (s.includes('/')) {
    // 6. Check for mixed fraction formats: e.g. "1 3/8", "1-3/8", "1+3/8", "-1 3/8", "-1-3/8"
    const mixedMatch = s.match(/^([+-]?\d+)\s*[-+ ]\s*(\d+)\s*\/\s*(\d+)$/);
    if (mixedMatch) {
      const whole = parseFloat(mixedMatch[1]);
      const num = parseFloat(mixedMatch[2]);
      const den = parseFloat(mixedMatch[3]);
      if (!isNaN(whole) && !isNaN(num) && den) {
        return (whole >= 0 ? 1 : -1) * (Math.abs(whole) + num / den);
      }
    }

    // 7. Check for simple or improper fraction: e.g. "3/4", "11/8", "-5/2"
    const simpleMatch = s.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
    if (simpleMatch) {
      const num = parseFloat(simpleMatch[1]);
      const den = parseFloat(simpleMatch[2]);
      if (!isNaN(num) && den) {
        return num / den;
      }
    }

    // 8. Fallback split by whitespace
    const parts = s.split(/\s+/);
    if (parts.length === 2) {
      const whole = parseFloat(parts[0]);
      const [num, den] = parts[1].split('/').map(Number);
      if (!isNaN(whole) && !isNaN(num) && den) {
        return (whole >= 0 ? 1 : -1) * (Math.abs(whole) + num / den);
      }
    }
  }

  // 9. Fallback to standard float
  const parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Finds a unit within a category by token (id, symbol, name, plural, or alias).
 * Handles plural s stripping and volume <-> cooking domain overlap.
 */
function findUnitInCategory(token, catId) {
  if (!token || !catId || !UNIT_DEFINITIONS[catId]) return null;
  const clean = String(token).trim().toLowerCase().replace(/^°/, '');
  if (!clean) return null;

  const catUnits = UNIT_DEFINITIONS[catId].units;
  for (const u of catUnits) {
    if (
      u.id.toLowerCase() === clean ||
      u.symbol.toLowerCase().replace(/^°/, '') === clean ||
      u.name.toLowerCase() === clean ||
      u.plural.toLowerCase() === clean ||
      (u.aliases && u.aliases.some((a) => a.toLowerCase().replace(/^°/, '') === clean))
    ) {
      return u;
    }
  }

  if (clean.length > 2 && clean.endsWith('s')) {
    const singular = clean.slice(0, -1);
    for (const u of catUnits) {
      if (
        u.id.toLowerCase() === singular ||
        u.name.toLowerCase() === singular ||
        (u.aliases && u.aliases.some((a) => a.toLowerCase().replace(/^°/, '') === singular))
      ) {
        return u;
      }
    }
  }

  const altCat = catId === 'cooking' ? 'volume' : catId === 'volume' ? 'cooking' : null;
  if (altCat && UNIT_DEFINITIONS[altCat]) {
    for (const u of UNIT_DEFINITIONS[altCat].units) {
      if (
        u.id.toLowerCase() === clean ||
        u.symbol.toLowerCase().replace(/^°/, '') === clean ||
        u.name.toLowerCase() === clean ||
        u.plural.toLowerCase() === clean ||
        (u.aliases && u.aliases.some((a) => a.toLowerCase().replace(/^°/, '') === clean))
      ) {
        return u;
      }
    }
  }

  return null;
}

/**
 * Parses a compound measurement string into its numeric value for a given target unit.
 * Supports feet & inches ("5 ft 10 in", "5'10\"", "5 ft 10"), pounds & ounces ("2 lbs 4 oz"),
 * hours, minutes & seconds ("1 hr 30 min 15 sec", "1h 30m"), gallons & quarts ("1 gal 2 qt"),
 * and culinary units ("1 cup 2 tbsp", "2 tbsp 1 tsp").
 *
 * @param {string} str
 * @param {string} categoryId
 * @param {string} [targetUnitId]
 * @returns {number|null}
 */
export function parseCompoundValue(str, categoryId, targetUnitId) {
  if (!str || typeof str !== 'string' || !categoryId) return null;
  let s = str.trim().toLowerCase();
  if (!s) return null;

  s = s.replace(/,/g, ' ').replace(/\band\b/gi, ' ');

  const FRACTION_GLYPHS = '½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞';
  const VALUE_REGEX_STR = `(?:[+-]?\\d+\\s*[-+ ]\\s*\\d+\\/\\d+|[+-]?\\d+\\s*[${FRACTION_GLYPHS}]|[+-]?[${FRACTION_GLYPHS}]|[+-]?\\d+\\/\\d+|[+-]?[0-9]*\\.?[0-9]+(?:e[+-]?[0-9]+)?)`;

  // 5'11", 5' 11", 5' 10 1/2", 5'10
  s = s.replace(
    new RegExp(`(\\d+)\\s*'\\s*(${VALUE_REGEX_STR})?\\s*(?:\\"|''|in|inches|inch)?`, 'gi'),
    (m, feet, inches) => `${feet} ft ${inches ? `${inches} in` : ''} `
  );

  // 5 ft 10 (without unit on inches)
  s = s.replace(
    new RegExp(`(\\d+)\\s*(?:feet|foot|ft)\\s+(${VALUE_REGEX_STR})(?![\\d.])(?=\\s*(?:$|to\\b|into\\b))`, 'gi'),
    '$1 ft $2 in '
  );

  // Compact letters stuck to digits: 5ft10in -> 5 ft 10 in, 4ft5in -> 4 ft 5 in
  s = s.replace(/(\d)([a-zµ°'"])/gi, '$1 $2');
  s = s.replace(/([a-zµ°'"])([-+]?\d)/gi, '$1 $2');
  s = s.replace(/\s+/g, ' ').trim();

  const partRegex = new RegExp(`(${VALUE_REGEX_STR})\\s*([a-z°'"/²³µ]+)`, 'gi');
  const parts = [];
  let match;
  while ((match = partRegex.exec(s)) !== null) {
    const rawVal = match[1].trim();
    const val = parseFractionString(rawVal);
    const uToken = match[2].trim();
    if (!isNaN(val)) {
      parts.push({ val, uToken });
    }
  }

  if (parts.length < 1) return null;

  const cleanRemainder = s
    .replace(new RegExp(`(${VALUE_REGEX_STR})\\s*([a-z°'"/²³µ]+)`, 'gi'), '')
    .replace(/[\s,+]/g, '');
  if (cleanRemainder.length > 0) return null;

  let totalBase = 0;
  for (const p of parts) {
    const u = findUnitInCategory(p.uToken, categoryId);
    if (!u) return null;
    let baseVal = 0;
    if (typeof u.toBase === 'function') {
      baseVal = u.toBase(p.val);
    } else {
      baseVal = p.val * u.factor;
    }
    totalBase += baseVal;
  }

  const targetId = targetUnitId || UNIT_DEFINITIONS[categoryId]?.baseUnit;
  const targetDef = getUnit(categoryId, targetId) || (categoryId === 'cooking' ? getUnit('volume', targetId) : null);
  if (!targetDef) return null;

  if (typeof targetDef.fromBase === 'function') {
    return Math.round(targetDef.fromBase(totalBase) * 1e10) / 1e10;
  }
  return Math.round((totalBase / targetDef.factor) * 1e10) / 1e10;
}

/**
 * Evaluates the status of user input in the conversion workbench.
 * Differentiates between valid inputs, incomplete/pending typing, and truly invalid expressions.
 *
 * @param {string|number} val
 * @param {string} categoryId
 * @param {string} unitId
 * @returns {{ isValid: boolean, isPending: boolean, isInvalid: boolean, isCompound: boolean, parsedValue: number|null }}
 */
export function evaluateInputStatus(val, categoryId, unitId) {
  if (val === null || val === undefined || val === '') {
    return { isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 0 };
  }
  const s = String(val).trim();
  if (s === '') {
    return { isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: 0 };
  }

  // 1. Pending prefixes while typing
  if (s === '-' || s === '+' || s === '.') {
    return { isValid: false, isPending: true, isInvalid: false, isCompound: false, parsedValue: null };
  }
  // Trailing decimal without fractional part: e.g. "12."
  if (/^[+-]?\d+\.$/.test(s)) {
    return { isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: parseFloat(s) };
  }
  // Trailing fraction slash: e.g. "1/", "1 1/", "3/8 +"
  if (/^[+-]?\d*\s*\d*\s*[/⁄]$/.test(s) || /[+-]\s*$/.test(s)) {
    return { isValid: false, isPending: true, isInvalid: false, isCompound: false, parsedValue: null };
  }
  // Incomplete quotes or unit suffix while typing compound: e.g. "5'", "5ft ", "4 ft "
  if (/^\d+\s*['"]$/.test(s) || /^\d+\s*[a-z]+(?:\s+|$)$/i.test(s)) {
    const compVal = parseCompoundValue(s, categoryId, unitId);
    if (compVal !== null && !isNaN(compVal)) {
      return { isValid: true, isPending: false, isInvalid: false, isCompound: true, parsedValue: compVal };
    }
    return { isValid: false, isPending: true, isInvalid: false, isCompound: true, parsedValue: null };
  }

  // 2. Compound measurements (spaced or compact: 4ft5in, 5'10", 2 lbs 4 oz, etc.)
  if (isCompoundLike(s)) {
    const compVal = parseCompoundValue(s, categoryId, unitId);
    if (compVal !== null && !isNaN(compVal)) {
      return { isValid: true, isPending: false, isInvalid: false, isCompound: true, parsedValue: compVal };
    }
    // If it looked compound-like but ended in an unfinished token (e.g. typing "5 ft 1"), check pending
    if (/[a-z0-9]$/i.test(s) && (/'|"$/.test(s) || /\d+$/.test(s))) {
      const tryLenient = parseCompoundValue(s, categoryId, unitId);
      if (tryLenient !== null && !isNaN(tryLenient)) {
        return { isValid: true, isPending: false, isInvalid: false, isCompound: true, parsedValue: tryLenient };
      }
    }
    return { isValid: false, isPending: false, isInvalid: true, isCompound: true, parsedValue: null };
  }

  // 3. Fraction expressions (1/8, 1 3/8, 3 3/8 +1/32, ½, etc.)
  if (isFractionLike(s)) {
    // Check for division by zero: e.g. "/0"
    if (/\/0(?:\D|$)/.test(s)) {
      return { isValid: false, isPending: false, isInvalid: true, isCompound: false, parsedValue: null };
    }
    const fracVal = parseFractionString(s);
    if (!isNaN(fracVal) && isFinite(fracVal)) {
      return { isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: fracVal };
    }
    return { isValid: false, isPending: false, isInvalid: true, isCompound: false, parsedValue: null };
  }

  // 4. Standard numbers (integer, decimal, scientific notation)
  // Check for invalid multiple decimals: "12..4" or "1.2.3"
  if ((s.match(/\./g) || []).length > 1) {
    return { isValid: false, isPending: false, isInvalid: true, isCompound: false, parsedValue: null };
  }
  const num = Number(s);
  if (!isNaN(num) && isFinite(num)) {
    return { isValid: true, isPending: false, isInvalid: false, isCompound: false, parsedValue: num };
  }

  // 5. Unrecognized input (e.g. "abc", "foo", "hello")
  return { isValid: false, isPending: false, isInvalid: true, isCompound: false, parsedValue: null };
}

/**
 * Sensible culinary fraction formatter.
 * In a kitchen, measuring cups only come in 1, 3/4, 2/3, 1/2, 1/3, 1/4, and 1/8.
 * Exact 16ths represent full tablespoons (e.g. 13/16 cup = 13 tbsp).
 * Denominators of 32 NEVER exist in cooking and are banned.
 * If the value is not within strict tolerance of a legitimate culinary fraction,
 * returns null so it can be formatted as a clean decimal.
 *
 * @param {number} val
 * @param {boolean} improper
 * @returns {string|null}
 */
export function formatCulinaryFraction(val, improper = false) {
  if (val === null || val === undefined || isNaN(val)) return null;
  const num = Number(val);
  if (!isFinite(num)) return null;

  const isNeg = num < 0;
  const abs = Math.abs(num);
  const whole = Math.floor(abs);
  const frac = abs - whole;

  // Near whole number
  if (frac < 0.005) {
    if (whole === 0 && frac > 0.0001) return null; // tiny non-zero decimal
    return (isNeg ? '-' : '') + whole.toString();
  }
  if (frac > 0.995) {
    return (isNeg ? '-' : '') + (whole + 1).toString();
  }

  // 1. Common culinary thirds (1/3 ~ 0.3333, 2/3 ~ 0.6667) within 0.015 tolerance
  if (Math.abs(frac - 1 / 3) < 0.015) {
    if (improper && whole > 0) return `${isNeg ? '-' : ''}${whole * 3 + 1}/3`;
    const wStr = whole > 0 ? `${whole} ` : '';
    return `${isNeg ? '-' : ''}${wStr}1/3`;
  }
  if (Math.abs(frac - 2 / 3) < 0.015) {
    if (improper && whole > 0) return `${isNeg ? '-' : ''}${whole * 3 + 2}/3`;
    const wStr = whole > 0 ? `${whole} ` : '';
    return `${isNeg ? '-' : ''}${wStr}2/3`;
  }

  // 2. Standard culinary binary fractions: halves (1/2), quarters (1/4, 3/4), eighths (1/8, 3/8, 5/8, 7/8)
  const standardDenoms = [2, 4, 8];
  for (const denom of standardDenoms) {
    const numerator = Math.round(frac * denom);
    if (numerator <= 0 || numerator >= denom) continue;
    const diff = Math.abs(frac - numerator / denom);
    if (diff < 0.012) {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(numerator, denom);
      const reducedNum = numerator / g;
      const reducedDenom = denom / g;
      if (improper && whole > 0) {
        return `${isNeg ? '-' : ''}${whole * reducedDenom + reducedNum}/${reducedDenom}`;
      }
      const wStr = whole > 0 ? `${whole} ` : '';
      return `${isNeg ? '-' : ''}${wStr}${reducedNum}/${reducedDenom}`;
    }
  }

  // 3. Exact 16ths: represents exact tablespoons (e.g. 13 tbsp -> 13/16 cup).
  // Strictly requires diff < 0.002 (so continuous values like 34 mL or 50 mL NEVER produce 16ths!)
  const num16 = Math.round(frac * 16);
  if (num16 > 0 && num16 < 16) {
    const diff16 = Math.abs(frac - num16 / 16);
    if (diff16 < 0.002) {
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(num16, 16);
      const reducedNum = num16 / g;
      const reducedDenom = 16 / g;
      if (improper && whole > 0) {
        return `${isNeg ? '-' : ''}${whole * reducedDenom + reducedNum}/${reducedDenom}`;
      }
      const wStr = whole > 0 ? `${whole} ` : '';
      return `${isNeg ? '-' : ''}${wStr}${reducedNum}/${reducedDenom}`;
    }
  }

  return null;
}

export function formatNumber(val, decimals = 'auto', categoryId = null) {
  if (val === null || val === undefined || isNaN(val)) return '';
  const num = Number(val);
  if (!isFinite(num)) return num.toString();

  // Handle exact zero
  if (num === 0) return '0';

  // 1. Fractions (Mixed) mode (e.g. 1 3/8, 1/2, 1/8000)
  if (decimals === 'fraction') {
    return toFraction(num, 32, false);
  }

  // 2. Fractions (Improper) mode (e.g. 11/8, 3/2, 1/8000)
  if (decimals === 'fraction_improper') {
    return toFraction(num, 32, true);
  }

  // 3. Tape Measure mode (1/16" landmark ± 1/32")
  if (
    decimals === 'fraction_tape' ||
    decimals === 'tape' ||
    decimals === 'fraction_16' ||
    decimals === 'fraction_32' ||
    decimals === 'fraction_64'
  ) {
    return toTapeMeasureFraction(num);
  }

  // 3. Exact (Full Precision) mode: unrounded calculation with clean IEEE 754 precision
  if (decimals === 'exact') {
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toPrecision(10)).toString();
  }

  // 4. Fixed precision requested by user (e.g. '2', '4', '6', '8')
  if (decimals !== 'auto' && !isNaN(Number(decimals))) {
    return num.toFixed(Number(decimals)).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
  }

  const abs = Math.abs(num);

  // Scientific notation mode or for very small or huge values (< 1e-6 or >= 1e14)
  if (decimals === 'scientific' || abs >= 1e14 || (abs < 1e-6 && abs > 0)) {
    return num.toExponential(4).replace(/(\.[0-9]*[1-9])0+e/, '$1e').replace(/\.0+e/, 'e');
  }

  // Clean IEEE 754 precision artifacts (e.g. 0.30000000000000004 -> 0.3)
  const clean = parseFloat(num.toPrecision(12));
  if (Number.isInteger(clean)) {
    return clean.toString();
  }

  // Category-specific sensible formatting (e.g. temperature)
  if (categoryId === 'temperature') {
    return parseFloat(clean.toFixed(2)).toString();
  }

  // Cooking measurements in auto mode naturally format as practical culinary mixed fractions
  if (categoryId === 'cooking') {
    const fracStr = formatCulinaryFraction(clean, false);
    if (fracStr) {
      return fracStr;
    }
  }

  // Small values (< 1): guarantee at least 4 significant figures so it NEVER truncates to 0
  // e.g. 0.000123456 -> 0.0001235 (4 sig figs), 0.03937 (1 mm in in)
  if (abs < 1) {
    return parseFloat(clean.toPrecision(4)).toString();
  }

  // Large values (>= 1,000): cap at 2 decimal places
  if (abs >= 1000) {
    return parseFloat(clean.toFixed(2)).toString();
  }

  // Standard human-scale numbers (1 <= abs < 1,000): cap at 4 decimal places
  return parseFloat(clean.toFixed(4)).toString();
}

/**
 * Helper to format teaspoon quantities cleanly:
 * 1 -> '1 tsp'
 * 2 -> '2 tsp'
 * 0.5 -> '1/2 tsp'
 * 1.5 -> '1 1/2 tsp'
 * 2.5 -> '2 1/2 tsp'
 * 0.25 -> '1/4 tsp'
 * 0.75 -> '3/4 tsp'
 */
function formatTsp(tsp) {
  if (tsp === 1) return '1 tsp';
  if (tsp === 2) return '2 tsp';
  if (tsp === 0.5) return '1/2 tsp';
  if (tsp === 1.5) return '1 1/2 tsp';
  if (tsp === 2.5) return '2 1/2 tsp';
  if (tsp === 0.25) return '1/4 tsp';
  if (tsp === 0.75) return '3/4 tsp';
  if (tsp <= 0.15 && tsp > 0) return '1/8 tsp (pinch)';
  return `${tsp} tsp`;
}

/**
 * Calculates a practical kitchen compound breakdown for cooking measurements.
 * Converts odd fractional measures into real-world drawer measuring tools.
 * e.g.:
 * - 34 mL -> "2 tbsp + 1 tsp" (exact kitchen spoons!)
 * - 13/16 cup (13 tbsp) -> "3/4 cup + 1 tbsp"
 * - 5/16 cup (5 tbsp) -> "1/4 cup + 1 tbsp"
 * - 7/16 cup (7 tbsp) -> "1/4 cup + 3 tbsp"
 * - 9/16 cup (9 tbsp) -> "1/2 cup + 1 tbsp"
 * - 11/16 cup (11 tbsp) -> "1/2 cup + 3 tbsp"
 * - 15/16 cup (15 tbsp) -> "3/4 cup + 3 tbsp"
 * - 4/3 tbsp (1.333 tbsp) -> "1 tbsp + 1 tsp"
 * - 5/3 tbsp (1.667 tbsp) -> "1 tbsp + 2 tsp"
 * - 1.5 tbsp -> "1 tbsp + 1 1/2 tsp"
 *
 * @param {number} value Converted numeric result
 * @param {string} toUnitId Target unit identifier
 * @param {string} categoryId Active category identifier
 * @returns {string|null} Compound kitchen measurement breakdown or null
 */
export function getCookingCompoundMeasure(value, toUnitId, categoryId = 'cooking') {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return null;
  if (categoryId !== 'cooking' && categoryId !== 'volume') return null;

  // 1. Result in US Cups
  if (toUnitId === 'cup_us') {
    const totalTbsp = value * 16;
    const roundedTbsp = Math.round(totalTbsp * 1000) / 1000;

    // A. Sub-1/4 cup (< 4 tbsp / under ~60 mL):
    // In a kitchen, measuring cups do not measure under 1/4 cup.
    // Cooks ALWAYS reach for measuring spoons (tablespoons and teaspoons)!
    if (roundedTbsp < 3.85) {
      // If at least 1 tbsp
      if (roundedTbsp >= 0.85) {
        let wholeTbsp = Math.floor(roundedTbsp);
        let remTbsp = roundedTbsp - wholeTbsp;
        let remTsp = Math.round(remTbsp * 3 * 2) / 2; // nearest half teaspoon
        if (remTsp === 3) {
          wholeTbsp += 1;
          remTsp = 0;
        }

        if (wholeTbsp > 0 && remTsp === 0) return `${wholeTbsp} tbsp`;
        if (wholeTbsp === 0 && remTsp > 0) return formatTsp(remTsp);
        return `${wholeTbsp} tbsp + ${formatTsp(remTsp)}`;
      }

      // Sub-tablespoon (< 15 mL): measure in teaspoons / pinches
      const totalTsp = Math.round(roundedTbsp * 3 * 2) / 2;
      if (totalTsp > 0) {
        return formatTsp(totalTsp);
      }
      return null;
    }

    // B. Measurements >= 1/4 cup (>= 4 tbsp):
    const wholeCups = Math.floor(value);
    const remCups = value - wholeCups;
    const remTbsp = remCups * 16;

    // Check for clean single-tool standard cups (within 0.1 tbsp tolerance ~ 1/3 tsp)
    if (wholeCups > 0 && (remTbsp < 0.1 || remTbsp > 15.9)) {
      return null; // clean whole cups (1 cup, 2 cups, etc.)
    }
    if (Math.abs(remTbsp - 12) < 0.1) {
      return wholeCups > 0 ? `${wholeCups} 3/4 cups` : null; // clean 3/4 cup
    }
    if (Math.abs(remTbsp - 16 * 2 / 3) < 0.1) {
      return wholeCups > 0 ? `${wholeCups} 2/3 cups` : null; // clean 2/3 cup
    }
    if (Math.abs(remTbsp - 8) < 0.1) {
      return wholeCups > 0 ? `${wholeCups} 1/2 cups` : null; // clean 1/2 cup
    }
    if (Math.abs(remTbsp - 16 / 3) < 0.1) {
      return wholeCups > 0 ? `${wholeCups} 1/3 cups` : null; // clean 1/3 cup
    }
    if (Math.abs(remTbsp - 4) < 0.1) {
      return wholeCups > 0 ? `${wholeCups} 1/4 cups` : null; // clean 1/4 cup
    }

    // Compound cup + spoon measurements:
    // Determine largest base cup
    let cupFractionStr = '';
    let baseCupTbsp = 0;

    if (remTbsp >= 12) {
      cupFractionStr = '3/4 cup';
      baseCupTbsp = 12;
    } else if (remTbsp >= 8) {
      cupFractionStr = '1/2 cup';
      baseCupTbsp = 8;
    } else if (remTbsp >= 4) {
      cupFractionStr = '1/4 cup';
      baseCupTbsp = 4;
    }

    const leftoverTbsp = remTbsp - baseCupTbsp;
    let spoonTbsp = Math.floor(leftoverTbsp);
    let spoonRemTbsp = leftoverTbsp - spoonTbsp;
    let spoonTsp = Math.round(spoonRemTbsp * 3 * 2) / 2; // nearest half teaspoon
    if (spoonTsp === 3) {
      spoonTbsp += 1;
      spoonTsp = 0;
    }

    // Assemble parts
    const parts = [];
    if (wholeCups === 1) parts.push('1 cup');
    else if (wholeCups > 1) parts.push(`${wholeCups} cups`);

    if (cupFractionStr) parts.push(cupFractionStr);

    if (spoonTbsp > 0) {
      parts.push(`${spoonTbsp} tbsp`);
    }
    if (spoonTsp > 0) {
      parts.push(formatTsp(spoonTsp));
    }

    return parts.length > 0 ? parts.join(' + ') : null;
  }

  // 2. Result in US Tablespoons
  if (toUnitId === 'tbsp_us') {
    // Large whole cups: e.g. 16 tbsp -> 1 cup, 32 tbsp -> 2 cups
    if (value >= 16 && Math.abs(value % 16) < 0.05) {
      const cups = Math.round(value / 16);
      return cups === 1 ? '1 cup (16 tbsp)' : `${cups} cups (${Math.round(value)} tbsp)`;
    }

    let wholeTbsp = Math.floor(value);
    let remTbsp = value - wholeTbsp;
    let remTsp = Math.round(remTbsp * 3 * 2) / 2;
    if (remTsp === 3) {
      wholeTbsp += 1;
      remTsp = 0;
    }

    // If clean whole tablespoons without teaspoons, no compound needed
    if (remTsp === 0) {
      return null;
    }

    if (wholeTbsp === 0) {
      return formatTsp(remTsp);
    }
    return `${wholeTbsp} tbsp + ${formatTsp(remTsp)}`;
  }

  // 3. Result in US Teaspoons
  if (toUnitId === 'tsp_us') {
    // If >= 3 tsp, provide tablespoon context: e.g. 3 tsp = 1 tbsp, 6 tsp = 2 tbsp
    if (value >= 3) {
      let wholeTbsp = Math.floor(value / 3);
      let remTsp = Math.round((value % 3) * 2) / 2;
      if (remTsp === 3) {
        wholeTbsp += 1;
        remTsp = 0;
      }
      if (remTsp === 0) {
        return `${wholeTbsp} tbsp (${Math.round(value)} tsp)`;
      }
      return `${wholeTbsp} tbsp + ${formatTsp(remTsp)}`;
    }
    // Sub-tablespoon: e.g. 1/2 tsp, 1 1/2 tsp
    const rounded = Math.round(value * 2) / 2;
    if (rounded === 0.5) return '1/2 tsp';
    if (rounded === 1.5) return '1 1/2 tsp';
    if (rounded === 2.5) return '2 1/2 tsp';
    if (value <= 0.2) return '1/8 tsp (pinch)';
    if (value <= 0.35) return '1/4 tsp';
    return null;
  }

  // 4. Result in Sticks of Butter
  if (toUnitId === 'stick_butter') {
    const totalTbsp = value * 8;
    const roundedTbsp = Math.round(totalTbsp * 1000) / 1000;
    if (Math.abs(roundedTbsp - Math.round(roundedTbsp)) < 0.05) {
      const tbsp = Math.round(roundedTbsp);
      if (tbsp === 4) return '4 tbsp (1/4 cup)';
      if (tbsp === 8) return '8 tbsp (1/2 cup)';
      if (tbsp === 12) return '12 tbsp (3/4 cup)';
      if (tbsp === 16) return '16 tbsp (1 cup)';
      if (tbsp > 0 && tbsp !== 8) return `${tbsp} tbsp`;
    }
  }

  return null;
}

/**
 * Break down any kitchen volume quantity into physical kitchen measuring tools
 * (measuring cups, measuring spoons, and large vessels) found in standard home drawers.
 *
 * @param {number|string} amount
 * @param {string} unitId
 * @returns {object|null} { primary, tools, equivalents }
 */
export function getKitchenDrawerBreakdown(amount, unitId = 'cup_us') {
  if (amount === null || amount === undefined || amount === '') {
    return null;
  }

  const num = typeof amount === 'string' && isFractionLike(amount)
    ? parseFractionString(amount)
    : Number(amount);

  if (isNaN(num) || num < 0) {
    return null;
  }

  if (num === 0) {
    return {
      primary: '0',
      tools: ['0'],
      ml: '0 mL',
      cups: '0 cups',
      tbsp: '0 tbsp',
      tsp: '0 tsp',
      flOz: '0 fl oz',
    };
  }

  const unit = getUnit('cooking', unitId) || getUnit('volume', unitId);
  const factor = unit ? (typeof unit.factor === 'number' ? unit.factor : 1) : 1;
  const ml = num * factor;

  const totalTbsp = ml / 14.78676478125;
  const totalTsp = totalTbsp * 3;
  const totalCups = totalTbsp / 16;
  const totalFlOz = ml / 29.5735295625;

  let remainingTbsp = totalTbsp;
  const tools = [];

  // 1. Gallons (16 cups / 256 tbsp)
  if (remainingTbsp >= 255.5) {
    const gal = Math.floor((remainingTbsp + 0.5) / 256);
    if (gal > 0) {
      tools.push(gal === 1 ? '1 gallon' : `${gal} gallons`);
      remainingTbsp -= gal * 256;
    }
  }

  // 2. Quarts (4 cups / 64 tbsp)
  if (remainingTbsp >= 63.5) {
    const qt = Math.floor((remainingTbsp + 0.5) / 64);
    if (qt > 0) {
      tools.push(qt === 1 ? '1 quart' : `${qt} quarts`);
      remainingTbsp -= qt * 64;
    }
  }

  // 3. Whole cups (1, 2, 3 cups)
  if (remainingTbsp >= 15.8) {
    const cups = Math.floor((remainingTbsp + 0.2) / 16);
    if (cups > 0) {
      tools.push(cups === 1 ? '1 cup' : `${cups} cups`);
      remainingTbsp -= cups * 16;
    }
  }

  // 4. Standard measuring cups (3/4, 2/3, 1/2, 1/3, 1/4 cup)
  const cupOptions = [
    { name: '¾ cup', tbsp: 12 },
    { name: '⅔ cup', tbsp: 16 * 2 / 3 },
    { name: '½ cup', tbsp: 8 },
    { name: '⅓ cup', tbsp: 16 / 3 },
    { name: '¼ cup', tbsp: 4 },
  ];

  for (const c of cupOptions) {
    if (remainingTbsp >= c.tbsp - 0.25) {
      tools.push(c.name);
      remainingTbsp -= c.tbsp;
      break;
    }
  }

  // 5. Tablespoons (1, 2, 3 tbsp)
  if (remainingTbsp >= 0.85) {
    const tbsp = Math.floor(remainingTbsp + 0.15);
    if (tbsp > 0) {
      tools.push(tbsp === 1 ? '1 tbsp' : `${tbsp} tbsp`);
      remainingTbsp -= tbsp;
    }
  }

  // 6. Teaspoons (1/4, 1/2, 3/4, 1, 1 1/2, 2 tsp)
  const remainingTsp = Math.max(0, remainingTbsp * 3);
  if (remainingTsp >= 0.2) {
    const roundedTsp = Math.round(remainingTsp * 4) / 4;
    if (roundedTsp === 1) tools.push('1 tsp');
    else if (roundedTsp === 2) tools.push('2 tsp');
    else if (roundedTsp === 0.5) tools.push('½ tsp');
    else if (roundedTsp === 0.25) tools.push('¼ tsp');
    else if (roundedTsp === 0.75) tools.push('¾ tsp');
    else if (roundedTsp === 1.5) tools.push('1 ½ tsp');
    else if (roundedTsp > 0) tools.push(`${roundedTsp} tsp`);
  } else if (remainingTbsp > 0.05 && tools.length === 0) {
    tools.push('1 pinch');
  }

  const primary = tools.length > 0 ? tools.join(' + ') : '0';

  return {
    primary,
    tools,
    ml: (ml >= 10 ? ml.toFixed(0) : ml.toFixed(1)) + ' mL',
    cups: (totalCups >= 10 ? totalCups.toFixed(1) : totalCups.toFixed(2)) + ' cups',
    tbsp: (totalTbsp >= 10 ? totalTbsp.toFixed(0) : totalTbsp.toFixed(1)) + ' tbsp',
    tsp: (totalTsp >= 10 ? totalTsp.toFixed(0) : totalTsp.toFixed(1)) + ' tsp',
    flOz: totalFlOz.toFixed(1) + ' fl oz',
  };
}

/**
 * Compute smart contextual readout for the bottom equation pill in Auto mode.
 * Replaces the raw decimal in the green pill with practical, human-friendly units:
 * - Length (inches): Tape measure landmark ± 1/32" (e.g. 1/32 in, 3 3/8 +1/32 in)
 * - Length (feet): Architectural foot-inch (e.g. 5 ft 3 3/8 in)
 * - Time: Practical clock breakdown (e.g. 1h 23m 20s)
 * - Mass: Pounds & Ounces (e.g. 165 lb 5.5 oz)
 * - Digital/Data Rate: Theoretical exact ratio (e.g. 1/8000 GB/s)
 * - Metric/Default: Clean decimal without awkward fractions (e.g. 0.000004 km)
 *
 * @param {string} categoryId
 * @param {object} fromUnit
 * @param {object} toUnit
 * @param {number|string} fromValue
 * @param {number|string} targetValue
 * @param {string} defaultFormattedValue
 * @returns {object} { value, unit, subtext, isSmart }
 */
export function getSmartEquationDisplay(categoryId, fromUnit, toUnit, fromValue, targetValue, defaultFormattedValue) {
  const fallback = {
    value: defaultFormattedValue || '0',
    unit: toUnit ? toUnit.symbol : '',
    subtext: null,
    isSmart: false,
    isExact: true,
  };

  if (fromValue === null || fromValue === undefined || fromValue === '' || !toUnit || !fromUnit) {
    return fallback;
  }

  let rawFromNum = typeof fromValue === 'string' && isFractionLike(fromValue)
    ? parseFractionString(fromValue)
    : Number(fromValue);
  if (isNaN(rawFromNum) && typeof fromValue === 'string' && isCompoundLike(fromValue)) {
    const compVal = parseCompoundValue(fromValue, categoryId, fromUnit.id);
    if (compVal !== null && !isNaN(compVal)) {
      rawFromNum = compVal;
    }
  }
  const rawTargetNum = typeof targetValue === 'string' && isFractionLike(targetValue)
    ? parseFractionString(targetValue)
    : Number(targetValue);

  if (isNaN(rawFromNum) || isNaN(rawTargetNum) || rawTargetNum === 0) {
    return fallback;
  }

  // 1. Length (Inches & Feet) -> Tape Measure landmark ± 1/32" or Exact Fraction
  if (categoryId === 'length') {
    if (toUnit.id === 'in') {
      const tapeStr = toTapeMeasureFraction(rawTargetNum);
      if (tapeStr && tapeStr !== '0') {
        const tapeNum = parseFractionString(tapeStr);
        const hasDiff = Math.abs(tapeNum - rawTargetNum) > 1e-4;
        return {
          value: tapeStr,
          unit: 'in',
          subtext: hasDiff ? `≈ ${defaultFormattedValue} in` : (tapeStr !== defaultFormattedValue ? `= ${defaultFormattedValue} in` : null),
          isSmart: tapeStr !== defaultFormattedValue,
          isExact: !hasDiff,
        };
      }
    } else if (toUnit.id === 'ft') {
      const absTarget = Math.abs(rawTargetNum);
      const wholeFeet = Math.floor(absTarget);
      const remInches = (absTarget - wholeFeet) * 12;

      // A. Multi-foot measurements (>= 1 ft): Compound Architectural feet & inches
      // e.g. 18 in -> "1 ft 6 in", 1.8 m -> "5 ft 10 7/8 in"
      if (wholeFeet >= 1 && remInches >= 0.02) {
        const tapeRem = toTapeMeasureFraction(remInches);
        if (tapeRem && tapeRem !== '0') {
          const sign = rawTargetNum < 0 ? '-' : '';
          const archStr = `${sign}${formatDisplayNumber(wholeFeet)} ft ${tapeRem} in`;
          const tapeNum = parseFractionString(tapeRem);
          const totalArchFt = wholeFeet + tapeNum / 12;
          const isExact = Math.abs(totalArchFt - absTarget) < 1e-4;
          return {
            value: archStr,
            unit: '',
            subtext: isExact ? `= ${defaultFormattedValue} ft` : `≈ ${defaultFormattedValue} ft`,
            isSmart: true,
            isExact,
          };
        }
      }

      // B. Sub-foot measurements (< 1 ft): Clean rational fraction of a foot
      // e.g. 1 in -> "1/12 ft", 2 in -> "1/6 ft", 3 in -> "1/4 ft", 4 in -> "1/3 ft", 6 in -> "1/2 ft"
      if (wholeFeet === 0) {
        const fracStr = toFraction(absTarget, 64, false);
        if (fracStr && fracStr.includes('/')) {
          const fracVal = parseFractionString(fracStr);
          const isExact = Math.abs(fracVal - absTarget) < 1e-5;
          if (isExact || (fromUnit.id === 'in' && /\/(?:2|3|4|6|8|12|16|24|32|48|64)\b/.test(fracStr))) {
            const sign = rawTargetNum < 0 ? '-' : '';
            return {
              value: `${sign}${fracStr}`,
              unit: 'ft',
              subtext: `≈ ${defaultFormattedValue} ft`,
              isSmart: true,
              isExact,
            };
          }
        }
      }
    }
  }

  // 2. Time -> Practical Clock Breakdown (Days, Hours, Minutes, Seconds) or Clean Fractions
  if (categoryId === 'time') {
    const sec = convertUnits(rawFromNum, 'time', fromUnit.id, 's');
    const isTargetInteger = Math.abs(rawTargetNum - Math.round(rawTargetNum)) < 1e-4;
    if (sec !== null && Math.abs(sec) >= 60 && !isTargetInteger) {
      const absSec = Math.abs(sec);
      const d = Math.floor(absSec / 86400);
      const h = Math.floor((absSec % 86400) / 3600);
      const m = Math.floor((absSec % 3600) / 60);
      const s = Math.round(absSec % 60);
      const parts = [];
      if (d > 0) parts.push(`${formatDisplayNumber(d)}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);
      if (s > 0 && d === 0) parts.push(`${s}s`);
      if (parts.length > 0) {
        const sign = sec < 0 ? '-' : '';
        const durStr = sign + parts.join(' ');
        const isDifferent = durStr !== `${defaultFormattedValue}${toUnit.symbol}` && durStr !== `${defaultFormattedValue} ${toUnit.symbol}`;
        if (isDifferent) {
          const totalSecRec = (d * 86400) + (h * 3600) + (m * 60) + s;
          const isExact = Math.abs(totalSecRec - absSec) < 1e-4;
          return {
            value: durStr,
            unit: '',
            subtext: `≈ ${defaultFormattedValue} ${toUnit.symbol}`,
            isSmart: true,
            isExact,
          };
        }
      }
    }

    // Sub-unit clean fractions for time (e.g. 45s -> "3/4 min", 20 min -> "1/3 h", 90s -> "1 1/2 min")
    if (toUnit.id === 'min' || toUnit.id === 'h' || toUnit.id === 'day') {
      const fracStr = toFraction(rawTargetNum, 60, false);
      if (fracStr && fracStr.includes('/')) {
        const fracVal = parseFractionString(fracStr);
        const isExact = Math.abs(fracVal - rawTargetNum) < 1e-5;
        if (isExact && /\/(?:2|3|4|5|6|10|12|15|20|24|30|60)\b/.test(fracStr)) {
          return {
            value: fracStr,
            unit: toUnit.symbol,
            subtext: `≈ ${defaultFormattedValue} ${toUnit.symbol}`,
            isSmart: true,
            isExact: true,
          };
        }
      }
    }
  }

  // 3. Mass & Weight -> Pounds & Ounces or Clean Fractions
  if (categoryId === 'mass') {
    const totalLb = convertUnits(rawFromNum, 'mass', fromUnit.id, 'lb');
    if (totalLb !== null && toUnit.id === 'lb') {
      const absLb = Math.abs(totalLb);
      const wholeLb = Math.floor(absLb);
      const remOz = (absLb - wholeLb) * 16;

      // A. Multi-pound measurements (>= 1 lb): Compound pounds & ounces
      // e.g. 26 oz -> "1 lb 10 oz", 2.5 kg -> "5 lb 8.2 oz"
      if (wholeLb >= 1 && remOz >= 0.05 && remOz <= 15.95) {
        const ozStr = parseFloat(remOz.toFixed(1)).toString();
        const sign = totalLb < 0 ? '-' : '';
        const massStr = `${sign}${formatDisplayNumber(wholeLb)} lb ${ozStr} oz`;
        const totalArchLb = wholeLb + remOz / 16;
        const isExact = Math.abs(totalArchLb - absLb) < 1e-4;
        return {
          value: massStr,
          unit: '',
          subtext: isExact ? `= ${defaultFormattedValue} lb` : `≈ ${defaultFormattedValue} lb`,
          isSmart: true,
          isExact,
        };
      }

      // B. Sub-pound measurements (< 1 lb): Clean rational fraction of a pound
      // e.g. 1 oz -> "1/16 lb", 2 oz -> "1/8 lb", 4 oz -> "1/4 lb", 8 oz -> "1/2 lb", 12 oz -> "3/4 lb"
      if (wholeLb === 0) {
        const fracStr = toFraction(absLb, 64, false);
        if (fracStr && fracStr.includes('/')) {
          const fracVal = parseFractionString(fracStr);
          const isExact = Math.abs(fracVal - absLb) < 1e-5;
          if (isExact || (fromUnit.id === 'oz' && /\/(?:2|4|8|16|32|64)\b/.test(fracStr))) {
            const sign = totalLb < 0 ? '-' : '';
            return {
              value: `${sign}${fracStr}`,
              unit: 'lb',
              subtext: isExact ? `≈ ${defaultFormattedValue} lb` : `≈ ${defaultFormattedValue} lb`,
              isSmart: true,
              isExact,
            };
          }
        }
      }
    }
  }

  // 4. Kitchen & Cooking -> Practical culinary compound drawer tools
  if (categoryId === 'cooking') {
    const compound = getCookingCompoundMeasure(rawTargetNum, toUnit.id, 'cooking');
    if (compound && compound !== `${defaultFormattedValue} ${toUnit.symbol}`) {
      const totalTsp = convertUnits(rawTargetNum, 'cooking', toUnit.id, 'tsp_us');
      const isExact = totalTsp !== null && Math.abs(totalTsp * 2 - Math.round(totalTsp * 2)) < 1e-4;
      return {
        value: compound,
        unit: '',
        subtext: `${isExact ? '=' : '≈'} ${defaultFormattedValue} ${toUnit.symbol}`,
        isSmart: true,
        isExact,
      };
    }
  }

  // 5. Volume & Capacity -> Exact culinary / fluid fractions
  if (categoryId === 'volume') {
    const fracStr = toFraction(rawTargetNum, 128, false);
    if (fracStr && fracStr.includes('/')) {
      const fracVal = parseFractionString(fracStr);
      const isExact = Math.abs(fracVal - rawTargetNum) < 1e-5;
      if (isExact && /\/(?:2|3|4|6|8|12|16|24|27|32|64|128)\b/.test(fracStr)) {
        return {
          value: fracStr,
          unit: toUnit.symbol,
          subtext: `≈ ${defaultFormattedValue} ${toUnit.symbol}`,
          isSmart: true,
          isExact: true,
        };
      }
    }
  }

  // 5. Digital Storage & Data Transfer Rate -> Exact Rational Ratio
  if (categoryId === 'digital' || categoryId === 'data_rate') {
    const fracStr = toFraction(rawTargetNum, 8192, false);
    if (fracStr && fracStr.includes('/')) {
      const isCleanDenom = /\/(?:8|16|32|64|128|256|512|1000|1024|2048|4096|8000|8192)\b/.test(fracStr);
      if (isCleanDenom) {
        const fracVal = parseFractionString(fracStr);
        const isExact = Math.abs(fracVal - rawTargetNum) < 1e-9;
        const op = isExact ? '=' : '≈';
        return {
          value: fracStr,
          unit: toUnit.symbol,
          subtext: `${op} ${defaultFormattedValue} ${toUnit.symbol}`,
          isSmart: true,
          isExact,
        };
      }
    }
  }

  return fallback;
}


/**
 * Format a number for human-readable display with thousands separators (commas).
 * Only formats the integer portion (e.g. 1000000.1234 -> "1,000,000.1234").
 * Preserves exponential notation without injecting commas (e.g. "9.46073e15").
 * Handles negative signs cleanly and is idempotent.
 *
 * @param {number|string} val - Number or numeric string to format
 * @returns {string} - Comma-formatted display string
 */
export function formatDisplayNumber(val) {
  if (val === null || val === undefined || val === '') return '';
  const s = String(val).trim();
  if (s === '-' || s === '') return s;

  // Do not format scientific notation
  if (s.includes('e') || s.includes('E')) return s;

  // Format fractions cleanly for human display
  if (s.includes('/') || s.includes('⁄') || Object.keys(VULGAR_FRACTIONS).some((g) => s.includes(g))) {
    return formatFractionForDisplay(s);
  }

  // Format compound measurements cleanly for human display
  if (isCompoundLike(s)) {
    return formatCompoundForDisplay(s);
  }

  const isNegative = s.startsWith('-');
  const clean = (isNegative ? s.slice(1) : s).replace(/,/g, '');

  const [intPart, decPart] = clean.split('.');

  // Only format if integer part consists solely of digits
  if (!/^\d+$/.test(intPart)) return s;

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Generate structured formula details (both algebraic equation and English instruction).
 */
export function getFormulaDetails(categoryId, fromUnitId, toUnitId) {
  const from = getUnit(categoryId, fromUnitId);
  const to = getUnit(categoryId, toUnitId);
  if (!from || !to) return { equation: '', instruction: '' };

  if (categoryId === 'temperature') {
    if (from.id === 'c' && to.id === 'f') {
      return {
        equation: '°F = (°C × 9/5) + 32',
        instruction: 'Multiply the Celsius temperature by 1.8 (9/5) and add 32',
      };
    }
    if (from.id === 'f' && to.id === 'c') {
      return {
        equation: '°C = (°F − 32) × 5/9',
        instruction: 'Subtract 32 from the Fahrenheit temperature and multiply by 5/9',
      };
    }
    if (from.id === 'c' && to.id === 'k') {
      return {
        equation: 'K = °C + 273.15',
        instruction: 'Add 273.15 to the Celsius temperature',
      };
    }
    if (from.id === 'k' && to.id === 'c') {
      return {
        equation: '°C = K − 273.15',
        instruction: 'Subtract 273.15 from the Kelvin temperature',
      };
    }
    if (from.id === 'f' && to.id === 'k') {
      return {
        equation: 'K = (°F − 32) × 5/9 + 273.15',
        instruction: 'Subtract 32 from Fahrenheit, multiply by 5/9, and add 273.15',
      };
    }
    if (from.id === 'k' && to.id === 'f') {
      return {
        equation: '°F = (K − 273.15) × 9/5 + 32',
        instruction: 'Subtract 273.15 from Kelvin, multiply by 1.8 (9/5), and add 32',
      };
    }
    if (from.id === 'c' && to.id === 'r') {
      return {
        equation: '°R = (°C + 273.15) × 9/5',
        instruction: 'Add 273.15 to Celsius and multiply by 1.8 (9/5)',
      };
    }
    if (from.id === 'r' && to.id === 'c') {
      return {
        equation: '°C = (°R − 491.67) × 5/9',
        instruction: 'Subtract 491.67 from Rankine and multiply by 5/9',
      };
    }
    if (from.id === 'f' && to.id === 'r') {
      return {
        equation: '°R = °F + 459.67',
        instruction: 'Add 459.67 to the Fahrenheit temperature',
      };
    }
    if (from.id === 'r' && to.id === 'f') {
      return {
        equation: '°F = °R − 459.67',
        instruction: 'Subtract 459.67 from the Rankine temperature',
      };
    }
  }

  if (categoryId === 'fuel') {
    if (from.id === 'mpg_us' && to.id === 'l100km') {
      return {
        equation: 'L/100km = 235.215 / mpg (US)',
        instruction: 'Divide 235.215 by the US mpg value',
      };
    }
    if (from.id === 'l100km' && to.id === 'mpg_us') {
      return {
        equation: 'mpg (US) = 235.215 / (L/100km)',
        instruction: 'Divide 235.215 by the L/100km value',
      };
    }
    if ((from.id === 'mpg_uk' || from.id === 'mpg_imp') && to.id === 'l100km') {
      return {
        equation: 'L/100km = 282.481 / mpg (UK)',
        instruction: 'Divide 282.481 by the Imperial mpg value',
      };
    }
    if (from.id === 'l100km' && (to.id === 'mpg_uk' || to.id === 'mpg_imp')) {
      return {
        equation: 'mpg (UK) = 282.481 / (L/100km)',
        instruction: 'Divide 282.481 by the L/100km value',
      };
    }
    if (from.id === 'kml' && to.id === 'l100km') {
      return {
        equation: 'L/100km = 100 / (km/L)',
        instruction: 'Divide 100 by the km/L value',
      };
    }
    if (from.id === 'l100km' && to.id === 'kml') {
      return {
        equation: 'km/L = 100 / (L/100km)',
        instruction: 'Divide 100 by the L/100km value',
      };
    }
    if (from.id === 'mi_kwh' && to.id === 'kwh_100km') {
      return {
        equation: 'kWh/100km = 62.137 / (mi/kWh)',
        instruction: 'Divide 62.137 by the mi/kWh value',
      };
    }
    if (from.id === 'kwh_100km' && to.id === 'mi_kwh') {
      return {
        equation: 'mi/kWh = 62.137 / (kWh/100km)',
        instruction: 'Divide 62.137 by the kWh/100km value',
      };
    }
  }

  // Factor based
  const factor = convertUnits(1, categoryId, from.id, to.id);
  if (factor !== null) {
    // If factor < 1 and reciprocal 1/factor is a clean integer (e.g. stick to cup = / 2, in to ft = / 12),
    // prefer clean division over multiplying by fractions/decimals
    if (factor > 0 && factor < 1) {
      const inv = 1 / factor;
      const roundedInv = Math.round(inv);
      if (Math.abs(inv - roundedInv) < 1e-7 && roundedInv >= 2) {
        const formattedInv = formatNumber(roundedInv);
        return {
          equation: `${to.symbol} = ${from.symbol} / ${formattedInv}`,
          instruction: `Divide the ${from.name.toLowerCase()} value by ${formattedInv}`,
        };
      }
    }

    const formattedFactor = parseFloat(Number(factor).toPrecision(10)).toString();
    return {
      equation: `${to.symbol} = ${from.symbol} × ${formattedFactor}`,
      instruction: `Multiply the ${from.name.toLowerCase()} value by ${formattedFactor}`,
    };
  }

  return { equation: '', instruction: '' };
}

/**
 * Generate human-readable formula string for a conversion.
 */
export function getFormulaString(categoryId, fromUnitId, toUnitId) {
  const details = getFormulaDetails(categoryId, fromUnitId, toUnitId);
  return details.equation || '';
}

/**
 * Generate benchmark values table (1, 2, 5, 10, 20, 50, 100, 500, 1000)
 */
export function getQuickReferenceTable(categoryId, fromUnitId, toUnitId) {
  const sampleValues = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
  return sampleValues.map((v) => {
    const converted = convertUnits(v, categoryId, fromUnitId, toUnitId);
    return {
      fromValue: v,
      toValue: converted !== null ? formatNumber(converted) : '-',
    };
  });
}

/**
 * Filter and prioritize units based on user search term.
 * Prioritizes units that start with the search term while preserving all other matches.
 *
 * Priority tiers:
 * 0. Exact match (symbol, ID, name, or alias equals query)
 * 1. Primary prefix match (primary name, plural, symbol, or ID starts with query)
 * 2. Word-boundary or alias prefix match (word within name/plural starts with query, or alias starts with query)
 * 3. Substring match (query appears anywhere within name, plural, symbol, ID, or aliases)
 *
 * Within the same priority tier, the original unit order is preserved.
 *
 * @param {Array<object>} units - List of unit objects
 * @param {string} search - User search string
 * @returns {Array<object>} - Filtered and prioritized units
 */
export function filterAndSortUnits(units, search) {
  if (!Array.isArray(units)) return [];
  if (!search || typeof search !== 'string') return units;

  const rawQuery = search.trim().toLowerCase();
  if (!rawQuery) return units;

  const queryNoDeg = rawQuery.replace(/^°/, '');

  const matchesWithRank = [];

  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (!u) continue;

    const name = (u.name || '').toLowerCase();
    const plural = (u.plural || '').toLowerCase();
    const symbol = (u.symbol || '').toLowerCase();
    const symbolNoDeg = symbol.replace(/^°/, '');
    const id = (u.id || '').toLowerCase();
    const subtitle = (u.subtitle || '').toLowerCase();
    const badge = (u.badge || '').toLowerCase();
    const aliases = (u.aliases || []).map((a) => (a || '').toLowerCase().replace(/^°/, ''));

    // Check if unit matches query anywhere
    const hasSubstringMatch =
      name.includes(rawQuery) ||
      plural.includes(rawQuery) ||
      symbol.includes(rawQuery) ||
      (queryNoDeg.length > 0 && symbolNoDeg.includes(queryNoDeg)) ||
      id.includes(rawQuery) ||
      subtitle.includes(rawQuery) ||
      badge.includes(rawQuery) ||
      aliases.some((a) => a.includes(rawQuery) || (queryNoDeg.length > 0 && a.includes(queryNoDeg)));

    if (!hasSubstringMatch) {
      continue;
    }

    // Determine priority tier
    // 0: Exact match (symbol, ID, name, plural, alias)
    // 1: Primary prefix match (name, plural, symbol, ID starts with query)
    // 2: Word-boundary prefix or alias prefix match
    // 3: Substring match (query anywhere inside)
    let rank = 3;

    const isExact =
      id === rawQuery ||
      symbol === rawQuery ||
      (queryNoDeg.length > 0 && symbolNoDeg === queryNoDeg) ||
      name === rawQuery ||
      plural === rawQuery ||
      aliases.some((a) => a === rawQuery || (queryNoDeg.length > 0 && a === queryNoDeg));

    if (isExact) {
      rank = 0;
    } else {
      const isPrimaryPrefix =
        name.startsWith(rawQuery) ||
        plural.startsWith(rawQuery) ||
        symbol.startsWith(rawQuery) ||
        (queryNoDeg.length > 0 && symbolNoDeg.startsWith(queryNoDeg)) ||
        id.startsWith(rawQuery);

      if (isPrimaryPrefix) {
        rank = 1;
      } else {
        const nameWords = name.split(/[\s\-_/]+/);
        const pluralWords = plural.split(/[\s\-_/]+/);
        const subtitleWords = subtitle.split(/[\s\-_/]+/);
        const isWordPrefix =
          nameWords.some((w) => w.startsWith(rawQuery)) ||
          pluralWords.some((w) => w.startsWith(rawQuery)) ||
          subtitleWords.some((w) => w.startsWith(rawQuery)) ||
          badge.startsWith(rawQuery) ||
          aliases.some((a) => a.startsWith(rawQuery) || (queryNoDeg.length > 0 && a.startsWith(queryNoDeg)));

        if (isWordPrefix) {
          rank = 2;
        }
      }
    }

    matchesWithRank.push({ unit: u, rank, index: i });
  }

  // Stable sort: by priority tier (rank) ascending, then original index ascending
  matchesWithRank.sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.index - b.index;
  });

  return matchesWithRank.map((item) => item.unit);
}
