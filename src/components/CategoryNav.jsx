import React, { useRef, useEffect } from 'react';
import { CATEGORIES } from '../engine/conversions';
import { Icon } from './Icons';

export function CategoryNav({ activeCategoryId, onSelectCategory }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
  };

  const isFirstMountRef = useRef(true);

  // Keep active category tab centered in view
  useEffect(() => {
    const scrollToActive = (behavior = 'smooth') => {
      if (!scrollRef.current) return;
      const activeTab = scrollRef.current.querySelector('.ct-category-tab.active');
      if (!activeTab) return;

      if (typeof activeTab.scrollIntoView === 'function') {
        activeTab.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
      } else {
        const container = scrollRef.current;
        const target = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
        container.scrollLeft = Math.max(0, target);
      }
    };

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      // Instant positioning on initial load / refresh to prevent showing wrong tabs
      scrollToActive('auto');
      const timer = setTimeout(() => scrollToActive('auto'), 50);
      return () => clearTimeout(timer);
    } else {
      scrollToActive('smooth');
    }
  }, [activeCategoryId]);

  return (
    <nav className="ct-category-nav" aria-label="Measurement Categories">
      <div className="ct-category-nav-inner">
        <button
          type="button"
          className="ct-nav-arrow ct-nav-arrow-prev"
          onClick={() => handleScroll(-1)}
          title="Scroll left"
          aria-label="Scroll categories left"
        >
          <Icon name="ChevronDown" size={14} className="ct-arrow-rot-left" />
        </button>

        <div className="ct-category-scroll" ref={scrollRef} role="tablist">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                aria-controls="conversion-panel"
                id={`tab-${cat.id}`}
                className={`ct-category-tab ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span className="ct-tab-icon" aria-hidden="true">
                  <Icon name={cat.icon} size={16} />
                </span>
                <span className="ct-tab-label">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="ct-nav-arrow ct-nav-arrow-next"
          onClick={() => handleScroll(1)}
          title="Scroll right"
          aria-label="Scroll categories right"
        >
          <Icon name="ChevronDown" size={14} className="ct-arrow-rot-right" />
        </button>
      </div>
    </nav>
  );
}
