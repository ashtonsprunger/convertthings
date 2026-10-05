import React, { useState } from 'react';
import {
  getUnit,
  getUnitsForCategory,
  convertUnits,
  formatNumber,
  getQuickReferenceTable,
} from '../engine/conversions';

export function ConversionTable({ categoryId, fromUnitId, toUnitId, fromValue }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'all'
  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);
  const units = getUnitsForCategory(categoryId);

  if (!fromUnit || !toUnit) return null;

  const quickTable = getQuickReferenceTable(categoryId, fromUnit.id, toUnit.id);
  const numericVal = parseFloat(fromValue) || 1;

  // Compute breakdown for all other units in category
  const allUnitsBreakdown = units.map((u) => {
    const converted = convertUnits(numericVal, categoryId, fromUnit.id, u.id);
    return {
      unit: u,
      value: converted !== null ? formatNumber(converted) : '-',
    };
  });

  return (
    <section className="ct-table-card" aria-label="Reference Charts">
      <div className="ct-table-header">
        <div className="ct-table-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chart'}
            className={`ct-table-tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            {fromUnit.symbol} to {toUnit.symbol} Reference Table
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`ct-table-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All {fromUnit.name} Conversions ({numericVal} {fromUnit.symbol})
          </button>
        </div>
      </div>

      <div className="ct-table-content">
        {activeTab === 'chart' ? (
          <div className="ct-table-responsive">
            <table className="ct-data-table">
              <thead>
                <tr>
                  <th scope="col">{fromUnit.plural || fromUnit.name} ({fromUnit.symbol})</th>
                  <th scope="col">{toUnit.plural || toUnit.name} ({toUnit.symbol})</th>
                </tr>
              </thead>
              <tbody>
                {quickTable.map((row) => (
                  <tr key={row.fromValue}>
                    <td><strong>{row.fromValue}</strong> {fromUnit.symbol}</td>
                    <td>{row.toValue} {toUnit.symbol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ct-all-units-grid">
            {allUnitsBreakdown.map((item) => (
              <div
                key={item.unit.id}
                className={`ct-unit-stat-card ${item.unit.id === fromUnit.id ? 'active' : ''}`}
              >
                <div className="ct-stat-header">
                  <span className="ct-stat-name">{item.unit.plural || item.unit.name}</span>
                  <span className="ct-stat-symbol">{item.unit.symbol}</span>
                </div>
                <div className="ct-stat-value">{item.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
