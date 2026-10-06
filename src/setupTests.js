// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock navigator.clipboard
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockImplementation(() => Promise.resolve()),
    },
    configurable: true,
  });
} else if (!navigator.clipboard.writeText) {
  navigator.clipboard.writeText = jest.fn().mockImplementation(() => Promise.resolve());
}

// Mock window.scrollTo
window.scrollTo = jest.fn();
