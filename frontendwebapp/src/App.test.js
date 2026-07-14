import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

jest.mock('axios', () => {
  const client = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  return {
    create: jest.fn(() => client),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };
});

test('renders admin login', () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const container = document.createElement('div');
  document.body.appendChild(container);

  act(() => {
    createRoot(container).render(<App />);
  });

  expect(container.textContent).toMatch(/Admin Login/);
});
