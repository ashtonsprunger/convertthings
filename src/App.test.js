import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import {
  convertUnits,
  formatNumber,
  getFormulaString,
  getQuickReferenceTable,
} from './engine/conversions';
import { parseConversionQuery } from './engine/parser';

describe('ConvertThings Core Engine', () => {
  test('converts length units accurately', () => {
    // 1 meter = 3.2808398950131235 feet
    const ft = convertUnits(1, 'length', 'm', 'ft');
    expect(ft).toBeCloseTo(3.28084, 4);

    // 1 mile = 1.609344 km
    const km = convertUnits(1, 'length', 'mi', 'km');
    expect(km).toBeCloseTo(1.609344, 5);

    // 100 inches = 2.54 meters
    const m = convertUnits(100, 'length', 'in', 'm');
    expect(m).toBeCloseTo(2.54, 4);
  });

  test('converts temperature units accurately with offset formulas', () => {
    // 0 C = 32 F
    expect(convertUnits(0, 'temperature', 'c', 'f')).toBe(32);
    // 100 C = 212 F
    expect(convertUnits(100, 'temperature', 'c', 'f')).toBe(212);
    // -40 C = -40 F
    expect(convertUnits(-40, 'temperature', 'c', 'f')).toBe(-40);
    // 0 C = 273.15 K
    expect(convertUnits(0, 'temperature', 'c', 'k')).toBe(273.15);
    // 300 K to C
    expect(convertUnits(300, 'temperature', 'k', 'c')).toBeCloseTo(26.85, 2);
  });

  test('converts mass units accurately', () => {
    // 1 kg = ~2.20462 lb
    const lbs = convertUnits(1, 'mass', 'kg', 'lb');
    expect(lbs).toBeCloseTo(2.20462, 4);

    // 1 lb = 16 oz
    const oz = convertUnits(1, 'mass', 'lb', 'oz');
    expect(oz).toBeCloseTo(16, 4);
  });

  test('converts cooking units accurately', () => {
    // 1 US cup = 16 US tbsp
    const tbsp = convertUnits(1, 'cooking', 'cup_us', 'tbsp_us');
    expect(tbsp).toBeCloseTo(16, 2);

    // 1 tbsp = 3 tsp
    const tsp = convertUnits(1, 'cooking', 'tbsp_us', 'tsp_us');
    expect(tsp).toBeCloseTo(3, 2);
  });

  test('formats numbers cleanly without IEEE floating point noise', () => {
    // 0.1 + 0.2 = 0.30000000000000004 normally
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(1000)).toBe('1000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1.23456789, '2')).toBe('1.23');
  });

  test('generates formula strings', () => {
    expect(getFormulaString('temperature', 'c', 'f')).toBe('°F = (°C × 9/5) + 32');
    expect(getFormulaString('temperature', 'f', 'c')).toBe('°C = (°F − 32) × 5/9');
  });

  test('generates quick reference table', () => {
    const table = getQuickReferenceTable('length', 'm', 'ft');
    expect(table.length).toBeGreaterThan(0);
    expect(table[0].fromValue).toBe(1);
    expect(table[0].toValue).toBeDefined();
  });
});

describe('Natural Language Omnibox Parser', () => {
  test('parses queries with "to"', () => {
    const res = parseConversionQuery('100 km to miles');
    expect(res).not.toBeNull();
    expect(res.success).toBe(true);
    expect(res.categoryId).toBe('length');
    expect(res.fromUnit.id).toBe('km');
    expect(res.toUnit.id).toBe('mi');
    expect(res.value).toBe(100);
    expect(parseFloat(res.result)).toBeCloseTo(62.137, 2);
  });

  test('parses temperature expressions', () => {
    const res = parseConversionQuery('72 f in c');
    expect(res).not.toBeNull();
    expect(res.categoryId).toBe('temperature');
    expect(res.fromUnit.id).toBe('f');
    expect(res.toUnit.id).toBe('c');
    expect(parseFloat(res.result)).toBeCloseTo(22.22, 2);
  });

  test('parses queries without explicit number (defaults to 1)', () => {
    const res = parseConversionQuery('lbs to kg');
    expect(res).not.toBeNull();
    expect(res.value).toBe(1);
    expect(res.fromUnit.id).toBe('lb');
    expect(res.toUnit.id).toBe('kg');
  });
});

describe('ConvertThings UI Integration', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  test('renders header and main brand elements', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /ConvertThings/i })).toBeInTheDocument();
    expect(screen.getByText(/Fast, Accurate Unit Converter/i)).toBeInTheDocument();
  });

  test('renders category navigation and switches active category', () => {
    render(<App />);
    const massTab = screen.getByRole('tab', { name: /Weight & Mass/i });
    expect(massTab).toBeInTheDocument();

    fireEvent.click(massTab);
    expect(massTab).toHaveClass('active');
  });

  test('swaps units on swap button click', () => {
    render(<App />);
    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    expect(swapButton).toBeInTheDocument();

    // Initial default: 1 meter to feet = ~3.28084
    const toInputBefore = screen.getByLabelText(/Converted value in/i);
    expect(Number(toInputBefore.value)).toBeCloseTo(3.28084, 3);

    fireEvent.click(swapButton);

    // After swap: 1 foot to meters = 0.3048
    const toInputAfter = screen.getByLabelText(/Converted value in/i);
    expect(Number(toInputAfter.value)).toBeCloseTo(0.3048, 3);
  });

  test('updates converted value when input changes', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '10' } });
    expect(fromInput.value).toBe('10');

    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(Number(toInput.value)).toBeGreaterThan(0);
  });

  test('typing in omnibox and selecting instant match updates converter', () => {
    render(<App />);
    const omniboxInput = screen.getByLabelText(/Universal conversion search bar/i);
    expect(omniboxInput).toBeInTheDocument();

    fireEvent.change(omniboxInput, { target: { value: '72 f to c' } });

    const matchBtn = screen.getByRole('button', { name: /Apply parsed conversion/i });
    expect(matchBtn).toBeInTheDocument();

    fireEvent.click(matchBtn);

    // Temperature tab should now be active
    const tempTab = screen.getByRole('tab', { name: /Temperature/i });
    expect(tempTab).toHaveClass('active');

    // Converted value for 72 F should be approx 22.22 C
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(Number(toInput.value)).toBeCloseTo(22.22, 1);
  });

  test('toggles dark and light mode', () => {
    render(<App />);
    const themeBtn = screen.getByLabelText(/Toggle dark\/light mode/i);
    expect(themeBtn).toBeInTheDocument();

    fireEvent.click(themeBtn);
    const themeAttr = document.documentElement.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(themeAttr);
  });

  test('renders SEO articles, guides, and FAQ section', () => {
    render(<App />);
    expect(screen.getByText(/Understanding Length & Distance Conversions/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Frequently Asked Questions/i })).toBeInTheDocument();
  });

  test('displays instant color-highlighted live conversion statement', () => {
    render(<App />);
    const readout = screen.getByLabelText(/Current Conversion Statement/i);
    expect(readout).toBeInTheDocument();

    // Default 1 meter to feet
    expect(readout).toHaveTextContent(/1/);
    expect(readout).toHaveTextContent(/m/);
    expect(readout).toHaveTextContent(/ft/);
    expect(readout).toHaveTextContent(/equals/i);
  });
});

