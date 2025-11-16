'use client';

/**
 * Official Profile Page
 * Dynamic route for individual official profiles
 * Features: ISR with revalidation, tabs for different data sections
 */

import { useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { QuickStats } from '@/components/profile/QuickStats';
import { Tabs, type Tab } from '@/components/ui/Tabs';
import { PromisesTab } from '@/components/profile/PromisesTab';
import { VotingRecordTab } from '@/components/profile/VotingRecordTab';
import { ContributionsTab } from '@/components/profile/ContributionsTab';
import { StockTradingTab } from '@/components/profile/StockTradingTab';
import { AboutTab } from '@/components/profile/AboutTab';
import {
  mockOfficialProfile,
  mockVotingRecord,
  mockDonations,
  mockStockTradingData,
} from '@/lib/mockData';
import type { QuickStats as QuickStatsType } from '@/types/official';

export default function OfficialProfilePage() {
  const params = useParams();
  const { state, chamber, slug } = params;

  // In production, this would fetch from S3 based on params
  // For now, using mock data
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

  // Calculate quick stats
  const quickStats: QuickStatsType = {
    promisesCount: official.promises?.items.length || 0,
    votingParticipation: votingRecord.participationRate || 0,
    totalRaised: donations.summary.totalRaised,
    billsSponsored: 15, // This would come from API data
  };

  // Define tabs
  const tabs: Tab[] = [
    {
      id: 'promises',
      label: 'Promises & Actions',
      content: official.promises ? <PromisesTab data={official.promises} /> : <div>No data available</div>,
    },
    {
      id: 'voting',
      label: 'Voting Record',
      content: <VotingRecordTab data={votingRecord} />,
    },
    {
      id: 'contributions',
      label: 'Campaign Contributions',
      content: <ContributionsTab data={donations} />,
    },
    {
      id: 'stocks',
      label: 'Stock Trading',
      content: <StockTradingTab data={stockTrading} />,
    },
    {
      id: 'about',
      label: 'About',
      content: <AboutTab official={official} />,
    },
  ];

  return (
    <div className="bg-off-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-light-gray py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader official={official} />

      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Tabs */}
      <div className="bg-white border-t border-light-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Tabs tabs={tabs} defaultTab="promises" />
        </div>
      </div>
    </div>
  );
}
