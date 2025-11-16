/**
 * Official Card Grid Component
 * Responsive grid layout for official cards
 */

import { cn } from '@/lib/utils';
import { OfficialCard } from './OfficialCard';
import type { OfficialCardData } from '@/types/official';

interface OfficialCardGridProps {
  officials: OfficialCardData[];
  emptyMessage?: string;
  className?: string;
}

export function OfficialCardGrid({
  officials,
  emptyMessage = 'No officials found',
  className,
}: OfficialCardGridProps) {
  if (officials.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-12 w-12 text-medium-gray mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-body text-medium-gray">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {officials.map((official) => (
        <OfficialCard key={official.id} official={official} />
      ))}
    </div>
  );
}
