import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NURA — AI Personal Knowledge & Scaffolding Engine',
  description: 'Transform documents, GitHub repositories, and videos into structured courses, interactive flashcards, and instant RAG answers.',
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
