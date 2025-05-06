'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { RoyaltyDashboard } from './RoyaltyDashboard';
import { RoyaltyChart } from './RoyaltyChart';
import { IPBreakdown } from './IPBreakdown';
import {
  CalendarIcon,
  FilterIcon,
  ExternalLinkIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  DollarSignIcon,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { ethers, Contract } from 'ethers';

interface OwnedIP {
  id: string;
  title: string;
  category: string;
  type: 'personal' | 'rent' | 'remix';
  imageUrl: string;
  earnings: number;
  pendingRoyalty?: string;
  tokenId?: string;
  createdAt: string;
}

export const RoyaltyManagement: React.FC = () => {
  const {
    isConnected,
    myIPs,
    myRemixes,
    handleGetMyIPs,
    handleGetRentalsFromMyIP,
    handleGetRemixesOfMyIP,
    handleClaimRoyalty,
    headerGetterContract,
    rentalsByIP,
    remixesByParentIP,
  } = useWallet();

  const [dateRange, setDateRange] = useState('month');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('');
  const [selectedEarningRange, setSelectedEarningRange] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [processedIPs, setProcessedIPs] = useState<OwnedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [royaltyInfo, setRoyaltyInfo] = useState<{
    [key: string]: { pending: string; claimed: string };
  }>({});

  // Track which types of data we've loaded
  const [dataLoadStatus, setDataLoadStatus] = useState({
    personal: false,
    remixes: false,
    rentals: false,
  });

  // Handle tab change and fetch data based on the selected tab
  const handleTabChange = async (tabType: string) => {
    setActiveTab(tabType);

    // Only fetch data if wallet is connected
    if (!isConnected) return;

    try {
      setIsLoading(true);

      // Load the appropriate data based on tab selection
      if (
        (tabType === 'all' || tabType === 'personal' || tabType === 'rent') &&
        !dataLoadStatus.personal
      ) {
        console.log('Fetching regular IPs data...');
        await handleGetMyIPs();
        setDataLoadStatus((prev) => ({ ...prev, personal: true }));
      }

      if (
        (tabType === 'all' || tabType === 'rent') &&
        !dataLoadStatus.rentals
      ) {
        console.log('Fetching rental data for my IPs...');
        await handleGetRentalsFromMyIP();
        setDataLoadStatus((prev) => ({ ...prev, rentals: true }));
      }
    } catch (error) {
      console.error('Error loading data for tab:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get royalty info for a specific IP
  const fetchRoyaltyInfo = async (tokenId: string) => {
    if (!headerGetterContract) {
      console.error('headerGetterContract is not available');
      return;
    }

    await headerGetterContract(async (contract: Contract) => {
      try {
        const [pending, claimed] = await contract.getRoyalty(BigInt(tokenId));
        setRoyaltyInfo((prev) => ({
          ...prev,
          [tokenId]: {
            pending: ethers.formatEther(pending),
            claimed: ethers.formatEther(claimed),
          },
        }));
      } catch (error) {
        console.error(
          `Error fetching royalty info for token #${tokenId}:`,
          error
        );
      }
    });
  };

  // Handle claiming royalty for an IP
  const onClaimRoyalty = async (tokenId: string) => {
    try {
      setIsLoading(true);
      await handleClaimRoyalty(tokenId);
      // Refresh royalty info after claiming
      await fetchRoyaltyInfo(tokenId);
    } catch (error) {
      console.error('Error claiming royalty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show remixes of a specific IP
  const showRemixesForIP = async (tokenId: string) => {
    try {
      setIsLoading(true);
      setSelectedIP(tokenId);
      await handleGetRemixesOfMyIP(tokenId);
    } catch (error) {
      console.error('Error fetching remixes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load when component mounts
  useEffect(() => {
    if (isConnected) {
      handleTabChange(activeTab);
    }
  }, [isConnected]);

  // Process contract data into the format needed for display
  useEffect(() => {
    if (!isConnected) return;

    const processed: OwnedIP[] = [];

    // Process regular IPs
    if (myIPs && myIPs.length > 0) {
      myIPs.forEach((ip, index) => {
        // Get the token ID from owner to token ID mapping
        const tokenId = index.toString();

        processed.push({
          id: `regular-${index}`,
          tokenId: tokenId,
          title: ip.title,
          category: getCategoryName(Number(ip.category)),
          type: getLicenseType(Number(ip.licenseopt)),
          imageUrl: `https://picsum.photos/seed/${index + 1}/200`, // Placeholder image
          earnings: Number(ethers.formatEther(ip.royaltyPercentage || '0')), // Convert from wei to ETH
          pendingRoyalty: royaltyInfo[tokenId]?.pending || '0',
          createdAt: new Date().toISOString(), // Placeholder date
        });

        // Fetch royalty info for this IP
        if (!royaltyInfo[tokenId]) {
          fetchRoyaltyInfo(tokenId);
        }
      });
    }

    // Process remix IPs
    if (myRemixes && myRemixes.length > 0) {
      myRemixes.forEach((remix, index) => {
        if (remix.ip) {
          processed.push({
            id: `remix-${index}`,
            tokenId: index.toString(), // Placeholder
            title: remix.ip.title || 'Untitled Remix',
            category: getCategoryName(Number(remix.ip.category)),
            type: 'remix',
            imageUrl: `https://picsum.photos/seed/${index + 100}/200`, // Placeholder image
            earnings: Number(
              ethers.formatEther(remix.ip.royaltyPercentage || '0')
            ),
            createdAt: new Date().toISOString(), // Placeholder date
          });
        }
      });
    }

    setProcessedIPs(processed);
  }, [myIPs, myRemixes, isConnected, royaltyInfo]);

  // Helper functions remain the same
  const getCategoryName = (categoryNum: number): string => {
    const categories = [
      'Art',
      'Music',
      'Photography',
      'Software',
      'Literature',
      'Other',
    ];
    return categories[categoryNum] || 'Other';
  };

  const getLicenseType = (
    licenseNum: number
  ): 'personal' | 'rent' | 'remix' => {
    switch (licenseNum) {
      case 0:
        return 'personal';
      case 1:
      case 2:
        return 'rent';
      case 3:
      case 4:
        return 'remix';
      default:
        return 'personal';
    }
  };

  // Filter the IPs based on tab selection
  const filteredIPs = processedIPs.filter((ip) => {
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

  // Update the tabs section to use the new handleTabChange function
  return (
    <div>
      {/* The rest of your component stays the same */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Royalty Management</h2>
        {/* Existing filter controls */}
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          {/* Existing filter controls */}
        </div>
      )}

      <RoyaltyDashboard dateRange={dateRange} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Pending Royalties
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {processedIPs
              .reduce(
                (total, ip) => total + Number(ip.pendingRoyalty || '0'),
                0
              )
              .toFixed(6)}{' '}
            ETH
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Claimed Royalties
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {/* Sum of all claimed royalties */}
            {Object.values(royaltyInfo)
              .reduce((total, info) => total + Number(info.claimed || '0'), 0)
              .toFixed(6)}{' '}
            ETH
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Remixed IPs
          </h3>
          <p className="mt-2 text-2xl font-bold">
            {
              processedIPs.filter(
                (ip) =>
                  ip.type === 'personal' && Number(ip.pendingRoyalty || 0) > 0
              ).length
            }
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
          About Royalties
        </h4>
        <p className="text-xs text-blue-600 dark:text-blue-500">
          When someone remixes your original IP, they pay royalties based on the
          percentage you set. These royalties accumulate and can be claimed by
          you at any time. The "Claim" button will transfer pending royalties to
          your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Existing RoyaltyChart and IPBreakdown */}
      </div>

      {/* Your IP List Section with actual data */}
      <div className="mt-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
            <h3 className="font-medium">Your Intellectual Property</h3>

            {/* Updated tabs for filtering IPs by type */}
            <div className="flex mt-4 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleTabChange('personal')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'personal'
                    ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                    : 'border-transparent hover:text-green-600 dark:hover:text-green-400'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => handleTabChange('rent')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === 'rent'
                    ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
                    : 'border-transparent hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => handleTabChange('remix')}
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

          {/* IP List with loading state */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading {activeTab} IPs...</span>
              </div>
            ) : selectedIP ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedIP(null)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  >
                    ← Back to all IPs
                  </button>

                  {/* Add royalty actions for this specific IP */}
                  {royaltyInfo[selectedIP]?.pending &&
                    Number(royaltyInfo[selectedIP].pending) > 0 && (
                      <button
                        onClick={() => onClaimRoyalty(selectedIP)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Claim {royaltyInfo[selectedIP].pending} ETH Royalties
                      </button>
                    )}
                </div>

                {/* Royalty summary for this IP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pending Royalties
                    </h3>
                    <p className="mt-1 text-xl font-bold">
                      {royaltyInfo[selectedIP]?.pending || '0'} ETH
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Claimed Royalties
                    </h3>
                    <p className="mt-1 text-xl font-bold">
                      {royaltyInfo[selectedIP]?.claimed || '0'} ETH
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium">
                  Remixes of IP #{selectedIP}
                </h3>

                {/* Rest of your remix display code */}
                {remixesByParentIP.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {remixesByParentIP.map((remixInfo, index) => (
                      <div
                        key={`remix-of-${selectedIP}-${index}`}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800"
                      >
                        <div className="aspect-video relative">
                          <img
                            src={`https://picsum.photos/seed/remix${selectedIP}-${index}/200`}
                            alt={remixInfo.ip.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="rounded-full text-xs px-2 py-1 font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                              Remix
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm truncate">
                            {remixInfo.ip.title}
                          </h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-0.5">
                              {getCategoryName(Number(remixInfo.ip.category))}
                            </span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {ethers.formatEther(
                                remixInfo.ip.royaltyPercentage || '0'
                              )}{' '}
                              ETH
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">
                      No remixes found for this IP
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
                  <h4 className="text-sm font-medium mb-3">Royalty Timeline</h4>
                  <div className="space-y-3">
                    {Object.entries(royaltyInfo)
                      .filter(([id, _]) => id === selectedIP)
                      .map(([id, info]) => (
                        <div
                          key={`timeline-${id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <div>
                            <p className="text-sm">
                              Royalty available: {info.pending} ETH
                            </p>
                            <span className="text-xs text-slate-500">
                              Today
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* Add more timeline events here */}
                  </div>
                </div>
              </div>
            ) : filteredIPs.length > 0 ? (
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
                      <div className="absolute top-2 left-2">
                        {Number(ip.pendingRoyalty || 0) > 0 && (
                          <span
                            className="animate-pulse rounded-full bg-green-500 w-3 h-3 inline-block mr-1"
                            title={`${ip.pendingRoyalty} ETH pending royalties`}
                          ></span>
                        )}
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
                          {ip.earnings.toFixed(4)} ETH
                        </span>
                      </div>

                      {/* Improved pending royalty display */}
                      {ip.pendingRoyalty && Number(ip.pendingRoyalty) > 0 && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                Available royalties: {ip.pendingRoyalty} ETH
                              </span>
                              <p className="text-xs text-green-600 dark:text-green-500">
                                From remixes of your original work
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                ip.tokenId && onClaimRoyalty(ip.tokenId)
                              }
                              className="text-xs bg-green-500 hover:bg-green-600 text-white rounded-md px-2 py-1 flex items-center"
                            >
                              <DollarSignIcon size={12} className="mr-1" />{' '}
                              Claim
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Created {new Date(ip.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          {ip.tokenId && (
                            <button
                              onClick={() => showRemixesForIP(ip.tokenId!)}
                              className="p-1.5 text-sm flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                              title="View remixes"
                            >
                              <ExternalLinkIcon size={14} className="mr-1" />
                              View{' '}
                              {myRemixes.filter(
                                (r) => r.parentId?.toString() === ip.tokenId
                              ).length || '0'}{' '}
                              Remixes
                            </button>
                          )}
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
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="inline-block p-3 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                  <DollarSignIcon size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Royalties Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {activeTab === 'all'
                    ? "You don't have any IP assets with royalty arrangements yet."
                    : `You don't have any ${activeTab} IPs that generate royalties.`}
                </p>
                {activeTab === 'all' && (
                  <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Register New IP
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination section */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredIPs.length} of {processedIPs.length} IPs
            </span>
            <div className="flex gap-1">
              <button
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={true}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={true}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
