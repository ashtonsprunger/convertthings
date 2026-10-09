import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icons';
import { formatDisplayNumber, CATEGORIES } from '../engine/conversions';

export function ConversionHistory({ history, onSelectHistory, onClearHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayHistory, setDisplayHistory] = useState(history || []);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isInitialMount = useRef(true);
  const prevHistoryLenRef = useRef(history?.length || 0);

  useEffect(() => {
    const curLen = history?.length || 0;
    const prevLen = prevHistoryLenRef.current;
    prevHistoryLenRef.current = curLen;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDisplayHistory(history || []);
      return;
    }

    if (curLen > 0 && prevLen === 0) {
      // Just appeared: smoothly animate entrance and slide the rest of the page down
      setDisplayHistory(history);
      setIsExiting(false);
      setIsEntering(true);
      setIsTransitioning(true);
      const raf = requestAnimationFrame(() => {
        setIsEntering(false);
      });
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 380);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    } else if (curLen === 0 && prevLen > 0) {
      // Cleared: smoothly animate exit and slide the rest of the page up
      setIsExiting(true);
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayHistory([]);
        setIsExiting(false);
        setIsTransitioning(false);
      }, 340);
      return () => clearTimeout(timer);
    } else if (curLen > 0) {
      setDisplayHistory(history);
      setIsExiting(false);
    }
  }, [history]);

  const handleClear = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsExiting(true);
    setIsTransitioning(true);
    if (onClearHistory) {
      onClearHistory();
    }
    setTimeout(() => {
      setDisplayHistory([]);
      setIsExiting(false);
      setIsTransitioning(false);
    }, 340);
  };

  if (!displayHistory || displayHistory.length === 0) {
    return null;
  }

  const wrapperClasses = [
    'ct-history-wrapper',
    isExiting && 'exiting',
    isEntering && 'entering',
    isTransitioning ? 'transitioning' : 'resting'
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <div className="ct-history-wrapper-inner">
        <section className={`ct-history-section ${isOpen ? 'open' : ''}`} aria-label="Recent conversions">
          <div className="ct-history-header">
            <button
              type="button"
              className="ct-history-title-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={`Recent Conversions (${displayHistory.length})`}
            >
              <div className="ct-card-header-left">
                <div className="ct-card-header-badge ct-history-header-badge" aria-hidden="true">
                  <Icon name="History" size={20} />
                </div>
                <div className="ct-card-title-group">
                  <h3 className="ct-card-heading ct-history-heading">Recent Conversions</h3>
                  <p className="ct-card-subtitle ct-history-subtitle">
                    {displayHistory.length} saved conversion{displayHistory.length === 1 ? '' : 's'} from this session
                  </p>
                </div>
              </div>
            </button>

            <div className="ct-history-header-actions">
              {isOpen && (
                <button
                  type="button"
                  className="ct-history-clear-btn"
                  onClick={handleClear}
                  title="Clear conversion history"
                  aria-label="Clear conversion history"
                >
                  <Icon name="Trash" size={14} />
                  <span>Clear</span>
                </button>
              )}

              <button
                type="button"
                className="ct-history-toggle-pill"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Hide recent conversions' : 'Show recent conversions'}
              >
                <span className="ct-history-pill-text">{isOpen ? 'Hide' : 'Show'}</span>
                <Icon
                  name="ChevronDown"
                  size={14}
                  className={`ct-history-chevron ${isOpen ? 'rotated' : ''}`}
                />
              </button>
            </div>
          </div>

          <div
            className={`ct-history-list-wrapper ${isOpen ? 'open' : ''}`}
            aria-hidden={!isOpen}
          >
            <div className="ct-history-list-inner">
              <div className="ct-history-list">
                {displayHistory.map((item, index) => {
                  const cat = CATEGORIES.find((c) => c.id === item.categoryId);
                  const iconName = item.categoryIcon || cat?.icon || 'History';
                  const catName = item.categoryName || cat?.name || item.categoryId;

                  return (
                    <button
                      key={`${item.timestamp || index}-${item.categoryId}`}
                      type="button"
                      className={`ct-history-item ct-cat-${item.categoryId}`}
                      onClick={() => onSelectHistory(item)}
                    >
                      <div className="ct-history-expression">
                        <span className="ct-history-from">
                          {formatDisplayNumber(item.fromValue)} {item.fromSymbol}
                        </span>
                        <span className="ct-history-equals">=</span>
                        <span className="ct-history-to">
                          {formatDisplayNumber(item.toValue)} {item.toSymbol}
                        </span>
                      </div>
                      <span
                        className="ct-history-cat"
                        title={catName}
                        aria-label={catName}
                      >
                        <Icon name={iconName} size={15} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
