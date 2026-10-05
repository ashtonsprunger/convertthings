import React from 'react';

/**
 * AdSlot Component
 * Prepared placeholder container for future ad monetization (Google AdSense, Mediavine, etc.)
 * Configured with reserved layout space to avoid Cumulative Layout Shift (CLS).
 */
export function AdSlot({ position = 'banner', className = '' }) {
  // Monitization disabled by default as per project requirements
  // Ready to inject ad script / unit when monetization is enabled.
  return (
    <div
      className={`ct-ad-slot ct-ad-${position} ${className}`}
      data-ad-slot={position}
      aria-hidden="true"
    >
      {/* Reserved ad container space to prevent layout shifts */}
    </div>
  );
}
