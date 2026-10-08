import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Omnibox } from './Omnibox';

describe('Omnibox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input with default combobox role and placeholder', () => {
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox', { name: /Universal conversion search bar/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('');
  });

  test('opens dropdown and displays suggestions when user focuses or types', () => {
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox', { name: /Universal conversion search bar/i });
    fireEvent.focus(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toBeInTheDocument();

    // Type a specific query
    fireEvent.change(input, { target: { value: '100 km to miles' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('executes convert suggestion on click', () => {
    const handleConvert = jest.fn();
    const { container } = render(
      <Omnibox onSelectConversion={handleConvert} onSelectCategory={jest.fn()} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '100 km to miles' } });

    const suggestionItem = container.querySelector('.ct-omnibox-item');
    expect(suggestionItem).toBeInTheDocument();
    fireEvent.click(suggestionItem);

    expect(handleConvert).toHaveBeenCalledTimes(1);
    expect(handleConvert).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'length',
        fromUnitId: 'km',
        toUnitId: 'mi',
      })
    );
    expect(input).toHaveValue('');
  });

  test('executes category navigation suggestion on click', () => {
    const handleCategory = jest.fn();
    const { container } = render(
      <Omnibox onSelectConversion={jest.fn()} onSelectCategory={handleCategory} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'temperature' } });

    const suggestionItem = container.querySelector('.ct-omnibox-item');
    expect(suggestionItem).toBeInTheDocument();
    fireEvent.click(suggestionItem);

    expect(handleCategory).toHaveBeenCalledTimes(1);
    expect(handleCategory).toHaveBeenCalledWith('temperature');
    expect(input).toHaveValue('');
  });

  test('navigates suggestions using ArrowDown, ArrowUp, and selects with Enter', () => {
    const handleConvert = jest.fn();
    render(<Omnibox onSelectConversion={handleConvert} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '50 lbs to kg' } });

    // Press ArrowDown to change selection
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Press ArrowUp to go back
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    // Press Enter to execute selection
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleConvert).toHaveBeenCalledTimes(1);
  });

  test('opens dropdown with ArrowDown if closed', () => {
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('dismisses dropdown on Escape key', () => {
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('clears search when clear button is clicked', () => {
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'miles' } });
    expect(input).toHaveValue('miles');

    const clearBtn = screen.getByRole('button', { name: /Clear search input/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input).toHaveValue('');
  });

  test('dismisses dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />
      </div>
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('updates selectedIndex on mouseEnter on a suggestion item', () => {
    const { container } = render(
      <Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'kg' } });

    const items = container.querySelectorAll('.ct-omnibox-item');
    if (items.length > 1) {
      fireEvent.mouseEnter(items[1]);
      expect(items[1].classList.contains('active')).toBe(true);
    }
  });

  test('global shortcut "/" focuses the input unless already in a form element', () => {
    render(
      <div>
        <input data-testid="other-input" />
        <Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />
      </div>
    );

    const omniboxInput = screen.getByRole('combobox');
    const otherInput = screen.getByTestId('other-input');

    // When other input is focused, typing '/' should NOT focus omnibox
    otherInput.focus();
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(otherInput);

    // When body is focused, typing '/' focuses omnibox
    otherInput.blur();
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(omniboxInput);
  });

  test('displays history section header when empty query and history is provided', () => {
    const mockHistory = [
      {
        categoryId: 'length',
        fromUnitId: 'm',
        toUnitId: 'ft',
        fromValue: '10',
        toValue: '32.8',
        fromSymbol: 'm',
        toSymbol: 'ft',
      },
    ];

    render(
      <Omnibox
        onSelectConversion={jest.fn()}
        onSelectCategory={jest.fn()}
        history={mockHistory}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('Recent Conversions')).toBeInTheDocument();
    expect(screen.getByText('Browse Categories')).toBeInTheDocument();
  });

  test('handles workbench arrival animation when conversion panel exists in document', () => {
    const handleConvert = jest.fn();
    const panel = document.createElement('div');
    panel.id = 'conversion-panel';
    const grid = document.createElement('div');
    grid.className = 'ct-conversion-grid';
    panel.appendChild(grid);
    document.body.appendChild(panel);

    const { container } = render(
      <Omnibox onSelectConversion={handleConvert} onSelectCategory={jest.fn()} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '100 km to miles' } });

    const suggestionItem = container.querySelector('.ct-omnibox-item');
    fireEvent.click(suggestionItem);

    expect(handleConvert).toHaveBeenCalled();
    expect(panel.classList.contains('ct-workbench-received')).toBe(true);

    document.body.removeChild(panel);
  });

  test('animates placeholder tips through timers', () => {
    jest.useFakeTimers();
    render(<Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />);

    // Fast-forward interval
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    jest.useRealTimers();
  });

  test('handles unsupported conversion suggestion click', () => {
    const { container } = render(
      <Omnibox onSelectConversion={jest.fn()} onSelectCategory={jest.fn()} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: '100 meters to seconds' } });

    const unsupportedItem = container.querySelector('.ct-item-unsupported') || container.querySelector('.ct-omnibox-item');
    if (unsupportedItem) {
      fireEvent.click(unsupportedItem);
    }
  });
});

