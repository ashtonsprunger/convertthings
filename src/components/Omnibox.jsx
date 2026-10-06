import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { parseConversionQuery } from '../engine/parser';

export function Omnibox({ onSelectConversion }) {
  const [query, setQuery] = useState('');
  const [parsed, setParsed] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse as user types
  useEffect(() => {
    if (!query.trim()) {
      setParsed(null);
      return;
    }
    const result = parseConversionQuery(query);
    setParsed(result);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsed && parsed.success && parsed.formattedResult) {
      onSelectConversion({
        categoryId: parsed.categoryId,
        fromUnitId: parsed.fromUnit.id,
        toUnitId: parsed.toUnit.id,
        value: parsed.value,
      });
      setQuery('');
      setParsed(null);
      inputRef.current?.blur();
    }
  };

  return (
    <section className="ct-omnibox-section" aria-label="Quick search and convert">
      <form className={`ct-omnibox-wrapper ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
        <div className="ct-omnibox-icon" title="Smart conversion engine">
          <Icon name="Sparkles" size={17} />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="ct-omnibox-input"
          placeholder="Type any conversion (e.g. 100 km to miles, 72°F in °C, 150 lbs to kg)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          aria-label="Universal conversion search bar"
        />
        {query && (
          <button
            type="button"
            className="ct-omnibox-clear"
            onClick={() => {
              setQuery('');
              setParsed(null);
              inputRef.current?.focus();
            }}
            aria-label="Clear search input"
          >
            <Icon name="X" size={15} />
          </button>
        )}
        <div className="ct-omnibox-shortcut" title="Press '/' anywhere to search">
          <span>/</span>
        </div>
      </form>

      {/* Live parsing result preview */}
      {parsed && parsed.success && parsed.formattedResult && (
        <div
          className="ct-omnibox-preview"
          onClick={() => {
            onSelectConversion({
              categoryId: parsed.categoryId,
              fromUnitId: parsed.fromUnit.id,
              toUnitId: parsed.toUnit.id,
              value: parsed.value,
            });
            setQuery('');
            setParsed(null);
          }}
          role="button"
          tabIndex={0}
          aria-label="Apply parsed conversion"
        >
          <div className="ct-preview-left">
            <span className="ct-preview-tag">Instant Match</span>
            <span className="ct-preview-text">
              <strong>{parsed.value} {parsed.fromUnit.plural || parsed.fromUnit.name}</strong> ={' '}
              <span className="ct-preview-highlight">
                {parsed.formattedResult} {parsed.toUnit.plural || parsed.toUnit.name}
              </span>
            </span>
          </div>
          <span className="ct-preview-hint">Press Enter or click to open</span>
        </div>
      )}
    </section>
  );
}
