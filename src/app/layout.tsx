import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/context/WalletContext';
import { LoadingProvider } from '@/context/LoadingContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IPX - Intellectual Property Management',
  description: 'Manage your intellectual property assets on the blockchain',
  keywords: [
    'blockchain',
    'intellectual property',
    'NFT',
    'licensing',
    'royalties',
  ],
  authors: [{ name: 'IPX Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingProvider>
          <WalletProvider>{children}</WalletProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
