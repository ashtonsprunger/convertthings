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
  volume: {
    title: 'Volume and Capacity Unit Conversions',
    description: 'Convert liters, milliliters, US gallons, Imperial gallons, fluid ounces, cups, tablespoons, teaspoons, and cubic meters.',
    baseUnitInfo: 'The SI unit of volume is the cubic meter (m³). The liter (L) is equal to 1 cubic decimeter (0.001 m³).',
    commonPairs: [
      { from: 'gal_us', to: 'l', tip: '1 US gallon is exactly 231 cubic inches, or approx. 3.78541 liters.' },
      { from: 'cup_us', to: 'ml', tip: '1 standard US cup equals 8 fluid ounces, or approx. 236.588 milliliters.' },
      { from: 'gal_uk', to: 'gal_us', tip: '1 Imperial gallon (4.546 L) is ~20% larger than a US gallon (3.785 L).' },
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
  }
};

export function SeoContent({ categoryId, fromUnitId, toUnitId }) {
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
              return (
                <div key={idx} className="ct-pair-card">
                  <div className="ct-pair-name">
                    {u1.name} ⇄ {u2.name}
                  </div>
                  <div className="ct-pair-tip">{pair.tip}</div>
                </div>
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
