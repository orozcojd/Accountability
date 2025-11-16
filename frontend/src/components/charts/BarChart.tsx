'use client';

/**
 * Horizontal Bar Chart Component
 * Used for: Campaign contributions, category distributions
 * Accessibility: Includes data table alternative
 */

import { useState } from 'react';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  showDataTable?: boolean;
  valueFormatter?: (value: number) => string;
  maxValue?: number;
  className?: string;
}

const defaultColors = [
  '#0D7377', // teal
  '#9C6ADE', // purple
  '#F59E0B', // amber
  '#2D6A4F', // green
  '#E85D75', // coral
  '#4A5568', // slate
];

export function BarChart({
  data,
  title,
  showDataTable: showTableProp = false,
  valueFormatter = formatCurrency,
  maxValue,
  className,
}: BarChartProps) {
  const [showTable, setShowTable] = useState(showTableProp);

  const max = maxValue || Math.max(...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-component-title font-semibold">{title}</h4>
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="text-body-small text-primary hover:underline"
            aria-pressed={showTable}
          >
            {showTable ? 'Show chart' : 'Show data table'}
          </button>
        </div>
      )}

      {/* Visual Chart */}
      {!showTable && (
        <div className="space-y-3" aria-hidden="true">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            const percentOfTotal = (item.value / total) * 100;
            const color = item.color || defaultColors[index % defaultColors.length];

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-body-small">
                  <span className="font-medium text-dark-gray">{item.label}</span>
                  <span className="font-mono text-text-black">
                    {valueFormatter(item.value)} ({formatPercent(percentOfTotal, 0)})
                  </span>
                </div>
                <div className="relative h-8 bg-light-gray rounded-md overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Data Table */}
      {showTable && (
        <table className="w-full border-collapse border border-light-gray">
          <caption className="sr-only">
            {title || 'Bar chart data'}
          </caption>
          <thead className="bg-off-white">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-body-small font-semibold">
                Category
              </th>
              <th scope="col" className="px-4 py-2 text-right text-body-small font-semibold">
                Value
              </th>
              <th scope="col" className="px-4 py-2 text-right text-body-small font-semibold">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const percentOfTotal = (item.value / total) * 100;

              return (
                <tr key={index} className="border-t border-light-gray">
                  <td className="px-4 py-2 text-body">{item.label}</td>
                  <td className="px-4 py-2 text-right font-mono">{valueFormatter(item.value)}</td>
                  <td className="px-4 py-2 text-right">{formatPercent(percentOfTotal, 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
