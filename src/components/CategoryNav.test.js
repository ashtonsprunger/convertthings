import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryNav } from './CategoryNav';
import { CATEGORIES } from '../engine/conversions';
import { KITCHEN_CATEGORIES } from '../engine/kitchenDataset';

describe('CategoryNav Component', () => {
  const defaultProps = {
    categories: CATEGORIES,
    activeCategoryId: 'length',
    onSelectCategory: jest.fn(),
    isKitchenStudio: false,
    activeIngredientId: 'flour_ap',
    onSelectKitchenStaple: jest.fn(),
    onExitKitchenStudio: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders standard engineering categories in default mode', () => {
    render(<CategoryNav {...defaultProps} />);

    expect(screen.getByText('Length & Distance')).toBeInTheDocument();
    expect(screen.getByText('Weight & Mass')).toBeInTheDocument();
    expect(screen.getByText(`All (${CATEGORIES.length})`)).toBeInTheDocument();
  });

  test('clicking a standard category tab calls onSelectCategory', () => {
    render(<CategoryNav {...defaultProps} />);

    const massTab = screen.getByRole('tab', { name: /Weight & Mass/i });
    fireEvent.click(massTab);
    expect(defaultProps.onSelectCategory).toHaveBeenCalledWith('mass');
  });

  test('renders pinned escape hatch and kitchen staples in Kitchen Studio mode', () => {
    render(
      <CategoryNav
        {...defaultProps}
        isKitchenStudio={true}
        categories={KITCHEN_CATEGORIES}
        activeIngredientId="flour_ap"
      />
    );

    // Pinned escape hatch
    expect(screen.getByText('All Converters')).toBeInTheDocument();
    const exitBtn = screen.getByRole('tab', { name: /All Converters/i });
    fireEvent.click(exitBtn);
    expect(defaultProps.onExitKitchenStudio).toHaveBeenCalled();

    // Baking staples
    expect(screen.getByText('Flour (AP)')).toBeInTheDocument();
    expect(screen.getByText('White Sugar')).toBeInTheDocument();
    expect(screen.getByText('Butter')).toBeInTheDocument();
    expect(screen.getByText(`All (${KITCHEN_CATEGORIES.length})`)).toBeInTheDocument();
  });

  test('expanding shelf in Kitchen Studio keeps pantry staples and does NOT leak physics domains', () => {
    render(
      <CategoryNav
        {...defaultProps}
        isKitchenStudio={true}
        categories={KITCHEN_CATEGORIES}
        activeIngredientId="flour_ap"
      />
    );

    const expandBtn = screen.getByRole('button', { name: /View all/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Show less')).toBeInTheDocument();

    // Still contains pantry staples
    expect(screen.getByText('Flour (AP)')).toBeInTheDocument();
    expect(screen.getByText('Butter')).toBeInTheDocument();
    expect(screen.getByText('All Converters')).toBeInTheDocument();

    // Does NOT leak engineering categories
    expect(screen.queryByText('Length & Distance')).not.toBeInTheDocument();
    expect(screen.queryByText('Volumetric Flow Rate')).not.toBeInTheDocument();
  });

  test('clicking a staple in expanded kitchen view calls onSelectKitchenStaple and collapses', () => {
    render(
      <CategoryNav
        {...defaultProps}
        isKitchenStudio={true}
        categories={KITCHEN_CATEGORIES}
        activeIngredientId="flour_ap"
      />
    );

    const expandBtn = screen.getByRole('button', { name: /View all/i });
    fireEvent.click(expandBtn);

    const butterTab = screen.getByRole('tab', { name: /Butter/i });
    fireEvent.click(butterTab);

    expect(defaultProps.onSelectKitchenStaple).toHaveBeenCalled();
    expect(screen.queryByText('Show less')).not.toBeInTheDocument();
  });
});
