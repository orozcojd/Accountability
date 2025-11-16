/**
 * ImpactMeter Component
 * Shows local district impact with dollar amounts, jobs affected, and comparisons
 * Makes the consequences of votes personal and tangible
 */

import { cn, formatCurrency } from '@/lib/utils';

export interface DistrictImpact {
  funding: {
    gained: number;
    lost: number;
    net: number;
  };
  jobs: {
    created: number;
    lost: number;
    net: number;
  };
  programs: {
    name: string;
    change: number; // positive or negative
    category: string;
  }[];
  vsAverage?: {
    percentile: number; // 0-100
    comparison: 'above' | 'below' | 'average';
  };
}

interface ImpactMeterProps {
  impact: DistrictImpact;
  districtName: string;
  className?: string;
}

export function ImpactMeter({ impact, districtName, className }: ImpactMeterProps) {
  const netImpactPositive = impact.funding.net >= 0;
  const jobsNetPositive = impact.jobs.net >= 0;

  return (
    <div className={cn('bg-white border-2 border-primary shadow-lg', className)}>
      {/* Header */}
      <div className="bg-primary-light border-b-2 border-primary px-lg py-md">
        <h3 className="text-component-title font-bold text-primary">
          District Impact: {districtName}
        </h3>
        <p className="text-body-small text-primary">
          How their votes affected YOUR community
        </p>
      </div>

      {/* Net Impact Summary */}
      <div className="grid grid-cols-2 divide-x divide-light-gray border-b-2 border-light-gray">
        {/* Funding Impact */}
        <div className="p-lg text-center">
          <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
            Net Funding Impact
          </div>
          <div className={cn(
            'data-large mb-md',
            netImpactPositive ? 'text-kept-promise' : 'text-broken-promise'
          )}>
            {netImpactPositive ? '+' : ''}{formatCurrency(impact.funding.net)}
          </div>
          <div className="space-y-1 text-body-small">
            <div className="flex justify-between items-center">
              <span className="text-neutral">Gained:</span>
              <span className="font-mono font-semibold text-kept-promise">
                +{formatCurrency(impact.funding.gained)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral">Lost:</span>
              <span className="font-mono font-semibold text-broken-promise">
                -{formatCurrency(impact.funding.lost)}
              </span>
            </div>
          </div>
        </div>

        {/* Jobs Impact */}
        <div className="p-lg text-center">
          <div className="text-caption text-neutral uppercase font-bold tracking-wide mb-xs">
            Net Jobs Impact
          </div>
          <div className={cn(
            'data-large mb-md',
            jobsNetPositive ? 'text-kept-promise' : 'text-broken-promise'
          )}>
            {jobsNetPositive ? '+' : ''}{impact.jobs.net.toLocaleString()}
          </div>
          <div className="space-y-1 text-body-small">
            <div className="flex justify-between items-center">
              <span className="text-neutral">Created:</span>
              <span className="font-mono font-semibold text-kept-promise">
                +{impact.jobs.created.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral">Lost:</span>
              <span className="font-mono font-semibold text-broken-promise">
                -{impact.jobs.lost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison to Peers */}
      {impact.vsAverage && (
        <div className="px-lg py-md bg-off-white border-b border-light-gray">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-body-small font-semibold text-text-black mb-xs">
                Performance vs. Other Representatives
              </div>
              <div className="text-body-small text-neutral">
                {impact.vsAverage.comparison === 'above' && (
                  <>Better than {impact.vsAverage.percentile}% of representatives</>
                )}
                {impact.vsAverage.comparison === 'below' && (
                  <>Worse than {100 - impact.vsAverage.percentile}% of representatives</>
                )}
                {impact.vsAverage.comparison === 'average' && (
                  <>Average performance compared to peers</>
                )}
              </div>
            </div>
            <div className={cn(
              'text-2xl font-mono font-bold',
              impact.vsAverage.comparison === 'above' ? 'text-kept-promise' : 'text-broken-promise'
            )}>
              {impact.vsAverage.percentile}%
            </div>
          </div>
        </div>
      )}

      {/* Program-by-Program Breakdown */}
      <div className="p-lg">
        <div className="text-body-small font-bold text-neutral uppercase tracking-wider mb-md">
          Program Impact Breakdown
        </div>
        <div className="space-y-2">
          {impact.programs.map((program, idx) => {
            const isPositive = program.change >= 0;
            return (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-light-gray last:border-0">
                <div className="flex-1">
                  <div className="text-body font-semibold text-text-black">
                    {program.name}
                  </div>
                  <div className="text-caption text-neutral uppercase">
                    {program.category}
                  </div>
                </div>
                <div className={cn(
                  'font-mono text-body font-bold text-right',
                  isPositive ? 'text-kept-promise' : 'text-broken-promise'
                )}>
                  {isPositive ? '+' : ''}{formatCurrency(program.change)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Message */}
      <div className={cn(
        'border-t-2 px-lg py-md',
        netImpactPositive ? 'bg-kept-promise-light border-kept-promise' : 'bg-broken-promise-light border-broken-promise'
      )}>
        <div className="flex items-start gap-3">
          {netImpactPositive ? (
            <>
              <svg className="w-6 h-6 text-kept-promise flex-shrink-0 mt-xs" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-body font-bold text-kept-promise-dark mb-xs">
                  Positive Net Impact
                </div>
                <div className="text-body-small text-kept-promise-dark">
                  Their votes resulted in a net gain of {formatCurrency(impact.funding.net)} in funding
                  and {impact.jobs.net.toLocaleString()} jobs for {districtName}.
                </div>
              </div>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-broken-promise flex-shrink-0 mt-xs" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-body font-bold text-broken-promise-dark mb-xs">
                  Negative Net Impact
                </div>
                <div className="text-body-small text-broken-promise-dark">
                  Their votes resulted in a net loss of {formatCurrency(Math.abs(impact.funding.net))} in funding
                  and {Math.abs(impact.jobs.net).toLocaleString()} jobs for {districtName}.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
