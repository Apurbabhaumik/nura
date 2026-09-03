import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NURA — AI Personal Knowledge & Learning Engine',
    template: '%s | NURA',
  },
  description:
    'Turn documents, repositories, and videos into structured learning paths with grounded AI tutoring, assessments, and progress analytics.',
  applicationName: 'NURA',
  keywords: ['AI learning', 'knowledge management', 'RAG', 'personal learning', 'developer education'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'NURA',
    title: 'NURA — AI Personal Knowledge & Learning Engine',
    description:
      'Transform your knowledge sources into structured, interactive learning experiences.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NURA — AI Personal Knowledge & Learning Engine',
    description:
      'Transform your knowledge sources into structured, interactive learning experiences.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
