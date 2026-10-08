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
  const lastScrollYRef = useRef(0);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  // Smart Headroom: hide on scroll down, reveal on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always show at top of page (within 40px)
          if (currentScrollY <= 40) {
            setIsNavHidden(false);
          } else {
            const diff = currentScrollY - lastScrollYRef.current;
            // Prevent hiding if focus is currently inside the header (e.g. searching in Omnibox)
            const isHeaderFocused = headerRef.current && headerRef.current.contains(document.activeElement);

            if (!isHeaderFocused) {
              // Scrolling down by more than 12px -> slide up out of view
              if (diff > 12) {
                setIsNavHidden(true);
              }
              // Scrolling up by more than 8px -> glide back into view
              else if (diff < -8) {
                setIsNavHidden(false);
              }
            }
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
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
