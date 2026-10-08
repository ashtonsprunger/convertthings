import React from 'react';
import { render, screen } from '@testing-library/react';
import { Fraction } from './Fraction';

describe('Typographic Fraction Component (<Fraction />)', () => {
  test('renders null when given empty, null, or undefined value', () => {
    const { container: c1 } = render(<Fraction value={null} />);
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(<Fraction value="" />);
    expect(c2).toBeEmptyDOMElement();

    const { container: c3 } = render(<Fraction value={undefined} />);
    expect(c3).toBeEmptyDOMElement();
  });

  test('fast path: renders plain numbers and text directly', () => {
    const { container: c1 } = render(<Fraction value="0.07874" />);
    expect(c1).toHaveTextContent('0.07874');
    expect(c1.querySelector('.ct-frac')).not.toBeInTheDocument();

    const { container: c2 } = render(<Fraction value={42} />);
    expect(c2).toHaveTextContent('42');
    expect(c2.querySelector('.ct-frac')).not.toBeInTheDocument();

    const { container: c3 } = render(<Fraction value="1h 23m 20s" />);
    expect(c3).toHaveTextContent('1h 23m 20s');
    expect(c3.querySelector('.ct-frac')).not.toBeInTheDocument();
  });

  test('renders simple standalone fractions with num, slash, and den elements', () => {
    const { container } = render(<Fraction value="1/32" />);
    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac).toHaveAttribute('aria-label', '1/32');

    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('1');
    expect(frac.querySelector('.ct-frac-slash')).toHaveTextContent('/');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('32');
  });

  test('normalizes Unicode vulgar fractions to consistent typographic .ct-frac elements', () => {
    const { container } = render(<Fraction value="¾ cup" />);
    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac).toHaveAttribute('aria-label', '3/4');
    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('3');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('4');
    expect(container).toHaveTextContent('3/4 cup');
  });

  test('renders mixed fractions cleanly with whole number and fraction segment', () => {
    const { container } = render(<Fraction value="3 3/8" />);
    expect(container.querySelector('.ct-frac-text')).toHaveTextContent('3');
    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('3');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('8');
  });

  test('renders tape measure landmark with offset (e.g. 1/8 -1/32)', () => {
    const { container } = render(<Fraction value="1/8 -1/32" />);
    const fractions = container.querySelectorAll('.ct-frac');
    expect(fractions).toHaveLength(2);

    // Landmark 1/8
    expect(fractions[0].querySelector('.ct-frac-num')).toHaveTextContent('1');
    expect(fractions[0].querySelector('.ct-frac-den')).toHaveTextContent('8');

    // Operator −
    const op = container.querySelector('.ct-frac-op');
    expect(op).toBeInTheDocument();
    expect(op).toHaveTextContent('−');

    // Offset 1/32
    expect(fractions[1].querySelector('.ct-frac-num')).toHaveTextContent('1');
    expect(fractions[1].querySelector('.ct-frac-den')).toHaveTextContent('32');
  });

  test('renders tape measure whole + fraction + positive offset (e.g. 3 3/8 +1/32)', () => {
    const { container } = render(<Fraction value="3 3/8 +1/32" />);
    expect(container.querySelector('.ct-frac-text')).toHaveTextContent('3');

    const fractions = container.querySelectorAll('.ct-frac');
    expect(fractions).toHaveLength(2);
    expect(fractions[0].querySelector('.ct-frac-den')).toHaveTextContent('8');
    expect(fractions[1].querySelector('.ct-frac-den')).toHaveTextContent('32');

    const op = container.querySelector('.ct-frac-op');
    expect(op).toHaveTextContent('+');
  });

  test('renders whole number + offset (e.g. 4 -1/32)', () => {
    const { container } = render(<Fraction value="4 -1/32" />);
    expect(container.querySelector('.ct-frac-text')).toHaveTextContent('4');

    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('1');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('32');

    const op = container.querySelector('.ct-frac-op');
    expect(op).toHaveTextContent('−');
  });

  test('renders compound architectural foot-inch format (e.g. 5 ft 3 3/8 in)', () => {
    const { container } = render(<Fraction value="5 ft 3 3/8 in" />);
    expect(container).toHaveTextContent(/5 ft 3/);
    expect(container).toHaveTextContent(/in/);

    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('3');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('8');
  });

  test('supports direct explicit props <Fraction num={1} den={8} whole={2} />', () => {
    const { container } = render(<Fraction whole={2} num={1} den={8} />);
    expect(container.querySelector('.ct-frac-text')).toHaveTextContent('2');
    const frac = container.querySelector('.ct-frac');
    expect(frac).toBeInTheDocument();
    expect(frac.querySelector('.ct-frac-num')).toHaveTextContent('1');
    expect(frac.querySelector('.ct-frac-den')).toHaveTextContent('8');
  });
});
