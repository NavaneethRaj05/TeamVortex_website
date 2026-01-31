module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vortex-blue': '#00D4FF',
        'vortex-orange': '#FF6B35',
        'dark-bg': '#0A0A0A',
        'dark-card': 'rgba(255, 255, 255, 0.05)',
        'dark-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Montserrat', 'system-ui', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}