import { render, screen, fireEvent, act } from '@testing-library/react';
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
    expect(parseConversionQuery('100 a')).toBeNull();
    expect(parseConversionQuery('100 p')).toBeNull();
    expect(parseConversionQuery('100 e')).toBeNull();
    expect(parseConversionQuery('100 u')).toBeNull();
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
    expect(equationCard).toHaveTextContent(/1 meter (is approximately|equals)/i);

    // Linked result number copy button inside hero equation
    const copyNumBtn = screen.getByRole('button', { name: /Copy result number/i });
    expect(copyNumBtn).toBeInTheDocument();
    expect(copyNumBtn).toHaveAttribute('title');

    // Click result number copy button
    await act(async () => {
      fireEvent.click(copyNumBtn);
    });
    expect(copyNumBtn).toHaveClass('copied');

    // Formula educational reference strip
    const formulaStrip = screen.getByLabelText(/Conversion formula/i);
    expect(formulaStrip).toBeInTheDocument();
    expect(formulaStrip).toHaveTextContent(/Formula/i);
    expect(formulaStrip).toHaveTextContent(/Multiply the meter value by 3.2808/i);
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
    // The calculated fromInput should update with full precision
    expect(Number(fromInput.value)).toBeCloseTo(33.91666667, 5);
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

  test('respects stored decimal precision on initial mount and page reload', () => {
    window.localStorage.setItem('ct-precision', JSON.stringify('2'));
    render(<App />);

    const toInput = screen.getByLabelText(/Converted value in/i);
    // 1 meter to feet formatted with 2 decimal precision should be '3.28'
    expect(toInput.value).toBe('3.28');
  });

  test('clicking or focusing an input field selects its text', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    const selectSpy = jest.spyOn(fromInput, 'select');

    fireEvent.focus(fromInput);
    expect(selectSpy).toHaveBeenCalled();

    fireEvent.click(fromInput);
    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  test('favorites bar is not rendered when there are no favorites by default', () => {
    render(<App />);
    expect(screen.queryByLabelText(/Favorite Conversions/i)).not.toBeInTheDocument();
  });

  test('clicking a favorite focuses and selects the from input field and sets active class', async () => {
    window.localStorage.setItem('ct-favorites', JSON.stringify([{ categoryId: 'length', fromUnitId: 'km', toUnitId: 'mi' }]));
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    const selectSpy = jest.spyOn(fromInput, 'select');

    // Stored favorite pill: km ⇄ mi
    const favBtn = screen.getByRole('button', { name: /km ⇄ mi/i });
    const pill = favBtn.closest('.ct-favorite-pill');
    expect(pill).not.toHaveClass('active');

    fireEvent.click(favBtn);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(selectSpy).toHaveBeenCalled();
    expect(pill).toHaveClass('active');
    selectSpy.mockRestore();
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

  test('clicking copy button on symbol or sentence triggers toast notification, and formula is displayed', async () => {
    render(<App />);
    const copySymbolBtn = screen.getByRole('button', { name: /Copy symbol equation/i });
    fireEvent.click(copySymbolBtn);

    expect(await screen.findByText(/Equation copied to clipboard!/i)).toBeInTheDocument();

    const copySentenceBtn = screen.getByRole('button', { name: /Copy sentence equation/i });
    fireEvent.click(copySentenceBtn);

    expect(await screen.findByText(/Sentence copied to clipboard!/i)).toBeInTheDocument();

    // Educational formula strip is displayed as reference
    expect(screen.getByLabelText(/Conversion formula/i)).toBeInTheDocument();
  });

  test('increments and decrements input values to next whole number using stepper buttons', () => {
    render(<App />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('1');

    // Increment fromInput: 1 -> 2
    const incFromBtn = screen.getByRole('button', { name: /Increment Meter/i });
    fireEvent.click(incFromBtn);
    expect(fromInput.value).toBe('2');

    // Decrement fromInput: 2 -> 1
    const decFromBtn = screen.getByRole('button', { name: /Decrement Meter/i });
    fireEvent.click(decFromBtn);
    expect(fromInput.value).toBe('1');

    // Decrement again: 1 -> 0
    fireEvent.click(decFromBtn);
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
});

