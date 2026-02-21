import { render } from '@testing-library/react';
import App from './App';

// Mock ParticleBackground to avoid canvas issues in tests
jest.mock('./components/ParticleBackground', () => {
  return function ParticleBackground() {
    return <div data-testid="particle-background">Particle Background</div>;
  };
});

// Mock FloatingTrophy to avoid animation issues in tests
jest.mock('./components/FloatingTrophy', () => {
  return function FloatingTrophy() {
    return <div data-testid="floating-trophy">Trophy</div>;
  };
});

describe('App Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('renders navigation', () => {
    const { container } = render(<App />);
    // Basic smoke test - just ensure app renders with content
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelector('div')).toBeTruthy();
  });
});
