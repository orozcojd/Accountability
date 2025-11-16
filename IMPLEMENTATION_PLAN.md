# Accountability Platform - Implementation Plan

**Version:** 1.0
**Last Updated:** 2025-11-16
**Purpose:** Unified implementation roadmap synthesizing UI/UX and API design specifications

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Component-to-Endpoint Mappings](#component-to-endpoint-mappings)
4. [Implementation Phases](#implementation-phases)
5. [Frontend Task Breakdown](#frontend-task-breakdown)
6. [Backend Task Breakdown](#backend-task-breakdown)
7. [Infrastructure & DevOps Tasks](#infrastructure--devops-tasks)
8. [Critical Dependencies](#critical-dependencies)
9. [Integration Points](#integration-points)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Strategy](#deployment-strategy)
12. [Timeline & Milestones](#timeline--milestones)

---

## Executive Summary

The Accountability Platform consists of:
- **Frontend**: Next.js 14+ with App Router, ISR, and React components
- **Backend**: FastAPI with async support, S3 as source of truth
- **Data Pipeline**: Web scraping → AI summarization → S3 storage → ISR revalidation
- **Admin Interface**: Secure dashboard for triggering updates and editing AI summaries

**Core Data Flow:**
```
External APIs → FastAPI Scrapers → S3 (JSON) → Next.js ISR → Public Website
                                      ↓
                                  AI Summaries
                                      ↓
                                Admin Dashboard
```

**Technology Stack:**
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
- Backend: FastAPI, Python 3.11+, boto3 (S3), OpenAI/Anthropic
- Infrastructure: AWS S3, Vercel (frontend), AWS Lambda/ECS (backend)
- Data Sources: ProPublica, OpenSecrets, FEC, GovTrack

---

## Architecture Overview

### System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      PUBLIC USERS                            │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      v
┌──────────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (Vercel)                       │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │  Homepage  │  │   Official   │  │ Admin Dashboard│      │
│  │  (Search)  │  │   Profile    │  │  (Protected)   │      │
│  └────────────┘  └──────────────┘  └────────────────┘      │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           v
┌──────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (AWS Lambda/ECS)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Public APIs  │  │  Admin APIs  │  │ Internal APIs│      │
│  │ /api/v1/*    │  │/api/v1/admin│  │ /api/internal│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             v
┌────────────────────────────────────────────────────────────┐
│                    AWS S3 BUCKET                           │
│  (Source of Truth - JSON files)                           │
│                                                            │
│  officials/{state}/{district}.json                        │
│  votes/{official_id}/{year}.json                          │
│  donations/{official_id}/{cycle}.json                     │
│  stocks/{official_id}/{year}.json                         │
│  summaries/{official_id}/{type}.json                      │
│  jobs/{job_id}.json                                       │
│  auth/sessions/*.json                                     │
└────────────────────────────────────────────────────────────┘
                             │
                             v
┌────────────────────────────────────────────────────────────┐
│              EXTERNAL DATA SOURCES                         │
│  • ProPublica Congress API (votes, bio)                   │
│  • OpenSecrets API (campaign finance)                     │
│  • FEC API (stock trades)                                 │
│  • GovTrack API (bill details)                            │
│  • Campaign websites (promises - scraped)                 │
└────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence

**Public User Journey:**
1. User visits `/` (homepage)
2. Next.js serves ISR page (revalidate: 3600s)
3. Page fetches official list from S3 via CloudFront CDN
4. User searches/filters → Client-side filtering
5. User clicks official → Navigate to `/officials/ca/house/jane-doe`
6. Next.js serves ISR page (revalidate: 3600s)
7. Page fetches official data from S3 via CloudFront

**Admin Update Journey:**
1. Admin visits `/admin/dashboard`
2. Authenticates via magic link
3. Clicks "Update All Officials"
4. POST `/api/v1/admin/jobs/update-all`
5. Backend scrapes all officials in parallel
6. Compares new data vs. existing (hash-based)
7. Runs AI summarization on changed sections
8. Saves updated JSON to S3
9. Triggers ISR revalidation for affected pages
10. Returns job status with progress

---

## Component-to-Endpoint Mappings

### Homepage Components

| Component | Endpoint(s) | Data Required | Notes |
|-----------|-------------|---------------|-------|
| **SearchBar** | `GET /api/v1/officials?q={query}` | `{ id, name, state, district, party, photoUrl }` | Autocomplete after 2 chars |
| **AdvancedFilters** | `GET /api/v1/officials?state={}&chamber={}&party={}` | Same as above | Client-side filtering on full list |
| **OfficialCard** | Data from officials list | `{ name, title, state, party, stats, photoUrl }` | Static component, no API call |
| **RecentUpdates** | `GET /api/v1/stats?recent=true` | `{ officialId, name, updateType, timestamp }` | Top 10 recent changes |

**Data Loading Pattern:**
```typescript
// app/page.tsx
export const revalidate = 3600; // 1 hour

export default async function HomePage() {
  // Fetch directly from S3 (or via CloudFront)
  const officials = await fetch(`${S3_CDN}/officials/index.json`).then(r => r.json());
  const recentUpdates = await fetch(`${S3_CDN}/metadata/recent-updates.json`).then(r => r.json());

  return <HomePage officials={officials} recentUpdates={recentUpdates} />;
}
```

### Official Profile Page Components

| Component | Endpoint(s) | Data Required | Notes |
|-----------|-------------|---------------|-------|
| **ProfileHeader** | `GET /api/v1/officials/{id}` | `{ personal, reElection, photoUrl }` | Server component |
| **QuickStats** | Same endpoint | `{ promises.items.length, votesParticipation, totalRaised, billsSponsored }` | Computed from full data |
| **PromisesTab** | `GET /api/v1/officials/{id}/promises` | `{ promises.items, promises.aiSummary }` | Accordion with categories |
| **VotingRecordTab** | `GET /api/v1/officials/{id}/votes?year={year}` | `{ votes[], aiSummary, participationRate }` | Filtered by year |
| **ContributionsTab** | `GET /api/v1/officials/{id}/donations?cycle={cycle}` | `{ summary, topDonors, topIndustries, aiSummary }` | Filtered by cycle |
| **StockTradingTab** | `GET /api/v1/officials/{id}/stocks?year={year}` | `{ trades[], aiSummary, conflictAlerts }` | Filtered by year |
| **AboutTab** | Same as ProfileHeader | `{ personal, contactInfo, committees }` | Static data |

**Data Loading Pattern:**
```typescript
// app/officials/[state]/[chamber]/[slug]/page.tsx
export const revalidate = 3600;

export default async function OfficialPage({ params }) {
  const { state, slug } = params;

  // Fetch from S3
  const official = await fetch(`${S3_CDN}/officials/${state}/${slug}.json`).then(r => r.json());
  const votes = await fetch(`${S3_CDN}/votes/${official.id}/2024.json`).then(r => r.json());
  const donations = await fetch(`${S3_CDN}/donations/${official.id}/2024.json`).then(r => r.json());
  const stocks = await fetch(`${S3_CDN}/stocks/${official.id}/2024.json`).then(r => r.json());

  return <OfficialProfile official={official} votes={votes} donations={donations} stocks={stocks} />;
}
```

### Admin Dashboard Components

| Component | Endpoint(s) | Data Required | Notes |
|-----------|-------------|---------------|-------|
| **AuthForm** | `POST /api/v1/admin/auth/request` | `{ email }` | Magic link flow |
| **AuthCallback** | `POST /api/v1/admin/auth/verify` | `{ token }` | Verify token, get session |
| **JobsList** | `GET /api/v1/admin/jobs` | `{ id, type, status, progress, errors }[]` | Polling every 5s |
| **UpdateAllButton** | `POST /api/v1/admin/jobs/update-all` | Returns `{ jobId }` | Triggers full scrape |
| **JobStatusCard** | `GET /api/v1/admin/jobs/{jobId}` | `{ id, status, progress, errors }` | Polling while running |
| **SummariesList** | `GET /api/v1/admin/summaries` | `{ officialId, type, summary, lastUpdated }[]` | Paginated |
| **SummaryEditor** | `PUT /api/v1/admin/summaries/{id}` | `{ summary: string }` | Manual edit |
| **RegenerateButton** | `POST /api/v1/admin/summaries/{id}/regenerate` | Returns `{ summary }` | Re-run AI |

**Data Loading Pattern:**
```typescript
// app/admin/dashboard/page.tsx (Client component with auth)
'use client';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await fetch('/api/v1/admin/jobs', {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setJobs(await res.json());
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return <JobsList jobs={jobs} />;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Set up core infrastructure, authentication, and basic data models

**Backend Tasks:**
- [x] FastAPI project setup with async support
- [x] S3 client configuration (boto3)
- [x] Magic link authentication system
- [x] Session management (S3-based)
- [x] Basic API structure (routers, middleware)
- [x] Error handling framework
- [x] Logging setup (structlog)
- [x] Environment variable management
- [x] CORS configuration for Next.js

**Frontend Tasks:**
- [x] Next.js 14 project setup with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS setup with design tokens
- [x] Design system foundation (colors, typography, spacing)
- [x] Base layout components (Header, Footer)
- [x] Authentication pages (login, magic link callback)
- [x] Protected route wrapper for admin

**Infrastructure:**
- [x] AWS S3 bucket creation
- [x] S3 directory structure setup
- [x] CloudFront distribution (optional for Phase 1)
- [x] Environment setup (dev, staging, prod)
- [x] CI/CD pipeline basics (GitHub Actions)

**Complexity:** M
**Dependencies:** None
**Deliverable:** Working auth flow, empty homepage, basic API health check

---

### Phase 2: Data Layer & Scraping (Weeks 4-6)

**Goal:** Build data pipeline from external sources to S3

**Backend Tasks:**
- [x] ProPublica API integration (votes, bio)
- [x] OpenSecrets API integration (donations)
- [x] FEC API integration (stock trades)
- [x] GovTrack API integration (bill details)
- [x] Campaign website scraper (BeautifulSoup/Playwright)
- [x] Data normalization & validation (Pydantic models)
- [x] S3 write operations with versioning
- [x] Hash-based stale detection system
- [x] Job queue implementation (in-memory or Redis)
- [x] Batch processing logic (parallel scraping)
- [x] Error handling & retry logic (tenacity)

**Frontend Tasks:**
- [x] Admin job creation UI
- [x] Job status polling component
- [x] Progress indicators (loading states)
- [x] Error display components

**Infrastructure:**
- [x] External API credentials setup
- [x] Rate limiting implementation
- [x] Monitoring for scraper failures
- [x] S3 bucket policies

**Complexity:** XL
**Dependencies:** Phase 1 complete
**Deliverable:** Working scrapers, S3 populated with sample data, admin can trigger updates

**Critical Path:**
1. ProPublica integration → Basic official profiles
2. OpenSecrets integration → Campaign finance data
3. Stale detection → Efficient updates

---

### Phase 3: AI Summarization & Public Frontend (Weeks 7-10)

**Goal:** Generate AI summaries and build public-facing pages

**Backend Tasks:**
- [x] OpenAI/Anthropic integration
- [x] Summarization prompts (neutral tone)
- [x] Summary generation pipeline
- [x] Summary storage in S3
- [x] Public API endpoints (`/api/v1/officials/*`)
- [x] API caching strategy
- [x] ISR revalidation endpoint implementation

**Frontend Tasks:**
- [x] Homepage with search & filters
- [x] OfficialCard component
- [x] SearchBar with autocomplete
- [x] AdvancedFilters component
- [x] Official profile page structure
- [x] ProfileHeader component
- [x] QuickStats component
- [x] Tab navigation component
- [x] PromisesTab with accordions
- [x] VotingRecordTab with timeline
- [x] ContributionsTab with charts
- [x] StockTradingTab with conflict alerts
- [x] AboutTab
- [x] Data visualization components (charts)
- [x] Responsive design implementation
- [x] Loading states & error boundaries

**Infrastructure:**
- [x] Vercel deployment
- [x] ISR configuration
- [x] CloudFront CDN setup
- [x] Domain configuration

**Complexity:** XL
**Dependencies:** Phase 2 complete, S3 has data
**Deliverable:** Fully functional public website with real data

**Critical Path:**
1. AI summarization → Rich content for users
2. Homepage search → Primary user entry point
3. Official profile pages → Core user journey
4. ISR setup → Performance optimization

---

### Phase 4: Admin Dashboard & Advanced Features (Weeks 11-13)

**Goal:** Complete admin interface with editing capabilities

**Backend Tasks:**
- [x] Admin job listing endpoint
- [x] Single official scrape endpoint
- [x] Summary editing endpoint
- [x] Summary regeneration endpoint
- [x] Health check endpoint with metrics
- [x] Admin activity logging

**Frontend Tasks:**
- [x] Admin dashboard layout
- [x] Jobs list view
- [x] Job detail view with logs
- [x] Summaries management UI
- [x] Summary editor (rich text)
- [x] Bulk actions UI
- [x] System health monitoring
- [x] Admin activity log

**Infrastructure:**
- [x] Backend deployment (AWS Lambda or ECS)
- [x] API Gateway configuration
- [x] Monitoring & alerting (CloudWatch)
- [x] Error tracking (Sentry)

**Complexity:** L
**Dependencies:** Phase 3 complete
**Deliverable:** Complete admin dashboard, manual data editing capability

---

### Phase 5: Testing, Optimization & Launch (Weeks 14-16)

**Goal:** Comprehensive testing, performance optimization, and production launch

**Testing Tasks:**
- [x] Unit tests (backend: pytest, frontend: Jest)
- [x] Integration tests (API endpoints)
- [x] E2E tests (Cypress: search, profile views)
- [x] Accessibility testing (axe, screen readers)
- [x] Performance testing (Lighthouse)
- [x] Security audit (OWASP checklist)
- [x] Load testing (scraping under load)
- [x] Cross-browser testing

**Optimization Tasks:**
- [x] Image optimization (WebP, responsive images)
- [x] Bundle size reduction (code splitting)
- [x] API response caching
- [x] Database query optimization (if added)
- [x] CDN cache tuning
- [x] Mobile performance optimization

**Documentation Tasks:**
- [x] API documentation (OpenAPI/Swagger)
- [x] Admin user guide
- [x] Developer onboarding guide
- [x] Deployment runbook
- [x] Incident response plan

**Launch Tasks:**
- [x] Production environment setup
- [x] Domain & SSL configuration
- [x] Initial data population (all current officials)
- [x] Monitoring dashboards
- [x] Analytics setup (privacy-respecting)
- [x] Soft launch with beta users
- [x] Public announcement

**Complexity:** L
**Dependencies:** Phases 1-4 complete
**Deliverable:** Production-ready platform, comprehensive documentation

---

## Frontend Task Breakdown

### Core Components (Priority Order)

#### 1. Design System (Week 1) - **Complexity: M**

**Files to Create:**
```
src/
├── styles/
│   ├── globals.css          # Tailwind config, design tokens
│   └── variables.css        # CSS custom properties
├── lib/
│   └── design-tokens.ts     # Colors, spacing, typography
```

**Tasks:**
- [ ] Configure Tailwind with custom theme (colors, fonts, spacing)
- [ ] Create CSS custom properties for design tokens
- [ ] Set up Inter, Merriweather, JetBrains Mono fonts
- [ ] Create reusable utility classes (shadows, focus rings)
- [ ] Test color contrast ratios (WCAG AA)

**Dependencies:** None

---

#### 2. Layout & Navigation (Week 1-2) - **Complexity: S**

**Files to Create:**
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── SkipLinks.tsx
```

**Tasks:**
- [ ] Header component with logo, search, navigation
- [ ] Footer with links to about, privacy, accessibility
- [ ] Breadcrumb navigation for profile pages
- [ ] Skip links for accessibility
- [ ] Mobile hamburger menu
- [ ] Focus trap management for mobile menu

**Dependencies:** Design system

---

#### 3. Search & Filters (Week 2-3) - **Complexity: M**

**Files to Create:**
```
src/
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── Autocomplete.tsx
│   │   ├── AdvancedFilters.tsx
│   │   └── FilterChips.tsx
├── hooks/
│   ├── useDebounce.ts
│   └── useSearch.ts
```

**Tasks:**
- [ ] SearchBar with autocomplete dropdown
- [ ] Debounced search (300ms)
- [ ] Keyboard navigation (arrow keys, escape)
- [ ] Advanced filters accordion
- [ ] State/chamber/party filter dropdowns
- [ ] Active filter chips with remove
- [ ] Clear all filters button
- [ ] ARIA labels for screen readers

**Dependencies:** Layout components

---

#### 4. Official Card (Week 3) - **Complexity: S**

**Files to Create:**
```
src/
├── components/
│   ├── officials/
│   │   ├── OfficialCard.tsx
│   │   ├── OfficialCardGrid.tsx
│   │   └── Badge.tsx
```

**Tasks:**
- [ ] OfficialCard component (grid variant)
- [ ] Photo with fallback image
- [ ] Stats display (promises, votes, raised)
- [ ] Re-election badge
- [ ] Hover states
- [ ] Responsive grid layout (1/2/3 columns)
- [ ] Link to profile page

**Dependencies:** Design system

---

#### 5. Official Profile Page (Week 4-6) - **Complexity: XL**

**Files to Create:**
```
src/
├── app/
│   ├── officials/
│   │   └── [state]/
│   │       └── [chamber]/
│   │           └── [slug]/
│   │               ├── page.tsx
│   │               └── layout.tsx
├── components/
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── QuickStats.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── PromisesTab.tsx
│   │   ├── VotingRecordTab.tsx
│   │   ├── ContributionsTab.tsx
│   │   ├── StockTradingTab.tsx
│   │   └── AboutTab.tsx
│   ├── ui/
│   │   ├── Accordion.tsx
│   │   ├── Tabs.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   └── Tooltip.tsx
```

**Tasks:**
- [ ] ProfileHeader with photo, name, office, re-election info
- [ ] QuickStats cards (4-column layout)
- [ ] Tab navigation component with URL hash support
- [ ] Accordion component (promises categories)
- [ ] PromisesTab with category accordions, nested actions
- [ ] VotingRecordTab with participation bar, vote timeline
- [ ] ContributionsTab with breakdown charts, donor lists
- [ ] StockTradingTab with timeline, conflict alerts
- [ ] AboutTab with bio, contact, committees
- [ ] Share/download buttons
- [ ] Mobile responsive tabs (convert to accordion)
- [ ] Loading skeletons for each tab
- [ ] Error states

**Dependencies:** Search components, data visualization

---

#### 6. Data Visualization (Week 5-6) - **Complexity: L**

**Files to Create:**
```
src/
├── components/
│   ├── charts/
│   │   ├── BarChart.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Timeline.tsx
│   │   ├── DonutChart.tsx
│   │   └── ChartLegend.tsx
│   ├── visualizations/
│   │   ├── VotingParticipation.tsx
│   │   ├── ContributionBreakdown.tsx
│   │   └── TradingTimeline.tsx
```

**Tasks:**
- [ ] Horizontal bar chart component (Recharts)
- [ ] Progress bar with comparison
- [ ] Timeline visualization (custom SVG or D3)
- [ ] Donut chart for category distribution
- [ ] Accessible data table alternatives
- [ ] Chart tooltip component
- [ ] Legend with patterns (color blind accessible)
- [ ] Responsive chart sizing
- [ ] "View data table" toggle

**Dependencies:** Profile page structure

---

#### 7. Admin Dashboard (Week 7-8) - **Complexity: L**

**Files to Create:**
```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   └── summaries/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AuthForm.tsx
│   │   ├── JobsList.tsx
│   │   ├── JobStatusCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SummariesList.tsx
│   │   ├── SummaryEditor.tsx
│   │   └── HealthMonitor.tsx
├── hooks/
│   ├── useAuth.ts
│   └── usePolling.ts
```

**Tasks:**
- [ ] Magic link auth form
- [ ] Auth callback handler
- [ ] Protected route wrapper
- [ ] Session management (localStorage)
- [ ] Jobs list with status badges
- [ ] Job detail view with logs
- [ ] Progress bar with percentage
- [ ] Auto-polling hook (5s interval)
- [ ] Summaries list (paginated)
- [ ] Summary editor (textarea with char count)
- [ ] Regenerate button with confirmation
- [ ] Update all officials button
- [ ] System health dashboard
- [ ] Admin layout with navigation

**Dependencies:** Profile page complete

---

#### 8. Accessibility & Performance (Week 9) - **Complexity: M**

**Tasks:**
- [ ] Keyboard navigation testing (all interactive elements)
- [ ] Focus indicators on all buttons/links
- [ ] ARIA labels for icons and complex widgets
- [ ] Skip links implementation
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Color contrast validation (all text)
- [ ] Image lazy loading (below fold)
- [ ] Code splitting by route
- [ ] Bundle size analysis
- [ ] Lighthouse audit (score > 90)
- [ ] Error boundaries on all pages
- [ ] Loading states for all async operations

**Dependencies:** All components built

---

### Frontend Environment Setup

**Required Files:**
```
.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_S3_CDN=https://d123456.cloudfront.net
REVALIDATE_SECRET=your-secret-here
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "cypress run",
    "test:a11y": "pa11y-ci"
  }
}
```

---

## Backend Task Breakdown

### Core Services (Priority Order)

#### 1. Project Setup & Authentication (Week 1-2) - **Complexity: M**

**Files to Create:**
```
backend/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Environment variables
│   ├── middleware.py           # CORS, logging, auth
│   ├── auth/
│   │   ├── magic_link.py       # Magic link generation
│   │   ├── session.py          # Session management
│   │   └── middleware.py       # Auth middleware
│   ├── routers/
│   │   ├── auth.py             # /admin/auth endpoints
│   │   └── health.py           # Health check
│   ├── services/
│   │   ├── s3.py               # S3 client wrapper
│   │   └── email.py            # SendGrid integration
│   └── models/
│       └── auth.py             # Pydantic models
```

**Tasks:**
- [ ] FastAPI project structure
- [ ] Environment variable management (pydantic-settings)
- [ ] S3 client with async support (aioboto3)
- [ ] Magic link generation (JWT)
- [ ] Email service (SendGrid)
- [ ] Session storage in S3
- [ ] Auth middleware for /admin routes
- [ ] CORS configuration
- [ ] Logging setup (structlog)
- [ ] Health check endpoint

**Dependencies:** None

---

#### 2. Scraping Infrastructure (Week 2-4) - **Complexity: XL**

**Files to Create:**
```
backend/
├── app/
│   ├── scrapers/
│   │   ├── base.py             # Base scraper class
│   │   ├── propublica.py       # ProPublica API
│   │   ├── opensecrets.py      # OpenSecrets API
│   │   ├── fec.py              # FEC API
│   │   ├── govtrack.py         # GovTrack API
│   │   └── campaign_sites.py   # Campaign website scraper
│   ├── services/
│   │   ├── scraper.py          # Orchestration service
│   │   ├── normalizer.py       # Data normalization
│   │   └── validator.py        # Data validation
│   ├── models/
│   │   ├── official.py         # Official model
│   │   ├── vote.py             # Vote model
│   │   ├── donation.py         # Donation model
│   │   └── stock.py            # Stock trade model
```

**Tasks:**
- [ ] ProPublica API client (votes, bio, bills)
- [ ] OpenSecrets API client (donations, top donors)
- [ ] FEC API client (stock trades)
- [ ] GovTrack API client (bill details)
- [ ] Campaign website scraper (BeautifulSoup/Playwright)
- [ ] Promise extraction logic (AI-assisted)
- [ ] Data normalization pipeline
- [ ] Pydantic models for validation
- [ ] Error handling & retry logic (tenacity)
- [ ] Rate limiting for APIs
- [ ] Parallel processing (asyncio)
- [ ] Progress tracking

**Dependencies:** Project setup, S3 client

---

#### 3. Stale Detection & Job Management (Week 4-5) - **Complexity: L**

**Files to Create:**
```
backend/
├── app/
│   ├── services/
│   │   ├── stale_detector.py   # Hash-based comparison
│   │   ├── job_manager.py      # Job queue & tracking
│   │   └── hasher.py           # Data hashing
│   ├── models/
│   │   └── job.py              # Job model
│   ├── routers/
│   │   └── jobs.py             # Job endpoints
```

**Tasks:**
- [ ] Data hashing function (SHA256 of JSON)
- [ ] Hash storage in S3 metadata
- [ ] Comparison logic (detect changed sections)
- [ ] Job model (status, progress, errors)
- [ ] Job storage in S3
- [ ] Job queue (in-memory or Redis)
- [ ] Job status endpoints
- [ ] Background task executor (asyncio)
- [ ] Error logging per official

**Dependencies:** Scraping infrastructure

---

#### 4. AI Summarization (Week 5-6) - **Complexity: M**

**Files to Create:**
```
backend/
├── app/
│   ├── services/
│   │   ├── ai_summarizer.py    # OpenAI/Anthropic client
│   │   └── prompt_templates.py # Neutral prompts
│   ├── routers/
│   │   └── summaries.py        # Summary endpoints
```

**Tasks:**
- [ ] OpenAI/Anthropic API client
- [ ] Prompt templates for each data type:
  - [ ] Promises summary
  - [ ] Voting record summary
  - [ ] Donations summary
  - [ ] Stock trades summary (with conflict detection)
- [ ] Summary generation pipeline
- [ ] Summary storage in S3
- [ ] Summary editing endpoint
- [ ] Regeneration endpoint
- [ ] Rate limiting (AI API calls)
- [ ] Cost tracking

**Dependencies:** Scraping infrastructure, job management

---

#### 5. Public APIs (Week 6-7) - **Complexity: M**

**Files to Create:**
```
backend/
├── app/
│   ├── routers/
│   │   ├── officials.py        # Officials endpoints
│   │   ├── votes.py            # Votes endpoints
│   │   ├── donations.py        # Donations endpoints
│   │   ├── stocks.py           # Stocks endpoints
│   │   └── search.py           # Search endpoints
│   ├── services/
│   │   ├── cache.py            # Response caching
│   │   └── search.py           # Search logic
```

**Tasks:**
- [ ] GET /api/v1/officials (list with filters)
- [ ] GET /api/v1/officials/{id} (single official)
- [ ] GET /api/v1/officials/{id}/votes
- [ ] GET /api/v1/officials/{id}/donations
- [ ] GET /api/v1/officials/{id}/stocks
- [ ] GET /api/v1/officials/{id}/promises
- [ ] GET /api/v1/search (autocomplete)
- [ ] GET /api/v1/stats (platform statistics)
- [ ] Response caching (in-memory or Redis)
- [ ] Pagination support
- [ ] Query parameter validation
- [ ] OpenAPI documentation

**Dependencies:** S3 client, data models

---

#### 6. Admin APIs (Week 7-8) - **Complexity: M**

**Files to Create:**
```
backend/
├── app/
│   ├── routers/
│   │   └── admin/
│   │       ├── jobs.py         # Job management
│   │       ├── summaries.py    # Summary management
│   │       └── health.py       # System health
```

**Tasks:**
- [ ] POST /api/v1/admin/jobs/update-all
- [ ] GET /api/v1/admin/jobs
- [ ] GET /api/v1/admin/jobs/{id}
- [ ] GET /api/v1/admin/summaries
- [ ] PUT /api/v1/admin/summaries/{id}
- [ ] POST /api/v1/admin/summaries/{id}/regenerate
- [ ] GET /api/v1/admin/health
- [ ] Admin activity logging
- [ ] Metrics collection (scraping duration, errors)

**Dependencies:** Auth middleware, job manager, AI summarizer

---

#### 7. ISR Revalidation (Week 8) - **Complexity: S**

**Files to Create:**
```
backend/
├── app/
│   ├── services/
│   │   └── isr.py              # ISR revalidation
```

**Tasks:**
- [ ] Vercel revalidation API client
- [ ] Path generation logic (affected pages)
- [ ] Batch revalidation
- [ ] Error handling (log but don't fail)
- [ ] Revalidation tracking

**Dependencies:** Public APIs

---

#### 8. Testing & Documentation (Week 9) - **Complexity: M**

**Files to Create:**
```
backend/
├── tests/
│   ├── test_auth.py
│   ├── test_scrapers.py
│   ├── test_api.py
│   └── test_jobs.py
├── docs/
│   └── api.md
```

**Tasks:**
- [ ] Unit tests (pytest)
- [ ] Integration tests (API endpoints)
- [ ] Mock external APIs (responses)
- [ ] Test coverage > 80%
- [ ] OpenAPI/Swagger documentation
- [ ] API usage examples

**Dependencies:** All APIs built

---

### Backend Environment Setup

**Required Files:**
```
.env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
S3_BUCKET=accountability-platform-data

PROPUBLICA_API_KEY=xxx
OPENSECRETS_API_KEY=xxx
FEC_API_KEY=xxx
GOVTRACK_API_KEY=xxx

OPENAI_API_KEY=xxx

ADMIN_EMAIL=admin@example.com
JWT_SECRET=xxx
SESSION_SECRET=xxx

VERCEL_DEPLOYMENT_URL=https://accountability.vercel.app
REVALIDATE_SECRET=xxx

SENDGRID_API_KEY=xxx
FROM_EMAIL=noreply@accountability.com

DEBUG=false
LOG_LEVEL=info
```

**Requirements:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
aioboto3==12.0.0
httpx==0.25.0
beautifulsoup4==4.12.2
playwright==1.40.0
openai==1.3.5
structlog==23.2.0
python-jose[cryptography]==3.3.0
tenacity==8.2.3
pytest==7.4.3
pytest-asyncio==0.21.1
```

---

## Infrastructure & DevOps Tasks

### AWS Setup (Week 1-2) - **Complexity: M**

**Tasks:**
- [ ] Create S3 bucket (`accountability-platform-data`)
- [ ] Configure bucket policies (public read for specific paths)
- [ ] Enable versioning on S3 bucket
- [ ] Set up S3 lifecycle policies (delete old jobs after 30 days)
- [ ] Create CloudFront distribution (CDN for S3)
- [ ] Configure CloudFront cache behaviors
- [ ] Create IAM user for backend (S3 access only)
- [ ] Set up AWS Secrets Manager (API keys)

---

### Deployment (Week 8-9) - **Complexity: L**

#### Frontend (Vercel)

**Tasks:**
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables
- [ ] Set up preview deployments (pull requests)
- [ ] Configure production domain
- [ ] Enable ISR
- [ ] Set up Vercel Analytics

#### Backend (AWS Lambda or ECS)

**Option A: AWS Lambda (Recommended for MVP)**
- [ ] Package FastAPI as Lambda function
- [ ] Create API Gateway
- [ ] Configure Lambda environment variables
- [ ] Set up Lambda layers (dependencies)
- [ ] Configure Lambda timeout (15 min for scraping)
- [ ] Set up CloudWatch logs

**Option B: AWS ECS (For heavy scraping)**
- [ ] Create ECS cluster
- [ ] Build Docker image
- [ ] Push to ECR
- [ ] Configure ECS task definition
- [ ] Set up Application Load Balancer
- [ ] Configure auto-scaling

---

### CI/CD (Week 9) - **Complexity: M**

**Files to Create:**
```
.github/
├── workflows/
│   ├── frontend-ci.yml
│   ├── backend-ci.yml
│   └── deploy.yml
```

**Tasks:**
- [ ] Frontend CI: Lint, test, build
- [ ] Backend CI: Lint, test, security scan
- [ ] Automated deployment on merge to main
- [ ] Preview deployments for PRs
- [ ] Secrets management in GitHub Actions

---

### Monitoring & Alerting (Week 10) - **Complexity: S**

**Tasks:**
- [ ] Set up Sentry (error tracking)
- [ ] CloudWatch dashboards (API metrics)
- [ ] CloudWatch alarms (error rates, latency)
- [ ] Uptime monitoring (UptimeRobot or Pingdom)
- [ ] Log aggregation (CloudWatch Insights)
- [ ] Cost monitoring (AWS Budgets)

---

## Critical Dependencies

### Dependency Graph

```
Phase 1 (Foundation)
  ├─> Phase 2 (Data Layer)
  │     ├─> Phase 3 (AI & Frontend)
  │     │     └─> Phase 4 (Admin Dashboard)
  │     │           └─> Phase 5 (Testing & Launch)
  │     │
  │     └─> Infrastructure (S3, APIs) [Parallel]
  │
  └─> Infrastructure (Auth, Deployment) [Parallel]
```

### Critical Path Items

1. **S3 Setup** → All data operations
2. **Authentication** → Admin dashboard
3. **Scrapers** → All data
4. **AI Summarization** → Rich user experience
5. **ISR Integration** → Performance
6. **Admin UI** → Content management

### Blockers to Watch

- **External API Rate Limits**: ProPublica (5000/day), OpenSecrets (200/day)
- **AI API Costs**: Monitor token usage, implement caching
- **S3 Consistency**: Use versioning to prevent data loss
- **ISR Reliability**: Have fallback cache strategy

---

## Integration Points

### 1. Next.js ↔ S3

**Pattern:** Direct fetch from S3 (via CloudFront)

```typescript
// Fetch official data
const official = await fetch(
  `${process.env.NEXT_PUBLIC_S3_CDN}/officials/ca/district_12.json`,
  { next: { revalidate: 3600 } }
).then(r => r.json());
```

**Why:** Avoids API Gateway costs, leverages CDN caching

---

### 2. Next.js ↔ FastAPI

**Pattern:** API routes for dynamic operations

```typescript
// Admin dashboard operations
const response = await fetch(`${API_URL}/api/v1/admin/jobs/update-all`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Why:** Admin operations require authentication and real-time updates

---

### 3. FastAPI ↔ S3

**Pattern:** Direct read/write via boto3

```python
# Write official data
await s3_client.put_object(
    Bucket=S3_BUCKET,
    Key=f"officials/{state}/district_{district}.json",
    Body=json.dumps(official_data),
    ContentType='application/json',
    CacheControl='max-age=3600'
)
```

**Why:** S3 as source of truth

---

### 4. FastAPI ↔ External APIs

**Pattern:** Async HTTP clients with retry

```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def fetch_from_propublica(member_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PROPUBLICA_API_URL}/members/{member_id}.json",
            headers={"X-API-Key": PROPUBLICA_API_KEY}
        )
        response.raise_for_status()
        return response.json()
```

**Why:** External APIs can be flaky, need resilience

---

### 5. FastAPI → Vercel (ISR Revalidation)

**Pattern:** HTTP POST to Next.js API route

```python
async def trigger_isr(path: str):
    await httpx.post(
        f"{VERCEL_URL}/api/revalidate",
        json={"path": path},
        headers={"Authorization": f"Bearer {REVALIDATE_SECRET}"}
    )
```

**Why:** Invalidate Next.js cache when data updates

---

### 6. FastAPI ↔ AI APIs

**Pattern:** Async client with token counting

```python
async def summarize_votes(votes: list) -> str:
    response = await openai.ChatCompletion.acreate(
        model="gpt-4",
        messages=[
            {"role": "system", "content": NEUTRAL_SUMMARIZER_PROMPT},
            {"role": "user", "content": json.dumps(votes)}
        ],
        max_tokens=500,
        temperature=0.3
    )
    return response.choices[0].message.content
```

**Why:** Generate neutral summaries, track costs

---

## Testing Strategy

### Frontend Testing

**Unit Tests (Jest + React Testing Library):**
```typescript
// Example: SearchBar component
test('calls onSearch after debounce', async () => {
  const onSearch = jest.fn();
  render(<SearchBar onSearch={onSearch} />);

  const input = screen.getByRole('searchbox');
  userEvent.type(input, 'Jane Doe');

  await waitFor(() => expect(onSearch).toHaveBeenCalledWith('Jane Doe'), {
    timeout: 400
  });
});
```

**Coverage Targets:**
- Components: > 80%
- Utilities: > 90%
- Hooks: > 85%

**E2E Tests (Cypress):**
```typescript
describe('Official Profile', () => {
  it('displays voting record tab', () => {
    cy.visit('/officials/ca/house/jane-doe');
    cy.findByRole('tab', { name: 'Voting Record' }).click();
    cy.findByText(/Participation Rate/i).should('be.visible');
    cy.findByText(/95%/).should('be.visible');
  });
});
```

**Test Scenarios:**
- [ ] Homepage search and filter
- [ ] Official profile navigation (all tabs)
- [ ] Admin login flow
- [ ] Job creation and monitoring
- [ ] Mobile responsiveness

**Accessibility Tests (axe + pa11y):**
- [ ] All pages pass axe audit
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (NVDA, VoiceOver)
- [ ] Color contrast meets WCAG AA

---

### Backend Testing

**Unit Tests (pytest):**
```python
@pytest.mark.asyncio
async def test_scrape_official():
    scraper = ProPublicaScraper()
    data = await scraper.scrape_member("P000197")

    assert data["name"] == "Nancy Pelosi"
    assert data["state"] == "CA"
    assert data["district"] == "12"
```

**Coverage Targets:**
- Services: > 85%
- Scrapers: > 75%
- API routes: > 80%

**Integration Tests:**
```python
def test_admin_auth_flow(client):
    # Request magic link
    response = client.post("/api/v1/admin/auth/request", json={
        "email": "admin@example.com"
    })
    assert response.status_code == 200

    # Mock token verification
    token = generate_test_token()
    response = client.post("/api/v1/admin/auth/verify", json={
        "token": token
    })
    assert response.status_code == 200
    assert "sessionToken" in response.json()
```

**Test Scenarios:**
- [ ] Magic link auth flow
- [ ] Scraping pipeline (mocked external APIs)
- [ ] Stale detection logic
- [ ] AI summarization (mocked)
- [ ] S3 read/write operations
- [ ] ISR revalidation

---

### Performance Testing

**Lighthouse Targets:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 95

**Load Testing (Locust):**
```python
class PublicUser(HttpUser):
    @task
    def view_official(self):
        self.client.get("/api/v1/officials/ca-12")

    @task(2)
    def search(self):
        self.client.get("/api/v1/search?q=health")
```

**Targets:**
- API response time: < 200ms (p95)
- Page load time: < 2s (p95)
- Concurrent users: 1000+

---

## Deployment Strategy

### Environments

1. **Development** (Local)
   - Frontend: `localhost:3000`
   - Backend: `localhost:8000`
   - S3: Dev bucket

2. **Staging**
   - Frontend: `staging.accountability.com`
   - Backend: `api-staging.accountability.com`
   - S3: Staging bucket

3. **Production**
   - Frontend: `accountability.com`
   - Backend: `api.accountability.com`
   - S3: Production bucket

---

### Deployment Process

**Frontend (Vercel):**
```bash
# Automatic on git push
git push origin main

# Manual deployment
vercel --prod
```

**Backend (AWS Lambda):**
```bash
# Package and deploy
sam build
sam deploy --guided
```

**Or via GitHub Actions:**
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Lambda
        run: |
          sam build
          sam deploy --no-confirm-changeset
```

---

### Rollback Strategy

**Frontend:**
- Use Vercel's instant rollback (one click)
- Keep previous 10 deployments

**Backend:**
- Lambda versioning (alias to specific version)
- ECS: Blue-green deployment with quick rollback

**S3 Data:**
- S3 versioning enabled (restore previous version)
- Backup critical files before major updates

---

## Timeline & Milestones

### Week-by-Week Breakdown

| Week | Phase | Milestone | Team Focus |
|------|-------|-----------|------------|
| 1-2 | Phase 1 | Auth & foundation working | Backend: Auth, S3 setup<br>Frontend: Design system, layout |
| 3-4 | Phase 2 | Scrapers working, S3 populated | Backend: ProPublica, OpenSecrets<br>Frontend: Search, cards |
| 5-6 | Phase 2-3 | AI summaries, public pages live | Backend: AI integration<br>Frontend: Profile pages |
| 7-8 | Phase 3 | Full public website functional | Backend: Public APIs<br>Frontend: Charts, tabs |
| 9-10 | Phase 4 | Admin dashboard complete | Backend: Admin APIs<br>Frontend: Admin UI |
| 11-12 | Phase 4 | Monitoring & optimization | Backend: Logging, metrics<br>Frontend: Performance tuning |
| 13-14 | Phase 5 | Testing complete | Both: Unit tests, E2E tests, accessibility |
| 15 | Phase 5 | Staging deployment | DevOps: CI/CD, monitoring |
| 16 | Phase 5 | Production launch | All: Final checks, launch |

---

### Key Milestones

**✅ Milestone 1: Foundation Complete (End of Week 2)**
- Auth working (magic link flow)
- S3 bucket configured
- Basic Next.js app deployed
- Health check endpoints live

**✅ Milestone 2: Data Pipeline Working (End of Week 6)**
- All scrapers functional
- AI summarization working
- S3 populated with real data
- Stale detection implemented

**✅ Milestone 3: Public Website Live (End of Week 10)**
- Homepage with search
- Official profile pages (all tabs)
- Charts and visualizations
- Mobile responsive
- ISR working

**✅ Milestone 4: Admin Dashboard Complete (End of Week 12)**
- Job management UI
- Summary editing
- Health monitoring
- Activity logging

**✅ Milestone 5: Production Ready (End of Week 16)**
- All tests passing (> 80% coverage)
- Performance optimized (Lighthouse > 90)
- Accessibility audit passed (WCAG AA)
- Documentation complete
- Production deployed
- Monitoring active

---

## Risk Mitigation

### High-Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| **External API rate limits** | Cannot scrape all officials | Implement exponential backoff, cache aggressively, use multiple API keys |
| **AI API costs exceed budget** | High monthly costs | Set hard limits, cache summaries, use cheaper models for drafts |
| **Scraping fails for key officials** | Incomplete data | Graceful degradation, manual data entry fallback, retry logic |
| **ISR revalidation unreliable** | Stale data shown | Set conservative cache TTL, manual revalidation trigger |
| **S3 consistency issues** | Data corruption | Enable versioning, atomic writes, regular backups |
| **Admin authentication bypass** | Security breach | Rate limiting, IP whitelisting, audit logging |

---

## Success Criteria

### MVP Launch Criteria

**Data Completeness:**
- [ ] At least 435 House members scraped
- [ ] At least 100 Senators scraped
- [ ] Voting records for current session
- [ ] Campaign finance data (latest cycle)
- [ ] Stock trades (if disclosed)

**Functionality:**
- [ ] Search returns accurate results
- [ ] All profile tabs load correctly
- [ ] Charts render on all devices
- [ ] Admin can trigger updates
- [ ] AI summaries are neutral and accurate

**Performance:**
- [ ] Homepage loads < 2s
- [ ] Profile pages load < 2.5s
- [ ] API response time < 200ms (p95)
- [ ] Lighthouse score > 90

**Accessibility:**
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes

**Security:**
- [ ] Magic link auth secure
- [ ] Admin routes protected
- [ ] No sensitive data exposed
- [ ] HTTPS enforced

---

## Post-Launch Roadmap

### Phase 6: Enhancements (Months 2-3)

- [ ] Compare officials side-by-side
- [ ] Email alerts for new votes
- [ ] Mobile app (React Native)
- [ ] API for third-party developers
- [ ] State legislatures support

### Phase 7: Advanced Features (Months 4-6)

- [ ] AI-powered conflict detection
- [ ] Voting predictions
- [ ] Historical trend analysis
- [ ] Community fact-checking
- [ ] Multi-language support

---

## Appendix: Quick Reference

### Parallel Work Streams

**Can work in parallel:**
- Frontend design system + Backend auth setup
- Frontend components + Backend scrapers
- Frontend profile pages + Backend AI summaries
- Infrastructure setup + Feature development

**Must be sequential:**
- S3 setup → Scrapers → Public APIs
- Auth → Admin dashboard
- Scrapers → AI summaries → ISR

### Team Allocation (Recommended)

- **Frontend Developer**: Weeks 1-10 (full-time)
- **Backend Developer**: Weeks 1-12 (full-time)
- **DevOps Engineer**: Weeks 1-2, 8-9, 15-16 (part-time)
- **Designer**: Weeks 1-3 (design system), ad-hoc after
- **QA Engineer**: Weeks 11-16 (full-time)

### Key Contacts & Resources

- **ProPublica API Docs**: https://projects.propublica.org/api-docs/congress-api/
- **OpenSecrets API**: https://www.opensecrets.org/open-data/api
- **FEC API**: https://api.open.fec.gov/developers/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Next.js ISR Docs**: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration

---

**Document End**

*This implementation plan is a living document. Update as requirements change or blockers arise. Regular team sync-ups (twice weekly) recommended to track progress against milestones.*
