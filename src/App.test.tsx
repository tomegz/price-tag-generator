import { render, screen } from '@testing-library/react';
import App from './App';

it('renders login screen without crashing', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: /Zaloguj się/i })).toBeInTheDocument();
});
