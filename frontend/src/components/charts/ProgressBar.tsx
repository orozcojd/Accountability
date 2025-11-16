/**
 * Progress Bar Component
 * Used for: Voting participation rates with comparison
 * Accessibility: Includes text description and proper ARIA
 */

import { cn, formatPercent } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  comparison?: {
    value: number;
    label: string;
  };
  showPercentage?: boolean;
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  comparison,
  showPercentage = true,
  color = '#0D7377',
  className,
}: ProgressBarProps) {
  const percentage = (value / max) * 100;
  const comparisonPercentage = comparison ? (comparison.value / max) * 100 : undefined;

  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Label and Value */}
      <div className="flex items-center justify-between text-body-small">
        <span className="font-medium text-dark-gray">{label}</span>
        <span className="font-mono text-text-black">
          {showPercentage ? formatPercent(percentage) : `${value}/${max}`}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="relative h-6 bg-light-gray rounded-md overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />

        {/* Comparison marker */}
        {comparisonPercentage !== undefined && (
          <div
            className="absolute inset-y-0 w-0.5 bg-text-black/50"
            style={{ left: `${comparisonPercentage}%` }}
            title={comparison?.label}
          />
        )}
      </div>

      {/* Comparison Text */}
      {comparison && (
        <p className="text-body-small text-medium-gray">
          {comparison.label}: {formatPercent((comparison.value / max) * 100)}
        </p>
      )}
    </div>
  );
}

/**
 * Multiple Progress Bars (Stacked)
 */
interface StackedProgressItem {
  label: string;
  value: number;
  color: string;
}

interface StackedProgressBarProps {
  items: StackedProgressItem[];
  total?: number;
  className?: string;
}

export function StackedProgressBar({ items, total, className }: StackedProgressBarProps) {
  const calculatedTotal = total || items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Stacked Bar */}
      <div className="relative h-8 bg-light-gray rounded-md overflow-hidden flex">
        {items.map((item, index) => {
          const percentage = (item.value / calculatedTotal) * 100;

          return (
            <div
              key={index}
              className="relative h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.label}: ${formatPercent(percentage)}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => {
          const percentage = (item.value / calculatedTotal) * 100;

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-body-small text-dark-gray">
                {item.label}: {formatPercent(percentage, 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
