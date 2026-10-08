import React from 'react';

const VULGAR_MAP = {
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

const VULGAR_REGEX = new RegExp(`[${Object.keys(VULGAR_MAP).join('')}]`, 'g');

/**
 * Universal Typographic Fraction Component (<Fraction />).
 * Renders fractions with true diagonal typography, consistent font sizing,
 * raised numerators, lowered denominators, and balanced spacing.
 *
 * Supports:
 * - Direct props: <Fraction num={1} den={8} whole={3} />
 * - String parsing: <Fraction value="1/8 -1/32" />, <Fraction value="3 3/8 +1/32" />,
 *   <Fraction value="5 ft 3 3/8 in" />, <Fraction value="¾ cup" />
 * - Plain strings/numbers fallback: <Fraction value="0.07874" />, <Fraction value="1h 23m" />
 */
export function Fraction({ value, children, num, den, whole, className = '' }) {
  // 1. Direct explicit numerator & denominator props
  if (num !== undefined && den !== undefined) {
    return (
      <span className={`ct-frac-container ${className}`.trim()}>
        {whole !== undefined && whole !== null && (
          <span className="ct-frac-text">{whole} </span>
        )}
        <span className="ct-frac" aria-label={`${num}/${den}`}>
          <span className="ct-frac-num">{num}</span>
          <span className="ct-frac-slash" aria-hidden="true">/</span>
          <span className="ct-frac-den">{den}</span>
        </span>
      </span>
    );
  }

  const raw = value !== undefined && value !== null ? value : children;
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const text = String(raw);

  // 2. Fast path: if no slash and no vulgar fraction glyphs, render text as-is
  const hasVulgar = VULGAR_REGEX.test(text);
  VULGAR_REGEX.lastIndex = 0; // reset regex state
  if (!text.includes('/') && !hasVulgar) {
    return <span className={className || undefined}>{text}</span>;
  }

  // 3. Normalize vulgar fractions to ASCII fractions (e.g. '¾' -> '3/4')
  let normalized = text.replace(VULGAR_REGEX, (match) => VULGAR_MAP[match] || match);

  // 4. Tokenize string into fractions, offsets, and surrounding text
  // Matches either:
  // - Offset fraction: optional whitespace + [+-|−|–] + optional whitespace + digits/digits
  // - Standard fraction: digits/digits
  const tokenRegex = /(\s*(?:[+-]|−|–)\s*\d+\/\d+|\d+\/\d+)/g;
  const parts = normalized.split(tokenRegex);

  return (
    <span className={`ct-frac-container ${className}`.trim()}>
      {parts.map((token, idx) => {
        if (!token) return null;

        // Check if token is an offset fraction: e.g. " -1/32", "+1/32", " - 1/32"
        const offsetMatch = token.match(/^\s*([+-]|−|–)\s*(\d+)\/(\d+)$/);
        if (offsetMatch) {
          const op = offsetMatch[1];
          const n = offsetMatch[2];
          const d = offsetMatch[3];
          const displayOp = op === '+' ? '+' : '−';

          return (
            <span key={idx} className="ct-frac-offset-group">
              <span className="ct-frac-op" aria-hidden="true">{displayOp}</span>
              <span className="ct-frac" aria-label={`${n}/${d}`}>
                <span className="ct-frac-num">{n}</span>
                <span className="ct-frac-slash" aria-hidden="true">/</span>
                <span className="ct-frac-den">{d}</span>
              </span>
            </span>
          );
        }

        // Check if token is a standard fraction: e.g. "1/8", "3/8", "13/16"
        const fracMatch = token.match(/^(\d+)\/(\d+)$/);
        if (fracMatch) {
          const n = fracMatch[1];
          const d = fracMatch[2];

          return (
            <span key={idx} className="ct-frac" aria-label={`${n}/${d}`}>
              <span className="ct-frac-num">{n}</span>
              <span className="ct-frac-slash" aria-hidden="true">/</span>
              <span className="ct-frac-den">{d}</span>
            </span>
          );
        }

        // Surrounding plain text (e.g. "3 ", " in", "5 ft ")
        return (
          <span key={idx} className="ct-frac-text">
            {token}
          </span>
        );
      })}
    </span>
  );
}

export default Fraction;
