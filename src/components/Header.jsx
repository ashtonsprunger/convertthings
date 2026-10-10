import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Omnibox } from './Omnibox';

export function Header({
  categoryId = 'length',
  theme,
  onToggleTheme,
  onGoHome,
  onSelectConversion,
  onSelectCategory,
  history,
  favorites,
}) {
  const [isCategorySwitching, setIsCategorySwitching] = useState(false);
  const [exitCategory, setExitCategory] = useState(null);
  const [isEasterEggSpinning, setIsEasterEggSpinning] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const headerRef = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);
  const categoryTimerRef = useRef(null);
  const easterEggTimerRef = useRef(null);
  const prevCategoryRef = useRef(categoryId);
  const isInitialMount = useRef(true);

  // Category switch: Conveyor Handoff (720ms, NO overshoot).
  // Old arrow rolls out down-right into the nav pill mask, new arrow rolls in up-left. Both visible simultaneously!
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevCategoryRef.current = categoryId;
      return;
    }

    if (categoryId && categoryId !== prevCategoryRef.current) {
      const oldCat = prevCategoryRef.current;
      const newCat = categoryId;
      prevCategoryRef.current = newCat;

      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
      if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);

      setIsEasterEggSpinning(false);
      setExitCategory(oldCat);
      setSpinKey((k) => k + 1);
      setIsCategorySwitching(true);

      // Controlled 720ms duration for the dual-arrow conveyor handoff
      categoryTimerRef.current = setTimeout(() => {
        setIsCategorySwitching(false);
        setExitCategory(null);
      }, 720);
    }
  }, [categoryId]);

  // Smart Headroom: hide on scroll down, reveal on scroll up
  useEffect(() => {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Always stay visible at the top of the page
      if (currentScrollY <= 40) {
        setIsNavHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Scrolling UP: ANY upward movement immediately reveals the navbar!
      if (diff < 0) {
        setIsNavHidden(false);
      }
      // Scrolling DOWN: hide if scrolled down by more than 6px and not focused
      else if (diff > 6) {
        const isHeaderFocused = headerRef.current && headerRef.current.contains(document.activeElement);
        if (!isHeaderFocused) {
          setIsNavHidden(true);
        }
      }

      lastScrollY = currentScrollY;
    };

    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        setIsNavHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
      if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);
    };
  }, []);

  const handleBrandClick = (e) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      if (e) e.preventDefault();
      clickCountRef.current = 0;
      setSpinKey((k) => k + 1);
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
      if (easterEggTimerRef.current) clearTimeout(easterEggTimerRef.current);
      setIsCategorySwitching(false);
      setExitCategory(null);
      setIsEasterEggSpinning(true);
      easterEggTimerRef.current = setTimeout(() => {
        setIsEasterEggSpinning(false);
      }, 1100);
      return;
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1000);
    }

    setIsNavHidden(false);
    if (onGoHome) onGoHome(e);
  };

  const isMaskActive = isCategorySwitching || isEasterEggSpinning;

  return (
    <header
      ref={headerRef}
      className={`ct-header ${isNavHidden ? 'ct-header-hidden' : ''}`}
      onFocusCapture={() => setIsNavHidden(false)}
    >
      <div className={`ct-header-inner ${isMaskActive ? 'ct-header-turbine-active' : ''}`}>
        <a
          href="/"
          className={`ct-brand ${isMaskActive ? 'ct-brand-turbine-active' : ''} ${isEasterEggSpinning ? 'ct-brand-easter-egg' : ''} ct-cat-${categoryId}`}
          onClick={handleBrandClick}
          aria-label="ConvertThings Home"
        >
          <div
            className={`ct-logo-wrap ${isCategorySwitching ? 'ct-cat-switch-active' : ''} ${isEasterEggSpinning ? 'ct-turbine-active' : ''}`}
            aria-hidden="true"
          >
            <Icon key={spinKey} name="BrandLogo" size={36} exitCategory={exitCategory} />
          </div>
          <div className="ct-brand-text">
            <h1 className="ct-brand-title" aria-label="ConvertThings">
              <span className="ct-brand-name">Convert</span><span className="ct-brand-accent">Things</span>
            </h1>
            <span className="ct-brand-tagline">Fast, Accurate Unit Converter</span>
          </div>
        </a>

        <div className="ct-header-search">
          <Omnibox
            onSelectConversion={(...args) => {
              setIsNavHidden(false);
              if (onSelectConversion) onSelectConversion(...args);
            }}
            onSelectCategory={(...args) => {
              setIsNavHidden(false);
              if (onSelectCategory) onSelectCategory(...args);
            }}
            history={history}
            favorites={favorites}
          />
        </div>

        <div className="ct-header-actions">
          <button
            type="button"
            className="ct-btn-icon ct-theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            <span key={theme} className="ct-theme-icon-wrap">
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
