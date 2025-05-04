'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { IPCardGrid } from './IPCardGrid';
import { LicenseHistory } from './LicenseHistory';
import {
  SearchIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';

export const LicenseManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'history'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { handleGetOtherIPs, isConnected, otherIPs } = useWallet();
  const { loading, setLoading } = useLoading();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (
      isConnected &&
      !hasFetchedRef.current &&
      (!otherIPs || otherIPs.length === 0)
    ) {
      const fetchData = async () => {
        setLoading(true);
        try {
          await handleGetOtherIPs();
          hasFetchedRef.current = true;
        } catch (error) {
          console.error('Error fetching IPs:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isConnected, handleGetOtherIPs, setLoading, otherIPs]);

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
    </div>
  );
};
