import { render, screen, fireEvent, act, within } from '@testing-library/react';
import App from './App';
import { isDesktopDevice } from './components/ConversionCard';
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

  test('strictly rejects incompatible cross-category conversions', () => {
    expect(parseConversionQuery('1 feet to se')).toBeNull();
    expect(parseConversionQuery('1 feet to sec')).toBeNull();
    expect(parseConversionQuery('1 feet to seconds')).toBeNull();
    expect(parseConversionQuery('100 km to kg')).toBeNull();
    expect(parseConversionQuery('100 km kg')).toBeNull();
    expect(parseConversionQuery('50 mph to celsius')).toBeNull();
    expect(parseConversionQuery('100 gb to psi')).toBeNull();
  });

  test('prevents premature prefix matching on short single-letter or invalid 2-letter tokens', () => {
    expect(parseConversionQuery('100 z')).toBeNull();
    expect(parseConversionQuery('100 p')).toBeNull();
    expect(parseConversionQuery('100 e')).toBeNull();
    expect(parseConversionQuery('100 u')).toBeNull();
    expect(parseConversionQuery('100 a')?.fromUnit.id).toBe('a');
  });

  test('correctly converts valid single and multi-token queries', () => {
    const resM = parseConversionQuery('1 feet to m');
    expect(resM).not.toBeNull();
    expect(resM.fromUnit.id).toBe('ft');
    expect(resM.toUnit.id).toBe('m');
    expect(parseFloat(resM.result)).toBeCloseTo(0.3048, 4);

    const resIn = parseConversionQuery('1 feet to in');
    expect(resIn).not.toBeNull();
    expect(resIn.toUnit.id).toBe('in');
    expect(parseFloat(resIn.result)).toBeCloseTo(12, 5);
    expect(resIn.formattedResult).toBe('12');

    const resTemp = parseConversionQuery('100 c to f');
    expect(resTemp).not.toBeNull();
    expect(resTemp.result).toBe(212);

    const resCook = parseConversionQuery('2 c to tbsp');
    expect(resCook).not.toBeNull();
    expect(resCook.fromUnit.id).toBe('cup_us');
    expect(resCook.toUnit.id).toBe('tbsp_us');
    expect(parseFloat(resCook.result)).toBeCloseTo(32, 5);
    expect(resCook.formattedResult).toBe('32');
  });

  test('parses natural language "convert" and "how many" queries', () => {
    const resHowMany = parseConversionQuery('how many miles in 100 km');
    expect(resHowMany).not.toBeNull();
    expect(resHowMany.fromUnit.id).toBe('km');
    expect(resHowMany.toUnit.id).toBe('mi');
    expect(parseFloat(resHowMany.result)).toBeCloseTo(62.137, 2);

    const resFeetInMeter = parseConversionQuery('how many feet in a meter');
    expect(resFeetInMeter).not.toBeNull();
    expect(resFeetInMeter.fromUnit.id).toBe('m');
    expect(resFeetInMeter.toUnit.id).toBe('ft');
    expect(parseFloat(resFeetInMeter.result)).toBeCloseTo(3.2808, 3);

    const resConvert = parseConversionQuery('convert 100 km to miles');
    expect(resConvert).not.toBeNull();
    expect(resConvert.fromUnit.id).toBe('km');
    expect(resConvert.toUnit.id).toBe('mi');
  });

  test('parses natural language queries with thousands commas in numbers', () => {
    const res1 = parseConversionQuery('1,000 km to miles');
    expect(res1).not.toBeNull();
    expect(res1.value).toBe(1000);
    expect(res1.fromUnit.id).toBe('km');
    expect(res1.toUnit.id).toBe('mi');
    expect(parseFloat(res1.result)).toBeCloseTo(621.371, 2);

    const res2 = parseConversionQuery('how many miles in 10,000 km');
    expect(res2).not.toBeNull();
    expect(res2.value).toBe(10000);
    expect(parseFloat(res2.result)).toBeCloseTo(6213.71, 1);

    const res3 = parseConversionQuery('1,000,000 bytes to megabytes');
    expect(res3).not.toBeNull();
    expect(res3.value).toBe(1000000);
    expect(res3.fromUnit.id).toBe('byte');
    expect(res3.toUnit.id).toBe('mb');
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

  test('swaps units and inverts equation values on swap button click', () => {
    render(<App />);
    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    expect(swapButton).toBeInTheDocument();

    // Initial default: 1 meter to feet = ~3.28084
    const fromInputBefore = screen.getByLabelText(/Enter value in/i);
    const toInputBefore = screen.getByLabelText(/Converted value in/i);
    expect(fromInputBefore.value).toBe('1');
    expect(Number(toInputBefore.value)).toBeCloseTo(3.28084, 3);

    fireEvent.click(swapButton);

    // After swap: ~3.28084 feet to meters = 1 meter
    const fromInputAfter = screen.getByLabelText(/Enter value in/i);
    const toInputAfter = screen.getByLabelText(/Converted value in/i);
    expect(Number(fromInputAfter.value)).toBeCloseTo(3.28084, 3);
    expect(Number(toInputAfter.value)).toBeCloseTo(1, 3);
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

  test('displays conversion equations card, formula reference strip, and linked result number copy button', async () => {
    render(<App />);
    const equationCard = screen.getByLabelText(/Conversion equations/i);
    expect(equationCard).toBeInTheDocument();

    // Default 1 meter to feet (approximation)
    expect(equationCard).toHaveTextContent(/1 m (≈|=)/i);
    expect(equationCard).toHaveTextContent(/Multiply the meter value/i);

    // Linked result number copy button inside hero equation
    const copyNumBtn = screen.getByRole('button', { name: /Copy result number/i });
    expect(copyNumBtn).toBeInTheDocument();
    expect(copyNumBtn).toHaveAttribute('title');

    // Click result number copy button
    await act(async () => {
      fireEvent.click(copyNumBtn);
    });
    expect(copyNumBtn).toHaveClass('copied');

    // Formula educational reference section inside card
    const formulaSection = screen.getByLabelText(/Conversion formula details/i);
    expect(formulaSection).toBeInTheDocument();
    expect(formulaSection).toHaveTextContent(/ft = m/i);
    expect(formulaSection).toHaveTextContent(/Multiply the meter value by 3.2808/i);
  });

  test('formats large numbers with commas in equation readouts while keeping input fields numeric', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '1000000' } });

    // The input value remains the raw unformatted string '1000000' so HTML type="number" stays valid
    expect(fromInput.value).toBe('1000000');

    // But the equation hero readout is formatted with commas
    const equationCard = screen.getByLabelText(/Conversion equations/i);
    expect(equationCard).toHaveTextContent(/1,000,000 m/i);

    // Converted feet value (~3,280,839.9) has commas in the display readout
    expect(equationCard).toHaveTextContent(/3,280,839/i);
  });

  test('preserves user input in second field when changing precision (bidirectional source of truth)', () => {
    window.history.replaceState({}, '', '/convert/feet-to-inches');
    render(<App />);

    const precisionSelect = screen.getByLabelText(/Decimal Precision/i);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    const toInput = screen.getByLabelText(/Converted value in/i);

    // 1. Set to 2 decimals
    fireEvent.change(precisionSelect, { target: { value: '2' } });

    // 2. Type 407 into second input (inches)
    fireEvent.change(toInput, { target: { value: '407' } });

    // 407 in = 33.91666... ft, rounded to 2 decimals is 33.92
    expect(toInput.value).toBe('407');
    expect(fromInput.value).toBe('33.92');

    // 3. Switch precision to auto decimals
    fireEvent.change(precisionSelect, { target: { value: 'auto' } });

    // The user-typed value 407 MUST remain 407 (NOT corrupted to 407.04!)
    expect(toInput.value).toBe('407');
    // The calculated fromInput should update with smart auto precision
    expect(Number(fromInput.value)).toBeCloseTo(33.9167, 3);
  });

  test('switches precision modes to mixed fractions, improper fractions, and exact full precision', () => {
    render(<App />);
    const precisionSelect = screen.getByLabelText(/Decimal Precision/i);
    const toInput = screen.getByLabelText(/Converted value in/i);

    // Switch to mixed fractions (1 m = 3.28084 ft -> 3 9/32 ft)
    fireEvent.change(precisionSelect, { target: { value: 'fraction' } });
    expect(toInput.value).toBe('3 9/32');

    // Switch to improper fractions (1 m = 3.28084 ft -> 105/32 ft)
    fireEvent.change(precisionSelect, { target: { value: 'fraction_improper' } });
    expect(toInput.value).toBe('105/32');

    // Switch to exact full precision
    fireEvent.change(precisionSelect, { target: { value: 'exact' } });
    expect(toInput.value).toContain('3.280839895');

    // Switch back to auto
    fireEvent.change(precisionSelect, { target: { value: 'auto' } });
    expect(toInput.value).toBe('3.2808');
  });

  test('renders footer legal links and opens legal modal', () => {
    render(<App />);
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy.html');

    // Click Privacy Policy link
    fireEvent.click(privacyLink);

    // Modal dialog should be in document
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Google AdSense/i).length).toBeGreaterThan(0);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('mounts with clean unit pair route e.g. /convert/celsius-to-fahrenheit', () => {
    window.history.replaceState({}, '', '/convert/celsius-to-fahrenheit');
    render(<App />);

    const tempTab = screen.getByRole('tab', { name: /Temperature/i });
    expect(tempTab).toHaveClass('active');

    // Converted value for 1 C should be 33.8 F
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput.value).toBe('33.8');
  });

  test('mounts with specific calculation route e.g. /convert/100-km-to-miles', () => {
    window.history.replaceState({}, '', '/convert/100-km-to-miles');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('100');

    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(parseFloat(toInput.value)).toBeCloseTo(62.137, 2);
  });

  test('automatically displays practical drawer tools and equivalents in Kitchen Mode on category page', () => {
    window.history.replaceState({}, '', '/cooking');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '1' } });
    expect(fromInput.value).toBe('1');

    // The kitchen drawer shelf renders measuring tools needed
    const drawerCard = screen.getByLabelText(/Kitchen Measuring Drawer/i);
    expect(drawerCard).toBeInTheDocument();
    expect(drawerCard).toHaveTextContent(/1 cup/i);

    // And standard equivalents
    expect(drawerCard).toHaveTextContent(/Cups/i);
    expect(drawerCard).toHaveTextContent(/Tablespoons/i);
    expect(drawerCard).toHaveTextContent(/Teaspoons/i);
  });

  test('navigates to culinary pair URL (e.g. cups to butter)', () => {
    window.history.replaceState({}, '', '/convert/cup_us-to-stick_butter');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');

    // Standard converter input is visible and displays 2 sticks of butter!
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput.value).toBe('2');
  });

  test('converts 34 mL in Kitchen Mode as real spoons (2 tbsp + 1 tsp) and never 5/32', () => {
    window.history.replaceState({}, '', '/convert/34-ml-to-cup_us?kitchen=1');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('34');

    const kitchenOutput = screen.getByLabelText(/Kitchen measuring tools:.*2 tbsp \+ 1 tsp/i);
    expect(kitchenOutput).toHaveTextContent('2 tbsp + 1 tsp');
    expect(kitchenOutput).not.toHaveTextContent('5/32');

    const drawerCard = screen.getByLabelText(/Kitchen Measuring Drawer/i);
    expect(drawerCard).toHaveTextContent('2 tbsp');
    expect(drawerCard).toHaveTextContent('1 tsp');
    expect(drawerCard).toHaveTextContent(/34 mL/i);
  });

  test('displays smart human-friendly readouts directly in the equation button with subtext in auto mode', () => {
    // 1. Length (inches): 1 mm to in -> clean decimal 0.03937 in input, smart 1/32 in in green button with (≈ 0.03937 in)
    window.history.replaceState({}, '', '/convert/1-mm-to-in');
    const { unmount } = render(<App />);

    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput.value).toBe('0.03937');

    const copyBtn = screen.getByLabelText(/Copy result number 1\/32/i);
    expect(copyBtn).toBeInTheDocument();
    expect(copyBtn).toHaveTextContent('1/32 in');

    // Decimal equivalent is cleanly surfaced in tooltip and aria-label rather than cluttering display text
    expect(copyBtn).toHaveAttribute('title', expect.stringContaining('≈ 0.03937 in'));

    // Switch precision dropdown to Tape Measure mode
    const precisionSelect = screen.getByLabelText(/Decimal Precision and Formatting/i);
    fireEvent.change(precisionSelect, { target: { value: 'fraction_tape' } });

    // Now input also updates to tape fraction
    expect(toInput.value).toBe('1/32');

    unmount();
    window.localStorage.clear();

    // 2. Time: 5000 s to min -> Clock duration 1h 23m 20s in green button with subtext
    window.history.replaceState({}, '', '/convert/5000-s-to-min');
    render(<App />);

    const timeCopyBtn = screen.getByLabelText(/Copy result number 1h 23m 20s/i);
    expect(timeCopyBtn).toBeInTheDocument();
    expect(timeCopyBtn).toHaveAttribute('title', expect.stringContaining('≈ 83.3333 min'));
  });

  test('respects stored decimal precision on initial mount and page reload', () => {
    window.localStorage.setItem('ct-precision', JSON.stringify('2'));
    render(<App />);

    const toInput = screen.getByLabelText(/Converted value in/i);
    // 1 meter to feet formatted with 2 decimal precision should be '3.28'
    expect(toInput.value).toBe('3.28');
  });

  test('focusing or initial click selects input text, while clicking when active allows placing cursor', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    const selectSpy = jest.spyOn(fromInput, 'select');

    // 1. Initial focus (e.g. keyboard Tab) selects text
    fromInput.focus();
    expect(selectSpy).toHaveBeenCalledTimes(1);

    // 2. Clicking when already focused does NOT call select again (allows placing cursor)
    fireEvent.mouseDown(fromInput);
    fireEvent.click(fromInput);
    expect(selectSpy).toHaveBeenCalledTimes(1);

    // 3. When blurred and clicked from outside, selects text on initial entry
    fromInput.blur();
    selectSpy.mockClear();
    fireEvent.mouseDown(fromInput);
    expect(selectSpy).toHaveBeenCalledTimes(1);

    selectSpy.mockRestore();
  });

  test('favorites bar is not rendered when there are no favorites by default', () => {
    render(<App />);
    expect(screen.queryByLabelText(/Favorite Conversions/i)).not.toBeInTheDocument();
  });

  test('clicking a favorite updates active class and units without stealing input focus', async () => {
    window.localStorage.setItem('ct-favorites', JSON.stringify([{ categoryId: 'length', fromUnitId: 'km', toUnitId: 'mi' }]));
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    const selectSpy = jest.spyOn(fromInput, 'select');

    // Open favorites flyout menu from split button
    const openFlyoutBtn = screen.getByRole('button', { name: /View saved favorites/i });
    fireEvent.click(openFlyoutBtn);

    // Stored favorite pill: km → mi
    const favBtn = screen.getByRole('button', { name: /km (?:→|⇄) mi/i });
    const pill = favBtn.closest('.ct-favorite-pill');
    expect(pill).not.toHaveClass('active');

    fireEvent.click(favBtn);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  test('renders clear all favorites button when 5 or more favorites exist and clears them on click', () => {
    const mockFavs = [
      { categoryId: 'length', fromUnitId: 'km', toUnitId: 'mi' },
      { categoryId: 'length', fromUnitId: 'm', toUnitId: 'ft' },
      { categoryId: 'mass', fromUnitId: 'kg', toUnitId: 'lb' },
      { categoryId: 'temperature', fromUnitId: 'c', toUnitId: 'f' },
      { categoryId: 'speed', fromUnitId: 'kmh', toUnitId: 'mph' },
    ];
    window.localStorage.setItem('ct-favorites', JSON.stringify(mockFavs));
    render(<App />);

    const openFlyoutBtn = screen.getByRole('button', { name: /View saved favorites \(5\)/i });
    fireEvent.click(openFlyoutBtn);

    const clearAllBtn = screen.getByRole('button', { name: /Clear all saved favorites/i });
    expect(clearAllBtn).toBeInTheDocument();

    fireEvent.click(clearAllBtn);
    expect(screen.queryByLabelText(/Favorite Conversions/i)).not.toBeInTheDocument();
  });

  test('star favorite button is order-agnostic and stays active when swapped', async () => {
    render(<App />);
    // Initial state: star button starts inactive with no default favorites
    const starBtn = screen.getByRole('button', { name: /Add to favorites/i });
    expect(starBtn).toBeInTheDocument();
    expect(starBtn).not.toHaveClass('active');

    // Click star to add meter ⇄ feet to favorites
    fireEvent.click(starBtn);
    expect(starBtn).toHaveClass('active');
    expect(screen.getByLabelText(/Favorite Conversions/i)).toBeInTheDocument();

    // Click swap button to switch to ft -> m
    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    fireEvent.click(swapButton);

    // Star should STILL be active because the pair is in favorites regardless of order
    expect(starBtn).toHaveClass('active');
  });

  test('triggers physical swap animation using Web Animations API when supported', () => {
    const animateMock = jest.fn().mockReturnValue({
      onfinish: null,
      oncancel: null,
      cancel: jest.fn(),
    });
    Element.prototype.animate = animateMock;

    const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      if (this.classList && this.classList.contains('ct-unit-block-from')) {
        return { left: 100, top: 200, width: 300, height: 100, right: 400, bottom: 300 };
      }
      if (this.classList && this.classList.contains('ct-unit-block-to')) {
        return { left: 450, top: 200, width: 300, height: 100, right: 750, bottom: 300 };
      }
      return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
    };

    render(<App />);

    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    fireEvent.click(swapButton);

    // Verify animate was called for fromEl, toEl, and swapBtn
    expect(animateMock).toHaveBeenCalled();
    const calls = animateMock.mock.calls;
    expect(calls.length).toBeGreaterThanOrEqual(2);

    // Clean up mocks
    delete Element.prototype.animate;
    Element.prototype.getBoundingClientRect = origGetBoundingClientRect;
  });

  test('clicking copy on result number or formula triggers toast notification', async () => {
    render(<App />);
    const copyNumBtn = screen.getByRole('button', { name: /Copy result number/i });
    fireEvent.click(copyNumBtn);

    expect(await screen.findByText(/copied to clipboard!/i)).toBeInTheDocument();

    const copyFormulaBtn = screen.getByRole('button', { name: /Conversion formula/i });
    fireEvent.click(copyFormulaBtn);

    expect(await screen.findByText(/Formula copied to clipboard!/i)).toBeInTheDocument();

    const copyInstructionBtn = screen.getByRole('button', { name: /Conversion instruction/i });
    fireEvent.click(copyInstructionBtn);

    expect(await screen.findByText(/Instruction copied to clipboard!/i)).toBeInTheDocument();
  });

  test('increments and decrements input values to next whole number using arrow keys', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');

    // Increment fromInput: 1 -> 2
    fireEvent.keyDown(fromInput, { key: 'ArrowUp' });
    expect(fromInput.value).toBe('2');

    // Decrement fromInput: 2 -> 1
    fireEvent.keyDown(fromInput, { key: 'ArrowDown' });
    expect(fromInput.value).toBe('1');

    // Decrement again: 1 -> 0
    fireEvent.keyDown(fromInput, { key: 'ArrowDown' });
    expect(fromInput.value).toBe('0');
  });

  test('unit search dropdown selects matching unit on Enter key', () => {
    render(<App />);
    const fromUnitBtn = screen.getByTitle(/Change unit from Meter/i);
    fireEvent.click(fromUnitBtn);

    const searchInput = screen.getByPlaceholderText(/Search unit\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'inch' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTitle(/Change unit from Inch/i)).toBeInTheDocument();
  });

  test('unit search dropdown prioritizes units starting with search term (e.g. Terabytes over Bytes for "te")', () => {
    render(<App />);
    const digitalTab = screen.getByRole('tab', { name: /Digital Storage/i });
    fireEvent.click(digitalTab);

    // Open From dropdown (default in digital is GB)
    const fromUnitBtn = screen.getByTitle(/Change unit from/i);
    fireEvent.click(fromUnitBtn);

    const searchInput = screen.getByPlaceholderText(/Search unit\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'te' } });

    // The first item in the dropdown list must be Terabytes
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options[0]).toHaveTextContent(/Terabytes/i);

    // Enter selects Terabytes
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    expect(screen.getByTitle(/Change unit from Terabyte/i)).toBeInTheDocument();
  });

  test('renders semantic footer category links with valid href paths for SEO crawlers', () => {
    render(<App />);
    const tempCategoryLink = screen.getByRole('link', { name: /^Temperature$/i });
    expect(tempCategoryLink).toBeInTheDocument();
    expect(tempCategoryLink).toHaveAttribute('href', '/temperature');

    // Clicking switches active category
    fireEvent.click(tempCategoryLink);
    const tempTab = screen.getByRole('tab', { name: /Temperature/i });
    expect(tempTab).toHaveClass('active');
  });

  test('renders SEO common pair cards as semantic anchor links and switches conversion pair on click', () => {
    render(<App />);
    // In length category, "Kilometers ⇄ Miles" card should have href /convert/km-to-mi
    const kmMiLink = screen.getByRole('link', { name: /Convert Kilometers to Miles/i });
    expect(kmMiLink).toBeInTheDocument();
    expect(kmMiLink).toHaveAttribute('href', '/convert/km-to-mi');

    fireEvent.click(kmMiLink);
    const toInput = screen.getByLabelText(/Converted value in/i);
    // 1 km to miles = ~0.621371
    expect(Number(toInput.value)).toBeCloseTo(0.621371, 3);
  });

  test('renders all units breakdown cards as semantic anchor links and updates target unit on click', () => {
    render(<App />);
    // "All Meter Conversions" tab
    const allTab = screen.getByRole('tab', { name: /All Meter Conversions/i });
    fireEvent.click(allTab);

    // Inches card should have href /convert/m-to-in
    const inchCardLink = screen.getByRole('link', { name: /Convert Meters to Inches/i });
    expect(inchCardLink).toBeInTheDocument();
    expect(inchCardLink).toHaveAttribute('href', '/convert/m-to-in');

    fireEvent.click(inchCardLink);
    const toInput = screen.getByLabelText(/Converted value in/i);
    // 1 m to inches = ~39.3701
    expect(Number(toInput.value)).toBeCloseTo(39.37, 1);
  });

  test('renders on unit-pair sub-url without crashing', () => {
    window.history.pushState({}, '', '/convert/cup_us-to-tbsp_us');
    render(<App />);
    expect(screen.getByRole('tab', { name: /Kitchen/i })).toHaveClass('active');
  });

  test('renders on category sub-url /cooking without crashing', () => {
    window.history.pushState({}, '', '/cooking');
    render(<App />);
    expect(screen.getByRole('tab', { name: /Kitchen/i })).toHaveClass('active');
  });

  test('renders on /mass without crashing', () => {
    window.history.pushState({}, '', '/mass');
    render(<App />);
    expect(screen.getByRole('tab', { name: /Weight & Mass/i })).toHaveClass('active');
  });

  test('preserves root pathname and homepage canonical URL on initial mount', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(window.location.pathname).toBe('/');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/');
    expect(document.title).toBe('ConvertThings - Instant, Accurate Online Unit Converter');
  });

  test('preserves category pathname and canonical URL when mounting directly on /mass', () => {
    window.history.replaceState({}, '', '/mass');
    render(<App />);

    expect(window.location.pathname).toBe('/mass');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/mass');
    expect(document.title).toContain('Weight & Mass Converter');
  });

  test('navigates to category route and preserves category canonical when selecting category', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    const massTab = screen.getByRole('tab', { name: /Weight & Mass/i });
    fireEvent.click(massTab);

    expect(window.location.pathname).toBe('/mass');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/mass');
    expect(document.title).toContain('Weight & Mass');

    // Subsequent user calculation transitions to conversion slug
    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    fireEvent.click(swapButton);

    expect(window.location.pathname).toContain('/convert/');
    expect(canonical.href).toContain('/convert/');
  });

  test('clicking header logo navigates back to root homepage and restores homepage canonical', () => {
    window.history.replaceState({}, '', '/cooking');
    render(<App />);

    const homeLink = screen.getByLabelText(/^ConvertThings Home$/i);
    fireEvent.click(homeLink);

    expect(window.location.pathname).toBe('/');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/');
    expect(document.title).toBe('ConvertThings - Instant, Accurate Online Unit Converter');
  });
});

describe('Dual-Tier Memory System (In-Session & Cross-Session Persistence)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('retains active input number and units per category within the same session', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    // Start on Length, set fromInput to 42
    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '42' } });
    expect(fromInput.value).toBe('42');

    // Switch to Kitchen tab
    const kitchenTab = screen.getByRole('tab', { name: /Kitchen/i });
    fireEvent.click(kitchenTab);

    // Kitchen starts with fresh 1
    const kitchenInput = screen.getByLabelText(/Enter value in/i);
    expect(kitchenInput.value).toBe('1');

    // Change Kitchen to 3.5
    fireEvent.change(kitchenInput, { target: { value: '3.5' } });
    expect(kitchenInput.value).toBe('3.5');

    // Switch back to Length tab
    const lengthTab = screen.getByRole('tab', { name: /Length & Distance/i });
    fireEvent.click(lengthTab);

    // Length restores remembered value 42
    const restoredLengthInput = screen.getByLabelText(/Enter value in/i);
    expect(restoredLengthInput.value).toBe('42');

    // Switch back to Kitchen tab
    fireEvent.click(kitchenTab);
    const restoredKitchenInput = screen.getByLabelText(/Enter value in/i);
    expect(restoredKitchenInput.value).toBe('3.5');
  });

  test('loads cross-session preferred units for category hubs while starting with clean 1', () => {
    // Pre-populate preferred units in localStorage for mass (e.g. lb to g)
    window.localStorage.setItem(
      'ct-pref-units',
      JSON.stringify({
        mass: { fromUnitId: 'lb', toUnitId: 'g' },
      })
    );

    // Mount on /mass
    window.history.replaceState({}, '', '/mass');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');

    // Unit symbols should reflect the preferred units
    expect(screen.getByTitle('Change unit from Pound')).toBeInTheDocument();
    expect(screen.getByTitle('Change unit to Gram')).toBeInTheDocument();
  });

  test('updates ct-pref-units in localStorage when user swaps or changes units', () => {
    window.history.replaceState({}, '', '/length');
    render(<App />);

    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    fireEvent.click(swapButton);

    const stored = JSON.parse(window.localStorage.getItem('ct-pref-units') || '{}');
    expect(stored.length).toBeDefined();
    expect(stored.length.fromUnitId).toBe('ft');
    expect(stored.length.toUnitId).toBe('m');
  });

  test('direct URL overrides stored category unit preferences', () => {
    // Pre-populate preferred units for length to be ft -> in
    window.localStorage.setItem(
      'ct-pref-units',
      JSON.stringify({
        length: { fromUnitId: 'ft', toUnitId: 'in' },
      })
    );

    // Direct link to 100 km to miles
    window.history.replaceState({}, '', '/convert/100-km-to-miles');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('100');
    expect(screen.getByTitle('Change unit from Kilometer')).toBeInTheDocument();
    expect(screen.getByTitle('Change unit to Mile')).toBeInTheDocument();
  });

  test('root homepage / restores saved length unit preferences while starting with clean 1', () => {
    // Pre-populate preferred units for length to be mi -> km
    window.localStorage.setItem(
      'ct-pref-units',
      JSON.stringify({
        length: { fromUnitId: 'mi', toUnitId: 'km' },
      })
    );

    // Mount on root /
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(window.location.pathname).toBe('/');
    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');
    expect(screen.getByTitle('Change unit from Mile')).toBeInTheDocument();
    expect(screen.getByTitle('Change unit to Kilometer')).toBeInTheDocument();

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/');
    expect(document.title).toBe('ConvertThings - Instant, Accurate Online Unit Converter');
  });

  test('root homepage / defaults to 1 Meter to Foot when no length preferences are stored', () => {
    // Mount on root / with empty localStorage
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(window.location.pathname).toBe('/');
    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');
    expect(screen.getByTitle('Change unit from Meter')).toBeInTheDocument();
    expect(screen.getByTitle('Change unit to Foot')).toBeInTheDocument();
  });

  test('mounts with precision from URL query parameter (?p=4) and overrides local state for that view', () => {
    window.history.replaceState({}, '', '/convert/100-km-to-miles?p=4');
    render(<App />);

    const precisionSelect = screen.getByLabelText(/Decimal Precision/i);
    expect(precisionSelect.value).toBe('4');

    const toInput = screen.getByLabelText(/Converted value in/i);
    // 100 km to miles = 62.1371192... -> with 4 decimals is 62.1371
    expect(toInput.value).toBe('62.1371');

    // Canonical link tag must remain completely clean for SEO bots
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/convert/100-km-to-mi');
    expect(canonical.href).not.toContain('?p=');
  });

  test('dynamically synchronizes ?p= in browser address bar when changing precision', () => {
    window.history.replaceState({}, '', '/convert/100-km-to-miles');
    render(<App />);

    expect(window.location.search).toBe('');

    const precisionSelect = screen.getByLabelText(/Decimal Precision/i);

    // Switch to 2 decimals -> URL gains ?p=2
    fireEvent.change(precisionSelect, { target: { value: '2' } });
    expect(window.location.search).toBe('?p=2');

    // Switch to exact -> URL gains ?p=exact
    fireEvent.change(precisionSelect, { target: { value: 'exact' } });
    expect(window.location.search).toBe('?p=exact');

    // Switch back to auto -> URL search is cleanly cleared
    fireEvent.change(precisionSelect, { target: { value: 'auto' } });
    expect(window.location.search).toBe('');
  });

  test('share button copies current URL including ?p= parameter when precision is non-default', async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    window.history.replaceState({}, '', '/convert/100-km-to-miles?p=exact');
    render(<App />);

    const shareButton = screen.getByRole('button', { name: /Share conversion link/i });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    const copiedUrl = writeTextMock.mock.calls[0][0];
    expect(copiedUrl).toContain('/convert/100-km-to-mi?p=exact');

    expect(await screen.findByText(/Conversion link copied to clipboard!/i)).toBeInTheDocument();

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  test('synchronizes ?p= on category hubs and root homepage without affecting canonical tags', () => {
    // 1. Root homepage with ?p=2
    window.history.replaceState({}, '', '/?p=2');
    const { unmount } = render(<App />);

    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('?p=2');
    const rootCanonical = document.querySelector('link[rel="canonical"]');
    expect(rootCanonical.href).toBe('https://www.convertthings.com/');

    unmount();

    // 2. Category page with ?p=2 (e.g. /mass)
    window.history.replaceState({}, '', '/mass?p=2');
    render(<App />);

    expect(window.location.pathname).toBe('/mass');
    expect(window.location.search).toBe('?p=2');
    const catCanonical = document.querySelector('link[rel="canonical"]');
    expect(catCanonical.href).toBe('https://www.convertthings.com/mass');
  });

  test('share button always generates full permalink even when sitting on clean root / or category hub', async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    // 1. Root / with remembered mi -> km
    window.localStorage.setItem(
      'ct-pref-units',
      JSON.stringify({ length: { fromUnitId: 'mi', toUnitId: 'km' } })
    );
    window.history.replaceState({}, '', '/');
    const { unmount } = render(<App />);

    expect(window.location.pathname).toBe('/');
    const shareBtn = screen.getByRole('button', { name: /Share conversion link/i });
    await act(async () => {
      fireEvent.click(shareBtn);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toBe('http://localhost/convert/mi-to-km');
    unmount();

    // 2. Category hub /cooking (Kitchen mode is ON by default)
    window.history.replaceState({}, '', '/cooking');
    render(<App />);

    expect(window.location.pathname).toBe('/cooking');
    const shareBtn2 = screen.getByRole('button', { name: /Share conversion link/i });
    await act(async () => {
      fireEvent.click(shareBtn2);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(2);
    expect(writeTextMock.mock.calls[1][0]).toContain('http://localhost/convert/cup_us-to-tbsp_us');

    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });

  test('promotes address bar from root / or category hub to /convert/... upon user interaction', () => {
    // 1. Mount on root /
    window.history.replaceState({}, '', '/');
    render(<App />);

    expect(window.location.pathname).toBe('/');

    // Type 25 into fromInput -> promotes to /convert/25-m-to-ft
    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '25' } });

    expect(window.location.pathname).toBe('/convert/25-m-to-ft');

    // Click swap button -> promotes to /convert/ft-to-m (with converted value)
    const swapButton = screen.getByLabelText(/Swap from and to units/i);
    fireEvent.click(swapButton);

    expect(window.location.pathname).toContain('/convert/');
    expect(window.location.pathname).toContain('-ft-to-m');
  });

  test('opens unit dropdown on the first click even when categories are expanded', async () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    // Expand categories
    const expandBtn = screen.getByRole('button', { name: /View all.*categories/i });
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(expandBtn);
    expect(expandBtn).toHaveAttribute('aria-expanded', 'true');

    // Click From unit dropdown button on first attempt
    const fromUnitBtn = screen.getByTitle(/Change unit from Meter/i);
    expect(fromUnitBtn).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search unit.../i)).not.toBeInTheDocument();

    // First click should immediately open the dropdown
    fireEvent.click(fromUnitBtn);

    // Dropdown search input should now be visible on the very first click
    expect(screen.getByPlaceholderText(/Search unit.../i)).toBeInTheDocument();

    // Expanded categories should simultaneously collapse
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('loads /convert/...-to-...?kitchen=1 directly with Kitchen Mode ON and drawer active', () => {
    window.history.replaceState({}, '', '/convert/cup_us-to-tbsp_us?kitchen=1');
    render(<App />);

    expect(window.location.pathname).toBe('/convert/cup_us-to-tbsp_us');
    expect(window.location.search).toBe('?kitchen=1');

    // Kitchen mode drawer elements should be visible
    expect(screen.getByText('Drawer Tools to Pull')).toBeInTheDocument();
  });

  test('loads /convert/...-to-... with Kitchen Mode OFF by default', () => {
    window.history.replaceState({}, '', '/convert/cup_us-to-tbsp_us');
    render(<App />);

    expect(window.location.pathname).toBe('/convert/cup_us-to-tbsp_us');
    expect(window.location.search).toBe('');

    // Kitchen drawer should NOT be active
    expect(screen.queryByText('Drawer Tools to Pull')).not.toBeInTheDocument();
  });

  test('Smart Headroom hides on scroll down and reveals on any upward scroll', () => {
    window.history.replaceState({}, '', '/');
    render(<App />);

    const header = document.querySelector('.ct-header');
    expect(header).toBeInTheDocument();
    expect(header).not.toHaveClass('ct-header-hidden');

    // Simulate scrolling down past 40px threshold
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { value: 150, writable: true, configurable: true });
      fireEvent.scroll(window);
    });
    expect(header).toHaveClass('ct-header-hidden');

    // Simulate scrolling UP even slightly (from 150 to 140) - should immediately reveal
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { value: 140, writable: true, configurable: true });
      fireEvent.scroll(window);
    });
    expect(header).not.toHaveClass('ct-header-hidden');

    // Scroll down again - hides
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { value: 300, writable: true, configurable: true });
      fireEvent.scroll(window);
    });
    expect(header).toHaveClass('ct-header-hidden');

    // Press '/' key while hidden - should reveal immediately
    act(() => {
      fireEvent.keyDown(window, { key: '/' });
    });
    expect(header).not.toHaveClass('ct-header-hidden');
  });

  test('initial site load renders brand logo in clean resting state without entrance animations', () => {
    render(<App />);

    const brandLink = document.querySelector('.ct-header .ct-brand');
    expect(brandLink).toBeInTheDocument();
    const logoWrap = brandLink.querySelector('.ct-logo-wrap');
    expect(logoWrap).not.toHaveClass('ct-logo-dock');
    expect(logoWrap).not.toHaveClass('ct-cat-switch-active');
    expect(logoWrap).not.toHaveClass('ct-turbine-active');
    expect(brandLink).not.toHaveClass('ct-brand-turbine-active');
    expect(brandLink).not.toHaveClass('ct-brand-easter-egg');
    expect(brandLink).toHaveClass('ct-cat-length');
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  test('clicking brand logo 3 times triggers celestial orbit easter egg animation with text haptic pulse', () => {
    jest.useFakeTimers();
    render(<App />);

    const brandLink = document.querySelector('.ct-header .ct-brand');
    expect(brandLink).toBeInTheDocument();
    const logoWrap = brandLink.querySelector('.ct-logo-wrap');
    expect(logoWrap).not.toHaveClass('ct-turbine-active');

    // Click 3 times quickly
    act(() => {
      fireEvent.click(brandLink);
      fireEvent.click(brandLink);
      fireEvent.click(brandLink);
    });

    expect(logoWrap).toHaveClass('ct-turbine-active');
    expect(brandLink).toHaveClass('ct-brand-easter-egg');

    // After animation duration (1100ms), classes should automatically remove
    act(() => {
      jest.advanceTimersByTime(1150);
    });

    expect(logoWrap).not.toHaveClass('ct-turbine-active');
    expect(brandLink).not.toHaveClass('ct-brand-easter-egg');
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
    jest.useRealTimers();
  });

  test('category change triggers dual-arrow conveyor handoff animation with simultaneous visibility', () => {
    jest.useFakeTimers();
    render(<App />);

    const brandLink = document.querySelector('.ct-header .ct-brand');
    expect(brandLink).toBeInTheDocument();
    const logoWrap = brandLink.querySelector('.ct-logo-wrap');
    expect(logoWrap).not.toHaveClass('ct-cat-switch-active');
    expect(brandLink).toHaveClass('ct-cat-length');
    expect(logoWrap.querySelector('.ct-logo-arrow-exit')).toBeNull();

    // Switch to mass category via CategoryNav tab
    const massTab = screen.getByRole('tab', { name: /Weight & Mass/i });
    act(() => {
      fireEvent.click(massTab);
    });

    // Conveyor handoff triggers: exit arrow with old category (length) and enter arrow with new category (mass)
    expect(logoWrap).toHaveClass('ct-cat-switch-active');
    expect(brandLink).toHaveClass('ct-brand-turbine-active');
    expect(brandLink).toHaveClass('ct-cat-mass');

    const exitArrow = logoWrap.querySelector('.ct-logo-arrow-exit');
    const enterArrow = logoWrap.querySelector('.ct-logo-arrow-enter');
    expect(exitArrow).toBeInTheDocument();
    expect(exitArrow).toHaveClass('ct-cat-length');
    expect(enterArrow).toBeInTheDocument();

    // Mid-flight (350ms): both arrows remain visible simultaneously
    act(() => {
      jest.advanceTimersByTime(350);
    });
    expect(logoWrap).toHaveClass('ct-cat-switch-active');
    expect(logoWrap.querySelector('.ct-logo-arrow-exit')).toBeInTheDocument();
    expect(logoWrap.querySelector('.ct-logo-arrow-enter')).toBeInTheDocument();

    // After 720ms duration completes, animation class and exit arrow cleanly detach
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(logoWrap).not.toHaveClass('ct-cat-switch-active');
    expect(logoWrap.querySelector('.ct-logo-arrow-exit')).toBeNull();
    expect(logoWrap.querySelector('.ct-logo-arrow-enter')).toBeNull();
    expect(brandLink).toHaveClass('ct-cat-mass');
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
    jest.useRealTimers();
  });

  describe('Unit Dropdown Auto-Focus Behavior (Desktop vs Mobile)', () => {
    const originalInnerWidth = window.innerWidth;
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.innerWidth = originalInnerWidth;
      window.matchMedia = originalMatchMedia;
    });

    test('isDesktopDevice returns correct boolean based on pointer and screen width', () => {
      // Desktop simulation
      window.innerWidth = 1200;
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('pointer: fine') || query.includes('hover: hover'),
      }));
      expect(isDesktopDevice()).toBe(true);

      // Mobile touch screen simulation (pointer: coarse)
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('pointer: coarse'),
      }));
      expect(isDesktopDevice()).toBe(false);

      // Touch device with hover: none
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('hover: none'),
      }));
      expect(isDesktopDevice()).toBe(false);

      // Mobile narrow screen width <= 768
      window.innerWidth = 414;
      window.matchMedia = jest.fn().mockImplementation(() => ({ matches: false }));
      expect(isDesktopDevice()).toBe(false);
    });

    test('opening unit dropdown on desktop automatically focuses the unit search input', () => {
      window.innerWidth = 1200;
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: !query.includes('pointer: coarse') && !query.includes('hover: none'),
      }));

      render(<App />);

      // Click From unit chip to open dropdown
      const fromUnitBtn = screen.getByTitle(/Change unit from Meter/i);
      fireEvent.click(fromUnitBtn);

      const fromSearchInput = screen.getByPlaceholderText(/Search unit\.\.\./i);
      expect(fromSearchInput).toBeInTheDocument();
      // On desktop, the search input should receive active focus
      expect(document.activeElement).toBe(fromSearchInput);

      // Click To unit chip to open To dropdown
      const toUnitBtn = screen.getByTitle(/Change unit to Foot/i);
      fireEvent.click(toUnitBtn);

      const toSearchInput = screen.getByPlaceholderText(/Search unit\.\.\./i);
      expect(toSearchInput).toBeInTheDocument();
      // On desktop, the To search input should now have active focus
      expect(document.activeElement).toBe(toSearchInput);
    });

    test('opening unit dropdown on mobile does NOT focus unit search, avoiding virtual keyboard popup', () => {
      // Simulate mobile device: coarse pointer (touchscreen) and narrow screen
      window.innerWidth = 390;
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query.includes('pointer: coarse') || query.includes('hover: none'),
      }));

      render(<App />);

      const fromUnitBtn = screen.getByTitle(/Change unit from Meter/i);
      fireEvent.click(fromUnitBtn);

      const searchInput = screen.getByPlaceholderText(/Search unit\.\.\./i);
      expect(searchInput).toBeInTheDocument();
      // On mobile, the search input must NOT steal focus to keep on-screen keyboard from popping up
      expect(document.activeElement).not.toBe(searchInput);
    });
  });

  describe('Fraction & Compound Measurement End-to-End Integration', () => {
    afterEach(() => {
      window.history.replaceState({}, '', '/');
      window.localStorage.clear();
    });

    test('selecting fraction search suggestion preserves exact fraction string in From input', async () => {
      render(<App />);

      const searchInput = screen.getByLabelText(/Universal conversion search bar/i);
      fireEvent.change(searchInput, { target: { value: '1/8 in to mm' } });

      // Find the instant match suggestion
      const matchBtn = await screen.findByRole('button', { name: /Apply parsed conversion/i });
      expect(matchBtn).toBeInTheDocument();
      expect(screen.getByText(/3\.175 Millimeters/i)).toBeInTheDocument();

      fireEvent.click(matchBtn);

      // Verify the From input displays "1/8" (not "0.125")
      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('1/8');

      // Verify the converted value is 3.175
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('3.175');
    });

    test('resolves compound height expressions like 5\'10" and 5 ft 10 in without truncating to 5', () => {
      window.history.replaceState({}, '', '/convert/ft-to-cm');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      fireEvent.change(fromInput, { target: { value: "5'10\"" } });

      // Converted value must be 177.8 cm (70 inches * 2.54), NOT 152.4 cm (5 feet)
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('177.8');

      // Test "5 ft 10 in" variant
      fireEvent.change(fromInput, { target: { value: '5 ft 10 in' } });
      expect(toInput).toHaveValue('177.8');
    });

    test('resolves compound weight expressions like 2 lbs 4 oz without truncating to 2', () => {
      window.history.replaceState({}, '', '/convert/lb-to-g');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      fireEvent.change(fromInput, { target: { value: '2 lbs 4 oz' } });

      // 2 lbs 4 oz = 36 oz = 1020.5828 g
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(parseFloat(toInput.value)).toBeCloseTo(1020.58, 1);
    });

    test('initializes from fraction query parameter ?v=1%2F8 cleanly', () => {
      window.history.replaceState({}, '', '/convert/in-to-mm?v=1%2F8');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('1/8');

      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('3.175');
    });

    test('resolves unspaced compound height expressions like 4ft5in and updates equation cleanly', () => {
      window.history.replaceState({}, '', '/convert/ft-to-in');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      fireEvent.change(fromInput, { target: { value: '4ft5in' } });

      // 4 ft 5 in = 53 inches
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('53');

      // Verify the equation displays "4 ft 5 in" on the left and "53 in" on the right
      expect(screen.getByText('4 ft 5 in')).toBeInTheDocument();
      expect(screen.queryByText(/4ft5in ft/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/= 0 in/i)).not.toBeInTheDocument();
    });

    test('shows subtle warning and does not claim result is 0 when invalid expression is typed', () => {
      window.history.replaceState({}, '', '/convert/ft-to-in');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      fireEvent.change(fromInput, { target: { value: '12..4' } });

      // To input must not claim 0
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('');
      expect(toInput).toHaveAttribute('placeholder', '—');

      // Warning alert is visible
      expect(screen.getByRole('alert')).toHaveTextContent(/Unrecognized format/i);

      // Hero equation displays friendly guidance, NOT "= 0 in"
      expect(screen.getByText(/Enter a valid number or expression/i)).toBeInTheDocument();
      expect(screen.queryByText(/= 0 in/i)).not.toBeInTheDocument();
    });

    test('loads Height Hub /convert/feet-inches-to-cm with pre-loaded compound value and height chart', () => {
      window.history.replaceState({}, '', '/convert/feet-inches-to-cm');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('5 ft 10 in');

      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(parseFloat(toInput.value)).toBeCloseTo(177.8, 1);

      // Verify the URL stays on the hub path
      expect(window.location.pathname).toBe('/convert/feet-inches-to-cm');

      // Verify Document Title reflects Height Hub
      expect(document.title).toContain('Height Converter: Feet & Inches to cm');

      // Verify specialized height table is present
      expect(screen.getByText('Human Height Conversion Chart')).toBeInTheDocument();
      expect(screen.getByText("5' 10\"")).toBeInTheDocument();
    });

    test('loads Tape Measure Hub /convert/fraction-inches-to-mm with tape fractions and table', () => {
      window.history.replaceState({}, '', '/convert/fraction-inches-to-mm');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('13/16');

      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('20 5/8');

      expect(window.location.pathname).toBe('/convert/fraction-inches-to-mm');
      expect(document.title).toContain('Tape Measure Fraction to mm Converter');
      expect(screen.getByText('Tape Measure Fractions to Millimeters')).toBeInTheDocument();
    });

    test('loads Baking Hub /convert/baking-fractions with kitchen drawer breakdown', () => {
      window.history.replaceState({}, '', '/convert/baking-fractions');
      render(<App />);

      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('1/3');

      expect(window.location.pathname).toBe('/convert/baking-fractions');
      expect(document.title).toContain('Baking Measurement Converter');
      expect(screen.getByText('Baking & Kitchen Drawer Equivalents')).toBeInTheDocument();
    });
  });

  describe('Dedicated Kitchen Studio (/kitchen)', () => {
    test('loads /kitchen directly with Kitchen Staples shelf and escape hatch', () => {
      window.history.replaceState({}, '', '/kitchen');
      render(<App />);

      expect(window.location.pathname).toBe('/kitchen');
      expect(document.title).toContain('Kitchen & Baking Converter');

      // Pinned escape hatch to return to standard converters
      const exitTab = screen.getByRole('tab', { name: /All Converters/i });
      expect(exitTab).toBeInTheDocument();

      // Top baking staples are present on the shelf
      expect(screen.getAllByRole('tab', { name: /Flour/i })[0]).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /White Sugar/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Butter/i })).toBeInTheDocument();

      // Default staple is Flour (cup_us to g, 1 cup = 120 g)
      const fromInput = screen.getByLabelText(/Enter value in/i);
      expect(fromInput).toHaveValue('1');
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(toInput).toHaveValue('120');
    });

    test('switches staples in 1 tap and updates ingredient and density', () => {
      window.history.replaceState({}, '', '/kitchen');
      render(<App />);

      // Switch to Butter
      const butterTab = screen.getByRole('tab', { name: /Butter/i });
      fireEvent.click(butterTab);

      // Butter converts 1 stick of butter to ~113.4g
      const toInput = screen.getByLabelText(/Converted value in/i);
      expect(parseFloat(toInput.value)).toBeCloseTo(113.4, 1);
    });

    test('exits Kitchen Studio back to universal converters via escape hatch', () => {
      window.history.replaceState({}, '', '/kitchen');
      render(<App />);

      const exitTab = screen.getByRole('tab', { name: /All Converters/i });
      fireEvent.click(exitTab);

      // Returns to root homepage with standard categories
      expect(window.location.pathname).toBe('/');
      expect(screen.getByRole('tab', { name: /Length & Distance/i })).toBeInTheDocument();
    });

    test('toggles Kitchen Studio via Header mode switcher', () => {
      window.history.replaceState({}, '', '/');
      render(<App />);

      // Equal peer mode switcher buttons in header
      const kitchenModeBtn = screen.getByRole('radio', { name: /Kitchen Studio Mode/i });
      fireEvent.click(kitchenModeBtn);

      // Enters Kitchen Studio
      expect(window.location.pathname).toBe('/kitchen');
      expect(screen.getByRole('tab', { name: /All Converters/i })).toBeInTheDocument();

      // Click Standard Mode switcher button to return
      const standardModeBtn = screen.getByRole('radio', { name: /Standard Converters Mode/i });
      fireEvent.click(standardModeBtn);

      // Returns to standard mode
      expect(window.location.pathname).toBe('/');
      expect(screen.getByRole('tab', { name: /Length & Distance/i })).toBeInTheDocument();
    });
  });
});


