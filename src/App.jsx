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
import { AdSlot } from './components/AdSlot';
import { Toast } from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import './App.css';

const DEFAULT_FAVORITES = [
  { categoryId: 'length', fromUnitId: 'km', toUnitId: 'mi' },
  { categoryId: 'mass', fromUnitId: 'kg', toUnitId: 'lb' },
  { categoryId: 'temperature', fromUnitId: 'c', toUnitId: 'f' },
  { categoryId: 'volume', fromUnitId: 'cup_us', toUnitId: 'ml' },
  { categoryId: 'area', fromUnitId: 'sqft', toUnitId: 'sqm' },
];

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

  const initial = getInitialState();
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [fromUnitId, setFromUnitId] = useState(initial.fromUnitId);
  const [toUnitId, setToUnitId] = useState(initial.toUnitId);
  const [fromValue, setFromValue] = useState(initial.fromValue);
  const [toValue, setToValue] = useState(() => {
    const res = convertUnits(initial.fromValue, initial.categoryId, initial.fromUnitId, initial.toUnitId);
    return res !== null ? formatNumber(res) : '';
  });

  const [precision, setPrecision] = useLocalStorage('ct-precision', 'auto');
  const [favorites, setFavorites] = useLocalStorage('ct-favorites', DEFAULT_FAVORITES);
  const [history, setHistory] = useLocalStorage('ct-history', []);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'privacy' });

  // Open modal if URL has hash (#privacy, #terms, #about)
  useEffect(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#terms' || hash === '#about') {
        setLegalModal({ isOpen: true, tab: hash.replace('#', '') });
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

    setCategoryId(newCatId);
    setFromUnitId(catDef.defaultFrom);
    setToUnitId(catDef.defaultTo);
    performCalculation(fromValue, newCatId, catDef.defaultFrom, catDef.defaultTo, precision);
  };

  // Switch From unit
  const handleFromUnitChange = (newFromId) => {
    setFromUnitId(newFromId);
    performCalculation(fromValue, categoryId, newFromId, toUnitId, precision);
  };

  // Switch To unit
  const handleToUnitChange = (newToId) => {
    setToUnitId(newToId);
    performCalculation(fromValue, categoryId, fromUnitId, newToId, precision);
  };

  // Swap units (⇄)
  const handleSwap = () => {
    const nextFrom = toUnitId;
    const nextTo = fromUnitId;
    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    performCalculation(fromValue, categoryId, nextFrom, nextTo, precision);
  };

  // Change precision
  const handlePrecisionChange = (newPrec) => {
    setPrecision(newPrec);
    performCalculation(fromValue, categoryId, fromUnitId, toUnitId, newPrec);
  };

  // Handle Natural Language / Omnibox selection
  const handleSelectConversion = ({ categoryId: cId, fromUnitId: fId, toUnitId: tId, value: val }) => {
    setCategoryId(cId);
    setFromUnitId(fId);
    setToUnitId(tId);
    const strVal = val !== undefined ? val.toString() : '1';
    setFromValue(strVal);
    performCalculation(strVal, cId, fId, tId, precision);
    showToast(`Converted ${strVal} ${fId} to ${tId}`);
  };

  // Check if current pair is favorite
  const isCurrentFavorite = favorites.some(
    (fav) =>
      fav.categoryId === categoryId &&
      fav.fromUnitId === fromUnitId &&
      fav.toUnitId === toUnitId
  );

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      setFavorites(
        favorites.filter(
          (fav) =>
            !(
              fav.categoryId === categoryId &&
              fav.fromUnitId === fromUnitId &&
              fav.toUnitId === toUnitId
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
    setFromUnitId(fav.fromUnitId);
    setToUnitId(fav.toUnitId);
    performCalculation(fromValue, fav.categoryId, fav.fromUnitId, fav.toUnitId, precision);
  };

  const handleRemoveFavorite = (fav) => {
    setFavorites(
      favorites.filter(
        (f) =>
          !(
            f.categoryId === fav.categoryId &&
            f.fromUnitId === fav.fromUnitId &&
            f.toUnitId === fav.toUnitId
          )
      )
    );
  };

  // Clipboard copy helper
  const copyToClipboard = async (text, successMsg) => {
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
      showToast('Copied!');
    }
  };

  const showToast = (message) => {
    setToast({ message, visible: true });
  };

  const handleCopyResult = (text) => {
    copyToClipboard(text, 'Result copied to clipboard!');
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
        />
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })}
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
