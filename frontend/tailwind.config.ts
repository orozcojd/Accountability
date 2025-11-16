import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Neutrals
        background: '#FFFFFF',
        'background-dark': '#111827',
        'off-white': '#F8F9FA',
        'light-gray': '#E9ECEF',
        'medium-gray': '#ADB5BD',
        'dark-gray': '#495057',
        'text-black': '#111827',
        'text-inverse': '#F9FAFB',

        // Strategic Color System - Use color for MEANING
        'broken-promise': {
          DEFAULT: '#DC2626', // red-600
          light: '#FEE2E2',
          dark: '#991B1B',
        },
        'kept-promise': {
          DEFAULT: '#16A34A', // green-600
          light: '#DCFCE7',
          dark: '#166534',
        },
        warning: {
          DEFAULT: '#F59E0B', // amber-500
          light: '#FEF3C7',
          dark: '#B45309',
        },
        neutral: {
          DEFAULT: '#6B7280', // gray-500
          light: '#F3F4F6',
          dark: '#374151',
        },

        // Accent Colors (Politically Neutral)
        primary: {
          DEFAULT: '#0D7377', // teal - investigative feel
          hover: '#0A5D61',
          light: '#E6F4F5',
        },
        secondary: {
          DEFAULT: '#4A5568',
          hover: '#2D3748',
          light: '#EDF2F7',
        },

        // Legacy aliases for backward compatibility
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        info: {
          DEFAULT: '#475569',
          light: '#F1F5F9',
        },

        // Data Visualization Palette
        chart: {
          teal: '#0D7377',
          purple: '#9C6ADE',
          amber: '#F59E0B',
          green: '#16A34A',
          red: '#DC2626',
          coral: '#E85D75',
          slate: '#4A5568',
        },

        // Party Colors (Muted - for reference only, avoid emphasis)
        party: {
          neutral: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Work Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Roboto Slab', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Bold, impactful typography scale
        'hero': ['3rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }], // 48px
        'page-title': ['2.5rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' }], // 40px
        'section-title': ['2rem', { lineHeight: '1.2', fontWeight: '700' }], // 32px
        'subsection': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
        'component-title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        'emphasis': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }], // 18px
        'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }], // 16px
        'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }], // 12px
        // Data/number display
        'data-huge': ['3.5rem', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }], // 56px
        'data-large': ['2.5rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.01em' }], // 40px
        'data-medium': ['1.5rem', { lineHeight: '1.2', fontWeight: '600' }], // 24px
      },
      spacing: {
        // Tighter spacing for denser layouts
        'xxs': '0.125rem', // 2px
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '0.75rem',   // 12px (reduced from 16px)
        'lg': '1rem',      // 16px (reduced from 24px)
        'xl': '1.5rem',    // 24px (reduced from 32px)
        '2xl': '2rem',     // 32px (reduced from 48px)
        '3xl': '3rem',     // 48px (reduced from 64px)
        '4xl': '4rem',     // 64px (reduced from 96px)
        '5xl': '6rem',     // 96px
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'xl': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'focus': '0 0 0 3px rgba(13, 115, 119, 0.4)',
        'focus-error': '0 0 0 3px rgba(220, 38, 38, 0.4)',
      },
      borderRadius: {
        // Sharper edges
        'none': '0',
        'sm': '0.125rem', // 2px
        'md': '0.25rem',  // 4px (reduced from 8px)
        'lg': '0.375rem', // 6px (reduced from 12px)
        'xl': '0.5rem',   // 8px (reduced from 16px)
      },
      maxWidth: {
        'reading': '75ch',
        'content': '1280px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
