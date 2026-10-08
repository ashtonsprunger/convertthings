import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Icon } from './Icons';
import { Fraction } from './Fraction';
import {
  getUnitsForCategory,
  getUnit,
  getFormulaString,
  getFormulaDetails,
  convertUnits,
  filterAndSortUnits,
  formatDisplayNumber,
  parseFractionString,
  isFractionLike,
  getKitchenDrawerBreakdown,
  getSmartEquationDisplay,
} from '../engine/conversions';

const PRECISION_OPTIONS = [
  { id: 'auto', label: 'Auto (Smart)', btnLabel: 'Auto', icon: 'Sparkles' },
  { id: '2', label: '2 Decimals', btnLabel: '2 Decimals', icon: 'DecimalTwo' },
  { id: '4', label: '4 Decimals', btnLabel: '4 Decimals', icon: 'DecimalFour' },
  { id: 'exact', label: 'Exact', btnLabel: 'Exact', icon: 'Target' },
  { id: 'fraction_tape', label: 'Tape Measure (1/16″ ± 1/32″)', btnLabel: 'Tape Measure', icon: 'Ruler' },
  { id: 'fraction', label: 'Fractions (Mixed: 1 ⅜)', btnLabel: 'Fractions', icon: 'Fraction' },
  { id: 'fraction_improper', label: 'Fractions (Improper: 11/8)', btnLabel: 'Improper Frac', icon: 'Divide' },
];

export function ConversionCard({
  categoryId,
  fromUnitId,
  toUnitId,
  fromValue,
  toValue,
  precision,
  kitchenMode = true,
  onToggleKitchenMode,
  isFavorite,
  onFromUnitChange,
  onToUnitChange,
  onFromValueChange,
  onToValueChange,
  onSwap,
  onPrecisionChange,
  onToggleFavorite,
  onCopy,
  onShare,
}) {
  const units = getUnitsForCategory(categoryId);
  const fromUnit = getUnit(categoryId, fromUnitId) || units[0];
  const toUnit = getUnit(categoryId, toUnitId) || units[1] || units[0];

  const isKitchenActive = categoryId === 'cooking' && kitchenMode;

  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showPrecisionDropdown, setShowPrecisionDropdown] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [copiedInstruction, setCopiedInstruction] = useState(false);
  const [copiedKitchen, setCopiedKitchen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const precisionRef = useRef(null);
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
  const copiedShareTimeoutRef = useRef(null);

  const formulaDetails = getFormulaDetails(categoryId, fromUnit.id, toUnit.id);
  const formula = formulaDetails.equation || getFormulaString(categoryId, fromUnit.id, toUnit.id);

  // Reset copied state when values change
  useEffect(() => {
    setCopiedNumber(false);
    setCopiedFormula(false);
    setCopiedInstruction(false);
    setCopiedKitchen(false);
    setCopiedShare(false);
  }, [fromValue, toValue, fromUnitId, toUnitId]);

  // Clean up timers and running animations on unmount
  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
      if (copiedFormulaTimeoutRef.current) clearTimeout(copiedFormulaTimeoutRef.current);
      if (copiedInstructionTimeoutRef.current) clearTimeout(copiedInstructionTimeoutRef.current);
      if (copiedKitchenTimeoutRef.current) clearTimeout(copiedKitchenTimeoutRef.current);
      if (copiedShareTimeoutRef.current) clearTimeout(copiedShareTimeoutRef.current);
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

  const tempVibe = useMemo(() => {
    if (categoryId !== 'temperature' || !fromValue) return null;
    const num = parseFloat(fromValue);
    if (isNaN(num)) return null;
    if ((fromUnitId === 'k' && num <= 5) || (fromUnitId === 'c' && num <= -268) || (fromUnitId === 'f' && num <= -450)) {
      return 'ct-temp-absolute-zero';
    }
    if ((fromUnitId === 'c' && num >= 100) || (fromUnitId === 'f' && num >= 212) || (fromUnitId === 'k' && num >= 373.15)) {
      return 'ct-temp-boiling';
    }
    return null;
  }, [categoryId, fromValue, fromUnitId]);

  // Hyperspace / Supersonic speed detection (> Mach 1 or > Speed of Light)
  const isHyperspace = useMemo(() => {
    if (categoryId !== 'speed' || !fromValue) return false;
    const num = parseFloat(fromValue);
    if (isNaN(num) || num <= 0) return false;
    const factor = fromUnit?.factor || 1;
    const speedInMps = num * factor;
    return speedInMps >= 340.29; // >= Mach 1 standard sea level (340.29 m/s)
  }, [categoryId, fromValue, fromUnit]);

  const isFasterThanLight = useMemo(() => {
    if (categoryId !== 'speed' || !fromValue) return false;
    const num = parseFloat(fromValue);
    if (isNaN(num) || num <= 0) return false;
    const factor = fromUnit?.factor || 1;
    const speedInMps = num * factor;
    return speedInMps >= 299792458; // >= Speed of light c (299,792,458 m/s)
  }, [categoryId, fromValue, fromUnit]);

  const handleShareClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onShare) onShare();
    setCopiedShare(true);
    if (copiedShareTimeoutRef.current) clearTimeout(copiedShareTimeoutRef.current);
    copiedShareTimeoutRef.current = setTimeout(() => {
      setCopiedShare(false);
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

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(e.target)) {
        setShowFromDropdown(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(e.target)) {
        setShowToDropdown(false);
      }
      if (precisionRef.current && !precisionRef.current.contains(e.target)) {
        setShowPrecisionDropdown(false);
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
    precision === 'fraction_tape' ||
    precision === 'tape' ||
    precision === 'fraction_16' ||
    precision === 'fraction_32' ||
    precision === 'fraction_64';

  const rawTargetValue = (() => {
    if (!fromValue) return null;
    const num = typeof fromValue === 'string' && isFractionLike(fromValue)
      ? parseFractionString(fromValue)
      : parseFloat(fromValue);
    if (isNaN(num)) return null;
    return convertUnits(num, categoryId, fromUnit.id, toUnit.id);
  })();

  const kitchenDrawer = isKitchenActive
    ? getKitchenDrawerBreakdown(fromValue, fromUnit.id)
    : null;

  const handleCopyKitchenOutput = () => {
    if (!kitchenDrawer || !kitchenDrawer.primary) return;
    const textToCopy = kitchenDrawer.primary;
    onCopy(textToCopy, `${textToCopy} copied to clipboard!`);
    setCopiedKitchen(true);
    if (copiedKitchenTimeoutRef.current) clearTimeout(copiedKitchenTimeoutRef.current);
    copiedKitchenTimeoutRef.current = setTimeout(() => {
      setCopiedKitchen(false);
    }, 1600);
  };

  const currentPrecisionOption =
    PRECISION_OPTIONS.find((opt) => opt.id === precision) ||
    (precision === 'fraction_tape' || precision === 'tape' || precision === 'fraction_16' || precision === 'fraction_32' || precision === 'fraction_64'
      ? PRECISION_OPTIONS.find((opt) => opt.id === 'fraction_tape')
      : PRECISION_OPTIONS[0]);

  const smartEquation = precision === 'auto' && !isKitchenActive
    ? getSmartEquationDisplay(categoryId, fromUnit, toUnit, fromValue, rawTargetValue, displayToValue)
    : { value: displayToValue, unit: toUnit.symbol, subtext: null, isSmart: false };

  const handleCopyNumber = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const valToCopy = smartEquation.value || displayToValue || '0';
    const copyLabel = smartEquation.unit ? `${valToCopy} ${smartEquation.unit}` : valToCopy;
    onCopy(valToCopy, `${copyLabel} copied to clipboard!`);
    setCopiedNumber(true);
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => {
      setCopiedNumber(false);
    }, 1600);
  };

  // Calculate if the current conversion result is an approximation
  const isApproximate = (() => {
    if (!fromValue || !toValue || rawTargetValue === null) return false;
    if (smartEquation.isSmart && smartEquation.subtext) return true;
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
  const symbolText = `${displayFromValue} ${fromUnit.symbol} ${relOperator} ${smartEquation.value}${smartEquation.unit ? ' ' + smartEquation.unit : ''}`;

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
      // Only highlight fromSym, keep the rest clean neutral text
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
      className={`ct-card ct-cat-${categoryId}`}
      id="conversion-panel"
      role="tabpanel"
      aria-labelledby={`tab-${categoryId}`}
    >
      {/* Card Header Actions */}
      <div className="ct-card-header">
        <div className="ct-card-header-left">
          {categoryId === 'cooking' && (
            <button
              type="button"
              className={`ct-kitchen-mode-toggle ${kitchenMode ? 'active' : ''}`}
              onClick={onToggleKitchenMode}
              title={
                kitchenMode
                  ? 'Kitchen Drawer Mode active — click to switch to Standard Units'
                  : 'Standard Units active — click to switch to Kitchen Drawer Mode'
              }
              aria-label="Toggle Kitchen Mode"
              aria-pressed={kitchenMode}
            >
              <Icon name="ChefHat" size={15} />
              <span className="ct-kitchen-toggle-text">Kitchen Mode</span>
              <span className={`ct-kitchen-toggle-pill ${kitchenMode ? 'on' : 'off'}`}>
                {kitchenMode ? 'ON' : 'OFF'}
              </span>
            </button>
          )}

          {!isKitchenActive && (
            <div className="ct-precision-wrap" ref={precisionRef}>
              <label htmlFor="ct-precision" className="ct-sr-only">
                Decimal Precision
              </label>
              <select
                id="ct-precision"
                className="ct-sr-only"
                value={precision}
                onChange={(e) => onPrecisionChange(e.target.value)}
                aria-label="Decimal Precision and Formatting"
                tabIndex={-1}
              >
                {PRECISION_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className={`ct-precision-btn ${showPrecisionDropdown ? 'active' : ''}`}
                onClick={() => {
                  setShowPrecisionDropdown(!showPrecisionDropdown);
                  setShowFromDropdown(false);
                  setShowToDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showPrecisionDropdown}
                title="Select formatting and decimal precision"
              >
                <span className="ct-precision-btn-icon" aria-hidden="true">
                  <Icon name={currentPrecisionOption?.icon || 'Sparkles'} size={14} />
                </span>
                <span className="ct-precision-btn-prefix">Precision:</span>
                <span className="ct-precision-btn-val">
                  {currentPrecisionOption?.btnLabel || 'Auto'}
                </span>
                <Icon
                  name="ChevronDown"
                  size={14}
                  className={`ct-dropdown-chevron ${showPrecisionDropdown ? 'rotated' : ''}`}
                />
              </button>

              {showPrecisionDropdown && (
                <div
                  className="ct-dropdown-menu ct-precision-dropdown"
                  role="listbox"
                  aria-label="Precision options"
                >
                  {PRECISION_OPTIONS.map((opt) => {
                    const isSelected =
                      opt.id === precision ||
                      (opt.id === 'fraction_tape' &&
                        (precision === 'tape' || precision === 'fraction_16' || precision === 'fraction_32' || precision === 'fraction_64'));
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`ct-dropdown-item ct-precision-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          onPrecisionChange(opt.id);
                          setShowPrecisionDropdown(false);
                        }}
                      >
                        <span className="ct-precision-item-icon" aria-hidden="true">
                          <Icon name={opt.icon} size={15} />
                        </span>
                        <span className="ct-precision-item-label">{opt.label}</span>
                        {isSelected && (
                          <span className="ct-precision-item-check" aria-hidden="true">
                            <Icon name="Check" size={14} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ct-card-header-right">
          <button
            type="button"
            className={`ct-btn-icon ${copiedShare ? 'copied' : ''}`}
            onClick={handleShareClick}
            title={copiedShare ? 'Link copied to clipboard!' : 'Share this conversion'}
            aria-label="Share conversion link"
          >
            <Icon name={copiedShare ? 'Check' : 'Share'} size={18} />
          </button>

          <button
            type="button"
            className={`ct-btn-icon ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span key={isFavorite ? 'fav' : 'unfav'} className={isFavorite ? 'ct-star-burst' : ''}>
              <Icon
                name="Star"
                size={18}
                fill={isFavorite ? 'currentColor' : 'none'}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Main Conversion Grid with Up/Down Steppers */}
      <div className={`ct-conversion-grid ${isSwapping ? 'ct-grid-swapping' : ''}`}>
        {/* FIRST UNIT BLOCK (FROM - VIOLET) */}
        <div
          ref={fromBlockRef}
          className={`ct-unit-block ct-unit-block-from ${isSwapping ? 'ct-is-swapping' : ''} ${showFromDropdown ? 'ct-dropdown-open' : ''}`}
        >
          <div className="ct-unit-label-wrap" ref={fromDropdownRef}>
            <button
              type="button"
              className={`ct-unit-selector-chip ct-chip-from ${showFromDropdown ? 'active' : ''}`}
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={showFromDropdown}
              title={`Change unit from ${fromUnit.name}`}
              aria-label={`Current unit: ${fromUnit.name}. Click to change.`}
            >
              <span className="ct-unit-chip-name">{fromUnit.name}</span>
              <span className="ct-unit-chip-symbol">{fromUnit.symbol}</span>
              <Icon name="ChevronDown" size={14} strokeWidth={2.5} className={`ct-dropdown-chevron ${showFromDropdown ? 'rotated' : ''}`} />
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
          <div className="ct-integrated-input-box ct-input-box-from">
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
                  if (e.key === 'Escape') {
                    handleClear();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleStepFrom(1);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleStepFrom(-1);
                  }
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
          </div>
        </div>

        {/* CENTER SWAP BUTTON / KITCHEN TRANSFER PILL */}
        {isKitchenActive ? (
          <div className="ct-swap-column ct-kitchen-transfer-column" aria-hidden="true">
            <div className="ct-kitchen-arrow-pill" title="Translates recipe quantity to physical kitchen tools">
              <Icon name="ArrowRight" size={18} />
            </div>
          </div>
        ) : (
          <div className="ct-swap-column">
            <button
              ref={swapBtnRef}
              type="button"
              className={`ct-swap-btn ${isSwapping ? 'ct-swap-active' : ''} ${isHyperspace ? 'ct-swap-hyperspace' : ''} ${isFasterThanLight ? 'ct-swap-ftl' : ''}`}
              onClick={handleSwapClick}
              title={
                isFasterThanLight
                  ? 'Faster-than-Light speed! Hyperspace engaged. Swap units (Alt + S)'
                  : isHyperspace
                  ? 'Supersonic (Mach 1+) speed! Hyperspace trail active. Swap units (Alt + S)'
                  : 'Swap units (Alt + S)'
              }
              aria-label="Swap from and to units"
            >
              <Icon
                name="Swap"
                size={20}
                className={isSwapping && typeof swapBtnRef.current?.animate !== 'function' ? 'ct-swap-icon-spin' : ''}
              />
              {isHyperspace && (
                <span className="ct-hyperspace-trail" aria-hidden="true">
                  <span className="ct-hyperspace-line ct-hl-1" />
                  <span className="ct-hyperspace-line ct-hl-2" />
                  <span className="ct-hyperspace-line ct-hl-3" />
                </span>
              )}
            </button>
          </div>
        )}

        {/* SECOND UNIT BLOCK (TO - EMERALD / KITCHEN OUTPUT) */}
        <div
          ref={toBlockRef}
          className={`ct-unit-block ct-unit-block-to ${isSwapping ? 'ct-is-swapping' : ''} ${showToDropdown ? 'ct-dropdown-open' : ''}`}
        >
          <div className="ct-unit-label-wrap" ref={toDropdownRef}>
            {isKitchenActive ? (
              <span className="ct-unit-header-label">Kitchen Tools</span>
            ) : (
              <button
                type="button"
                className={`ct-unit-selector-chip ct-chip-to ${showToDropdown ? 'active' : ''}`}
                onClick={() => {
                  setShowToDropdown(!showToDropdown);
                  setShowFromDropdown(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={showToDropdown}
                title={`Change unit to ${toUnit.name}`}
                aria-label={`Target unit: ${toUnit.name}. Click to change.`}
              >
                <span className="ct-unit-chip-name">{toUnit.name}</span>
                <span className="ct-unit-chip-symbol ct-unit-sym-to">{toUnit.symbol}</span>
                <Icon name="ChevronDown" size={14} strokeWidth={2.5} className={`ct-dropdown-chevron ${showToDropdown ? 'rotated' : ''}`} />
              </button>
            )}

            {!isKitchenActive && showToDropdown && (
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
          {isKitchenActive ? (
            <div
              className="ct-integrated-input-box ct-kitchen-output-box"
              role="button"
              tabIndex={0}
              onClick={handleCopyKitchenOutput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopyKitchenOutput();
                }
              }}
              title={copiedKitchen ? 'Copied to clipboard!' : `Click to copy: ${kitchenDrawer?.primary || '0'}`}
              aria-label={`Kitchen measuring tools: ${kitchenDrawer?.primary || '0'}. Click to copy.`}
            >
              <div className="ct-kitchen-output-content">
                <span className="ct-kitchen-output-caption">Drawer Tools to Pull</span>
                <span className={`ct-kitchen-output-text ${getNumberFontSizeClass(kitchenDrawer?.primary || '0')}`}>
                  {kitchenDrawer?.primary || '0'}
                </span>
              </div>
              <span className={`ct-kitchen-copy-indicator ${copiedKitchen ? 'copied' : ''}`} aria-hidden="true">
                <Icon name={copiedKitchen ? 'Check' : 'Copy'} size={16} />
              </span>
            </div>
          ) : (
            <div className="ct-integrated-input-box ct-input-box-to">
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
                    if (e.key === 'Escape') {
                      onToValueChange('');
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      handleStepTo(1);
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      handleStepTo(-1);
                    }
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
            </div>
          )}
        </div>
      </div>

      {/* Unified Conversion Result & Formula Card or Kitchen Drawer Shelf */}
      {isKitchenActive ? (
        <div className="ct-kitchen-drawer-card" aria-label="Kitchen Measuring Drawer">
          <div className="ct-kitchen-tools-section">
            <div className="ct-kitchen-shelf-header">
              <span className="ct-kitchen-shelf-title">
                <Icon name="ChefHat" size={16} />
                <span>Measuring Tools Needed</span>
              </span>
              <span className="ct-kitchen-shelf-hint">Pull these from your kitchen drawer</span>
            </div>
            <div className="ct-kitchen-tools-pills">
              {kitchenDrawer && kitchenDrawer.tools && kitchenDrawer.tools.length > 0 ? (
                kitchenDrawer.tools.map((tool, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="ct-kitchen-plus" aria-hidden="true">+</span>}
                    <button
                      type="button"
                      className="ct-kitchen-tool-chip"
                      onClick={() => onCopy(tool, `${tool} copied!`)}
                      title={`Click to copy: ${tool}`}
                    >
                      <span className="ct-tool-chip-icon" aria-hidden="true">🥄</span>
                      <span className="ct-tool-chip-text"><Fraction value={tool} /></span>
                    </button>
                  </React.Fragment>
                ))
              ) : (
                <span className="ct-kitchen-tool-chip empty">0</span>
              )}
            </div>
          </div>

          {kitchenDrawer && (
            <div className="ct-kitchen-equivalents-section">
              <div className="ct-kitchen-shelf-header">
                <span className="ct-kitchen-shelf-title">
                  <Icon name="Sparkles" size={14} />
                  <span>Standard Equivalents</span>
                </span>
                <span className="ct-kitchen-shelf-hint">Quick reference for common measures</span>
              </div>
              <div className="ct-kitchen-equiv-grid">
                <button
                  type="button"
                  className="ct-kitchen-equiv-pill"
                  onClick={() => onCopy(kitchenDrawer.cups, `${kitchenDrawer.cups} copied!`)}
                  title={`Click to copy cups: ${kitchenDrawer.cups}`}
                >
                  <span className="ct-equiv-label">Cups</span>
                  <span className="ct-equiv-val">{kitchenDrawer.cups}</span>
                </button>
                <button
                  type="button"
                  className="ct-kitchen-equiv-pill"
                  onClick={() => onCopy(kitchenDrawer.tbsp, `${kitchenDrawer.tbsp} copied!`)}
                  title={`Click to copy tablespoons: ${kitchenDrawer.tbsp}`}
                >
                  <span className="ct-equiv-label">Tablespoons</span>
                  <span className="ct-equiv-val">{kitchenDrawer.tbsp}</span>
                </button>
                <button
                  type="button"
                  className="ct-kitchen-equiv-pill"
                  onClick={() => onCopy(kitchenDrawer.tsp, `${kitchenDrawer.tsp} copied!`)}
                  title={`Click to copy teaspoons: ${kitchenDrawer.tsp}`}
                >
                  <span className="ct-equiv-label">Teaspoons</span>
                  <span className="ct-equiv-val">{kitchenDrawer.tsp}</span>
                </button>
                <button
                  type="button"
                  className="ct-kitchen-equiv-pill"
                  onClick={() => onCopy(kitchenDrawer.flOz, `${kitchenDrawer.flOz} copied!`)}
                  title={`Click to copy fluid ounces: ${kitchenDrawer.flOz}`}
                >
                  <span className="ct-equiv-label">Fluid Ounces</span>
                  <span className="ct-equiv-val">{kitchenDrawer.flOz}</span>
                </button>
                <button
                  type="button"
                  className="ct-kitchen-equiv-pill"
                  onClick={() => onCopy(kitchenDrawer.ml, `${kitchenDrawer.ml} copied!`)}
                  title={`Click to copy metric milliliters: ${kitchenDrawer.ml}`}
                >
                  <span className="ct-equiv-label">Metric</span>
                  <span className="ct-equiv-val">{kitchenDrawer.ml}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="ct-footnote-card" aria-label="Conversion equations">
          {/* Row 1: Primary Equation (Hero) */}
          <div className={`ct-footnote-row ct-footnote-row-hero ${tempVibe || ''}`}>
            <div className="ct-footnote-val ct-val-hero" title={symbolText}>
              <span className="ct-fn-from">
                <span className="ct-fn-num">
                  <Fraction value={displayFromValue} />
                </span>{' '}
                <span className="ct-fn-sym">{fromUnit.symbol}</span>
              </span>
              <span className="ct-fn-operator"> {relOperator} </span>
              <button
                type="button"
                className={`ct-num-copy-btn ct-fn-to ${copiedNumber ? 'copied' : ''}`}
                onClick={handleCopyNumber}
                title={
                  copiedNumber
                    ? 'Copied to clipboard!'
                    : smartEquation.subtext
                    ? `Copy ${smartEquation.value}${smartEquation.unit ? ' ' + smartEquation.unit : ''} (${smartEquation.subtext})`
                    : `Copy ${smartEquation.value}${smartEquation.unit ? ' ' + smartEquation.unit : ''}`
                }
                aria-label={
                  copiedNumber
                    ? 'Number copied to clipboard'
                    : smartEquation.subtext
                    ? `Copy result number ${smartEquation.value} (${smartEquation.subtext})`
                    : `Copy result number ${smartEquation.value}`
                }
              >
                <span className="ct-fn-num">
                  <Fraction value={smartEquation.value} />
                </span>
                {smartEquation.unit ? (
                  <>
                    {' '}
                    <span className="ct-fn-sym">{smartEquation.unit}</span>
                  </>
                ) : null}
                <span className="ct-num-copy-icon" key={copiedNumber ? 'chk' : 'cpy'} aria-hidden="true">
                  <Icon name={copiedNumber ? 'Check' : 'Copy'} size={13} />
                </span>
                <span className="ct-num-tooltip" role="tooltip" aria-hidden="true">
                  {copiedNumber ? 'Copied!' : (smartEquation.value && smartEquation.value.toString().length <= 14 ? `Copy ${smartEquation.value}` : 'Copy result')}
                </span>
              </button>
            </div>

            {tempVibe === 'ct-temp-absolute-zero' && (
              <div className="ct-temp-dynamic-pill ct-temp-pill-zero" title="Approaching Absolute Zero (0 Kelvin)">
                <span className="ct-temp-pill-icon">❄️</span>
                <span className="ct-temp-pill-label">Cryogenic Zone</span>
              </div>
            )}
            {tempVibe === 'ct-temp-boiling' && (
              <div className="ct-temp-dynamic-pill ct-temp-pill-boiling" title="At or above Boiling Point of Water">
                <span className="ct-temp-pill-icon">🔥</span>
                <span className="ct-temp-pill-label">Boiling Point</span>
              </div>
            )}
          </div>

          {/* Row 2: Invariant Educational Formula & Instruction (Separately copy-able) */}
          {(formulaInstruction || formulaEquation) && (
            <div className="ct-formula-section" aria-label="Conversion formula details">
              <div className="ct-formula-strip">
                {/* 1. Formal Mathematical Equation */}
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
                    <span className="ct-formula-copy-icon" key={copiedFormula ? 'chk' : 'cpy'} aria-hidden="true">
                      <Icon name={copiedFormula ? 'Check' : 'Copy'} size={12} />
                    </span>
                    <span className="ct-formula-tooltip" role="tooltip" aria-hidden="true">
                      {copiedFormula ? 'Copied!' : 'Copy formula'}
                    </span>
                  </button>
                )}

                {/* 2. Practical Sentence Instruction */}
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
                    <span className="ct-formula-copy-icon" key={copiedInstruction ? 'chk' : 'cpy'} aria-hidden="true">
                      <Icon name={copiedInstruction ? 'Check' : 'Copy'} size={12} />
                    </span>
                    <span className="ct-formula-tooltip" role="tooltip" aria-hidden="true">
                      {copiedInstruction ? 'Copied!' : 'Copy instruction'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
