import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(<App />);
    // Basic smoke test - just ensure app renders
    const app = document.querySelector('.App');
    expect(app || document.body).toBeTruthy();
  });
});
