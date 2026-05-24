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
      colors: {
        // Semantic theme tokens, theme-aware via CSS variables
        bg: {
          primary: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
        line: {
          DEFAULT: 'var(--line)',
          strong: 'var(--line-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          muted: 'var(--accent-muted)',
        },
        interactive: {
          DEFAULT: 'var(--interactive)',
          light: 'var(--interactive-light)',
        },
        warn: {
          DEFAULT: 'var(--warn)',
          light: 'var(--warn-light)',
        },
        // Legacy aliases kept so existing component classes resolve
        brand: {
          300: 'var(--accent)',
          400: 'var(--accent)',
          500: 'var(--accent)',
          600: 'var(--accent)',
        },
        surface: {
          1: 'var(--bg-primary)',
          2: 'var(--bg-surface)',
          3: 'var(--bg-elevated)',
          4: 'var(--line)',
        },
        text: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          tertiary: 'var(--fg-secondary)',
          muted: 'var(--fg-muted)',
        },
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
