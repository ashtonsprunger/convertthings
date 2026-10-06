import React from 'react';
import { Icon } from './Icons';
import { getUnit } from '../engine/conversions';

export function FavoritesBar({
  favorites,
  activeCategoryId,
  activeFromUnitId,
  activeToUnitId,
  onSelectFavorite,
  onRemoveFavorite,
}) {
  if (!favorites || favorites.length === 0) return null;

  return (
    <div className="ct-favorites-bar" aria-label="Favorite Conversions">
      <div className="ct-favorites-label">
        <Icon name="Star" size={13} fill="currentColor" />
        <span>Favorites</span>
      </div>
      <div className="ct-favorites-list">
        {favorites.map((fav) => {
          const fromUnit = getUnit(fav.categoryId, fav.fromUnitId);
          const toUnit = getUnit(fav.categoryId, fav.toUnitId);
          if (!fromUnit || !toUnit) return null;

          const isExact =
            fav.categoryId === activeCategoryId &&
            fav.fromUnitId === activeFromUnitId &&
            fav.toUnitId === activeToUnitId;
          const isSwapped =
            fav.categoryId === activeCategoryId &&
            fav.fromUnitId === activeToUnitId &&
            fav.toUnitId === activeFromUnitId;
          const isActive = isExact || isSwapped;

          return (
            <div
              key={`${fav.categoryId}-${fav.fromUnitId}-${fav.toUnitId}`}
              className={`ct-favorite-pill ${isActive ? 'active' : ''}`}
            >
              <button
                type="button"
                className="ct-fav-select-btn"
                onClick={() => onSelectFavorite(fav)}
                title={`Convert ${fromUnit.name} to ${toUnit.name}${isActive ? ' (currently active)' : ''}`}
                aria-pressed={isActive}
              >
                <span>{fromUnit.symbol}</span>
                <span className="ct-fav-arrow">⇄</span>
                <span>{toUnit.symbol}</span>
              </button>
              <button
                type="button"
                className="ct-fav-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(fav);
                }}
                title="Remove favorite"
                aria-label={`Remove favorite ${fromUnit.symbol} to ${toUnit.symbol}`}
              >
                <Icon name="X" size={10} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
