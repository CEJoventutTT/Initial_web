// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        // Brand tokens
        brand: {
          teal: '#5D8C87',    // superficies / elementos “calm”
          dark: '#262425',    // fondo principal
          red:  '#BF0F30',    // CTA / acentos
          green:'#6BBFA0',    // nuevo color para gradientes
          white:'#FFFFFF',
        },

        // Semánticos (usados por shadcn/ui)
        background: '#262425',
        foreground: '#FFFFFF',
        border: '#343233',
        input:  '#343233',
        ring:   '#6BBFA0',  // Antes rojo, ahora verde para los focos

        primary: {
          DEFAULT: '#BF0F30',   // CTA rojo
          foreground: '#FFFFFF'
        },
        secondary: {
          DEFAULT: '#5D8C87',   // botón secundario / chips
          foreground: '#262425'
        },
        accent: {
          DEFAULT: '#6BBFA0',   // ahora verde para acentos
          foreground: '#262425'
        },
        muted: {
          DEFAULT: '#2B292A',
          foreground: '#CFCFCF'
        },
        popover: {
          DEFAULT: '#262425',
          foreground: '#FFFFFF'
        },
        card: {
          DEFAULT: '#262425',
          foreground: '#FFFFFF'
        },
      },
      boxShadow: {
        brand: '0 10px 30px -10px rgba(107,191,160,.35)', // glow verde para CTA
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.6rem',
        sm: '0.45rem',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
