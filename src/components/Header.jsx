import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Omnibox } from './Omnibox';

export function Header({
  theme,
  onToggleTheme,
  onGoHome,
  onSelectConversion,
  onSelectCategory,
  history,
  favorites,
}) {
  const [isTurbineSpinning, setIsTurbineSpinning] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const headerRef = useRef(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  // Smart Headroom: hide on scroll down, reveal on scroll up
  useEffect(() => {
    let lastScrollY = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
    let accumulatedDelta = 0;
    let ticking = false;

    const updateScrollDirection = () => {
      const currentScrollY = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);

      // Always show at top of page (within 40px)
      if (currentScrollY <= 40) {
        setIsNavHidden(false);
        accumulatedDelta = 0;
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Reset accumulator immediately whenever scroll direction reverses
      if ((diff > 0 && accumulatedDelta < 0) || (diff < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0;
      }

      accumulatedDelta += diff;

      // Prevent hiding if focus is currently inside the header (e.g. typing in Omnibox)
      const isHeaderFocused = headerRef.current && headerRef.current.contains(document.activeElement);

      if (!isHeaderFocused) {
        // Scrolled DOWN by more than 20px cumulative -> hide
        if (accumulatedDelta > 20) {
          setIsNavHidden(true);
        }
        // Scrolled UP by more than 6px cumulative -> reveal immediately
        else if (accumulatedDelta < -6) {
          setIsNavHidden(false);
        }
      } else {
        setIsNavHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    // Instant wheel listener for desktop mousewheel/trackpad
    const handleWheel = (e) => {
      if (e.deltaY < -4) {
        // User rolling wheel UP -> reveal immediately
        setIsNavHidden(false);
      } else if (e.deltaY > 15) {
        const currentScrollY = Math.max(window.pageYOffset || 0, document.documentElement.scrollTop || 0, document.body.scrollTop || 0);
        if (currentScrollY > 60) {
          const isHeaderFocused = headerRef.current && headerRef.current.contains(document.activeElement);
          if (!isHeaderFocused) {
            setIsNavHidden(true);
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        setIsNavHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleBrandClick = (e) => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setIsTurbineSpinning(true);
      setTimeout(() => setIsTurbineSpinning(false), 950);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1000);
    }

    setIsNavHidden(false);
    if (onGoHome) onGoHome(e);
  };

  return (
    <header
      ref={headerRef}
      className={`ct-header ${isNavHidden ? 'ct-header-hidden' : ''}`}
      onFocusCapture={() => setIsNavHidden(false)}
    >
      <div className="ct-header-inner">
        <a href="/" className="ct-brand" onClick={handleBrandClick} aria-label="ConvertThings Home">
          <div className={`ct-logo-wrap ${isTurbineSpinning ? 'ct-turbine-active' : ''}`} aria-hidden="true">
            <Icon name="BrandLogo" size={36} />
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
