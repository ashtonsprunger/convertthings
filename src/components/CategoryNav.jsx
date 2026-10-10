import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { CATEGORIES } from '../engine/conversions';
import { Icon } from './Icons';

function getCategoryTabTargetScroll(container, tab) {
  if (!container || !tab) return 0;
  const containerRect = container.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  const visualDelta = (tabRect.left + tabRect.width / 2) - (containerRect.left + containerRect.width / 2);
  const target = container.scrollLeft + visualDelta;
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
  return Math.max(0, Math.min(Math.round(target), maxScroll));
}

export function CategoryNav({ activeCategoryId, onSelectCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const navInnerRef = useRef(null);
  const scrollRef = useRef(null);
  const expandBtnRef = useRef(null);
  const prevSnapshotRef = useRef(null);
  const activeAnimationsRef = useRef([]);
  const isFirstMountRef = useRef(true);
  const isCollapsingRef = useRef(false);
  const flightTimeoutRef = useRef(null);
  const [scrollOverflow, setScrollOverflow] = useState({ left: false, right: true });
  const [isFlying, setIsFlying] = useState(false);

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

  // Cleanup any lingering flight timeout on unmount
  useEffect(() => {
    return () => {
      if (flightTimeoutRef.current) {
        clearTimeout(flightTimeoutRef.current);
      }
    };
  }, []);

  // Take a bounding rect snapshot of all category chips and container (Flight Layer "First")
  const takeSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function') return null;
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return null;

    if (!scrollRef.current || !navInnerRef.current) return null;

    const chips = scrollRef.current.querySelectorAll('.ct-category-tab');
    const chipMap = new Map();
    chips.forEach((chip) => {
      const id = chip.getAttribute('data-cat-id');
      if (id) {
        chipMap.set(id, {
          rect: chip.getBoundingClientRect(),
          clone: chip.cloneNode(true),
        });
      }
    });

    const containerRect = navInnerRef.current.getBoundingClientRect();
    const btnRect = expandBtnRef.current?.getBoundingClientRect() || null;
    const scrollRect = scrollRef.current.getBoundingClientRect();
    return {
      chips: chipMap,
      container: containerRect,
      btn: btnRect,
      scroll: scrollRect,
      wasExpanded: isExpanded,
    };
  }, [isExpanded]);

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
    const snapshot = takeSnapshot();
    if (snapshot) {
      prevSnapshotRef.current = snapshot;
      setIsFlying(true);
    }
    setIsExpanded((prev) => {
      const next = targetState !== undefined ? targetState : !prev;
      if (prev && !next) {
        isCollapsingRef.current = true;
      }
      return next;
    });
  }, [takeSnapshot]);

  const handleSelect = (catId) => {
    if (isExpanded) {
      isCollapsingRef.current = true;
      const snapshot = takeSnapshot();
      if (snapshot) {
        prevSnapshotRef.current = snapshot;
        setIsFlying(true);
      }
      setIsExpanded(false);
    }
    onSelectCategory(catId);
  };

  // Flight Layer Animation Coordinator
  useLayoutEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    if (!prevSnapshotRef.current) {
      setIsFlying(false);
      return;
    }
    const {
      chips: prevChips,
      container: prevContainer,
      btn: prevBtn,
      scroll: prevScroll,
    } = prevSnapshotRef.current;
    prevSnapshotRef.current = null;

    if (!scrollRef.current || !navInnerRef.current) {
      setIsFlying(false);
      return;
    }

    // Clean up any running animations or existing flight overlays
    if (flightTimeoutRef.current) {
      clearTimeout(flightTimeoutRef.current);
      flightTimeoutRef.current = null;
    }
    const existingOverlays = navInnerRef.current.querySelectorAll('.ct-category-flight-overlay');
    existingOverlays.forEach((el) => el.remove());

    scrollRef.current.classList.remove('is-animating');
    navInnerRef.current.classList.remove('is-animating');

    activeAnimationsRef.current.forEach((anim) => {
      try {
        anim.cancel();
      } catch (e) {
        // ignore
      }
    });
    activeAnimationsRef.current = [];

    // When collapsing, immediately position scrollLeft to the active category BEFORE measuring Last
    if (!isExpanded) {
      const activeTab = scrollRef.current.querySelector(`[data-cat-id="${activeCategoryId}"]`) ||
                        scrollRef.current.querySelector('.ct-category-tab.active');
      if (activeTab) {
        const container = scrollRef.current;
        const target = getCategoryTabTargetScroll(container, activeTab);
        container.scrollLeft = target;
      }
    }

    const duration = isExpanded ? 300 : 260;
    const easing = isExpanded
      ? 'cubic-bezier(0.16, 1, 0.3, 1)'
      : 'cubic-bezier(0.25, 1, 0.5, 1)';

    // 1. Animate container height smoothly so ConversionCard below glides seamlessly
    const currentContainer = navInnerRef.current.getBoundingClientRect();
    if (prevContainer && Math.abs(prevContainer.height - currentContainer.height) > 2) {
      const anim = navInnerRef.current.animate(
        [
          { height: `${prevContainer.height}px` },
          { height: `${currentContainer.height}px` },
        ],
        { duration, easing }
      );
      activeAnimationsRef.current.push(anim);
    }

    // 2. Animate expand/collapse button seamlessly with FLIP
    if (prevBtn && expandBtnRef.current && typeof expandBtnRef.current.animate === 'function') {
      const curBtn = expandBtnRef.current.getBoundingClientRect();
      const btnDx = prevBtn.left - curBtn.left;
      const btnDy = prevBtn.top - curBtn.top;
      if (Math.abs(btnDx) > 0.5 || Math.abs(btnDy) > 0.5) {
        const anim = expandBtnRef.current.animate(
          [
            { transform: `translate3d(${btnDx}px, ${btnDy}px, 0)` },
            { transform: 'translate3d(0, 0, 0)' },
          ],
          { duration, easing }
        );
        activeAnimationsRef.current.push(anim);
      }
    }

    // 3. FLIGHT OVERLAYS: Animate chips outside the scroll container without triggering scroll-snap
    scrollRef.current.classList.add('is-animating');
    navInnerRef.current.classList.add('is-animating');

    const navRect = navInnerRef.current.getBoundingClientRect();
    const contRect = scrollRef.current.getBoundingClientRect();

    let trackOverlay = null;
    let fadeOverlay = null;
    let expandOverlay = null;

    if (!isExpanded) {
      // COLLAPSING: Grid -> Carousel
      // Calculate dynamic edge fade mask for destination carousel track
      const canScrollLeft = scrollRef.current.scrollLeft > 2;
      const canScrollRight =
        scrollRef.current.scrollLeft + scrollRef.current.clientWidth <
        scrollRef.current.scrollWidth - 2;
      const targetMask =
        canScrollLeft && canScrollRight
          ? 'ct-mask-both'
          : canScrollLeft
          ? 'ct-mask-left'
          : canScrollRight
          ? 'ct-mask-right'
          : 'ct-mask-none';

      // Track overlay: strictly bounded to scroll track with identical edge masks, ending before expand button
      trackOverlay = document.createElement('div');
      trackOverlay.className = `ct-category-flight-overlay ${targetMask}`;
      trackOverlay.style.position = 'absolute';
      trackOverlay.style.left = `${contRect.left - navRect.left}px`;
      trackOverlay.style.top = '0';
      trackOverlay.style.width = `${contRect.width}px`;
      trackOverlay.style.height = `${currentContainer.height}px`;
      trackOverlay.style.zIndex = '10';
      navInnerRef.current.appendChild(trackOverlay);

      // Fade overlay: for off-screen chips gently folding in place behind expand button
      fadeOverlay = document.createElement('div');
      fadeOverlay.className = 'ct-category-flight-overlay';
      fadeOverlay.style.position = 'absolute';
      fadeOverlay.style.inset = '0';
      fadeOverlay.style.zIndex = '5';
      navInnerRef.current.appendChild(fadeOverlay);
    } else {
      // EXPANDING: Carousel -> Grid
      expandOverlay = document.createElement('div');
      expandOverlay.className = 'ct-category-flight-overlay';
      expandOverlay.style.position = 'absolute';
      expandOverlay.style.inset = '0';
      expandOverlay.style.zIndex = '10';
      navInnerRef.current.appendChild(expandOverlay);
    }

    CATEGORIES.forEach((cat) => {
      const prevData = prevChips.get(cat.id);
      if (!prevData) return;
      const firstRect = prevData.rect;

      const realTab = scrollRef.current.querySelector(`[data-cat-id="${cat.id}"]`);
      if (!realTab) return;
      const lastRect = realTab.getBoundingClientRect();

      if (!isExpanded) {
        // COLLAPSING: Grid -> Carousel
        // Does this chip land anywhere inside the visible carousel viewport?
        const isInView = lastRect.right > contRect.left && lastRect.left < contRect.right;

        if (isInView && trackOverlay) {
          // Lands in the visible row: physically glides smoothly into resting spot
          const flightChip = prevData.clone;
          flightChip.className = realTab.className;
          flightChip.style.position = 'absolute';
          flightChip.style.left = `${lastRect.left - contRect.left}px`;
          flightChip.style.top = `${lastRect.top - navRect.top}px`;
          flightChip.style.width = `${lastRect.width}px`;
          flightChip.style.height = `${lastRect.height}px`;
          flightChip.style.margin = '0';
          flightChip.style.pointerEvents = 'none';
          flightChip.style.boxSizing = 'border-box';
          trackOverlay.appendChild(flightChip);

          const dx = firstRect.left - lastRect.left;
          const dy = firstRect.top - lastRect.top;
          if (typeof flightChip.animate === 'function') {
            flightChip.animate(
              [
                { transform: `translate3d(${dx}px, ${dy}px, 0)` },
                { transform: 'translate3d(0, 0, 0)' },
              ],
              { duration, easing }
            );
          }
        } else if (fadeOverlay) {
          // Off-screen in single row: gently fold upward and fade out in place
          const flightChip = prevData.clone;
          flightChip.style.position = 'absolute';
          flightChip.style.left = `${firstRect.left - prevContainer.left}px`;
          flightChip.style.top = `${firstRect.top - prevContainer.top}px`;
          flightChip.style.width = `${firstRect.width}px`;
          flightChip.style.height = `${firstRect.height}px`;
          flightChip.style.margin = '0';
          flightChip.style.pointerEvents = 'none';
          flightChip.style.boxSizing = 'border-box';
          fadeOverlay.appendChild(flightChip);

          if (typeof flightChip.animate === 'function') {
            flightChip.animate(
              [
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
                { opacity: 0, transform: 'translate3d(0, -8px, 0) scale(0.92)' },
              ],
              { duration, easing, fill: 'forwards' }
            );
          }
        }
      } else {
        // EXPANDING: Carousel -> Grid
        // Was this chip visible in the carousel before expanding?
        const wasInView = prevScroll && firstRect.right > prevScroll.left && firstRect.left < prevScroll.right;

        if (wasInView && expandOverlay) {
          // Smooth glide from collapsed single-row position to grid position
          const flightChip = prevData.clone;
          flightChip.className = realTab.className;
          flightChip.style.position = 'absolute';
          flightChip.style.left = `${lastRect.left - navRect.left}px`;
          flightChip.style.top = `${lastRect.top - navRect.top}px`;
          flightChip.style.width = `${lastRect.width}px`;
          flightChip.style.height = `${lastRect.height}px`;
          flightChip.style.margin = '0';
          flightChip.style.pointerEvents = 'none';
          flightChip.style.boxSizing = 'border-box';
          expandOverlay.appendChild(flightChip);

          const dx = firstRect.left - lastRect.left;
          const dy = firstRect.top - lastRect.top;
          if (typeof flightChip.animate === 'function') {
            flightChip.animate(
              [
                { transform: `translate3d(${dx}px, ${dy}px, 0)` },
                { transform: 'translate3d(0, 0, 0)' },
              ],
              { duration, easing }
            );
          }
        } else if (expandOverlay) {
          // Newly revealed item in grid: cascade in smoothly from above
          const flightChip = prevData.clone;
          flightChip.className = realTab.className;
          flightChip.style.position = 'absolute';
          flightChip.style.left = `${lastRect.left - navRect.left}px`;
          flightChip.style.top = `${lastRect.top - navRect.top}px`;
          flightChip.style.width = `${lastRect.width}px`;
          flightChip.style.height = `${lastRect.height}px`;
          flightChip.style.margin = '0';
          flightChip.style.pointerEvents = 'none';
          flightChip.style.boxSizing = 'border-box';
          expandOverlay.appendChild(flightChip);

          if (typeof flightChip.animate === 'function') {
            flightChip.animate(
              [
                { opacity: 0, transform: 'translate3d(0, -8px, 0) scale(0.92)' },
                { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
              ],
              { duration: 240, easing }
            );
          }
        }
      }
    });

    flightTimeoutRef.current = setTimeout(() => {
      if (trackOverlay) trackOverlay.remove();
      if (fadeOverlay) fadeOverlay.remove();
      if (expandOverlay) expandOverlay.remove();
      setIsFlying(false);
      if (scrollRef.current) {
        scrollRef.current.classList.remove('is-animating');
      }
      navInnerRef.current?.classList.remove('is-animating');
      updateScrollOverflow();
    }, duration + 20);
  }, [isExpanded, activeCategoryId, updateScrollOverflow]);

  // Keep active category tab centered in view when activeCategoryId changes via external controls
  useEffect(() => {
    if (isExpanded) return;

    // If collapsing from expanded view, useLayoutEffect already positioned and centered the carousel
    if (isCollapsingRef.current) {
      isCollapsingRef.current = false;
      return;
    }

    const container = scrollRef.current;
    if (!container) return;

    const activeTab = container.querySelector(`[data-cat-id="${activeCategoryId}"]`) ||
                      container.querySelector('.ct-category-tab.active');
    if (!activeTab) return;

    const target = getCategoryTabTargetScroll(container, activeTab);
    if (Math.abs(container.scrollLeft - target) > 3) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ left: target, behavior: 'smooth' });
      } else {
        container.scrollLeft = target;
      }
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
      // Ignore clicks on disconnected elements (e.g. unmounted during render)
      if (e.target && !e.target.isConnected) return;

      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      if (path.includes(navRef.current)) return;

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
            className={`ct-category-scroll ${isExpanded ? 'is-expanded' : ''} ${maskClass} ${isFlying ? 'is-flying' : ''}`}
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
