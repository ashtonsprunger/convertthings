import { render, screen, fireEvent, act, within } from '@testing-library/react';
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

  test('automatically displays practical fractions and kitchen view for cooking in auto mode', () => {
    window.history.replaceState({}, '', '/convert/13-tbsp_us-to-cup_us');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('13');

    // Default Kitchen Mode is ON:
    const kitchenToggle = screen.getByLabelText(/Toggle Kitchen Mode/i);
    expect(kitchenToggle).toHaveAttribute('aria-pressed', 'true');

    // In Kitchen Mode, 2nd input is replaced by the prominent kitchen-readable output
    const kitchenOutput = screen.getByLabelText(/Converted value in.*¾ cup \+ 1 tbsp/i);
    expect(kitchenOutput).toHaveTextContent('¾ cup + 1 tbsp');
    expect(kitchenOutput).toHaveTextContent('(13/16 cup)');

    // Everything below the inputs in the card is removed
    expect(screen.queryByLabelText(/Conversion equations/i)).not.toBeInTheDocument();

    // Toggle Kitchen Mode OFF to enter Standard View
    fireEvent.click(kitchenToggle);
    expect(kitchenToggle).toHaveAttribute('aria-pressed', 'false');

    // Standard 2nd input is restored with fraction formatting
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput.value).toBe('13/16');

    // Footnote card below inputs is restored
    const equationCard = screen.getByLabelText(/Conversion equations/i);
    expect(equationCard).toHaveTextContent(/13 tbsp = 13\/16.*cup/i);

    // Toggle back ON
    fireEvent.click(kitchenToggle);
    expect(kitchenToggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByLabelText(/Conversion equations/i)).not.toBeInTheDocument();
  });

  test('converts 34 mL to cups in Kitchen View as real spoons (2 tbsp + 1 tsp) and never 5/32', () => {
    window.history.replaceState({}, '', '/convert/34-ml-to-cup_us');
    render(<App />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput.value).toBe('34');

    // In Kitchen Mode (default ON):
    const kitchenOutput = screen.getByLabelText(/Converted value in.*2 tbsp \+ 1 tsp/i);
    expect(kitchenOutput).toHaveTextContent('2 tbsp + 1 tsp');
    expect(kitchenOutput).not.toHaveTextContent('5/32');

    // Subtitle displays clean decimal (0.1437 cup), NEVER 5/32
    expect(kitchenOutput).toHaveTextContent(/0\.14.*cup/i);
    expect(kitchenOutput).not.toHaveTextContent('/32');

    // Toggle to Standard View:
    const kitchenToggle = screen.getByLabelText(/Toggle Kitchen Mode/i);
    fireEvent.click(kitchenToggle);

    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput.value).not.toBe('5/32');
    expect(parseFloat(toInput.value)).toBeCloseTo(0.1437, 3);

    // Kitchen Measure helper badge is visible in Standard View with spoon measurement
    const kitchenBadge = screen.getByLabelText(/Kitchen measure: 2 tbsp \+ 1 tsp/i);
    expect(kitchenBadge).toBeInTheDocument();
  });

  test('always shows the smart Kitchen measure helper badge in Cooking Standard View for clean and compound values', () => {
    // 1. 1 stick of butter to cups -> "½ cup"
    window.history.replaceState({}, '', '/convert/1-stick_butter-to-cup_us');
    const { unmount } = render(<App />);

    // Toggle to Standard View
    const kitchenToggle = screen.getByLabelText(/Toggle Kitchen Mode/i);
    fireEvent.click(kitchenToggle);

    // Kitchen Measure badge should be displayed with "½ cup"
    expect(screen.getByRole('button', { name: /Kitchen measure: ½ cup/i })).toBeInTheDocument();

    unmount();

    // 2. 1 cup to tablespoons: shows smart equivalence context "16 tbsp (1 cup)"
    window.history.replaceState({}, '', '/convert/1-cup_us-to-tbsp_us');
    render(<App />);

    // Ensure we are in Standard View (localStorage persisted or toggle)
    const toggle2 = screen.getByLabelText(/Toggle Kitchen Mode/i);
    if (toggle2.getAttribute('aria-pressed') === 'true') {
      fireEvent.click(toggle2);
    }

    expect(screen.getByRole('button', { name: /Kitchen measure: 1 cup \(16 tbsp\)/i })).toBeInTheDocument();
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
    expect(screen.getByRole('tab', { name: /Cooking/i })).toHaveClass('active');
  });

  test('renders on category sub-url /cooking without crashing', () => {
    window.history.pushState({}, '', '/cooking');
    render(<App />);
    expect(screen.getByRole('tab', { name: /Cooking/i })).toHaveClass('active');
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

    const cookingTab = screen.getByRole('tab', { name: /Cooking/i });
    fireEvent.click(cookingTab);

    expect(window.location.pathname).toBe('/cooking');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical.href).toBe('https://www.convertthings.com/cooking');
    expect(document.title).toContain('Cooking & Kitchen');

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

    // Switch to Cooking tab
    const cookingTab = screen.getByRole('tab', { name: /Cooking/i });
    fireEvent.click(cookingTab);

    // Cooking starts with fresh 1
    const cookingInput = screen.getByLabelText(/Enter value in/i);
    expect(cookingInput.value).toBe('1');

    // Change Cooking to 3.5
    fireEvent.change(cookingInput, { target: { value: '3.5' } });
    expect(cookingInput.value).toBe('3.5');

    // Switch back to Length tab
    const lengthTab = screen.getByRole('tab', { name: /Length & Distance/i });
    fireEvent.click(lengthTab);

    // Length restores remembered value 42
    const restoredLengthInput = screen.getByLabelText(/Enter value in/i);
    expect(restoredLengthInput.value).toBe('42');

    // Switch back to Cooking tab
    fireEvent.click(cookingTab);
    const restoredCookingInput = screen.getByLabelText(/Enter value in/i);
    expect(restoredCookingInput.value).toBe('3.5');
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
});

