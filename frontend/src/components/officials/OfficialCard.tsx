/**
 * Official Card Component
 * Grid view card for displaying official information
 * Used on: Homepage, search results
 */

import Link from 'next/link';
import { cn, formatCurrency, formatPercent, getOfficialPath, getPartyLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { OfficialCardData } from '@/types/official';

interface OfficialCardProps {
  official: OfficialCardData;
  variant?: 'grid' | 'list' | 'featured';
  className?: string;
}

export function OfficialCard({ official, variant = 'grid', className }: OfficialCardProps) {
  const officialPath = getOfficialPath(
    official.state,
    official.district ? 'house' : 'senate',
    official.name
  );

  return (
    <article
      className={cn(
        'bg-white border border-light-gray rounded-lg overflow-hidden',
        'shadow-sm hover:shadow-md transition-all duration-200',
        'flex flex-col h-full',
        className
      )}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header with Photo and Name */}
        <div className="flex items-start gap-4 mb-4">
          {official.photoUrl ? (
            <img
              src={official.photoUrl}
              alt={`Photo of ${official.name}`}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-light-gray"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-light-gray flex items-center justify-center flex-shrink-0">
              <svg
                className="w-12 h-12 text-medium-gray"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-component-title font-semibold text-text-black mb-1 truncate">
              {official.name}
            </h3>
            <p className="text-body-small text-dark-gray">
              {official.title}
            </p>
            <p className="text-body-small text-medium-gray">
              {official.state}
              {official.district && ` District ${official.district}`}
              {' '}
              <span className="font-medium">{getPartyLabel(official.party)}</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        {(official.promisesCount !== undefined ||
          official.votingParticipation !== undefined ||
          official.totalRaised !== undefined) && (
          <div className="space-y-2 mb-4 flex-1">
            {official.promisesCount !== undefined && (
              <div className="flex items-center gap-2 text-body-small">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-dark-gray">
                  <span className="font-semibold text-text-black">{official.promisesCount}</span> promises tracked
                </span>
              </div>
            )}

            {official.votingParticipation !== undefined && (
              <div className="flex items-center gap-2 text-body-small">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-dark-gray">
                  Voting record: <span className="font-semibold text-text-black">{formatPercent(official.votingParticipation)}</span>
                </span>
              </div>
            )}

            {official.totalRaised !== undefined && (
              <div className="flex items-center gap-2 text-body-small">
                <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-dark-gray">
                  Raised: <span className="font-semibold text-text-black">{formatCurrency(official.totalRaised)}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Badges */}
        {official.upForReelection && (
          <div className="mb-4">
            <Badge variant="warning">
              Up for re-election {official.nextElection ? new Date(official.nextElection).getFullYear() : ''}
            </Badge>
          </div>
        )}

        {/* View Profile Button */}
        <div className="mt-auto pt-4">
          <Link
            href={officialPath}
            className="btn btn-primary w-full justify-center"
            aria-label={`View profile for ${official.name}`}
          >
            View Profile
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
