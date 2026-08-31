/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F172A', // Slate 900
        surface: {
          DEFAULT: '#1E293B', // Slate 800
          hover: '#334155',   // Slate 700
          border: '#334155',
          card: 'rgba(30, 41, 59, 0.75)',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: 'rgba(37, 99, 235, 0.15)',
        },
        success: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          light: 'rgba(34, 197, 94, 0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: 'rgba(245, 158, 11, 0.15)',
        },
        danger: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: 'rgba(239, 68, 68, 0.15)',
        },
        accent: {
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.35)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.35)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
