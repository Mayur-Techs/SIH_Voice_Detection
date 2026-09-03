import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#050509',
        surface: '#0C0C14',
        border:  '#1A1A2E',
        accent:  '#00E5FF',
        'accent-dim': '#0097a7',
        'risk-low':        '#00FF87',
        'risk-suspicious': '#FFB800',
        'risk-high':       '#FF2D55',
        'text-primary':   '#F0F0FF',
        'text-secondary': '#6B7A99',
      },
      fontFamily: {
        ui:      ['Inter', 'system-ui', 'sans-serif'],
        data:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        marathi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        glow:        '0 0 20px rgba(0,229,255,0.3), 0 0 40px rgba(0,229,255,0.1)',
        'glow-low':  '0 0 20px rgba(0,255,135,0.4)',
        'glow-susp': '0 0 20px rgba(255,184,0,0.4)',
        'glow-high': '0 0 25px rgba(255,45,85,0.5)',
      },
      backgroundImage: {
        'grid-dark': "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-dark': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
