import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Sanctuary palette
        ivory: {
          DEFAULT: '#FAF7F2',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FAF7F2',
          300: '#F2EDE3',
          400: '#E6DECF',
          500: '#D6CBB5',
        },
        navy: {
          DEFAULT: '#0E2A47',
          50: '#E8EDF3',
          100: '#C7D2E0',
          200: '#8FA4BF',
          300: '#577699',
          400: '#2B4A70',
          500: '#0E2A47',
          600: '#0B2239',
          700: '#081A2B',
          800: '#06121E',
          900: '#030911',
        },
        gold: {
          DEFAULT: '#C9A96E',
          50: '#FBF6EC',
          100: '#F4E8CE',
          200: '#E9D2A0',
          300: '#DDBC7F',
          400: '#D3B074',
          500: '#C9A96E',
          600: '#A88955',
          700: '#806840',
          800: '#5A492D',
          900: '#352B1B',
        },
        olive: {
          DEFAULT: '#6B7A5A',
          50: '#EEF1EA',
          100: '#D6DCCA',
          200: '#B6C0A4',
          300: '#94A37E',
          400: '#7B8A66',
          500: '#6B7A5A',
          600: '#566249',
          700: '#414A37',
          800: '#2D3326',
          900: '#181B14',
        },
        // Semantic shadcn tokens backed by CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
