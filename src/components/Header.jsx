import React from 'react';
import { Icon } from './Icons';

export function Header({ theme, onToggleTheme, onShare }) {
  return (
    <header className="ct-header">
      <div className="ct-header-inner">
        <div className="ct-brand">
          <div className="ct-logo-badge" aria-hidden="true">
            <Icon name="Swap" size={20} />
          </div>
          <div className="ct-brand-text">
            <h1 className="ct-brand-title">ConvertThings</h1>
            <span className="ct-brand-tagline">Fast, Accurate Unit Converter</span>
          </div>
        </div>

        <div className="ct-header-actions">
          <button
            type="button"
            className="ct-btn-icon"
            onClick={onShare}
            title="Share this conversion"
            aria-label="Share conversion link"
          >
            <Icon name="Share" size={18} />
          </button>

          <button
            type="button"
            className="ct-btn-icon"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
