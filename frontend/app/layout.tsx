import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Campus Intelligence 360 | Early-Warning Decision Support System',
  description:
    'An AI-Powered Digital Twin & Early-Warning Decision Support System for Smart Academic Institutions. From Campus Data to Intelligent Decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
