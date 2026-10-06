import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CATEGORIES,
  getUnit,
  convertUnits,
  formatNumber,
} from './engine/conversions';
import { parseRoute, formatRoutePath } from './engine/urlRouter';
import { Header } from './components/Header';
import { Omnibox } from './components/Omnibox';
import { CategoryNav } from './components/CategoryNav';
import { FavoritesBar } from './components/FavoritesBar';
import { ConversionCard } from './components/ConversionCard';
import { ConversionTable } from './components/ConversionTable';
import { ConversionHistory } from './components/ConversionHistory';
import { SeoContent } from './components/SeoContent';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { DeveloperModal } from './components/DeveloperModal';
import { AdSlot } from './components/AdSlot';
import { Toast } from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import './App.css';

const DEFAULT_FAVORITES = [];

function App() {
  const [theme, toggleTheme] = useTheme();

  // URL state initialization helper (supports clean /convert/ paths, categories, and query params)
  const getInitialState = () => {
    try {
      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      categoryId: 'length',
      fromUnitId: 'm',
      toUnitId: 'ft',
      fromValue: '1',
    };
  };

  const getInitialPrecision = () => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem('ct-precision');
        if (item) return JSON.parse(item);
      }
    } catch (e) {
      // ignore
    }
    return 'auto';
  };

  const initial = getInitialState();
  const initialPrecision = getInitialPrecision();
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [fromUnitId, setFromUnitId] = useState(initial.fromUnitId);
  const [toUnitId, setToUnitId] = useState(initial.toUnitId);
  const [fromValue, setFromValue] = useState(initial.fromValue);
  const [toValue, setToValue] = useState(() => {
    const res = convertUnits(initial.fromValue, initial.categoryId, initial.fromUnitId, initial.toUnitId);
    return res !== null ? formatNumber(res, initialPrecision) : '';
  });
  const [lastEdited, setLastEdited] = useState('from');

  const [precision, setPrecision] = useLocalStorage('ct-precision', initialPrecision);
  const [favorites, setFavorites] = useLocalStorage('ct-favorites', DEFAULT_FAVORITES);
  const [history, setHistory] = useLocalStorage('ct-history', []);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'privacy' });
  const [devModalOpen, setDevModalOpen] = useState(false);

  // Helper to focus and select the first input field
  const focusAndSelectFromInput = () => {
    setTimeout(() => {
      const el = document.getElementById('fromInput');
      if (el) {
        el.focus({ preventScroll: true });
        el.select();
      }
    }, 10);
  };

  // Open modal if URL has hash (#privacy, #terms, #about, #api, #mcp, #developer)
  useEffect(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#terms' || hash === '#about') {
        setLegalModal({ isOpen: true, tab: hash.replace('#', '') });
      } else if (hash === '#api' || hash === '#mcp' || hash === '#developer') {
        setDevModalOpen(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const historyTimeoutRef = useRef(null);

  // Recalculate toValue when fromValue, units, or precision changes
  const performCalculation = useCallback(
    (val, catId, fUnitId, tUnitId, prec) => {
      if (val === '' || val === null || isNaN(val)) {
        setToValue('');
        return;
      }
      const result = convertUnits(Number(val), catId, fUnitId, tUnitId);
      if (result !== null) {
        setToValue(formatNumber(result, prec));
      } else {
        setToValue('');
      }
    },
    []
  );

  // Record conversion to history safely (debounced)
  const recordHistory = useCallback(
    (catId, fUnitId, tUnitId, fVal, tVal) => {
      if (!fVal || !tVal || isNaN(fVal)) return;

      const fUnit = getUnit(catId, fUnitId);
      const tUnit = getUnit(catId, tUnitId);
      const cat = CATEGORIES.find((c) => c.id === catId);

      if (!fUnit || !tUnit || !cat) return;

      setHistory((prevHistory) => {
        const item = {
          categoryId: catId,
          categoryName: cat.name,
          fromUnitId: fUnitId,
          toUnitId: tUnitId,
          fromValue: fVal,
          toValue: tVal,
          fromSymbol: fUnit.symbol,
          toSymbol: tUnit.symbol,
          timestamp: Date.now(),
        };

        // Filter out identical immediate predecessor
        const filtered = (prevHistory || []).filter(
          (h) =>
            !(
              h.categoryId === catId &&
              h.fromUnitId === fUnitId &&
              h.toUnitId === tUnitId &&
              h.fromValue === fVal
            )
        );

        return [item, ...filtered].slice(0, 10);
      });
    },
    [setHistory]
  );

  // Sync to URL parameters & Document Title for SEO
  useEffect(() => {
    try {
      const fromUnit = getUnit(categoryId, fromUnitId);
      const toUnit = getUnit(categoryId, toUnitId);

      if (fromUnit && toUnit) {
        // Document Title
        const valStr = fromValue ? `${fromValue} ` : '';
        document.title = `${valStr}${fromUnit.plural || fromUnit.name} to ${toUnit.plural || toUnit.name} Conversion | ConvertThings`;

        // Meta Description update
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = `Easily convert ${fromUnit.plural || fromUnit.name} (${fromUnit.symbol}) to ${toUnit.plural || toUnit.name} (${toUnit.symbol}). Free, accurate, instant unit conversion calculator.`;

        // Clean URL Route Path
        const routePath = formatRoutePath(categoryId, fromUnitId, toUnitId, fromValue);

        // Update Canonical Link tag for search bots
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = `https://www.convertthings.com${routePath === '/' ? '' : routePath}`;

        // Sync browser URL path without page reloading
        if (window.location.pathname !== routePath) {
          window.history.replaceState({}, '', routePath);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [categoryId, fromUnitId, toUnitId, fromValue]);

  // Listen for browser Back / Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed) {
          setCategoryId(parsed.categoryId);
          setFromUnitId(parsed.fromUnitId);
          setToUnitId(parsed.toUnitId);
          setFromValue(parsed.fromValue);
          performCalculation(parsed.fromValue, parsed.categoryId, parsed.fromUnitId, parsed.toUnitId, precision);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performCalculation, precision]);

  // Handle From Value changes
  const handleFromValueChange = (newVal) => {
    setLastEdited('from');
    setFromValue(newVal);
    performCalculation(newVal, categoryId, fromUnitId, toUnitId, precision);

    // Queue history recording
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      const res = convertUnits(Number(newVal), categoryId, fromUnitId, toUnitId);
      if (res !== null) {
        recordHistory(categoryId, fromUnitId, toUnitId, newVal, formatNumber(res, precision));
      }
    }, 1200);
  };

  // Handle To Value changes (Reverse calculation)
  const handleToValueChange = (newVal) => {
    setLastEdited('to');
    setToValue(newVal);
    if (newVal === '' || newVal === null || isNaN(newVal)) {
      setFromValue('');
      return;
    }
    const reverseRes = convertUnits(Number(newVal), categoryId, toUnitId, fromUnitId);
    if (reverseRes !== null) {
      const formatted = formatNumber(reverseRes, precision);
      setFromValue(formatted);

      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = setTimeout(() => {
        recordHistory(categoryId, fromUnitId, toUnitId, formatted, newVal);
      }, 1200);
    }
  };

  // Switch category
  const handleSelectCategory = (newCatId) => {
    if (newCatId === categoryId) return;
    const catDef = CATEGORIES.find((c) => c.id === newCatId);
    if (!catDef) return;

    setLastEdited('from');
    setCategoryId(newCatId);
    setFromUnitId(catDef.defaultFrom);
    setToUnitId(catDef.defaultTo);
    performCalculation(fromValue, newCatId, catDef.defaultFrom, catDef.defaultTo, precision);
  };

  // Switch From unit
  const handleFromUnitChange = (newFromId) => {
    setFromUnitId(newFromId);
    if (lastEdited === 'to' && toValue !== '' && toValue !== null && !isNaN(toValue)) {
      const reverseRes = convertUnits(Number(toValue), categoryId, toUnitId, newFromId);
      if (reverseRes !== null) {
        setFromValue(formatNumber(reverseRes, precision));
      }
    } else {
      performCalculation(fromValue, categoryId, newFromId, toUnitId, precision);
    }
  };

  // Switch To unit
  const handleToUnitChange = (newToId) => {
    setToUnitId(newToId);
    performCalculation(fromValue, categoryId, fromUnitId, newToId, precision);
    setLastEdited('from');
  };

  // Swap units (⇄) and invert equation values
  const handleSwap = () => {
    setLastEdited('from');
    const nextFrom = toUnitId;
    const nextTo = fromUnitId;
    const nextVal = (toValue !== '' && toValue !== null && !isNaN(toValue)) ? toValue : fromValue;
    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    setFromValue(nextVal);
    performCalculation(nextVal, categoryId, nextFrom, nextTo, precision);
    focusAndSelectFromInput();
  };

  // Change precision
  const handlePrecisionChange = (newPrec) => {
    setPrecision(newPrec);
    if (lastEdited === 'to') {
      if (toValue !== '' && toValue !== null && !isNaN(toValue)) {
        const reverseRes = convertUnits(Number(toValue), categoryId, toUnitId, fromUnitId);
        if (reverseRes !== null) {
          setFromValue(formatNumber(reverseRes, newPrec));
        }
      }
    } else {
      performCalculation(fromValue, categoryId, fromUnitId, toUnitId, newPrec);
    }
  };

  // Handle Natural Language / Omnibox selection
  const handleSelectConversion = ({ categoryId: cId, fromUnitId: fId, toUnitId: tId, value: val }) => {
    setLastEdited('from');
    setCategoryId(cId);
    setFromUnitId(fId);
    setToUnitId(tId);
    const strVal = val !== undefined ? val.toString() : '1';
    setFromValue(strVal);
    performCalculation(strVal, cId, fId, tId, precision);
    showToast(`Converted ${strVal} ${fId} to ${tId}`);
    focusAndSelectFromInput();
  };

  // Check if current pair is favorite (order-agnostic pair)
  const isCurrentFavorite = favorites.some(
    (fav) =>
      fav.categoryId === categoryId &&
      ((fav.fromUnitId === fromUnitId && fav.toUnitId === toUnitId) ||
       (fav.fromUnitId === toUnitId && fav.toUnitId === fromUnitId))
  );

  // Toggle favorite (order-agnostic pair)
  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      setFavorites(
        favorites.filter(
          (fav) =>
            !(
              fav.categoryId === categoryId &&
              ((fav.fromUnitId === fromUnitId && fav.toUnitId === toUnitId) ||
               (fav.fromUnitId === toUnitId && fav.toUnitId === fromUnitId))
            )
        )
      );
      showToast('Removed from favorites');
    } else {
      setFavorites([
        ...favorites,
        { categoryId, fromUnitId, toUnitId },
      ]);
      showToast('Saved to favorites!');
    }
  };

  const handleSelectFavorite = (fav) => {
    setCategoryId(fav.categoryId);

    // If already on this exact direction, swap direction and invert value!
    const isExact =
      fav.categoryId === categoryId &&
      fav.fromUnitId === fromUnitId &&
      fav.toUnitId === toUnitId;

    const nextFrom = isExact ? fav.toUnitId : fav.fromUnitId;
    const nextTo = isExact ? fav.fromUnitId : fav.toUnitId;
    const nextVal = (isExact && toValue !== '' && toValue !== null && !isNaN(toValue)) ? toValue : fromValue;

    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    setFromValue(nextVal);
    performCalculation(nextVal, fav.categoryId, nextFrom, nextTo, precision);
    focusAndSelectFromInput();
  };

  const handleRemoveFavorite = (fav) => {
    setFavorites(
      favorites.filter(
        (f) =>
          !(
            f.categoryId === fav.categoryId &&
            ((f.fromUnitId === fav.fromUnitId && f.toUnitId === fav.toUnitId) ||
             (f.fromUnitId === fav.toUnitId && f.toUnitId === fav.fromUnitId))
          )
      )
    );
  };

  // Clipboard copy helper
  const copyToClipboard = async (text, successMsg = 'Copied to clipboard!') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(successMsg);
    } catch (e) {
      showToast(successMsg || 'Copied!');
    }
  };

  const showToast = (message) => {
    setToast({ message, visible: true });
  };

  const handleCopyResult = (text, successMsg = 'Result copied to clipboard!') => {
    copyToClipboard(text, successMsg);
  };

  const handleShare = () => {
    copyToClipboard(window.location.href, 'Conversion link copied to clipboard!');
  };

  // Keyboard shortcut listener (Alt+S for Swap, Esc to blur)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.altKey && e.key.toLowerCase() === 's') || (e.key === 's' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))) {
        e.preventDefault();
        handleSwap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="ct-app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onShare={handleShare}
      />

      <main className="ct-main">
        {/* Future top ad slot (zero layout shift) */}
        <AdSlot position="top-banner" />

        {/* Universal Omnibox Search */}
        <Omnibox onSelectConversion={handleSelectConversion} />

        {/* Category Navigation Pills */}
        <CategoryNav
          activeCategoryId={categoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* Favorites Bar */}
        <FavoritesBar
          favorites={favorites}
          activeCategoryId={categoryId}
          activeFromUnitId={fromUnitId}
          activeToUnitId={toUnitId}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={handleRemoveFavorite}
        />

        {/* Core Conversion Panel with Desktop Side Rail */}
        <div className="ct-hero-layout">
          <div className="ct-hero-main">
            <ConversionCard
              categoryId={categoryId}
              fromUnitId={fromUnitId}
              toUnitId={toUnitId}
              fromValue={fromValue}
              toValue={toValue}
              precision={precision}
              isFavorite={isCurrentFavorite}
              onFromUnitChange={handleFromUnitChange}
              onToUnitChange={handleToUnitChange}
              onFromValueChange={handleFromValueChange}
              onToValueChange={handleToValueChange}
              onSwap={handleSwap}
              onPrecisionChange={handlePrecisionChange}
              onToggleFavorite={handleToggleFavorite}
              onCopy={handleCopyResult}
            />
          </div>

          <aside className="ct-hero-side" aria-label="Desktop Advertisement Rail">
            <AdSlot position="side-rail" slotId="8779651833" />
          </aside>
        </div>

        {/* Reference Comparison & Equivalence Table */}
        <ConversionTable
          categoryId={categoryId}
          fromUnitId={fromUnitId}
          toUnitId={toUnitId}
          fromValue={fromValue}
          onSelectTargetUnit={(targetUnitId) => {
            setToUnitId(targetUnitId);
            performCalculation(fromValue || '1', categoryId, fromUnitId, targetUnitId, precision);
            focusAndSelectFromInput();
          }}
        />

        {/* Conversion History */}
        <ConversionHistory
          history={history}
          onSelectHistory={(item) => {
            setCategoryId(item.categoryId);
            setFromUnitId(item.fromUnitId);
            setToUnitId(item.toUnitId);
            setFromValue(item.fromValue);
            setToValue(item.toValue);
            showToast('Loaded from history');
            focusAndSelectFromInput();
          }}
          onClearHistory={() => {
            setHistory([]);
            showToast('History cleared');
          }}
        />

        {/* Mid-page ad placement (zero layout shift) */}
        <AdSlot position="mid-content" slotId="1723113883" />

        {/* In-depth SEO Guides, Formulas, and FAQs */}
        <SeoContent
          categoryId={categoryId}
          fromUnitId={fromUnitId}
          toUnitId={toUnitId}
          onSelectPair={(catId, fUnitId, tUnitId) => {
            if (catId !== categoryId) {
              setCategoryId(catId);
            }
            setFromUnitId(fUnitId);
            setToUnitId(tUnitId);
            performCalculation(fromValue || '1', catId, fUnitId, tUnitId, precision);
            focusAndSelectFromInput();
          }}
        />
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })}
        onOpenDevModal={() => setDevModalOpen(true)}
      />

      <DeveloperModal
        isOpen={devModalOpen}
        onClose={() => setDevModalOpen(false)}
      />

      <LegalModal
        isOpen={legalModal.isOpen}
        initialTab={legalModal.tab}
        onClose={() => setLegalModal({ isOpen: false, tab: 'privacy' })}
      />

      <Toast
        message={toast.message}
        visible={toast.visible}
        onDismiss={() => setToast({ message: '', visible: false })}
      />
    </div>
  );
}

export default App;
