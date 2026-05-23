/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.25s ease-out',
      },
      keyframes: {
        'slide-up': { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
