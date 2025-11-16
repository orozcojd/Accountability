# Accountability Platform - Frontend

A Next.js 14 frontend application for the Accountability Platform, providing transparent access to elected officials' campaign promises, voting records, and financial disclosures.

## Features

- **Search & Discovery**: Powerful search with autocomplete and advanced filtering by state, chamber, party, and more
- **Official Profiles**: Comprehensive profiles with tabs for promises, voting records, campaign contributions, and stock trading
- **Data Visualizations**: Interactive charts and timelines for campaign finance and voting patterns
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Responsive Design**: Mobile-first design that works on all devices
- **Performance**: ISR (Incremental Static Regeneration) for fast page loads

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts
- **State Management**: React hooks and URL state
- **Data Fetching**: Native fetch with ISR

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_S3_CDN=https://your-cloudfront-url.com
REVALIDATE_SECRET=your-secret-key
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── about/               # About page
│   │   └── officials/           # Dynamic official profiles
│   │       └── [state]/[chamber]/[slug]/
│   ├── components/              # React components
│   │   ├── charts/              # Data visualization components
│   │   ├── layout/              # Layout components (Header, Footer)
│   │   ├── officials/           # Official card components
│   │   ├── profile/             # Profile page components
│   │   ├── search/              # Search and filter components
│   │   └── ui/                  # Reusable UI components
│   ├── lib/                     # Utility functions and constants
│   │   ├── constants.ts         # App constants
│   │   ├── utils.ts             # Helper functions
│   │   └── mockData.ts          # Mock data for development
│   ├── types/                   # TypeScript type definitions
│   │   └── official.ts          # Data types
│   └── styles/                  # Global styles
│       └── globals.css          # Tailwind + custom CSS
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Key Components

### Pages

- **Homepage** (`/`): Search interface with filters and official cards
- **Official Profile** (`/officials/[state]/[chamber]/[slug]`): Complete profile with tabs
- **About** (`/about`): Platform information and methodology

### Components

- **SearchBar**: Autocomplete search with keyboard navigation
- **AdvancedFilters**: Collapsible filter panel
- **OfficialCard**: Card component for grid/list views
- **Tabs**: Accessible tab navigation with URL hash support
- **Accordion**: Progressive disclosure for promise categories
- **DataTable**: Responsive, accessible data tables
- **Charts**: Bar charts, progress bars, and timelines

## Design System

### Colors

The design uses a neutral color palette to avoid partisan associations:

- **Primary**: Teal (#0D7377)
- **Neutrals**: Slate grays
- **Accents**: Forest green, amber, steel blue

### Typography

- **Sans-serif**: Inter (UI text)
- **Serif**: Merriweather (long-form content)
- **Monospace**: JetBrains Mono (data/numbers)

### Spacing

8-point grid system with predefined spacing values (xs to 4xl).

## Data Flow

1. **Mock Data** (Development): Uses `src/lib/mockData.ts` for local development
2. **S3/CDN** (Production): Fetches JSON files from S3 via CloudFront
3. **ISR**: Pages revalidate every hour (configurable)

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- Focus indicators on all interactive elements
- Skip links for main content
- Semantic HTML throughout

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

Or use the Next.js export feature for static hosting:

```bash
# Add to next.config.js: output: 'export'
npm run build
# Deploy the /out directory
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_S3_CDN` | CloudFront CDN URL for S3 data | Yes |
| `REVALIDATE_SECRET` | Secret for ISR revalidation endpoint | Yes |

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari iOS 12+
- Chrome Mobile Android 8+

## Contributing

1. Follow the existing code style
2. Use TypeScript strictly (no `any` types)
3. Add comments for complex logic
4. Ensure accessibility compliance
5. Test on multiple screen sizes

## License

[Add your license here]

## Support

For questions or issues, please contact [support email or create GitHub issue].

---

Built with Next.js 14, TypeScript, and Tailwind CSS.
