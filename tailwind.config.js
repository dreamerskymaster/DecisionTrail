/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eefbf4', 100: '#d6f5e4', 200: '#b0eacd',
          300: '#7ddab0', 400: '#48c38e', 500: '#25a974',
          600: '#18895d', 700: '#146e4d', 800: '#13573e',
          900: '#114835', 950: '#06281e',
        },
        surface: {
          0: '#0a0f14', 1: '#0f1920', 2: '#15222c',
          3: '#1b2c38', 4: '#213644', 5: '#2a4256',
        },
        text: {
          primary: '#e8edf2', secondary: '#8fa3b8',
          tertiary: '#5e7a91', muted: '#3d5568',
        },
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-ring': { '0%': { transform: 'scale(0.8)', opacity: '0.5' }, '50%': { transform: 'scale(1)', opacity: '0.2' }, '100%': { transform: 'scale(1.2)', opacity: '0' } },
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-ring': 'pulse-ring 2s infinite',
      },
    },
  },
  plugins: [],
};
