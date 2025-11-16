/**
 * QuickVerdict Component
 * At-a-glance summary of an official's accountability
 * Shows score, grade, and top 3 red flags prominently
 */

import { cn } from '@/lib/utils';
import type { RedFlag } from './RedFlagsList';

interface QuickVerdictProps {
  score: number; // 0-100
  grade: string; // A-F
  promiseKeepingRate: number; // percentage
  topRedFlags: RedFlag[];
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-kept-promise';
  if (score >= 60) return 'text-warning';
  return 'text-broken-promise';
};

const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-kept-promise';
  if (score >= 60) return 'bg-warning';
  return 'bg-broken-promise';
};

const getVerdict = (score: number): string => {
  if (score >= 80) return 'WORKING FOR YOU';
  if (score >= 60) return 'MIXED RECORD';
  if (score >= 40) return 'QUESTIONABLE';
  return 'NOT ACCOUNTABLE';
};

export function QuickVerdict({ score, grade, promiseKeepingRate, topRedFlags, className }: QuickVerdictProps) {
  const scoreColor = getScoreColor(score);
  const scoreBgColor = getScoreBgColor(score);
  const verdict = getVerdict(score);

  return (
    <div className={cn('bg-white border-2 border-text-black shadow-xl', className)}>
      {/* Header */}
      <div className="bg-text-black text-text-inverse px-lg py-md border-b-2 border-text-black">
        <div className="text-subsection font-serif font-bold">
          QUICK VERDICT
        </div>
      </div>

      {/* Score Display */}
      <div className="px-lg py-xl border-b-2 border-light-gray">
        <div className="flex items-start gap-lg">
          {/* Large Score */}
          <div className="flex-shrink-0">
            <div className={cn('data-huge', scoreColor)}>
              {score}
            </div>
            <div className="text-center">
              <div className={cn('text-4xl font-bold', scoreColor)}>
                {grade}
              </div>
            </div>
          </div>

          {/* Verdict and Promise Rate */}
          <div className="flex-1 pt-md">
            <div className={cn(
              'inline-block px-3 py-1 rounded-sm font-black text-body-large tracking-wide mb-md',
              scoreBgColor,
              'text-white'
            )}>
              {verdict}
            </div>
            <div className="space-y-md">
              <div>
                <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
                  Promise Keeping
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 bg-light-gray rounded-sm overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        promiseKeepingRate >= 60 ? 'bg-kept-promise' : 'bg-broken-promise'
                      )}
                      style={{ width: `${promiseKeepingRate}%` }}
                    />
                  </div>
                  <div className={cn(
                    'font-mono text-body font-bold min-w-[3rem] text-right',
                    promiseKeepingRate >= 60 ? 'text-kept-promise' : 'text-broken-promise'
                  )}>
                    {Math.round(promiseKeepingRate)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Red Flags */}
      <div className="px-lg py-md">
        <div className="flex items-center gap-2 mb-md">
          <svg className="w-5 h-5 text-broken-promise" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-body font-bold text-broken-promise-dark">
            Top {topRedFlags.length} Red Flags
          </div>
        </div>

        {topRedFlags.length === 0 ? (
          <div className="text-body-small text-neutral italic py-md text-center">
            No major red flags detected
          </div>
        ) : (
          <div className="space-y-2">
            {topRedFlags.slice(0, 3).map((flag, idx) => (
              <div
                key={flag.id}
                className="flex items-start gap-3 p-md bg-broken-promise-light/30 border-l-4 border-broken-promise rounded-sm"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-broken-promise text-white flex items-center justify-center font-bold text-caption">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-semibold text-text-black">
                    {flag.title}
                  </div>
                  {flag.category && (
                    <div className="text-caption text-neutral uppercase tracking-wide mt-xs">
                      {flag.category}
                    </div>
                  )}
                </div>
                <div className={cn(
                  'flex-shrink-0 px-2 py-1 rounded-sm text-caption font-bold',
                  flag.severity === 'critical'
                    ? 'bg-broken-promise text-white'
                    : flag.severity === 'high'
                    ? 'bg-broken-promise-light text-broken-promise-dark'
                    : 'bg-warning-light text-warning-dark'
                )}>
                  {flag.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Message */}
      <div className={cn(
        'border-t-2 px-lg py-md text-center',
        score >= 60 ? 'bg-kept-promise-light border-kept-promise' : 'bg-broken-promise-light border-broken-promise'
      )}>
        <div className={cn(
          'text-body font-bold',
          score >= 60 ? 'text-kept-promise-dark' : 'text-broken-promise-dark'
        )}>
          {score >= 80 && 'Strong record of accountability and constituent service'}
          {score >= 60 && score < 80 && 'Mixed record - some concerns but showing effort'}
          {score >= 40 && score < 60 && 'Serious accountability concerns detected'}
          {score < 40 && 'Failing to represent constituents - major red flags'}
        </div>
      </div>
    </div>
  );
}
