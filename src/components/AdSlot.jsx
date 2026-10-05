import React, { useEffect, useRef } from 'react';

// Default Publisher ID from Google AdSense
const DEFAULT_CLIENT = 'ca-pub-2469761428575146';

/**
 * AdSlot Component
 * Google AdSense responsive ad container designed for zero Cumulative Layout Shift (CLS).
 * Automatically pushes to adsbygoogle on mount when a valid slotId is provided.
 *
 * @param {string} position Placement identifier ('mid-content', 'bottom', etc.)
 * @param {string} slotId Ad unit ID from Google AdSense (e.g. '1234567890')
 * @param {string} client AdSense Publisher ID (defaults to project account)
 * @param {string} format Ad format (defaults to 'auto')
 * @param {boolean} responsive Whether unit should be full-width responsive
 * @param {string} className Additional CSS classes
 */
export function AdSlot({
  position = 'mid-content',
  slotId = process.env.REACT_APP_ADSENSE_MID_SLOT || '',
  client = DEFAULT_CLIENT,
  format = 'auto',
  responsive = true,
  className = '',
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only attempt to request ad if we have a valid slotId and haven't pushed yet
    if (!slotId || pushedRef.current) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (e) {
      // In development, test environments, or when blocked by AdBlock, silently ignore
      console.debug('AdSense unit push skipped or blocked:', e);
    }
  }, [slotId]);

  // If no slotId configured yet, keep container hidden to maintain clean UI
  if (!slotId) {
    return (
      <div
        className={`ct-ad-slot ct-ad-${position} ct-ad-empty ${className}`}
        data-ad-slot={position}
        aria-hidden="true"
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <aside
      className={`ct-ad-slot ct-ad-${position} ct-ad-active ${className}`}
      data-ad-slot={position}
      aria-label="Advertisement"
    >
      <span className="ct-ad-label">Advertisement</span>
      <div className="ct-ad-wrapper" ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
}

export default AdSlot;
