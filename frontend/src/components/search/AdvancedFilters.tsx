'use client';

/**
 * Advanced Filters Component
 * Accordion-style filters for state, chamber, party, etc.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { US_STATES } from '@/lib/constants';
import type { SearchFilters, Party } from '@/types/official';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  className,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      query: filters.query, // Keep the search query
    });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'query' && filters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <div className={cn('border border-light-gray rounded-lg overflow-hidden', className)}>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-off-white transition-colors"
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-panel"
      >
        <div className="flex items-center gap-3">
          <span className="text-body font-semibold">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-caption font-semibold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-dark-gray transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div
          id="advanced-filters-panel"
          className="px-6 py-4 bg-off-white border-t border-light-gray"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* State Filter */}
            <div>
              <label htmlFor="filter-state" className="block text-body-small font-medium text-dark-gray mb-2">
                State
              </label>
              <select
                id="filter-state"
                value={filters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full rounded-md border border-medium-gray px-3 py-2 text-body focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              >
                <option value="">All States</option>
                {US_STATES.map((state) => (
                  <option key={state.code} value={state.code.toLowerCase()}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chamber Filter */}
            <div>
              <label htmlFor="filter-chamber" className="block text-body-small font-medium text-dark-gray mb-2">
                Chamber
              </label>
              <select
                id="filter-chamber"
                value={filters.chamber || ''}
                onChange={(e) => handleFilterChange('chamber', e.target.value)}
                className="w-full rounded-md border border-medium-gray px-3 py-2 text-body focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              >
                <option value="">All Chambers</option>
                <option value="house">House</option>
                <option value="senate">Senate</option>
              </select>
            </div>

            {/* Party Filter */}
            <div>
              <label htmlFor="filter-party" className="block text-body-small font-medium text-dark-gray mb-2">
                Party
              </label>
              <select
                id="filter-party"
                value={filters.party || ''}
                onChange={(e) => handleFilterChange('party', e.target.value)}
                className="w-full rounded-md border border-medium-gray px-3 py-2 text-body focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              >
                <option value="">All Parties</option>
                <option value="Democratic">Democratic</option>
                <option value="Republican">Republican</option>
                <option value="Independent">Independent</option>
              </select>
            </div>

            {/* District Filter (only shown if state is selected) */}
            {filters.state && filters.chamber === 'house' && (
              <div>
                <label htmlFor="filter-district" className="block text-body-small font-medium text-dark-gray mb-2">
                  District
                </label>
                <input
                  type="number"
                  id="filter-district"
                  min="1"
                  max="53"
                  placeholder="Enter district number"
                  className="w-full rounded-md border border-medium-gray px-3 py-2 text-body focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Checkbox Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.upForReelection || false}
                onChange={(e) => handleFilterChange('upForReelection', e.target.checked ? true : undefined)}
                className="w-4 h-4 text-primary border-medium-gray rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-body-small text-dark-gray">Up for re-election</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.recentlyActive || false}
                onChange={(e) => handleFilterChange('recentlyActive', e.target.checked ? true : undefined)}
                className="w-4 h-4 text-primary border-medium-gray rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-body-small text-dark-gray">Recently active</span>
            </label>
          </div>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-body-small text-primary hover:text-primary-hover hover:underline font-medium"
            >
              Clear all filters ({activeFilterCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
