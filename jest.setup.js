const React = require('react');
require('@testing-library/jest-dom');

// Mock next/link for consistent testing across all test files
jest.mock('next/link', () => {
  return function Link({ href, children, ...props }) {
    return React.createElement('a', { href, ...props }, children);
  };
});