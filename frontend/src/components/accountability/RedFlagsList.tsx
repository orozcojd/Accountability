/**
 * RedFlagsList Component
 * Displays critical red flags and warnings about an official
 * Sortable by severity, with expandable details
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export type RedFlagSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface RedFlag {
  id: string;
  severity: RedFlagSeverity;
  title: string;
  description: string;
  evidence?: string[];
  date?: string;
  category?: string;
}

interface RedFlagsListProps {
  flags: RedFlag[];
  className?: string;
  showFilters?: boolean;
}

const severityConfig = {
  critical: {
    label: 'CRITICAL',
    color: 'bg-broken-promise text-white',
    borderColor: 'border-broken-promise',
    icon: '🚨',
    priority: 4,
  },
  high: {
    label: 'HIGH',
    color: 'bg-broken-promise-light text-broken-promise-dark',
    borderColor: 'border-broken-promise',
    icon: '⚠️',
    priority: 3,
  },
  medium: {
    label: 'MEDIUM',
    color: 'bg-warning-light text-warning-dark',
    borderColor: 'border-warning',
    icon: '⚡',
    priority: 2,
  },
  low: {
    label: 'LOW',
    color: 'bg-neutral-light text-neutral-dark',
    borderColor: 'border-neutral',
    icon: 'ℹ️',
    priority: 1,
  },
};

export function RedFlagsList({ flags, className, showFilters = true }: RedFlagsListProps) {
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');
  const [filterSeverity, setFilterSeverity] = useState<RedFlagSeverity | 'all'>('all');
  const [expandedFlags, setExpandedFlags] = useState<Set<string>>(new Set());

  // Filter flags
  let filteredFlags = flags;
  if (filterSeverity !== 'all') {
    filteredFlags = flags.filter((flag) => flag.severity === filterSeverity);
  }

  // Sort flags
  const sortedFlags = [...filteredFlags].sort((a, b) => {
    if (sortBy === 'severity') {
      return severityConfig[b.severity].priority - severityConfig[a.severity].priority;
    }
    // Sort by date
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  const toggleFlag = (id: string) => {
    const newExpanded = new Set(expandedFlags);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFlags(newExpanded);
  };

  const criticalCount = flags.filter((f) => f.severity === 'critical').length;
  const highCount = flags.filter((f) => f.severity === 'high').length;

  return (
    <div className={cn('bg-white border-l-4 border-broken-promise shadow-md', className)}>
      {/* Header */}
      <div className="bg-broken-promise-light border-b-2 border-broken-promise px-lg py-md">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-broken-promise flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-component-title font-bold text-broken-promise-dark">
              Red Flags Detected
            </h3>
            <p className="text-body-small text-broken-promise-dark">
              {criticalCount} Critical • {highCount} High Priority Issues
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-light-gray px-lg py-md flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-body-small font-semibold text-neutral">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'severity' | 'date')}
              className="text-body-small border border-medium-gray rounded-sm px-2 py-1"
            >
              <option value="severity">Severity</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body-small font-semibold text-neutral">Filter:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as RedFlagSeverity | 'all')}
              className="text-body-small border border-medium-gray rounded-sm px-2 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Flags List */}
      <div className="divide-y divide-light-gray">
        {sortedFlags.length === 0 ? (
          <div className="px-lg py-xl text-center text-neutral">
            No red flags match your filters.
          </div>
        ) : (
          sortedFlags.map((flag) => (
            <RedFlagItem
              key={flag.id}
              flag={flag}
              isExpanded={expandedFlags.has(flag.id)}
              onToggle={() => toggleFlag(flag.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface RedFlagItemProps {
  flag: RedFlag;
  isExpanded: boolean;
  onToggle: () => void;
}

function RedFlagItem({ flag, isExpanded, onToggle }: RedFlagItemProps) {
  const config = severityConfig[flag.severity];

  return (
    <div className="px-lg py-md hover:bg-off-white transition-colors">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start gap-3 group"
      >
        {/* Severity Badge */}
        <div
          className={cn(
            'flex-shrink-0 px-2 py-1 rounded-sm text-caption font-bold border',
            config.color,
            config.borderColor
          )}
        >
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-body font-bold text-text-black mb-1 group-hover:text-primary">
            {flag.title}
          </h4>
          {flag.category && (
            <span className="text-caption text-neutral uppercase tracking-wide font-semibold">
              {flag.category}
            </span>
          )}
        </div>

        {/* Expand Icon */}
        <svg
          className={cn(
            'w-5 h-5 text-neutral flex-shrink-0 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-md pl-3 border-l-2 border-broken-promise ml-lg">
          <p className="text-body text-dark-gray mb-md">{flag.description}</p>

          {flag.evidence && flag.evidence.length > 0 && (
            <div className="bg-off-white p-md rounded-sm">
              <div className="text-body-small font-bold text-text-black mb-2">Evidence:</div>
              <ul className="space-y-1">
                {flag.evidence.map((item, idx) => (
                  <li key={idx} className="text-body-small text-dark-gray flex items-start gap-2">
                    <span className="text-broken-promise">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flag.date && (
            <div className="mt-md text-caption text-neutral">
              Detected: {new Date(flag.date).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
