/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: '#0B0D12',
          panel: '#11151E',
          card: '#171D29',
          cardHover: '#1D2534',
          cardElevated: '#1E2638',
          border: '#232B3E',
          borderHover: '#333E56',
          borderSubtle: '#1C2333',
          darkest: '#080A0E',
          base: '#0B0D12',
          surface: '#11151E'
        },
        brand: {
          50: '#F0EFFF',
          100: '#E2E0FF',
          200: '#C7C4FF',
          300: '#A4A0FF',
          400: '#8680FF',
          500: '#6C63FF',
          600: '#5A50E5',
          700: '#483ECC',
          800: '#3830A3',
          900: '#2A247A',
          glow: 'rgba(108, 99, 255, 0.25)'
        },
        cyan: {
          300: '#67E8F9',
          400: '#25D9F2',
          500: '#06B6D4',
          600: '#0891B2',
          glow: 'rgba(37, 217, 242, 0.25)'
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'glow-brand': '0 0 20px -3px rgba(108, 99, 255, 0.3)',
        'glow-cyan': '0 0 20px -3px rgba(37, 217, 242, 0.3)',
        'panel': '0 4px 24px -2px rgba(0, 0, 0, 0.55)',
        'dropdown': '0 10px 30px -4px rgba(0, 0, 0, 0.65), 0 4px 10px -2px rgba(0, 0, 0, 0.4)'
      }
    },
  },
  plugins: [],
}
