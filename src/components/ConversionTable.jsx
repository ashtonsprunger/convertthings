import React, { useState } from 'react';
import { Icon } from './Icons';
import { Fraction } from './Fraction';
import {
  getUnit,
  getUnitsForCategory,
  convertUnits,
  formatNumber,
  formatDisplayNumber,
  getQuickReferenceTable,
} from '../engine/conversions';

const HEIGHT_CHART_DATA = [
  { ftIn: "4' 10\"", ftInName: '4 ft 10 in', inches: 58, cm: '147.3 cm', m: '1.47 m' },
  { ftIn: "4' 11\"", ftInName: '4 ft 11 in', inches: 59, cm: '149.9 cm', m: '1.50 m' },
  { ftIn: "5' 0\"", ftInName: '5 ft 0 in', inches: 60, cm: '152.4 cm', m: '1.52 m' },
  { ftIn: "5' 1\"", ftInName: '5 ft 1 in', inches: 61, cm: '154.9 cm', m: '1.55 m' },
  { ftIn: "5' 2\"", ftInName: '5 ft 2 in', inches: 62, cm: '157.5 cm', m: '1.57 m' },
  { ftIn: "5' 3\"", ftInName: '5 ft 3 in', inches: 63, cm: '160.0 cm', m: '1.60 m' },
  { ftIn: "5' 4\"", ftInName: '5 ft 4 in', inches: 64, cm: '162.6 cm', m: '1.63 m' },
  { ftIn: "5' 5\"", ftInName: '5 ft 5 in', inches: 65, cm: '165.1 cm', m: '1.65 m' },
  { ftIn: "5' 6\"", ftInName: '5 ft 6 in', inches: 66, cm: '167.6 cm', m: '1.68 m' },
  { ftIn: "5' 7\"", ftInName: '5 ft 7 in', inches: 67, cm: '170.2 cm', m: '1.70 m' },
  { ftIn: "5' 8\"", ftInName: '5 ft 8 in', inches: 68, cm: '172.7 cm', m: '1.73 m' },
  { ftIn: "5' 9\"", ftInName: '5 ft 9 in', inches: 69, cm: '175.3 cm', m: '1.75 m' },
  { ftIn: "5' 10\"", ftInName: '5 ft 10 in', inches: 70, cm: '177.8 cm', m: '1.78 m' },
  { ftIn: "5' 11\"", ftInName: '5 ft 11 in', inches: 71, cm: '180.3 cm', m: '1.80 m' },
  { ftIn: "6' 0\"", ftInName: '6 ft 0 in', inches: 72, cm: '182.9 cm', m: '1.83 m' },
  { ftIn: "6' 1\"", ftInName: '6 ft 1 in', inches: 73, cm: '185.4 cm', m: '1.85 m' },
  { ftIn: "6' 2\"", ftInName: '6 ft 2 in', inches: 74, cm: '188.0 cm', m: '1.88 m' },
  { ftIn: "6' 3\"", ftInName: '6 ft 3 in', inches: 75, cm: '190.5 cm', m: '1.90 m' },
  { ftIn: "6' 4\"", ftInName: '6 ft 4 in', inches: 76, cm: '193.0 cm', m: '1.93 m' },
  { ftIn: "6' 5\"", ftInName: '6 ft 5 in', inches: 77, cm: '195.6 cm', m: '1.96 m' },
  { ftIn: "6' 6\"", ftInName: '6 ft 6 in', inches: 78, cm: '198.1 cm', m: '1.98 m' },
];

const TAPE_FRACTIONS_DATA = [
  { frac: '1/32″', dec: '0.03125″', mm: '0.7938 mm' },
  { frac: '1/16″', dec: '0.0625″', mm: '1.5875 mm' },
  { frac: '3/32″', dec: '0.09375″', mm: '2.3813 mm' },
  { frac: '1/8″', dec: '0.1250″', mm: '3.1750 mm' },
  { frac: '5/32″', dec: '0.15625″', mm: '3.9688 mm' },
  { frac: '3/16″', dec: '0.1875″', mm: '4.7625 mm' },
  { frac: '7/32″', dec: '0.21875″', mm: '5.5563 mm' },
  { frac: '1/4″', dec: '0.2500″', mm: '6.3500 mm' },
  { frac: '5/16″', dec: '0.3125″', mm: '7.9375 mm' },
  { frac: '3/8″', dec: '0.3750″', mm: '9.5250 mm' },
  { frac: '7/16″', dec: '0.4375″', mm: '11.1125 mm' },
  { frac: '1/2″', dec: '0.5000″', mm: '12.7000 mm' },
  { frac: '9/16″', dec: '0.5625″', mm: '14.2875 mm' },
  { frac: '5/8″', dec: '0.6250″', mm: '15.8750 mm' },
  { frac: '11/16″', dec: '0.6875″', mm: '17.4625 mm' },
  { frac: '3/4″', dec: '0.7500″', mm: '19.0500 mm' },
  { frac: '13/16″', dec: '0.8125″', mm: '20.6375 mm' },
  { frac: '7/8″', dec: '0.8750″', mm: '22.2250 mm' },
  { frac: '15/16″', dec: '0.9375″', mm: '23.8125 mm' },
  { frac: '1″', dec: '1.0000″', mm: '25.4000 mm' },
  { frac: '1 1/4″', dec: '1.2500″', mm: '31.7500 mm' },
  { frac: '1 1/2″', dec: '1.5000″', mm: '38.1000 mm' },
  { frac: '1 3/4″', dec: '1.7500″', mm: '44.4500 mm' },
  { frac: '2″', dec: '2.0000″', mm: '50.8000 mm' },
  { frac: '3″', dec: '3.0000″', mm: '76.2000 mm' },
  { frac: '4″', dec: '4.0000″', mm: '101.6000 mm' },
  { frac: '6″', dec: '6.0000″', mm: '152.4000 mm' },
  { frac: '8″', dec: '8.0000″', mm: '203.2000 mm' },
  { frac: '10″', dec: '10.0000″', mm: '254.0000 mm' },
  { frac: '12″ (1 ft)', dec: '12.0000″', mm: '304.8000 mm' },
];

const BAKING_FRACTIONS_DATA = [
  { cup: '1/8 cup', spoons: '2 tbsp', tsp: '6 tsp', flOz: '1 fl oz', ml: '29.6 mL' },
  { cup: '1/4 cup', spoons: '4 tbsp', tsp: '12 tsp', flOz: '2 fl oz', ml: '59.1 mL' },
  { cup: '1/3 cup', spoons: '5 tbsp + 1 tsp', tsp: '16 tsp', flOz: '2.67 fl oz', ml: '78.9 mL' },
  { cup: '3/8 cup', spoons: '6 tbsp', tsp: '18 tsp', flOz: '3 fl oz', ml: '88.7 mL' },
  { cup: '1/2 cup', spoons: '8 tbsp', tsp: '24 tsp', flOz: '4 fl oz', ml: '118.3 mL' },
  { cup: '2/3 cup', spoons: '10 tbsp + 2 tsp', tsp: '32 tsp', flOz: '5.33 fl oz', ml: '157.7 mL' },
  { cup: '3/4 cup', spoons: '12 tbsp', tsp: '36 tsp', flOz: '6 fl oz', ml: '177.4 mL' },
  { cup: '1 cup', spoons: '16 tbsp', tsp: '48 tsp', flOz: '8 fl oz', ml: '236.6 mL' },
  { cup: '1 1/4 cup', spoons: '20 tbsp', tsp: '60 tsp', flOz: '10 fl oz', ml: '295.7 mL' },
  { cup: '1 1/2 cup', spoons: '24 tbsp', tsp: '72 tsp', flOz: '12 fl oz', ml: '354.9 mL' },
  { cup: '2 cups (1 pt)', spoons: '32 tbsp', tsp: '96 tsp', flOz: '16 fl oz', ml: '473.2 mL' },
];

export function ConversionTable({ categoryId, fromUnitId, toUnitId, fromValue, hubId = null, onSelectTargetUnit }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'all'
  const [showSpecializedInTable, setShowSpecializedInTable] = useState(false);
  const fromUnit = getUnit(categoryId, fromUnitId);
  const toUnit = getUnit(categoryId, toUnitId);
  const units = getUnitsForCategory(categoryId);

  if (!fromUnit || !toUnit) return null;

  const quickTable = getQuickReferenceTable(categoryId, fromUnit.id, toUnit.id);
  const numericVal = parseFloat(fromValue) || 1;

  const hasSpecializedUnits = units.some((u) => u.tier === 'specialized');
  const commonUnitsCount = units.filter((u) => u.tier !== 'specialized').length;

  // Compute breakdown for all other units in category
  const allUnitsBreakdown = units.map((u) => {
    const converted = convertUnits(numericVal, categoryId, fromUnit.id, u.id);
    return {
      unit: u,
      value: converted !== null ? formatNumber(converted) : '-',
    };
  });

  const displayedBreakdown = showSpecializedInTable || !hasSpecializedUnits
    ? allUnitsBreakdown
    : allUnitsBreakdown.filter(
        (item) => item.unit.tier !== 'specialized' || item.unit.id === toUnit.id || item.unit.id === fromUnit.id
      );

  // Customized Titles & Badges for Hub Routes
  let chartTitle = 'Reference & Equivalence';
  let chartSubtitle = `Quick conversion benchmarks and all-unit breakdown for ${fromUnit.plural || fromUnit.name}`;
  let tabBadge = `${fromUnit.symbol} ⇄ ${toUnit.symbol}`;

  if (hubId === 'feet-inches-to-cm') {
    chartTitle = 'Human Height Conversion Chart';
    chartSubtitle = "Standard human heights from 4' 10\" to 6' 6\" with exact centimeters and meters";
    tabBadge = "4' 10\" – 6' 6\"";
  } else if (hubId === 'fraction-inches-to-mm') {
    chartTitle = 'Tape Measure Fractions to Millimeters';
    chartSubtitle = 'Carpenter fractions from 1/32″ to 12″ with exact metric millimeter equivalents';
    tabBadge = '1/32″ – 12″';
  } else if (hubId === 'baking-fractions') {
    chartTitle = 'Baking & Kitchen Drawer Equivalents';
    chartSubtitle = 'Standard cup fractions broken down into measuring spoons and metric volume';
    tabBadge = '1/8 – 2 cups';
  }

  return (
    <section className={`ct-table-card ct-cat-${categoryId}`} aria-label="Reference Charts">
      <div className="ct-table-card-header ct-table-header">
        <div className="ct-card-header-left ct-table-header-left">
          <div className="ct-card-header-badge ct-table-header-badge" aria-hidden="true">
            <Icon name="Table" size={20} />
          </div>
          <div className="ct-card-title-group ct-table-title-group">
            <h3 className="ct-card-heading ct-table-heading">{chartTitle}</h3>
            <p className="ct-card-subtitle ct-table-subtitle">{chartSubtitle}</p>
          </div>
        </div>

        <div className="ct-table-tabs" role="tablist" aria-label="Reference view mode">
          <button
            type="button"
            role="tab"
            id="tab-chart"
            aria-controls="panel-chart"
            aria-selected={activeTab === 'chart'}
            aria-label={`${chartTitle} Reference Table`}
            className={`ct-table-tab ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            <span className="ct-table-tab-text">Reference Table</span>
            <span className="ct-tab-pill-badge">{tabBadge}</span>
          </button>
          <button
            type="button"
            role="tab"
            id="tab-all"
            aria-controls="panel-all"
            aria-selected={activeTab === 'all'}
            aria-label={`All ${fromUnit.name} Conversions (${formatDisplayNumber(numericVal)} ${fromUnit.symbol})`}
            className={`ct-table-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="ct-table-tab-text">All Units</span>
            <span className="ct-tab-pill-badge">{units.length}</span>
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
            {hubId === 'feet-inches-to-cm' ? (
              <table className="ct-data-table">
                <thead>
                  <tr>
                    <th scope="col" className="ct-th-from">
                      <span className="ct-col-pill ct-col-from">Height (Ft & In)</span>
                    </th>
                    <th scope="col" className="ct-th-to">
                      <span className="ct-col-pill ct-col-to">Centimeters (cm)</span>
                    </th>
                    <th scope="col">
                      <span className="ct-col-pill ct-col-neutral">Meters (m)</span>
                    </th>
                    <th scope="col">
                      <span className="ct-col-pill ct-col-neutral">Total Inches</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HEIGHT_CHART_DATA.map((row) => (
                    <tr key={row.inches}>
                      <td className="ct-td-from">
                        <span className="ct-cell-val">
                          <strong>{row.ftIn}</strong>
                          <span className="ct-cell-unit">({row.ftInName})</span>
                        </span>
                      </td>
                      <td className="ct-td-to">
                        <span className="ct-cell-val">
                          <strong>{row.cm}</strong>
                        </span>
                      </td>
                      <td>
                        <span className="ct-cell-val">
                          <span>{row.m}</span>
                        </span>
                      </td>
                      <td>
                        <span className="ct-cell-val">
                          <span>{row.inches} in</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : hubId === 'fraction-inches-to-mm' ? (
              <table className="ct-data-table">
                <thead>
                  <tr>
                    <th scope="col" className="ct-th-from">
                      <span className="ct-col-pill ct-col-from">Fraction (in)</span>
                    </th>
                    <th scope="col">
                      <span className="ct-col-pill ct-col-neutral">Decimal (in)</span>
                    </th>
                    <th scope="col" className="ct-th-to">
                      <span className="ct-col-pill ct-col-to">Millimeters (mm)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TAPE_FRACTIONS_DATA.map((row) => (
                    <tr key={row.frac}>
                      <td className="ct-td-from">
                        <span className="ct-cell-val">
                          <strong><Fraction value={row.frac} /></strong>
                        </span>
                      </td>
                      <td>
                        <span className="ct-cell-val">
                          <span>{row.dec}</span>
                        </span>
                      </td>
                      <td className="ct-td-to">
                        <span className="ct-cell-val">
                          <strong>{row.mm}</strong>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : hubId === 'baking-fractions' ? (
              <table className="ct-data-table">
                <thead>
                  <tr>
                    <th scope="col" className="ct-th-from">
                      <span className="ct-col-pill ct-col-from">Cup Fraction</span>
                    </th>
                    <th scope="col" className="ct-th-to">
                      <span className="ct-col-pill ct-col-to">Measuring Spoons</span>
                    </th>
                    <th scope="col">
                      <span className="ct-col-pill ct-col-neutral">Teaspoons</span>
                    </th>
                    <th scope="col">
                      <span className="ct-col-pill ct-col-neutral">Metric Volume</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BAKING_FRACTIONS_DATA.map((row) => (
                    <tr key={row.cup}>
                      <td className="ct-td-from">
                        <span className="ct-cell-val">
                          <strong><Fraction value={row.cup} /></strong>
                        </span>
                      </td>
                      <td className="ct-td-to">
                        <span className="ct-cell-val">
                          <strong>{row.spoons}</strong>
                        </span>
                      </td>
                      <td>
                        <span className="ct-cell-val">
                          <span>{row.tsp}</span>
                        </span>
                      </td>
                      <td>
                        <span className="ct-cell-val">
                          <span>{row.ml} ({row.flOz})</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
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
                          <span className="ct-cell-val">
                            <strong><Fraction value={formatDisplayNumber(row.fromValue)} /></strong>
                            <span className="ct-cell-unit">{fromUnit.symbol}</span>
                          </span>
                          {isCurrent && (
                            <span className="ct-current-badge">Current</span>
                          )}
                        </td>
                        <td className="ct-td-to">
                          <span className="ct-cell-val">
                            <strong><Fraction value={formatDisplayNumber(row.toValue)} /></strong>
                            <span className="ct-cell-unit">{toUnit.symbol}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div
          role="tabpanel"
          id="panel-all"
          aria-labelledby="tab-all"
          className="ct-tab-panel"
          style={{ display: activeTab === 'all' ? 'block' : 'none' }}
        >
          {hasSpecializedUnits && (
            <div className="ct-table-filter-bar">
              <span className="ct-table-filter-label">Filter:</span>
              <button
                type="button"
                className={`ct-table-filter-pill ${!showSpecializedInTable ? 'active' : ''}`}
                onClick={() => setShowSpecializedInTable(false)}
              >
                Common Units ({commonUnitsCount})
              </button>
              <button
                type="button"
                className={`ct-table-filter-pill ${showSpecializedInTable ? 'active' : ''}`}
                onClick={() => setShowSpecializedInTable(true)}
              >
                All Units ({units.length})
              </button>
            </div>
          )}

          <div className="ct-all-units-grid">
            {displayedBreakdown.map((item) => {
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
                    <div className="ct-stat-title-col">
                      <span className="ct-stat-name">{item.unit.plural || item.unit.name}</span>
                      {item.unit.subtitle && (
                        <span className="ct-stat-subtitle">{item.unit.subtitle}</span>
                      )}
                    </div>
                    <div className="ct-stat-tags">
                      {isSource ? (
                        <span className="ct-stat-badge ct-badge-base">Base</span>
                      ) : isSelected ? (
                        <span className="ct-stat-badge ct-badge-selected">Selected</span>
                      ) : item.unit.badge ? (
                        <span className="ct-stat-badge ct-badge-meta">{item.unit.badge}</span>
                      ) : (
                        <span className="ct-stat-arrow" aria-hidden="true">→</span>
                      )}
                    </div>
                  </div>
                  <div className="ct-stat-value-wrap">
                    <span className="ct-stat-value">
                      <Fraction value={formatDisplayNumber(item.value)} />
                    </span>
                    <span className="ct-stat-unit-tag">{item.unit.symbol}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
