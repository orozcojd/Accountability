/**
 * InfluenceCorrelationChart Component
 * Visual timeline showing donation spikes and subsequent favorable votes
 * Reveals potential correlation between money and voting behavior
 */

'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

export interface DonationEvent {
  id: string;
  date: string;
  amount: number;
  donor: string;
  industry: string;
}

export interface VoteEvent {
  id: string;
  date: string;
  bill: string;
  position: 'for' | 'against';
  industry: string;
  isFavorable: boolean; // favorable to the industry
}

export interface InfluenceCorrelation {
  industry: string;
  donations: DonationEvent[];
  votes: VoteEvent[];
  suspiciousTimings: {
    donationId: string;
    voteId: string;
    daysBetween: number;
  }[];
  alignmentScore: number; // 0-100, how often they vote with this industry
}

interface InfluenceCorrelationChartProps {
  data: InfluenceCorrelation;
  className?: string;
}

export function InfluenceCorrelationChart({ data, className }: InfluenceCorrelationChartProps) {
  // Combine and sort all events by date
  const allEvents = [
    ...data.donations.map((d) => ({ ...d, type: 'donation' as const })),
    ...data.votes.map((v) => ({ ...v, type: 'vote' as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalDonations = data.donations.reduce((sum, d) => sum + d.amount, 0);
  const favorableVotes = data.votes.filter((v) => v.isFavorable).length;
  const totalVotes = data.votes.length;

  return (
    <div className={cn('bg-white border-2 border-warning shadow-lg', className)}>
      {/* Header */}
      <div className="bg-warning-light border-b-2 border-warning px-lg py-md">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-component-title font-bold text-warning-dark mb-xs">
              Influence Analysis: {data.industry}
            </h3>
            <p className="text-body-small text-warning-dark">
              Following the money trail from donations to votes
            </p>
          </div>
          {data.suspiciousTimings.length > 0 && (
            <div className="bg-broken-promise text-white px-3 py-1 rounded-sm font-bold text-body-small">
              {data.suspiciousTimings.length} SUSPICIOUS TIMING{data.suspiciousTimings.length > 1 ? 'S' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 divide-x divide-light-gray border-b border-light-gray">
        <div className="px-lg py-md text-center">
          <div className="data-large text-warning-dark mb-xs">
            {formatCurrency(totalDonations)}
          </div>
          <div className="text-caption text-neutral uppercase font-bold tracking-wide">
            Total Received
          </div>
        </div>
        <div className="px-lg py-md text-center">
          <div className="data-large text-warning-dark mb-xs">
            {data.alignmentScore}%
          </div>
          <div className="text-caption text-neutral uppercase font-bold tracking-wide">
            Alignment Score
          </div>
        </div>
        <div className="px-lg py-md text-center">
          <div className="data-large text-warning-dark mb-xs">
            {favorableVotes}/{totalVotes}
          </div>
          <div className="text-caption text-neutral uppercase font-bold tracking-wide">
            Favorable Votes
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-lg">
        <div className="text-body-small font-bold text-neutral uppercase tracking-wider mb-md">
          Timeline: Donations → Votes
        </div>
        <div className="space-y-3 relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-light-gray" />

          {allEvents.map((event, idx) => {
            const suspicious = data.suspiciousTimings.find(
              (s) => s.donationId === event.id || s.voteId === event.id
            );

            if (event.type === 'donation') {
              const donation = event as DonationEvent & { type: 'donation' };
              return (
                <div key={event.id} className="relative pl-12">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-warning border-2 border-white shadow-md flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className={cn(
                    'bg-warning-light border border-warning p-md rounded-sm',
                    suspicious && 'ring-2 ring-broken-promise'
                  )}>
                    <div className="flex items-start justify-between mb-xs">
                      <div className="font-mono text-body font-bold text-warning-dark">
                        {formatCurrency(donation.amount)}
                      </div>
                      <div className="text-caption text-neutral">
                        {new Date(donation.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-body-small text-dark-gray">
                      From: <span className="font-semibold">{donation.donor}</span>
                    </div>
                    {suspicious && (
                      <div className="mt-2 text-caption font-bold text-broken-promise flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Favorable vote within {suspicious.daysBetween} days
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              const vote = event as VoteEvent & { type: 'vote' };
              return (
                <div key={event.id} className="relative pl-12">
                  <div className={cn(
                    'absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center',
                    vote.isFavorable ? 'bg-broken-promise' : 'bg-neutral'
                  )}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className={cn(
                    'border p-md rounded-sm',
                    vote.isFavorable
                      ? 'bg-broken-promise-light/30 border-broken-promise'
                      : 'bg-neutral-light border-neutral',
                    suspicious && 'ring-2 ring-broken-promise'
                  )}>
                    <div className="flex items-start justify-between mb-xs">
                      <div className="text-body font-semibold text-text-black">
                        Voted {vote.position.toUpperCase()}
                      </div>
                      <div className="text-caption text-neutral">
                        {new Date(vote.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-body-small text-dark-gray mb-xs">
                      {vote.bill}
                    </div>
                    {vote.isFavorable && (
                      <div className="text-caption font-bold text-broken-promise">
                        ✓ Favorable to {data.industry}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Analysis Footer */}
      {data.alignmentScore >= 70 && (
        <div className="border-t-2 border-broken-promise bg-broken-promise-light px-lg py-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-broken-promise flex-shrink-0 mt-xs" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <div className="text-body font-bold text-broken-promise-dark mb-xs">
                High Correlation Detected
              </div>
              <div className="text-body-small text-broken-promise-dark">
                This official votes with {data.industry} interests {data.alignmentScore}% of the time,
                significantly above average. Consider whether they're representing constituents or donors.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
