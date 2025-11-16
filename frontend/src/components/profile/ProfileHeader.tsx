/**
 * Profile Header Component
 * Displays official's basic information and re-election status
 */

import { formatDate, getPartyLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Official } from '@/types/official';

interface ProfileHeaderProps {
  official: Official;
}

export function ProfileHeader({ official }: ProfileHeaderProps) {
  const { personal, reElection } = official;

  // Calculate years in office
  const yearsInOffice = official.metadata.createdAt
    ? new Date().getFullYear() - new Date(official.metadata.createdAt).getFullYear()
    : 0;

  return (
    <div className="bg-white border-b border-light-gray py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Photo */}
          {personal.photoUrl ? (
            <img
              src={personal.photoUrl}
              alt={`Photo of ${personal.name}`}
              className="w-32 h-32 rounded-full object-cover border-4 border-light-gray flex-shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-light-gray flex items-center justify-center flex-shrink-0">
              <svg
                className="w-20 h-20 text-medium-gray"
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

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-page-title mb-2">{personal.name}</h1>
            <p className="text-body-large text-dark-gray mb-1">
              {official.type === 'representative'
                ? `U.S. Representative, ${personal.state} District ${personal.district}`
                : `U.S. Senator, ${personal.state}`}
              {' '}
              <span className="font-semibold text-party-neutral">
                {getPartyLabel(personal.party)}
              </span>
            </p>

            {yearsInOffice > 0 && (
              <p className="text-body text-medium-gray mb-4">
                In office since: {new Date().getFullYear() - yearsInOffice}
              </p>
            )}

            {/* Re-election Info */}
            {reElection && (
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="warning">
                  Next Election: {formatDate(reElection.nextElection)}
                </Badge>
                <Badge variant="info">
                  Term ends: {formatDate(reElection.termEnd)}
                </Badge>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => window.print()}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                Share
              </button>
              <button type="button" className="btn btn-outline">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Data
              </button>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-caption text-medium-gray mt-6">
          Last updated: {formatDate(official.metadata.lastScraped)}
        </p>
      </div>
    </div>
  );
}
