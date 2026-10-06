import React, { useState } from 'react';
import {
  getUnit,
  getUnitsForCategory,
  convertUnits,
  formatNumber,
  formatDisplayNumber,
  getQuickReferenceTable,
} from '../engine/conversions';

export function ConversionTable({ categoryId, fromUnitId, toUnitId, fromValue, onSelectTargetUnit }) {
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
            id="tab-chart"
            aria-controls="panel-chart"
            aria-selected={activeTab === 'chart'}
            className={`ct-table-tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            {fromUnit.symbol} to {toUnit.symbol} Reference Table
          </button>
          <button
            type="button"
            role="tab"
            id="tab-all"
            aria-controls="panel-all"
            aria-selected={activeTab === 'all'}
            className={`ct-table-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All {fromUnit.name} Conversions ({formatDisplayNumber(numericVal)} {fromUnit.symbol})
          </button>
        </div>
      </div>

      <div className="ct-table-content">
        <div
          role="tabpanel"
          id="panel-chart"
          aria-labelledby="tab-chart"
          className="ct-tab-panel"
          style={{ display: activeTab === 'chart' ? 'block' : 'none' }}
        >
          <div className="ct-table-responsive">
            <table className="ct-data-table">
              <thead>
                <tr>
                  <th scope="col" className="ct-th-from">
                    <span className="ct-col-pill ct-col-from">
                      {fromUnit.plural || fromUnit.name} ({fromUnit.symbol})
                    </span>
                  </th>
                  <th scope="col" className="ct-th-to">
                    <span className="ct-col-pill ct-col-to">
                      {toUnit.plural || toUnit.name} ({toUnit.symbol})
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {quickTable.map((row) => {
                  const isCurrent = row.fromValue === numericVal;
                  return (
                    <tr key={row.fromValue} className={isCurrent ? 'ct-row-current' : ''}>
                      <td className="ct-td-from">
                        <strong>{formatDisplayNumber(row.fromValue)}</strong> <span className="ct-cell-unit">{fromUnit.symbol}</span>
                      </td>
                      <td className="ct-td-to">
                        <strong>{formatDisplayNumber(row.toValue)}</strong> <span className="ct-cell-unit">{toUnit.symbol}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div
          role="tabpanel"
          id="panel-all"
          aria-labelledby="tab-all"
          className="ct-tab-panel"
          style={{ display: activeTab === 'all' ? 'block' : 'none' }}
        >
          <div className="ct-all-units-grid">
            {allUnitsBreakdown.map((item) => {
              const isSelected = item.unit.id === toUnit.id;
              const isSource = item.unit.id === fromUnit.id;
              const unitHref = `/convert/${fromUnit.id}-to-${item.unit.id}`;

              return (
                <a
                  key={item.unit.id}
                  href={unitHref}
                  className={`ct-unit-stat-card ${isSelected ? 'active' : ''} ${isSource ? 'source-unit' : ''}`}
                  onClick={(e) => {
                    if (isSource) {
                      e.preventDefault();
                      return;
                    }
                    if (onSelectTargetUnit) {
                      e.preventDefault();
                      onSelectTargetUnit(item.unit.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  title={
                    isSource
                      ? `Base unit: ${fromUnit.name}`
                      : `Convert ${fromUnit.plural || fromUnit.name} to ${item.unit.plural || item.unit.name}`
                  }
                >
                  <div className="ct-stat-header">
                    <span className="ct-stat-name">{item.unit.plural || item.unit.name}</span>
                    <span className="ct-stat-symbol">{item.unit.symbol}</span>
                  </div>
                  <div className="ct-stat-value">{formatDisplayNumber(item.value)}</div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
