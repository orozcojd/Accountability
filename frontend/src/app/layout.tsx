import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Accountability Platform - Track Elected Officials',
  description: 'A nonpartisan platform for tracking elected officials\' campaign promises, voting records, and campaign contributions.',
  keywords: ['politics', 'accountability', 'elected officials', 'voting records', 'campaign finance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
