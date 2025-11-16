'use client';

/**
 * Official Profile Page - REDESIGNED
 * Bold, single-scroll layout with sticky verdict summary
 * No tabs - everything visible, impossible to hide contradictions
 */

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { QuickVerdict } from '@/components/accountability/QuickVerdict';
import { AccountabilityScoreCard } from '@/components/accountability/AccountabilityScoreCard';
import { RedFlagsList } from '@/components/accountability/RedFlagsList';
import { BrokenPromiseCard } from '@/components/accountability/BrokenPromiseCard';
import { InfluenceCorrelationChart } from '@/components/accountability/InfluenceCorrelationChart';
import { ImpactMeter } from '@/components/accountability/ImpactMeter';
import {
  mockOfficialProfile,
  mockVotingRecord,
  mockDonations,
  mockStockTradingData,
} from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import type {
  Promise,
  RedFlag,
  AccountabilityScore,
  InfluenceCorrelation,
  DistrictImpact,
} from '@/components/accountability/BrokenPromiseCard';

// Mock accountability data (would come from API)
const mockAccountabilityScore: AccountabilityScore = {
  overall: 42,
  breakdown: {
    promiseKeeping: 35,
    transparency: 28,
    constituentAlignment: 45,
    attendance: 65,
    donorIndependence: 22,
  },
  trend: 'declining',
  trendChange: -8,
};

const mockRedFlags: RedFlag[] = [
  {
    id: 'rf1',
    severity: 'critical',
    title: 'Voted opposite of campaign promises 12 times',
    description: 'Systematic pattern of voting against stated campaign positions',
    category: 'Broken Promises',
    date: '2024-11-01',
  },
  {
    id: 'rf2',
    severity: 'critical',
    title: 'Received $450K from industry, then voted in their favor 15 times',
    description: 'High correlation between pharmaceutical donations and favorable votes',
    category: 'Donor Influence',
    date: '2024-10-28',
  },
  {
    id: 'rf3',
    severity: 'high',
    title: 'No town halls in 18 months',
    description: 'Avoiding constituent contact during contentious votes',
    category: 'Transparency',
    date: '2024-10-15',
  },
];

const mockBrokenPromises: Promise[] = [
  {
    id: '1',
    status: 'broken',
    statement: 'I will always fight to protect healthcare access for every American',
    statementSource: 'Campaign speech, Milwaukee Rally',
    statementDate: '2022-10-15',
    category: 'Healthcare',
    actions: [
      {
        description: 'Voted AGAINST Medicare expansion (HR-4521)',
        date: '2024-03-12',
        voteCount: 8,
      },
      {
        description: 'Voted to cut Medicaid funding',
        date: '2024-06-20',
        voteCount: 4,
      },
    ],
  },
  {
    id: '2',
    status: 'broken',
    statement: 'I stand with working families and will oppose corporate tax breaks',
    statementSource: 'Town hall meeting, Madison',
    statementDate: '2022-09-08',
    category: 'Economy',
    actions: [
      {
        description: 'Voted FOR $2.1B corporate tax incentive package',
        date: '2024-02-14',
      },
    ],
  },
];

const mockInfluenceData: InfluenceCorrelation = {
  industry: 'Pharmaceutical',
  donations: [
    {
      id: 'd1',
      date: '2024-01-15',
      amount: 85000,
      donor: 'Pfizer PAC',
      industry: 'Pharmaceutical',
    },
    {
      id: 'd2',
      date: '2024-02-08',
      amount: 65000,
      donor: 'Moderna PAC',
      industry: 'Pharmaceutical',
    },
  ],
  votes: [
    {
      id: 'v1',
      date: '2024-01-28',
      bill: 'HR-4521 - Medicare Drug Price Negotiation',
      position: 'against',
      industry: 'Pharmaceutical',
      isFavorable: true,
    },
    {
      id: 'v2',
      date: '2024-03-12',
      bill: 'S-2890 - Generic Drug Market Competition',
      position: 'against',
      industry: 'Pharmaceutical',
      isFavorable: true,
    },
  ],
  suspiciousTimings: [
    {
      donationId: 'd1',
      voteId: 'v1',
      daysBetween: 13,
    },
  ],
  alignmentScore: 94,
};

const mockDistrictImpact: DistrictImpact = {
  funding: {
    gained: 12500000,
    lost: 18300000,
    net: -5800000,
  },
  jobs: {
    created: 340,
    lost: 1250,
    net: -910,
  },
  programs: [
    {
      name: 'Rural Healthcare Clinics',
      change: -4200000,
      category: 'Healthcare',
    },
    {
      name: 'Public School Funding',
      change: -2800000,
      category: 'Education',
    },
    {
      name: 'Infrastructure Projects',
      change: 8200000,
      category: 'Infrastructure',
    },
  ],
  vsAverage: {
    percentile: 23,
    comparison: 'below',
  },
};

export default function OfficialProfilePage() {
  const params = useParams();
  const { state, chamber, slug } = params;

  // In production, this would fetch from S3 based on params
  const official = mockOfficialProfile;
  const votingRecord = mockVotingRecord;
  const donations = mockDonations;
  const stockTrading = mockStockTradingData;

  // Construct breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: (state as string).toUpperCase(), href: `/?state=${state}` },
    {
      label: chamber === 'house' ? 'House' : 'Senate',
      href: `/?state=${state}&chamber=${chamber}`,
    },
    { label: official.personal.name },
  ];

  const grade = mockAccountabilityScore.overall >= 90 ? 'A' :
                mockAccountabilityScore.overall >= 80 ? 'B' :
                mockAccountabilityScore.overall >= 70 ? 'C' :
                mockAccountabilityScore.overall >= 60 ? 'D' : 'F';

  return (
    <div className="bg-off-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-light-gray py-4">
        <div className="mx-auto max-w-7xl px-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Profile Header - Bold & Direct */}
      <section className="bg-text-black text-text-inverse border-b-4 border-broken-promise">
        <div className="mx-auto max-w-7xl px-4 py-xl">
          <div className="flex items-start gap-lg">
            {official.personal.photoUrl ? (
              <img
                src={official.personal.photoUrl}
                alt={official.personal.name}
                className="w-32 h-32 object-cover border-4 border-text-inverse flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 bg-neutral flex items-center justify-center border-4 border-text-inverse">
                <svg className="w-20 h-20 text-neutral-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-hero font-serif mb-md">
                {official.personal.name}
              </h1>
              <div className="text-body-large mb-md">
                {official.role.title} • {official.role.state}
                {official.role.district && ` District ${official.role.district}`}
              </div>
              <div className="flex flex-wrap gap-md">
                <div className="bg-text-inverse text-text-black px-3 py-1 rounded-sm font-semibold text-body-small">
                  {official.party === 'D' ? 'Democrat' : official.party === 'R' ? 'Republican' : 'Independent'}
                </div>
                {official.contact?.website && (
                  <a
                    href={official.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-3 py-1 rounded-sm font-semibold text-body-small hover:bg-primary-hover"
                  >
                    Official Website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="mx-auto max-w-7xl px-4 py-xl">
        <div className="grid lg:grid-cols-3 gap-xl">
          {/* Sticky Sidebar - Quick Verdict */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <QuickVerdict
                score={mockAccountabilityScore.overall}
                grade={grade}
                promiseKeepingRate={mockAccountabilityScore.breakdown.promiseKeeping}
                topRedFlags={mockRedFlags.slice(0, 3)}
              />
            </div>
          </div>

          {/* Main Content - Single Scroll */}
          <div className="lg:col-span-2 space-y-4xl">
            {/* Red Flags Section */}
            <section id="red-flags">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-broken-promise" />
                  <h2 className="text-section-title font-serif font-bold text-broken-promise-dark">
                    RED FLAGS
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Critical issues detected through automated analysis
                </p>
              </div>
              <RedFlagsList flags={mockRedFlags} />
            </section>

            {/* Accountability Score Section */}
            <section id="accountability-score">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-primary" />
                  <h2 className="text-section-title font-serif font-bold text-text-black">
                    ACCOUNTABILITY SCORE
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Comprehensive rating based on promises, transparency, and constituent alignment
                </p>
              </div>
              <AccountabilityScoreCard score={mockAccountabilityScore} />
            </section>

            {/* Broken Promises - "The Receipts" */}
            <section id="broken-promises">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-broken-promise" />
                  <h2 className="text-section-title font-serif font-bold text-broken-promise-dark">
                    THE RECEIPTS: What They Said vs. What They Did
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Direct contradictions between campaign statements and voting record
                </p>
              </div>
              <div className="space-y-xl">
                {mockBrokenPromises.map((promise) => (
                  <BrokenPromiseCard key={promise.id} promise={promise} />
                ))}
              </div>
            </section>

            {/* Influence Correlation - Follow the Money */}
            <section id="influence">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-warning" />
                  <h2 className="text-section-title font-serif font-bold text-warning-dark">
                    FOLLOW THE MONEY
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Correlation between campaign donations and voting patterns
                </p>
              </div>
              <InfluenceCorrelationChart data={mockInfluenceData} />
            </section>

            {/* District Impact */}
            <section id="district-impact">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-primary" />
                  <h2 className="text-section-title font-serif font-bold text-text-black">
                    DISTRICT IMPACT
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  How their votes affected YOUR community
                </p>
              </div>
              <ImpactMeter
                impact={mockDistrictImpact}
                districtName={official.role.district ? `${official.role.state} District ${official.role.district}` : official.role.state}
              />
            </section>

            {/* Voting Record - Dense Layout */}
            <section id="voting-record">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-neutral" />
                  <h2 className="text-section-title font-serif font-bold text-text-black">
                    VOTING RECORD
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Complete legislative voting history
                </p>
              </div>
              <div className="bg-white border border-light-gray p-lg shadow-md">
                <div className="grid grid-cols-3 gap-lg mb-lg">
                  <div className="text-center">
                    <div className="data-medium text-primary mb-xs">
                      {Math.round(votingRecord.participationRate * 100)}%
                    </div>
                    <div className="text-caption text-neutral uppercase font-bold">Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="data-medium text-text-black mb-xs">
                      {votingRecord.summary.totalVotes}
                    </div>
                    <div className="text-caption text-neutral uppercase font-bold">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="data-medium text-text-black mb-xs">
                      {votingRecord.summary.yeaVotes}
                    </div>
                    <div className="text-caption text-neutral uppercase font-bold">Yea Votes</div>
                  </div>
                </div>
                <Link href="#" className="btn btn-outline w-full justify-center">
                  View Full Voting History
                </Link>
              </div>
            </section>

            {/* Campaign Finance - Dense Layout */}
            <section id="campaign-finance">
              <div className="mb-xl">
                <div className="flex items-center gap-4 mb-md">
                  <div className="h-1 w-12 bg-warning" />
                  <h2 className="text-section-title font-serif font-bold text-text-black">
                    CAMPAIGN FINANCE
                  </h2>
                </div>
                <p className="text-body text-dark-gray">
                  Who's funding their campaigns
                </p>
              </div>
              <div className="bg-white border border-light-gray p-lg shadow-md">
                <div className="mb-lg">
                  <div className="data-large text-warning-dark mb-xs">
                    {formatCurrency(donations.summary.totalRaised)}
                  </div>
                  <div className="text-body-small text-neutral uppercase font-bold tracking-wide">
                    Total Raised (2023-2024)
                  </div>
                </div>
                <div className="space-y-md">
                  {donations.topDonors.slice(0, 5).map((donor, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-light-gray pb-md last:border-0">
                      <div className="flex-1">
                        <div className="text-body font-semibold text-text-black">
                          {donor.name}
                        </div>
                        <div className="text-caption text-neutral uppercase">
                          {donor.industry}
                        </div>
                      </div>
                      <div className="font-mono text-body font-bold text-warning-dark">
                        {formatCurrency(donor.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="#" className="btn btn-outline w-full justify-center mt-lg">
                  View All Donors
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
