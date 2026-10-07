import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icons';
import { getSearchSuggestions } from '../engine/parser';

const PLACEHOLDER_TIPS = [
  "Search units or try: '100 km to miles'...",
  "Search units or try: '72°F in °C'...",
  "Search units or try: '1 cup to ml'...",
  "Search units or try: '500 sq ft to m²'...",
  "Search units or try: '150 lbs into kg'...",
  "Search units or try: '5'11 to cm'...",
  "Search units or try: '1 gigabyte in megabytes'...",
];

const DISCOVERY_CHIPS = [
  { label: '100 km → mi', query: '100 km to miles' },
  { label: '72°F → °C', query: '72 f in c' },
  { label: '1 cup → ml', query: '1 cup to ml' },
  { label: '500 sq ft → m²', query: '500 sq ft to m²' },
  { label: '150 lbs → kg', query: '150 lbs into kg' },
];

export function Omnibox({ onSelectConversion, onSelectCategory, history = [], favorites = [] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Rotate placeholder tips every 3.2s when search is empty & closed
  useEffect(() => {
    if (query || isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TIPS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [query, isOpen]);

  // Keyboard shortcut '/' to focus search anywhere on page
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute suggestions dynamically
  const suggestions = useMemo(() => {
    return getSearchSuggestions(query, { history, favorites });
  }, [query, history, favorites]);

  // Reset selectedIndex whenever query or suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Execute selected suggestion
  const handleExecuteSuggestion = (item) => {
    if (!item || !item.payload) return;

    if (item.payload.action === 'navigate_category') {
      if (onSelectCategory && item.payload.categoryId) {
        onSelectCategory(item.payload.categoryId);
      }
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (item.payload.action === 'convert') {
      if (onSelectConversion) {
        onSelectConversion({
          categoryId: item.payload.categoryId,
          fromUnitId: item.payload.fromUnitId,
          toUnitId: item.payload.toUnitId,
          value: item.payload.value !== undefined ? item.payload.value : 1,
          hasExplicitValue: !!item.payload.hasExplicitValue,
        });
      }
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (item.payload.action === 'unsupported') {
      // Keep open for informational reading or let user clear
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = suggestions[selectedIndex] || suggestions[0];
      if (current) {
        handleExecuteSuggestion(current);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleChipClick = (chipQuery) => {
    setQuery(chipQuery);
    const results = getSearchSuggestions(chipQuery, { history, favorites });
    const instant = results.find((r) => r.badge === 'Instant Match') || results[0];
    if (instant && instant.payload?.action === 'convert') {
      handleExecuteSuggestion(instant);
    } else {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedIndex(0);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <section className="ct-omnibox-section" ref={containerRef} aria-label="Smart conversion and category search">
      <div className={`ct-omnibox-wrapper ${isOpen ? 'focused' : ''}`}>
        <div className="ct-omnibox-icon" title="Smart conversion engine">
          <Icon name="Sparkles" size={17} />
        </div>

        <input
          ref={inputRef}
          type="text"
          className="ct-omnibox-input"
          placeholder={PLACEHOLDER_TIPS[placeholderIndex]}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Universal conversion search bar"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="ct-omnibox-listbox"
          role="combobox"
        />

        {query && (
          <button
            type="button"
            className="ct-omnibox-clear"
            onClick={handleClear}
            aria-label="Clear search input"
          >
            <Icon name="X" size={15} />
          </button>
        )}

        <div className="ct-omnibox-shortcut" title="Press '/' anywhere to search">
          <span>/</span>
        </div>

        {/* Floating Dropdown Autocomplete Palette (Zero CLS) */}
        {isOpen && (
          <div id="ct-omnibox-listbox" className="ct-omnibox-dropdown" role="listbox">
            {!query.trim() && (
              <div className="ct-omnibox-tips-card">
                <div className="ct-tips-card-header">
                  <Icon name="Sparkles" size={14} />
                  <span>Smart Convert — Natural Language Power</span>
                </div>
                <div className="ct-tips-card-grid">
                  <div className="ct-tip-item" onClick={() => handleChipClick('100 km to miles')} role="button" tabIndex={0}>
                    <span className="ct-tip-dot" />
                    <span className="ct-tip-text"><strong>"100 km to miles"</strong> — Distance</span>
                  </div>
                  <div className="ct-tip-item" onClick={() => handleChipClick('72 f in c')} role="button" tabIndex={0}>
                    <span className="ct-tip-dot" />
                    <span className="ct-tip-text"><strong>"72 f in c"</strong> — Temperature</span>
                  </div>
                  <div className="ct-tip-item" onClick={() => handleChipClick('1 cup to ml')} role="button" tabIndex={0}>
                    <span className="ct-tip-dot" />
                    <span className="ct-tip-text"><strong>"1 cup to ml"</strong> — Cooking</span>
                  </div>
                  <div className="ct-tip-item" onClick={() => handleChipClick("5'11 to cm")} role="button" tabIndex={0}>
                    <span className="ct-tip-dot" />
                    <span className="ct-tip-text"><strong>"5'11 to cm"</strong> — Height</span>
                  </div>
                </div>
              </div>
            )}

            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isCategory = item.type === 'category';
              const isCompound = item.type === 'compound';
              const isUnsupported = item.type === 'unsupported';
              const isInstantMatch = item.badge === 'Instant Match';

              return (
                <div
                  key={item.id || idx}
                  className={`ct-omnibox-item ${isSelected ? 'active' : ''} ${isInstantMatch ? 'ct-item-instant-card' : ''} ${item.categoryId ? `ct-cat-${item.categoryId}` : ''} ${isCategory ? 'ct-item-category' : ''} ${isCompound ? 'ct-item-compound' : ''} ${isUnsupported ? 'ct-item-unsupported' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleExecuteSuggestion(item)}
                  role="button"
                  aria-label={item.badge === 'Instant Match' ? 'Apply parsed conversion' : item.title}
                  tabIndex={0}
                >
                  <div className="ct-omnibox-item-icon">
                    <Icon name={item.icon || 'Sparkles'} size={18} />
                  </div>

                  <div className="ct-omnibox-item-content">
                    <div className="ct-omnibox-item-title">
                      {item.equation ? (
                        <span className="ct-omnibox-equation">
                          <span className="ct-eq-from">
                            {item.equation.fromVal}{item.equation.fromUnit ? ` ${item.equation.fromUnit}` : ''}
                          </span>
                          <span className="ct-eq-equals">=</span>
                          <strong className="ct-eq-result">
                            {item.equation.toVal} {item.equation.toUnit}
                          </strong>
                        </span>
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </div>
                    {item.subtitle && (
                      <div className="ct-omnibox-item-sub">
                        <span className="ct-sub-text">{item.subtitle}</span>
                        {item.badge && (
                          <span
                            className={`ct-omnibox-badge ct-badge-inline ct-badge-${item.badge.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ct-omnibox-item-actions">
                    {item.badge && (
                      <span
                        className={`ct-omnibox-badge ct-badge-desktop ct-badge-${item.badge.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && !isUnsupported && (
                      <span className="ct-omnibox-enter-hint" title="Press Enter to open">
                        ↵
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discovery Shelf: Instant Example Chips */}
      <div className="ct-omnibox-shelf" role="region" aria-label="Suggested quick conversions">
        <span className="ct-shelf-label">Try:</span>
        <div className="ct-shelf-chips">
          {DISCOVERY_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="ct-shelf-chip"
              onClick={() => handleChipClick(chip.query)}
              title={`Convert ${chip.query}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
