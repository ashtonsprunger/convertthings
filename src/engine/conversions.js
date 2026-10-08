/**
 * ConvertThings Core Conversion Engine
 * High-precision, zero-dependency unit conversion system.
 * Uses exact NIST/SI definitions where applicable.
 */

export const CATEGORIES = [
  { id: 'length', name: 'Length & Distance', icon: 'Ruler', defaultFrom: 'm', defaultTo: 'ft' },
  { id: 'mass', name: 'Weight & Mass', icon: 'Scale', defaultFrom: 'kg', defaultTo: 'lb' },
  { id: 'temperature', name: 'Temperature', icon: 'Thermometer', defaultFrom: 'c', defaultTo: 'f' },
  { id: 'area', name: 'Area', icon: 'Square', defaultFrom: 'sqm', defaultTo: 'sqft' },
  { id: 'volume', name: 'Volume & Capacity', icon: 'Droplet', defaultFrom: 'l', defaultTo: 'gal_us' },
  { id: 'speed', name: 'Speed', icon: 'Gauge', defaultFrom: 'kmh', defaultTo: 'mph' },
  { id: 'time', name: 'Time', icon: 'Clock', defaultFrom: 'h', defaultTo: 'min' },
  { id: 'digital', name: 'Digital Storage', icon: 'HardDrive', defaultFrom: 'gb', defaultTo: 'mb' },
  { id: 'data_rate', name: 'Data Transfer Rate', icon: 'Zap', defaultFrom: 'mbps', defaultTo: 'mbs' },
  { id: 'pressure', name: 'Pressure', icon: 'Compass', defaultFrom: 'bar', defaultTo: 'psi' },
  { id: 'energy', name: 'Energy', icon: 'Sparkles', defaultFrom: 'j', defaultTo: 'cal' },
  { id: 'power', name: 'Power', icon: 'Lightbulb', defaultFrom: 'kw', defaultTo: 'hp' },
  { id: 'angle', name: 'Angle', icon: 'RotateCw', defaultFrom: 'deg', defaultTo: 'rad' },
  { id: 'fuel', name: 'Fuel Economy', icon: 'Fuel', defaultFrom: 'mpg_us', defaultTo: 'l100km' },
  { id: 'cooking', name: 'Kitchen Mode', icon: 'ChefHat', defaultFrom: 'cup_us', defaultTo: 'tbsp_us' },
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
      { id: 'm', name: 'Meter', plural: 'Meters', symbol: 'm', factor: 1, aliases: ['meter', 'meters', 'metre', 'metres'] },
      { id: 'km', name: 'Kilometer', plural: 'Kilometers', symbol: 'km', factor: 1000, aliases: ['kilometer', 'kilometers', 'kilometre', 'kilo', 'km'] },
      { id: 'cm', name: 'Centimeter', plural: 'Centimeters', symbol: 'cm', factor: 0.01, aliases: ['centimeter', 'centimeters', 'centimetre', 'cm'] },
      { id: 'mm', name: 'Millimeter', plural: 'Millimeters', symbol: 'mm', factor: 0.001, aliases: ['millimeter', 'millimeters', 'millimetre', 'mm'] },
      { id: 'um', name: 'Micrometer', plural: 'Micrometers', symbol: 'µm', factor: 1e-6, aliases: ['micrometer', 'micrometers', 'micron', 'microns', 'um', 'µm'] },
      { id: 'nm', name: 'Nanometer', plural: 'Nanometers', symbol: 'nm', factor: 1e-9, aliases: ['nanometer', 'nanometers', 'nm'] },
      { id: 'mi', name: 'Mile', plural: 'Miles', symbol: 'mi', factor: 1609.344, aliases: ['mile', 'miles', 'mi'] },
      { id: 'yd', name: 'Yard', plural: 'Yards', symbol: 'yd', factor: 0.9144, aliases: ['yard', 'yards', 'yd'] },
      { id: 'ft', name: 'Foot', plural: 'Feet', symbol: 'ft', factor: 0.3048, aliases: ['foot', 'feet', 'ft', "'"] },
      { id: 'in', name: 'Inch', plural: 'Inches', symbol: 'in', factor: 0.0254, aliases: ['inch', 'inches', 'in', '"'] },
      { id: 'nmi', name: 'Nautical Mile', plural: 'Nautical Miles', symbol: 'nmi', factor: 1852, aliases: ['nautical mile', 'nautical miles', 'nmi', 'nmile'] },
      { id: 'ly', name: 'Light-Year', plural: 'Light-Years', symbol: 'ly', factor: 9.4607304725808e15, aliases: ['light year', 'light-year', 'light years', 'ly'] },
    ]
  },
  mass: {
    baseUnit: 'kg',
    units: [
      { id: 'kg', name: 'Kilogram', plural: 'Kilograms', symbol: 'kg', factor: 1, aliases: ['kilogram', 'kilograms', 'kilo', 'kilos', 'kg'] },
      { id: 'g', name: 'Gram', plural: 'Grams', symbol: 'g', factor: 0.001, aliases: ['gram', 'grams', 'g'] },
      { id: 'mg', name: 'Milligram', plural: 'Milligrams', symbol: 'mg', factor: 1e-6, aliases: ['milligram', 'milligrams', 'mg'] },
      { id: 'ug', name: 'Microgram', plural: 'Micrograms', symbol: 'µg', factor: 1e-9, aliases: ['microgram', 'micrograms', 'ug', 'µg'] },
      { id: 't', name: 'Metric Ton', plural: 'Metric Tons', symbol: 't', factor: 1000, aliases: ['metric ton', 'tonne', 'tonnes', 'metric tonnes', 't'] },
      { id: 'lb', name: 'Pound', plural: 'Pounds', symbol: 'lb', factor: 0.45359237, aliases: ['pound', 'pounds', 'lb', 'lbs'] },
      { id: 'oz', name: 'Ounce', plural: 'Ounces', symbol: 'oz', factor: 0.028349523125, aliases: ['ounce', 'ounces', 'oz'] },
      { id: 'st', name: 'Stone', plural: 'Stone', symbol: 'st', factor: 6.35029318, aliases: ['stone', 'stones', 'st'] },
      { id: 'ton_us', name: 'US Short Ton', plural: 'US Short Tons', symbol: 'ton (US)', factor: 907.18474, aliases: ['short ton', 'us ton', 'ton'] },
      { id: 'ton_uk', name: 'Imperial Long Ton', plural: 'Imperial Long Tons', symbol: 'ton (UK)', factor: 1016.0469088, aliases: ['long ton', 'imperial ton', 'uk ton'] },
      { id: 'ct', name: 'Carat', plural: 'Carats', symbol: 'ct', factor: 0.0002, aliases: ['carat', 'carats', 'ct'] },
      { id: 'gr', name: 'Grain', plural: 'Grains', symbol: 'gr', factor: 0.00006479891, aliases: ['grain', 'grains', 'gr'] },
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
        toBase: (v) => v,
        fromBase: (v) => v,
        aliases: ['celsius', 'centigrade', 'c', '°c', 'degrees c']
      },
      {
        id: 'f',
        name: 'Fahrenheit',
        plural: 'Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
        aliases: ['fahrenheit', 'f', '°f', 'degrees f']
      },
      {
        id: 'k',
        name: 'Kelvin',
        plural: 'Kelvin',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
        aliases: ['kelvin', 'k', 'degrees kelvin']
      },
      {
        id: 'r',
        name: 'Rankine',
        plural: 'Rankine',
        symbol: '°R',
        toBase: (v) => ((v - 491.67) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 491.67,
        aliases: ['rankine', 'r', '°r']
      }
    ]
  },
  area: {
    baseUnit: 'sqm',
    units: [
      { id: 'sqm', name: 'Square Meter', plural: 'Square Meters', symbol: 'm²', factor: 1, aliases: ['square meter', 'square meters', 'sq meter', 'sq meters', 'sq m', 'sqm', 'm2', 'm²', 'sq metre', 'sq metres'] },
      { id: 'sqkm', name: 'Square Kilometer', plural: 'Square Kilometers', symbol: 'km²', factor: 1e6, aliases: ['square kilometer', 'square kilometers', 'sq km', 'sqkm', 'km2', 'km²'] },
      { id: 'sqcm', name: 'Square Centimeter', plural: 'Square Centimeters', symbol: 'cm²', factor: 0.0001, aliases: ['square centimeter', 'square centimeters', 'sq cm', 'sqcm', 'cm2', 'cm²'] },
      { id: 'sqmm', name: 'Square Millimeter', plural: 'Square Millimeters', symbol: 'mm²', factor: 1e-6, aliases: ['square millimeter', 'sq mm', 'sqmm', 'mm2', 'mm²'] },
      { id: 'sqmi', name: 'Square Mile', plural: 'Square Miles', symbol: 'mi²', factor: 2589988.110336, aliases: ['square mile', 'square miles', 'sq mi', 'sqmi', 'mi2', 'mi²'] },
      { id: 'sqyd', name: 'Square Yard', plural: 'Square Yards', symbol: 'yd²', factor: 0.83612736, aliases: ['square yard', 'square yards', 'sq yd', 'sqyd', 'yd2', 'yd²'] },
      { id: 'sqft', name: 'Square Foot', plural: 'Square Feet', symbol: 'ft²', factor: 0.09290304, aliases: ['square foot', 'square feet', 'sq ft', 'sqft', 'ft2', 'ft²'] },
      { id: 'sqin', name: 'Square Inch', plural: 'Square Inches', symbol: 'in²', factor: 0.00064516, aliases: ['square inch', 'square inches', 'sq in', 'sqin', 'in2', 'in²'] },
      { id: 'ac', name: 'Acre', plural: 'Acres', symbol: 'ac', factor: 4046.8564224, aliases: ['acre', 'acres', 'ac'] },
      { id: 'ha', name: 'Hectare', plural: 'Hectares', symbol: 'ha', factor: 10000, aliases: ['hectare', 'hectares', 'ha'] },
    ]
  },
  volume: {
    baseUnit: 'l',
    units: [
      { id: 'l', name: 'Liter', plural: 'Liters', symbol: 'L', factor: 1, aliases: ['liter', 'liters', 'litre', 'litres', 'l'] },
      { id: 'ml', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', factor: 0.001, aliases: ['milliliter', 'milliliters', 'millilitre', 'ml'] },
      { id: 'cum', name: 'Cubic Meter', plural: 'Cubic Meters', symbol: 'm³', factor: 1000, aliases: ['cubic meter', 'cubic meters', 'm3', 'm³'] },
      { id: 'cucm', name: 'Cubic Centimeter', plural: 'Cubic Centimeters', symbol: 'cm³', factor: 0.001, aliases: ['cubic centimeter', 'cubic centimeters', 'cc', 'cm3', 'cm³'] },
      { id: 'gal_us', name: 'US Gallon', plural: 'US Gallons', symbol: 'gal (US)', factor: 3.785411784, aliases: ['gallon', 'gallons', 'gal', 'us gallon'] },
      { id: 'qt_us', name: 'US Quart', plural: 'US Quarts', symbol: 'qt (US)', factor: 0.946352946, aliases: ['quart', 'quarts', 'qt'] },
      { id: 'pt_us', name: 'US Pint', plural: 'US Pints', symbol: 'pt (US)', factor: 0.473176473, aliases: ['pint', 'pints', 'pt'] },
      { id: 'cup_us', name: 'US Cup', plural: 'US Cups', symbol: 'cup', factor: 0.2365882365, aliases: ['cup', 'cups'] },
      { id: 'floz_us', name: 'US Fluid Ounce', plural: 'US Fluid Ounces', symbol: 'fl oz (US)', factor: 0.0295735295625, aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz', 'oz', 'ounce', 'ounces', 'fl. oz'] },
      { id: 'tbsp_us', name: 'US Tablespoon', plural: 'US Tablespoons', symbol: 'tbsp', factor: 0.01478676478125, aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs'] },
      { id: 'tsp_us', name: 'US Teaspoon', plural: 'US Teaspoons', symbol: 'tsp', factor: 0.00492892159375, aliases: ['teaspoon', 'teaspoons', 'tsp'] },
      { id: 'gal_uk', name: 'Imperial Gallon', plural: 'Imperial Gallons', symbol: 'gal (UK)', factor: 4.54609, aliases: ['imperial gallon', 'uk gallon', 'gal uk'] },
      { id: 'floz_uk', name: 'Imperial Fluid Ounce', plural: 'Imperial Fluid Ounces', symbol: 'fl oz (UK)', factor: 0.0284130625, aliases: ['imperial fluid ounce', 'fl oz uk'] },
      { id: 'cuft', name: 'Cubic Foot', plural: 'Cubic Feet', symbol: 'ft³', factor: 28.316846592, aliases: ['cubic foot', 'cubic feet', 'cu ft', 'ft3'] },
      { id: 'cuin', name: 'Cubic Inch', plural: 'Cubic Inches', symbol: 'in³', factor: 0.016387064, aliases: ['cubic inch', 'cubic inches', 'cu in', 'in3'] },
    ]
  },
  speed: {
    baseUnit: 'mps',
    units: [
      { id: 'mps', name: 'Meter per Second', plural: 'Meters per Second', symbol: 'm/s', factor: 1, aliases: ['meter per second', 'meters per second', 'mps', 'm/s'] },
      { id: 'kmh', name: 'Kilometer per Hour', plural: 'Kilometers per Hour', symbol: 'km/h', factor: 1 / 3.6, aliases: ['kilometer per hour', 'km/h', 'kmh', 'kph'] },
      { id: 'mph', name: 'Mile per Hour', plural: 'Miles per Hour', symbol: 'mph', factor: 0.44704, aliases: ['mile per hour', 'miles per hour', 'mph'] },
      { id: 'knot', name: 'Knot', plural: 'Knots', symbol: 'kn', factor: 1852 / 3600, aliases: ['knot', 'knots', 'kn', 'kt'] },
      { id: 'fps', name: 'Foot per Second', plural: 'Feet per Second', symbol: 'ft/s', factor: 0.3048, aliases: ['foot per second', 'feet per second', 'fps', 'ft/s'] },
      { id: 'mach', name: 'Mach (Standard Sea Level)', plural: 'Mach', symbol: 'Ma', factor: 340.29, aliases: ['mach', 'ma'] },
    ]
  },
  time: {
    baseUnit: 's',
    units: [
      { id: 's', name: 'Second', plural: 'Seconds', symbol: 's', factor: 1, aliases: ['second', 'seconds', 'sec', 's'] },
      { id: 'ms', name: 'Millisecond', plural: 'Milliseconds', symbol: 'ms', factor: 0.001, aliases: ['millisecond', 'milliseconds', 'ms'] },
      { id: 'us', name: 'Microsecond', plural: 'Microseconds', symbol: 'µs', factor: 1e-6, aliases: ['microsecond', 'microseconds', 'us', 'µs'] },
      { id: 'ns', name: 'Nanosecond', plural: 'Nanoseconds', symbol: 'ns', factor: 1e-9, aliases: ['nanosecond', 'nanoseconds', 'ns'] },
      { id: 'min', name: 'Minute', plural: 'Minutes', symbol: 'min', factor: 60, aliases: ['minute', 'minutes', 'min', 'm'] },
      { id: 'h', name: 'Hour', plural: 'Hours', symbol: 'h', factor: 3600, aliases: ['hour', 'hours', 'hr', 'hrs', 'h'] },
      { id: 'd', name: 'Day', plural: 'Days', symbol: 'd', factor: 86400, aliases: ['day', 'days', 'd'] },
      { id: 'wk', name: 'Week', plural: 'Weeks', symbol: 'wk', factor: 604800, aliases: ['week', 'weeks', 'wk', 'wks'] },
      { id: 'mo', name: 'Month (Average)', plural: 'Months', symbol: 'mo', factor: 2629800, aliases: ['month', 'months', 'mo'] },
      { id: 'yr', name: 'Year (365.25 days)', plural: 'Years', symbol: 'yr', factor: 31557600, aliases: ['year', 'years', 'yr', 'yrs'] },
      { id: 'dec', name: 'Decade', plural: 'Decades', symbol: 'decade', factor: 315576000, aliases: ['decade', 'decades'] },
      { id: 'cent', name: 'Century', plural: 'Centuries', symbol: 'century', factor: 3155760000, aliases: ['century', 'centuries'] },
    ]
  },
  digital: {
    baseUnit: 'b',
    units: [
      { id: 'b', name: 'Bit', plural: 'Bits', symbol: 'b', factor: 1, aliases: ['bit', 'bits', 'b'] },
      { id: 'byte', name: 'Byte', plural: 'Bytes', symbol: 'B', factor: 8, aliases: ['byte', 'bytes', 'B'] },
      { id: 'kb', name: 'Kilobyte (Decimal)', plural: 'Kilobytes', symbol: 'KB', factor: 8 * 1e3, aliases: ['kilobyte', 'kilobytes', 'kb'] },
      { id: 'kib', name: 'Kibibyte (Binary)', plural: 'Kibibytes', symbol: 'KiB', factor: 8 * 1024, aliases: ['kibibyte', 'kibibytes', 'kib'] },
      { id: 'mb', name: 'Megabyte (Decimal)', plural: 'Megabytes', symbol: 'MB', factor: 8 * 1e6, aliases: ['megabyte', 'megabytes', 'mb'] },
      { id: 'mib', name: 'Mebibyte (Binary)', plural: 'Mebibytes', symbol: 'MiB', factor: 8 * (1024 ** 2), aliases: ['mebibyte', 'mebibytes', 'mib'] },
      { id: 'gb', name: 'Gigabyte (Decimal)', plural: 'Gigabytes', symbol: 'GB', factor: 8 * 1e9, aliases: ['gigabyte', 'gigabytes', 'gb'] },
      { id: 'gib', name: 'Gibibyte (Binary)', plural: 'Gibibytes', symbol: 'GiB', factor: 8 * (1024 ** 3), aliases: ['gibibyte', 'gibibytes', 'gib'] },
      { id: 'tb', name: 'Terabyte (Decimal)', plural: 'Terabytes', symbol: 'TB', factor: 8 * 1e12, aliases: ['terabyte', 'terabytes', 'tb'] },
      { id: 'tib', name: 'Tebibyte (Binary)', plural: 'Tebibytes', symbol: 'TiB', factor: 8 * (1024 ** 4), aliases: ['tebibyte', 'tebibytes', 'tib'] },
      { id: 'pb', name: 'Petabyte (Decimal)', plural: 'Petabytes', symbol: 'PB', factor: 8 * 1e15, aliases: ['petabyte', 'petabytes', 'pb'] },
    ]
  },
  data_rate: {
    baseUnit: 'bps',
    units: [
      { id: 'bps', name: 'Bit per Second', plural: 'Bits per Second', symbol: 'bps', factor: 1, aliases: ['bps', 'bit/s', 'bits per second'] },
      { id: 'kbps', name: 'Kilobit per Second', plural: 'Kilobits per Second', symbol: 'Kbps', factor: 1e3, aliases: ['kbps', 'kbit/s', 'kilobits per second'] },
      { id: 'mbps', name: 'Megabit per Second', plural: 'Megabits per Second', symbol: 'Mbps', factor: 1e6, aliases: ['mbps', 'mbit/s', 'megabits per second'] },
      { id: 'gbps', name: 'Gigabit per Second', plural: 'Gigabits per Second', symbol: 'Gbps', factor: 1e9, aliases: ['gbps', 'gbit/s', 'gigabits per second'] },
      { id: 'byps', name: 'Byte per Second', plural: 'Bytes per Second', symbol: 'B/s', factor: 8, aliases: ['byte per second', 'bytes per second', 'b/s'] },
      { id: 'kbs', name: 'Kilobyte per Second', plural: 'Kilobytes per Second', symbol: 'KB/s', factor: 8 * 1e3, aliases: ['kb/s', 'kbs', 'kilobytes per second'] },
      { id: 'mbs', name: 'Megabyte per Second', plural: 'Megabytes per Second', symbol: 'MB/s', factor: 8 * 1e6, aliases: ['mb/s', 'mbs', 'megabytes per second'] },
      { id: 'gbs', name: 'Gigabyte per Second', plural: 'Gigabytes per Second', symbol: 'GB/s', factor: 8 * 1e9, aliases: ['gb/s', 'gbs', 'gigabytes per second'] },
    ]
  },
  pressure: {
    baseUnit: 'pa',
    units: [
      { id: 'pa', name: 'Pascal', plural: 'Pascals', symbol: 'Pa', factor: 1, aliases: ['pascal', 'pascals', 'pa'] },
      { id: 'kpa', name: 'Kilopascal', plural: 'Kilopascals', symbol: 'kPa', factor: 1000, aliases: ['kilopascal', 'kilopascals', 'kpa'] },
      { id: 'mpa', name: 'Megapascal', plural: 'Megapascals', symbol: 'MPa', factor: 1e6, aliases: ['megapascal', 'megapascals', 'mpa'] },
      { id: 'bar', name: 'Bar', plural: 'Bars', symbol: 'bar', factor: 100000, aliases: ['bar', 'bars'] },
      { id: 'mbar', name: 'Millibar', plural: 'Millibars', symbol: 'mbar', factor: 100, aliases: ['millibar', 'millibars', 'mbar'] },
      { id: 'psi', name: 'Pound per Square Inch', plural: 'Pounds per Square Inch', symbol: 'psi', factor: 6894.757293168, aliases: ['psi', 'lb/in2', 'pounds per square inch'] },
      { id: 'atm', name: 'Standard Atmosphere', plural: 'Standard Atmospheres', symbol: 'atm', factor: 101325, aliases: ['atmosphere', 'atmospheres', 'atm'] },
      { id: 'torr', name: 'Torr / mmHg', plural: 'Torr', symbol: 'Torr', factor: 133.322368421, aliases: ['torr', 'mmhg', 'millimeter of mercury'] },
      { id: 'inhg', name: 'Inch of Mercury', plural: 'Inches of Mercury', symbol: 'inHg', factor: 3386.389, aliases: ['inhg', 'inch of mercury'] },
      { id: 'hpa', name: 'Hectopascal', plural: 'Hectopascals', symbol: 'hPa', factor: 100, aliases: ['hectopascal', 'hectopascals', 'hpa'] },
    ]
  },
  energy: {
    baseUnit: 'j',
    units: [
      { id: 'j', name: 'Joule', plural: 'Joules', symbol: 'J', factor: 1, aliases: ['joule', 'joules', 'j'] },
      { id: 'kj', name: 'Kilojoule', plural: 'Kilojoules', symbol: 'kJ', factor: 1000, aliases: ['kilojoule', 'kilojoules', 'kj'] },
      { id: 'cal', name: 'Calorie (Gram/Small)', plural: 'Calories', symbol: 'cal', factor: 4.184, aliases: ['calorie', 'calories', 'cal'] },
      { id: 'kcal', name: 'Kilocalorie (Food Calorie)', plural: 'Kilocalories', symbol: 'kcal', factor: 4184, aliases: ['kilocalorie', 'kilocalories', 'kcal', 'food calorie', 'cal'] },
      { id: 'wh', name: 'Watt-hour', plural: 'Watt-hours', symbol: 'Wh', factor: 3600, aliases: ['watt-hour', 'watt hour', 'wh'] },
      { id: 'kwh', name: 'Kilowatt-hour', plural: 'Kilowatt-hours', symbol: 'kWh', factor: 3.6e6, aliases: ['kilowatt-hour', 'kilowatt hour', 'kwh'] },
      { id: 'ev', name: 'Electronvolt', plural: 'Electronvolts', symbol: 'eV', factor: 1.602176634e-19, aliases: ['electronvolt', 'electronvolts', 'ev'] },
      { id: 'btu', name: 'British Thermal Unit', plural: 'BTU', symbol: 'BTU', factor: 1055.05585262, aliases: ['btu', 'british thermal unit'] },
      { id: 'ftlb', name: 'Foot-pound', plural: 'Foot-pounds', symbol: 'ft⋅lb', factor: 1.3558179483314, aliases: ['foot pound', 'ft lb', 'ft-lb'] },
    ]
  },
  power: {
    baseUnit: 'w',
    units: [
      { id: 'w', name: 'Watt', plural: 'Watts', symbol: 'W', factor: 1, aliases: ['watt', 'watts', 'w'] },
      { id: 'kw', name: 'Kilowatt', plural: 'Kilowatts', symbol: 'kW', factor: 1000, aliases: ['kilowatt', 'kilowatts', 'kw'] },
      { id: 'mw', name: 'Megawatt', plural: 'Megawatts', symbol: 'MW', factor: 1e6, aliases: ['megawatt', 'megawatts', 'mw'] },
      { id: 'hp', name: 'Horsepower (Mechanical/US)', plural: 'Horsepower', symbol: 'hp', factor: 745.69987158227022, aliases: ['horsepower', 'hp'] },
      { id: 'hp_metric', name: 'Metric Horsepower (PS)', plural: 'Metric Horsepower', symbol: 'PS', factor: 735.49875, aliases: ['metric horsepower', 'ps', 'cv'] },
      { id: 'btu_h', name: 'BTU per Hour', plural: 'BTU per Hour', symbol: 'BTU/h', factor: 0.29307107, aliases: ['btu per hour', 'btu/h', 'btuh'] },
    ]
  },
  angle: {
    baseUnit: 'deg',
    units: [
      { id: 'deg', name: 'Degree', plural: 'Degrees', symbol: '°', factor: 1, aliases: ['degree', 'degrees', 'deg', '°'] },
      { id: 'rad', name: 'Radian', plural: 'Radians', symbol: 'rad', factor: 180 / Math.PI, aliases: ['radian', 'radians', 'rad'] },
      { id: 'grad', name: 'Gradian', plural: 'Gradians', symbol: 'grad', factor: 0.9, aliases: ['gradian', 'gradians', 'grad'] },
      { id: 'arcmin', name: 'Arcminute', plural: 'Arcminutes', symbol: 'arcmin', factor: 1 / 60, aliases: ['arcminute', 'arcminutes', 'arcmin', "'"] },
      { id: 'arcsec', name: 'Arcsecond', plural: 'Arcseconds', symbol: 'arcsec', factor: 1 / 3600, aliases: ['arcsecond', 'arcseconds', 'arcsec', '"'] },
      { id: 'rev', name: 'Revolution (Turn)', plural: 'Revolutions', symbol: 'rev', factor: 360, aliases: ['revolution', 'revolutions', 'turn', 'turns', 'rev'] },
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
        toBase: (v) => v,
        fromBase: (v) => v,
        aliases: ['l/100km', 'liters per 100 km', 'litres per 100km']
      },
      {
        id: 'mpg_us',
        name: 'Miles per Gallon (US)',
        plural: 'Miles per Gallon (US)',
        symbol: 'mpg (US)',
        toBase: (v) => (v > 0 ? 235.214583 / v : 0),
        fromBase: (v) => (v > 0 ? 235.214583 / v : 0),
        aliases: ['mpg', 'mpg us', 'miles per gallon']
      },
      {
        id: 'mpg_uk',
        name: 'Miles per Gallon (UK)',
        plural: 'Miles per Gallon (UK)',
        symbol: 'mpg (UK)',
        toBase: (v) => (v > 0 ? 282.4809363 / v : 0),
        fromBase: (v) => (v > 0 ? 282.4809363 / v : 0),
        aliases: ['mpg uk', 'imperial mpg']
      },
      {
        id: 'kml',
        name: 'Kilometers per Liter',
        plural: 'Kilometers per Liter',
        symbol: 'km/L',
        toBase: (v) => (v > 0 ? 100 / v : 0),
        fromBase: (v) => (v > 0 ? 100 / v : 0),
        aliases: ['km/l', 'kml', 'kilometers per liter']
      }
    ]
  },
  cooking: {
    baseUnit: 'ml',
    units: [
      { id: 'ml', name: 'Milliliter', plural: 'Milliliters', symbol: 'mL', factor: 1, aliases: ['ml', 'milliliter', 'milliliters'] },
      { id: 'cup_us', name: 'US Cup', plural: 'US Cups', symbol: 'cup', factor: 236.5882365, aliases: ['cup', 'cups', 'c'] },
      { id: 'tbsp_us', name: 'US Tablespoon', plural: 'US Tablespoons', symbol: 'tbsp', factor: 14.78676478125, aliases: ['tablespoon', 'tablespoons', 'tbsp', 'tbs', 'tb'] },
      { id: 'tsp_us', name: 'US Teaspoon', plural: 'US Teaspoons', symbol: 'tsp', factor: 4.92892159375, aliases: ['teaspoon', 'teaspoons', 'tsp', 't'] },
      { id: 'floz_us', name: 'Fluid Ounce', plural: 'Fluid Ounces', symbol: 'fl oz', factor: 29.5735295625, aliases: ['fluid ounce', 'fluid ounces', 'fl oz', 'floz', 'oz', 'ounce', 'ounces', 'fl. oz', 'fluid oz'] },
      { id: 'pinch', name: 'Pinch', plural: 'Pinches', symbol: 'pinch', factor: 0.3080575996, aliases: ['pinch', 'pinches'] },
      { id: 'dash', name: 'Dash', plural: 'Dashes', symbol: 'dash', factor: 0.6161151992, aliases: ['dash', 'dashes'] },
      { id: 'drop', name: 'Drop', plural: 'Drops', symbol: 'drop', factor: 0.05, aliases: ['drop', 'drops', 'gtt'] },
      { id: 'stick_butter', name: 'Stick of Butter (US)', plural: 'Sticks of Butter', symbol: 'stick', factor: 118.29411825, aliases: ['stick of butter', 'stick butter', 'butter stick', 'sticks'] },
      { id: 'l', name: 'Liter', plural: 'Liters', symbol: 'L', factor: 1000, aliases: ['liter', 'liters', 'l'] },
      { id: 'pt_us', name: 'US Pint', plural: 'US Pints', symbol: 'pt', factor: 473.176473, aliases: ['pint', 'pints', 'pt'] },
      { id: 'qt_us', name: 'US Quart', plural: 'US Quarts', symbol: 'qt', factor: 946.352946, aliases: ['quart', 'quarts', 'qt'] },
      { id: 'gal_us', name: 'US Gallon', plural: 'US Gallons', symbol: 'gal', factor: 3785.411784, aliases: ['gallon', 'gallons', 'gal'] },
    ]
  }
};

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
  // e.g. 0.000123456 -> 0.0001235 (4 sig figs), 0.000001 -> 0.000001
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
  };

  if (fromValue === null || fromValue === undefined || fromValue === '' || !toUnit || !fromUnit) {
    return fallback;
  }

  const rawFromNum = typeof fromValue === 'string' && isFractionLike(fromValue)
    ? parseFractionString(fromValue)
    : Number(fromValue);
  const rawTargetNum = typeof targetValue === 'string' && isFractionLike(targetValue)
    ? parseFractionString(targetValue)
    : Number(targetValue);

  if (isNaN(rawFromNum) || isNaN(rawTargetNum) || rawTargetNum === 0) {
    return fallback;
  }

  // 1. Length (Inches & Feet) -> Tape Measure landmark ± 1/32"
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
        };
      }
    } else if (toUnit.id === 'ft') {
      const absTarget = Math.abs(rawTargetNum);
      const wholeFeet = Math.floor(absTarget);
      const remInches = (absTarget - wholeFeet) * 12;
      if (remInches >= 0.02) {
        const tapeRem = toTapeMeasureFraction(remInches);
        if (tapeRem && tapeRem !== '0') {
          const sign = rawTargetNum < 0 ? '-' : '';
          const archStr = `${sign}${wholeFeet > 0 ? `${formatDisplayNumber(wholeFeet)} ft ` : ''}${tapeRem} in`;
          return {
            value: archStr,
            unit: '',
            subtext: `≈ ${defaultFormattedValue} ft`,
            isSmart: true,
          };
        }
      }
    }
  }

  // 2. Time -> Practical Clock Breakdown (Days, Hours, Minutes, Seconds)
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
          return {
            value: durStr,
            unit: '',
            subtext: `≈ ${defaultFormattedValue} ${toUnit.symbol}`,
            isSmart: true,
          };
        }
      }
    }
  }

  // 3. Mass & Weight -> Pounds & Ounces
  if (categoryId === 'mass') {
    const totalLb = convertUnits(rawFromNum, 'mass', fromUnit.id, 'lb');
    if (totalLb !== null && Math.abs(totalLb) >= 1 && toUnit.id === 'lb') {
      const absLb = Math.abs(totalLb);
      const wholeLb = Math.floor(absLb);
      const remOz = (absLb - wholeLb) * 16;
      if (remOz >= 0.05 && remOz <= 15.95) {
        const ozStr = parseFloat(remOz.toFixed(1)).toString();
        const sign = totalLb < 0 ? '-' : '';
        const massStr = `${sign}${wholeLb > 0 ? `${formatDisplayNumber(wholeLb)} lb ` : ''}${ozStr} oz`;
        return {
          value: massStr,
          unit: '',
          subtext: `≈ ${defaultFormattedValue} lb`,
          isSmart: true,
        };
      }
    }
  }

  // 4. Digital Storage & Data Transfer Rate -> Exact Rational Ratio
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
    if (from.id === 'mpg_imp' && to.id === 'l100km') {
      return {
        equation: 'L/100km = 282.481 / mpg (Imp)',
        instruction: 'Divide 282.481 by the Imperial mpg value',
      };
    }
    if (from.id === 'l100km' && to.id === 'mpg_imp') {
      return {
        equation: 'mpg (Imp) = 282.481 / (L/100km)',
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
    const aliases = (u.aliases || []).map((a) => (a || '').toLowerCase().replace(/^°/, ''));

    // Check if unit matches query anywhere
    const hasSubstringMatch =
      name.includes(rawQuery) ||
      plural.includes(rawQuery) ||
      symbol.includes(rawQuery) ||
      (queryNoDeg.length > 0 && symbolNoDeg.includes(queryNoDeg)) ||
      id.includes(rawQuery) ||
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
        const isWordPrefix =
          nameWords.some((w) => w.startsWith(rawQuery)) ||
          pluralWords.some((w) => w.startsWith(rawQuery)) ||
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
