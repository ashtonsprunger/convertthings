import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryNav } from './CategoryNav';
import { CATEGORIES } from '../engine/conversions';

describe('CategoryNav Component', () => {
  const defaultProps = {
    categories: CATEGORIES,
    activeCategoryId: 'length',
    onSelectCategory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders standard engineering and culinary categories', () => {
    render(<CategoryNav {...defaultProps} />);

    expect(screen.getByText('Length & Distance')).toBeInTheDocument();
    expect(screen.getByText('Weight & Mass')).toBeInTheDocument();
    expect(screen.getByText('Kitchen & Cooking')).toBeInTheDocument();
    expect(screen.getByText(`All (${CATEGORIES.length})`)).toBeInTheDocument();
  });

  test('clicking a category tab calls onSelectCategory', () => {
    render(<CategoryNav {...defaultProps} />);

    const massTab = screen.getByRole('tab', { name: /Weight & Mass/i });
    fireEvent.click(massTab);
    expect(defaultProps.onSelectCategory).toHaveBeenCalledWith('mass');
  });

  test('expanding shelf reveals all categories and collapses when selecting a category', () => {
    render(<CategoryNav {...defaultProps} />);

    const expandBtn = screen.getByRole('button', { name: /View all/i });
    fireEvent.click(expandBtn);

    expect(screen.queryByRole('button', { name: /View all/i })).not.toBeInTheDocument();

    const cookingTab = screen.getByRole('tab', { name: /Kitchen & Cooking/i });
    fireEvent.click(cookingTab);

    expect(defaultProps.onSelectCategory).toHaveBeenCalledWith('cooking');
    expect(screen.getByRole('button', { name: /View all/i })).toBeInTheDocument();
  });
});
