/**
 * Contributions Tab Component
 * Displays campaign finance data with visualizations
 */

import { BarChart } from '@/components/charts/BarChart';
import { StackedProgressBar } from '@/components/charts/ProgressBar';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { DonationsData, Donor, Industry } from '@/types/official';

interface ContributionsTabProps {
  data: DonationsData;
}

export function ContributionsTab({ data }: ContributionsTabProps) {
  // Prepare data for breakdown chart
  const breakdownData = [
    {
      label: 'Individual Contributions',
      value: data.summary.individualContributions,
      color: '#0D7377',
    },
    {
      label: 'PAC Contributions',
      value: data.summary.pacContributions,
      color: '#9C6ADE',
    },
    {
      label: 'Self-Funding',
      value: data.summary.selfFunding,
      color: '#F59E0B',
    },
  ];

  const donorColumns: Column<Donor>[] = [
    {
      key: 'name',
      header: 'Donor Name',
      className: 'font-medium',
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'industry',
      header: 'Industry',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (donor) => formatCurrency(donor.amount),
      className: 'font-mono text-right',
    },
  ];

  return (
    <div className="space-y-8">
      {/* AI Summary */}
      {data.aiSummary && (
        <div className="bg-info-light border-l-4 border-info rounded-r-lg p-6">
          <h3 className="text-component-title font-semibold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-info" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Funding Summary
          </h3>
          <p className="text-body text-dark-gray">{data.aiSummary}</p>
        </div>
      )}

      {/* Total Raised */}
      <div className="bg-white border border-light-gray rounded-lg p-6">
        <div className="text-center">
          <p className="text-body-small text-dark-gray mb-2">Total Raised ({data.cycle} Cycle)</p>
          <p className="text-4xl font-bold text-primary mb-1">
            {formatCurrency(data.summary.totalRaised)}
          </p>
          <p className="text-body-small text-medium-gray">
            Source: {data.source} • Last updated: {formatDate(data.lastUpdated)}
          </p>
        </div>
      </div>

      {/* Breakdown by Source */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">Breakdown by Source</h3>
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <BarChart
            data={breakdownData}
            valueFormatter={formatCurrency}
            maxValue={data.summary.totalRaised}
          />
        </div>
      </div>

      {/* Top Industries */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">Top Industries</h3>
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <BarChart
            data={data.topIndustries.map((industry) => ({
              label: industry.industry,
              value: industry.amount,
            }))}
            valueFormatter={formatCurrency}
          />
        </div>
      </div>

      {/* Top Donors */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">
          Top Donors ({data.topDonors.length})
        </h3>
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <DataTable
            data={data.topDonors}
            columns={donorColumns}
            caption="Top campaign donors"
          />
        </div>
      </div>

      {/* Download Option */}
      <div className="text-center">
        <button type="button" className="btn btn-outline">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Full Contribution Data (CSV)
        </button>
      </div>
    </div>
  );
}
