import React, { useState } from 'react';
import { Icon } from './Icons';

export function ConversionHistory({ history, onSelectHistory, onClearHistory }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!history || history.length === 0) return null;

  return (
    <section className="ct-history-section" aria-label="Recent conversions">
      <div className="ct-history-header">
        <button
          type="button"
          className="ct-history-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <Icon name="History" size={16} />
          <span>Recent Conversions ({history.length})</span>
          <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={14} />
        </button>

        {isOpen && (
          <button
            type="button"
            className="ct-history-clear-btn"
            onClick={onClearHistory}
            title="Clear conversion history"
          >
            <Icon name="Trash" size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="ct-history-list">
          {history.map((item, index) => (
            <button
              key={`${item.timestamp || index}-${item.categoryId}`}
              type="button"
              className="ct-history-item"
              onClick={() => onSelectHistory(item)}
            >
              <div className="ct-history-expression">
                <span className="ct-history-from">
                  {item.fromValue} {item.fromSymbol}
                </span>
                <span className="ct-history-equals">=</span>
                <span className="ct-history-to">
                  {item.toValue} {item.toSymbol}
                </span>
              </div>
              <span className="ct-history-cat">{item.categoryName}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
