/**
 * AccountabilityScoreCard Component
 * Large, bold display of overall accountability score with breakdown
 * Shows grade, trend, and category breakdown
 */

import { cn } from '@/lib/utils';

export interface AccountabilityScore {
  overall: number; // 0-100
  breakdown: {
    promiseKeeping: number;
    transparency: number;
    constituentAlignment: number;
    attendance: number;
    donorIndependence: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  trendChange?: number; // percentage change
}

interface AccountabilityScoreCardProps {
  score: AccountabilityScore;
  className?: string;
  showBreakdown?: boolean;
}

const getGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

const getGradeColor = (score: number): string => {
  if (score >= 80) return 'text-kept-promise';
  if (score >= 60) return 'text-warning';
  return 'text-broken-promise';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'STRONG';
  if (score >= 60) return 'FAIR';
  if (score >= 40) return 'POOR';
  return 'FAILING';
};

export function AccountabilityScoreCard({
  score,
  className,
  showBreakdown = true,
}: AccountabilityScoreCardProps) {
  const grade = getGrade(score.overall);
  const gradeColor = getGradeColor(score.overall);
  const label = getScoreLabel(score.overall);

  return (
    <div className={cn('bg-white border-2 border-text-black p-xl shadow-lg', className)}>
      {/* Main Score Display */}
      <div className="text-center mb-lg">
        <div className="text-body-small font-bold text-neutral uppercase tracking-wider mb-xs">
          Accountability Score
        </div>
        <div className="flex items-center justify-center gap-4 mb-md">
          <div className={cn('data-huge', gradeColor)}>
            {score.overall}
          </div>
          <div className="text-left">
            <div className={cn('text-6xl font-bold', gradeColor)}>
              {grade}
            </div>
            <div className={cn('text-body font-bold', gradeColor)}>
              {label}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2">
          {score.trend === 'improving' && (
            <>
              <svg className="w-5 h-5 text-kept-promise" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-body-small font-semibold text-kept-promise">
                Improving {score.trendChange ? `+${score.trendChange}%` : ''}
              </span>
            </>
          )}
          {score.trend === 'declining' && (
            <>
              <svg className="w-5 h-5 text-broken-promise" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-body-small font-semibold text-broken-promise">
                Declining {score.trendChange ? `${score.trendChange}%` : ''}
              </span>
            </>
          )}
          {score.trend === 'stable' && (
            <>
              <svg className="w-5 h-5 text-neutral" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-body-small font-semibold text-neutral">
                Stable
              </span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="border-t-2 border-light-gray pt-lg">
          <div className="text-body-small font-bold text-neutral uppercase tracking-wider mb-md">
            Score Breakdown
          </div>
          <div className="space-y-3">
            <ScoreBreakdownItem
              label="Promise Keeping"
              score={score.breakdown.promiseKeeping}
              weight={40}
            />
            <ScoreBreakdownItem
              label="Transparency"
              score={score.breakdown.transparency}
              weight={20}
            />
            <ScoreBreakdownItem
              label="Constituent Alignment"
              score={score.breakdown.constituentAlignment}
              weight={20}
            />
            <ScoreBreakdownItem
              label="Attendance"
              score={score.breakdown.attendance}
              weight={10}
            />
            <ScoreBreakdownItem
              label="Donor Independence"
              score={score.breakdown.donorIndependence}
              weight={10}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ScoreBreakdownItemProps {
  label: string;
  score: number;
  weight: number;
}

function ScoreBreakdownItem({ label, score, weight }: ScoreBreakdownItemProps) {
  const percentage = Math.round(score);
  const scoreColor = getGradeColor(score);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-body-small font-semibold text-text-black">
          {label} <span className="text-neutral font-normal">({weight}%)</span>
        </span>
        <span className={cn('font-mono text-body-small font-bold', scoreColor)}>
          {percentage}
        </span>
      </div>
      <div className="h-2 bg-light-gray rounded-sm overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            score >= 80 ? 'bg-kept-promise' : score >= 60 ? 'bg-warning' : 'bg-broken-promise'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
