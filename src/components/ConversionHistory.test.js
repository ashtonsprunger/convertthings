import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionHistory } from './ConversionHistory';

describe('ConversionHistory Component', () => {
  const mockHistory = [
    {
      categoryId: 'length',
      categoryName: 'Length & Distance',
      fromUnitId: 'm',
      toUnitId: 'ft',
      fromValue: '1',
      toValue: '3.28084',
      fromSymbol: 'm',
      toSymbol: 'ft',
      timestamp: 1000,
    },
    {
      categoryId: 'temperature',
      categoryName: 'Temperature',
      fromUnitId: 'c',
      toUnitId: 'f',
      fromValue: '100',
      toValue: '212',
      fromSymbol: '°C',
      toSymbol: '°F',
      timestamp: 2000,
    },
  ];

  test('returns null when history is empty or null', () => {
    const { container: c1 } = render(
      <ConversionHistory history={[]} onSelectHistory={jest.fn()} onClearHistory={jest.fn()} />
    );
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(
      <ConversionHistory history={null} onSelectHistory={jest.fn()} onClearHistory={jest.fn()} />
    );
    expect(c2).toBeEmptyDOMElement();
  });

  test('renders toggle button with item count', () => {
    render(
      <ConversionHistory history={mockHistory} onSelectHistory={jest.fn()} onClearHistory={jest.fn()} />
    );

    const toggleBtn = screen.getByRole('button', { name: /Recent Conversions \(2\)/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('toggles drawer open to reveal history items displaying category icon instead of category name', () => {
    render(
      <ConversionHistory history={mockHistory} onSelectHistory={jest.fn()} onClearHistory={jest.fn()} />
    );

    const toggleBtn = screen.getByRole('button', { name: /Recent Conversions \(2\)/i });
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    // Section should show the calculations
    expect(screen.getByText('1 m')).toBeInTheDocument();
    expect(screen.getByText('3.28084 ft')).toBeInTheDocument();
    expect(screen.getByText('100 °C')).toBeInTheDocument();
    expect(screen.getByText('212 °F')).toBeInTheDocument();

    // Crucial check: category name text should NOT be rendered in the document
    expect(screen.queryByText('Length & Distance')).not.toBeInTheDocument();
    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();

    // Instead, category icon badges with accessibility title and aria-label must be present
    const lengthIconBadge = screen.getByTitle('Length & Distance');
    expect(lengthIconBadge).toBeInTheDocument();
    expect(lengthIconBadge).toHaveAttribute('aria-label', 'Length & Distance');
    expect(lengthIconBadge.querySelector('svg')).toBeInTheDocument();

    const tempIconBadge = screen.getByTitle('Temperature');
    expect(tempIconBadge).toBeInTheDocument();
    expect(tempIconBadge).toHaveAttribute('aria-label', 'Temperature');
    expect(tempIconBadge.querySelector('svg')).toBeInTheDocument();
  });

  test('calls onSelectHistory when an item is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <ConversionHistory history={mockHistory} onSelectHistory={handleSelect} onClearHistory={jest.fn()} />
    );

    const toggleBtn = screen.getByRole('button', { name: /Recent Conversions \(2\)/i });
    fireEvent.click(toggleBtn);

    const lengthItem = screen.getByText('1 m').closest('button');
    fireEvent.click(lengthItem);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockHistory[0]);
  });

  test('calls onClearHistory when Clear button is clicked', () => {
    const handleClear = jest.fn();
    render(
      <ConversionHistory history={mockHistory} onSelectHistory={jest.fn()} onClearHistory={handleClear} />
    );

    const toggleBtn = screen.getByRole('button', { name: /Recent Conversions \(2\)/i });
    fireEvent.click(toggleBtn);

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
