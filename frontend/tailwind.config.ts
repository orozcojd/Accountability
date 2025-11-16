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
        'off-white': '#F8F9FA',
        'light-gray': '#E9ECEF',
        'medium-gray': '#ADB5BD',
        'dark-gray': '#495057',
        'text-black': '#212529',

        // Accent Colors (Politically Neutral)
        primary: {
          DEFAULT: '#0D7377',
          hover: '#0A5D61',
          light: '#E6F4F5',
        },
        secondary: {
          DEFAULT: '#4A5568',
          hover: '#2D3748',
          light: '#EDF2F7',
        },
        success: {
          DEFAULT: '#2D6A4F',
          light: '#E6F2ED',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
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
          green: '#2D6A4F',
          coral: '#E85D75',
          slate: '#4A5568',
        },

        // Party Colors (Muted)
        party: {
          neutral: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'page-title': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'subsection': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'component-title': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
        '4xl': '6rem',    // 96px
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 3px rgba(13, 115, 119, 0.3)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      maxWidth: {
        'reading': '75ch',
      },
    },
  },
  plugins: [],
}

export default config
