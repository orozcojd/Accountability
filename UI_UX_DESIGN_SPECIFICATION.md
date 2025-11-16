# Accountability Platform - UI/UX Design Specification

**Version:** 1.0
**Last Updated:** 2025-11-16
**Purpose:** Comprehensive UI/UX design document for the Accountability Platform - a nonpartisan website for tracking elected officials' promises vs. actions

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Principles](#design-principles)
3. [Information Architecture](#information-architecture)
4. [Visual Design System](#visual-design-system)
5. [Page Layouts & Wireframes](#page-layouts--wireframes)
6. [Component Specifications](#component-specifications)
7. [Data Visualization Patterns](#data-visualization-patterns)
8. [Responsive Design Strategy](#responsive-design-strategy)
9. [Accessibility Requirements](#accessibility-requirements)
10. [Progressive Disclosure Strategy](#progressive-disclosure-strategy)
11. [Implementation Guidelines](#implementation-guidelines)

---

## Executive Summary

The Accountability Platform is designed to present complex political information in a clear, neutral, and accessible manner. The UI/UX approach prioritizes:

- **Clarity over cleverness** - Direct presentation of facts without editorial judgment
- **Progressive disclosure** - Revealing complexity gradually to prevent overwhelm
- **Visual neutrality** - Avoiding partisan color associations and biased language
- **Accessibility-first** - Meeting WCAG 2.1 AA standards minimum, AAA where possible
- **Data-driven design** - Letting facts speak through clean visualizations

**Key Inspiration Sources:**
- **Project Vote Smart** - Comprehensive candidate database model
- **FactCheck.org** - Neutral fact presentation approach
- **USA.gov** - Government accessibility standards
- **Bloomberg** - Data-rich, minimal-bias presentation
- **Cook Political Report** - Nonpartisan political analysis design

---

## Design Principles

### 1. Strict Neutrality

**Visual Neutrality:**
- No red/blue dominant color schemes
- No party-associated imagery or metaphors
- Equal visual weight for all parties and candidates
- Consistent treatment regardless of political affiliation

**Language Neutrality:**
- No adjectives implying judgment (e.g., "radical," "extreme," "moderate")
- No persuasion language or calls to action beyond civic participation
- Factual statements only with citations
- Passive, observational tone in all copy

**Data Neutrality:**
- Side-by-side comparisons without highlighting "better" or "worse"
- Contextual information provided equally
- No selective data presentation

### 2. Cognitive Load Reduction

**Information Hierarchy:**
- Most critical information above the fold
- Secondary details progressively disclosed
- Maximum 2 levels of disclosure to prevent user disorientation
- Clear visual hierarchy using size, weight, and spacing (not color alone)

**Clarity Techniques:**
- One primary action per screen section
- Generous whitespace (minimum 40-60% of viewport)
- Short paragraphs (3-4 lines maximum)
- Scannable layouts with clear section headings

### 3. Transparency & Trust

**Source Citation:**
- All data points linked to primary sources
- Last updated timestamps on all dynamic data
- Clear methodology explanations for calculations
- Data quality indicators where relevant

**User Empowerment:**
- Download options for all data tables
- Share functionality for specific data points
- Print-friendly versions of all pages
- Export campaign finance and voting data

---

## Information Architecture

### Site Structure

```
Accountability Platform
│
├── Homepage (Search & Overview)
│   ├── Quick Search
│   ├── Advanced Filters
│   ├── Featured Officials (Up for Re-election)
│   └── Recent Updates
│
├── Official Profile Pages
│   ├── Overview Section
│   ├── Campaign Promises
│   ├── Recorded Actions
│   ├── Promise vs. Action Analysis
│   ├── Campaign Contributions
│   ├── Stock Trading Activity
│   └── Re-Election Information
│
├── Compare Officials (Future)
│   └── Side-by-side comparison tool
│
├── About
│   ├── Methodology
│   ├── Data Sources
│   └── Contact
│
└── Help & FAQ
    ├── How to Use This Site
    ├── Understanding the Data
    └── Glossary of Terms
```

### Navigation Structure

**Primary Navigation (Persistent Header):**
- Logo/Home
- Search (with dropdown overlay)
- About
- Help

**Footer Navigation:**
- Methodology
- Data Sources
- Privacy Policy
- Accessibility Statement
- Contact
- API Documentation (future)

**Breadcrumb Navigation:**
- Used on all Official Profile pages
- Format: Home > [State] > [Chamber] > [Official Name]

### Content Hierarchy - Official Profile Page

**Level 1 (Always Visible):**
1. Official's basic information (name, photo, office, party)
2. Re-election status if applicable (primary visual indicator)
3. Quick stats (years in office, bills sponsored, voting participation %)
4. High-level promise categories with counts

**Level 2 (One Click):**
1. Detailed promises within categories
2. Voting record timeline
3. Campaign contribution summaries by category
4. Stock trading summary (if applicable)

**Level 3 (Two Clicks Maximum):**
1. Individual vote details
2. Specific donor information
3. Individual promise-action comparisons
4. Transaction-level stock trades

---

## Visual Design System

### Color Palette

**Primary Neutrals:**
```
Background White:    #FFFFFF
Off-White:           #F8F9FA
Light Gray:          #E9ECEF
Medium Gray:         #ADB5BD
Dark Gray:           #495057
Text Black:          #212529
```

**Accent Colors (Politically Neutral):**
```
Primary Accent (Teal):     #0D7377  - Primary actions, links
Secondary (Slate):         #4A5568  - Secondary actions
Success (Forest Green):    #2D6A4F  - Positive indicators (non-partisan)
Warning (Amber):           #F59E0B  - Attention items
Information (Steel Blue):  #475569  - Information callouts
```

**Data Visualization Palette:**
```
Category A:  #0D7377 (Teal)
Category B:  #9C6ADE (Purple)
Category C:  #F59E0B (Amber)
Category D:  #2D6A4F (Forest Green)
Category E:  #E85D75 (Coral)
Category F:  #4A5568 (Slate)
```

**Rationale:**
- Avoids red/blue party associations
- Teal chosen as primary accent (neutral in US politics, used by Elections Canada)
- All colors meet WCAG AA contrast requirements (minimum 4.5:1)
- Data visualization palette uses diverse hues plus patterns for accessibility

**Party Identification (When Required):**
- Use text labels primarily
- If color needed: Muted versions only
  - Democrat: #6B7280 (Gray) with "(D)" label
  - Republican: #6B7280 (Gray) with "(R)" label
  - Independent: #6B7280 (Gray) with "(I)" label
- Never use bright red/blue as primary distinguisher

### Typography

**Font Stack:**
```css
/* Primary Font - Sans Serif for UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Secondary Font - Serif for long-form content (About, Methodology) */
font-family: 'Merriweather', Georgia, 'Times New Roman', serif;

/* Monospace - Data, numbers, code */
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

**Type Scale:**
```
H1 (Page Title):        2.5rem (40px), font-weight: 700, line-height: 1.2
H2 (Section):           2rem (32px), font-weight: 600, line-height: 1.3
H3 (Subsection):        1.5rem (24px), font-weight: 600, line-height: 1.4
H4 (Component Title):   1.25rem (20px), font-weight: 600, line-height: 1.5
Body Large:             1.125rem (18px), font-weight: 400, line-height: 1.6
Body Regular:           1rem (16px), font-weight: 400, line-height: 1.6
Body Small:             0.875rem (14px), font-weight: 400, line-height: 1.5
Caption:                0.75rem (12px), font-weight: 400, line-height: 1.4
```

**Accessibility Considerations:**
- Minimum body text size: 16px
- Maximum line length: 75 characters (optimal: 50-60)
- Line height: 1.5-1.6 for body text
- No text in images (except logos)
- All text scalable to 200% without breaking layout

### Spacing System

**8-Point Grid System:**
```
xs:   4px   (0.25rem)
sm:   8px   (0.5rem)
md:   16px  (1rem)
lg:   24px  (1.5rem)
xl:   32px  (2rem)
2xl:  48px  (3rem)
3xl:  64px  (4rem)
4xl:  96px  (6rem)
```

**Application:**
- Component padding: md (16px) minimum
- Section spacing: 2xl-3xl (48-64px)
- Card spacing: lg-xl (24-32px)
- Element margins: sm-md (8-16px)

### Elevation & Shadows

```css
/* Card/Container Shadows */
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07);
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1);

/* Focus States */
focus-ring: 0 0 0 3px rgba(13, 115, 119, 0.3);
```

**Usage:**
- Minimal elevation (prefer borders over heavy shadows)
- shadow-sm: Default card state
- shadow-md: Hover state, dropdown menus
- shadow-lg: Modals, important overlays
- focus-ring: All interactive elements for keyboard navigation

---

## Page Layouts & Wireframes

### Homepage / Search Page

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ [HEADER]                                                │
│ Logo    Search                          About | Help   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              HERO SECTION                               │
│    "Track what your elected officials promised         │
│     vs. what they're actually doing"                    │
│                                                         │
│    ┌───────────────────────────────────────────┐      │
│    │  [Search by name, state, or district]    │      │
│    └───────────────────────────────────────────┘      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ADVANCED FILTERS (Collapsible)                        │
│  [State ▼] [Chamber ▼] [Party ▼] [District]           │
│  ☐ Up for re-election  ☐ Recently active              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  OFFICIALS UP FOR RE-ELECTION (2026)                   │
│                                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │Card 1│  │Card 2│  │Card 3│  │Card 4│              │
│  │      │  │      │  │      │  │      │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  RECENTLY UPDATED                                       │
│  • Rep. Jane Doe voted on H.R. 1234 - 2 hours ago     │
│  • Sen. John Smith new campaign filing - 1 day ago     │
│                                                         │
└─────────────────────────────────────────────────────────┘
│ [FOOTER]                                                │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Hero Section:**
   - Clear value proposition in plain language
   - Large, prominent search bar
   - Minimal text (1-2 sentences max)
   - Whitespace: 60% of hero area

2. **Search Functionality:**
   - Autocomplete with official photos
   - Search by: Name, State, District, Office
   - Real-time results dropdown
   - Recent searches (local storage)

3. **Advanced Filters:**
   - Collapsed by default (progressive disclosure)
   - Accordion-style expansion
   - Filter combinations with clear visual feedback
   - "Clear filters" always visible when active

4. **Official Cards (Grid View):**
   ```
   ┌─────────────────────────────┐
   │  [Photo]    NAME            │
   │             Title           │
   │             State (Party)   │
   │                             │
   │  📊 X promises tracked      │
   │  🗳️  Voting record: XX%     │
   │  📅 Up for re-election 2026 │
   │                             │
   │  [View Profile →]           │
   └─────────────────────────────┘
   ```
   - Photo: 80x80px, circular crop
   - Key stats: Maximum 3 items
   - Clear CTA button
   - Consistent card height

### Official Profile Page

**Layout Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│ [HEADER + BREADCRUMBS]                                       │
│ Home > California > House > Representative Name              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  REPRESENTATIVE JANE DOE                       │
│  │         │  California's 12th District (D)                │
│  │  Photo  │  In office since: January 2021                 │
│  │         │  Next Election: November 5, 2026               │
│  └─────────┘                                                 │
│              [Share] [Download Data] [Subscribe]            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  QUICK STATS (Cards Row)                                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐        │
│  │12       │ │95%       │ │$2.4M     │ │15       │        │
│  │Promises │ │Votes Cast│ │Raised    │ │Bills    │        │
│  │Tracked  │ │          │ │          │ │Sponsored│        │
│  └─────────┘ └──────────┘ └──────────┘ └─────────┘        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ═══ TAB NAVIGATION ════════════════════════════════════    │
│  [Promises & Actions] [Voting Record] [Contributions]       │
│  [Stock Trading] [About]                                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TAB CONTENT AREA                                           │
│  (See detailed sections below)                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Tab 1: Promises & Actions**

```
┌──────────────────────────────────────────────────────────┐
│  CAMPAIGN PROMISES & RECORDED ACTIONS                    │
│                                                          │
│  Filter by topic: [All ▼] [Economy] [Healthcare] [...] │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 💼 ECONOMY & JOBS (4 promises)                [▼]  │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Promise: "Support small business tax relief"      │ │
│  │ Date: Campaign speech, June 15, 2020             │ │
│  │ Source: [Campaign website →]                      │ │
│  │                                                    │ │
│  │ ┌──────────────────────────────────────────────┐  │ │
│  │ │ RECORDED ACTIONS: [Expand ▼]                │  │ │
│  │ │                                              │  │ │
│  │ │ ✓ Voted YES on H.R. 1234 - Small Business   │  │ │
│  │ │   Tax Relief Act (March 2021)                │  │ │
│  │ │   [View full bill details →]                 │  │ │
│  │ │                                              │  │ │
│  │ │ ✓ Co-sponsored H.R. 5678 - Payroll Tax      │  │ │
│  │ │   Reduction (July 2022)                      │  │ │
│  │ │   [View bill →]                              │  │ │
│  │ │                                              │  │ │
│  │ │ • Public statement supporting bill           │  │ │
│  │ │   (January 2023) [Read →]                    │  │ │
│  │ └──────────────────────────────────────────────┘  │ │
│  │                                                    │ │
│  │ Status: [Actions Taken]                           │ │
│  │ Last Updated: October 15, 2025                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Show More Promises]                                   │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Accordion pattern for each topic category
- Two-level disclosure: Category → Individual promises → Actions
- Neutral status indicators (avoid "kept/broken" language)
- Direct source links for all promises and actions
- Chronological ordering within each promise

**Tab 2: Voting Record**

```
┌──────────────────────────────────────────────────────────┐
│  VOTING RECORD                                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ PARTICIPATION RATE                                 │ │
│  │                                                    │ │
│  │  95% of votes cast (478 of 502 total votes)       │ │
│  │  ████████████████████████░░                        │ │
│  │                                                    │ │
│  │  Congress Average: 93%                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  TIMELINE VIEW                                          │
│  [2021] [2022] [2023] [2024] [2025]                    │
│                                                          │
│  Filter: [All Bills ▼] [Topic ▼] [Vote Type ▼]        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ H.R. 1234 - Infrastructure Investment Act          │ │
│  │ Date: March 15, 2023                               │ │
│  │ Vote: YES                                          │ │
│  │ Result: PASSED (224-201)                           │ │
│  │ Topic: Infrastructure                              │ │
│  │ [View bill details →]                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Load More Votes]                                      │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Visual participation bar chart
- Contextual comparison (congress average)
- Filterable timeline
- Expandable vote cards
- Infinite scroll/pagination for long lists

**Tab 3: Campaign Contributions**

```
┌──────────────────────────────────────────────────────────┐
│  CAMPAIGN CONTRIBUTIONS                                  │
│                                                          │
│  Total Raised (Current Cycle): $2,450,000              │
│  Reporting Period: January 2023 - September 2025        │
│  Last Updated: October 1, 2025                          │
│  Source: FEC Filing [View original →]                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ BREAKDOWN BY SOURCE                                │ │
│  │                                                    │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Individual Contributions    65% ($1,592,500)│  │ │
│  │  │ █████████████████                           │  │ │
│  │  ├─────────────────────────────────────────────┤  │ │
│  │  │ PAC Contributions          25% ($612,500)   │  │ │
│  │  │ ██████                                      │  │ │
│  │  ├─────────────────────────────────────────────┤  │ │
│  │  │ Party Committees           10% ($245,000)   │  │ │
│  │  │ ███                                         │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ TOP INDUSTRIES                    [View All ▼]    │ │
│  │                                                    │ │
│  │ 1. Healthcare                          $345,000   │ │
│  │ 2. Technology                          $298,000   │ │
│  │ 3. Finance/Insurance                   $276,000   │ │
│  │ 4. Education                           $189,000   │ │
│  │ 5. Energy                              $156,000   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ TOP INDIVIDUAL DONORS             [View All ▼]    │ │
│  │                                                    │ │
│  │ 1. [Donor Name]      [City, ST]         $2,900   │ │
│  │    Occupation: [Occupation]                       │ │
│  │                                                    │ │
│  │ 2. [Donor Name]      [City, ST]         $2,900   │ │
│  │    Occupation: [Occupation]                       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Download Full Data (CSV)]                             │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Clear data sourcing and recency
- Multiple views: by source type, by industry, by donor
- Progressive disclosure (top 5, then "view all")
- Horizontal bar charts for easy comparison
- Download capability for detailed analysis

**Tab 4: Stock Trading Activity**

```
┌──────────────────────────────────────────────────────────┐
│  STOCK TRADING ACTIVITY                                  │
│                                                          │
│  Note: Members of Congress are required to disclose     │
│  stock trades within 45 days per the STOCK Act.         │
│                                                          │
│  Total Trades (2021-2025): 47                           │
│  Total Volume: $385,000 - $1,250,000 (estimated range)  │
│  Last Updated: September 30, 2025                       │
│  Source: House Financial Disclosures [View →]           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ TRADING ACTIVITY TIMELINE                          │ │
│  │                                                    │ │
│  │  2021  ████░░                    (8 trades)        │ │
│  │  2022  ███████░                 (12 trades)        │ │
│  │  2023  ████████                 (15 trades)        │ │
│  │  2024  ████░                     (7 trades)        │ │
│  │  2025  ███░                      (5 trades)        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ RECENT TRADES                     [View All ▼]    │ │
│  │                                                    │ │
│  │ September 15, 2025                                 │ │
│  │ PURCHASE: Technology ETF (QQQ)                     │ │
│  │ Amount: $15,001 - $50,000                         │ │
│  │ [View disclosure form →]                           │ │
│  │                                                    │ │
│  │ August 3, 2025                                     │ │
│  │ SALE: Energy Corp (XYZ)                           │ │
│  │ Amount: $1,001 - $15,000                          │ │
│  │ [View disclosure form →]                           │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Download Full Trading Data (CSV)]                     │
└──────────────────────────────────────────────────────────┘
```

**Key Features:**
- Explanatory note about disclosure requirements
- Aggregate statistics (count and volume ranges)
- Timeline visualization
- Transaction-level detail with source links
- Download capability

**Tab 5: About**

```
┌──────────────────────────────────────────────────────────┐
│  ABOUT REPRESENTATIVE JANE DOE                           │
│                                                          │
│  BACKGROUND                                             │
│  Born: January 15, 1975 (Age 50)                        │
│  Education: BA Political Science, Stanford University   │
│            JD, Yale Law School                           │
│  Previous Positions:                                     │
│  • District Attorney, San Francisco (2015-2020)         │
│  • City Council Member, San Francisco (2010-2015)       │
│                                                          │
│  CONTACT INFORMATION                                     │
│  Washington Office: 1234 Longworth HOB                  │
│                    Washington, DC 20515                  │
│                    (202) 225-XXXX                        │
│  District Office: 567 Main Street                       │
│                  San Francisco, CA 94102                 │
│                  (415) 123-XXXX                          │
│  Website: [official website →]                           │
│                                                          │
│  COMMITTEE ASSIGNMENTS                                   │
│  • Committee on Ways and Means                          │
│  • Subcommittee on Health                               │
│  • Select Committee on Economic Disparity               │
└──────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Official Card Component

**Usage:** Homepage grid, search results

**Variants:**
- Grid view (default)
- List view (compact)
- Featured (larger, more detail)

**Grid View Specification:**

```html
<div class="official-card">
  <img class="official-card__photo" src="..." alt="Photo of [Name]">
  <div class="official-card__content">
    <h3 class="official-card__name">[Full Name]</h3>
    <p class="official-card__title">[Title]</p>
    <p class="official-card__location">[State/District] ([Party])</p>

    <div class="official-card__stats">
      <div class="stat">
        <span class="stat__icon">📊</span>
        <span class="stat__value">12</span>
        <span class="stat__label">promises tracked</span>
      </div>
      <!-- More stats -->
    </div>

    <div class="official-card__badges">
      <span class="badge badge--reelection">Up for re-election 2026</span>
    </div>

    <a href="/officials/[slug]" class="button button--primary">
      View Profile →
    </a>
  </div>
</div>
```

**Visual Specs:**
- Width: 100% of container (responsive grid)
- Padding: 24px
- Border: 1px solid #E9ECEF
- Border-radius: 8px
- Shadow: shadow-sm (default), shadow-md (hover)
- Transition: all 0.2s ease

**Accessibility:**
- Card itself is not clickable (anti-pattern)
- Single clear CTA button
- Proper heading hierarchy
- Alt text on photos

### 2. Accordion Component

**Usage:** Promise categories, expandable sections

**Specification:**

```html
<div class="accordion">
  <button class="accordion__trigger" aria-expanded="false" aria-controls="panel-1">
    <span class="accordion__title">Economy & Jobs (4 promises)</span>
    <span class="accordion__icon" aria-hidden="true">▼</span>
  </button>

  <div id="panel-1" class="accordion__panel" hidden>
    <!-- Panel content -->
  </div>
</div>
```

**Behavior:**
- Click to expand/collapse
- Keyboard: Enter/Space to toggle, Tab to navigate
- Smooth animation (max-height transition)
- Icon rotation on state change
- Only one level of nesting (avoid nested accordions)

**Visual Specs:**
- Trigger padding: 16px 24px
- Panel padding: 24px
- Background: Off-white (#F8F9FA) for panels
- Border-left: 4px solid accent color when expanded

### 3. Tab Navigation Component

**Usage:** Official profile page sections

**Specification:**

```html
<div class="tabs" role="tablist">
  <button class="tab" role="tab" aria-selected="true" aria-controls="panel-promises">
    Promises & Actions
  </button>
  <button class="tab" role="tab" aria-selected="false" aria-controls="panel-voting">
    Voting Record
  </button>
  <!-- More tabs -->
</div>

<div id="panel-promises" class="tab-panel" role="tabpanel" tabindex="0">
  <!-- Content -->
</div>
```

**Behavior:**
- Click to switch tabs
- Keyboard: Arrow keys to navigate, Tab to enter panel
- URL hash updates on tab change (#promises, #voting, etc.)
- Mobile: Converts to accordion or dropdown

**Visual Specs:**
- Tab padding: 16px 24px
- Active state: Border-bottom 3px solid accent
- Inactive state: Text color medium gray
- Smooth content transition (fade)

### 4. Data Table Component

**Usage:** Voting records, donor lists, stock trades

**Specification:**

```html
<div class="table-container">
  <table class="data-table">
    <caption>Voting Record - 2023</caption>
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Bill</th>
        <th scope="col">Vote</th>
        <th scope="col">Result</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>March 15, 2023</td>
        <td>H.R. 1234 - Infrastructure Act</td>
        <td>YES</td>
        <td>PASSED</td>
      </tr>
      <!-- More rows -->
    </tbody>
  </table>
</div>
```

**Features:**
- Responsive: Horizontal scroll on mobile
- Sortable columns (optional)
- Sticky header on scroll
- Zebra striping for readability
- Row hover state

**Visual Specs:**
- Cell padding: 12px 16px
- Border: 1px solid #E9ECEF
- Header background: #F8F9FA
- Font: Monospace for numbers

**Accessibility:**
- Proper table semantics
- Caption for context
- Scope attributes on headers
- Alternative data view for screen readers

### 5. Chart Components

#### Bar Chart (Horizontal)

**Usage:** Campaign contribution breakdowns, participation rates

**Specification:**
- SVG-based or CSS-based
- Accessible data table provided alongside
- Color + pattern for differentiation
- Value labels on bars
- Responsive scaling

**Example Structure:**
```html
<div class="chart chart--bar">
  <div class="chart__header">
    <h4>Contributions by Source</h4>
    <button class="chart__toggle" aria-pressed="false">
      Show data table
    </button>
  </div>

  <div class="chart__visual" aria-hidden="true">
    <!-- Visual chart -->
  </div>

  <table class="chart__table usa-sr-only">
    <!-- Accessible data table -->
  </table>
</div>
```

**Visual Specs:**
- Bar height: 32px
- Gap between bars: 8px
- Label alignment: Left of bar
- Value alignment: Right of bar or inside bar (if space)

#### Timeline Visualization

**Usage:** Voting history over time, trading activity

**Specification:**
- Horizontal timeline with year markers
- Event points clickable/expandable
- Zoom/filter capability
- Mobile: Scrollable horizontal timeline

**Visual Specs:**
- Timeline height: 60px (compact), 120px (expanded)
- Event markers: 12px circles
- Connecting line: 2px solid
- Hover: Tooltip with event details

### 6. Search Component

**Usage:** Homepage search, filter interfaces

**Specification:**

```html
<div class="search">
  <label for="search-input" class="search__label">
    Search for elected officials
  </label>
  <div class="search__input-wrapper">
    <input
      type="search"
      id="search-input"
      class="search__input"
      placeholder="Name, state, or district..."
      autocomplete="off"
      aria-autocomplete="list"
      aria-controls="search-results"
    >
    <button class="search__button" aria-label="Search">
      🔍
    </button>
  </div>

  <div id="search-results" class="search__results" role="listbox">
    <!-- Autocomplete results -->
  </div>
</div>
```

**Behavior:**
- Autocomplete after 2 characters
- Debounced search (300ms)
- Keyboard navigation of results (arrow keys)
- Clear button when text present
- Escape to close results

**Visual Specs:**
- Input height: 48px
- Font size: 18px
- Border: 2px solid medium gray
- Focus: Border color changes to accent, focus ring
- Results dropdown: shadow-lg, max-height 400px

### 7. Badge/Tag Component

**Usage:** Re-election indicators, status labels

**Specification:**

```html
<span class="badge badge--[variant]">
  Label Text
</span>
```

**Variants:**
- `badge--info` (default)
- `badge--warning` (attention items)
- `badge--success` (positive indicators)

**Visual Specs:**
- Padding: 4px 12px
- Border-radius: 12px
- Font-size: 14px
- Font-weight: 600
- Background: Tinted color (10% opacity)
- Text: Full color

### 8. Modal/Dialog Component

**Usage:** Additional context, full data views

**Specification:**

```html
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal__overlay"></div>
  <div class="modal__container">
    <header class="modal__header">
      <h2 id="modal-title">Modal Title</h2>
      <button class="modal__close" aria-label="Close">×</button>
    </header>
    <div class="modal__content">
      <!-- Content -->
    </div>
    <footer class="modal__footer">
      <button class="button button--secondary">Cancel</button>
      <button class="button button--primary">Confirm</button>
    </footer>
  </div>
</div>
```

**Behavior:**
- Focus trap when open
- Escape key to close
- Click overlay to close
- Body scroll lock when open
- Return focus to trigger on close

**Visual Specs:**
- Overlay: rgba(0, 0, 0, 0.5)
- Container: Max-width 600px, margin auto
- Shadow: shadow-lg
- Animation: Fade + scale in

---

## Data Visualization Patterns

### 1. Promise vs. Action Comparison

**Pattern:** Side-by-side comparison with neutral indicators

**Visual Approach:**

```
┌────────────────────────────────────────────────────────┐
│ PROMISE                           RECORDED ACTIONS     │
├────────────────────────────────────────────────────────┤
│ "Support small business          ✓ 3 related votes     │
│  tax relief"                     ✓ 2 bills co-sponsored│
│                                  ✓ 1 public statement  │
│ Campaign speech, June 2020       Last action: Oct 2025 │
│ [Source →]                       [View details ▼]      │
└────────────────────────────────────────────────────────┘
```

**Guidelines:**
- No "kept/broken" language
- Use neutral indicators (checkmarks, bullets)
- Show count of related actions
- Chronological ordering
- Direct source links

### 2. Voting Participation Rate

**Pattern:** Progress bar with contextual comparison

**Visual Approach:**

```
YOUR REPRESENTATIVE
95% ██████████████████████░░ (478 of 502 votes)

CONGRESS AVERAGE
93% ████████████████████░░░░
```

**Guidelines:**
- Show absolute numbers alongside percentage
- Provide context (average, peers)
- Neutral color (accent teal)
- No judgment language

### 3. Campaign Finance Breakdown

**Pattern:** Stacked or grouped horizontal bars

**Visual Approach:**

```
INDIVIDUAL CONTRIBUTIONS    65%  ████████████████
PAC CONTRIBUTIONS          25%  ██████
PARTY COMMITTEES           10%  ███
```

**Guidelines:**
- Percentage + absolute dollar amount
- Consistent color coding
- Patterns for accessibility
- Interactive tooltips on hover
- Link to raw data source

### 4. Stock Trading Timeline

**Pattern:** Timeline with event markers

**Visual Approach:**

```
2021  ● ●  ●  ●   ●  ● ●  ●       (8 trades)
      ├─────────────────────────────────────→
      Jan                           Dec

2022  ●  ● ●● ●   ●  ●  ●  ● ● ●● (12 trades)
      ├─────────────────────────────────────→
```

**Guidelines:**
- Hover for transaction details
- Click to expand full details
- Color code: Purchase vs. Sale (with pattern)
- Mobile: Vertical timeline

### 5. Topic Category Distribution

**Pattern:** Donut chart or horizontal bars

**Visual Approach:**

```
Economy              ████████ (8 promises)
Healthcare           ██████ (6 promises)
Immigration          ████ (4 promises)
Environment          ███ (3 promises)
Education            ██ (2 promises)
```

**Guidelines:**
- Sort by count (descending)
- Limit to top 5, "Other" category
- Clickable to filter promise list
- Accessible data table alternative

---

## Responsive Design Strategy

### Breakpoints

```css
/* Mobile First Approach */
--mobile:    0px      /* 320px+ */
--tablet:    768px    /* Tablet portrait */
--desktop:   1024px   /* Desktop */
--wide:      1280px   /* Wide desktop */
```

### Layout Adaptations

#### Homepage

**Mobile (< 768px):**
- Single column layout
- Stacked official cards
- Simplified filters (modal overlay)
- Larger touch targets (minimum 44x44px)

**Tablet (768px - 1023px):**
- Two-column card grid
- Side-by-side filters
- Persistent navigation

**Desktop (1024px+):**
- Three-column card grid
- All filters visible
- Larger data visualizations

#### Official Profile Page

**Mobile (< 768px):**
- Tabs convert to accordion
- Charts: Simplified versions or horizontal scroll
- Data tables: Horizontal scroll in container
- Stats: Single column stack

**Tablet (768px - 1023px):**
- Tabs remain tabs
- Stats: 2x2 grid
- Side-by-side comparisons stack

**Desktop (1024px+):**
- Full tab interface
- Stats: 4-column row
- Side-by-side comparisons remain

### Touch Considerations

**Minimum Touch Targets:**
- Buttons: 44x44px minimum
- Links in text: Adequate spacing (8px)
- Interactive elements: 48px recommended

**Gestures:**
- Swipe for tab navigation (mobile)
- Pull-to-refresh on data pages
- Pinch-to-zoom on charts (if appropriate)

### Performance Optimization

**Images:**
- Responsive images with srcset
- WebP format with fallbacks
- Lazy loading for below-fold content
- Photo dimensions: 80x80, 160x160, 320x320

**Data Loading:**
- Initial page load: Above-fold content only
- Pagination/infinite scroll for long lists
- Loading skeletons for async content
- Cached data with refresh indicators

---

## Accessibility Requirements

### WCAG 2.1 Compliance

**Target Level:** AA minimum, AAA where possible

**Critical Success Criteria:**

**Perceivable:**
- 1.1.1 Non-text Content (A): All images have alt text
- 1.3.1 Info and Relationships (A): Proper semantic HTML
- 1.4.3 Contrast (AA): Minimum 4.5:1 for text, 3:1 for large text
- 1.4.10 Reflow (AA): No horizontal scrolling at 320px width
- 1.4.11 Non-text Contrast (AA): 3:1 for UI components

**Operable:**
- 2.1.1 Keyboard (A): All functionality via keyboard
- 2.1.2 No Keyboard Trap (A): Escape from all components
- 2.4.3 Focus Order (A): Logical tab order
- 2.4.7 Focus Visible (AA): Clear focus indicators

**Understandable:**
- 3.1.1 Language of Page (A): Lang attribute set
- 3.2.3 Consistent Navigation (AA): Same navigation across pages
- 3.3.1 Error Identification (A): Clear error messages
- 3.3.2 Labels or Instructions (A): Form labels present

**Robust:**
- 4.1.2 Name, Role, Value (A): Proper ARIA usage
- 4.1.3 Status Messages (AA): ARIA live regions for updates

### Screen Reader Optimization

**Structural Elements:**
```html
<!-- Page structure -->
<header role="banner">
  <nav role="navigation" aria-label="Main">
    <!-- Navigation -->
  </nav>
</header>

<main role="main">
  <h1>Page Title</h1>
  <!-- Content -->
</main>

<aside role="complementary" aria-label="Related information">
  <!-- Sidebar -->
</aside>

<footer role="contentinfo">
  <!-- Footer -->
</footer>
```

**Skip Links:**
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

**ARIA Landmarks:**
- Use semantic HTML5 elements
- ARIA roles for clarification
- Descriptive labels for regions

**Live Regions:**
```html
<!-- For dynamic content updates -->
<div aria-live="polite" aria-atomic="true">
  Search returned 47 results
</div>
```

### Keyboard Navigation

**Navigation Order:**
1. Skip links
2. Header navigation
3. Search
4. Main content
5. Sidebar (if present)
6. Footer

**Interactive Elements:**
- Tab: Move forward
- Shift+Tab: Move backward
- Enter/Space: Activate buttons/links
- Arrow keys: Navigate within components (tabs, accordions)
- Escape: Close modals/overlays

**Focus Management:**
- Visible focus indicator (3px ring)
- Focus trap in modals
- Focus return after modal close
- Focus to new content on tab change

### Chart Accessibility

**Required Elements:**

1. **Text Alternative:**
```html
<figure>
  <figcaption>Campaign Contributions by Source</figcaption>
  <div class="chart" aria-hidden="true">
    <!-- Visual chart -->
  </div>
  <details>
    <summary>View data table</summary>
    <table>
      <!-- Accessible data table -->
    </table>
  </details>
</figure>
```

2. **Summary Text:**
- Key insights in plain text
- Trend descriptions
- Notable data points

3. **Data Table:**
- Proper table structure
- Headers with scope
- Caption describing content

**Color Independence:**
- Never rely on color alone
- Use patterns, labels, or icons
- Provide text labels

### Form Accessibility

**Required Elements:**

```html
<form>
  <div class="form-group">
    <label for="official-search">
      Search for official
      <span class="required" aria-label="required">*</span>
    </label>
    <input
      type="text"
      id="official-search"
      aria-required="true"
      aria-describedby="search-hint"
    >
    <span id="search-hint" class="hint-text">
      Enter name, state, or district
    </span>
  </div>

  <!-- Error state -->
  <div class="form-group form-group--error">
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      aria-invalid="true"
      aria-describedby="email-error"
    >
    <span id="email-error" class="error-message" role="alert">
      Please enter a valid email address
    </span>
  </div>
</form>
```

### Testing Requirements

**Automated Testing:**
- axe DevTools
- WAVE browser extension
- Lighthouse accessibility audit

**Manual Testing:**
- Keyboard-only navigation
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Browser zoom to 200%
- Color blindness simulation

**User Testing:**
- Include users with disabilities
- Various assistive technologies
- Different experience levels

---

## Progressive Disclosure Strategy

### Principles

1. **Show the essential first**
   - Most users need basic information
   - Advanced details available on demand
   - Don't hide critical information

2. **Maximum 2 levels of disclosure**
   - Research shows users get lost beyond 2 levels
   - Level 1: Topic categories
   - Level 2: Individual items within topics
   - No Level 3 nested accordions

3. **Clear affordances**
   - Visual indicators for expandable content
   - Consistent patterns throughout site
   - State changes obvious (expanded/collapsed)

### Application Examples

#### Homepage

**Level 0 (Always Visible):**
- Search bar
- Basic navigation
- Featured officials grid

**Level 1 (One Click):**
- Advanced filters
- Filter options panels

**Level 2 (Two Clicks):**
- Individual official profiles

#### Official Profile - Promises Section

**Level 0 (Always Visible):**
- Topic category list with counts
- Summary stats

**Level 1 (One Click):**
- Individual promises within category
- Basic promise details

**Level 2 (Two Clicks):**
- Related actions for specific promise
- Source documents

#### Official Profile - Voting Record

**Level 0 (Always Visible):**
- Participation statistics
- Recent votes (top 5)

**Level 1 (One Click):**
- Full voting history
- Filter options

**Level 2 (Two Clicks):**
- Individual bill details

### Implementation Patterns

**Accordion Pattern:**
```
▼ Category Title (12 items)
  └─ Expanded content
     • Item 1
     • Item 2
     • [Show details ▼]
        └─ Item 1 details (Level 2)
```

**"Show More" Pattern:**
```
Item 1
Item 2
Item 3
Item 4
Item 5
[Show 47 more items]
```

**Tab Pattern:**
```
[Tab 1] Tab 2  Tab 3
────────────────────
Tab 1 content visible
```

**Modal Pattern:**
```
Brief summary visible
[View full details →]
  └─ Opens modal with complete information
```

### Loading States

**Progressive Enhancement:**
1. Show static content immediately
2. Load dynamic data asynchronously
3. Show loading indicators
4. Graceful fallbacks

**Skeleton Screens:**
```
┌──────────┐  ┌─────────────────┐
│          │  │ ████████        │
│  [Photo] │  │ ██████          │
│          │  │                 │
└──────────┘  └─────────────────┘
```

---

## Implementation Guidelines

### Technology Recommendations

**Front-End Framework:**
- React or Vue.js for component-based architecture
- Next.js for server-side rendering and SEO
- TypeScript for type safety

**UI Component Library:**
- Build custom components based on this spec
- Consider U.S. Web Design System as foundation
- Ensure components are accessible out-of-the-box

**CSS Architecture:**
- CSS Modules or Styled Components
- BEM naming convention
- Design tokens for theming

**Chart Libraries:**
- D3.js for custom visualizations
- Chart.js for standard charts
- Ensure accessibility features enabled

**Testing:**
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing
- axe-core for accessibility testing

### Performance Budget

**Initial Page Load:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Total page weight: < 500KB

**Optimization Strategies:**
- Code splitting by route
- Lazy loading images and components
- Minification and compression
- CDN for static assets

### Browser Support

**Minimum Support:**
- Chrome: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Edge: Last 2 versions
- Mobile Safari: iOS 12+
- Chrome Mobile: Android 8+

**Graceful Degradation:**
- Progressive enhancement approach
- Core content accessible without JavaScript
- Polyfills for older browsers

### SEO Considerations

**Meta Tags:**
```html
<title>Official Name - Accountability Platform</title>
<meta name="description" content="Track [Name]'s campaign promises, voting record, and campaign contributions.">
<meta property="og:title" content="Official Name - Accountability Platform">
<meta property="og:image" content="[official-photo.jpg]">
```

**Structured Data:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Official Name",
  "jobTitle": "U.S. Representative",
  "worksFor": {
    "@type": "GovernmentOrganization",
    "name": "U.S. House of Representatives"
  }
}
```

**URL Structure:**
```
/officials/[state]/[chamber]/[name-slug]
/officials/ca/house/jane-doe

Example URLs:
- Homepage: /
- Search: /search?state=CA&chamber=house
- Profile: /officials/ca/house/jane-doe
- Promises: /officials/ca/house/jane-doe#promises
- Voting: /officials/ca/house/jane-doe#voting
```

### Analytics & Monitoring

**Key Metrics:**
- Page views per official
- Search queries
- Filter usage
- Promise/action expansion rates
- Data download counts
- Time on page
- Bounce rate

**User Behavior Tracking:**
- Which sections are most viewed
- Progressive disclosure usage patterns
- Search effectiveness
- Error rates

**Privacy Considerations:**
- GDPR/CCPA compliance
- Cookie consent
- No tracking without consent
- Clear privacy policy

### Content Management

**Update Frequency:**
- Campaign promises: As announced
- Voting records: Daily (after votes)
- Campaign finance: Quarterly (FEC filing deadlines)
- Stock trades: Monthly (45-day disclosure requirement)

**Data Sources:**
- House/Senate voting records
- FEC campaign finance data
- Financial disclosure forms
- Campaign websites and statements
- News archives for promises

**Editorial Process:**
- Fact-checking before publishing
- Source verification
- Neutral language review
- Regular accuracy audits

---

## Appendix: Design Checklist

### Pre-Launch Checklist

**Visual Design:**
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] No party-dominant colors (red/blue) used
- [ ] Consistent spacing throughout
- [ ] Typography hierarchy clear
- [ ] Responsive on all breakpoints

**Accessibility:**
- [ ] All images have alt text
- [ ] Keyboard navigation works
- [ ] Screen reader testing passed
- [ ] Focus indicators visible
- [ ] ARIA labels correct
- [ ] Skip links present
- [ ] No keyboard traps

**Content:**
- [ ] All data sourced and cited
- [ ] Neutral language throughout
- [ ] No judgment terms
- [ ] Timestamps on all data
- [ ] Error states handled

**Functionality:**
- [ ] Search works accurately
- [ ] Filters function correctly
- [ ] Progressive disclosure smooth
- [ ] Data downloads work
- [ ] Charts render properly
- [ ] Mobile interactions smooth

**Performance:**
- [ ] Load time < 3s
- [ ] Images optimized
- [ ] Code minified
- [ ] Lazy loading implemented
- [ ] Browser testing complete

**SEO:**
- [ ] Meta tags complete
- [ ] Structured data added
- [ ] URLs clean and descriptive
- [ ] Sitemap generated
- [ ] Robots.txt configured

---

## Version History

**v1.0 - 2025-11-16**
- Initial comprehensive UI/UX specification
- Research-based design recommendations
- Complete component specifications
- Accessibility guidelines
- Responsive design strategy

---

## References & Resources

### Research Sources

1. **U.S. Web Design System (USWDS)**
   - https://designsystem.digital.gov/
   - Government design standards and components

2. **WCAG 2.1 Guidelines**
   - https://www.w3.org/WAI/WCAG21/quickref/
   - Accessibility standards and techniques

3. **Nielsen Norman Group - Progressive Disclosure**
   - https://www.nngroup.com/articles/progressive-disclosure/
   - UX research on information hierarchy

4. **Project Vote Smart**
   - https://justfacts.votesmart.org/
   - Reference for nonpartisan political information design

5. **FactCheck.org**
   - https://www.factcheck.org/
   - Neutral fact presentation patterns

6. **FiveThirtyEight**
   - https://fivethirtyeight.com/
   - Data visualization best practices

### Design Tools

- **Figma/Sketch:** UI design and prototyping
- **Accessible Color Palette Generator:** Contrast checking
- **axe DevTools:** Accessibility testing
- **Lighthouse:** Performance and accessibility auditing

### Accessibility Testing Tools

- **WAVE:** Web accessibility evaluation
- **NVDA/JAWS:** Screen reader testing
- **VoiceOver:** macOS/iOS screen reader
- **Keyboard Navigation Tester:** Focus order verification

---

**Document End**

*This specification should be treated as a living document and updated as user testing reveals improvements or as new requirements emerge.*
