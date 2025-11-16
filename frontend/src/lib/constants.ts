/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const S3_CDN_URL = process.env.NEXT_PUBLIC_S3_CDN || 'https://d123456.cloudfront.net';

// Revalidation times (in seconds)
export const REVALIDATE_TIMES = {
  HOMEPAGE: 3600,        // 1 hour
  OFFICIAL_PROFILE: 3600, // 1 hour
  SEARCH_RESULTS: 1800,  // 30 minutes
  ABOUT: 86400,          // 24 hours
} as const;

// US States
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
] as const;

// Promise categories
export const PROMISE_CATEGORIES = [
  'economy',
  'healthcare',
  'education',
  'immigration',
  'environment',
  'infrastructure',
  'justice',
  'foreign-policy',
  'other',
] as const;

// Party display configuration
export const PARTY_CONFIG = {
  Democratic: {
    label: '(D)',
    displayColor: '#6B7280', // Muted gray per spec
  },
  Republican: {
    label: '(R)',
    displayColor: '#6B7280', // Muted gray per spec
  },
  Independent: {
    label: '(I)',
    displayColor: '#6B7280', // Muted gray per spec
  },
} as const;

// Breakpoints (must match Tailwind config)
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Accessibility
export const ARIA_LABELS = {
  skipToMain: 'Skip to main content',
  mainNav: 'Main navigation',
  searchForm: 'Search for officials',
  officialCard: (name: string) => `View profile for ${name}`,
  closeModal: 'Close dialog',
  expandAccordion: 'Expand section',
  collapseAccordion: 'Collapse section',
} as const;

// Date formats
export const DATE_FORMATS = {
  display: 'MMMM d, yyyy',
  short: 'MM/dd/yyyy',
  iso: 'yyyy-MM-dd',
} as const;
