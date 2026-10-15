import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { ConversionCard, isDesktopDevice } from './ConversionCard';

describe('ConversionCard Component', () => {
  const defaultProps = {
    categoryId: 'length',
    fromUnitId: 'm',
    toUnitId: 'ft',
    fromValue: '1',
    toValue: '3.28084',
    precision: 'auto',
    kitchenMode: true,
    onToggleKitchenMode: jest.fn(),
    isFavorite: false,
    onFromUnitChange: jest.fn(),
    onToUnitChange: jest.fn(),
    onFromValueChange: jest.fn(),
    onToValueChange: jest.fn(),
    onSwap: jest.fn(),
    onPrecisionChange: jest.fn(),
    onToggleFavorite: jest.fn(),
    onCopy: jest.fn(),
    onShare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders inputs with from and to values and unit chips', () => {
    render(<ConversionCard {...defaultProps} />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput).toHaveValue('1');

    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput).toHaveValue('3.28084');

    expect(screen.getByText('Meter')).toBeInTheDocument();
    expect(screen.getByText('Foot')).toBeInTheDocument();
  });

  test('accepts fraction input like 1/8 without browser blocking', () => {
    render(<ConversionCard {...defaultProps} fromValue="1/8" toValue="0.0381" />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput).toHaveValue('1/8');

    fireEvent.change(fromInput, { target: { value: '3/16' } });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('3/16');

    // Test ArrowUp from fraction (1/8 = 0.125 -> steps to next integer 1)
    fireEvent.keyDown(fromInput, { key: 'ArrowUp' });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('1');
  });

  test('correctly resolves compound input like 5\'10" to full height without truncation to 5', () => {
    render(<ConversionCard {...defaultProps} fromUnitId="ft" toUnitId="cm" fromValue="5'10&quot;" toValue="177.8" />);
    const fromInput = screen.getByLabelText(/Enter value in/i);
    expect(fromInput).toHaveValue("5'10\"");

    // The hero equation should display the full 177.8 cm result, NOT 152.4 (which was the bug where 5 feet was taken)
    const copyBtn = screen.getByRole('button', { name: /Copy result/i });
    expect(copyBtn).toHaveTextContent('177.8');
  });

  test('calls onFromValueChange and onToValueChange on user input', () => {
    render(<ConversionCard {...defaultProps} />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.change(fromInput, { target: { value: '25' } });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('25');

    const toInput = screen.getByLabelText(/Converted value in/i);
    fireEvent.change(toInput, { target: { value: '82' } });
    expect(defaultProps.onToValueChange).toHaveBeenCalledWith('82');
  });

  test('clears from and to inputs when clear buttons or Escape key are pressed', () => {
    render(<ConversionCard {...defaultProps} />);

    const clearBtns = screen.getAllByLabelText(/Clear/i);
    expect(clearBtns.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(clearBtns[0]);
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('');

    fireEvent.click(clearBtns[1]);
    expect(defaultProps.onToValueChange).toHaveBeenCalledWith('');

    // Test Escape key
    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.keyDown(fromInput, { key: 'Escape' });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('');

    const toInput = screen.getByLabelText(/Converted value in/i);
    fireEvent.keyDown(toInput, { key: 'Escape' });
    expect(defaultProps.onToValueChange).toHaveBeenCalledWith('');
  });

  test('steps numbers up and down with ArrowUp and ArrowDown keys', () => {
    render(<ConversionCard {...defaultProps} fromValue="5" toValue="16.4" />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    fireEvent.keyDown(fromInput, { key: 'ArrowUp' });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('6');

    fireEvent.keyDown(fromInput, { key: 'ArrowDown' });
    expect(defaultProps.onFromValueChange).toHaveBeenCalledWith('4');

    const toInput = screen.getByLabelText(/Converted value in/i);
    fireEvent.keyDown(toInput, { key: 'ArrowUp' });
    expect(defaultProps.onToValueChange).toHaveBeenCalledWith('17');

    fireEvent.keyDown(toInput, { key: 'ArrowDown' });
    expect(defaultProps.onToValueChange).toHaveBeenCalledWith('16');
  });

  test('calls onSwap when swap button is clicked', () => {
    render(<ConversionCard {...defaultProps} />);

    const swapBtn = screen.getByRole('button', { name: /Swap from and to units/i });
    fireEvent.click(swapBtn);

    expect(defaultProps.onSwap).toHaveBeenCalledTimes(1);
  });

  test('opens From unit dropdown, filters units, and selects unit', () => {
    const handleFromUnitChange = jest.fn();
    render(<ConversionCard {...defaultProps} onFromUnitChange={handleFromUnitChange} />);

    const fromChip = screen.getByRole('button', { name: /Current unit: Meter/i });
    fireEvent.click(fromChip);

    expect(fromChip).toHaveAttribute('aria-expanded', 'true');
    const searchInput = screen.getByPlaceholderText('Search unit...');
    expect(searchInput).toBeInTheDocument();

    // Filter units
    fireEvent.change(searchInput, { target: { value: 'kilo' } });
    const kmItem = screen.getByText('Kilometers');
    expect(kmItem).toBeInTheDocument();

    fireEvent.click(kmItem);
    expect(handleFromUnitChange).toHaveBeenCalledWith('km');
    expect(fromChip).toHaveAttribute('aria-expanded', 'false');
  });

  test('opens To unit dropdown, navigates with keyboard Enter and Escape', () => {
    const handleToUnitChange = jest.fn();
    render(<ConversionCard {...defaultProps} onToUnitChange={handleToUnitChange} />);

    const toChip = screen.getByRole('button', { name: /Target unit: Foot/i });
    fireEvent.click(toChip);

    expect(toChip).toHaveAttribute('aria-expanded', 'true');
    const searchInput = screen.getByPlaceholderText('Search unit...');

    fireEvent.change(searchInput, { target: { value: 'inch' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(handleToUnitChange).toHaveBeenCalledWith('in');

    // Reopen and test Escape
    fireEvent.click(toChip);
    const searchInput2 = screen.getByPlaceholderText('Search unit...');
    fireEvent.keyDown(searchInput2, { key: 'Escape' });
    expect(toChip).toHaveAttribute('aria-expanded', 'false');
  });

  test('handles precision dropdown selection and native select change', () => {
    const handlePrecisionChange = jest.fn();
    render(<ConversionCard {...defaultProps} onPrecisionChange={handlePrecisionChange} />);

    const precisionBtn = screen.getByRole('button', { name: /Precision:/i });
    fireEvent.click(precisionBtn);

    const precisionListbox = screen.getByRole('listbox', { name: /Precision options/i });
    const twoDecimalsOpt = within(precisionListbox).getByRole('option', { name: /2 Decimals/i });
    fireEvent.click(twoDecimalsOpt);

    expect(handlePrecisionChange).toHaveBeenCalledWith('2');

    // Also verify native select change triggers onPrecisionChange
    const nativeSelect = screen.getByLabelText(/Decimal Precision and Formatting/i);
    fireEvent.change(nativeSelect, { target: { value: 'exact' } });
    expect(handlePrecisionChange).toHaveBeenCalledWith('exact');
  });

  test('copies hero result number to clipboard on click', () => {
    const handleCopy = jest.fn();
    render(<ConversionCard {...defaultProps} onCopy={handleCopy} />);

    const heroCopyBtn = screen.getByRole('button', { name: /Copy result number/i });
    fireEvent.click(heroCopyBtn);

    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  test('copies formula and instruction to clipboard on click', () => {
    const handleCopy = jest.fn();
    render(<ConversionCard {...defaultProps} onCopy={handleCopy} />);

    const formulaBtn = screen.getByRole('button', { name: /Conversion formula/i });
    fireEvent.click(formulaBtn);
    expect(handleCopy).toHaveBeenCalledTimes(1);

    const instructionBtn = screen.getByRole('button', { name: /Conversion instruction/i });
    fireEvent.click(instructionBtn);
    expect(handleCopy).toHaveBeenCalledTimes(2);
  });

  test('toggles favorite and share button clicks', () => {
    const handleToggleFav = jest.fn();
    const handleShare = jest.fn();
    render(
      <ConversionCard
        {...defaultProps}
        onToggleFavorite={handleToggleFav}
        onShare={handleShare}
      />
    );

    const favBtn = screen.getByRole('button', { name: /Add to favorites/i });
    fireEvent.click(favBtn);
    expect(handleToggleFav).toHaveBeenCalledTimes(1);

    const shareBtn = screen.getByRole('button', { name: /Share conversion link/i });
    fireEvent.click(shareBtn);
    expect(handleShare).toHaveBeenCalledTimes(1);
  });

  test('renders kitchen drawer measuring tools in lower section and allows copying', () => {
    const handleCopy = jest.fn();

    const { container } = render(
      <ConversionCard
        {...defaultProps}
        categoryId="flour_ap"
        fromUnitId="cup_us"
        toUnitId="g"
        fromValue="2"
        toValue="240"
        onCopy={handleCopy}
      />
    );

    expect(screen.getByText('Measuring Tools Needed')).toBeInTheDocument();

    const kitchenOutputBox = screen.getByRole('button', { name: /Kitchen measuring tools:/i });
    fireEvent.click(kitchenOutputBox);
    expect(handleCopy).toHaveBeenCalled();

    // Click individual kitchen tool pills
    const toolChips = container.querySelectorAll('.ct-kitchen-tool-chip');
    expect(toolChips.length).toBeGreaterThan(0);
    fireEvent.click(toolChips[0]);
    expect(handleCopy).toHaveBeenCalled();

    // Click equivalent pills
    const equivPills = container.querySelectorAll('.ct-kitchen-equiv-pill');
    expect(equivPills.length).toBe(5);
    equivPills.forEach((pill) => fireEvent.click(pill));
    expect(handleCopy).toHaveBeenCalledTimes(7);
  });

  test('clears search input inside unit dropdowns', () => {
    render(<ConversionCard {...defaultProps} />);

    // From dropdown search clear
    const fromChip = screen.getByRole('button', { name: /Current unit: Meter/i });
    fireEvent.click(fromChip);
    const searchFrom = screen.getByPlaceholderText('Search unit...');
    fireEvent.change(searchFrom, { target: { value: 'cent' } });
    expect(searchFrom).toHaveValue('cent');

    const clearSearchFrom = screen.getByRole('button', { name: /Clear search/i });
    fireEvent.click(clearSearchFrom);
    expect(searchFrom).toHaveValue('');

    // To dropdown search clear and unit selection click
    const toChip = screen.getByRole('button', { name: /Target unit: Foot/i });
    fireEvent.click(toChip);
    const searchTo = screen.getByPlaceholderText('Search unit...');
    fireEvent.change(searchTo, { target: { value: 'inch' } });
    expect(searchTo).toHaveValue('inch');

    const clearSearchTo = screen.getByRole('button', { name: /Clear search/i });
    fireEvent.click(clearSearchTo);
    expect(searchTo).toHaveValue('');

    // Click a unit in To dropdown
    const yardOpt = screen.getByRole('option', { name: /Yards/i });
    fireEvent.click(yardOpt);
    expect(defaultProps.onToUnitChange).toHaveBeenCalledWith('yd');
  });

  test('renders fuel reciprocal formula correctly', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="fuel"
        fromUnitId="l100km"
        toUnitId="mpg_us"
        fromValue="10"
        toValue="23.52"
      />
    );

    expect(screen.getByRole('button', { name: /^Conversion formula$/i })).toBeInTheDocument();
  });

  test('displays dynamic temperature badges for extreme boiling temperatures', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="temperature"
        fromUnitId="c"
        toUnitId="f"
        fromValue="100"
        toValue="212"
      />
    );

    expect(screen.getByText('Boiling Point')).toBeInTheDocument();
  });

  test('displays cryogenic badge for absolute zero temperatures', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="temperature"
        fromUnitId="k"
        toUnitId="c"
        fromValue="0"
        toValue="-273.15"
      />
    );

    expect(screen.getByText('Cryogenic Zone')).toBeInTheDocument();
  });

  test('displays supersonic hyperspace indicators when speed exceeds Mach 1', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="speed"
        fromUnitId="kmh"
        toUnitId="mph"
        fromValue="2000"
        toValue="1242.74"
      />
    );

    const swapBtn = screen.getByRole('button', { name: /Swap from and to units/i });
    expect(swapBtn.className).toContain('ct-swap-hyperspace');
  });

  test('isDesktopDevice helper checks device media queries', () => {
    expect(typeof isDesktopDevice()).toBe('boolean');
  });

  test('handles select focus event', () => {
    render(<ConversionCard {...defaultProps} />);

    const fromInput = screen.getByLabelText(/Enter value in/i);
    fromInput.select = jest.fn();

    fireEvent.focus(fromInput);
    expect(fromInput.select).toHaveBeenCalled();
  });

  test('formats unspaced compound 4ft5in cleanly in equation without unit duplication', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="length"
        fromUnitId="ft"
        toUnitId="in"
        fromValue="4ft5in"
        toValue="53"
      />
    );

    // Equation must render "4 ft 5 in" on the left and "53" on the right
    expect(screen.getByText('4 ft 5 in')).toBeInTheDocument();
    expect(screen.getByText('53')).toBeInTheDocument();
    // Must NOT have duplicated unit "4ft5in ft"
    expect(screen.queryByText(/4ft5in ft/i)).not.toBeInTheDocument();

    // From pod must not have warning
    const fromPod = screen.getByLabelText(/Enter value in/i).closest('.ct-unit-block');
    expect(fromPod).not.toHaveClass('ct-pod-warning');
  });

  test('displays gentle warning ring and micro-hint on invalid input 12..4', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="length"
        fromUnitId="m"
        toUnitId="ft"
        fromValue="12..4"
        toValue=""
      />
    );

    // Pod has warning accent
    const fromPod = screen.getByLabelText(/Enter value in/i).closest('.ct-unit-block');
    expect(fromPod).toHaveClass('ct-pod-warning');

    // Micro-hint is visible
    expect(screen.getByRole('alert')).toHaveTextContent(/Unrecognized format/i);

    // Hero equation does NOT claim "= 0 ft"
    expect(screen.queryByText(/= 0 ft/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Enter a valid number or expression/i)).toBeInTheDocument();

    // To input placeholder shows dash
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput).toHaveAttribute('placeholder', '—');
  });

  test('handles pending typing like 5/ without triggering error state', () => {
    render(
      <ConversionCard
        {...defaultProps}
        categoryId="length"
        fromUnitId="m"
        toUnitId="ft"
        fromValue="5/"
        toValue=""
      />
    );

    // Pod does NOT have warning
    const fromPod = screen.getByLabelText(/Enter value in/i).closest('.ct-unit-block');
    expect(fromPod).not.toHaveClass('ct-pod-warning');

    // No alert micro-hint
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Placeholder is a dash
    const toInput = screen.getByLabelText(/Converted value in/i);
    expect(toInput).toHaveAttribute('placeholder', '—');
  });

  test('renders progressive disclosure toggle for specialized units and expands on click', () => {
    render(<ConversionCard {...defaultProps} categoryId="mass" fromUnitId="kg" toUnitId="lb" />);

    const fromChip = screen.getByRole('button', { name: /Current unit: Kilogram/i });
    fireEvent.click(fromChip);

    // Common units should be immediately visible
    expect(screen.getByText('Pounds')).toBeInTheDocument();

    // Toggle for specialized units should be rendered
    const toggleBtn = screen.getByRole('button', { name: /Show specialized and trade units/i });
    expect(toggleBtn).toBeInTheDocument();

    // Before clicking expand, specialized unit like Carats is not in document
    expect(screen.queryByText('Carats')).not.toBeInTheDocument();

    // Click to expand specialized units
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Carats')).toBeInTheDocument();
    expect(screen.getByText('Grains')).toBeInTheDocument();

    // Click hide button to collapse
    const hideBtn = screen.getByRole('button', { name: /Hide specialized units/i });
    fireEvent.click(hideBtn);
    expect(screen.queryByText('Carats')).not.toBeInTheDocument();
  });
});
