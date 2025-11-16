/**
 * TypeScript type definitions based on API Design Specification
 */

export type OfficialType = 'representative' | 'senator';

export type Party = 'Democratic' | 'Republican' | 'Independent' | string;

export type VoteType = 'yes' | 'no' | 'not-voting' | 'present';

export type TransactionType = 'purchase' | 'sale';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type JobType = 'update-all' | 'scrape-official' | 'summarize';

export interface ContactInfo {
  phone: string;
  email?: string;
  website?: string;
}

export interface PersonalInfo {
  name: string;
  party: Party;
  state: string;
  district?: string;
  photoUrl?: string;
  contactInfo?: ContactInfo;
}

export interface PreviousElectionResult {
  year: number;
  votePercent: number;
  opponent: string;
}

export interface ReElectionInfo {
  nextElection: string;
  termEnd: string;
  previousResults?: PreviousElectionResult[];
}

export interface Promise {
  id: string;
  text: string;
  source: string;
  category: string;
  aiGenerated: boolean;
}

export interface PromisesData {
  lastUpdated: string;
  items: Promise[];
  aiSummary?: string;
}

export interface Metadata {
  createdAt: string;
  lastScraped: string;
  dataVersion: string;
}

export interface Official {
  id: string;
  type: OfficialType;
  personal: PersonalInfo;
  reElection?: ReElectionInfo;
  promises?: PromisesData;
  metadata: Metadata;
}

export interface Vote {
  id: string;
  billNumber: string;
  title: string;
  date: string;
  vote: VoteType;
  billSummary?: string;
  source: string;
}

export interface VotingRecord {
  officialId: string;
  year: number;
  lastUpdated: string;
  votes: Vote[];
  aiSummary?: string;
  participationRate?: number;
}

export interface DonationSummary {
  totalRaised: number;
  individualContributions: number;
  pacContributions: number;
  selfFunding: number;
}

export interface Donor {
  name: string;
  amount: number;
  type: 'PAC' | 'Individual' | 'Party Committee';
  industry?: string;
}

export interface Industry {
  industry: string;
  amount: number;
}

export interface DonationsData {
  officialId: string;
  cycle: string;
  lastUpdated: string;
  summary: DonationSummary;
  topDonors: Donor[];
  topIndustries: Industry[];
  aiSummary?: string;
  source: string;
}

export interface StockTrade {
  id: string;
  date: string;
  ticker: string;
  assetName: string;
  transactionType: TransactionType;
  amount: string;
  filingDate: string;
  reportUrl?: string;
}

export interface ConflictAlert {
  tradeId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StockTradingData {
  officialId: string;
  year: number;
  lastUpdated: string;
  trades: StockTrade[];
  aiSummary?: string;
  conflictAlerts?: ConflictAlert[];
  source: string;
}

export interface JobProgress {
  total: number;
  completed: number;
  failed: number;
}

export interface JobError {
  officialId: string;
  error: string;
}

export interface JobResult {
  officialsUpdated?: number;
  summariesGenerated?: number;
  isrTriggered?: boolean;
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  startedAt: string;
  completedAt?: string;
  progress: JobProgress;
  errors: JobError[];
  result?: JobResult;
}

// Additional types for frontend UI

export interface OfficialCardData {
  id: string;
  name: string;
  title: string;
  state: string;
  district?: string;
  party: Party;
  photoUrl?: string;
  promisesCount?: number;
  votingParticipation?: number;
  totalRaised?: number;
  upForReelection?: boolean;
  nextElection?: string;
}

export interface SearchFilters {
  query?: string;
  state?: string;
  chamber?: 'house' | 'senate';
  party?: Party;
  upForReelection?: boolean;
  recentlyActive?: boolean;
}

export interface QuickStats {
  promisesCount: number;
  votingParticipation: number;
  totalRaised: number;
  billsSponsored: number;
}
