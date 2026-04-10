import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b32008',
          container: '#d73b21',
        },
        secondary: {
          DEFAULT: '#904d00',
          container: '#fd8b00',
        },
        tertiary: {
          DEFAULT: '#006389',
          container: '#007dac',
        },
        surface: {
          DEFAULT: '#fcf9f8',
          'container-low': '#f6f3f2',
          container: '#f0eded',
          'container-high': '#eae7e7',
        },
        'on-surface': {
          DEFAULT: '#1c1b1b',
          variant: '#5b403b',
        },
        outline: {
          DEFAULT: '#8f706a',
          variant: '#e4beb7',
        },
        error: '#ba1a1a',
      },
      fontFamily: {
        heading: ['var(--font-manrope)', 'Manrope', 'sans-serif'],
        body: ['var(--font-be-vietnam-pro)', 'Be Vietnam Pro', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
