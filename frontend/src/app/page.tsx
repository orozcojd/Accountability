'use client';

/**
 * Homepage - REDESIGNED
 * Bold, impactful accountability platform homepage
 * Inspired by investigative journalism - ProPublica, The Intercept
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { BrokenPromiseCard } from '@/components/accountability/BrokenPromiseCard';
import { RedFlagsList } from '@/components/accountability/RedFlagsList';
import { mockOfficials } from '@/lib/mockData';
import type { SearchFilters, OfficialCardData } from '@/types/official';
import { getOfficialPath, formatCurrency } from '@/lib/utils';
import type { Promise, RedFlag } from '@/components/accountability/BrokenPromiseCard';

// Mock data for latest findings (would come from API)
const latestBrokenPromises: Promise[] = [
  {
    id: '1',
    status: 'broken',
    statement: 'I will always fight to protect healthcare access for every American',
    statementSource: 'Campaign speech',
    statementDate: '2022-10-15',
    category: 'Healthcare',
    actions: [
      {
        description: 'Voted AGAINST Medicare expansion',
        date: '2024-03-12',
        voteCount: 8,
      },
      {
        description: 'Voted to cut Medicaid funding',
        date: '2024-06-20',
        voteCount: 4,
      },
    ],
  },
  {
    id: '2',
    status: 'broken',
    statement: 'I stand with working families and will oppose any corporate tax breaks',
    statementSource: 'Town hall meeting',
    statementDate: '2022-09-08',
    category: 'Economy',
    actions: [
      {
        description: 'Voted FOR $2.1B corporate tax incentive package',
        date: '2024-02-14',
      },
    ],
  },
];

const latestRedFlags: RedFlag[] = [
  {
    id: 'rf1',
    severity: 'critical',
    title: 'Received $250K from pharma, then voted against drug pricing reform 12 times',
    description: 'Large pharmaceutical donations followed by consistent opposition to price controls',
    category: 'Donor Influence',
    date: '2024-11-01',
    evidence: [
      'Pfizer donation: $85,000 (Jan 2024)',
      'Moderna donation: $65,000 (Feb 2024)',
      'Voted against HR-4521 Medicare negotiation (March 2024)',
    ],
  },
  {
    id: 'rf2',
    severity: 'high',
    title: 'Hasn\'t held a town hall in 18 months',
    description: 'Avoiding direct constituent contact while voting against district interests',
    category: 'Transparency',
    date: '2024-10-28',
  },
  {
    id: 'rf3',
    severity: 'high',
    title: 'Missed 34% of votes this session',
    description: 'Attendance rate significantly below average while collecting full salary',
    category: 'Attendance',
    date: '2024-10-25',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showSearch, setShowSearch] = useState(false);

  // Filter officials based on search criteria
  const filteredOfficials = useMemo(() => {
    let filtered = mockOfficials;

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (official) =>
          official.name.toLowerCase().includes(query) ||
          official.state.toLowerCase().includes(query) ||
          official.title.toLowerCase().includes(query)
      );
    }

    if (filters.state) {
      filtered = filtered.filter(
        (official) => official.state.toLowerCase() === filters.state?.toLowerCase()
      );
    }

    if (filters.chamber) {
      const isSenate = filters.chamber === 'senate';
      filtered = filtered.filter((official) =>
        isSenate ? !official.district : !!official.district
      );
    }

    if (filters.party) {
      filtered = filtered.filter(
        (official) => official.party === filters.party
      );
    }

    if (filters.upForReelection) {
      filtered = filtered.filter((official) => official.upForReelection);
    }

    return filtered;
  }, [filters]);

  // Get autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!filters.query || filters.query.length < 2) return [];
    return filteredOfficials.slice(0, 5);
  }, [filters.query, filteredOfficials]);

  const handleSelectSuggestion = (official: OfficialCardData) => {
    const path = getOfficialPath(
      official.state,
      official.district ? 'house' : 'senate',
      official.name
    );
    router.push(path);
  };

  const isSearchActive = filters.query || filters.state || filters.chamber || filters.party || filters.upForReelection;

  return (
    <div className="bg-off-white min-h-screen">
      {/* BOLD Hero Section - Investigative Journalism Style */}
      <section className="bg-text-black text-text-inverse py-4xl px-4 border-b-4 border-broken-promise">
        <div className="mx-auto max-w-6xl">
          <div className="mb-xl">
            <h1 className="text-hero font-serif mb-md">
              Are They Working FOR You, or AGAINST You?
            </h1>
            <p className="text-body-large max-w-3xl">
              Track what elected officials <strong className="text-broken-promise">promised</strong> vs. what they <strong className="text-kept-promise">actually did</strong>.
              Follow the money. Reveal the truth.
            </p>
          </div>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-primary text-body-large px-xl py-4"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            Search Officials
          </button>
        </div>
      </section>

      {/* Search Section (Collapsible) */}
      {showSearch && (
        <>
          <section className="bg-white py-lg px-4 border-b-2 border-text-black">
            <div className="mx-auto max-w-6xl">
              <SearchBar
                onSearch={(query) => setFilters({ ...filters, query })}
                suggestions={suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                className="mb-lg"
              />
              <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </section>

          {isSearchActive && (
            <section className="py-xl px-4">
              <div className="mx-auto max-w-6xl">
                <div className="mb-lg">
                  <h2 className="text-section-title font-serif">
                    Search Results
                    <span className="text-body text-neutral ml-3 font-sans">
                      ({filteredOfficials.length} {filteredOfficials.length === 1 ? 'official' : 'officials'})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  {filteredOfficials.map((official) => (
                    <OfficialCardCompact key={official.name} official={official} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ACCOUNTABILITY IN ACTION Section */}
      {!isSearchActive && (
        <>
          {/* This Week's Broken Promises */}
          <section className="py-4xl px-4 bg-white">
            <div className="mx-auto max-w-6xl">
              <div className="mb-2xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-16 bg-broken-promise" />
                  <h2 className="text-section-title font-serif font-bold text-broken-promise-dark">
                    THIS WEEK'S BROKEN PROMISES
                  </h2>
                </div>
                <p className="text-body-large text-dark-gray max-w-3xl">
                  Recent contradictions between campaign promises and actual votes. These officials said one thing and did another.
                </p>
              </div>

              <div className="space-y-xl">
                {latestBrokenPromises.map((promise) => (
                  <BrokenPromiseCard key={promise.id} promise={promise} />
                ))}
              </div>

              <div className="mt-xl text-center">
                <Link href="/broken-promises" className="btn btn-outline text-body-large px-xl py-4">
                  View All Broken Promises
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Red Flag Alerts */}
          <section className="py-4xl px-4 bg-off-white">
            <div className="mx-auto max-w-6xl">
              <div className="mb-2xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-16 bg-warning" />
                  <h2 className="text-section-title font-serif font-bold text-warning-dark">
                    RED FLAG ALERTS
                  </h2>
                </div>
                <p className="text-body-large text-dark-gray max-w-3xl">
                  Automatically detected issues: suspicious donation timing, broken promises, poor transparency, and more.
                </p>
              </div>

              <RedFlagsList flags={latestRedFlags} showFilters={false} />

              <div className="mt-xl text-center">
                <Link href="/red-flags" className="btn btn-danger text-body-large px-xl py-4">
                  View All Red Flags
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Follow the Money Spotlight */}
          <section className="py-4xl px-4 bg-primary-light border-y-2 border-primary">
            <div className="mx-auto max-w-6xl">
              <div className="mb-2xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-16 bg-primary" />
                  <h2 className="text-section-title font-serif font-bold text-primary">
                    FOLLOW THE MONEY
                  </h2>
                </div>
                <p className="text-body-large text-dark-gray max-w-3xl">
                  Biggest donor influence cases this month
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-xl">
                <FollowTheMoneyCard
                  official="Sen. Johnson (WI)"
                  amount={450000}
                  industry="Pharmaceutical"
                  votes={15}
                  alignment={94}
                />
                <FollowTheMoneyCard
                  official="Rep. Martinez (TX-23)"
                  amount={380000}
                  industry="Oil & Gas"
                  votes={23}
                  alignment={89}
                />
              </div>

              <div className="mt-xl text-center">
                <Link href="/influence-analysis" className="btn btn-primary text-body-large px-xl py-4">
                  Explore Influence Analysis
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-3xl px-4 bg-text-black text-text-inverse">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-page-title font-serif mb-lg">
                Accountability Isn't About Being Polite
              </h2>
              <p className="text-body-large mb-xl max-w-2xl mx-auto">
                It's about revealing truth. Search for your representatives and see if they're working for you or their donors.
              </p>
              <button
                onClick={() => {
                  setShowSearch(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-primary text-body-large px-xl py-4"
              >
                Start Investigating
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// Compact official card for search results
function OfficialCardCompact({ official }: { official: OfficialCardData }) {
  const path = getOfficialPath(
    official.state,
    official.district ? 'house' : 'senate',
    official.name
  );

  return (
    <Link
      href={path}
      className="block bg-white border border-light-gray p-lg hover:border-primary hover:shadow-md transition-all"
    >
      <div className="text-component-title font-bold text-text-black mb-xs truncate">
        {official.name}
      </div>
      <div className="text-body-small text-neutral mb-md">
        {official.title} • {official.state}
        {official.district && ` District ${official.district}`}
      </div>
      {official.votingParticipation !== undefined && (
        <div className="text-body-small text-dark-gray">
          Voting: <span className="font-mono font-semibold">{Math.round(official.votingParticipation * 100)}%</span>
        </div>
      )}
    </Link>
  );
}

// Follow the money spotlight card
function FollowTheMoneyCard({
  official,
  amount,
  industry,
  votes,
  alignment,
}: {
  official: string;
  amount: number;
  industry: string;
  votes: number;
  alignment: number;
}) {
  return (
    <div className="bg-white border-2 border-warning p-xl shadow-lg">
      <div className="text-subsection font-bold text-text-black mb-md">
        {official}
      </div>
      <div className="space-y-md">
        <div>
          <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
            Received from {industry}
          </div>
          <div className="data-medium text-warning-dark">
            {formatCurrency(amount)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-md">
          <div>
            <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
              Favorable Votes
            </div>
            <div className="text-data-medium text-warning-dark">
              {votes}
            </div>
          </div>
          <div>
            <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
              Alignment
            </div>
            <div className="text-data-medium text-broken-promise">
              {alignment}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
