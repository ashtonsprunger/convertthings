import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { CATEGORIES } from '../engine/conversions';
import { Icon } from './Icons';

export function CategoryNav({ activeCategoryId, onSelectCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const navInnerRef = useRef(null);
  const scrollRef = useRef(null);
  const expandBtnRef = useRef(null);
  const prevSnapshotRef = useRef(null);
  const activeAnimationsRef = useRef([]);
  const isFirstMountRef = useRef(true);
  const [scrollOverflow, setScrollOverflow] = useState({ left: false, right: true });

  // Dynamically compute scroll overflow to fade carousel edges when overflowing
  const updateScrollOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isExpanded) {
      setScrollOverflow((prev) => (prev.left || prev.right ? { left: false, right: false } : prev));
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canLeft = scrollLeft > 2;
    const canRight = scrollLeft + clientWidth < scrollWidth - 2;

    setScrollOverflow((prev) => {
      if (prev.left === canLeft && prev.right === canRight) return prev;
      return { left: canLeft, right: canRight };
    });
  }, [isExpanded]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollOverflow();

    const onScroll = () => {
      updateScrollOverflow();
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollOverflow);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollOverflow);
    };
  }, [updateScrollOverflow]);

  // Take a bounding rect snapshot of all category chips and container (FLIP "First")
  const takeSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return null;

    if (!scrollRef.current) return null;

    const chips = scrollRef.current.querySelectorAll('.ct-category-tab');
    const chipMap = new Map();
    chips.forEach((chip) => {
      const id = chip.getAttribute('data-cat-id');
      if (id) {
        chipMap.set(id, chip.getBoundingClientRect());
      }
    });

    const containerRect = navInnerRef.current?.getBoundingClientRect() || null;
    const btnRect = expandBtnRef.current?.getBoundingClientRect() || null;
    return { chips: chipMap, container: containerRect, btn: btnRect };
  }, []);

  // Desktop mouse wheel scroll translation (vertical wheel -> horizontal track scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (isExpanded) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!delta) return;

      const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
      const canScrollLeft = el.scrollLeft > 1;

      if ((delta > 0 && canScrollRight) || (delta < 0 && canScrollLeft)) {
        e.preventDefault();
        el.scrollLeft += delta;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isExpanded]);

  const toggleExpand = useCallback((targetState) => {
    setIsExpanded((prev) => {
      const next = targetState !== undefined ? targetState : !prev;
      if (next === prev) return prev;
      prevSnapshotRef.current = takeSnapshot();
      return next;
    });
  }, [takeSnapshot]);

  const handleSelect = (catId) => {
    if (isExpanded) {
      prevSnapshotRef.current = takeSnapshot();
      setIsExpanded(false);
    }
    onSelectCategory(catId);
  };

  // FLIP Animation Coordinator
  useLayoutEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (!prevSnapshotRef.current) return;
    const { chips: prevChips, container: prevContainer, btn: prevBtn } = prevSnapshotRef.current;
    prevSnapshotRef.current = null;

    if (!scrollRef.current) return;

    // When collapsing, immediately position scrollLeft to the active category BEFORE measuring Last
    // This eliminates any bounce or secondary scroll hitching on landing!
    if (!isExpanded) {
      const activeTab = scrollRef.current.querySelector('.ct-category-tab.active') ||
                        scrollRef.current.querySelector(`[data-cat-id="${activeCategoryId}"]`);
      if (activeTab) {
        const container = scrollRef.current;
        const target = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
        container.scrollLeft = Math.max(0, target);
      }
    }

    // Cancel any running animations to prevent hitching
    activeAnimationsRef.current.forEach((anim) => {
      try {
        anim.cancel();
      } catch (e) {
        // ignore
      }
    });
    activeAnimationsRef.current = [];

    const duration = isExpanded ? 300 : 260;
    const easing = isExpanded
      ? 'cubic-bezier(0.16, 1, 0.3, 1)'
      : 'cubic-bezier(0.25, 1, 0.5, 1)';

    // Temporarily suppress scrollbars and gradient mask clipping during the FLIP transition
    if (scrollRef.current) {
      scrollRef.current.classList.add('is-animating');
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.classList.remove('is-animating');
          updateScrollOverflow();
        }
      }, duration + 30);
    }

    // 1. Animate container height smoothly so ConversionCard below glides seamlessly
    if (navInnerRef.current && prevContainer && typeof navInnerRef.current.animate === 'function') {
      const currentContainer = navInnerRef.current.getBoundingClientRect();
      const heightDelta = prevContainer.height - currentContainer.height;
      if (Math.abs(heightDelta) > 2) {
        const anim = navInnerRef.current.animate(
          [
            { height: `${prevContainer.height}px` },
            { height: `${currentContainer.height}px` },
          ],
          {
            duration,
            easing,
          }
        );
        activeAnimationsRef.current.push(anim);
      }
    }

    // 2. Animate expand/collapse button seamlessly with FLIP so it NEVER jumps
    if (prevBtn && expandBtnRef.current && typeof expandBtnRef.current.animate === 'function') {
      const curBtn = expandBtnRef.current.getBoundingClientRect();
      const btnDx = prevBtn.left - curBtn.left;
      const btnDy = prevBtn.top - curBtn.top;
      if (Math.abs(btnDx) > 0.5 || Math.abs(btnDy) > 0.5) {
        const anim = expandBtnRef.current.animate(
          [
            { transform: `translate(${btnDx}px, ${btnDy}px)` },
            { transform: 'translate(0, 0)' },
          ],
          {
            duration,
            easing,
          }
        );
        activeAnimationsRef.current.push(anim);
      }
    }

    // 3. Physical FLIP translation for each category chip with true container visibility bounds
    const contRect = (navInnerRef.current || scrollRef.current).getBoundingClientRect();
    const curBtnRect = expandBtnRef.current?.getBoundingClientRect();
    const visibleRightLimit = isExpanded || !curBtnRect ? contRect.right : curBtnRect.left - 4;

    const chips = scrollRef.current.querySelectorAll('.ct-category-tab');
    chips.forEach((chip) => {
      if (typeof chip.animate !== 'function') return;

      const id = chip.getAttribute('data-cat-id');
      const first = prevChips.get(id);
      if (!first) return;

      const last = chip.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;

      const wasInView = first.right > contRect.left && first.left < contRect.right;
      // In collapsed state, is the chip comfortably inside the visible row without being chopped off on landing?
      const isInView = isExpanded
        ? (last.right > contRect.left && last.left < contRect.right)
        : (last.left >= contRect.left - 4 && last.right <= visibleRightLimit + 2);

      if (isExpanded) {
        if (wasInView) {
          // Smooth glide from collapsed single-row position to grid position
          const anim = chip.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: 'translate(0, 0)' },
            ],
            { duration, easing }
          );
          activeAnimationsRef.current.push(anim);
        } else {
          // Newly revealed item in grid: cascade in smoothly from above
          const anim = chip.animate(
            [
              { transform: 'translateY(-8px) scale(0.92)', opacity: 0 },
              { transform: 'translateY(0) scale(1)', opacity: 1 },
            ],
            { duration: 240, easing }
          );
          activeAnimationsRef.current.push(anim);
        }
      } else {
        // Collapsing back to single row
        if (isInView) {
          // Lands fully inside the visible row: physically glide smoothly into resting spot
          const anim = chip.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: 'translate(0, 0)' },
            ],
            { duration, easing }
          );
          activeAnimationsRef.current.push(anim);
        } else {
          // Off-screen or cut off in single row: gently fold upward and fade out in place
          // ZERO horizontal shooting across screen! ZERO cut-off chips on landing!
          const anim = chip.animate(
            [
              { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1 },
              { transform: `translate(${dx}px, ${dy - 10}px) scale(0.9)`, opacity: 0 },
            ],
            { duration: 200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' }
          );
          activeAnimationsRef.current.push(anim);
        }
      }
    });
  }, [isExpanded, activeCategoryId, updateScrollOverflow]);

  // Keep active category tab centered in view when activeCategoryId changes via external controls
  useEffect(() => {
    if (isExpanded) return;

    const container = scrollRef.current;
    if (!container) return;

    const activeTab = container.querySelector('.ct-category-tab.active');
    if (!activeTab) return;

    const target = activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2;
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    } else {
      container.scrollLeft = Math.max(0, target);
    }
    const t = setTimeout(updateScrollOverflow, 320);
    return () => clearTimeout(t);
  }, [activeCategoryId, isExpanded, updateScrollOverflow]);

  // Pressing Escape or clicking outside closes expanded grid view
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        toggleExpand(false);
      }
    };

    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        toggleExpand(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isExpanded, toggleExpand]);

  const maskClass = (() => {
    if (isExpanded) return 'ct-mask-none';
    if (scrollOverflow.left && scrollOverflow.right) return 'ct-mask-both';
    if (scrollOverflow.left) return 'ct-mask-left';
    if (scrollOverflow.right) return 'ct-mask-right';
    return 'ct-mask-none';
  })();

  return (
    <nav
      className={`ct-category-nav ${isExpanded ? 'is-expanded' : ''}`}
      aria-label="Measurement Categories"
      ref={navRef}
    >
      <div
        className={`ct-category-nav-inner ${isExpanded ? 'is-expanded' : ''}`}
        ref={navInnerRef}
      >
        {/* Carousel track & persistent category chip track */}
        <div className={`ct-category-controls-row ${isExpanded ? 'is-expanded' : ''}`}>
          <button
            ref={expandBtnRef}
            type="button"
            className={`ct-category-expand-btn ${isExpanded ? 'is-expanded' : ''}`}
            onClick={() => toggleExpand(!isExpanded)}
            title={isExpanded ? 'Show fewer categories' : 'View all 15 categories'}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Show fewer categories' : 'View all 15 categories'}
          >
            {isExpanded ? (
              <>
                <Icon name="ChevronUp" size={13} />
                <span className="ct-expand-text">Show less</span>
              </>
            ) : (
              <>
                <Icon name="Grid" size={13} />
                <span className="ct-expand-text">All (15)</span>
                <Icon name="ChevronDown" size={11} className="ct-expand-chevron" />
              </>
            )}
          </button>

          {/* Persistent Chips Container (reused in both single-row and grid states) */}
          <div
            className={`ct-category-scroll ${isExpanded ? 'is-expanded' : ''} ${maskClass}`}
            ref={scrollRef}
            role="tablist"
          >
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="conversion-panel"
                  id={`tab-${cat.id}`}
                  data-cat-id={cat.id}
                  className={`ct-category-tab ${isActive ? 'active' : ''} ct-cat-${cat.id}`}
                  onClick={() => handleSelect(cat.id)}
                >
                  <span className="ct-tab-icon" aria-hidden="true">
                    <Icon name={cat.icon} size={16} />
                  </span>
                  <span className="ct-tab-label">{cat.name}</span>
                </button>
              );
            })}

          </div>
        </div>
      </div>
    </nav>
  );
}
