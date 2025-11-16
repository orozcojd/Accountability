/**
 * About Tab Component
 * Displays official's background and contact information
 */

import type { Official } from '@/types/official';

interface AboutTabProps {
  official: Official;
}

export function AboutTab({ official }: AboutTabProps) {
  const { personal } = official;

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">Contact Information</h3>
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personal.contactInfo?.phone && (
              <div>
                <dt className="text-body-small font-semibold text-dark-gray mb-1">Phone</dt>
                <dd className="text-body">
                  <a
                    href={`tel:${personal.contactInfo.phone}`}
                    className="text-primary hover:underline"
                  >
                    {personal.contactInfo.phone}
                  </a>
                </dd>
              </div>
            )}

            {personal.contactInfo?.email && (
              <div>
                <dt className="text-body-small font-semibold text-dark-gray mb-1">Email</dt>
                <dd className="text-body">
                  <a
                    href={`mailto:${personal.contactInfo.email}`}
                    className="text-primary hover:underline"
                  >
                    {personal.contactInfo.email}
                  </a>
                </dd>
              </div>
            )}

            {personal.contactInfo?.website && (
              <div>
                <dt className="text-body-small font-semibold text-dark-gray mb-1">
                  Official Website
                </dt>
                <dd className="text-body">
                  <a
                    href={personal.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Visit Website
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </dd>
              </div>
            )}

            <div>
              <dt className="text-body-small font-semibold text-dark-gray mb-1">District</dt>
              <dd className="text-body">
                {official.type === 'representative'
                  ? `${personal.state} District ${personal.district}`
                  : `${personal.state} (Statewide)`}
              </dd>
            </div>

            <div>
              <dt className="text-body-small font-semibold text-dark-gray mb-1">Party</dt>
              <dd className="text-body">{personal.party}</dd>
            </div>

            <div>
              <dt className="text-body-small font-semibold text-dark-gray mb-1">Chamber</dt>
              <dd className="text-body">
                {official.type === 'representative'
                  ? 'U.S. House of Representatives'
                  : 'U.S. Senate'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Background Information Placeholder */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">Background</h3>
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <p className="text-body text-medium-gray italic">
            Additional biographical information, education history, previous positions, and
            committee assignments will be displayed here in future updates.
          </p>
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <h3 className="text-subsection font-semibold mb-4">Data Sources</h3>
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <p className="text-body text-dark-gray mb-4">
            Information on this profile is compiled from the following sources:
          </p>
          <ul className="space-y-2 text-body">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>ProPublica Congress API</strong> - Voting records and bill information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>OpenSecrets</strong> - Campaign finance data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>FEC Filings</strong> - Stock trading disclosures
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Official Campaign Websites</strong> - Campaign promises
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
