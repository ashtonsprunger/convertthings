import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CATEGORIES,
  getUnit,
  convertUnits,
  formatNumber,
  parseFractionString,
  isFractionLike,
} from './engine/conversions';
import { parseRoute, formatRoutePath } from './engine/urlRouter';
import { getSeoMetadata } from './engine/seo';
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
const CATEGORY_UNITS_STORAGE_KEY = 'ct-pref-units';

function getSavedCategoryUnits(catId) {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(CATEGORY_UNITS_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const pref = data?.[catId];
    if (pref && typeof pref === 'object' && pref.fromUnitId && pref.toUnitId) {
      if (getUnit(catId, pref.fromUnitId) && getUnit(catId, pref.toUnitId)) {
        return { fromUnitId: pref.fromUnitId, toUnitId: pref.toUnitId };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function saveCategoryUnits(catId, fromId, toId) {
  try {
    if (typeof window === 'undefined') return;
    if (!getUnit(catId, fromId) || !getUnit(catId, toId)) return;
    const raw = window.localStorage.getItem(CATEGORY_UNITS_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[catId] = { fromUnitId: fromId, toUnitId: toId };
    window.localStorage.setItem(CATEGORY_UNITS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

function App() {
  const [theme, toggleTheme] = useTheme();

  // URL state initialization helper (supports clean /convert/ paths, categories, and query params)
  const getInitialState = () => {
    try {
      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed) {
          if (parsed.isCategoryPage) {
            const savedUnits = getSavedCategoryUnits(parsed.categoryId);
            if (savedUnits) {
              return {
                ...parsed,
                fromUnitId: savedUnits.fromUnitId,
                toUnitId: savedUnits.toUnitId,
                isRoot: false,
                isCategoryPage: true,
              };
            }
          }
          return {
            ...parsed,
            isRoot: false,
            isCategoryPage: !!parsed.isCategoryPage,
          };
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
      isRoot: true,
      isCategoryPage: false,
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
  const [isRoot, setIsRoot] = useState(initial.isRoot ?? false);
  const [isCategoryPage, setIsCategoryPage] = useState(initial.isCategoryPage ?? false);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [fromUnitId, setFromUnitId] = useState(initial.fromUnitId);
  const [toUnitId, setToUnitId] = useState(initial.toUnitId);
  const [fromValue, setFromValue] = useState(initial.fromValue);
  const [toValue, setToValue] = useState(() => {
    const res = convertUnits(initial.fromValue, initial.categoryId, initial.fromUnitId, initial.toUnitId);
    return res !== null ? formatNumber(res, initialPrecision, initial.categoryId) : '';
  });
  const [lastEdited, setLastEdited] = useState('from');

  // In-memory per-category session state (retains active numbers & units across category switches)
  const sessionStateRef = useRef(
    initial.isRoot
      ? {}
      : {
          [initial.categoryId]: {
            fromValue: initial.fromValue,
            fromUnitId: initial.fromUnitId,
            toUnitId: initial.toUnitId,
          },
        }
  );

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
      if (val === '' || val === null) {
        setToValue('');
        return;
      }
      const numVal = typeof val === 'string' && isFractionLike(val)
        ? parseFractionString(val)
        : Number(val);

      if (isNaN(numVal)) {
        setToValue('');
        return;
      }
      const result = convertUnits(numVal, catId, fUnitId, tUnitId);
      if (result !== null) {
        setToValue(formatNumber(result, prec, catId));
      } else {
        setToValue('');
      }
    },
    []
  );

  // Record conversion to history safely (debounced)
  const recordHistory = useCallback(
    (catId, fUnitId, tUnitId, fVal, tVal) => {
      if (!fVal || !tVal) return;
      const numF = typeof fVal === 'string' && fVal.includes('/') ? parseFractionString(fVal) : Number(fVal);
      if (isNaN(numF)) return;

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
      const setMetaTag = (selector, attrName, attrVal, content) => {
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attrName, attrVal);
          document.head.appendChild(el);
        }
        el.content = content;
      };

      if (isRoot) {
        const seo = getSeoMetadata({ isRoot: true });

        // High-CTR Document Title for root homepage
        document.title = seo.title;

        // Meta Description update
        setMetaTag('meta[name="description"]', 'name', 'description', seo.description);

        // Open Graph tags
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);

        // Twitter Card tags
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

        // Update Canonical Link tag for search bots
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = seo.canonicalUrl;

        // Maintain clean '/' root pathname in address bar
        if (window.location.pathname !== '/') {
          window.history.replaceState({}, '', '/');
        }
        return;
      }

      // 2. Category Landing Page (e.g. /mass, /area, /cooking)
      if (isCategoryPage) {
        const seo = getSeoMetadata({
          categoryId,
          isCategoryPage: true,
        });

        // High-CTR Document Title for category landing page
        document.title = seo.title;

        // Meta Description update
        setMetaTag('meta[name="description"]', 'name', 'description', seo.description);

        // Open Graph tags
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);

        // Twitter Card tags
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

        // Update Canonical Link tag for search bots
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = seo.canonicalUrl;

        // Maintain clean category path (e.g. '/mass') in address bar
        const categoryPath = `/${categoryId}`;
        if (window.location.pathname !== categoryPath) {
          window.history.replaceState({}, '', categoryPath);
        }
        return;
      }

      const fromUnit = getUnit(categoryId, fromUnitId);
      const toUnit = getUnit(categoryId, toUnitId);

      if (fromUnit && toUnit) {
        const seo = getSeoMetadata({
          categoryId,
          fromUnitId,
          toUnitId,
          value: fromValue,
        });

        // High-CTR Document Title
        document.title = seo.title;

        // Meta Description update
        setMetaTag('meta[name="description"]', 'name', 'description', seo.description);

        // Open Graph tags
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);

        // Twitter Card tags
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

        // Clean URL Route Path
        const routePath = formatRoutePath(categoryId, fromUnitId, toUnitId, fromValue);

        // Update Canonical Link tag for search bots
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = seo.canonicalUrl;

        // Sync browser URL path without page reloading
        if (window.location.pathname !== routePath) {
          window.history.replaceState({}, '', routePath);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [isRoot, isCategoryPage, categoryId, fromUnitId, toUnitId, fromValue]);

  // Listen for browser Back / Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '') {
          setIsRoot(true);
          setIsCategoryPage(false);
          setCategoryId('length');
          setFromUnitId('m');
          setToUnitId('ft');
          setFromValue('1');
          performCalculation('1', 'length', 'm', 'ft', precision);
          return;
        }
        const parsed = parseRoute(pathname, window.location.search);
        if (parsed) {
          setIsRoot(false);
          setIsCategoryPage(!!parsed.isCategoryPage);

          let nextCat = parsed.categoryId;
          let nextFrom = parsed.fromUnitId;
          let nextTo = parsed.toUnitId;
          let nextVal = parsed.fromValue;

          if (parsed.isCategoryPage) {
            const inSession = sessionStateRef.current ? sessionStateRef.current[nextCat] : null;
            if (inSession) {
              nextFrom = inSession.fromUnitId || nextFrom;
              nextTo = inSession.toUnitId || nextTo;
              nextVal = inSession.fromValue !== undefined ? inSession.fromValue : nextVal;
            } else {
              const savedUnits = getSavedCategoryUnits(nextCat);
              if (savedUnits) {
                nextFrom = savedUnits.fromUnitId;
                nextTo = savedUnits.toUnitId;
              }
            }
          }

          setCategoryId(nextCat);
          setFromUnitId(nextFrom);
          setToUnitId(nextTo);
          setFromValue(nextVal);
          performCalculation(nextVal, nextCat, nextFrom, nextTo, precision);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performCalculation, precision]);

  // Handle return to root homepage
  const handleGoHome = (e) => {
    if (e) e.preventDefault();
    setIsRoot(true);
    setIsCategoryPage(false);
    setCategoryId('length');
    setFromUnitId('m');
    setToUnitId('ft');
    setFromValue('1');
    performCalculation('1', 'length', 'm', 'ft', precision);
    if (sessionStateRef.current) {
      sessionStateRef.current['length'] = {
        fromValue: '1',
        fromUnitId: 'm',
        toUnitId: 'ft',
      };
    }
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle From Value changes
  const handleFromValueChange = (newVal) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setLastEdited('from');
    setFromValue(newVal);
    performCalculation(newVal, categoryId, fromUnitId, toUnitId, precision);

    if (sessionStateRef.current) {
      sessionStateRef.current[categoryId] = {
        fromValue: newVal,
        fromUnitId,
        toUnitId,
      };
    }

    // Queue history recording
    if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      const numVal = typeof newVal === 'string' && isFractionLike(newVal)
        ? parseFractionString(newVal)
        : Number(newVal);
      if (!isNaN(numVal)) {
        const res = convertUnits(numVal, categoryId, fromUnitId, toUnitId);
        if (res !== null) {
          recordHistory(categoryId, fromUnitId, toUnitId, newVal, formatNumber(res, precision, categoryId));
        }
      }
    }, 1200);
  };

  // Handle To Value changes (Reverse calculation)
  const handleToValueChange = (newVal) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setLastEdited('to');
    setToValue(newVal);
    if (newVal === '' || newVal === null) {
      setFromValue('');
      if (sessionStateRef.current) {
        sessionStateRef.current[categoryId] = {
          fromValue: '',
          fromUnitId,
          toUnitId,
        };
      }
      return;
    }
    const numVal = typeof newVal === 'string' && isFractionLike(newVal)
      ? parseFractionString(newVal)
      : Number(newVal);

    if (isNaN(numVal)) {
      setFromValue('');
      if (sessionStateRef.current) {
        sessionStateRef.current[categoryId] = {
          fromValue: '',
          fromUnitId,
          toUnitId,
        };
      }
      return;
    }
    const reverseRes = convertUnits(numVal, categoryId, toUnitId, fromUnitId);
    if (reverseRes !== null) {
      const formatted = formatNumber(reverseRes, precision, categoryId);
      setFromValue(formatted);

      if (sessionStateRef.current) {
        sessionStateRef.current[categoryId] = {
          fromValue: formatted,
          fromUnitId,
          toUnitId,
        };
      }

      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      historyTimeoutRef.current = setTimeout(() => {
        recordHistory(categoryId, fromUnitId, toUnitId, formatted, newVal);
      }, 1200);
    }
  };

  // Switch category
  const handleSelectCategory = (newCatId) => {
    if (newCatId === categoryId && isCategoryPage) return;
    const catDef = CATEGORIES.find((c) => c.id === newCatId);
    if (!catDef) return;

    setIsRoot(false);
    setIsCategoryPage(true);
    setLastEdited('from');
    setCategoryId(newCatId);

    // 1. Check in-memory session cache for this category
    const inSession = sessionStateRef.current ? sessionStateRef.current[newCatId] : null;

    let nextFromId = catDef.defaultFrom;
    let nextToId = catDef.defaultTo;
    let nextVal = '1';

    if (inSession) {
      nextFromId = inSession.fromUnitId || catDef.defaultFrom;
      nextToId = inSession.toUnitId || catDef.defaultTo;
      nextVal = inSession.fromValue !== undefined ? inSession.fromValue : '1';
    } else {
      // 2. Check cross-session saved units in localStorage
      const savedUnits = getSavedCategoryUnits(newCatId);
      if (savedUnits) {
        nextFromId = savedUnits.fromUnitId;
        nextToId = savedUnits.toUnitId;
      }
      nextVal = '1';
    }

    if (!getUnit(newCatId, nextFromId)) nextFromId = catDef.defaultFrom;
    if (!getUnit(newCatId, nextToId)) nextToId = catDef.defaultTo;

    setFromUnitId(nextFromId);
    setToUnitId(nextToId);
    setFromValue(nextVal);
    performCalculation(nextVal, newCatId, nextFromId, nextToId, precision);

    if (sessionStateRef.current) {
      sessionStateRef.current[newCatId] = {
        fromValue: nextVal,
        fromUnitId: nextFromId,
        toUnitId: nextToId,
      };
    }

    if (typeof window !== 'undefined' && window.location.pathname !== `/${newCatId}`) {
      window.history.pushState({}, '', `/${newCatId}`);
    }

    focusAndSelectFromInput();
  };

  // Switch From unit
  const handleFromUnitChange = (newFromId) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setFromUnitId(newFromId);
    saveCategoryUnits(categoryId, newFromId, toUnitId);

    let nextVal = fromValue;
    if (lastEdited === 'to' && toValue !== '' && toValue !== null && !isNaN(toValue)) {
      const reverseRes = convertUnits(Number(toValue), categoryId, toUnitId, newFromId);
      if (reverseRes !== null) {
        nextVal = formatNumber(reverseRes, precision, categoryId);
        setFromValue(nextVal);
      }
    } else {
      performCalculation(fromValue, categoryId, newFromId, toUnitId, precision);
    }

    if (sessionStateRef.current) {
      sessionStateRef.current[categoryId] = {
        fromValue: nextVal,
        fromUnitId: newFromId,
        toUnitId,
      };
    }
  };

  // Switch To unit
  const handleToUnitChange = (newToId) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setToUnitId(newToId);
    saveCategoryUnits(categoryId, fromUnitId, newToId);
    performCalculation(fromValue, categoryId, fromUnitId, newToId, precision);
    setLastEdited('from');

    if (sessionStateRef.current) {
      sessionStateRef.current[categoryId] = {
        fromValue,
        fromUnitId,
        toUnitId: newToId,
      };
    }
  };

  // Swap units (⇄) and invert equation values
  const handleSwap = () => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setLastEdited('from');
    const nextFrom = toUnitId;
    const nextTo = fromUnitId;
    const nextVal = (toValue !== '' && toValue !== null) ? toValue : fromValue;
    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    setFromValue(nextVal);
    saveCategoryUnits(categoryId, nextFrom, nextTo);
    performCalculation(nextVal, categoryId, nextFrom, nextTo, precision);

    if (sessionStateRef.current) {
      sessionStateRef.current[categoryId] = {
        fromValue: nextVal,
        fromUnitId: nextFrom,
        toUnitId: nextTo,
      };
    }

    focusAndSelectFromInput();
  };

  // Change precision
  const handlePrecisionChange = (newPrec) => {
    setPrecision(newPrec);
    if (lastEdited === 'to') {
      if (toValue !== '' && toValue !== null) {
        const numVal = typeof toValue === 'string' && toValue.includes('/')
          ? parseFractionString(toValue)
          : Number(toValue);
        if (!isNaN(numVal)) {
          const reverseRes = convertUnits(numVal, categoryId, toUnitId, fromUnitId);
          if (reverseRes !== null) {
            const formatted = formatNumber(reverseRes, newPrec, categoryId);
            setFromValue(formatted);
            if (sessionStateRef.current) {
              sessionStateRef.current[categoryId] = {
                ...(sessionStateRef.current[categoryId] || {}),
                fromValue: formatted,
                fromUnitId,
                toUnitId,
              };
            }
          }
        }
      }
    } else {
      performCalculation(fromValue, categoryId, fromUnitId, toUnitId, newPrec);
    }
  };

  // Handle Natural Language / Omnibox selection
  const handleSelectConversion = ({ categoryId: cId, fromUnitId: fId, toUnitId: tId, value: val }) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setLastEdited('from');
    setCategoryId(cId);
    setFromUnitId(fId);
    setToUnitId(tId);
    const strVal = val !== undefined ? val.toString() : '1';
    setFromValue(strVal);
    saveCategoryUnits(cId, fId, tId);
    if (sessionStateRef.current) {
      sessionStateRef.current[cId] = {
        fromValue: strVal,
        fromUnitId: fId,
        toUnitId: tId,
      };
    }
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
    setIsRoot(false);
    setIsCategoryPage(false);
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
    saveCategoryUnits(fav.categoryId, nextFrom, nextTo);
    if (sessionStateRef.current) {
      sessionStateRef.current[fav.categoryId] = {
        fromValue: nextVal,
        fromUnitId: nextFrom,
        toUnitId: nextTo,
      };
    }
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
        onGoHome={handleGoHome}
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

        {/* Post-Conversion In-Content Ad Placement (High Viewability & Zero CLS) */}
        <AdSlot position="mid-content" slotId="1723113883" />

        {/* Reference Comparison & Equivalence Table */}
        <ConversionTable
          categoryId={categoryId}
          fromUnitId={fromUnitId}
          toUnitId={toUnitId}
          fromValue={fromValue}
          onSelectTargetUnit={(targetUnitId) => {
            setIsRoot(false);
            setIsCategoryPage(false);
            setToUnitId(targetUnitId);
            saveCategoryUnits(categoryId, fromUnitId, targetUnitId);
            if (sessionStateRef.current) {
              sessionStateRef.current[categoryId] = {
                fromValue: fromValue || '1',
                fromUnitId,
                toUnitId: targetUnitId,
              };
            }
            performCalculation(fromValue || '1', categoryId, fromUnitId, targetUnitId, precision);
            focusAndSelectFromInput();
          }}
        />

        {/* Conversion History */}
        <ConversionHistory
          history={history}
          onSelectHistory={(item) => {
            setIsRoot(false);
            setIsCategoryPage(false);
            setCategoryId(item.categoryId);
            setFromUnitId(item.fromUnitId);
            setToUnitId(item.toUnitId);
            setFromValue(item.fromValue);
            setToValue(item.toValue);
            saveCategoryUnits(item.categoryId, item.fromUnitId, item.toUnitId);
            if (sessionStateRef.current) {
              sessionStateRef.current[item.categoryId] = {
                fromValue: item.fromValue,
                fromUnitId: item.fromUnitId,
                toUnitId: item.toUnitId,
              };
            }
            showToast('Loaded from history');
            focusAndSelectFromInput();
          }}
          onClearHistory={() => {
            setHistory([]);
            showToast('History cleared');
          }}
        />

        {/* In-depth SEO Guides, Formulas, and FAQs */}
        <SeoContent
          categoryId={categoryId}
          fromUnitId={fromUnitId}
          toUnitId={toUnitId}
          onSelectPair={(catId, fUnitId, tUnitId) => {
            setIsRoot(false);
            setIsCategoryPage(false);
            if (catId !== categoryId) {
              setCategoryId(catId);
            }
            setFromUnitId(fUnitId);
            setToUnitId(tUnitId);
            saveCategoryUnits(catId, fUnitId, tUnitId);
            const curVal = fromValue || '1';
            if (sessionStateRef.current) {
              sessionStateRef.current[catId] = {
                fromValue: curVal,
                fromUnitId: fUnitId,
                toUnitId: tUnitId,
              };
            }
            performCalculation(curVal, catId, fUnitId, tUnitId, precision);
            focusAndSelectFromInput();
          }}
        />
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })}
        onOpenDevModal={() => setDevModalOpen(true)}
        onGoHome={handleGoHome}
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
