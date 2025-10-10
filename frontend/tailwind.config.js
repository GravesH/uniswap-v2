// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff4ecd',
          purple: '#8b5cf6',
          blue: '#22d3ee',
          cyan: '#06b6d4',
          lime: '#a3e635',
        },
      },
      boxShadow: {
        neon: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(34, 211, 238, 0.35)',
        neonSoft: '0 0 12px rgba(139, 92, 246, 0.35)',
      },
      backgroundImage: {
        'grid-radial': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        'neon-gradient': 'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
      },
      animation: {
        'gradient-x': 'gradient-x 6s ease infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

export default config;