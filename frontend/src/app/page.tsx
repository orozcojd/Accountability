'use client';

/**
 * Homepage
 * Main search interface with filters and featured officials
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { AdvancedFilters } from '@/components/search/AdvancedFilters';
import { OfficialCardGrid } from '@/components/officials/OfficialCardGrid';
import { mockOfficials } from '@/lib/mockData';
import type { SearchFilters, OfficialCardData } from '@/types/official';
import { getOfficialPath } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({});

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

  // Get officials up for re-election
  const reelectionOfficials = mockOfficials.filter((o) => o.upForReelection).slice(0, 6);

  return (
    <div className="bg-off-white">
      {/* Hero Section */}
      <section className="bg-white py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-page-title mb-4">
            Track what your elected officials promised vs. what they&apos;re actually doing
          </h1>
          <p className="text-body-large text-dark-gray mb-8">
            Search by name, state, or district to view voting records, campaign promises, and financial disclosures.
          </p>

          {/* Search Bar */}
          <SearchBar
            onSearch={(query) => setFilters({ ...filters, query })}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="bg-white border-t border-light-gray py-6 px-4">
        <div className="mx-auto max-w-7xl">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </section>

      {/* Search Results or Featured Officials */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          {filters.query || filters.state || filters.chamber || filters.party || filters.upForReelection ? (
            <>
              <div className="mb-6">
                <h2 className="text-section-title">
                  Search Results
                  <span className="text-body text-medium-gray ml-3">
                    ({filteredOfficials.length} {filteredOfficials.length === 1 ? 'official' : 'officials'})
                  </span>
                </h2>
              </div>
              <OfficialCardGrid
                officials={filteredOfficials}
                emptyMessage="No officials found matching your search criteria. Try adjusting your filters."
              />
            </>
          ) : (
            <>
              {/* Officials Up for Re-election */}
              {reelectionOfficials.length > 0 && (
                <div className="mb-12">
                  <div className="mb-6">
                    <h2 className="text-section-title mb-2">
                      Up for Re-election in 2026
                    </h2>
                    <p className="text-body text-dark-gray">
                      These officials are running for re-election. Track their promises and actions.
                    </p>
                  </div>
                  <OfficialCardGrid officials={reelectionOfficials} />
                </div>
              )}

              {/* All Officials */}
              <div>
                <div className="mb-6">
                  <h2 className="text-section-title mb-2">
                    All Officials
                  </h2>
                  <p className="text-body text-dark-gray">
                    Browse all tracked elected officials or use the search and filters above.
                  </p>
                </div>
                <OfficialCardGrid officials={mockOfficials.slice(0, 12)} />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
