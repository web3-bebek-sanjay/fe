'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { IPCard } from './IPCard';
import { LicenseModal } from './LicenseModal';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoryName } from '@/utils/enums';

// Mock IP data as fallback
const mockIPData = [
  {
    id: '1',
    title: 'Digital Artwork Collection',
    owner: '0x7a86c0b064171007716bbd6af96676935799a63e',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
    licenseTypes: ['buy', 'rent'],
    category: 'Art',
    price: 0.05,
  },
  {
    id: '2',
    title: 'Music Production Sample Pack',
    owner: '0x3a26746ddb79b1b8e4450e3f4ffe2e110060eb40',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    licenseTypes: ['buy', 'rent'],
    category: 'Audio',
    price: 0.03,
  },
  {
    id: '3',
    title: 'Research Paper: Blockchain Economics',
    owner: '0x1a0f2a21f8b98ee9a6adb648042f94a255e4e4d4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    licenseTypes: ['buy'],
    category: 'Research',
    price: 0.08,
  },
  {
    id: '4',
    title: 'Photography Collection: Urban Landscapes',
    owner: '0x8e23ee67d1332ad560396262c48ffbb01f93d052',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
    licenseTypes: ['rent'],
    category: 'Photography',
    price: 0.02,
  },
  {
    id: '5',
    title: 'Game Character Design',
    owner: '0x7a86c0b064171007716bbd6af96676935799a63e',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
    licenseTypes: ['buy', 'rent'],
    category: 'Gaming',
    price: 0.15,
  },
  {
    id: '6',
    title: 'Software Algorithm Patent',
    owner: '0x1a0f2a21f8b98ee9a6adb648042f94a255e4e4d4',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
    licenseTypes: ['buy'],
    category: 'Software',
    price: 0.25,
  },
];

interface IPCardGridProps {
  searchQuery: string;
}

export const IPCardGrid: React.FC<IPCardGridProps> = ({ searchQuery }) => {
  const [selectedIP, setSelectedIP] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { otherIPs, isConnected, handleGetOtherIPs, handleGetMyIPs } =
    useWallet();
  const { loading } = useLoading();

  // Use the fetched data or fall back to mock data if empty
  const ipData = useMemo(() => {
    return otherIPs && otherIPs.length > 0 ? otherIPs : [];
  }, [otherIPs]);

  // Helper function to extract category name from IP data
  const extractCategoryName = (ip: any): string => {
    // First try direct property access
    if (ip.category !== undefined) {
      return typeof ip.category === 'string'
        ? ip.category
        : getCategoryName(ip.category);
    }

    // Then try array access at index 3 (from blockchain contract)
    if (ip[3] !== undefined) {
      const categoryValue = ip[3];
      return getCategoryName(categoryValue);
    }

    // Default fallback
    return 'Other';
  };

  // Filter IPs based on search query - using useMemo to avoid unnecessary recomputation
  const filteredIPs = useMemo(() => {
    if (!searchQuery.trim()) {
      return ipData;
    }

    const query = searchQuery.toLowerCase();

    return ipData.filter((ip) => {
      // Extract title from either object property or array index
      const title = ip.title || ip[1] || '';

      // Get category name using proper mapping
      const categoryName = extractCategoryName(ip);

      // Get owner address
      const owner = ip.owner || ip[0] || '';

      // Get description
      const description = ip.description || ip[2] || '';

      // Check if query matches any of these fields
      return (
        title.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query) ||
        owner.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [ipData, searchQuery]);

  // Log IP data for debugging purposes
  useEffect(() => {
    if (ipData.length > 0) {
      if (ipData[0][3] !== undefined) {
      }
    }
  }, [ipData]);

  const handleCardClick = (ip: any) => {
    setSelectedIP(ip);
    setIsModalOpen(true);
  };

  // Handle transaction completion - refresh data
  const handleTransactionComplete = async () => {
    try {
      // Refresh both other IPs and my IPs to reflect new ownership
      await Promise.all([handleGetOtherIPs(), handleGetMyIPs()]);
    } catch (error) {
      console.error('Error refreshing data after transaction:', error);
    }
  };

  // Skeleton loader for IP cards
  const SkeletonCardGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-2 pt-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">IP Assets</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view available IP assets for licensing.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You need to connect your wallet to access this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <SkeletonCardGrid />;
  }

  return (
    <div>
      {filteredIPs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">No other IP found</p>
          <p className="text-sm mt-2">
            There are currently no IP assets available for licensing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIPs.map((ip, index) => (
            <IPCard
              key={ip.tokenId?.toString() || ip.id || index}
              ip={ip}
              onClick={() => handleCardClick(ip)}
              showActions={true}
              onTransactionComplete={handleTransactionComplete}
            />
          ))}
        </div>
      )}
      {selectedIP && (
        <LicenseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedIP(null);
          }}
          ip={selectedIP}
          onTransactionComplete={handleTransactionComplete}
        />
      )}
    </div>
  );
};
