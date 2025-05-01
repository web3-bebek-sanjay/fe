'use client';

import React, { useState } from 'react';
import {
  CalendarIcon,
  FilterIcon,
  ExternalLinkIcon,
  ClockIcon,
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface LicensedIP {
  id: string;
  title: string;
  creator: string;
  category: string;
  licenseType: 'personal' | 'rent' | 'remix';
  imageUrl: string;
  acquiredDate: string;
  expiryDate?: string;
  status: 'active' | 'expired';
  usageRights: string[];
}

export const History: React.FC = () => {
  const { isConnected } = useAccount();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Modified mock data with simplified status
  const licensedIPs: LicensedIP[] = [
    {
      id: 'ip-101',
      title: 'Abstract Digital Art Collection',
      creator: '0x742...3F91',
      category: 'Art',
      licenseType: 'personal',
      imageUrl: 'https://picsum.photos/seed/11/400',
      acquiredDate: '2025-02-15',
      status: 'active',
      usageRights: ['Personal Use', 'Display', 'Print', 'Modify'],
    },
    {
      id: 'ip-102',
      title: 'Corporate Presentation Template',
      creator: '0x892...4A72',
      category: 'Design',
      licenseType: 'rent',
      imageUrl: 'https://picsum.photos/seed/12/400',
      acquiredDate: '2025-03-10',
      expiryDate: '2025-06-10',
      status: 'active',
      usageRights: ['Commercial Use', 'Modify', 'Display', 'Distribute'],
    },
    {
      id: 'ip-103',
      title: 'Professional Photo Set',
      creator: '0x567...8D21',
      category: 'Photography',
      licenseType: 'personal',
      imageUrl: 'https://picsum.photos/seed/13/400',
      acquiredDate: '2025-01-20',
      status: 'active',
      usageRights: ['Personal Use', 'Display', 'Print'],
    },
    {
      id: 'ip-104',
      title: 'Electronic Music Track',
      creator: '0x123...7B90',
      category: 'Music',
      licenseType: 'rent',
      imageUrl: 'https://picsum.photos/seed/14/400',
      acquiredDate: '2025-02-28',
      expiryDate: '2025-04-28',
      status: 'expired',
      usageRights: ['Commercial Use', 'Public Performance', 'Distribute'],
    },
    {
      id: 'ip-105',
      title: '3D Character Models',
      creator: '0x456...9C34',
      category: 'Gaming',
      licenseType: 'personal',
      imageUrl: 'https://picsum.photos/seed/15/400',
      acquiredDate: '2025-03-05',
      status: 'expired', // Changed from paused to expired
      usageRights: ['Personal Use', 'Modify', 'Integrate'],
    },
    {
      id: 'ip-106',
      title: 'UI Component Library',
      creator: '0x789...2D45',
      category: 'Software',
      licenseType: 'remix',
      imageUrl: 'https://picsum.photos/seed/16/400',
      acquiredDate: '2025-03-15',
      status: 'active',
      usageRights: ['Remix', 'Modify', 'Distribute', 'Commercial Use'],
    },
  ];

  // Filter the IPs based on tab and other filters
  const filteredIPs = licensedIPs.filter((ip) => {
    // Filter by tab
    if (activeTab !== 'all' && ip.licenseType !== activeTab) return false;

    // Filter by category
    if (
      selectedCategory &&
      ip.category.toLowerCase() !== selectedCategory.toLowerCase()
    )
      return false;

    // Filter by license type
    if (selectedLicenseType && ip.licenseType !== selectedLicenseType)
      return false;

    // Filter by status
    if (selectedStatus && ip.status !== selectedStatus) return false;

    return true;
  });

  // Helper to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to get status label (simplified)
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs px-2 py-1 rounded-full">
            Expired
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
            {status}
          </span>
        );
    }
  };

  // Helper to get license type badge
  const getLicenseTypeBadge = (type: string) => {
    switch (type) {
      case 'personal':
        return (
          <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs px-2 py-1 rounded-full">
            Personal
          </span>
        );
      case 'rent':
        return (
          <span className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
            Rent
          </span>
        );
      case 'remix':
        return (
          <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
            Remix
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
            {type}
          </span>
        );
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view your transaction history.
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
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-2">
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
            <span>Sort</span>
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
                <option value="design">Design</option>
                <option value="software">Software</option>
                <option value="gaming">Gaming</option>
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
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'personal'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent hover:text-green-600 dark:hover:text-green-400'
              }`}
            >
              Purchased
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'rent'
                  ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
                  : 'border-transparent hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              Rented
            </button>
            <button
              onClick={() => setActiveTab('remix')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === 'remix'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent hover:text-purple-600 dark:hover:text-purple-400'
              }`}
            >
              Remixes
            </button>
          </div>
        </div>
      </div>

      {/* IP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIPs.length > 0 ? (
          filteredIPs.map((ip) => (
            <div
              key={ip.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="aspect-video relative">
                <img
                  src={ip.imageUrl}
                  alt={ip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-1">
                  {getLicenseTypeBadge(ip.licenseType)}
                </div>
                {ip.licenseType === 'rent' && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center">
                    <ClockIcon size={12} className="mr-1" />
                    {ip.status === 'expired'
                      ? 'Expired'
                      : `Expires: ${formatDate(ip.expiryDate)}`}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-medium text-lg mb-1 truncate">
                  {ip.title}
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    by {ip.creator}
                  </span>
                  {getStatusLabel(ip.status)}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-0.5">
                    {ip.category}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-0.5">
                    Acquired: {formatDate(ip.acquiredDate)}
                  </span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3">
                  <h4 className="text-xs font-medium mb-2">Usage Rights:</h4>
                  <div className="flex flex-wrap gap-1">
                    {ip.usageRights.map((right, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {right}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <ExternalLinkIcon size={16} />
                    View Transaction
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No transaction history found for the selected filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredIPs.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredIPs.length} of {licensedIPs.length} transactions
          </span>
          <div className="flex gap-1">
            <button
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
