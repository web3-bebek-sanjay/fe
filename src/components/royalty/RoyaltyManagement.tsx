'use client';

import type React from 'react';
import { useState } from 'react';
import { RoyaltyDashboard } from './RoyaltyDashboard';
import { RoyaltyChart } from './RoyaltyChart';
import { IPBreakdown } from './IPBreakdown';
import {
  CalendarIcon,
  FilterIcon,
  ExternalLinkIcon,
  Edit3Icon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface OwnedIP {
  id: string;
  title: string;
  category: string;
  type: 'personal' | 'rent' | 'remix';
  imageUrl: string;
  earnings: number;
  createdAt: string;
}

export const RoyaltyManagement: React.FC = () => {
  const { isConnected } = useWallet(); // Replace useAccount with useWallet
  const [dateRange, setDateRange] = useState('month');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('');
  const [selectedEarningRange, setSelectedEarningRange] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Mock data for owned IPs
  const ownedIPs: OwnedIP[] = [
    {
      id: 'ip-001',
      title: 'Digital Landscape Artwork',
      category: 'Art',
      type: 'personal',
      imageUrl: 'https://picsum.photos/seed/1/200',
      earnings: 0.45,
      createdAt: '2025-01-15',
    },
    {
      id: 'ip-002',
      title: 'Music Track: Summer Vibes',
      category: 'Music',
      type: 'rent',
      imageUrl: 'https://picsum.photos/seed/2/200',
      earnings: 0.32,
      createdAt: '2025-02-10',
    },
    {
      id: 'ip-003',
      title: 'Nature Photography Collection',
      category: 'Photography',
      type: 'remix',
      imageUrl: 'https://picsum.photos/seed/3/200',
      earnings: 0.21,
      createdAt: '2025-03-05',
    },
    {
      id: 'ip-004',
      title: 'Code Library: React Components',
      category: 'Software',
      type: 'rent',
      imageUrl: 'https://picsum.photos/seed/4/200',
      earnings: 0.18,
      createdAt: '2025-03-20',
    },
  ];

  // Filter the IPs based on tab selection
  const filteredIPs = ownedIPs.filter((ip) => {
    if (activeTab === 'all') return true;
    return ip.type === activeTab;
  });

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Royalty Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view and manage your royalty earnings from
            your IP assets.
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Royalty Management</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1.5 text-sm font-medium ${
                dateRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 text-sm font-medium ${
                dateRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-1.5 text-sm font-medium ${
                dateRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              Year
            </button>
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-lg border ${
              filterOpen
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            <FilterIcon size={18} />
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
            <CalendarIcon size={16} />
            <span>Custom</span>
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                IP Category
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
                <option value="photography">Photography</option>
                <option value="software">Software</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                License Type
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                value={selectedLicenseType}
                onChange={(e) => setSelectedLicenseType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="personal">Personal</option>
                <option value="rent">Rent</option>
                <option value="remix">Remix</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Earnings Range
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                value={selectedEarningRange}
                onChange={(e) => setSelectedEarningRange(e.target.value)}
              >
                <option value="">All Earnings</option>
                <option value="0-0.1">0 - 0.1 ETH</option>
                <option value="0.1-0.5">0.1 - 0.5 ETH</option>
                <option value="0.5+">0.5+ ETH</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <RoyaltyDashboard dateRange={dateRange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <h3 className="font-medium">Earnings Overview</h3>
            </div>
            <div className="p-4">
              <RoyaltyChart dateRange={dateRange} />
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
              <h3 className="font-medium">Top Earning IPs</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </button>
            </div>
            <div className="p-4">
              <IPBreakdown dateRange={dateRange} />
            </div>
          </div>
        </div>
      </div>

      {/* Your IP List Section */}
      <div className="mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <h3 className="font-medium">Your Intellectual Property</h3>

            {/* Tabs for filtering IPs by type */}
            <div className="flex mt-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'personal'
                    ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                    : 'border-transparent hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'rent'
                    ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
                    : 'border-transparent hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => setActiveTab('remix')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'remix'
                    ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                Remix
              </button>
            </div>
          </div>

          {/* IP List */}
          <div className="p-4">
            {filteredIPs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIPs.map((ip) => (
                  <div
                    key={ip.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={ip.imageUrl}
                        alt={ip.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`rounded-full text-xs px-2 py-1 font-medium ${
                            ip.type === 'personal'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : ip.type === 'rent'
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          }`}
                        >
                          {ip.type === 'personal'
                            ? 'Personal'
                            : ip.type === 'rent'
                            ? 'Rent'
                            : 'Remix'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate">
                        {ip.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-0.5">
                          {ip.category}
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {ip.earnings} ETH
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Created {new Date(ip.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <ExternalLinkIcon size={16} />
                          </button>
                          <button className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <Edit3Icon size={16} />
                          </button>
                          <button className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <MoreHorizontalIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">
                  No IPs found for this category.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredIPs.length} of {ownedIPs.length} IPs
            </span>
            <div className="flex gap-1">
              <button
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
