/**
 * Voting Record Tab Component
 * Displays voting participation and individual votes
 */

import { ProgressBar } from '@/components/charts/ProgressBar';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { VotingRecord, Vote } from '@/types/official';

interface VotingRecordTabProps {
  data: VotingRecord;
}

export function VotingRecordTab({ data }: VotingRecordTabProps) {
  const voteColumns: Column<Vote>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (vote) => formatDate(vote.date),
      className: 'font-mono text-body-small',
    },
    {
      key: 'billNumber',
      header: 'Bill',
      className: 'font-mono',
    },
    {
      key: 'title',
      header: 'Title',
      render: (vote) => (
        <div>
          <p className="font-medium">{vote.title}</p>
          {vote.billSummary && (
            <p className="text-body-small text-medium-gray mt-1 truncate-2-lines">
              {vote.billSummary}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'vote',
      header: 'Vote',
      render: (vote) => {
        const variants: Record<string, 'success' | 'warning' | 'neutral'> = {
          yes: 'success',
          no: 'warning',
          'not-voting': 'neutral',
          present: 'neutral',
        };

        return (
          <Badge variant={variants[vote.vote] || 'neutral'}>
            {vote.vote.toUpperCase()}
          </Badge>
        );
      },
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
            Voting Pattern Summary
          </h3>
          <p className="text-body text-dark-gray">{data.aiSummary}</p>
        </div>
      )}

      {/* Participation Rate */}
      {data.participationRate !== undefined && (
        <div>
          <h3 className="text-subsection font-semibold mb-4">Voting Participation</h3>
          <div className="bg-white border border-light-gray rounded-lg p-6">
            <ProgressBar
              value={data.participationRate}
              label="Participation Rate"
              comparison={{
                value: 93,
                label: 'Congress Average',
              }}
              color="#0D7377"
            />
            <p className="text-body-small text-medium-gray mt-4">
              Cast {data.votes.length} votes in {data.year}
            </p>
          </div>
        </div>
      )}

      {/* Voting Record Table */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">
          Voting History ({data.votes.length} votes)
        </h3>
        <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
          <DataTable
            data={data.votes}
            columns={voteColumns}
            caption={`Voting record for ${data.year}`}
          />
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-caption text-medium-gray">Last updated: {formatDate(data.lastUpdated)}</p>
    </div>
  );
}
