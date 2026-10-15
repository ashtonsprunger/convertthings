import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, getUnit } from '../engine/conversions';
import { getSeoMetadata, HUB_SEO_INFO, CATEGORY_SEO_INFO } from '../engine/seo';
import { Icon } from './Icons';

export function SeoContent({ categoryId, fromUnitId, toUnitId, hubId = null, onSelectPair }) {
  const [openFaq, setOpenFaq] = useState(null);

  const hubSeo = useMemo(() => {
    return hubId && HUB_SEO_INFO[hubId] ? HUB_SEO_INFO[hubId] : null;
  }, [hubId]);

  const activeCategory = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);

  const pairSeo = useMemo(() => {
    if (hubSeo) {
      return getSeoMetadata({ hubId, categoryId, fromUnitId, toUnitId });
    }
    if (!fromUnit || !toUnit || fromUnit.id === toUnit.id) return null;
    return getSeoMetadata({ categoryId, fromUnitId, toUnitId, value: '1' });
  }, [hubSeo, hubId, categoryId, fromUnitId, toUnitId, fromUnit, toUnit]);

  const info = useMemo(() => {
    if (hubSeo) {
      return {
        title: hubSeo.h1,
        description: hubSeo.description,
        baseUnitInfo: hubSeo.formulaInstruction,
        commonPairs: [],
        faqs: hubSeo.faqs || [],
      };
    }
    const catBase = CATEGORY_SEO_INFO[categoryId] || {
      title: `${activeCategory.name} Unit Conversions`,
      description: `Easily convert all units of ${activeCategory.name.toLowerCase()} with instantaneous, high-precision calculations.`,
      baseUnitInfo: `Accurately calibrated against standard international physical constants.`,
      commonPairs: [],
      faqs: [
        {
          q: `How accurate are ${activeCategory.name} conversions on ConvertThings?`,
          a: 'All conversions utilize exact scientific constants and floating-point compensation to ensure results are 100% reliable for engineering, cooking, scientific, and everyday needs.',
        },
        {
          q: 'Can I use ConvertThings offline?',
          a: 'Yes, ConvertThings runs client-side in your browser, enabling fast conversions even with intermittent connectivity.',
        },
      ],
    };

    if (pairSeo?.faqs && pairSeo.faqs.length > 0) {
      const mergedFaqs = [...pairSeo.faqs];
      (catBase.faqs || []).forEach((f) => {
        if (!mergedFaqs.some((m) => m.q.toLowerCase() === f.q.toLowerCase())) {
          mergedFaqs.push(f);
        }
      });
      return {
        ...catBase,
        faqs: mergedFaqs,
      };
    }

    return catBase;
  }, [categoryId, hubSeo, activeCategory.name, pairSeo]);

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
      description:
        'Instant, accurate bidirectional unit conversion web tool for length, mass, temperature, volume, time, data, and more.',
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
    <article className={`ct-seo-section ct-cat-${categoryId}`}>
      {/* Primary Guide & Reference Dossier Card */}
      <section className="ct-seo-guide" aria-label={`${activeCategory.name} Conversion Guide`}>
        <header className="ct-guide-header">
          <div className="ct-card-header-left">
            <div className="ct-card-header-badge ct-guide-header-badge" aria-hidden="true">
              <Icon name={activeCategory.icon || 'BookOpen'} size={20} />
            </div>
            <div className="ct-card-title-group">
              <h2 className="ct-seo-title ct-card-heading">{info.title}</h2>
              <p className="ct-seo-lead ct-card-subtitle">{info.description}</p>
            </div>
          </div>
        </header>

        <div className="ct-guide-content">
          <h3 className="ct-guide-heading">
            <span>Understanding {activeCategory.name} Conversions</span>
          </h3>
          <p className="ct-guide-text">{info.baseUnitInfo}</p>

          {fromUnit && toUnit && fromUnit.id !== toUnit.id && pairSeo && (
            <div className="ct-guide-spotlight">
              <h4 className="ct-spotlight-title">
                How to Convert {fromUnit.plural || fromUnit.name} to {toUnit.plural || toUnit.name} ({fromUnit.symbol} to {toUnit.symbol})
              </h4>
              <p className="ct-spotlight-lead">
                <strong>1 {fromUnit.name} ({fromUnit.symbol})</strong> is equal to{' '}
                <strong>{pairSeo.baselineAnswer} {toUnit.plural || toUnit.name} ({toUnit.symbol})</strong>.
                {pairSeo.formulaInstruction
                  ? ` To convert ${fromUnit.plural?.toLowerCase() || fromUnit.name.toLowerCase()} to ${toUnit.plural?.toLowerCase() || toUnit.name.toLowerCase()}, ${pairSeo.formulaInstruction.toLowerCase()}.`
                  : ''}
              </p>
              <div className="ct-spotlight-quickfacts">
                <div className="ct-spotlight-fact">
                  <span className="ct-fact-label">Quick Answer</span>
                  <span className="ct-fact-value">1 {fromUnit.symbol} = {pairSeo.baselineAnswer} {toUnit.symbol}</span>
                </div>
                {pairSeo.formulaEquation && (
                  <div className="ct-spotlight-fact">
                    <span className="ct-fact-label">Formula</span>
                    <span className="ct-fact-value">{pairSeo.formulaEquation}</span>
                  </div>
                )}
                {pairSeo.reverseAnswer && (
                  <div className="ct-spotlight-fact">
                    <span className="ct-fact-label">Inverse Factor</span>
                    <span className="ct-fact-value">1 {toUnit.symbol} = {pairSeo.reverseAnswer} {fromUnit.symbol}</span>
                  </div>
                )}
              </div>

              {pairSeo.fromUnitDetail && pairSeo.toUnitDetail && (
                <div className="ct-unit-definitions" style={{ marginTop: '1rem' }}>
                  <p className="ct-guide-text" style={{ marginBottom: '0.5rem' }}>
                    <strong>About {fromUnit.plural || fromUnit.name} ({fromUnit.symbol}):</strong> {pairSeo.fromUnitDetail}
                  </p>
                  <p className="ct-guide-text" style={{ marginBottom: '0.5rem' }}>
                    <strong>About {toUnit.plural || toUnit.name} ({toUnit.symbol}):</strong> {pairSeo.toUnitDetail}
                  </p>
                </div>
              )}

              {pairSeo.workedExamples && pairSeo.workedExamples.length > 0 && (
                <div className="ct-worked-examples" style={{ marginTop: '1rem' }}>
                  <h5 className="ct-pairs-heading" style={{ marginBottom: '0.5rem' }}>
                    Worked Calculation Examples ({fromUnit.symbol} to {toUnit.symbol})
                  </h5>
                  <ul className="ct-examples-list" style={{ paddingLeft: '1.25rem', margin: 0 }}>
                    {pairSeo.workedExamples.map((ex, idx) => (
                      <li key={idx} className="ct-guide-text" style={{ marginBottom: '0.35rem' }}>
                        <strong>{ex.title}:</strong> {ex.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {info.commonPairs && info.commonPairs.length > 0 && (
            <div className="ct-popular-pairs-section">
              <h4 className="ct-pairs-heading">Popular {activeCategory.name} Conversions</h4>
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
                      <div className="ct-pair-header">
                        <span className="ct-pair-name">
                          {u1.name} ⇄ {u2.name}
                        </span>
                        <span className="ct-pair-arrow" aria-hidden="true">→</span>
                      </div>
                      <div className="ct-pair-tip">{pair.tip}</div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions Card */}
      <section className="ct-faq-card" aria-label="Frequently Asked Questions">
        <header className="ct-faq-header">
          <div className="ct-card-header-left">
            <div className="ct-card-header-badge ct-faq-header-badge" aria-hidden="true">
              <Icon name="HelpCircle" size={20} />
            </div>
            <div className="ct-card-title-group">
              <h3 className="ct-faq-heading ct-card-heading">Frequently Asked Questions</h3>
              <p className="ct-faq-lead ct-card-subtitle">
                Common questions and verified calculations for {activeCategory.name.toLowerCase()} units.
              </p>
            </div>
          </div>
        </header>

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
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className={`ct-faq-chevron ${isOpen ? 'rotated' : ''}`}
                  />
                </button>
                <div
                  className={`ct-faq-answer-wrapper ${isOpen ? 'open' : ''}`}
                  aria-hidden={!isOpen}
                >
                  <div className="ct-faq-answer-inner">
                    <div className="ct-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
