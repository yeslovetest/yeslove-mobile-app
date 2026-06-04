import { render, screen } from '@testing-library/react';
import App from './App';

test('renders admin login', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /admin login/i });
  expect(heading).toBeInTheDocument();
});
