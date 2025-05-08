'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IPCardGrid } from './IPCardGrid';
import { LicenseHistory } from './LicenseHistory';
import { SearchIcon, FilterIcon, GridIcon, ListIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';
import { TransactionStatus } from '@/components/ui/TransactionStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryEnum, getCategoryName } from '@/utils/enums';

export const LicenseManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'history'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const { handleGetOtherIPs, isConnected, otherIPs } = useWallet();
  const { loading, setLoading } = useLoading();
  const hasFetchedRef = useRef(false);

  const fetchIPAssets = async () => {
    if (isInitialFetch) {
      // Just use loading state for initial fetch
      setLoading(true);
    } else {
      // Use transaction status for subsequent operations
      setTxStatus('pending');
    }

    try {
      await handleGetOtherIPs();
      hasFetchedRef.current = true;

      // Debug logging for IP data structure
      if (otherIPs && otherIPs.length > 0) {
        console.log('First IP data structure:', otherIPs[0]);

        // Log category from index 3
        const categoryValue = otherIPs[0][3];
        if (categoryValue !== undefined) {
          console.log(`Category value from index 3: ${categoryValue}`);
          console.log(
            `Mapped category name: ${getCategoryName(categoryValue)}`
          );
        }

        // Log license type from index 5
        const licenseType = otherIPs[0][5];
        if (licenseType !== undefined) {
          console.log(`License type from index 5: ${licenseType}`);
        }

        // Log price values
        console.log(`Price from index 6: ${otherIPs[0][6]}`);
        console.log(`Price from index 7: ${otherIPs[0][7]}`);
      }

      if (!isInitialFetch) {
        setTxStatus('success');
        // Don't automatically reset to idle - let user see success and click Done
      }
    } catch (error) {
      console.error('Error fetching IPs:', error);
      if (!isInitialFetch) {
        setTxStatus('error');
      }
    } finally {
      setLoading(false);
      setIsInitialFetch(false);
    }
  };

  useEffect(() => {
    if (
      isConnected &&
      !hasFetchedRef.current &&
      (!otherIPs || otherIPs.length === 0)
    ) {
      fetchIPAssets();
    }
  }, [isConnected, handleGetOtherIPs, setLoading, otherIPs]);

  // Helper function to extract categories from blockchain data
  const extractAndDisplayCategory = (ip: any): string => {
    // First try to access via property
    if (ip.category !== undefined) {
      return typeof ip.category === 'string'
        ? ip.category
        : getCategoryName(ip.category);
    }

    // Then try to access via array index (index 3 from contract data)
    if (ip[3] !== undefined) {
      return getCategoryName(ip[3]);
    }

    // Default category if all else fails
    return 'Other';
  };

  const handleReset = () => {
    if (txStatus === 'error') {
      // If error, retry fetching as a transaction
      setIsInitialFetch(false);
      fetchIPAssets();
    } else {
      // Otherwise just reset the status
      setTxStatus('idle');
    }
  };

  // Categories aligned with the enum pattern - same as in RemixRegistrationForm
  const categories = Object.entries(CategoryEnum)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({
      id: value.toString(),
      name: key,
    }));

  // Skeleton loader for license cards
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">License Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search IP assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-full"
            />
          </div>
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <FilterIcon
              size={18}
              className="text-slate-600 dark:text-slate-400"
            />
          </button>
        </div>
      </div>

      {loading && isInitialFetch ? (
        <div className="my-8">
          <SkeletonCardGrid />
        </div>
      ) : txStatus !== 'idle' ? (
        <div className="my-8">
          <TransactionStatus
            status={txStatus}
            onReset={handleReset}
            successMessage="Successfully loaded your licensed IP assets."
            errorMessage="There was an error loading your IP assets. Please try again."
            pendingMessage="Processing your request on the blockchain..."
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
            <h3 className="font-medium">IP Assets</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700' : ''
                }`}
              >
                <GridIcon
                  size={18}
                  className="text-slate-600 dark:text-slate-400"
                />
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`p-1.5 rounded ${
                  viewMode === 'history' ? 'bg-slate-100 dark:bg-slate-700' : ''
                }`}
              >
                <ListIcon
                  size={18}
                  className="text-slate-600 dark:text-slate-400"
                />
              </button>
            </div>
          </div>
          <div className="p-4">
            {viewMode === 'grid' ? (
              <IPCardGrid searchQuery={searchQuery} />
            ) : (
              <LicenseHistory />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
