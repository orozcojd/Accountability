/**
 * Promises Tab Component
 * Displays campaign promises organized by category with actions
 */

import { Accordion, AccordionGroup } from '@/components/ui/Accordion';
import { formatDate, groupBy } from '@/lib/utils';
import type { PromisesData } from '@/types/official';

interface PromisesTabProps {
  data: PromisesData;
}

export function PromisesTab({ data }: PromisesTabProps) {
  // Group promises by category
  const promisesByCategory = groupBy(data.items, 'category');

  const categoryNames: Record<string, string> = {
    healthcare: 'Healthcare',
    economy: 'Economy & Jobs',
    education: 'Education',
    environment: 'Environment & Climate',
    immigration: 'Immigration',
    infrastructure: 'Infrastructure',
    justice: 'Justice & Criminal Reform',
    'foreign-policy': 'Foreign Policy',
    other: 'Other Issues',
  };

  return (
    <div className="space-y-6">
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
            Summary
          </h3>
          <p className="text-body text-dark-gray">{data.aiSummary}</p>
        </div>
      )}

      {/* Promises by Category */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">
          Campaign Promises by Topic ({data.items.length} total)
        </h3>

        <AccordionGroup>
          {Object.entries(promisesByCategory).map(([category, promises]) => (
            <Accordion
              key={category}
              title={`${categoryNames[category] || category} (${promises.length} ${
                promises.length === 1 ? 'promise' : 'promises'
              })`}
            >
              <div className="space-y-6">
                {promises.map((promise) => (
                  <div key={promise.id} className="border-l-2 border-primary pl-4">
                    <p className="text-body text-text-black mb-2">{promise.text}</p>
                    <div className="flex flex-wrap items-center gap-3 text-body-small text-medium-gray">
                      <span>Source: {promise.source}</span>
                      {promise.aiGenerated && (
                        <span className="inline-flex items-center gap-1 text-caption bg-light-gray px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 7H7v6h6V7z" />
                            <path
                              fillRule="evenodd"
                              d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          AI Extracted
                        </span>
                      )}
                    </div>

                    {/* Related Actions Placeholder */}
                    <div className="mt-4 p-4 bg-off-white rounded-md">
                      <p className="text-body-small text-dark-gray font-medium mb-2">
                        Recorded Actions:
                      </p>
                      <p className="text-body-small text-medium-gray italic">
                        Action tracking feature coming soon. This will show votes, co-sponsored
                        bills, and public statements related to this promise.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          ))}
        </AccordionGroup>
      </div>

      {/* Last Updated */}
      <p className="text-caption text-medium-gray">Last updated: {formatDate(data.lastUpdated)}</p>
    </div>
  );
}
