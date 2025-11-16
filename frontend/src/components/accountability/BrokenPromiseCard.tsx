/**
 * BrokenPromiseCard Component
 * Split layout showing SAID vs. DID with evidence
 * Makes contradictions impossible to ignore
 */

import { cn } from '@/lib/utils';

export type PromiseStatus = 'broken' | 'kept' | 'in-progress' | 'not-addressed';

export interface Promise {
  id: string;
  status: PromiseStatus;
  statement: string;
  statementSource: string;
  statementDate: string;
  actions: {
    description: string;
    date: string;
    voteCount?: number;
  }[];
  category?: string;
}

interface BrokenPromiseCardProps {
  promise: Promise;
  className?: string;
}

const statusConfig = {
  broken: {
    label: 'BROKEN',
    bgColor: 'bg-broken-promise-light',
    borderColor: 'border-broken-promise',
    textColor: 'text-broken-promise-dark',
    icon: '❌',
  },
  kept: {
    label: 'KEPT',
    bgColor: 'bg-kept-promise-light',
    borderColor: 'border-kept-promise',
    textColor: 'text-kept-promise-dark',
    icon: '✓',
  },
  'in-progress': {
    label: 'IN PROGRESS',
    bgColor: 'bg-warning-light',
    borderColor: 'border-warning',
    textColor: 'text-warning-dark',
    icon: '⏳',
  },
  'not-addressed': {
    label: 'NOT ADDRESSED',
    bgColor: 'bg-neutral-light',
    borderColor: 'border-neutral',
    textColor: 'text-neutral-dark',
    icon: '⏸️',
  },
};

export function BrokenPromiseCard({ promise, className }: BrokenPromiseCardProps) {
  const config = statusConfig[promise.status];

  return (
    <div className={cn('bg-white border-2 shadow-md overflow-hidden', config.borderColor, className)}>
      {/* Status Header */}
      <div className={cn('px-lg py-md border-b-2', config.bgColor, config.borderColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className={cn('text-component-title font-black tracking-wide', config.textColor)}>
              {config.label}
            </span>
          </div>
          {promise.category && (
            <span className="text-caption font-bold uppercase tracking-wide text-neutral bg-white px-2 py-1 rounded-sm">
              {promise.category}
            </span>
          )}
        </div>
      </div>

      {/* SAID vs DID Split Layout */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-light-gray">
        {/* SAID Section */}
        <div className="p-lg">
          <div className="flex items-center gap-2 mb-md">
            <div className="text-subsection font-serif font-bold text-text-black">
              SAID
            </div>
            <div className="h-px flex-1 bg-light-gray" />
          </div>
          <blockquote className="border-l-4 border-primary pl-md mb-md">
            <p className="text-body-large italic text-dark-gray leading-relaxed">
              "{promise.statement}"
            </p>
          </blockquote>
          <div className="space-y-1">
            <div className="text-body-small text-neutral">
              <span className="font-semibold">Source:</span> {promise.statementSource}
            </div>
            <div className="text-body-small text-neutral">
              <span className="font-semibold">Date:</span>{' '}
              {new Date(promise.statementDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* DID Section */}
        <div className={cn('p-lg', promise.status === 'broken' ? 'bg-broken-promise-light/30' : '')}>
          <div className="flex items-center gap-2 mb-md">
            <div className="text-subsection font-serif font-bold text-text-black">
              DID
            </div>
            <div className="h-px flex-1 bg-light-gray" />
          </div>
          <div className="space-y-md">
            {promise.actions.map((action, idx) => (
              <div key={idx} className="border-l-4 border-broken-promise pl-md">
                <p className="text-body font-semibold text-text-black mb-xs">
                  {action.description}
                  {action.voteCount && (
                    <span className={cn('ml-2 font-mono text-body-small', config.textColor)}>
                      ({action.voteCount}x)
                    </span>
                  )}
                </p>
                <div className="text-body-small text-neutral">
                  {new Date(action.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary for broken promises */}
          {promise.status === 'broken' && promise.actions.length > 1 && (
            <div className="mt-md pt-md border-t border-broken-promise">
              <div className={cn('text-emphasis font-bold', config.textColor)}>
                Total contradictory actions: {promise.actions.reduce((sum, a) => sum + (a.voteCount || 1), 0)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Count Footer (if applicable) */}
      {promise.status === 'broken' && (
        <div className="border-t-2 border-broken-promise bg-broken-promise-light px-lg py-md">
          <div className="flex items-center gap-2 text-body-small text-broken-promise-dark">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">
              {promise.actions.length} {promise.actions.length === 1 ? 'piece' : 'pieces'} of evidence
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
