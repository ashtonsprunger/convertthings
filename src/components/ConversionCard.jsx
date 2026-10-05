import React, { useState } from 'react';
import { Icon } from './Icons';
import {
  getUnitsForCategory,
  getUnit,
  formatNumber,
  getFormulaString,
} from '../engine/conversions';

export function ConversionCard({
  categoryId,
  fromUnitId,
  toUnitId,
  fromValue,
  toValue,
  precision,
  isFavorite,
  onFromUnitChange,
  onToUnitChange,
  onFromValueChange,
  onToValueChange,
  onSwap,
  onPrecisionChange,
  onToggleFavorite,
  onCopy,
}) {
  const units = getUnitsForCategory(categoryId);
  const fromUnit = getUnit(categoryId, fromUnitId) || units[0];
  const toUnit = getUnit(categoryId, toUnitId) || units[1] || units[0];

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const formula = getFormulaString(categoryId, fromUnit.id, toUnit.id);

  // Filtered unit lists for searchable dropdowns
  const filteredFromUnits = units.filter((u) => {
    const q = fromSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.plural.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q)
    );
  });

  const filteredToUnits = units.filter((u) => {
    const q = toSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.plural.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q)
    );
  });

  // Quick multipliers
  const handleQuickAdd = (amount) => {
    const current = parseFloat(fromValue) || 0;
    const next = current + amount;
    onFromValueChange(next.toString());
  };

  const handleQuickMultiply = (factor) => {
    const current = parseFloat(fromValue) || 1;
    const next = current * factor;
    onFromValueChange(formatNumber(next));
  };

  const handleResetToOne = () => {
    onFromValueChange('1');
  };

  const handleClear = () => {
    onFromValueChange('');
  };

  return (
    <div
      className="ct-card"
      id="conversion-panel"
      role="tabpanel"
      aria-labelledby={`tab-${categoryId}`}
    >
      {/* Card Header Actions */}
      <div className="ct-card-header">
        <div className="ct-card-header-left">
          <span className="ct-card-badge">Instant Conversion</span>
          <div className="ct-precision-select-wrap">
            <label htmlFor="ct-precision" className="ct-sr-only">
              Decimal Precision
            </label>
            <select
              id="ct-precision"
              className="ct-select-subtle"
              value={precision}
              onChange={(e) => onPrecisionChange(e.target.value)}
              title="Select decimal precision"
            >
              <option value="auto">Auto Decimals</option>
              <option value="2">2 Decimals</option>
              <option value="4">4 Decimals</option>
              <option value="6">6 Decimals</option>
              <option value="8">8 Decimals</option>
            </select>
          </div>
        </div>

        <div className="ct-card-header-right">
          <button
            type="button"
            className={`ct-btn-icon ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Icon
              name="Star"
              size={18}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Prominent Live Readout Statement */}
      <div className="ct-live-readout" aria-live="polite" aria-label="Current Conversion Statement">
        <div className="ct-readout-equation">
          <span className="ct-readout-badge ct-readout-from">
            <span className="ct-readout-val">{fromValue || '0'}</span>
            <span className="ct-readout-unit">{fromUnit.symbol}</span>
          </span>
          <span className="ct-readout-equals" aria-hidden="true">=</span>
          <span className="ct-readout-badge ct-readout-to">
            <span className="ct-readout-val">{toValue || '0'}</span>
            <span className="ct-readout-unit">{toUnit.symbol}</span>
          </span>
        </div>
        <div className="ct-readout-caption">
          <span className="ct-caption-from">
            {fromValue || '0'} {parseFloat(fromValue) === 1 ? fromUnit.name : (fromUnit.plural || fromUnit.name)}
          </span>
          <span className="ct-caption-equals">equals</span>
          <span className="ct-caption-to">
            {toValue || '0'} {parseFloat(toValue) === 1 ? toUnit.name : (toUnit.plural || toUnit.name)}
          </span>
        </div>
      </div>

      {/* Main Conversion Grid */}
      <div className="ct-conversion-grid">
        {/* FROM BLOCK */}
        <div className="ct-unit-block">
          <div className="ct-block-label-row">
            <span className="ct-block-label">From</span>
            <span className="ct-unit-symbol-pill">{fromUnit.symbol}</span>
          </div>

          <div className="ct-input-wrap">
            <input
              id="fromInput"
              type="number"
              step="any"
              className="ct-number-input"
              value={fromValue}
              onChange={(e) => onFromValueChange(e.target.value)}
              placeholder="0"
              aria-label={`Enter value in ${fromUnit.plural || fromUnit.name}`}
            />
            {fromValue !== '' && (
              <button
                type="button"
                className="ct-input-clear-btn"
                onClick={handleClear}
                title="Clear value"
                aria-label="Clear value"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>

          {/* Unit Selector */}
          <div className="ct-unit-dropdown-wrap">
            <button
              type="button"
              className="ct-unit-selector-btn"
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={showFromDropdown}
            >
              <span className="ct-selector-text">
                <strong>{fromUnit.plural || fromUnit.name}</strong> ({fromUnit.symbol})
              </span>
              <Icon name="ChevronDown" size={16} />
            </button>

            {showFromDropdown && (
              <div className="ct-dropdown-menu" role="listbox">
                <div className="ct-dropdown-search">
                  <Icon name="Search" size={14} />
                  <input
                    type="text"
                    className="ct-dropdown-search-input"
                    placeholder="Search unit..."
                    value={fromSearch}
                    onChange={(e) => setFromSearch(e.target.value)}
                    autoFocus
                  />
                  {fromSearch && (
                    <button
                      type="button"
                      className="ct-dropdown-clear-search"
                      onClick={() => setFromSearch('')}
                    >
                      <Icon name="X" size={12} />
                    </button>
                  )}
                </div>
                <div className="ct-dropdown-list">
                  {filteredFromUnits.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      role="option"
                      aria-selected={u.id === fromUnit.id}
                      className={`ct-dropdown-item ${u.id === fromUnit.id ? 'selected' : ''}`}
                      onClick={() => {
                        onFromUnitChange(u.id);
                        setShowFromDropdown(false);
                        setFromSearch('');
                      }}
                    >
                      <span className="ct-item-name">{u.plural || u.name}</span>
                      <span className="ct-item-symbol">{u.symbol}</span>
                    </button>
                  ))}
                  {filteredFromUnits.length === 0 && (
                    <div className="ct-dropdown-empty">No units match "{fromSearch}"</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER SWAP BUTTON */}
        <div className="ct-swap-column">
          <button
            type="button"
            className="ct-swap-btn"
            onClick={onSwap}
            title="Swap units (Alt + S)"
            aria-label="Swap from and to units"
          >
            <Icon name="Swap" size={20} />
          </button>
        </div>

        {/* TO BLOCK */}
        <div className="ct-unit-block">
          <div className="ct-block-label-row">
            <span className="ct-block-label">To</span>
            <span className="ct-unit-symbol-pill">{toUnit.symbol}</span>
          </div>

          <div className="ct-input-wrap">
            <input
              id="toInput"
              type="number"
              step="any"
              className="ct-number-input"
              value={toValue}
              onChange={(e) => onToValueChange(e.target.value)}
              placeholder="0"
              aria-label={`Converted value in ${toUnit.plural || toUnit.name}`}
            />
            {toValue !== '' && (
              <button
                type="button"
                className="ct-input-clear-btn"
                onClick={() => onToValueChange('')}
                title="Clear result"
                aria-label="Clear result"
              >
                <Icon name="X" size={16} />
              </button>
            )}
          </div>

          {/* Unit Selector */}
          <div className="ct-unit-dropdown-wrap">
            <button
              type="button"
              className="ct-unit-selector-btn"
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={showToDropdown}
            >
              <span className="ct-selector-text">
                <strong>{toUnit.plural || toUnit.name}</strong> ({toUnit.symbol})
              </span>
              <Icon name="ChevronDown" size={16} />
            </button>

            {showToDropdown && (
              <div className="ct-dropdown-menu" role="listbox">
                <div className="ct-dropdown-search">
                  <Icon name="Search" size={14} />
                  <input
                    type="text"
                    className="ct-dropdown-search-input"
                    placeholder="Search unit..."
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                    autoFocus
                  />
                  {toSearch && (
                    <button
                      type="button"
                      className="ct-dropdown-clear-search"
                      onClick={() => setToSearch('')}
                    >
                      <Icon name="X" size={12} />
                    </button>
                  )}
                </div>
                <div className="ct-dropdown-list">
                  {filteredToUnits.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      role="option"
                      aria-selected={u.id === toUnit.id}
                      className={`ct-dropdown-item ${u.id === toUnit.id ? 'selected' : ''}`}
                      onClick={() => {
                        onToUnitChange(u.id);
                        setShowToDropdown(false);
                        setToSearch('');
                      }}
                    >
                      <span className="ct-item-name">{u.plural || u.name}</span>
                      <span className="ct-item-symbol">{u.symbol}</span>
                    </button>
                  ))}
                  {filteredToUnits.length === 0 && (
                    <div className="ct-dropdown-empty">No units match "{toSearch}"</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Multiplier Pills */}
      <div className="ct-quick-actions" aria-label="Quick value adjustments">
        <span className="ct-quick-label">Quick:</span>
        <button type="button" className="ct-quick-btn" onClick={handleResetToOne}>
          = 1
        </button>
        <button type="button" className="ct-quick-btn" onClick={() => handleQuickAdd(1)}>
          +1
        </button>
        <button type="button" className="ct-quick-btn" onClick={() => handleQuickAdd(10)}>
          +10
        </button>
        <button type="button" className="ct-quick-btn" onClick={() => handleQuickMultiply(2)}>
          2×
        </button>
        <button type="button" className="ct-quick-btn" onClick={() => handleQuickMultiply(10)}>
          10×
        </button>
        <button type="button" className="ct-quick-btn" onClick={() => handleQuickMultiply(0.5)}>
          ½
        </button>
      </div>

      {/* Formula & Copy Result Banner */}
      <div className="ct-result-footer">
        <div className="ct-formula-box">
          <span className="ct-formula-label">Formula</span>
          <span className="ct-formula-text">{formula || 'Direct calculation'}</span>
        </div>

        <button
          type="button"
          className="ct-copy-btn"
          onClick={() => {
            const textToCopy = `${fromValue || '0'} ${fromUnit.symbol} = ${toValue || '0'} ${toUnit.symbol}`;
            onCopy(textToCopy);
          }}
          title="Copy result to clipboard"
          aria-label="Copy result"
        >
          <Icon name="Copy" size={16} />
          <span>Copy Result</span>
        </button>
      </div>
    </div>
  );
}
