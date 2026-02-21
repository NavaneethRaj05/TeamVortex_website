import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  test('renders navigation', () => {
    const { container } = render(<App />);
    // Basic smoke test - just ensure app renders
    expect(container.firstChild).toBeTruthy();
  });
});
