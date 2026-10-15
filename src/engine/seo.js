/**
 * ConvertThings SEO & SERP Metadata Generator
 * Generates high-CTR, grammatically correct titles, rich answer-first meta descriptions,
 * canonical URLs, pair-specific editorial guides, worked examples, reference tables,
 * and structured Schema.org JSON-LD data for all unit pairs and categories.
 */

import {
  CATEGORIES,
  UNIT_DEFINITIONS,
  getUnit,
  convertUnits,
  formatNumber,
  getFormulaDetails,
  getQuickReferenceTable,
} from './conversions.js';

export const CATEGORY_SEO_INFO = {
  length: {
    title: 'Length and Distance Unit Conversions',
    description: 'Convert meters, kilometers, miles, feet, inches, yards, nautical miles, and more with exact precision.',
    baseUnitInfo: 'The standard SI base unit of length is the meter (m), defined as the distance traveled by light in a vacuum in 1/299,792,458 of a second.',
    commonPairs: [
      { from: 'km', to: 'mi', tip: 'Multiply kilometers by ~0.621371 to get miles, or divide miles by 0.621371 to get kilometers.' },
      { from: 'in', to: 'cm', tip: '1 inch is legally and scientifically defined as exactly 2.54 centimeters.' },
      { from: 'ft', to: 'm', tip: '1 foot is defined as exactly 0.3048 meters (12 inches).' },
      { from: 'mi', to: 'nmi', tip: '1 nautical mile is exactly 1,852 meters (~1.15078 statute miles).' },
    ],
    faqs: [
      {
        q: 'How many miles are in a kilometer?',
        a: 'There are approximately 0.621371 miles in 1 kilometer. To convert kilometers to miles quickly in your head, multiply by 6 and divide by 10 (or multiply by 0.6).'
      },
      {
        q: 'How do I convert inches to centimeters?',
        a: 'Multiply the length in inches by 2.54. For example, 10 inches is equal to 25.4 centimeters.'
      },
      {
        q: 'What is the difference between statute miles and nautical miles?',
        a: 'A statute mile (land mile) is 5,280 feet or 1,609.344 meters. A nautical mile is based on one minute of latitude on Earth and is standardized as 1,852 meters (approx. 6,076.12 feet).'
      }
    ]
  },
  mass: {
    title: 'Weight and Mass Unit Conversions',
    description: 'Convert kilograms, pounds, ounces, grams, stone, metric tons, carats, and more with scientific precision.',
    baseUnitInfo: 'The standard SI base unit of mass is the kilogram (kg), defined in terms of the Planck constant (h = 6.62607015 × 10⁻³⁴ J⋅s).',
    commonPairs: [
      { from: 'lb', to: 'kg', tip: '1 avoirdupois pound is legally defined as exactly 0.45359237 kilograms.' },
      { from: 'oz', to: 'g', tip: '1 ounce is approximately 28.3495 grams (1/16 of a pound).' },
      { from: 'st', to: 'lb', tip: '1 British stone is exactly equal to 14 pounds (approx. 6.35029 kg).' },
      { from: 'kg', to: 'g', tip: '1 kilogram equals exactly 1,000 grams.' },
    ],
    faqs: [
      {
        q: 'How many pounds are in 1 kilogram?',
        a: '1 kilogram equals approximately 2.20462 pounds. A quick mental trick is to multiply kilograms by 2.2.'
      },
      {
        q: 'What is the difference between mass and weight?',
        a: 'Mass is the fundamental quantity of matter in an object and remains constant anywhere in the universe. Weight is the gravitational force exerted on that mass. On Earth, mass and weight units are commonly used interchangeably in everyday commerce.'
      },
      {
        q: 'How many ounces are in a pound?',
        a: 'There are 16 ounces in one avoirdupois pound (the common commercial pound).'
      }
    ]
  },
  temperature: {
    title: 'Temperature Unit Conversions',
    description: 'Convert between Celsius (°C), Fahrenheit (°F), Kelvin (K), and Rankine (°R) using exact thermodynamic formulas.',
    baseUnitInfo: 'The Kelvin (K) is the primary thermodynamic temperature scale, where 0 K represents absolute zero.',
    commonPairs: [
      { from: 'c', to: 'f', tip: 'Multiply Celsius by 9/5 (1.8) and add 32 to get Fahrenheit.' },
      { from: 'f', to: 'c', tip: 'Subtract 32 from Fahrenheit and multiply by 5/9 to get Celsius.' },
      { from: 'c', to: 'k', tip: 'Add 273.15 to Celsius to find temperature in Kelvin.' },
      { from: 'f', to: 'k', tip: 'Convert Fahrenheit to Celsius first, then add 273.15 for Kelvin.' },
    ],
    faqs: [
      {
        q: 'What is the formula to convert Celsius to Fahrenheit?',
        a: 'The formula is: °F = (°C × 9/5) + 32. For example, 100°C × 1.8 + 32 = 212°F.'
      },
      {
        q: 'What is the formula to convert Fahrenheit to Celsius?',
        a: 'The formula is: °C = (°F − 32) × 5/9. For example, (68°F − 32) × 5/9 = 20°C.'
      },
      {
        q: 'At what temperature are Celsius and Fahrenheit equal?',
        a: 'Celsius and Fahrenheit read the exact same number at -40 degrees (-40°C = -40°F).'
      }
    ]
  },
  area: {
    title: 'Area Unit Conversions',
    description: 'Convert square feet, square meters, acres, hectares, square miles, and square kilometers.',
    baseUnitInfo: 'The SI unit of area is the square meter (m²). 1 hectare equals 10,000 square meters, and 1 acre equals 43,560 square feet.',
    commonPairs: [
      { from: 'sqft', to: 'sqm', tip: 'Multiply square feet by 0.092903 to get square meters (or divide by 10.7639).' },
      { from: 'ac', to: 'sqft', tip: '1 US surveyed acre is legally defined as exactly 43,560 square feet.' },
      { from: 'ha', to: 'ac', tip: '1 hectare equals approximately 2.47105 acres (10,000 square meters).' },
      { from: 'sqmi', to: 'sqkm', tip: '1 square mile equals approximately 2.58999 square kilometers.' },
    ],
    faqs: [
      {
        q: 'How many square feet are in an acre?',
        a: 'There are exactly 43,560 square feet in one standard acre.'
      },
      {
        q: 'How do I convert square meters to square feet?',
        a: 'Multiply square meters by 10.7639. For example, 50 m² equals approximately 538.2 square feet.'
      }
    ]
  },
  volume: {
    title: 'Volume and Capacity Unit Conversions',
    description: 'Convert liters, milliliters, US gallons, Imperial gallons, fluid ounces, cups, tablespoons, teaspoons, cubic feet, cubic yards, and cubic meters.',
    baseUnitInfo: 'The SI unit of volume is the cubic meter (m³). The liter (L) is equal to 1 cubic decimeter (0.001 m³).',
    commonPairs: [
      { from: 'gal_us', to: 'l', tip: '1 US gallon is exactly 231 cubic inches, or approx. 3.78541 liters.' },
      { from: 'cuyd', to: 'cuft', tip: '1 cubic yard is equal to exactly 27 cubic feet (3 ft × 3 ft × 3 ft, or ~764.555 liters).' },
      { from: 'cup_us', to: 'ml', tip: '1 standard US cup equals 8 fluid ounces, or approx. 236.588 milliliters.' },
      { from: 'gal_uk', to: 'gal_us', tip: '1 Imperial gallon (4.546 L) is ~20% larger than a US gallon (3.785 L).' },
      { from: 'floz_us', to: 'ml', tip: '1 US fluid ounce is approximately 29.5735 milliliters.' },
    ],
    faqs: [
      {
        q: 'How many cubic feet are in a cubic yard?',
        a: 'There are exactly 27 cubic feet in 1 cubic yard (3 ft × 3 ft × 3 ft = 27 ft³). To convert cubic feet to cubic yards, divide by 27.'
      },
      {
        q: 'How much volume is in a cubic yard of dirt or mulch?',
        a: 'A cubic yard measures 3 feet wide by 3 feet long by 3 feet deep (27 cubic feet, or approx. 764.55 liters). It is the standard commercial measure used for buying bulk topsoil, gravel, mulch, and ordering ready-mix concrete.'
      },
      {
        q: 'How many cups are in a gallon?',
        a: 'In the US customary system, 1 US gallon contains 16 cups (4 quarts = 8 pints = 16 cups).'
      },
      {
        q: 'What is the difference between a US gallon and an Imperial gallon?',
        a: 'A US liquid gallon is 3.78541 liters (128 US fl oz), while an Imperial (UK) gallon is 4.54609 liters (160 Imperial fl oz). The Imperial gallon is about 20% larger.'
      }
    ]
  },
  speed: {
    title: 'Speed and Velocity Unit Conversions',
    description: 'Convert miles per hour (mph), kilometers per hour (km/h), meters per second (m/s), knots, and Mach.',
    baseUnitInfo: 'The SI base unit of speed is the meter per second (m/s). 1 knot equals 1 nautical mile per hour (1.852 km/h).',
    commonPairs: [
      { from: 'mph', to: 'kmh', tip: 'Multiply miles per hour by 1.609344 to get kilometers per hour.' },
      { from: 'kmh', to: 'mph', tip: 'Multiply km/h by ~0.621371 to calculate miles per hour.' },
      { from: 'knot', to: 'mph', tip: '1 nautical knot is approximately 1.15078 statute miles per hour.' },
      { from: 'mps', to: 'kmh', tip: 'Multiply meters per second by 3.6 to get kilometers per hour.' },
    ],
    faqs: [
      {
        q: 'How do you convert km/h to mph quickly?',
        a: 'Multiply the km/h speed by 0.6. For example, 100 km/h is approximately 60 to 62 mph.'
      },
      {
        q: 'What is a knot in speed?',
        a: 'A knot is a unit of speed equal to one nautical mile per hour, or exactly 1.852 kilometers per hour (~1.151 mph).'
      }
    ]
  },
  time: {
    title: 'Time Unit Conversions',
    description: 'Convert seconds, minutes, hours, days, weeks, months, years, decades, and centuries.',
    baseUnitInfo: 'The standard SI base unit of time is the second (s), calibrated against cesium-133 hyperfine resonance.',
    commonPairs: [
      { from: 'h', to: 'min', tip: '1 hour equals exactly 60 minutes or 3,600 seconds.' },
      { from: 'd', to: 'h', tip: '1 day contains exactly 24 hours or 1,440 minutes.' },
      { from: 'min', to: 's', tip: '1 minute equals exactly 60 seconds.' },
      { from: 'wk', to: 'd', tip: '1 week contains exactly 7 days or 168 hours.' },
    ],
    faqs: [
      {
        q: 'How many hours are in a year?',
        a: 'In a standard 365-day year, there are 8,760 hours. In a 366-day leap year, there are 8,784 hours.'
      },
      {
        q: 'How many seconds are in a day?',
        a: 'There are exactly 86,400 seconds in a 24-hour day (24 × 60 × 60).'
      }
    ]
  },
  digital: {
    title: 'Digital Storage & Data Memory Conversions',
    description: 'Convert bits, bytes, kilobytes, megabytes, gigabytes, terabytes, petabytes, and binary mebibytes/gibibytes.',
    baseUnitInfo: '1 Byte equals 8 bits. Decimal storage standards use powers of 1000 (1 GB = 1000 MB), while binary memory uses powers of 1024 (1 GiB = 1024 MiB).',
    commonPairs: [
      { from: 'gb', to: 'mb', tip: '1 gigabyte (GB) equals 1,000 megabytes (MB) in standard decimal notation.' },
      { from: 'tb', to: 'gb', tip: '1 terabyte (TB) equals 1,000 gigabytes (GB) or 1,000,000 MB.' },
      { from: 'mb', to: 'kb', tip: '1 megabyte (MB) equals 1,000 kilobytes (KB).' },
      { from: 'byte', to: 'b', tip: '1 byte equals exactly 8 bits.' },
    ],
    faqs: [
      {
        q: 'What is the difference between GB and GiB?',
        a: 'GB (Gigabyte) uses the decimal system (10⁹ = 1,000,000,000 bytes), commonly used by drive manufacturers. GiB (Gibibyte) uses binary (2³⁰ = 1,073,741,824 bytes), commonly used by operating systems.'
      },
      {
        q: 'How many megabytes are in a gigabyte?',
        a: 'In standard decimal storage, there are 1,000 megabytes in 1 gigabyte.'
      }
    ]
  },
  data_rate: {
    title: 'Data Transfer Rate & Internet Speed Conversions',
    description: 'Convert Mbps, Gbps, Kbps, MB/s, and KB/s for network bandwidth and download calculations.',
    baseUnitInfo: 'Internet service providers advertise bandwidth in Megabits per second (Mbps). Real download speeds are displayed in Megabytes per second (MB/s). 8 Mbps = 1 MB/s.',
    commonPairs: [
      { from: 'mbps', to: 'mbs', tip: 'Divide Mbps bandwidth by 8 to calculate real-world download speed in MB/s.' },
      { from: 'gbps', to: 'mbps', tip: '1 Gigabit per second (Gbps) equals 1,000 Megabits per second (Mbps).' },
      { from: 'mbs', to: 'mbps', tip: 'Multiply download rate in MB/s by 8 to determine network bandwidth in Mbps.' },
      { from: 'mbps', to: 'kbps', tip: '1 Megabit per second equals 1,000 Kilobits per second.' },
    ],
    faqs: [
      {
        q: 'Why is my download speed slower than my internet plan in Mbps?',
        a: 'Internet plans are sold in megabits (Mbps), while files download in megabytes (MB/s). Because 8 bits equal 1 byte, a 100 Mbps connection downloads at maximum ~12.5 MB/s.'
      },
      {
        q: 'How many Mbps is 1 Gbps?',
        a: '1 Gigabit per second (Gbps) is equal to 1,000 Megabits per second (Mbps).'
      }
    ]
  },
  pressure: {
    title: 'Pressure Unit Conversions',
    description: 'Convert PSI, bar, pascals (Pa), kilopascals (kPa), standard atmospheres (atm), and torr / mmHg.',
    baseUnitInfo: 'The SI unit of pressure is the pascal (Pa). Standard sea-level atmosphere is defined as 101,325 Pa (1.01325 bar or ~14.696 psi).',
    commonPairs: [
      { from: 'psi', to: 'bar', tip: 'Multiply PSI by ~0.0689476 to convert to bar.' },
      { from: 'bar', to: 'psi', tip: 'Multiply bar by ~14.5038 to find pressure in pounds per square inch (PSI).' },
      { from: 'kpa', to: 'psi', tip: '1 PSI equals approximately 6.89476 kilopascals (kPa).' },
      { from: 'atm', to: 'psi', tip: '1 standard atmosphere equals approximately 14.6959 PSI.' },
    ],
    faqs: [
      {
        q: 'How many PSI is in 1 bar?',
        a: '1 bar equals approximately 14.5038 PSI. For car tires, 2.2 bar is roughly 32 PSI.'
      },
      {
        q: 'What is standard atmospheric pressure?',
        a: 'Standard atmospheric pressure at sea level is 1 atm, equal to 101.325 kPa, 1.01325 bar, or 14.696 PSI.'
      }
    ]
  },
  energy: {
    title: 'Energy & Work Unit Conversions',
    description: 'Convert joules, kilojoules, calories, food kilocalories, kilowatt-hours (kWh), and British thermal units (BTU).',
    baseUnitInfo: 'The SI unit of energy is the joule (J). 1 food calorie (kcal) equals 1,000 small gram-calories, or exactly 4,184 joules.',
    commonPairs: [
      { from: 'j', to: 'cal', tip: '1 thermochemical calorie equals exactly 4.184 joules.' },
      { from: 'kwh', to: 'j', tip: '1 kilowatt-hour (kWh) equals exactly 3,600,000 joules (3.6 MJ).' },
      { from: 'kcal', to: 'kj', tip: '1 food calorie (kcal) equals exactly 4.184 kilojoules (kJ).' },
      { from: 'btu', to: 'j', tip: '1 British Thermal Unit (BTU) equals approximately 1,055.06 joules.' },
    ],
    faqs: [
      {
        q: 'What is the difference between a calorie and a kilocalorie (kcal)?',
        a: 'A small calorie (cal) heats 1 gram of water by 1°C. A dietary calorie (food calorie / Calorie / kcal) equals 1,000 small calories or 4.184 kJ.'
      },
      {
        q: 'How many joules are in a kilowatt-hour?',
        a: 'There are exactly 3,600,000 joules (3.6 megajoules) in 1 kilowatt-hour of electrical energy.'
      }
    ]
  },
  power: {
    title: 'Power Unit Conversions',
    description: 'Convert watts, kilowatts, megawatts, mechanical horsepower (hp), and metric horsepower (PS).',
    baseUnitInfo: 'The SI unit of power is the watt (W), equal to 1 joule per second. 1 mechanical horsepower equals ~745.7 watts.',
    commonPairs: [
      { from: 'hp', to: 'kw', tip: '1 mechanical horsepower equals approximately 0.7457 kilowatts.' },
      { from: 'kw', to: 'hp', tip: 'Multiply kilowatts by ~1.34102 to calculate mechanical horsepower.' },
      { from: 'kw', to: 'w', tip: '1 kilowatt equals exactly 1,000 watts.' },
      { from: 'mw', to: 'kw', tip: '1 megawatt equals exactly 1,000 kilowatts or 1,000,000 watts.' },
    ],
    faqs: [
      {
        q: 'How many watts are in 1 horsepower?',
        a: '1 mechanical (imperial) horsepower equals approximately 745.7 watts. 1 metric horsepower (PS) equals ~735.5 watts.'
      },
      {
        q: 'How do you convert kilowatts to horsepower?',
        a: 'Multiply the kilowatt value by 1.341. For example, 100 kW engine output equals approximately 134 hp.'
      }
    ]
  },
  angle: {
    title: 'Angle & Rotation Conversions',
    description: 'Convert degrees, radians, gradians, arcminutes, arcseconds, and full revolutions.',
    baseUnitInfo: 'A circle contains 360 degrees, 2π radians (~6.28318 rad), or 400 gradians.',
    commonPairs: [
      { from: 'deg', to: 'rad', tip: 'Multiply degrees by π / 180 (~0.0174533) to get radians.' },
      { from: 'rad', to: 'deg', tip: 'Multiply radians by 180 / π (~57.2958) to get degrees.' },
      { from: 'rev', to: 'deg', tip: '1 full revolution (turn) equals exactly 360 degrees.' },
      { from: 'arcmin', to: 'deg', tip: '1 degree contains exactly 60 arcminutes (1 arcminute = 1/60 degree).' },
    ],
    faqs: [
      {
        q: 'How many radians are in 180 degrees?',
        a: '180 degrees equals exactly π radians (approximately 3.14159265 radians).'
      },
      {
        q: 'How do you convert radians to degrees?',
        a: 'Multiply the radian value by 180 and divide by π (approx. multiply by 57.2958).'
      }
    ]
  },
  fuel: {
    title: 'Fuel Economy Conversions',
    description: 'Convert US miles per gallon (MPG), UK Imperial MPG, liters per 100km (L/100km), and km/L.',
    baseUnitInfo: 'L/100km is an inverse consumption metric: lower values signify higher fuel efficiency, unlike MPG.',
    commonPairs: [
      { from: 'mpg_us', to: 'l100km', tip: 'Divide 235.215 by US MPG to find fuel consumption in L/100km.' },
      { from: 'l100km', to: 'mpg_us', tip: 'Divide 235.215 by L/100km to find equivalent US MPG.' },
      { from: 'mpg_uk', to: 'mpg_us', tip: '1 UK Imperial MPG equals approximately 0.832674 US MPG.' },
      { from: 'kml', to: 'mpg_us', tip: 'Multiply kilometers per liter by ~2.35215 to find US MPG.' },
    ],
    faqs: [
      {
        q: 'How do I convert MPG to L/100km?',
        a: 'Divide 235.215 by the US MPG number. For example, 30 MPG equals approx 7.84 L/100km.'
      },
      {
        q: 'Why is UK MPG different from US MPG?',
        a: 'An Imperial (UK) gallon is 4.546 liters, while a US gallon is 3.785 liters. Therefore, a vehicle achieves ~20% higher MPG in the UK for the exact same efficiency.'
      }
    ]
  },
  cooking: {
    title: 'Cooking & Kitchen Measurement Conversions',
    description: 'Convert cups, tablespoons, teaspoons, fluid ounces, milliliters, pinches, dashes, and sticks of butter.',
    baseUnitInfo: 'In standard US culinary measurements, 1 cup = 16 tablespoons = 48 teaspoons = 8 fluid ounces (~236.6 mL).',
    commonPairs: [
      { from: 'cup_us', to: 'tbsp_us', tip: '1 standard US cup contains exactly 16 tablespoons.' },
      { from: 'tbsp_us', to: 'tsp_us', tip: '1 US tablespoon equals exactly 3 US teaspoons.' },
      { from: 'cup_us', to: 'ml', tip: '1 US cup equals approximately 236.588 milliliters.' },
      { from: 'floz_us', to: 'tbsp_us', tip: '1 US fluid ounce equals exactly 2 US tablespoons.' },
      { from: 'stick_butter', to: 'tbsp_us', tip: '1 US stick of butter equals 8 tablespoons (1/2 cup or 4 oz).' },
    ],
    faqs: [
      {
        q: 'How many tablespoons are in a cup?',
        a: 'There are exactly 16 tablespoons in 1 US standard cup.'
      },
      {
        q: 'How many teaspoons are in a tablespoon?',
        a: 'There are exactly 3 teaspoons in 1 tablespoon.'
      },
      {
        q: 'How much is a stick of butter in cups and tablespoons?',
        a: '1 standard US stick of butter equals 1/2 cup, 8 tablespoons, 4 ounces, or approx. 113.4 grams.'
      }
    ]
  },
  frequency: {
    title: 'Frequency Unit Conversions',
    description: 'Convert hertz (Hz), kilohertz (kHz), megahertz (MHz), gigahertz (GHz), RPM, radians per second, and degrees per second with exact precision.',
    baseUnitInfo: 'The standard SI unit of frequency is the hertz (Hz), defined as one complete cycle or oscillation per second (1 s⁻¹).',
    commonPairs: [
      { from: 'hz', to: 'rpm', tip: 'Multiply Hertz by 60 to calculate Revolutions per Minute (RPM = Hz × 60).' },
      { from: 'rpm', to: 'hz', tip: 'Divide RPM by 60 to find frequency in Hertz (Hz = RPM ÷ 60).' },
      { from: 'ghz', to: 'mhz', tip: '1 gigahertz (GHz) contains exactly 1,000 megahertz (MHz).' },
      { from: 'mhz', to: 'khz', tip: '1 megahertz (MHz) contains exactly 1,000 kilohertz (kHz).' },
      { from: 'rad_s', to: 'hz', tip: 'Divide radians per second by 2π (~6.283185) to calculate frequency in Hertz.' },
    ],
    faqs: [
      {
        q: 'How do you convert RPM to Hertz (Hz)?',
        a: 'To convert RPM (revolutions per minute) to Hertz (cycles per second), divide by 60. For example, a car engine idling at 600 RPM is spinning at 10 Hz (600 ÷ 60 = 10 Hz).'
      },
      {
        q: 'How many megahertz are in a gigahertz?',
        a: 'There are exactly 1,000 megahertz (MHz) in 1 gigahertz (GHz). For example, a 3.5 GHz CPU processor clock runs at 3,500 MHz.'
      },
      {
        q: 'What is the relationship between frequency and angular velocity?',
        a: 'Angular velocity (ω, in radians per second) is related to cyclic frequency (f, in Hertz) by the formula: ω = 2πf. To convert rad/s to Hz, divide by 2π (approx. 6.283185).'
      }
    ]
  },
  torque: {
    title: 'Torque & Rotational Force Unit Conversions',
    description: 'Convert newton-meters (N·m), foot-pounds (lb-ft), inch-pounds (lb-in), kilogram-force meters (kgf·m), and ounce-inches with exact NIST standards.',
    baseUnitInfo: 'The standard SI unit of torque is the newton-meter (N·m), defined as the moment resulting from a one-newton force applied perpendicularly to a one-meter moment arm.',
    commonPairs: [
      { from: 'nm', to: 'ftlb', tip: 'Multiply Newton-meters by ~0.737562 to get foot-pounds (lb-ft).' },
      { from: 'ftlb', to: 'nm', tip: 'Multiply foot-pounds by ~1.355818 to convert to Newton-meters (N·m).' },
      { from: 'ftlb', to: 'inlb', tip: '1 foot-pound equals exactly 12 inch-pounds (lb-in).' },
      { from: 'inlb', to: 'ftlb', tip: 'Divide inch-pounds by 12 to convert to foot-pounds (lb-ft).' },
      { from: 'kgfm', to: 'nm', tip: '1 kilogram-force meter equals exactly 9.80665 Newton-meters.' },
    ],
    faqs: [
      {
        q: 'How do you convert Newton-meters (N·m) to foot-pounds (ft-lb)?',
        a: 'Multiply the torque value in N·m by 0.737562 (or divide by 1.355818). For example, 100 N·m is equal to approximately 73.76 lb-ft.'
      },
      {
        q: 'How do you convert foot-pounds (ft-lb) to Newton-meters (N·m)?',
        a: 'Multiply the torque value in ft-lb by 1.355818. For example, 100 ft-lb of automotive lug nut torque equals approximately 135.58 N·m.'
      },
      {
        q: 'What is the difference between ft-lb (foot-pound) and in-lb (inch-pound)?',
        a: '1 foot-pound equals exactly 12 inch-pounds. Inch-pounds are typically used for precision fasteners on bicycles, electronics, and delicate automotive valve covers, while foot-pounds are used for wheel lug nuts and heavy machinery.'
      }
    ]
  },
  force: {
    title: 'Force Unit Conversions',
    description: 'Convert newtons (N), kilonewtons (kN), pounds-force (lbf), kilograms-force (kgf), dynes, and kips with exact NIST physical constants.',
    baseUnitInfo: 'The SI unit of force is the newton (N), defined as the force required to accelerate a mass of one kilogram at one meter per second squared (1 N = 1 kg·m/s²).',
    commonPairs: [
      { from: 'n', to: 'lbf', tip: 'Multiply Newtons by ~0.224809 to convert to pounds-force (lbf).' },
      { from: 'lbf', to: 'n', tip: 'Multiply pounds-force by ~4.448222 to convert to Newtons (N).' },
      { from: 'kn', to: 'lbf', tip: '1 kilonewton (kN) equals 1,000 Newtons or approximately 224.81 pounds-force.' },
      { from: 'kgf', to: 'n', tip: '1 kilogram-force (kgf / kilopond) equals exactly 9.80665 Newtons.' },
      { from: 'kip', to: 'kn', tip: '1 kip (1,000 lbf) equals approximately 4.44822 kilonewtons.' },
    ],
    faqs: [
      {
        q: 'How do you convert Newtons (N) to pounds-force (lbf)?',
        a: 'Multiply the force value in Newtons by 0.224809 (or divide by 4.448222). For example, 100 N equals approximately 22.48 lbf.'
      },
      {
        q: 'What is a kilonewton (kN) used for?',
        a: 'A kilonewton equals 1,000 Newtons (~224.81 lbf). It is standard in civil engineering, rocketry thrust, and rock climbing safety equipment ratings (e.g. carabiners typically hold 20-25 kN).'
      },
      {
        q: 'What is the difference between mass (pounds/kilograms) and force (lbf/Newtons)?',
        a: 'Mass measures the amount of matter in an object, while force measures the interaction (push or pull) acting on it. Under standard Earth gravity (9.80665 m/s²), a 1-pound mass exerts 1 pound-force (1 lbf = 4.448 N), and a 1-kilogram mass exerts 1 kilogram-force (9.807 N).'
      }
    ]
  },
  flow_rate: {
    title: 'Volumetric Flow Rate Unit Conversions',
    description: 'Convert cubic feet per minute (CFM), liters per second (L/s), liters per minute (L/min), cubic meters per hour (m³/h), and gallons per minute (GPM) with precision.',
    baseUnitInfo: 'The standard SI unit of volumetric flow rate is cubic meters per second (m³/s), representing the volume of fluid that passes through a given cross-sectional area per second.',
    commonPairs: [
      { from: 'cfm', to: 'l_s', tip: 'Multiply CFM by ~0.471947 to calculate airflow in liters per second (L/s).' },
      { from: 'l_s', to: 'cfm', tip: 'Multiply liters per second by ~2.11888 to calculate airflow in CFM.' },
      { from: 'gpm_us', to: 'l_min', tip: 'Multiply US GPM by ~3.78541 to calculate flow in liters per minute (L/min).' },
      { from: 'm3_h', to: 'cfm', tip: 'Multiply cubic meters per hour by ~0.588578 to calculate airflow in CFM.' },
      { from: 'cfm', to: 'm3_h', tip: 'Multiply CFM by ~1.69901 to convert to cubic meters per hour (m³/h).' },
    ],
    faqs: [
      {
        q: 'How do you convert CFM to liters per second (L/s)?',
        a: 'Multiply the CFM value by 0.471947. For example, a 100 CFM ventilation fan moves approximately 47.19 L/s of air.'
      },
      {
        q: 'What is CFM and why is it important in HVAC?',
        a: 'CFM stands for Cubic Feet per Minute. It measures the volume of air moved by a fan, air conditioner, or ventilation system every minute. Proper CFM ensures adequate heating, cooling, and air exchange in residential and commercial spaces.'
      },
      {
        q: 'How do you convert US Gallons per Minute (GPM) to Liters per Minute (L/min)?',
        a: 'Multiply GPM by 3.78541. For example, a 5 GPM water pump or showerhead delivers approximately 18.93 liters per minute.'
      }
    ]
  },
  typography: {
    title: 'Typography & Digital Design Unit Conversions',
    description: 'Convert pixels (px), points (pt), rems, ems, picas, CSS inches, and millimeters based on standard W3C 96 DPI digital baseline specifications.',
    baseUnitInfo: 'In standard digital design and CSS specifications (W3C CSS Values Module), the reference pixel (px) is calibrated to 1/96th of an inch (96 DPI baseline).',
    commonPairs: [
      { from: 'px', to: 'rem', tip: 'Divide pixels by 16 to get root rems (assuming default 16px browser base font size).' },
      { from: 'rem', to: 'px', tip: 'Multiply rem by 16 to get the computed pixel value (1.5 rem = 24 px).' },
      { from: 'pt', to: 'px', tip: 'Multiply typography points by 4/3 (~1.333) to get CSS pixels (12 pt = 16 px).' },
      { from: 'px', to: 'pt', tip: 'Multiply CSS pixels by 0.75 (3/4) to get typography points (16 px = 12 pt).' },
      { from: 'pc', to: 'px', tip: '1 pica equals exactly 12 points or 16 CSS pixels.' },
    ],
    faqs: [
      {
        q: 'How do you convert pixels (px) to rem?',
        a: 'Divide the pixel value by 16 (assuming default root font size of 16px). For example, 16px = 1rem, 24px = 1.5rem, and 32px = 2rem.'
      },
      {
        q: 'What is the difference between rem and em in web development?',
        a: 'Both are relative units. A rem ("root em") is always relative to the root <html> element font size (typically 16px). An em is relative to the font size of its immediate parent element, which can compound in nested structures.'
      },
      {
        q: 'How do you convert print points (pt) to screen pixels (px)?',
        a: 'At the standard 96 DPI CSS baseline, 1 point (1/72 inch) equals 96/72 = 1.3333 pixels. Conversely, 1 pixel = 0.75 points (e.g. 16px = 12pt font size).'
      }
    ]
  },
  current: {
    title: 'Electric Current & Battery Charge Conversions',
    description: 'Convert amperes (A), milliamperes (mA), microamperes (µA), kiloamperes (kA), ampere-hours (Ah), and milliampere-hours (mAh) with precision.',
    baseUnitInfo: 'The standard SI base unit of electric current is the ampere (A), defined by taking the fixed numerical value of the elementary charge e to be 1.602176634 × 10⁻¹⁹ coulombs per second.',
    commonPairs: [
      { from: 'a', to: 'ma', tip: '1 ampere (A) equals exactly 1,000 milliamperes (mA).' },
      { from: 'ma', to: 'a', tip: 'Divide milliamperes by 1,000 to convert to amperes (500 mA = 0.5 A).' },
      { from: 'mah', to: 'ah', tip: 'Divide milliampere-hours by 1,000 to convert battery capacity to ampere-hours (5,000 mAh = 5 Ah).' },
      { from: 'ah', to: 'mah', tip: 'Multiply ampere-hours by 1,000 to get battery capacity in milliampere-hours (mAh).' },
      { from: 'ua', to: 'ma', tip: '1 milliampere contains 1,000 microamperes (µA).' },
    ],
    faqs: [
      {
        q: 'How do you convert mAh (milliampere-hours) to Ah (ampere-hours)?',
        a: 'To convert mAh to Ah, divide the mAh rating by 1,000. For example, a 5,000 mAh smartphone battery or power bank has a capacity of 5 Ah (5,000 ÷ 1,000 = 5 Ah).'
      },
      {
        q: 'What is the difference between Amperes (A) and Ampere-hours (Ah)?',
        a: 'Amperes (A) measure instantaneous electric current (the rate of electron flow), while Ampere-hours (Ah) measure total electric charge storage or battery capacity over time (1 Ah = 3,600 coulombs).'
      },
      {
        q: 'How many milliamperes are in 1 Ampere?',
        a: 'There are exactly 1,000 milliamperes (mA) in 1 Ampere (A). Microcontrollers like Arduino typically consume between 20 mA and 50 mA during normal operation.'
      }
    ]
  },
  illuminance: {
    title: 'Illuminance & Light Level Unit Conversions',
    description: 'Convert lux (lx), foot-candles (fc), phots (ph), and kilolux (klx) with standard photometric SI constants.',
    baseUnitInfo: 'The SI unit of illuminance is the lux (lx), which equals one lumen per square meter (1 lx = 1 lm/m²). It quantifies the intensity of light falling on a given surface.',
    commonPairs: [
      { from: 'lx', to: 'fc', tip: 'Multiply lux by ~0.092903 to calculate illuminance in foot-candles (or divide lux by 10.7639).' },
      { from: 'fc', to: 'lx', tip: 'Multiply foot-candles by ~10.7639 to convert to lux (1 fc ≈ 10.764 lx).' },
      { from: 'klx', to: 'lx', tip: '1 kilolux equals exactly 1,000 lux (typical overcast daylight is 1–10 klx).' },
      { from: 'ph', to: 'lx', tip: '1 phot equals exactly 10,000 lux (1 lumen per square centimeter).' },
    ],
    faqs: [
      {
        q: 'How do you convert foot-candles (fc) to lux (lx)?',
        a: 'Multiply the foot-candle value by 10.7639. For example, standard office lighting of 50 fc equals approximately 538.2 lux (50 × 10.7639 ≈ 538 lx).'
      },
      {
        q: 'What is the difference between a foot-candle and a lux?',
        a: 'Both measure illuminance (light falling on a surface). Lux is the metric SI unit (1 lumen per square meter), while foot-candle is the imperial US customary unit (1 lumen per square foot). Because 1 square meter is approximately 10.764 square feet, 1 fc ≈ 10.764 lux.'
      },
      {
        q: 'What are typical real-world light levels in lux?',
        a: 'Direct bright sunlight: 32,000 to 100,000 lux; Overcast day: 1,000 to 10,000 lux; Office or classroom work: 300 to 500 lux; Home living room: 100 to 200 lux; Full moon at night: 0.1 to 0.3 lux.'
      }
    ]
  }
};

/**
 * Dedicated SEO & Rich Snippet Metadata for High-Intent Hub Routes.
 * Targets high-volume queries: Height Converter, Tape Measure Fractions, Baking Drawer Fractions.
 */
export const HUB_SEO_INFO = {
  'feet-inches-to-cm': {
    hubId: 'feet-inches-to-cm',
    title: "Height Converter: Feet & Inches to cm (5'10\" to cm Chart) | ConvertThings",
    description: "Convert feet and inches to centimeters instantly. Free height calculator with complete reference chart from 4'10\" to 6'6\", exact formulas, and compound height calculation.",
    canonicalPath: '/convert/feet-inches-to-cm',
    h1: 'Height Converter: Feet & Inches to Centimeters',
    directAnswer: '5 ft 10 in = 177.8 cm',
    baselineAnswer: '177.8',
    targetUnitSymbol: 'cm',
    formulaEquation: 'Height (cm) = (ft × 30.48) + (in × 2.54)',
    formulaInstruction: 'To convert feet and inches to centimeters, multiply feet by 30.48, multiply inches by 2.54, and add the two results together. For example: (5 × 30.48) + (10 × 2.54) = 152.4 + 25.4 = 177.8 cm.',
    faqs: [
      {
        q: 'What is 5 ft 10 in in cm?',
        a: '5 feet 10 inches is equal to exactly 177.8 centimeters (or 1.778 meters).',
      },
      {
        q: "What is 5'8 in cm?",
        a: '5 feet 8 inches is equal to approximately 172.72 centimeters (or 1.727 meters).',
      },
      {
        q: 'What is 6 foot in cm?',
        a: '6 feet even is equal to exactly 182.88 centimeters (or 1.829 meters).',
      },
      {
        q: 'How do you calculate feet and inches to cm manually?',
        a: 'Multiply the number of feet by 30.48 and the number of inches by 2.54, then add them: (feet × 30.48) + (inches × 2.54) = cm.',
      },
    ],
  },
  'fraction-inches-to-mm': {
    hubId: 'fraction-inches-to-mm',
    title: 'Tape Measure Fraction to mm Converter (1/16" & 1/32" Chart) | ConvertThings',
    description: 'Convert fractional inches to millimeters instantly with carpenter tape tolerances (1/16" ± 1/32"). Complete ruler conversion table from 1/32" to 12".',
    canonicalPath: '/convert/fraction-inches-to-mm',
    h1: 'Tape Measure Fractions to Millimeters Converter',
    directAnswer: '13/16 in = 20.6375 mm',
    baselineAnswer: '20.6375',
    targetUnitSymbol: 'mm',
    formulaEquation: 'mm = (fractional inches) × 25.4',
    formulaInstruction: 'To convert fractional inches to millimeters, divide the fraction numerator by denominator to get decimal inches, then multiply by 25.4 mm. For example: 13 ÷ 16 = 0.8125; 0.8125 × 25.4 = 20.6375 mm.',
    faqs: [
      {
        q: 'What is 13/16 inch in mm?',
        a: '13/16 of an inch is equal to exactly 20.6375 millimeters.',
      },
      {
        q: 'What is 5/8 inch in mm?',
        a: '5/8 of an inch is equal to exactly 15.875 millimeters.',
      },
      {
        q: 'How many mm is 1/16 of an inch?',
        a: '1/16 of an inch is equal to exactly 1.5875 millimeters (and 1/32" is 0.79375 mm).',
      },
      {
        q: 'How do you convert fraction inches to mm?',
        a: 'Divide the numerator by the denominator to get decimal inches, then multiply by 25.4. For example: 13 ÷ 16 = 0.8125; 0.8125 × 25.4 = 20.6375 mm.',
      },
    ],
  },
  'baking-fractions': {
    hubId: 'baking-fractions',
    title: 'Baking Measurement Converter: Cups to Tablespoons & Teaspoons | ConvertThings',
    description: 'Convert odd cup fractions into practical kitchen drawer measuring spoons. Complete cooking equivalents chart for 1/8, 1/4, 1/3, 1/2, 2/3, and 3/4 cups to tbsp, tsp, and mL.',
    canonicalPath: '/convert/baking-fractions',
    h1: 'Baking Fractions & Kitchen Measurement Converter',
    directAnswer: '1/3 cup = 5 tbsp + 1 tsp (80 mL)',
    baselineAnswer: '5 tbsp + 1 tsp',
    targetUnitSymbol: 'tbsp',
    formulaEquation: '1 cup = 16 tablespoons = 48 teaspoons (~236.59 mL)',
    formulaInstruction: 'To convert cup fractions to measuring spoons, multiply cups by 16 for tablespoons, or by 48 for teaspoons. For example: 1/3 cup × 16 = 5.33 tbsp (5 tbsp + 1 tsp).',
    faqs: [
      {
        q: 'How many tablespoons are in 1/3 cup?',
        a: '1/3 cup equals 5 tablespoons plus 1 teaspoon (or 16 teaspoons total / ~78.86 mL).',
      },
      {
        q: 'How many tablespoons are in 3/4 cup?',
        a: '3/4 cup equals exactly 12 tablespoons (or 6 fluid ounces / ~177.44 mL).',
      },
      {
        q: 'How do I measure 2/3 cup if I only have tablespoons?',
        a: '2/3 cup equals 10 tablespoons plus 2 teaspoons (or 32 teaspoons total / ~157.73 mL).',
      },
      {
        q: 'How many tablespoons are in 1/8 cup?',
        a: '1/8 cup equals exactly 2 tablespoons (or 6 teaspoons / 1 fluid ounce / ~29.57 mL).',
      },
    ],
  },
  'flour-cups-to-grams': {
    hubId: 'flour-cups-to-grams',
    title: 'Flour Cups to Grams Converter (All-Purpose Baking Chart) | ConvertThings',
    description: 'Convert cups of all-purpose flour to grams instantly. Based on King Arthur Baking & USDA standards (1 cup = 120 grams). Free baking weight chart and calculator.',
    canonicalPath: '/convert/flour-cups-to-grams',
    h1: 'Flour Cups to Grams Converter (Baking Weight)',
    directAnswer: '1 US cup All-Purpose Flour = 120 grams',
    baselineAnswer: '120',
    targetUnitSymbol: 'g',
    formulaEquation: 'Grams = (US Cups) × 120',
    formulaInstruction: 'To convert cups of all-purpose flour to grams, multiply the number of cups by 120 (based on standard spooned & leveled method: 1 cup = 120g). For example: 2 cups × 120 = 240g.',
    faqs: [
      {
        q: 'How many grams is 1 cup of all-purpose flour?',
        a: '1 US cup of all-purpose flour equals 120 grams when measured with the standard spoon-and-level method (or ~125g if lightly dipped).',
      },
      {
        q: 'How many grams is 1/2 cup of flour?',
        a: '1/2 cup of all-purpose flour equals exactly 60 grams.',
      },
      {
        q: 'How many cups is 250 grams of flour?',
        a: '250 grams of all-purpose flour is approximately 2.08 cups (or about 2 cups plus 1 tablespoon).',
      },
      {
        q: 'Why should I weigh flour in grams instead of using cups?',
        a: 'A cup of flour can weigh anywhere from 110g to 150g depending on humidity, brand, and how tightly packed it is. Weighing in grams ensures exact baking ratios every time.',
      },
    ],
  },
};

export const HOMEPAGE_FAQS = [
  {
    q: 'How accurate are the unit conversions on ConvertThings?',
    a: 'Every conversion factor on ConvertThings is calibrated against official NIST Special Publication 811 (National Institute of Standards and Technology) and ISO/IEC 80000 metrology constants. Our custom formatting engine also eliminates IEEE 754 binary floating-point rounding artifacts.',
  },
  {
    q: 'How do I convert compound measurements like 5 ft 10 in or 2 lbs 4 oz?',
    a: 'You can type compound measurements directly into either the main input field or the universal search bar (press "/" to focus). For example, typing "5\'10\\" to cm" or "2 lbs 4 oz to g" resolves both components automatically.',
  },
  {
    q: 'Why does Kitchen Studio convert cups to grams differently for each ingredient?',
    a: 'Cups measure volume while grams measure weight (mass). Because ingredients have different bulk densities—1 US cup of all-purpose flour weighs 120 grams, whereas 1 US cup of granulated sugar weighs 200 grams and honey weighs 340 grams—ConvertThings uses USDA and King Arthur Baking density tables for accurate culinary scaling.',
  },
  {
    q: 'How do tape measure fraction conversions work?',
    a: 'When converting metric units (millimeters or centimeters) to inches, or when selecting Tape Measure mode (1/16" ± 1/32"), ConvertThings rounds to the nearest practical carpenter ruler mark and indicates any sub-32nd tolerance offset.',
  },
];

/**
 * Generates rich, pair-specific technical descriptions, worked examples, and FAQs
 * for any valid (categoryId, fromUnit, toUnit) combination.
 */
export function buildPairEditorialContent(categoryId, fromUnit, toUnit) {
  if (!fromUnit || !toUnit || fromUnit.id === toUnit.id) return null;

  const category = CATEGORIES.find((c) => c.id === categoryId) || { id: categoryId, name: categoryId };
  const catInfo = CATEGORY_SEO_INFO[categoryId];
  const baseUnitId = UNIT_DEFINITIONS[categoryId]?.baseUnit;
  const baseUnit = baseUnitId ? getUnit(categoryId, baseUnitId) : null;

  const fromNamePlural = fromUnit.plural || fromUnit.name;
  const toNamePlural = toUnit.plural || toUnit.name;

  const rawBaseline = convertUnits(1, categoryId, fromUnit.id, toUnit.id);
  const baselineAnswer = rawBaseline !== null ? formatNumber(rawBaseline, 6) : '';

  const rawReverse = convertUnits(1, categoryId, toUnit.id, fromUnit.id);
  const reverseAnswer = rawReverse !== null ? formatNumber(rawReverse, 6) : '';

  const forwardFormula = getFormulaDetails(categoryId, fromUnit.id, toUnit.id);
  const reverseFormula = getFormulaDetails(categoryId, toUnit.id, fromUnit.id);

  // Unit technical descriptions
  let fromBaseText = '';
  if (baseUnit && fromUnit.id !== baseUnit.id) {
    const toBaseVal = convertUnits(1, categoryId, fromUnit.id, baseUnit.id);
    if (toBaseVal !== null) {
      fromBaseText = ` Relative to the ${category.name.toLowerCase()} base unit, 1 ${fromUnit.symbol} equals ${formatNumber(toBaseVal, 6)} ${baseUnit.plural || baseUnit.name} (${baseUnit.symbol}).`;
    }
  } else if (baseUnit && fromUnit.id === baseUnit.id) {
    fromBaseText = ` The ${fromUnit.name.toLowerCase()} (${fromUnit.symbol}) serves as the primary reference base unit for the ${category.name.toLowerCase()} domain.`;
  }

  let toBaseText = '';
  if (baseUnit && toUnit.id !== baseUnit.id) {
    const toBaseVal = convertUnits(1, categoryId, toUnit.id, baseUnit.id);
    if (toBaseVal !== null) {
      toBaseText = ` Relative to the ${category.name.toLowerCase()} base unit, 1 ${toUnit.symbol} equals ${formatNumber(toBaseVal, 6)} ${baseUnit.plural || baseUnit.name} (${baseUnit.symbol}).`;
    }
  } else if (baseUnit && toUnit.id === baseUnit.id) {
    toBaseText = ` The ${toUnit.name.toLowerCase()} (${toUnit.symbol}) serves as the primary reference base unit for the ${category.name.toLowerCase()} domain.`;
  }

  const fromContext = fromUnit.subtitle
    ? ` It is widely used in ${fromUnit.subtitle.toLowerCase()}.`
    : ` It is a ${fromUnit.tier === 'common' ? 'standard everyday' : 'specialized technical'} unit of ${category.name.toLowerCase()} measurement.`;

  const toContext = toUnit.subtitle
    ? ` It is widely used in ${toUnit.subtitle.toLowerCase()}.`
    : ` It is a ${toUnit.tier === 'common' ? 'standard everyday' : 'specialized technical'} unit of ${category.name.toLowerCase()} measurement.`;

  const fromUnitDetail = `${fromUnit.name} (${fromUnit.symbol}) is a unit in the ${category.name} measurement category.${fromContext}${fromBaseText}`;
  const toUnitDetail = `${toUnit.name} (${toUnit.symbol}) is a unit in the ${category.name} measurement category.${toContext}${toBaseText}`;

  // Step-by-step worked examples
  const exampleInputs =
    categoryId === 'temperature'
      ? [0, 25, 100]
      : categoryId === 'fuel'
      ? [20, 30, 50]
      : [5, 10, 50];

  const workedExamples = exampleInputs.map((inputVal) => {
    const outRaw = convertUnits(inputVal, categoryId, fromUnit.id, toUnit.id);
    const outputVal = outRaw !== null ? formatNumber(outRaw, 4) : '';
    const inputLabel = Math.abs(inputVal) === 1 ? fromUnit.name : fromNamePlural;
    return {
      inputVal,
      outputVal,
      title: `Convert ${inputVal} ${inputLabel} to ${toNamePlural}`,
      explanation: `Applying the formula (${forwardFormula.equation || `${toUnit.symbol} = ${fromUnit.symbol} × ${baselineAnswer}`}): starting with ${inputVal} ${fromUnit.symbol}, ${
        forwardFormula.instruction ? forwardFormula.instruction.toLowerCase() : `multiply by ${baselineAnswer}`
      } to get ${outputVal} ${toUnit.symbol}.`,
    };
  });

  // Pair-specific dynamic FAQs
  const tenRaw = convertUnits(10, categoryId, fromUnit.id, toUnit.id);
  const tenAnswer = tenRaw !== null ? formatNumber(tenRaw, 4) : '';

  const faqs = [
    {
      q: `How many ${toNamePlural.toLowerCase()} are in 1 ${fromUnit.name.toLowerCase()}?`,
      a: `There are ${baselineAnswer} ${toNamePlural.toLowerCase()} (${toUnit.symbol}) in 1 ${fromUnit.name.toLowerCase()} (${fromUnit.symbol}). Conversely, 1 ${toUnit.name.toLowerCase()} equals ${reverseAnswer} ${fromNamePlural.toLowerCase()}.`,
    },
    {
      q: `How do you convert ${fromNamePlural.toLowerCase()} to ${toNamePlural.toLowerCase()}?`,
      a: `To convert ${fromNamePlural.toLowerCase()} (${fromUnit.symbol}) to ${toNamePlural.toLowerCase()} (${toUnit.symbol}), use the formula: ${forwardFormula.equation}. ${forwardFormula.instruction}. For example, 10 ${fromUnit.symbol} equals ${tenAnswer} ${toUnit.symbol}.`,
    },
    {
      q: `How do I convert back from ${toNamePlural.toLowerCase()} to ${fromNamePlural.toLowerCase()}?`,
      a: `To convert in the reverse direction from ${toNamePlural.toLowerCase()} (${toUnit.symbol}) to ${fromNamePlural.toLowerCase()} (${fromUnit.symbol}), use the inverse formula: ${reverseFormula.equation}. ${reverseFormula.instruction} (1 ${toUnit.symbol} = ${reverseAnswer} ${fromUnit.symbol}).`,
    },
    {
      q: `What is the difference between ${fromUnit.name.toLowerCase()} (${fromUnit.symbol}) and ${toUnit.name.toLowerCase()} (${toUnit.symbol})?`,
      a: `Both ${fromUnit.name.toLowerCase()} and ${toUnit.name.toLowerCase()} measure ${category.name.toLowerCase()}. ${fromUnitDetail} ${toUnitDetail}`,
    },
  ];

  if (catInfo?.faqs?.[0]) {
    const catFaq = catInfo.faqs[0];
    if (!faqs.some((f) => f.q.toLowerCase() === catFaq.q.toLowerCase())) {
      faqs.push(catFaq);
    }
  }

  const referenceTable = getQuickReferenceTable(categoryId, fromUnit.id, toUnit.id);

  return {
    reverseAnswer,
    reverseFormulaEquation: reverseFormula.equation,
    reverseFormulaInstruction: reverseFormula.instruction,
    reversePath: `/convert/${toUnit.id}-to-${fromUnit.id}`,
    fromUnitDetail,
    toUnitDetail,
    baseUnitInfo: catInfo?.baseUnitInfo || '',
    workedExamples,
    referenceTable,
    faqs,
  };
}

/**
 * Returns complete SEO metadata for any conversion state or category.
 *
 * @param {object} params
 * @param {string} [params.categoryId] e.g. 'mass'
 * @param {string} [params.fromUnitId] e.g. 'lb'
 * @param {string} [params.toUnitId] e.g. 'kg'
 * @param {string|number} [params.value] e.g. '1' or '100'
 * @param {string} [params.domain] e.g. 'https://www.convertthings.com'
 * @param {boolean} [params.isRoot] Whether on homepage
 * @param {boolean} [params.isCategoryPage] Whether on category landing page
 * @param {string} [params.hubId] Dedicated high-intent hub route ID
 * @returns {object}
 */
export function getSeoMetadata({
  categoryId,
  fromUnitId,
  toUnitId,
  value = '1',
  domain = 'https://www.convertthings.com',
  isRoot = false,
  isCategoryPage = false,
  hubId = null,
  isKitchenStudio = false,
}) {
  const cleanDomain = (domain || 'https://www.convertthings.com').replace(/\/$/, '');

  // 0. Dedicated Kitchen & Baking Studio Metadata
  if (isKitchenStudio) {
    return {
      title: 'Kitchen & Baking Converter | Cups to Grams, Spoons & Density | ConvertThings',
      description:
        'Free high-precision baking and kitchen conversion studio. Convert cups to grams by ingredient density (flour, sugar, butter), measuring drawer spoon breakdowns, and oven temps.',
      canonicalUrl: `${cleanDomain}/kitchen`,
      h1: 'Kitchen & Baking Converter Studio',
      directAnswer: null,
      ogTitle: 'Kitchen & Baking Converter Studio | ConvertThings',
      ogDescription:
        'Convert cups to grams by ingredient density (flour, sugar, butter), measuring drawer spoon breakdowns, and oven temps.',
      faqs: HUB_SEO_INFO['flour-cups-to-grams'].faqs,
      isIndexable: true,
      robots: 'index, follow',
    };
  }

  // 0. Dedicated High-Intent Hub Route Metadata
  if (hubId && HUB_SEO_INFO[hubId]) {
    const hub = HUB_SEO_INFO[hubId];
    return {
      title: hub.title,
      description: hub.description,
      canonicalUrl: `${cleanDomain}${hub.canonicalPath}`,
      h1: hub.h1,
      directAnswer: hub.directAnswer,
      baselineAnswer: hub.baselineAnswer,
      currentAnswer: hub.baselineAnswer,
      formulaEquation: hub.formulaEquation,
      formulaInstruction: hub.formulaInstruction,
      ogTitle: hub.title.replace(' | ConvertThings', ''),
      ogDescription: hub.description,
      faqs: hub.faqs,
      isHubPage: true,
      hubId,
      isIndexable: true,
      robots: 'index, follow',
    };
  }

  // 1. Fallback to homepage metadata if root or no category/unit specified
  if (isRoot || !categoryId || !UNIT_DEFINITIONS[categoryId]) {
    return {
      title: 'ConvertThings - Instant, Accurate Online Unit Converter',
      description:
        'Convert units instantly across 22 domains: length, weight, temperature, area, volume, speed, force, flow rate, typography, electric current, illuminance, frequency, torque, digital storage, and cooking. Fast, free, and accurate.',
      canonicalUrl: `${cleanDomain}/`,
      h1: 'Instant, Accurate Unit Converter',
      directAnswer: null,
      ogTitle: 'ConvertThings - Instant, Accurate Online Unit Converter',
      ogDescription:
        'Bidirectional, high-precision unit conversions across 22 domains with exact formulas and comparison tables.',
      faqs: HOMEPAGE_FAQS,
      isIndexable: true,
      robots: 'index, follow',
    };
  }

  const category = CATEGORIES.find((c) => c.id === categoryId) || { id: categoryId, name: categoryId };
  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);

  // 2. Category Landing Page (e.g. /length, /mass)
  if (isCategoryPage || !fromUnit || !toUnit || fromUnit.id === toUnit.id) {
    const sampleUnits = (UNIT_DEFINITIONS[categoryId]?.units || [])
      .slice(0, 5)
      .map((u) => u.plural || u.name)
      .join(', ');

    const catInfo = CATEGORY_SEO_INFO[categoryId];

    return {
      title: `${category.name} Converter - Fast, Accurate Unit Conversion | ConvertThings`,
      description: `Free online ${category.name.toLowerCase()} converter. Instantly convert between ${sampleUnits}, and more with exact scientific formulas.`,
      canonicalUrl: `${cleanDomain}/${categoryId}`,
      h1: `${category.name} Unit Conversions`,
      directAnswer: null,
      ogTitle: `${category.name} Converter | ConvertThings`,
      ogDescription: `Convert ${category.name.toLowerCase()} units with exact precision, formula breakdowns, and live comparison tables.`,
      baseUnitInfo: catInfo?.baseUnitInfo || '',
      commonPairs: catInfo?.commonPairs || [],
      faqs: catInfo?.faqs || HOMEPAGE_FAQS,
      isIndexable: true,
      robots: 'index, follow',
    };
  }

  // 3. Unit Pair Conversion (e.g. lb to kg, km to mi)
  const rawVal = value !== null && value !== undefined ? String(value).trim().replace(/,/g, '') : '1';
  const valStr = rawVal.endsWith('.') ? rawVal.slice(0, -1) : rawVal;
  const numericVal = parseFloat(valStr);
  const isValidNumber = !isNaN(numericVal);
  const isDefaultOne = !valStr || valStr === '1';

  // Calculate 1-unit baseline direct answer (e.g. 1 lb = 0.453592 kg)
  const rawBaseline = convertUnits(1, categoryId, fromUnit.id, toUnit.id);
  const baselineAnswer = rawBaseline !== null ? formatNumber(rawBaseline, 6) : '';

  // Calculate current value conversion (e.g. 100 lb = 45.359237 kg)
  const rawCurrent = isValidNumber ? convertUnits(numericVal, categoryId, fromUnit.id, toUnit.id) : null;
  const currentAnswer = rawCurrent !== null ? formatNumber(rawCurrent, 6) : baselineAnswer;

  const formula = getFormulaDetails(categoryId, fromUnit.id, toUnit.id);
  const fromNamePlural = fromUnit.plural || fromUnit.name;
  const toNamePlural = toUnit.plural || toUnit.name;

  let title = '';
  let description = '';
  let canonicalPath = `/convert/${fromUnit.id}-to-${toUnit.id}`;
  let h1 = '';

  if (isDefaultOne) {
    // Default pair route: e.g. /convert/lb-to-kg
    // High-CTR title pattern matching real search volume: "Convert Pounds to Kilograms (lb to kg) | ConvertThings"
    title = `Convert ${fromNamePlural} to ${toNamePlural} (${fromUnit.symbol} to ${toUnit.symbol}) | ConvertThings`;
    h1 = `Convert ${fromNamePlural} to ${toNamePlural}`;

    // Direct-answer meta description
    if (baselineAnswer) {
      description = `Convert ${fromNamePlural.toLowerCase()} to ${toNamePlural.toLowerCase()} (${fromUnit.symbol} to ${toUnit.symbol}) with our instant calculator. 1 ${fromUnit.symbol} = ${baselineAnswer} ${toUnit.symbol}. Includes exact formula and reference tables.`;
    } else {
      description = `Easily convert ${fromNamePlural.toLowerCase()} (${fromUnit.symbol}) to ${toNamePlural.toLowerCase()} (${toUnit.symbol}). Free, instant calculator with step-by-step formulas.`;
    }
  } else {
    // Custom value route: e.g. /convert/100-lb-to-kg or /convert/1-lb-to-kg
    canonicalPath = `/convert/${encodeURIComponent(valStr)}-${fromUnit.id}-to-${toUnit.id}`;

    // Proper singular vs plural handling
    const isSingular = Math.abs(numericVal) === 1;
    const fromLabel = isSingular ? fromUnit.name : fromNamePlural;

    title = `${valStr} ${fromLabel} to ${toNamePlural} (${valStr} ${fromUnit.symbol} to ${toUnit.symbol}) | ConvertThings`;
    h1 = `${valStr} ${fromLabel} to ${toNamePlural}`;

    if (currentAnswer) {
      description = `Convert ${valStr} ${fromLabel.toLowerCase()} to ${toNamePlural.toLowerCase()} (${valStr} ${fromUnit.symbol} to ${toUnit.symbol}). ${valStr} ${fromUnit.symbol} = ${currentAnswer} ${toUnit.symbol}. Free online calculator with step-by-step formula.`;
    } else {
      description = `Convert ${valStr} ${fromLabel.toLowerCase()} to ${toNamePlural.toLowerCase()} (${fromUnit.symbol} to ${toUnit.symbol}) with exact precision and step-by-step formulas.`;
    }
  }

  const directAnswer = baselineAnswer ? `1 ${fromUnit.symbol} = ${baselineAnswer} ${toUnit.symbol}` : null;
  const editorial = buildPairEditorialContent(categoryId, fromUnit, toUnit);
  const isCommonPair = fromUnit.tier === 'common' && toUnit.tier === 'common';
  const isIndexable = isDefaultOne;

  return {
    title,
    description,
    canonicalUrl: `${cleanDomain}${canonicalPath}`,
    h1,
    directAnswer,
    baselineAnswer,
    currentAnswer,
    formulaEquation: formula.equation,
    formulaInstruction: formula.instruction,
    ogTitle: title.replace(' | ConvertThings', ''),
    ogDescription: description,
    ...(editorial || {}),
    isCommonPair,
    isIndexable,
    robots: isIndexable ? 'index, follow' : 'noindex, follow',
  };
}
