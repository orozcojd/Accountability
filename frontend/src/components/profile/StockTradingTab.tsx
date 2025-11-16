/**
 * Stock Trading Tab Component
 * Displays stock trading activity with conflict alerts
 */

import { Timeline } from '@/components/charts/Timeline';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { StockTradingData, StockTrade } from '@/types/official';

interface StockTradingTabProps {
  data: StockTradingData;
}

export function StockTradingTab({ data }: StockTradingTabProps) {
  const tradeColumns: Column<StockTrade>[] = [
    {
      key: 'date',
      header: 'Transaction Date',
      render: (trade) => formatDate(trade.date),
      className: 'font-mono text-body-small',
    },
    {
      key: 'ticker',
      header: 'Ticker',
      className: 'font-mono font-semibold',
    },
    {
      key: 'assetName',
      header: 'Asset Name',
    },
    {
      key: 'transactionType',
      header: 'Type',
      render: (trade) => (
        <Badge variant={trade.transactionType === 'purchase' ? 'success' : 'warning'}>
          {trade.transactionType.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'font-mono',
    },
    {
      key: 'filingDate',
      header: 'Filed',
      render: (trade) => formatDate(trade.filingDate),
      className: 'text-body-small text-medium-gray',
    },
  ];

  // Convert trades to timeline events
  const timelineEvents = data.trades.map((trade) => ({
    id: trade.id,
    date: trade.date,
    title: `${trade.transactionType.toUpperCase()}: ${trade.ticker}`,
    description: `${trade.assetName} - ${trade.amount}`,
    type: 'default' as const,
  }));

  return (
    <div className="space-y-8">
      {/* Disclosure Note */}
      <div className="bg-warning-light border-l-4 border-warning rounded-r-lg p-6">
        <h3 className="text-component-title font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Stock Act Disclosure Requirement
        </h3>
        <p className="text-body text-dark-gray">
          Members of Congress are required to disclose stock trades within 45 days per the STOCK
          Act of 2012. All amounts are reported as ranges, not exact values.
        </p>
      </div>

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
            Trading Activity Summary
          </h3>
          <p className="text-body text-dark-gray">{data.aiSummary}</p>
        </div>
      )}

      {/* Conflict Alerts */}
      {data.conflictAlerts && data.conflictAlerts.length > 0 && (
        <div>
          <h3 className="text-subsection font-semibold mb-4 text-warning">
            Potential Conflicts of Interest
          </h3>
          <div className="space-y-3">
            {data.conflictAlerts.map((alert, index) => (
              <div
                key={index}
                className="bg-warning-light border border-warning rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-warning flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-text-black mb-1">
                      Severity: {alert.severity.toUpperCase()}
                    </p>
                    <p className="text-body text-dark-gray">{alert.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trading Activity Timeline */}
      {data.trades.length > 0 && (
        <div>
          <h3 className="text-subsection font-semibold mb-4">
            Trading Activity ({data.trades.length} trades in {data.year})
          </h3>
          <div className="bg-white border border-light-gray rounded-lg p-6">
            <Timeline events={timelineEvents} orientation="vertical" />
          </div>
        </div>
      )}

      {/* Trades Table */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">All Transactions</h3>
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <DataTable
            data={data.trades}
            columns={tradeColumns}
            caption={`Stock trades for ${data.year}`}
            emptyMessage="No stock trades reported for this period."
          />
        </div>
      </div>

      {/* Download & Source */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-off-white rounded-lg">
        <p className="text-body-small text-medium-gray">
          Source: {data.source} • Last updated: {formatDate(data.lastUpdated)}
        </p>
        <button type="button" className="btn btn-outline">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download Trading Data (CSV)
        </button>
      </div>
    </div>
  );
}
