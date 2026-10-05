import React, { useEffect } from 'react';
import { Icon } from './Icons';

export function Toast({ message, visible, onDismiss, duration = 2400 }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div className="ct-toast-container" role="status" aria-live="polite">
      <div className="ct-toast">
        <Icon name="Check" size={16} className="ct-toast-icon" />
        <span className="ct-toast-msg">{message}</span>
      </div>
    </div>
  );
}
