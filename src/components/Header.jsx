import React, { useState, useRef } from 'react';
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
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

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

    if (onGoHome) onGoHome(e);
  };

  return (
    <header className="ct-header">
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
            onSelectConversion={onSelectConversion}
            onSelectCategory={onSelectCategory}
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
