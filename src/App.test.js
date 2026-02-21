import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // Check if the app renders with basic structure (navigation)
    expect(screen.getAllByText('TEAM VORTEX')[0]).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(<App />);
    // Check if navigation links are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });
});
