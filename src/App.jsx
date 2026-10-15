import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CATEGORIES,
  KITCHEN_CATEGORIES,
  isKitchenCategory,
  getUnit,
  convertUnits,
  formatNumber,
  parseFractionString,
  isFractionLike,
  isCompoundLike,
  parseCompoundValue,
} from './engine/conversions';
import { parseRoute, formatRoutePath, getHubRoute, VALID_PRECISIONS } from './engine/urlRouter';
import { getSeoMetadata } from './engine/seo';
import { convertCulinary, isCulinaryMassUnit, CULINARY_MASS_UNITS } from './engine/culinary';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
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
      const fromValid = getUnit(catId, pref.fromUnitId) || (catId === 'cooking' && isCulinaryMassUnit(pref.fromUnitId));
      const toValid = getUnit(catId, pref.toUnitId) || (catId === 'cooking' && isCulinaryMassUnit(pref.toUnitId));
      if (fromValid && toValid) {
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
    const fromValid = getUnit(catId, fromId) || (catId === 'cooking' && isCulinaryMassUnit(fromId));
    const toValid = getUnit(catId, toId) || (catId === 'cooking' && isCulinaryMassUnit(toId));
    if (!fromValid || !toValid) return;
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
                isHubPage: false,
                hubId: null,
              };
            }
          }
          return {
            ...parsed,
            isRoot: false,
            isCategoryPage: !!parsed.isCategoryPage,
            isHubPage: !!parsed.isHubPage,
            hubId: parsed.hubId || null,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    const savedLengthUnits = getSavedCategoryUnits('length');
    return {
      categoryId: 'length',
      fromUnitId: savedLengthUnits?.fromUnitId || 'm',
      toUnitId: savedLengthUnits?.toUnitId || 'ft',
      fromValue: '1',
      isRoot: true,
      isCategoryPage: false,
      isHubPage: false,
      hubId: null,
    };
  };

  const getInitialPrecision = () => {
    try {
      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed && parsed.precision && VALID_PRECISIONS.includes(parsed.precision.toLowerCase())) {
          return parsed.precision.toLowerCase();
        }
        const params = new URLSearchParams(window.location.search);
        const queryP = params.get('p') || params.get('prec');
        if (queryP && VALID_PRECISIONS.includes(queryP.toLowerCase())) {
          return queryP.toLowerCase();
        }
        const item = window.localStorage.getItem('ct-precision');
        if (item) {
          const parsedItem = JSON.parse(item);
          if (VALID_PRECISIONS.includes(parsedItem)) return parsedItem;
        }
      }
    } catch (e) {
      // ignore
    }
    return 'auto';
  };

  const getInitialKitchenMode = () => {
    try {
      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed) {
          if (parsed.isKitchenMode !== undefined) {
            return parsed.isKitchenMode;
          }
          if (parsed.categoryId === 'cooking') {
            return !!parsed.isCategoryPage;
          }
        }
      }
    } catch (e) {
      // ignore
    }
    return true;
  };

  const getInitialIngredient = () => {
    try {
      if (typeof window !== 'undefined') {
        const parsed = parseRoute(window.location.pathname, window.location.search);
        if (parsed && parsed.ingredient) {
          return parsed.ingredient;
        }
        const params = new URLSearchParams(window.location.search);
        const ing = params.get('ing') || params.get('ingredient');
        if (ing) return ing.trim().toLowerCase();
      }
    } catch (e) {
      // ignore
    }
    return 'liquid';
  };

  const initial = getInitialState();
  const initialPrecision = getInitialPrecision();
  const [isKitchenStudio, setIsKitchenStudio] = useState(initial.isKitchenStudio ?? false);
  const [kitchenMode, setKitchenMode] = useState(getInitialKitchenMode);
  const [culinaryIngredient, setCulinaryIngredient] = useState(getInitialIngredient);
  const [isRoot, setIsRoot] = useState(initial.isRoot ?? false);
  const [isCategoryPage, setIsCategoryPage] = useState(initial.isCategoryPage ?? false);
  const [isHubPage, setIsHubPage] = useState(initial.isHubPage ?? false);
  const [hubId, setHubId] = useState(initial.hubId || null);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [fromUnitId, setFromUnitId] = useState(initial.fromUnitId);
  const [toUnitId, setToUnitId] = useState(initial.toUnitId);
  const [fromValue, setFromValue] = useState(initial.fromValue);
  const [toValue, setToValue] = useState(() => {
    let numInitial;
    if (typeof initial.fromValue === 'string' && isCompoundLike(initial.fromValue)) {
      const compVal = parseCompoundValue(initial.fromValue, initial.categoryId, initial.fromUnitId);
      if (compVal !== null && !isNaN(compVal)) {
        numInitial = compVal;
      }
    }
    if (numInitial === undefined) {
      numInitial = typeof initial.fromValue === 'string' && isFractionLike(initial.fromValue)
        ? parseFractionString(initial.fromValue)
        : Number(initial.fromValue);
    }
    if (isNaN(numInitial)) return '';
    const res = initial.categoryId === 'cooking'
      ? convertCulinary(numInitial, initial.fromUnitId, initial.toUnitId, getInitialIngredient())
      : convertUnits(numInitial, initial.categoryId, initial.fromUnitId, initial.toUnitId);
    return res !== null ? formatNumber(res, initialPrecision, initial.categoryId) : '';
  });
  const [lastEdited, setLastEdited] = useState('from');

  // In-memory per-category session state (retains active numbers & units across category switches)
  const sessionStateRef = useRef({
    [initial.categoryId]: {
      fromValue: initial.fromValue,
      fromUnitId: initial.fromUnitId,
      toUnitId: initial.toUnitId,
    },
  });

  const [precision, setPrecision] = useState(initialPrecision);
  const [favorites, setFavorites] = useLocalStorage('ct-favorites', DEFAULT_FAVORITES);
  const [history, setHistory] = useLocalStorage('ct-history', []);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'privacy' });
  const [devModalOpen, setDevModalOpen] = useState(false);


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
    (val, catId, fUnitId, tUnitId, prec, ing = culinaryIngredient) => {
      if (val === '' || val === null) {
        setToValue('');
        return;
      }
      let numVal;
      if (typeof val === 'string' && isCompoundLike(val)) {
        const compVal = parseCompoundValue(val, catId, fUnitId);
        if (compVal !== null && !isNaN(compVal)) {
          numVal = compVal;
        }
      }
      if (numVal === undefined) {
        numVal = typeof val === 'string' && isFractionLike(val)
          ? parseFractionString(val)
          : Number(val);
      }

      if (isNaN(numVal)) {
        setToValue('');
        return;
      }
      if (catId === 'cooking') {
        const result = convertCulinary(numVal, fUnitId, tUnitId, ing || 'liquid');
        if (result !== null) {
          setToValue(formatNumber(result, prec, catId));
        } else {
          setToValue('');
        }
        return;
      }
      const result = convertUnits(numVal, catId, fUnitId, tUnitId);
      if (result !== null) {
        setToValue(formatNumber(result, prec, catId));
      } else {
        setToValue('');
      }
    },
    [culinaryIngredient]
  );

  // Record conversion to history safely (debounced)
  const recordHistory = useCallback(
    (catId, fUnitId, tUnitId, fVal, tVal) => {
      if (!fVal || !tVal) return;
      const numF = typeof fVal === 'string' && fVal.includes('/') ? parseFractionString(fVal) : Number(fVal);
      if (isNaN(numF)) return;

      const fUnit = getUnit(catId, fUnitId) || (catId === 'cooking' ? CULINARY_MASS_UNITS.find((u) => u.id === fUnitId) : null);
      const tUnit = getUnit(catId, tUnitId) || (catId === 'cooking' ? CULINARY_MASS_UNITS.find((u) => u.id === tUnitId) : null);
      const cat = CATEGORIES.find((c) => c.id === catId) || KITCHEN_CATEGORIES.find((k) => k.id === catId);

      if (!fUnit || !tUnit || !cat) return;

      setHistory((prevHistory) => {
        const item = {
          categoryId: catId,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          fromUnitId: fUnitId,
          toUnitId: tUnitId,
          fromValue: fVal,
          toValue: tVal,
          fromSymbol: fUnit.symbol,
          toSymbol: tUnit.symbol,
          timestamp: Date.now(),
          ingredient: catId === 'cooking' ? culinaryIngredient : undefined,
        };

        // Filter out identical immediate predecessor
        const filtered = (prevHistory || []).filter(
          (h) =>
            !(
              h.categoryId === catId &&
              h.fromUnitId === fUnitId &&
              h.toUnitId === tUnitId &&
              h.fromValue === fVal &&
              h.ingredient === item.ingredient
            )
        );

        return [item, ...filtered].slice(0, 10);
      });
    },
    [setHistory, culinaryIngredient]
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

      const targetSearch =
        categoryId === 'cooking' && kitchenMode
          ? ''
          : precision && precision !== 'auto'
          ? `?p=${encodeURIComponent(precision)}`
          : '';

      if (isRoot) {
        const seo = getSeoMetadata({ isRoot: true });

        // High-CTR Document Title for root homepage
        document.title = seo.title;

        // Meta Description update
        setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
        setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');

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

        // Maintain clean '/' root pathname in address bar (with ?p= if non-default)
        const targetUrl = `/${targetSearch}`;
        if (window.location.pathname + (window.location.search || '') !== targetUrl) {
          window.history.replaceState({}, '', targetUrl);
        }
        return;
      }

      // 1.5 Dedicated Kitchen Studio Landing Page (/kitchen)
      if (isKitchenStudio) {
        const seo = getSeoMetadata({
          categoryId: 'cooking',
          isCategoryPage: true,
          isKitchenStudio: true,
        });

        document.title = seo.title;
        setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
        setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = seo.canonicalUrl;

        const targetUrl = formatRoutePath(
          'cooking',
          fromUnitId,
          toUnitId,
          fromValue,
          precision,
          kitchenMode,
          null,
          culinaryIngredient,
          true
        );
        if (window.location.pathname + (window.location.search || '') !== targetUrl) {
          window.history.replaceState({}, '', targetUrl);
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
        setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');

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

        // Maintain clean category path (e.g. '/mass') in address bar (with ?p= if non-default)
        const categoryPath = `/${categoryId}`;
        const targetUrl = `${categoryPath}${targetSearch}`;
        if (window.location.pathname + (window.location.search || '') !== targetUrl) {
          window.history.replaceState({}, '', targetUrl);
        }
        return;
      }

      // 3. Dedicated High-Intent Hub Pages (e.g. /convert/feet-inches-to-cm, /convert/fraction-inches-to-mm, /convert/baking-fractions)
      if (isHubPage && hubId) {
        const hub = getHubRoute(hubId);
        if (hub && hub.categoryId === categoryId && hub.fromUnitId === fromUnitId && hub.toUnitId === toUnitId) {
          const seo = getSeoMetadata({
            hubId,
            value: fromValue,
          });

          document.title = seo.title;
          setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
          setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');
          setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
          setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
          setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);
          setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
          setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
          }
          canonical.href = seo.canonicalUrl;

          const routePath = formatRoutePath(
            categoryId,
            fromUnitId,
            toUnitId,
            fromValue,
            precision,
            categoryId === 'cooking' ? kitchenMode : false,
            hubId,
            categoryId === 'cooking' ? culinaryIngredient : null
          );

          if (window.location.pathname + (window.location.search || '') !== routePath) {
            window.history.replaceState({}, '', routePath);
          }
          return;
        } else {
          setIsHubPage(false);
          setHubId(null);
        }
      }

      const fromUnit = getUnit(categoryId, fromUnitId) || (categoryId === 'cooking' ? CULINARY_MASS_UNITS.find((u) => u.id === fromUnitId) : null);
      const toUnit = getUnit(categoryId, toUnitId) || (categoryId === 'cooking' ? CULINARY_MASS_UNITS.find((u) => u.id === toUnitId) : null);

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
        setMetaTag('meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow');

        // Open Graph tags
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.canonicalUrl);

        // Twitter Card tags
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.ogTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.ogDescription);

        // Clean URL Route Path with ?p= if non-default and ?kitchen=1 if Kitchen Mode is active
        const routePath = formatRoutePath(
          categoryId,
          fromUnitId,
          toUnitId,
          fromValue,
          precision,
          categoryId === 'cooking' ? kitchenMode : false,
          null,
          categoryId === 'cooking' ? culinaryIngredient : null
        );

        // Update Canonical Link tag for search bots (always clean!)
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = seo.canonicalUrl;

        // Sync browser URL path without page reloading
        if (window.location.pathname + (window.location.search || '') !== routePath) {
          window.history.replaceState({}, '', routePath);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [isRoot, isKitchenStudio, isCategoryPage, isHubPage, hubId, categoryId, fromUnitId, toUnitId, fromValue, precision, kitchenMode, culinaryIngredient]);

  // Listen for browser Back / Forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const search = window.location.search;
        let popPrecision = undefined;
        if (search) {
          const pParams = new URLSearchParams(search);
          const rawP = pParams.get('p') || pParams.get('prec');
          if (rawP && VALID_PRECISIONS.includes(rawP.toLowerCase())) {
            popPrecision = rawP.toLowerCase();
          }
        }
        const effectivePrec = popPrecision || getInitialPrecision();
        setPrecision(effectivePrec);

        const pathname = window.location.pathname;
        if (pathname === '/' || pathname === '') {
          const savedLengthUnits = getSavedCategoryUnits('length');
          const rootFrom = savedLengthUnits?.fromUnitId || 'm';
          const rootTo = savedLengthUnits?.toUnitId || 'ft';
          setIsRoot(true);
          setIsKitchenStudio(false);
          setIsCategoryPage(false);
          setCategoryId('length');
          setFromUnitId(rootFrom);
          setToUnitId(rootTo);
          setFromValue('1');
          performCalculation('1', 'length', rootFrom, rootTo, effectivePrec);
          return;
        }
        const parsed = parseRoute(pathname, window.location.search);
        if (parsed) {
          setIsRoot(false);
          setIsKitchenStudio(!!parsed.isKitchenStudio);
          setIsCategoryPage(!!parsed.isCategoryPage);
          setIsHubPage(!!parsed.isHubPage);
          setHubId(parsed.hubId || null);

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
          let nextIng = parsed.ingredient || 'liquid';
          if (nextCat === 'cooking') {
            setCulinaryIngredient(nextIng);
            if (parsed.isKitchenMode !== undefined) {
              setKitchenMode(parsed.isKitchenMode);
            } else {
              setKitchenMode(!!parsed.isCategoryPage);
            }
          }
          setFromUnitId(nextFrom);
          setToUnitId(nextTo);
          setFromValue(nextVal);
          performCalculation(nextVal, nextCat, nextFrom, nextTo, effectivePrec, nextIng);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [performCalculation]);

  // Handle return to root homepage
  const handleGoHome = (e) => {
    if (e) e.preventDefault();
    const savedLengthUnits = getSavedCategoryUnits('length');
    const rootFrom = savedLengthUnits?.fromUnitId || 'm';
    const rootTo = savedLengthUnits?.toUnitId || 'ft';
    setIsRoot(true);
    setIsKitchenStudio(false);
    setIsCategoryPage(false);
    setIsHubPage(false);
    setHubId(null);
    setCategoryId('length');
    setFromUnitId(rootFrom);
    setToUnitId(rootTo);
    setFromValue('1');
    performCalculation('1', 'length', rootFrom, rootTo, precision);
    if (sessionStateRef.current) {
      sessionStateRef.current['length'] = {
        fromValue: '1',
        fromUnitId: rootFrom,
        toUnitId: rootTo,
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
      let numVal;
      if (typeof newVal === 'string' && isCompoundLike(newVal)) {
        const compVal = parseCompoundValue(newVal, categoryId, fromUnitId);
        if (compVal !== null && !isNaN(compVal)) {
          numVal = compVal;
        }
      }
      if (numVal === undefined) {
        numVal = typeof newVal === 'string' && isFractionLike(newVal)
          ? parseFractionString(newVal)
          : Number(newVal);
      }
      if (numVal !== undefined && !isNaN(numVal)) {
        const res = categoryId === 'cooking'
          ? convertCulinary(numVal, fromUnitId, toUnitId, culinaryIngredient)
          : convertUnits(numVal, categoryId, fromUnitId, toUnitId);
        if (res !== null) {
          recordHistory(categoryId, fromUnitId, toUnitId, newVal, formatNumber(res, precision, categoryId));
        }
      }
    }, 1200);
  };

  // Handle To Value changes (reverse conversion)
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
    let numVal;
    if (typeof newVal === 'string' && isCompoundLike(newVal)) {
      const compVal = parseCompoundValue(newVal, categoryId, toUnitId);
      if (compVal !== null && !isNaN(compVal)) {
        numVal = compVal;
      }
    }
    if (numVal === undefined) {
      numVal = typeof newVal === 'string' && isFractionLike(newVal)
        ? parseFractionString(newVal)
        : Number(newVal);
    }

    if (numVal === undefined || isNaN(numVal)) {
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
    const reverseRes = categoryId === 'cooking'
      ? convertCulinary(numVal, toUnitId, fromUnitId, culinaryIngredient)
      : convertUnits(numVal, categoryId, toUnitId, fromUnitId);
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
    setIsKitchenStudio(false);
    setIsCategoryPage(true);
    setIsHubPage(false);
    setHubId(null);
    setLastEdited('from');
    setCategoryId(newCatId);
    if (newCatId === 'cooking') {
      // Category tab click navigates without a "to", so Kitchen Mode defaults to ON
      setKitchenMode(true);
    }

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
  };

  // Switch From unit
  const handleFromUnitChange = (newFromId) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    if (isHubPage && hubId) {
      const hub = getHubRoute(hubId);
      if (!hub || hub.fromUnitId !== newFromId) {
        setIsHubPage(false);
        setHubId(null);
      }
    }
    setFromUnitId(newFromId);
    saveCategoryUnits(categoryId, newFromId, toUnitId);

    let nextVal = fromValue;
    if (lastEdited === 'to' && toValue !== '' && toValue !== null && !isNaN(toValue)) {
      const reverseRes = categoryId === 'cooking'
        ? convertCulinary(Number(toValue), toUnitId, newFromId, culinaryIngredient)
        : convertUnits(Number(toValue), categoryId, toUnitId, newFromId);
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
    if (isHubPage && hubId) {
      const hub = getHubRoute(hubId);
      if (!hub || hub.toUnitId !== newToId) {
        setIsHubPage(false);
        setHubId(null);
      }
    }
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
    if (isHubPage && hubId) {
      const hub = getHubRoute(hubId);
      if (!hub || hub.fromUnitId !== nextFrom || hub.toUnitId !== nextTo) {
        setIsHubPage(false);
        setHubId(null);
      }
    }
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
  };

  // Change precision
  const handlePrecisionChange = (newPrec) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setPrecision(newPrec);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ct-precision', JSON.stringify(newPrec));
      }
    } catch (e) {
      // ignore
    }
    if (lastEdited === 'to') {
      if (toValue !== '' && toValue !== null) {
        const numVal = typeof toValue === 'string' && toValue.includes('/')
          ? parseFractionString(toValue)
          : Number(toValue);
        if (!isNaN(numVal)) {
          const reverseRes = categoryId === 'cooking'
            ? convertCulinary(numVal, toUnitId, fromUnitId, culinaryIngredient)
            : convertUnits(numVal, categoryId, toUnitId, fromUnitId);
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

  // Change culinary ingredient
  const handleSelectCulinaryIngredient = (newIngId) => {
    setCulinaryIngredient(newIngId);
    let nextFrom = fromUnitId;
    let nextTo = toUnitId;
    if (newIngId !== 'liquid') {
      // If switching to an ingredient and both units are volume, switch toUnitId to grams for immediate baking scale utility
      if (!isCulinaryMassUnit(fromUnitId) && !isCulinaryMassUnit(toUnitId)) {
        nextTo = 'g';
        setToUnitId('g');
        saveCategoryUnits('cooking', fromUnitId, 'g');
      }
    } else {
      // If switching back to liquid and any unit is mass, restore volume defaults
      if (isCulinaryMassUnit(fromUnitId)) {
        nextFrom = 'cup_us';
        setFromUnitId('cup_us');
      }
      if (isCulinaryMassUnit(toUnitId)) {
        nextTo = 'tbsp_us';
        setToUnitId('tbsp_us');
      }
      saveCategoryUnits('cooking', nextFrom, nextTo);
    }
    performCalculation(fromValue, 'cooking', nextFrom, nextTo, precision, newIngId);
  };

  // Open Dedicated Kitchen Studio (/kitchen)
  const handleOpenKitchenStudio = (ingredientId = 'flour_ap') => {
    const staple = KITCHEN_CATEGORIES.find((k) => k.id === ingredientId) || KITCHEN_CATEGORIES[0];
    const catId = staple.id;
    setIsKitchenStudio(true);
    setIsRoot(false);
    setIsCategoryPage(true);
    setIsHubPage(false);
    setHubId(null);
    setCategoryId(catId);
    setCulinaryIngredient(catId);

    const nextFrom = staple.defaultFrom || 'cup_us';
    const nextTo = staple.defaultTo || 'g';

    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    setFromValue('1');
    setKitchenMode(catId === 'liquid' || catId === 'water');
    saveCategoryUnits(catId, nextFrom, nextTo);
    performCalculation('1', catId, nextFrom, nextTo, precision, catId);

    const targetUrl = catId === 'flour_ap' || catId === 'liquid' ? '/kitchen' : `/kitchen?ing=${catId}`;
    if (typeof window !== 'undefined' && window.location.pathname + (window.location.search || '') !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit Kitchen Studio to Standard Converters
  const handleExitKitchenStudio = () => {
    setIsKitchenStudio(false);
    handleGoHome();
  };

  // Toggle Kitchen Studio mode
  const handleToggleKitchenStudio = () => {
    if (isKitchenStudio) {
      handleExitKitchenStudio();
    } else {
      handleOpenKitchenStudio(culinaryIngredient && culinaryIngredient !== 'liquid' ? culinaryIngredient : 'flour_ap');
    }
  };

  // Select a Kitchen Staple from the contextual shelf
  const handleSelectKitchenStaple = (staple) => {
    const stapleId = typeof staple === 'string' ? staple : staple.id;
    const stapleDef = KITCHEN_CATEGORIES.find((k) => k.id === stapleId) || staple;
    const nextFrom = stapleDef.defaultFrom || staple.fromUnit || 'cup_us';
    const nextTo = stapleDef.defaultTo || staple.toUnit || 'g';
    setCulinaryIngredient(stapleId);
    setCategoryId(stapleId);
    setFromUnitId(nextFrom);
    setToUnitId(nextTo);
    setKitchenMode(stapleId === 'liquid' || stapleId === 'water');
    saveCategoryUnits(stapleId, nextFrom, nextTo);
    performCalculation(fromValue || '1', stapleId, nextFrom, nextTo, precision, stapleId);

    const targetUrl = stapleId === 'flour_ap' ? '/kitchen' : `/kitchen?ing=${stapleId}`;
    if (typeof window !== 'undefined' && window.location.pathname + (window.location.search || '') !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  // Handle Natural Language / Omnibox selection
  const handleSelectConversion = ({ categoryId: cId, fromUnitId: fId, toUnitId: tId, value: val, displayValue, hasExplicitValue, hasExplicitTo, ingredient }) => {
    setIsRoot(false);
    setIsCategoryPage(false);
    setIsHubPage(false);
    setHubId(null);
    setLastEdited('from');
    setCategoryId(cId);
    setFromUnitId(fId);
    setToUnitId(tId);
    let nextIng = culinaryIngredient;
    if (cId === 'cooking' || isKitchenCategory(cId)) {
      nextIng = ingredient || (isKitchenCategory(cId) ? cId : (isCulinaryMassUnit(fId) || isCulinaryMassUnit(tId) ? (culinaryIngredient === 'liquid' ? 'flour_ap' : culinaryIngredient) : 'liquid'));
      setCulinaryIngredient(nextIng);
      // Automatic rule: Searches with an explicit "to" navigate with kitchen mode OFF
      setKitchenMode(hasExplicitTo === false ? true : false);
      if (ingredient || isKitchenCategory(cId) || isCulinaryMassUnit(fId) || isCulinaryMassUnit(tId)) {
        setIsKitchenStudio(true);
      }
    } else {
      setIsKitchenStudio(false);
    }
    const strVal = displayValue || (val !== undefined ? val.toString() : '1');
    setFromValue(strVal);
    saveCategoryUnits(cId, fId, tId);
    if (sessionStateRef.current) {
      sessionStateRef.current[cId] = {
        fromValue: strVal,
        fromUnitId: fId,
        toUnitId: tId,
      };
    }
    performCalculation(strVal, cId, fId, tId, precision, nextIng);
    const toastMsg = displayValue
      ? `Converted ${displayValue} to ${tId}`
      : `Converted ${strVal} ${fId} to ${tId}`;
    showToast(toastMsg);
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
    if (fav.categoryId === 'cooking') {
      setKitchenMode(false);
    }

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

  const handleClearFavorites = () => {
    setFavorites([]);
    showToast('Favorites cleared');
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
    const isKitchen = categoryId === 'cooking' ? kitchenMode : false;
    const routePath = formatRoutePath(categoryId, fromUnitId, toUnitId, fromValue, precision, isKitchen);
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.convertthings.com';
    const fullShareUrl = `${origin}${routePath}`;
    copyToClipboard(fullShareUrl, 'Conversion link copied to clipboard!');
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
    <div className={`ct-app ct-cat-${categoryId}`}>
      <Header
        categoryId={categoryId}
        theme={theme}
        onToggleTheme={toggleTheme}
        onGoHome={handleGoHome}
        onSelectConversion={handleSelectConversion}
        onSelectCategory={handleSelectCategory}
        history={history}
        favorites={favorites}
        isKitchenStudio={isKitchenStudio}
        onToggleKitchenStudio={handleToggleKitchenStudio}
      />

      <main className="ct-main">
        {/* Future top ad slot (zero layout shift) */}
        <AdSlot position="top-banner" />

        {/* Core Conversion Panel with Desktop Side Rail */}
        <div className="ct-hero-layout">
          <div className="ct-hero-main">
            {/* Category Navigation Pills */}
            <CategoryNav
              activeCategoryId={categoryId}
              categories={isKitchenStudio ? KITCHEN_CATEGORIES : CATEGORIES}
              onSelectCategory={handleSelectCategory}
              isKitchenStudio={isKitchenStudio}
              activeIngredientId={culinaryIngredient}
              onSelectKitchenStaple={handleSelectKitchenStaple}
              onExitKitchenStudio={handleExitKitchenStudio}
            />

            <ConversionCard
              categoryId={categoryId}
              fromUnitId={fromUnitId}
              toUnitId={toUnitId}
              fromValue={fromValue}
              toValue={toValue}
              precision={precision}
              culinaryIngredient={culinaryIngredient}
              onSelectCulinaryIngredient={handleSelectCulinaryIngredient}
              kitchenMode={kitchenMode}
              onToggleKitchenMode={() => {
                setKitchenMode((prev) => {
                  const next = !prev;
                  if (!next && isCategoryPage) {
                    setIsCategoryPage(false);
                  }
                  return next;
                });
              }}
              isFavorite={isCurrentFavorite}
              onFromUnitChange={handleFromUnitChange}
              onToUnitChange={handleToUnitChange}
              onFromValueChange={handleFromValueChange}
              onToValueChange={handleToValueChange}
              onSwap={handleSwap}
              onPrecisionChange={handlePrecisionChange}
              onToggleFavorite={handleToggleFavorite}
              onCopy={handleCopyResult}
              onShare={handleShare}
              favorites={favorites}
              onSelectFavorite={handleSelectFavorite}
              onRemoveFavorite={handleRemoveFavorite}
              onClearFavorites={handleClearFavorites}
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
          hubId={isHubPage ? hubId : null}
          onSelectTargetUnit={(targetUnitId) => {
            setIsRoot(false);
            setIsCategoryPage(false);
            setIsHubPage(false);
            setHubId(null);
            if (categoryId === 'cooking') {
              setKitchenMode(false);
            }
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
          }}
        />

        {/* Conversion History */}
        <ConversionHistory
          history={history}
          onSelectHistory={(item) => {
            setIsRoot(false);
            setIsCategoryPage(false);
            setIsHubPage(false);
            setHubId(null);
            setCategoryId(item.categoryId);
            setFromUnitId(item.fromUnitId);
            setToUnitId(item.toUnitId);
            setFromValue(item.fromValue);
            setToValue(item.toValue);
            if (item.categoryId === 'cooking') {
              setKitchenMode(false);
              if (item.ingredient) {
                setCulinaryIngredient(item.ingredient);
              }
            }
            saveCategoryUnits(item.categoryId, item.fromUnitId, item.toUnitId);
            if (sessionStateRef.current) {
              sessionStateRef.current[item.categoryId] = {
                fromValue: item.fromValue,
                fromUnitId: item.fromUnitId,
                toUnitId: item.toUnitId,
              };
            }
            showToast('Loaded from history');
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
          hubId={isHubPage ? hubId : null}
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
