/**
 * Mock data for development and testing
 * This would be replaced with actual S3/API data in production
 */

import type {
  OfficialCardData,
  Official,
  VotingRecord,
  DonationsData,
  StockTradingData,
  Vote,
  StockTrade,
  Promise,
} from '@/types/official';

export const mockOfficials: OfficialCardData[] = [
  {
    id: 'ca-12',
    name: 'Nancy Pelosi',
    title: 'U.S. Representative',
    state: 'CA',
    district: '12',
    party: 'Democratic',
    photoUrl: undefined,
    promisesCount: 15,
    votingParticipation: 96.5,
    totalRaised: 2450000,
    upForReelection: true,
    nextElection: '2026-11-03',
  },
  {
    id: 'ny-14',
    name: 'Alexandria Ocasio-Cortez',
    title: 'U.S. Representative',
    state: 'NY',
    district: '14',
    party: 'Democratic',
    photoUrl: undefined,
    promisesCount: 22,
    votingParticipation: 94.2,
    totalRaised: 1850000,
    upForReelection: true,
    nextElection: '2026-11-03',
  },
  {
    id: 'fl-1',
    name: 'Matt Gaetz',
    title: 'U.S. Representative',
    state: 'FL',
    district: '1',
    party: 'Republican',
    photoUrl: undefined,
    promisesCount: 18,
    votingParticipation: 92.8,
    totalRaised: 1650000,
    upForReelection: false,
  },
  {
    id: 'ca-senator-1',
    name: 'Dianne Feinstein',
    title: 'U.S. Senator',
    state: 'CA',
    party: 'Democratic',
    photoUrl: undefined,
    promisesCount: 12,
    votingParticipation: 98.1,
    totalRaised: 5200000,
    upForReelection: false,
  },
  {
    id: 'tx-senator-1',
    name: 'Ted Cruz',
    title: 'U.S. Senator',
    state: 'TX',
    party: 'Republican',
    photoUrl: undefined,
    promisesCount: 20,
    votingParticipation: 95.3,
    totalRaised: 4800000,
    upForReelection: true,
    nextElection: '2026-11-03',
  },
  {
    id: 'vt-senator-1',
    name: 'Bernie Sanders',
    title: 'U.S. Senator',
    state: 'VT',
    party: 'Independent',
    photoUrl: undefined,
    promisesCount: 28,
    votingParticipation: 97.2,
    totalRaised: 3100000,
    upForReelection: false,
  },
];

export const mockPromises: Promise[] = [
  {
    id: 'p1',
    text: 'Lower prescription drug costs for seniors',
    source: 'Campaign website, June 2020',
    category: 'healthcare',
    aiGenerated: false,
  },
  {
    id: 'p2',
    text: 'Support small business tax relief',
    source: 'Campaign speech, August 2020',
    category: 'economy',
    aiGenerated: false,
  },
  {
    id: 'p3',
    text: 'Increase funding for public schools',
    source: 'Town hall meeting, September 2020',
    category: 'education',
    aiGenerated: false,
  },
  {
    id: 'p4',
    text: 'Address climate change through clean energy investment',
    source: 'Policy platform, July 2020',
    category: 'environment',
    aiGenerated: false,
  },
];

export const mockVotes: Vote[] = [
  {
    id: 'v1',
    billNumber: 'H.R. 1234',
    title: 'Infrastructure Investment and Jobs Act',
    date: '2024-03-15',
    vote: 'yes',
    billSummary: 'Allocates $1.2 trillion for infrastructure improvements including roads, bridges, and broadband.',
    source: 'govtrack',
  },
  {
    id: 'v2',
    billNumber: 'H.R. 5678',
    title: 'Affordable Prescription Drugs Act',
    date: '2024-02-20',
    vote: 'yes',
    billSummary: 'Allows Medicare to negotiate drug prices and caps out-of-pocket costs for seniors.',
    source: 'govtrack',
  },
  {
    id: 'v3',
    billNumber: 'H.R. 9012',
    title: 'Climate Action Now Act',
    date: '2024-01-10',
    vote: 'yes',
    billSummary: 'Establishes targets for reducing carbon emissions and investing in renewable energy.',
    source: 'govtrack',
  },
  {
    id: 'v4',
    billNumber: 'H.R. 3456',
    title: 'Small Business Relief Act',
    date: '2023-11-05',
    vote: 'yes',
    billSummary: 'Provides tax credits and grants to small businesses affected by economic downturn.',
    source: 'govtrack',
  },
];

export const mockStockTrades: StockTrade[] = [
  {
    id: 't1',
    date: '2024-09-15',
    ticker: 'NVDA',
    assetName: 'NVIDIA Corporation',
    transactionType: 'purchase',
    amount: '$15,001 - $50,000',
    filingDate: '2024-09-30',
    reportUrl: 'https://example.com/disclosure',
  },
  {
    id: 't2',
    date: '2024-08-03',
    ticker: 'AAPL',
    assetName: 'Apple Inc.',
    transactionType: 'sale',
    amount: '$1,001 - $15,000',
    filingDate: '2024-08-20',
    reportUrl: 'https://example.com/disclosure',
  },
  {
    id: 't3',
    date: '2024-07-12',
    ticker: 'MSFT',
    assetName: 'Microsoft Corporation',
    transactionType: 'purchase',
    amount: '$50,001 - $100,000',
    filingDate: '2024-07-28',
    reportUrl: 'https://example.com/disclosure',
  },
];

export const mockOfficialProfile: Official = {
  id: 'ca-12',
  type: 'representative',
  personal: {
    name: 'Nancy Pelosi',
    party: 'Democratic',
    state: 'CA',
    district: '12',
    photoUrl: undefined,
    contactInfo: {
      phone: '202-225-4965',
      email: 'contact@example.gov',
      website: 'https://pelosi.house.gov',
    },
  },
  reElection: {
    nextElection: '2026-11-03',
    termEnd: '2027-01-03',
    previousResults: [
      {
        year: 2022,
        votePercent: 86.5,
        opponent: 'John Dennis',
      },
      {
        year: 2020,
        votePercent: 77.6,
        opponent: 'Shahid Buttar',
      },
    ],
  },
  promises: {
    lastUpdated: '2025-11-15T10:00:00Z',
    items: mockPromises,
    aiSummary:
      'Representative Pelosi has focused her campaign promises primarily on healthcare affordability, economic support for small businesses, and climate action. Key themes include prescription drug cost reduction and clean energy investment.',
  },
  metadata: {
    createdAt: '2025-01-01T00:00:00Z',
    lastScraped: '2025-11-15T10:00:00Z',
    dataVersion: '1.0.0',
  },
};

export const mockVotingRecord: VotingRecord = {
  officialId: 'ca-12',
  year: 2024,
  lastUpdated: '2025-11-15T10:00:00Z',
  votes: mockVotes,
  participationRate: 96.5,
  aiSummary:
    'In 2024, Representative Pelosi voted consistently in favor of infrastructure investment, healthcare reform, and climate legislation. Voting participation rate of 96.5% is above the congressional average of 93%.',
};

export const mockDonations: DonationsData = {
  officialId: 'ca-12',
  cycle: '2024',
  lastUpdated: '2025-11-15T10:00:00Z',
  summary: {
    totalRaised: 2450000,
    individualContributions: 1592500,
    pacContributions: 612500,
    selfFunding: 245000,
  },
  topDonors: [
    {
      name: 'ActBlue',
      amount: 350000,
      type: 'PAC',
      industry: 'Political Organizations',
    },
    {
      name: 'Emily\'s List',
      amount: 125000,
      type: 'PAC',
      industry: 'Women\'s Issues',
    },
    {
      name: 'Tech Workers Union',
      amount: 98000,
      type: 'PAC',
      industry: 'Labor Unions',
    },
  ],
  topIndustries: [
    {
      industry: 'Technology',
      amount: 542000,
    },
    {
      industry: 'Healthcare',
      amount: 435000,
    },
    {
      industry: 'Finance',
      amount: 298000,
    },
    {
      industry: 'Labor Unions',
      amount: 215000,
    },
    {
      industry: 'Education',
      amount: 178000,
    },
  ],
  aiSummary:
    'Campaign funding heavily sourced from technology and healthcare sectors, with significant grassroots support through ActBlue. Individual contributions comprise 65% of total fundraising.',
  source: 'opensecrets',
};

export const mockStockTradingData: StockTradingData = {
  officialId: 'ca-12',
  year: 2024,
  lastUpdated: '2025-11-15T10:00:00Z',
  trades: mockStockTrades,
  aiSummary:
    'Active trading in technology stocks throughout 2024. Most recent activity includes purchase of NVDA shares in September, followed by sales of AAPL holdings.',
  conflictAlerts: [
    {
      tradeId: 't1',
      reason: 'Purchased NVDA 14 days before voting on AI regulation bill',
      severity: 'medium',
    },
  ],
  source: 'fec',
};
