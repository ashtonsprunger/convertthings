import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, getUnit } from '../engine/conversions';
import { Icon } from './Icons';

const CATEGORY_SEO_INFO = {
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
    description: 'Convert liters, milliliters, US gallons, Imperial gallons, fluid ounces, cups, tablespoons, teaspoons, and cubic meters.',
    baseUnitInfo: 'The SI unit of volume is the cubic meter (m³). The liter (L) is equal to 1 cubic decimeter (0.001 m³).',
    commonPairs: [
      { from: 'gal_us', to: 'l', tip: '1 US gallon is exactly 231 cubic inches, or approx. 3.78541 liters.' },
      { from: 'cup_us', to: 'ml', tip: '1 standard US cup equals 8 fluid ounces, or approx. 236.588 milliliters.' },
      { from: 'gal_uk', to: 'gal_us', tip: '1 Imperial gallon (4.546 L) is ~20% larger than a US gallon (3.785 L).' },
      { from: 'floz_us', to: 'ml', tip: '1 US fluid ounce is approximately 29.5735 milliliters.' },
    ],
    faqs: [
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
  }
};

export function SeoContent({ categoryId, fromUnitId, toUnitId, onSelectPair }) {
  const [openFaq, setOpenFaq] = useState(null);

  const activeCategory = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const info = useMemo(() => {
    return CATEGORY_SEO_INFO[categoryId] || {
      title: `${activeCategory.name} Unit Conversions`,
      description: `Easily convert all units of ${activeCategory.name.toLowerCase()} with instantaneous, high-precision calculations.`,
      baseUnitInfo: `Accurately calibrated against standard international physical constants.`,
      commonPairs: [],
      faqs: [
        {
          q: `How accurate are ${activeCategory.name} conversions on ConvertThings?`,
          a: 'All conversions utilize exact scientific constants and floating-point compensation to ensure results are 100% reliable for engineering, cooking, scientific, and everyday needs.'
        },
        {
          q: 'Can I use ConvertThings offline?',
          a: 'Yes, ConvertThings runs client-side in your browser, enabling fast conversions even with intermittent connectivity.'
        }
      ]
    };
  }, [categoryId, activeCategory.name]);

  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);

  // Dynamic structured data for Google Rich Results
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: info.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    };

    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'ConvertThings Unit Converter',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Instant, accurate bidirectional unit conversion web tool for length, mass, temperature, volume, time, data, and more.',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'ct-schema-faq';
    script.text = JSON.stringify([faqSchema, webAppSchema]);

    const oldScript = document.getElementById('ct-schema-faq');
    if (oldScript) {
      oldScript.remove();
    }
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('ct-schema-faq');
      if (el) el.remove();
    };
  }, [categoryId, info]);

  return (
    <article className="ct-seo-section">
      <header className="ct-seo-header">
        <h2 className="ct-seo-title">{info.title}</h2>
        <p className="ct-seo-lead">{info.description}</p>
      </header>

      {/* Conversion Guide */}
      <section className="ct-seo-guide">
        <h3 className="ct-guide-heading">
          <Icon name="BookOpen" size={18} />
          <span>Understanding {activeCategory.name} Conversions</span>
        </h3>
        <p className="ct-guide-text">{info.baseUnitInfo}</p>

        {fromUnit && toUnit && fromUnit.id !== toUnit.id && (
          <div className="ct-guide-spotlight">
            <h4 className="ct-spotlight-title">
              Converting {fromUnit.plural || fromUnit.name} to {toUnit.plural || toUnit.name}
            </h4>
            <p>
              When converting from <strong>{fromUnit.name} ({fromUnit.symbol})</strong> to{' '}
              <strong>{toUnit.name} ({toUnit.symbol})</strong>, use the live converter above for instantaneous calculation, or refer to the standardized conversion factor and step-by-step formula.
            </p>
          </div>
        )}

        {info.commonPairs && info.commonPairs.length > 0 && (
          <div className="ct-popular-pairs-grid">
            {info.commonPairs.map((pair, idx) => {
              const u1 = getUnit(categoryId, pair.from);
              const u2 = getUnit(categoryId, pair.to);
              if (!u1 || !u2) return null;
              const pairHref = `/convert/${u1.id}-to-${u2.id}`;

              return (
                <a
                  key={idx}
                  href={pairHref}
                  className="ct-pair-card"
                  onClick={(e) => {
                    if (onSelectPair) {
                      e.preventDefault();
                      onSelectPair(categoryId, u1.id, u2.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  title={`Convert ${u1.plural || u1.name} to ${u2.plural || u2.name}`}
                >
                  <div className="ct-pair-name">
                    {u1.name} ⇄ {u2.name}
                  </div>
                  <div className="ct-pair-tip">{pair.tip}</div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="ct-seo-faq" aria-label="Frequently Asked Questions">
        <h3 className="ct-faq-heading">Frequently Asked Questions</h3>
        <div className="ct-faq-list">
          {info.faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`ct-faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="ct-faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="ct-faq-question-text">{faq.q}</span>
                  <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
                </button>
                {isOpen && (
                  <div className="ct-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
