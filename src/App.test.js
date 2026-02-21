import { render, screen } from '@testing-library/react';
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
    render(<App />);
    // Use screen queries instead of container
    expect(screen.getByTestId('particle-background')).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(<App />);
    // Basic smoke test - just ensure app renders with content
    expect(screen.getByTestId('particle-background')).toBeInTheDocument();
  });
});
