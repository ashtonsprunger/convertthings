import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversionTable } from './ConversionTable';

describe('ConversionTable Component', () => {
  const defaultProps = {
    categoryId: 'mass',
    fromUnitId: 'kg',
    toUnitId: 'lb',
    fromValue: '1',
    onSelectTargetUnit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders benchmark reference table with from and to units', () => {
    render(<ConversionTable {...defaultProps} />);

    expect(screen.getByText('Reference & Equivalence')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Reference Table/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /All .* Conversions/i })).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText(/Kilograms \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Pounds \(lb\)/i)).toBeInTheDocument();
  });

  test('switches to All Units tab and toggles specialized unit filtering', () => {
    render(<ConversionTable {...defaultProps} />);

    const allUnitsTab = screen.getByRole('tab', { name: /All .* Conversions/i });
    fireEvent.click(allUnitsTab);

    // Common units should be displayed
    expect(screen.getByText('Pounds')).toBeInTheDocument();
    expect(screen.getByText('Grams')).toBeInTheDocument();

    // In default Common view, specialized units like Carats are filtered out
    expect(screen.queryByText('Carats')).not.toBeInTheDocument();

    // Filter pills should be visible
    const allUnitsPill = screen.getByRole('button', { name: /All Units/i });
    expect(allUnitsPill).toBeInTheDocument();

    // Switch to All Units pill
    fireEvent.click(allUnitsPill);
    expect(screen.getByText('Carats')).toBeInTheDocument();
    expect(screen.getByText('Grains')).toBeInTheDocument();

    // Switch back to Common Units pill
    const commonPill = screen.getByRole('button', { name: /Common Units/i });
    fireEvent.click(commonPill);
    expect(screen.queryByText('Carats')).not.toBeInTheDocument();
  });

  test('calls onSelectTargetUnit when a target unit card is clicked', () => {
    const handleSelectTargetUnit = jest.fn();
    render(<ConversionTable {...defaultProps} onSelectTargetUnit={handleSelectTargetUnit} />);

    const allUnitsTab = screen.getByRole('tab', { name: /All .* Conversions/i });
    fireEvent.click(allUnitsTab);

    const gramCard = screen.getByTitle(/Convert Kilograms to Grams/i);
    fireEvent.click(gramCard);

    expect(handleSelectTargetUnit).toHaveBeenCalledWith('g');
  });

  test('renders specialized Human Height Chart when hubId is feet-inches-to-cm', () => {
    render(
      <ConversionTable
        categoryId="length"
        fromUnitId="ft"
        toUnitId="cm"
        fromValue="5 ft 10 in"
        hubId="feet-inches-to-cm"
        onSelectTargetUnit={jest.fn()}
      />
    );

    expect(screen.getByText('Human Height Conversion Chart')).toBeInTheDocument();
    expect(screen.getByText("4' 10\"")).toBeInTheDocument();
    expect(screen.getByText("5' 10\"")).toBeInTheDocument();
    expect(screen.getByText("6' 0\"")).toBeInTheDocument();
    expect(screen.getByText('177.8 cm')).toBeInTheDocument();
  });

  test('renders specialized Tape Measure Chart when hubId is fraction-inches-to-mm', () => {
    render(
      <ConversionTable
        categoryId="length"
        fromUnitId="in"
        toUnitId="mm"
        fromValue="13/16"
        hubId="fraction-inches-to-mm"
        onSelectTargetUnit={jest.fn()}
      />
    );

    expect(screen.getByText('Tape Measure Fractions to Millimeters')).toBeInTheDocument();
    expect(screen.getByText('20.6375 mm')).toBeInTheDocument();
  });

  test('renders specialized Baking Equivalents Chart when hubId is baking-fractions', () => {
    render(
      <ConversionTable
        categoryId="cooking"
        fromUnitId="cup_us"
        toUnitId="tbsp_us"
        fromValue="1/3"
        hubId="baking-fractions"
        onSelectTargetUnit={jest.fn()}
      />
    );

    expect(screen.getByText('Baking & Kitchen Drawer Equivalents')).toBeInTheDocument();
    expect(screen.getByText('5 tbsp + 1 tsp')).toBeInTheDocument();
  });
});
