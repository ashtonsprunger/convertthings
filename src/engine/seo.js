/**
 * ConvertThings SEO & SERP Metadata Generator
 * Generates high-CTR, grammatically correct titles, rich answer-first meta descriptions,
 * canonical URLs, and structured Schema.org JSON-LD data for all unit pairs and categories.
 */

import {
  CATEGORIES,
  UNIT_DEFINITIONS,
  getUnit,
  convertUnits,
  formatNumber,
  getFormulaDetails,
} from './conversions.js';

/**
 * Returns complete SEO metadata for any conversion state or category.
 *
 * @param {object} params
 * @param {string} params.categoryId e.g. 'mass'
 * @param {string} [params.fromUnitId] e.g. 'lb'
 * @param {string} [params.toUnitId] e.g. 'kg'
 * @param {string|number} [params.value] e.g. '1' or '100'
 * @param {string} [params.domain] e.g. 'https://www.convertthings.com'
 * @returns {object} { title, description, canonicalUrl, h1, directAnswer, formulaEquation, formulaInstruction, ogTitle, ogDescription }
 */
export function getSeoMetadata({
  categoryId,
  fromUnitId,
  toUnitId,
  value = '1',
  domain = 'https://www.convertthings.com',
}) {
  const cleanDomain = (domain || 'https://www.convertthings.com').replace(/\/$/, '');

  // 1. Fallback to homepage metadata if no category or unit specified
  if (!categoryId || !UNIT_DEFINITIONS[categoryId]) {
    return {
      title: 'ConvertThings - Instant, Accurate Online Unit Converter',
      description:
        'Convert units instantly across 15 domains: length, weight, temperature, area, volume, speed, digital storage, and cooking. Fast, free, and accurate.',
      canonicalUrl: `${cleanDomain}/`,
      h1: 'Instant, Accurate Unit Converter',
      directAnswer: null,
      ogTitle: 'ConvertThings - Instant, Accurate Online Unit Converter',
      ogDescription:
        'Bidirectional, high-precision unit conversions across 15 domains with exact formulas and comparison tables.',
    };
  }

  const category = CATEGORIES.find((c) => c.id === categoryId) || { id: categoryId, name: categoryId };
  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);

  // 2. Category Landing Page (e.g. /length, /mass)
  if (!fromUnit || !toUnit || fromUnit.id === toUnit.id) {
    const sampleUnits = (UNIT_DEFINITIONS[categoryId]?.units || [])
      .slice(0, 5)
      .map((u) => u.plural || u.name)
      .join(', ');

    return {
      title: `${category.name} Converter - Fast, Accurate Unit Conversion | ConvertThings`,
      description: `Free online ${category.name.toLowerCase()} converter. Instantly convert between ${sampleUnits}, and more with exact scientific formulas.`,
      canonicalUrl: `${cleanDomain}/${categoryId}`,
      h1: `${category.name} Unit Conversions`,
      directAnswer: null,
      ogTitle: `${category.name} Converter | ConvertThings`,
      ogDescription: `Convert ${category.name.toLowerCase()} units with exact precision, formula breakdowns, and live comparison tables.`,
    };
  }

  // 3. Unit Pair Conversion (e.g. lb to kg, km to mi)
  const valStr = value !== null && value !== undefined ? String(value).trim() : '1';
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
  };
}
