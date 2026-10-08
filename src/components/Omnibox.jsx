import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icons';
import { getSearchSuggestions } from '../engine/parser';

const PLACEHOLDER_TIPS = [
  '"100 km to miles"',
  '"72°F in °C"',
  '"1 cup to ml"',
  '"500 sq ft to m²"',
  '"150 lbs into kg"',
  '"5\'11 to cm"',
  '"1 gigabyte in megabytes"',
  '"60 mph in km/h"',
  '"3.14 rad to deg"',
];

export function Omnibox({ onSelectConversion, onSelectCategory, history = [], favorites = [] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fadeState, setFadeState] = useState('ct-placeholder-visible');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Rotate and animate placeholder tips every 3.2s when query is empty
  useEffect(() => {
    if (query) return;
    const interval = setInterval(() => {
      setFadeState('ct-placeholder-exit');
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TIPS.length);
        setFadeState('ct-placeholder-enter');
        requestAnimationFrame(() => {
          setTimeout(() => {
            setFadeState('ct-placeholder-visible');
          }, 25);
        });
      }, 220);
    }, 3200);
    return () => clearInterval(interval);
  }, [query]);

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

  // Ensure active suggestion is scrolled into view when navigating with ArrowDown / ArrowUp
  useEffect(() => {
    if (!isOpen) return;
    const listbox = containerRef.current?.querySelector('#ct-omnibox-listbox');
    if (!listbox) return;
    if (selectedIndex === 0) {
      listbox.scrollTop = 0;
      return;
    }
    const activeEl = listbox.querySelector('.ct-omnibox-item.active');
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, isOpen]);

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

  // Instantaneous tactile arrival feedback on conversion workbench upon Omnibox selection
  const triggerWorkbenchArrival = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const targetEl =
      document.getElementById('conversion-panel') ||
      document.querySelector('.ct-conversion-grid');
    if (!targetEl) return;

    const isMobile = window.innerWidth <= 680;
    if (isMobile) {
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        // fallback
      }
    }

    // Trigger Odometer Roll & Bloom animation
    targetEl.classList.remove('ct-workbench-received');
    const gridEl = targetEl.querySelector('.ct-conversion-grid') || targetEl;
    gridEl.classList.remove('ct-workbench-received');

    // Force reflow so re-triggering works reliably
    void targetEl.offsetWidth;

    targetEl.classList.add('ct-workbench-received');
    gridEl.classList.add('ct-workbench-received');

    setTimeout(() => {
      targetEl.classList.remove('ct-workbench-received');
      gridEl.classList.remove('ct-workbench-received');
    }, 550);
  };

  // Execute selected suggestion
  const handleExecuteSuggestion = (item, sourceEl = null) => {
    if (!item || !item.payload) return;

    if (sourceEl && sourceEl.classList) {
      sourceEl.classList.add('ct-item-pressed');
    }

    if (item.payload.action === 'navigate_category') {
      if (onSelectCategory && item.payload.categoryId) {
        onSelectCategory(item.payload.categoryId);
      }
      triggerWorkbenchArrival();
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (item.payload.action === 'convert') {
      triggerWorkbenchArrival();
      if (onSelectConversion) {
        onSelectConversion({
          categoryId: item.payload.categoryId,
          fromUnitId: item.payload.fromUnitId,
          toUnitId: item.payload.toUnitId,
          value: item.payload.value !== undefined ? item.payload.value : 1,
          hasExplicitValue: !!item.payload.hasExplicitValue,
          hasExplicitTo: item.payload.hasExplicitTo !== false,
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
        const activeItemEl = document.querySelector('#ct-omnibox-listbox .ct-omnibox-item.active');
        handleExecuteSuggestion(current, activeItemEl);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
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
      <div
        className={`ct-omnibox-wrapper ${isOpen ? 'focused' : ''}`}
        onClick={(e) => {
          if (e.target.closest('.ct-omnibox-clear') || e.target.closest('.ct-omnibox-dropdown')) {
            return;
          }
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        <div className="ct-omnibox-icon" title="Search conversions">
          <Icon name="Search" size={16} />
        </div>

        <div className="ct-omnibox-input-area">
          <input
            ref={inputRef}
            type="text"
            className="ct-omnibox-input"
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
          {!query && (
            <span
              className={`ct-omnibox-animated-placeholder ${fadeState}`}
              aria-hidden="true"
            >
              {PLACEHOLDER_TIPS[placeholderIndex]}
            </span>
          )}
        </div>

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
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isCategory = item.type === 'category';
              const isCompound = item.type === 'compound';
              const isUnsupported = item.type === 'unsupported';
              const isInstantMatch = item.badge === 'Instant Match';

              // Minimalist section headers when query is empty
              const showRecentHeader = !query.trim() && idx === 0 && item.type === 'history';
              const showCategoryHeader =
                !query.trim() &&
                item.type === 'category' &&
                (idx === 0 || suggestions[idx - 1]?.type !== 'category');

              return (
                <React.Fragment key={item.id || idx}>
                  {showRecentHeader && (
                    <div className="ct-omnibox-section-header" aria-hidden="true">
                      <span>Recent Conversions</span>
                    </div>
                  )}
                  {showCategoryHeader && (
                    <div className="ct-omnibox-section-header" aria-hidden="true">
                      <span>Browse Categories</span>
                    </div>
                  )}
                  <div
                    className={`ct-omnibox-item ${isSelected ? 'active' : ''} ${isInstantMatch ? 'ct-item-instant-card' : ''} ${item.categoryId ? `ct-cat-${item.categoryId}` : ''} ${isCategory ? 'ct-item-category' : ''} ${isCompound ? 'ct-item-compound' : ''} ${isUnsupported ? 'ct-item-unsupported' : ''}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={(e) => handleExecuteSuggestion(item, e.currentTarget)}
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
                        {item.badge && !isInstantMatch && (
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
                    {item.badge && !isInstantMatch && (
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
              </React.Fragment>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
