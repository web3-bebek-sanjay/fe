'use client';

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { IPCardGrid } from './IPCardGrid';
import { SearchIcon, FilterIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';
import { TransactionStatus } from '@/components/ui/TransactionStatus';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryEnum, getCategoryName } from '@/utils/enums';

export const LicenseManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [isInitialFetch, setIsInitialFetch] = useState(true);
  const { handleGetOtherIPs, isConnected, otherIPs } = useWallet();
  const { loading, setLoading } = useLoading();
  const hasFetchedRef = useRef(false);

  const fetchIPAssets = useCallback(async () => {
    if (isInitialFetch) {
      setLoading(true);
    } else {
      setTxStatus('pending');
    }

    try {
      await handleGetOtherIPs();
      hasFetchedRef.current = true;

      if (!isInitialFetch) {
        setTxStatus('success');
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
  }, [handleGetOtherIPs, setLoading, isInitialFetch]);

  // Fix the infinite loop by only running once when connected and not already fetched
  useEffect(() => {
    if (isConnected && !hasFetchedRef.current) {
      fetchIPAssets();
    }
  }, [isConnected]); // Remove problematic dependencies

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
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <h3 className="font-medium">IP Assets</h3>
          </div>
          <div className="p-4">
            <IPCardGrid searchQuery={searchQuery} />
          </div>
        </div>
      )}
    </div>
  );
};
