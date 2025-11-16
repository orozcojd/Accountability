'use client';

/**
 * Search Bar Component
 * With autocomplete functionality
 * Debounced search with keyboard navigation
 */

import { useState, useEffect, useRef } from 'react';
import { debounce } from '@/lib/utils';
import type { OfficialCardData } from '@/types/official';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: OfficialCardData[];
  onSelectSuggestion?: (official: OfficialCardData) => void;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search by name, state, or district...',
  suggestions = [],
  onSelectSuggestion,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((value: string) => {
      if (value.length >= 2) {
        onSearch(value);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (official: OfficialCardData) => {
    setQuery(official.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelectSuggestion?.(official);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      <label htmlFor="search-input" className="sr-only">
        Search for elected officials
      </label>

      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-medium-gray"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="search"
            id="search-input"
            className="block w-full rounded-lg border-2 border-medium-gray py-3 pl-12 pr-12 text-body placeholder:text-medium-gray focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-medium-gray hover:text-dark-gray"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            id="search-suggestions"
            role="listbox"
            className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-light-gray max-h-96 overflow-y-auto"
          >
            {suggestions.map((official, index) => (
              <button
                key={official.id}
                type="button"
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelectSuggestion(official)}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left border-b border-light-gray last:border-b-0 transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-light'
                    : 'hover:bg-off-white'
                }`}
              >
                {official.photoUrl && (
                  <img
                    src={official.photoUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-body text-text-black truncate">
                    {official.name}
                  </p>
                  <p className="text-body-small text-dark-gray">
                    {official.title} • {official.state}
                    {official.district && ` District ${official.district}`} ({official.party[0]})
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showSuggestions && query.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-10 mt-2 w-full rounded-lg bg-white shadow-lg border border-light-gray px-4 py-8 text-center">
            <p className="text-body text-medium-gray">No officials found matching &quot;{query}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
