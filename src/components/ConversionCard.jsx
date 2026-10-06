import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Icon } from './Icons';
import {
  getUnitsForCategory,
  getUnit,
  getFormulaString,
  getFormulaDetails,
  convertUnits,
  filterAndSortUnits,
  formatDisplayNumber,
  formatFractionForDisplay,
  parseFractionString,
  isFractionLike,
  getCookingCompoundMeasure,
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
  const [isSwapping, setIsSwapping] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedInstruction, setCopiedInstruction] = useState(false);
  const [copiedKitchen, setCopiedKitchen] = useState(false);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const fromBlockRef = useRef(null);
  const toBlockRef = useRef(null);
  const swapBtnRef = useRef(null);
  const activeAnimationsRef = useRef([]);
  const prevUnitsRef = useRef({ fromUnitId, toUnitId });
  const isInitialMount = useRef(true);
  const copiedTimeoutRef = useRef(null);
  const copiedFormulaTimeoutRef = useRef(null);
  const copiedInstructionTimeoutRef = useRef(null);
  const copiedKitchenTimeoutRef = useRef(null);

  const formulaDetails = getFormulaDetails(categoryId, fromUnit.id, toUnit.id);
  const formula = formulaDetails.equation || getFormulaString(categoryId, fromUnit.id, toUnit.id);

  // Reset copied state when values change
  useEffect(() => {
    setCopiedNumber(false);
    setCopiedFormula(false);
    setCopiedInstruction(false);
    setCopiedKitchen(false);
  }, [fromValue, toValue, fromUnitId, toUnitId]);

  // Clean up timers and running animations on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      if (copiedFormulaTimeoutRef.current) clearTimeout(copiedFormulaTimeoutRef.current);
      if (copiedInstructionTimeoutRef.current) clearTimeout(copiedInstructionTimeoutRef.current);
      if (copiedKitchenTimeoutRef.current) clearTimeout(copiedKitchenTimeoutRef.current);
      activeAnimationsRef.current.forEach((a) => {
        try {
          a.cancel();
        } catch (e) {
          // ignore
        }
      });
      activeAnimationsRef.current = [];
    };
  }, []);

  const displayFromValue = formatDisplayNumber(fromValue || '0');
  const displayToValue = formatDisplayNumber(toValue || '0');

  const handleCopyNumber = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const valToCopy = displayToValue || '0';
    onCopy(valToCopy, `${valToCopy} copied to clipboard!`);
    setCopiedNumber(true);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedNumber(false);
    }, 1600);
  };

  const handleCopyInstruction = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!formulaDetails.instruction) return;
    onCopy(formulaDetails.instruction, 'Instruction copied to clipboard!');
    setCopiedInstruction(true);
    if (copiedInstructionTimeoutRef.current) clearTimeout(copiedInstructionTimeoutRef.current);
    copiedInstructionTimeoutRef.current = setTimeout(() => {
      setCopiedInstruction(false);
    }, 1600);
  };

  const handleCopyFormula = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const valToCopy = formulaDetails.equation || formula;
    onCopy(valToCopy, 'Formula copied to clipboard!');
    setCopiedFormula(true);
    if (copiedFormulaTimeoutRef.current) clearTimeout(copiedFormulaTimeoutRef.current);
    copiedFormulaTimeoutRef.current = setTimeout(() => {
      setCopiedFormula(false);
    }, 1600);
  };

  const handleCopyKitchen = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!kitchenCompound) return;
    onCopy(kitchenCompound, `${kitchenCompound} copied to clipboard!`);
    setCopiedKitchen(true);
    if (copiedKitchenTimeoutRef.current) clearTimeout(copiedKitchenTimeoutRef.current);
    copiedKitchenTimeoutRef.current = setTimeout(() => {
      setCopiedKitchen(false);
    }, 1600);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(e.target)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(e.target)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered unit lists for searchable dropdowns (prioritizing prefix matches)
  const filteredFromUnits = filterAndSortUnits(units, fromSearch);
  const filteredToUnits = filterAndSortUnits(units, toSearch);

  // Keyboard navigation for From dropdown
  const handleFromSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFromUnits.length > 0) {
        onFromUnitChange(filteredFromUnits[0].id);
        setShowFromDropdown(false);
        setFromSearch('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowFromDropdown(false);
      setFromSearch('');
    }
  };

  // Keyboard navigation for To dropdown
  const handleToSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredToUnits.length > 0) {
        onToUnitChange(filteredToUnits[0].id);
        setShowToDropdown(false);
        setToSearch('');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowToDropdown(false);
      setToSearch('');
    }
  };

  // Physical Swap Animation using FLIP delta and Web Animations API
  const triggerSwapAnimation = () => {
    setShowFromDropdown(false);
    setShowToDropdown(false);

    const fromEl = fromBlockRef.current;
    const toEl = toBlockRef.current;
    if (!fromEl || !toEl) return;

    // Check for user reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;

    // Exit safely in jsdom or unrendered layout
    if (dx === 0 && dy === 0) return;
    if (typeof fromEl.animate !== 'function') return;

    // Cancel any previous in-flight swap animations
    activeAnimationsRef.current.forEach((a) => {
      try {
        a.cancel();
      } catch (e) {
        // ignore
      }
    });
    activeAnimationsRef.current = [];

    setIsSwapping(true);

    const isMobile = Math.abs(dy) > Math.abs(dx);
    const arcX = isMobile ? 12 : 0;
    const arcY = isMobile ? 0 : -8;

    // From element (Left / Top slot): starts at previous To position (dx, dy), glides to resting (0, 0)
    const fromAnim = fromEl.animate(
      [
        {
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(1)`,
          zIndex: 12,
        },
        {
          transform: `translate3d(${dx * 0.5 + arcX}px, ${dy * 0.5 + arcY}px, 0) scale(1.025)`,
          zIndex: 12,
          offset: 0.5,
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          zIndex: 12,
        },
      ],
      {
        duration: 320,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'none',
      }
    );

    // To element (Right / Bottom slot): starts at previous From position (-dx, -dy), glides to resting (0, 0)
    const toAnim = toEl.animate(
      [
        {
          transform: `translate3d(${-dx}px, ${-dy}px, 0) scale(1)`,
          zIndex: 6,
          opacity: 0.95,
        },
        {
          transform: `translate3d(${-dx * 0.5 - arcX}px, ${-dy * 0.5 - arcY}px, 0) scale(0.975)`,
          zIndex: 6,
          opacity: 0.9,
          offset: 0.5,
        },
        {
          transform: 'translate3d(0, 0, 0) scale(1)',
          zIndex: 6,
          opacity: 1,
        },
      ],
      {
        duration: 320,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'none',
      }
    );

    activeAnimationsRef.current.push(fromAnim, toAnim);

    // Center Swap Button animation
    if (swapBtnRef.current && typeof swapBtnRef.current.animate === 'function') {
      const btnAnim = swapBtnRef.current.animate(
        [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(90deg) scale(1.18)', offset: 0.5 },
          { transform: 'rotate(180deg) scale(1)' },
        ],
        {
          duration: 320,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          fill: 'none',
        }
      );
      activeAnimationsRef.current.push(btnAnim);
    }

    const handleAnimDone = () => {
      setIsSwapping(false);
      activeAnimationsRef.current = [];
    };

    fromAnim.onfinish = handleAnimDone;
    fromAnim.oncancel = handleAnimDone;

    // Safety timeout in case window backgrounded or tab hidden
    setTimeout(() => {
      setIsSwapping(false);
    }, 360);
  };

  // Detect unit swaps (from button, Alt+S, favorites) and trigger physical animation
  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUnitsRef.current = { fromUnitId, toUnitId };
      return;
    }

    const prev = prevUnitsRef.current;
    const isSwap =
      prev.fromUnitId === toUnitId &&
      prev.toUnitId === fromUnitId &&
      fromUnitId !== toUnitId;

    prevUnitsRef.current = { fromUnitId, toUnitId };

    if (isSwap) {
      triggerSwapAnimation();
    }
  }, [fromUnitId, toUnitId]);

  // Swap animation trigger
  const handleSwapClick = () => {
    setShowFromDropdown(false);
    setShowToDropdown(false);
    onSwap();
  };

  // Smart focus helper (Option 1):
  // Selects all text on initial focus (e.g. tabbing in or clicking from outside).
  // When already focused, allows user to click anywhere to place the cursor without selecting all.
  const handleInputFocus = (e) => {
    e.target.select();
  };

  const handleInputMouseDown = (e) => {
    // If already focused, allow default browser caret placement
    if (document.activeElement === e.target) {
      return;
    }
    // If not yet focused, focusing triggers handleInputFocus which selects all.
    // Prevent default on mousedown so mouseup doesn't clear the selection in Chrome/WebKit.
    e.preventDefault();
    e.target.focus();
  };

  const handleClear = () => {
    onFromValueChange('');
  };

  // Stepper logic: increment/decrement to next whole number
  const getNextWholeNumber = (valStr, direction) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      return direction > 0 ? 1 : 0;
    }
    if (direction > 0) {
      if (Number.isInteger(num)) {
        return num + 1;
      }
      return Math.floor(num) + 1;
    }
    if (direction < 0) {
      if (Number.isInteger(num)) {
        return num - 1;
      }
      return Math.ceil(num) - 1;
    }
    return num;
  };

  const handleStepFrom = (direction) => {
    const next = getNextWholeNumber(fromValue, direction);
    onFromValueChange(next.toString());
  };

  const handleStepTo = (direction) => {
    const next = getNextWholeNumber(toValue, direction);
    onToValueChange(next.toString());
  };

  const isFractionMode =
    precision === 'fraction' ||
    precision === 'fraction_improper' ||
    (precision === 'auto' && categoryId === 'cooking');

  const rawTargetValue = (() => {
    if (!fromValue) return null;
    const num = typeof fromValue === 'string' && isFractionLike(fromValue)
      ? parseFractionString(fromValue)
      : parseFloat(fromValue);
    if (isNaN(num)) return null;
    return convertUnits(num, categoryId, fromUnit.id, toUnit.id);
  })();

  const kitchenCompound = getCookingCompoundMeasure(rawTargetValue, toUnit.id, categoryId);

  // Calculate if the current conversion result is an approximation
  const isApproximate = (() => {
    if (!fromValue || !toValue || rawTargetValue === null) return false;
    if (isFractionMode || isFractionLike(toValue)) {
      const fracVal = parseFractionString(toValue);
      return Math.abs(fracVal - rawTargetValue) > 1e-4;
    }
    const formattedNum = Number(toValue);
    if (isNaN(formattedNum)) return false;
    return Math.abs(formattedNum - rawTargetValue) > 1e-11;
  })();

  const relOperator = isApproximate ? '≈' : '=';

  // Formatted equation strings for copy footer and formula
  const formulaEquation = formulaDetails.equation || formula || 'Direct calculation';
  const formulaInstruction = formulaDetails.instruction || '';
  const symbolText = `${displayFromValue} ${fromUnit.symbol} ${relOperator} ${displayToValue} ${toUnit.symbol}`;

  // Helper to colorize formula equation components cleanly
  const renderFormulaContent = (text, fromSym) => {
    if (!text) return null;
    if (text.includes('=')) {
      const parts = text.split('=');
      const left = parts[0].trim();
      const right = parts.slice(1).join('=').trim();

      // Simple factor equation: e.g. "ft = m × 3.2808399"
      if (right.includes('×') && fromSym && right.startsWith(fromSym)) {
        const factorPart = right.replace(fromSym, '').replace('×', '').trim();
        return (
          <>
            <span className="ct-fn-to">{left}</span>
            <span className="ct-fn-operator"> = </span>
            <span className="ct-fn-from">{fromSym}</span>
            <span className="ct-fn-operator"> × </span>
            <span className="ct-fn-factor">{factorPart}</span>
          </>
        );
      }

      // Simple factor division: e.g. "cup = stick / 2"
      if (right.includes('/') && fromSym && right.startsWith(fromSym)) {
        const factorPart = right.slice(right.indexOf('/') + 1).trim();
        return (
          <>
            <span className="ct-fn-to">{left}</span>
            <span className="ct-fn-operator"> = </span>
            <span className="ct-fn-from">{fromSym}</span>
            <span className="ct-fn-operator"> / </span>
            <span className="ct-fn-factor">{factorPart}</span>
          </>
        );
      }

      // Reciprocal fuel equation: e.g. "L/100km = 235.215 / mpg (US)"
      if (right.includes('/') && fromSym && right.endsWith(fromSym)) {
        const factorPart = right.slice(0, right.lastIndexOf('/')).trim();
        return (
          <>
            <span className="ct-fn-to">{left}</span>
            <span className="ct-fn-operator"> = </span>
            <span className="ct-fn-factor">{factorPart}</span>
            <span className="ct-fn-operator"> / </span>
            <span className="ct-fn-from">{fromSym}</span>
          </>
        );
      }

      // Complex expressions (e.g. Temperature: "°C = (°F − 32) × 5/9"):
      // Only highlight fromSym in Cyan, keep the rest clean neutral text
      if (fromSym && right.includes(fromSym)) {
        const symIdx = right.indexOf(fromSym);
        const before = right.slice(0, symIdx);
        const after = right.slice(symIdx + fromSym.length);
        return (
          <>
            <span className="ct-fn-to">{left}</span>
            <span className="ct-fn-operator"> = </span>
            <span className="ct-fn-expr">{before}</span>
            <span className="ct-fn-from">{fromSym}</span>
            <span className="ct-fn-expr">{after}</span>
          </>
        );
      }

      return (
        <>
          <span className="ct-fn-to">{left}</span>
          <span className="ct-fn-operator"> = </span>
          <span className="ct-fn-expr">{right}</span>
        </>
      );
    }
    return <span className="ct-fn-plain">{text}</span>;
  };

  // Helper to colorize English instruction text
  const renderInstructionContent = (text, from) => {
    if (!text) return null;

    // Standard factor: "Multiply the meter value by 3.2808399"
    const multMatch = text.match(/^Multiply the (.*?) value by (.*)$/i);
    if (multMatch) {
      return (
        <>
          <span className="ct-fn-plain">Multiply the </span>
          <span className="ct-fn-from">{multMatch[1]}</span>
          <span className="ct-fn-plain"> value by </span>
          <span className="ct-fn-factor">{multMatch[2]}</span>
        </>
      );
    }

    // Standard division: "Divide the stick of butter (us) value by 2"
    const divByMatch = text.match(/^Divide the (.*?) value by (.*)$/i);
    if (divByMatch) {
      return (
        <>
          <span className="ct-fn-plain">Divide the </span>
          <span className="ct-fn-from">{divByMatch[1]}</span>
          <span className="ct-fn-plain"> value by </span>
          <span className="ct-fn-factor">{divByMatch[2]}</span>
        </>
      );
    }

    // Reciprocal fuel division: "Divide 235.215 by the US mpg value"
    const divMatch = text.match(/^Divide (.*?) by the (.*?) value$/i);
    if (divMatch) {
      return (
        <>
          <span className="ct-fn-plain">Divide </span>
          <span className="ct-fn-factor">{divMatch[1]}</span>
          <span className="ct-fn-plain"> by the </span>
          <span className="ct-fn-from">{divMatch[2]}</span>
          <span className="ct-fn-plain"> value</span>
        </>
      );
    }

    // Temperature C to F: "Multiply the Celsius temperature by 1.8 (9/5) and add 32"
    if (text.includes('Multiply the Celsius temperature by 1.8 (9/5) and add 32')) {
      return (
        <>
          <span className="ct-fn-plain">Multiply the </span>
          <span className="ct-fn-from">Celsius</span>
          <span className="ct-fn-plain"> temperature by </span>
          <span className="ct-fn-factor">1.8 (9/5)</span>
          <span className="ct-fn-plain"> and add </span>
          <span className="ct-fn-factor">32</span>
        </>
      );
    }

    // Temperature F to C: "Subtract 32 from the Fahrenheit temperature and multiply by 5/9"
    if (text.includes('Subtract 32 from the Fahrenheit temperature and multiply by 5/9')) {
      return (
        <>
          <span className="ct-fn-plain">Subtract </span>
          <span className="ct-fn-factor">32</span>
          <span className="ct-fn-plain"> from the </span>
          <span className="ct-fn-from">Fahrenheit</span>
          <span className="ct-fn-plain"> temperature and multiply by </span>
          <span className="ct-fn-factor">5/9</span>
        </>
      );
    }

    // Temperature C to K / K to C / etc.
    const fromUnitName = from ? from.name : '';
    if (fromUnitName && text.toLowerCase().includes(fromUnitName.toLowerCase())) {
      const idx = text.toLowerCase().indexOf(fromUnitName.toLowerCase());
      const before = text.slice(0, idx);
      const matched = text.slice(idx, idx + fromUnitName.length);
      const after = text.slice(idx + fromUnitName.length);
      return (
        <>
          <span className="ct-fn-plain">{before}</span>
          <span className="ct-fn-from">{matched}</span>
          <span className="ct-fn-plain">{after}</span>
        </>
      );
    }

    return <span className="ct-fn-plain">{text}</span>;
  };

  // Helper to dynamically adjust font size based on number length so digits never clip
  const getNumberFontSizeClass = (valStr) => {
    const len = (valStr || '').toString().length;
    if (len > 12) return 'ct-font-compact';
    if (len > 8) return 'ct-font-medium';
    return 'ct-font-large';
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
          <div className="ct-precision-select-wrap">
            <label htmlFor="ct-precision" className="ct-sr-only">
              Decimal Precision
            </label>
            <select
              id="ct-precision"
              className="ct-select-subtle"
              value={precision}
              onChange={(e) => onPrecisionChange(e.target.value)}
              title="Select formatting and precision"
              aria-label="Decimal Precision and Formatting"
            >
              <option value="auto">Auto (Smart)</option>
              <option value="2">2 Decimals</option>
              <option value="4">4 Decimals</option>
              <option value="exact">Exact (Full Precision)</option>
              <option value="fraction">Fractions (Mixed: 1 ⅜)</option>
              <option value="fraction_improper">Fractions (Improper: 11/8)</option>
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

      {/* Main Conversion Grid with Up/Down Steppers */}
      <div className={`ct-conversion-grid ${isSwapping ? 'ct-grid-swapping' : ''}`}>
        {/* FIRST UNIT BLOCK (FROM - VIOLET) */}
        <div
          ref={fromBlockRef}
          className={`ct-unit-block ct-unit-block-from ${isSwapping ? 'ct-is-swapping' : ''}`}
        >
          <div className="ct-stepper-outer ct-stepper-outer-up">
            <button
              type="button"
              className="ct-stepper-btn ct-stepper-btn-up ct-stepper-from"
              onClick={() => handleStepFrom(1)}
              title={`Increment ${fromUnit.name} to next whole number`}
              aria-label={`Increment ${fromUnit.name} to next whole number`}
            >
              <Icon name="ChevronUp" size={14} />
            </button>
          </div>

          <div className={`ct-integrated-input-box ct-input-box-from ${showFromDropdown ? 'dropdown-active' : ''}`}>
            <div className="ct-input-inner">
              <input
                id="fromInput"
                type={isFractionMode ? 'text' : 'number'}
                step="any"
                inputMode="decimal"
                className={`ct-number-input ${getNumberFontSizeClass(fromValue)} ${isFractionLike(fromValue) ? 'ct-fraction-input' : ''}`}
                value={fromValue}
                onChange={(e) => onFromValueChange(e.target.value)}
                onFocus={handleInputFocus}
                onMouseDown={handleInputMouseDown}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleClear();
                }}
                placeholder="0"
                title={fromValue ? `${fromValue} ${fromUnit.symbol}` : `Enter value in ${fromUnit.name}`}
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

            <div className="ct-integrated-divider" aria-hidden="true" />

            <div className="ct-integrated-unit-wrap" ref={fromDropdownRef}>
              <button
                type="button"
                className="ct-integrated-unit-btn"
                onClick={() => {
                  setShowFromDropdown(!showFromDropdown);
                  setShowToDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showFromDropdown}
                title={`Change unit from ${fromUnit.name}`}
              >
                <span className="ct-integrated-unit-symbol ct-unit-sym-from">{fromUnit.symbol}</span>
                <Icon name="ChevronDown" size={16} strokeWidth={2.5} className={`ct-dropdown-chevron ${showFromDropdown ? 'rotated' : ''}`} />
              </button>

              {showFromDropdown && (
                <div className="ct-dropdown-menu ct-integrated-dropdown" role="listbox">
                  <div className="ct-dropdown-search">
                    <Icon name="Search" size={14} />
                    <input
                      type="text"
                      className="ct-dropdown-search-input"
                      placeholder="Search unit..."
                      value={fromSearch}
                      onChange={(e) => setFromSearch(e.target.value)}
                      onKeyDown={handleFromSearchKeyDown}
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

          <div className="ct-stepper-outer ct-stepper-outer-down">
            <button
              type="button"
              className="ct-stepper-btn ct-stepper-btn-down ct-stepper-from"
              onClick={() => handleStepFrom(-1)}
              title={`Decrement ${fromUnit.name} to next whole number`}
              aria-label={`Decrement ${fromUnit.name} to next whole number`}
            >
              <Icon name="ChevronDown" size={14} />
            </button>
          </div>
        </div>

        {/* CENTER SWAP BUTTON */}
        <div className="ct-swap-column">
          <button
            ref={swapBtnRef}
            type="button"
            className={`ct-swap-btn ${isSwapping ? 'ct-swap-active' : ''}`}
            onClick={handleSwapClick}
            title="Swap units (Alt + S)"
            aria-label="Swap from and to units"
          >
            <Icon
              name="Swap"
              size={20}
              className={isSwapping && typeof swapBtnRef.current?.animate !== 'function' ? 'ct-swap-icon-spin' : ''}
            />
          </button>
        </div>

        {/* SECOND UNIT BLOCK (TO - EMERALD) */}
        <div
          ref={toBlockRef}
          className={`ct-unit-block ct-unit-block-to ${isSwapping ? 'ct-is-swapping' : ''}`}
        >
          <div className="ct-stepper-outer ct-stepper-outer-up">
            <button
              type="button"
              className="ct-stepper-btn ct-stepper-btn-up ct-stepper-to"
              onClick={() => handleStepTo(1)}
              title={`Increment ${toUnit.name} to next whole number`}
              aria-label={`Increment ${toUnit.name} to next whole number`}
            >
              <Icon name="ChevronUp" size={14} />
            </button>
          </div>

          <div className={`ct-integrated-input-box ct-input-box-to ${showToDropdown ? 'dropdown-active' : ''}`}>
            <div className="ct-input-inner">
              <input
                id="toInput"
                type={isFractionMode ? 'text' : 'number'}
                step="any"
                inputMode="decimal"
                className={`ct-number-input ${getNumberFontSizeClass(toValue)} ${isFractionLike(toValue) ? 'ct-fraction-input' : ''}`}
                value={toValue}
                onChange={(e) => onToValueChange(e.target.value)}
                onFocus={handleInputFocus}
                onMouseDown={handleInputMouseDown}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onToValueChange('');
                }}
                placeholder="0"
                title={toValue ? `${toValue} ${toUnit.symbol}` : `Converted value in ${toUnit.name}`}
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

            <div className="ct-integrated-divider" aria-hidden="true" />

            <div className="ct-integrated-unit-wrap" ref={toDropdownRef}>
              <button
                type="button"
                className="ct-integrated-unit-btn"
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showToDropdown}
                title={`Change unit to ${toUnit.name}`}
              >
                <span className="ct-integrated-unit-symbol ct-unit-sym-to">{toUnit.symbol}</span>
                <Icon name="ChevronDown" size={16} strokeWidth={2.5} className={`ct-dropdown-chevron ${showToDropdown ? 'rotated' : ''}`} />
              </button>

              {showToDropdown && (
                <div className="ct-dropdown-menu ct-integrated-dropdown" role="listbox">
                  <div className="ct-dropdown-search">
                    <Icon name="Search" size={14} />
                    <input
                      type="text"
                      className="ct-dropdown-search-input"
                      placeholder="Search unit..."
                      value={toSearch}
                      onChange={(e) => setToSearch(e.target.value)}
                      onKeyDown={handleToSearchKeyDown}
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

          <div className="ct-stepper-outer ct-stepper-outer-down">
            <button
              type="button"
              className="ct-stepper-btn ct-stepper-btn-down ct-stepper-to"
              onClick={() => handleStepTo(-1)}
              title={`Decrement ${toUnit.name} to next whole number`}
              aria-label={`Decrement ${toUnit.name} to next whole number`}
            >
              <Icon name="ChevronDown" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Conversion Result & Formula Card */}
      <div className="ct-footnote-card" aria-label="Conversion equations">
        {/* Row 1: Primary Equation (Hero) */}
        <div className="ct-footnote-row ct-footnote-row-hero">
          <div className="ct-footnote-val ct-val-hero" title={symbolText}>
            <span className="ct-fn-from">
              <span className="ct-fn-num">{displayFromValue}</span>{' '}
              <span className="ct-fn-sym">{fromUnit.symbol}</span>
            </span>
            <span className="ct-fn-operator"> {relOperator} </span>
            <span className="ct-fn-to">
              <button
                type="button"
                className={`ct-num-copy-btn ${copiedNumber ? 'copied' : ''}`}
                onClick={handleCopyNumber}
                title={copiedNumber ? 'Copied to clipboard!' : `Copy ${displayToValue}`}
                aria-label={copiedNumber ? 'Number copied to clipboard' : `Copy result number ${displayToValue}`}
              >
                <span className="ct-fn-num">{displayToValue}</span>
                <span className="ct-num-copy-icon" aria-hidden="true">
                  <Icon name={copiedNumber ? 'Check' : 'Copy'} size={13} />
                </span>
                <span className="ct-num-tooltip" role="tooltip" aria-hidden="true">
                  {copiedNumber ? 'Copied!' : (displayToValue && displayToValue.toString().length <= 10 ? `Copy ${displayToValue}` : 'Copy number')}
                </span>
              </button>{' '}
              <span className="ct-fn-sym">{toUnit.symbol}</span>
            </span>
          </div>
        </div>

        {/* Kitchen Compound Measure Breakdown */}
        {kitchenCompound && (
          <div className="ct-kitchen-measure-row" aria-label="Kitchen measuring breakdown">
            <button
              type="button"
              className={`ct-kitchen-badge ${copiedKitchen ? 'copied' : ''}`}
              onClick={handleCopyKitchen}
              title={copiedKitchen ? 'Copied to clipboard!' : `Copy kitchen measure: ${formatFractionForDisplay(kitchenCompound)}`}
              aria-label={copiedKitchen ? 'Kitchen measure copied' : `Kitchen measure: ${formatFractionForDisplay(kitchenCompound)}`}
            >
              <Icon name="ChefHat" size={15} className="ct-kitchen-icon" />
              <span className="ct-kitchen-label">Kitchen Measure:</span>
              <strong className="ct-kitchen-val">{formatFractionForDisplay(kitchenCompound)}</strong>
              <span className="ct-kitchen-copy-icon" aria-hidden="true">
                <Icon name={copiedKitchen ? 'Check' : 'Copy'} size={12} />
              </span>
            </button>
          </div>
        )}

        {/* Row 2: Invariant Educational Formula & Instruction (Separately copy-able) */}
        {(formulaInstruction || formulaEquation) && (
          <div className="ct-formula-section" aria-label="Conversion formula details">
            {/* 1. Practical Sentence Instruction on Top */}
            {formulaInstruction && (
              <button
                type="button"
                className={`ct-formula-item ct-formula-instruction-item ${copiedInstruction ? 'copied' : ''}`}
                onClick={handleCopyInstruction}
                title={copiedInstruction ? 'Copied to clipboard!' : 'Copy instruction'}
                aria-label={copiedInstruction ? 'Instruction copied to clipboard' : 'Conversion instruction'}
              >
                <span className="ct-formula-item-text">
                  {renderInstructionContent(formulaInstruction, fromUnit)}
                </span>
                <span className="ct-formula-copy-icon" aria-hidden="true">
                  <Icon name={copiedInstruction ? 'Check' : 'Copy'} size={12} />
                </span>
                <span className="ct-formula-tooltip" role="tooltip" aria-hidden="true">
                  {copiedInstruction ? 'Copied!' : 'Copy instruction'}
                </span>
              </button>
            )}

            {/* 2. Formal Mathematical Equation on Bottom */}
            {formulaEquation && (
              <button
                type="button"
                className={`ct-formula-item ct-formula-equation-item ${copiedFormula ? 'copied' : ''}`}
                onClick={handleCopyFormula}
                title={copiedFormula ? 'Copied to clipboard!' : 'Copy formula'}
                aria-label={copiedFormula ? 'Formula copied to clipboard' : 'Conversion formula'}
              >
                <span className="ct-formula-item-text">
                  {renderFormulaContent(formulaEquation, fromUnit.symbol)}
                </span>
                <span className="ct-formula-copy-icon" aria-hidden="true">
                  <Icon name={copiedFormula ? 'Check' : 'Copy'} size={12} />
                </span>
                <span className="ct-formula-tooltip" role="tooltip" aria-hidden="true">
                  {copiedFormula ? 'Copied!' : 'Copy formula'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
