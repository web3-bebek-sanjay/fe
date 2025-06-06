'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { RoyaltyDashboard } from './RoyaltyDashboard';
import { RoyaltyChart } from './RoyaltyChart';
import { IPBreakdown } from './IPBreakdown';
import { OptimizedImage } from '../ui/OptimizedImage';
import {
  CalendarIcon,
  FilterIcon,
  ExternalLinkIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  DollarSignIcon,
  InfoIcon,
  TrendingUpIcon,
  WalletIcon,
  CopyIcon,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { ethers, Contract } from 'ethers';

interface Remix {
  id: string;
  tokenId: string;
  parentId: string;
  title: string;
  description: string;
  parentTitle: string;
  parentCreator: string;
  royaltyRate: number;
  status: string;
  createdAt: Date;
  totalSales: string;
  totalRoyaltiesPaid: string;
  deposits: any[];
  coverImage: string;
}

interface OwnedIP {
  id: string;
  title: string;
  category: string;
  type: 'personal' | 'rent' | 'remix';
  imageUrl: string;
  fallbackImageUrl?: string;
  earnings: number;
  pendingRoyalty?: string;
  tokenId?: string;
  createdAt: string;
  description?: string;
  fileUpload?: string;
}

// Add a RoyaltyClaimCard component before the RoyaltyManagement component
const RoyaltyClaimCard = ({
  royaltyInfo,
  onClaimRoyalty,
  tokenId,
  isLoading,
}: {
  royaltyInfo: {
    pending: string;
    claimed: string;
    isYourIP?: boolean;
  };
  onClaimRoyalty: (tokenId: string) => Promise<void>;
  tokenId: string;
  isLoading: boolean;
}) => {
  // Check if pending amount is a valid number and greater than zero
  const pendingStr = royaltyInfo.pending || '0';
  const pendingAmount = Number(pendingStr);

  // Return null if no pending amount or invalid value
  if (isNaN(pendingAmount) || pendingAmount <= 0) {
    return null;
  }

  // If isYourIP is explicitly set to false, only show a read-only view
  const isReadOnly = royaltyInfo.isYourIP === false;

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">
            {isReadOnly ? 'Royalties for This IP' : 'Royalties Available!'}
          </h3>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
            {isReadOnly ? 'This IP has ' : 'You have '}
            <span className="font-bold">{royaltyInfo.pending} ETH</span> in
            royalties {isReadOnly ? '' : 'ready to claim'}
            {tokenId !== '0' ? ` from IP #${tokenId}` : ''}
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={() => onClaimRoyalty(tokenId)}
            disabled={isLoading}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white 
              ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Claiming...
              </>
            ) : (
              <>
                <DollarSignIcon size={14} className="mr-1" />
                Claim {royaltyInfo.pending} ETH
              </>
            )}
          </button>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800">
        <p className="text-xs text-blue-600 dark:text-blue-500">
          Previously claimed: {royaltyInfo.claimed || '0'} ETH
        </p>
      </div>
    </div>
  );
};

// Update the RoyaltySummary component to handle token #0 correctly
const RoyaltySummary = ({
  royaltyInfo,
  onClaimRoyalty,
  isLoading,
}: {
  royaltyInfo: {
    [key: string]: {
      pending: string;
      claimed: string;
      isOriginalIP?: boolean;
      isYourIP?: boolean;
    };
  };
  onClaimRoyalty: (tokenId: string) => Promise<void>;
  isLoading: boolean;
}) => {
  // If token #0 has royalties AND user is the owner, present it as a single card
  const globalRoyalty = royaltyInfo['0'];
  if (
    globalRoyalty &&
    Number(globalRoyalty.pending) > 0 &&
    globalRoyalty.isYourIP === true
  ) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Claimable Royalties</h3>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Central Royalty Pool
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                You have{' '}
                <span className="font-bold">{globalRoyalty.pending} ETH</span>{' '}
                in accumulated royalties ready to claim
              </p>
            </div>
            <button
              onClick={() => onClaimRoyalty('0')}
              disabled={isLoading}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-white 
                ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <DollarSignIcon size={14} className="mr-1" />
                  Claim All Royalties
                </>
              )}
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-500">
              Previously claimed: {globalRoyalty.claimed} ETH
            </p>
          </div>
        </div>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm text-blue-600 dark:text-blue-400">
          <InfoIcon className="inline-block h-4 w-4 mr-1" />
          All your royalties are collected in a central pool. Use the "Claim All
          Royalties" button above to claim them with one transaction.
        </div>
      </div>
    );
  }

  // Rest of the component remains the same
  // Get all keys where pending royalties exist and isYourIP is true
  const claimableRoyalties = Object.entries(royaltyInfo)
    .filter(
      ([tokenId, info]) =>
        tokenId !== '0' && // Skip token #0 as we've handled it above
        Number(info.pending) > 0 &&
        info.isYourIP &&
        tokenId !== undefined &&
        tokenId !== null &&
        tokenId !== ''
    )
    .sort((a, b) => Number(b[1].pending) - Number(a[1].pending)); // Sort by highest pending first

  if (claimableRoyalties.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Claimable Royalties</h3>
      <div className="space-y-3">
        {claimableRoyalties.map(([tokenId, info]) => (
          <RoyaltyClaimCard
            key={`royalty-${tokenId}`}
            royaltyInfo={info}
            onClaimRoyalty={onClaimRoyalty}
            tokenId={tokenId}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

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
    account,
    handleGetMyRemixes,
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
    [key: string]: {
      pending: string;
      claimed: string;
      isOriginalIP?: boolean;
      isYourIP?: boolean;
    };
  }>({});

  // Track which types of data we've loaded
  const [dataLoadStatus, setDataLoadStatus] = useState({
    personal: false,
    remixes: false,
    rentals: false,
  });

  // Add these missing state variables
  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [parentIPDetails, setParentIPDetails] = useState<{
    [key: string]: any;
  }>({});

  // Add this function to get the correct royalty amount
  const getRoyaltyAmount = (
    royaltyInfo: {
      [key: string]: {
        pending: string;
        claimed: string;
        isOriginalIP?: boolean;
        isYourIP?: boolean;
      };
    },
    tokenId: string
  ): { pending: string; claimed: string; isYourIP?: boolean } => {
    // Always check token #0 for royalties as it appears to be the global accumulator
    const globalRoyalty = royaltyInfo['0'] || {
      pending: '0',
      claimed: '0',
      isYourIP: false,
    };

    // Also check the specific token ID
    const specificRoyalty = royaltyInfo[tokenId] || {
      pending: '0',
      claimed: '0',
      isYourIP: false,
    };

    // Only use global royalty pool if:
    // 1. The global pool has pending royalties
    // 2. The specific token doesn't have its own pending royalties
    // 3. The user owns the global token #0
    if (
      Number(globalRoyalty.pending) > 0 &&
      Number(specificRoyalty.pending) === 0 &&
      globalRoyalty.isYourIP === true
    ) {
      return {
        ...globalRoyalty,
        isYourIP: true,
      };
    }

    return specificRoyalty;
  };

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
        await handleGetMyIPs();
        setDataLoadStatus((prev) => ({ ...prev, personal: true }));
      }

      if (
        (tabType === 'all' || tabType === 'rent') &&
        !dataLoadStatus.rentals
      ) {
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
        // First get the IP to determine ownership and details
        const ipData = await contract.getIP(BigInt(tokenId));

        // Extract the owner address, ensuring consistent format
        const ipOwnerAddress = ipData.owner ? ipData.owner.toLowerCase() : null;
        const isOwner =
          account && ipOwnerAddress && ipOwnerAddress === account.toLowerCase();

        // Only log IP data if it's your IP or it's not token #0
        if (isOwner || tokenId !== '0') {
          console.log(`IP data for token #${tokenId}:`, ipData);
        }

        // Check royalty information
        try {
          const [pending, claimed] = await contract.getRoyalty(BigInt(tokenId));

          // Only log royalty info if it's your IP or it's not token #0
          if (isOwner || tokenId !== '0') {
            console.log(`Royalty for token #${tokenId}:`, {
              pending: ethers.formatEther(pending),
              claimed: ethers.formatEther(claimed),
              owner: ipOwnerAddress,
              currentAccount: account?.toLowerCase(),
              isOwner,
            });
          }

          // Store royalty info in state
          setRoyaltyInfo((prev) => ({
            ...prev,
            [tokenId]: {
              pending: ethers.formatEther(pending),
              claimed: ethers.formatEther(claimed),
              isOriginalIP: true,
              isYourIP: isOwner,
            },
          }));
        } catch (error) {
          console.error(`Error fetching royalty for token #${tokenId}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching IP data for token #${tokenId}:`, error);
      }
    });
  };

  // Add this function to get all your IPs and their royalties
  const fetchAllMyIPsAndRoyalties = async () => {
    setIsLoading(true);

    try {
      await headerGetterContract(async (contract) => {
        console.log('Fetching all IPs and royalties data...');

        // 1. Get all token IDs owned by the account
        const balance = await contract.balanceOf(account);
        console.log(`Account has ${balance} tokens`);

        // Create a mapping of token IDs to their actual token IDs
        const tokenMapping: { [key: number]: string } = {};

        // 2. Loop through each token owned by the account
        for (let i = 0; i < Number(balance); i++) {
          try {
            // Get the tokenId at index i for this owner
            const tokenId = await contract.ownerToTokenIds(account, i);
            console.log(`Found tokenId: ${tokenId}`);

            // Store the mapping (index -> actual token ID)
            tokenMapping[i] = tokenId.toString();

            // Get royalty info for this token
            await fetchRoyaltyInfo(tokenId.toString());
          } catch (error) {
            console.error(`Error processing token at index ${i}:`, error);
          }
        }

        // Store the token mapping in localStorage for use in the UI
        localStorage.setItem('tokenMapping', JSON.stringify(tokenMapping));

        // 3. Get all rentals from my IPs using getListRentFromMyIp
        try {
          await handleGetRentalsFromMyIP();
          setDataLoadStatus((prev) => ({ ...prev, rentals: true }));
        } catch (error) {
          console.error('Error fetching rentals from my IPs:', error);
        }

        // 4. Get all remixes of my IPs using getMyIPsRemix
        try {
          const remixes = await contract.getMyIPsRemix(account);

          // Process each remix to get its royalty info
          for (const remix of remixes) {
            if (remix && remix.parentId) {
              const parentId = remix.parentId.toString();

              // 5. Get royalty info for each parent ID
              try {
                const [pending, claimed] = await contract.getRoyalty(
                  BigInt(parentId)
                );

                // Update royalty info state
                setRoyaltyInfo((prev) => ({
                  ...prev,
                  [parentId]: {
                    pending: ethers.formatEther(pending),
                    claimed: ethers.formatEther(claimed),
                    isOriginalIP: true,
                    isYourIP: true, // Since we're only looking at our IPs
                  },
                }));
              } catch (royaltyError) {
                console.error(
                  `Error fetching royalty for parent #${parentId}:`,
                  royaltyError
                );
              }
            }
          }

          await handleGetMyRemixes(true, remixes);
          setDataLoadStatus((prev) => ({ ...prev, remixes: true }));
        } catch (error) {
          console.error('Error fetching my IP remixes:', error);
        }

        // 6. Additionally, check royalties for token #0 explicitly since it seems to be tracking royalties
        try {
          await fetchRoyaltyInfo('0');
        } catch (error) {
          console.error('Error checking royalties for token #0:', error);
        }
      });
    } catch (error) {
      console.error('Failed to fetch IPs and royalties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to call this function when the component mounts
  useEffect(() => {
    if (isConnected) {
      fetchAllMyIPsAndRoyalties();
    }
  }, [isConnected]);

  // Update the showRemixesForIP function to use the parent ID correctly
  const showRemixesForIP = async (tokenId: string) => {
    try {
      setIsLoading(true);
      setSelectedIP(tokenId);

      // Call the updated function that uses getMyIPsRemix
      await handleGetRemixesOfMyIP(tokenId);
    } catch (error) {
      console.error('Error fetching remixes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the onClaimRoyalty function to always use the provided token ID
  const onClaimRoyalty = async (specificTokenId: string) => {
    try {
      if (!specificTokenId) {
        console.error('No token ID specified for claiming royalties');
        alert('Please select a specific IP to claim royalties from');
        return;
      }

      // Get the royalty info for this token
      const tokenRoyaltyInfo = royaltyInfo[specificTokenId];

      if (!tokenRoyaltyInfo) {
        alert(`No royalty information available for IP #${specificTokenId}`);
        return;
      }

      // Verify user owns this token
      if (!tokenRoyaltyInfo.isYourIP) {
        alert(
          `You are not the owner of IP #${specificTokenId} and cannot claim its royalties`
        );
        return;
      }

      if (Number(tokenRoyaltyInfo.pending) <= 0) {
        alert(`No royalties available to claim for IP #${specificTokenId}`);
        return;
      }

      // Show confirmation dialog with token ID and amount
      const confirmed = window.confirm(
        `Are you sure you want to claim ${tokenRoyaltyInfo.pending} ETH in royalties from IP #${specificTokenId}?`
      );

      if (!confirmed) {
        return;
      }

      setIsLoading(true);
      await handleClaimRoyalty(specificTokenId);

      // Refresh royalty info after claiming
      await fetchRoyaltyInfo(specificTokenId);

      // Always refresh global royalty info as well
      if (specificTokenId !== '0') {
        await fetchRoyaltyInfo('0');
      }

      // Refresh all royalty data after claiming
      await fetchAllMyIPsAndRoyalties();

      alert(`Successfully claimed royalties from IP #${specificTokenId}`);
    } catch (error) {
      console.error('Error claiming royalty:', error);
      alert('Failed to claim royalty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process contract data into the format needed for display
  useEffect(() => {
    if (!isConnected) return;

    const processed: OwnedIP[] = [];

    // Get the token mapping from localStorage
    const tokenMappingStr = localStorage.getItem('tokenMapping');
    const tokenMapping: { [key: number]: string } = tokenMappingStr
      ? JSON.parse(tokenMappingStr)
      : {};

    // Process regular IPs
    if (myIPs && myIPs.length > 0) {
      myIPs.forEach((ip, index) => {
        // Use the actual token ID from the mapping, or fall back to index
        const tokenId = tokenMapping[index] || index.toString();
        const imageUrls = getImageUrl(ip, index);

        processed.push({
          id: `regular-${index}`,
          tokenId: tokenId, // Use the actual token ID
          title: ip.title || `IP Asset #${tokenId}`,
          category: getCategoryName(Number(ip.category)),
          type: getLicenseType(Number(ip.licenseopt)),
          imageUrl: imageUrls.primary,
          fallbackImageUrl: imageUrls.fallback,
          earnings: Number(ethers.formatEther(ip.royaltyPercentage || '0')), // Convert from wei to ETH
          pendingRoyalty: royaltyInfo[tokenId]?.pending || '0',
          createdAt: new Date().toISOString(), // Placeholder date
          description: ip.description || '',
          fileUpload: ip.fileUpload || '',
        });

        // Fetch royalty info for this IP
        if (!royaltyInfo[tokenId]) {
          fetchRoyaltyInfo(tokenId);
        }
      });
    }

    // Process remix IPs (similar approach)
    if (myRemixes && myRemixes.length > 0) {
      myRemixes.forEach((remix, index) => {
        if (remix.ip) {
          // Use the actual token ID from the remix object if available
          const tokenId = remix.tokenId
            ? remix.tokenId.toString()
            : index.toString();
          const imageUrls = getImageUrl(remix.ip, index, true);

          processed.push({
            id: `remix-${index}`,
            tokenId: tokenId,
            title: remix.ip.title || `Remix #${tokenId}`,
            category: getCategoryName(Number(remix.ip.category)),
            type: 'remix',
            imageUrl: imageUrls.primary,
            fallbackImageUrl: imageUrls.fallback,
            earnings: Number(
              ethers.formatEther(remix.ip.royaltyPercentage || '0')
            ),
            createdAt: new Date().toISOString(), // Placeholder date
            description: remix.ip.description || '',
            fileUpload: remix.ip.fileUpload || '',
          });
        }
      });
    }

    setProcessedIPs(processed);
  }, [myIPs, myRemixes, isConnected, royaltyInfo]);

  // Helper functions
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

  // Generate image URL with proper fallback
  const getImageUrl = (
    ip: any,
    index: number,
    isRemix: boolean = false
  ): { primary: string; fallback: string } => {
    // Check if there's a fileUpload URL from the blockchain
    if (ip.fileUpload && ip.fileUpload.startsWith('http')) {
      return {
        primary: ip.fileUpload,
        fallback: `https://picsum.photos/seed/${
          isRemix ? 'remix' : 'ip'
        }${index}/400/300`,
      };
    }

    // Generate category-appropriate placeholder
    const categorySeeds = {
      Art: 'art',
      Music: 'music',
      Photography: 'photo',
      Software: 'code',
      Literature: 'book',
      Other: 'misc',
    };

    const category = getCategoryName(Number(ip.category));
    const seed =
      categorySeeds[category as keyof typeof categorySeeds] || 'misc';

    return {
      primary: `https://picsum.photos/seed/${seed}${index}/400/300`,
      fallback: `https://via.placeholder.com/400x300/3b82f6/ffffff?text=${encodeURIComponent(
        ip.title || 'IP Asset'
      )}`,
    };
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

  // Add a helper function to check if the user can claim royalties for this IP
  const canClaimRoyalties = (ip: OwnedIP): boolean => {
    return ip.type === 'personal' && Number(ip.pendingRoyalty || 0) > 0;
  };

  // Filter the IPs based on tab selection
  const filteredIPs = processedIPs.filter((ip) => {
    if (activeTab === 'all') return true;
    return ip.type === activeTab;
  });

  const pendingRoyaltiesTotal = processedIPs
    .filter((ip) => ip.type === 'personal') // Only count personal IPs (you're the creator)
    .reduce((total, ip) => total + Number(ip.pendingRoyalty || '0'), 0)
    .toFixed(6);

  // Modified claimedRoyaltiesTotal calculation
  const claimedRoyaltiesTotal = Object.entries(royaltyInfo)
    .filter(([tokenId, info]) => {
      // Find the IP in processedIPs
      const ip = processedIPs.find((ip) => ip.tokenId === tokenId);
      // Include all IPs that you own, regardless of type
      return ip && info.isYourIP === true;
    })
    .reduce((total, [_, info]) => total + Number(info.claimed || '0'), 0)
    .toFixed(6);

  // Function to fetch remixes from blockchain
  const fetchMyRemixes = async () => {
    setIsLoading(true);
    try {
      // Get your token IDs first, then get the remix details
      await headerGetterContract(async (contract) => {
        const balance = await contract.balanceOf(account);
        const remixTokens = [];

        for (let i = 0; i < Number(balance); i++) {
          try {
            const tokenId = await contract.ownerToTokenIds(account, i);
            const parentId = await contract.parentIds(tokenId);

            if (parentId.toString() !== '0') {
              const ipDetails = await contract.getIP(tokenId);

              // Create a RemixInfo-like structure
              remixTokens.push({
                ip: ipDetails,
                parentId: parentId,
                tokenId: tokenId, // Add the actual token ID
              });
            }
          } catch (error) {
            console.error(`Error checking token at index ${i}:`, error);
          }
        }

        await handleGetMyRemixes(true, remixTokens);
      });
    } catch (error) {
      console.error('Failed to fetch remixes:', error);
      setIsLoading(false);
    }
  };

  // Transform blockchain remix data to component format
  const transformRemixData = () => {
    // Fix the type errors in the replacer function
    const replacer = (key: string, value: unknown) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    };

    const formattedRemixes = myRemixes.map((remix, index) => {
      // Check if this is a RemixInfo structure with ip and parentId fields
      const isRemixInfo =
        remix.ip !== undefined && remix.parentId !== undefined;

      // Get the correct data structure
      let remixData, parentId, tokenId;

      if (isRemixInfo) {
        // It's a RemixInfo structure from the contract
        remixData = remix.ip || remix[0];

        // Get the parentId directly from the structure
        parentId =
          remix.parentId !== undefined
            ? remix.parentId.toString()
            : remix[1] !== undefined
            ? remix[1].toString()
            : '0';

        // Get the actual token ID which should be stored when fetching
        tokenId = remix.tokenId ? remix.tokenId.toString() : `${index}`;
      } else {
        // Handle older format
        // ...existing code for non-RemixInfo structures...
      }

      // Extract other properties
      const title = remixData.title || remixData[1] || `Remix ${index + 1}`;
      const description =
        remixData.description || remixData[2] || 'No description';
      const coverImage = remixData.fileUpload || remixData[4] || '';
      const royaltyRate =
        remixData.royaltyPercentage ||
        (remixData[5] ? Number(remixData[5]) : 0);

      // Create a Remix object
      return {
        id: `remix-${index}`,
        tokenId: tokenId, // Use the actual token ID from the blockchain
        parentId: parentId,
        title: title,
        description: description,
        parentTitle: 'Unknown Original',
        parentCreator: 'Unknown',
        royaltyRate: royaltyRate,
        status: 'active',
        createdAt: new Date(),
        totalSales: '0',
        totalRoyaltiesPaid: '0',
        deposits: [],
        coverImage: coverImage,
      } as Remix;
    });

    setRemixes(formattedRemixes);
  };
  const globalRoyaltyInfo = royaltyInfo['0'] || { pending: '0', claimed: '0' };

  // Add this effect to fetch royalty info for all remixes
  useEffect(() => {
    if (remixes.length === 0 || !isConnected) return;

    const fetchRoyaltyData = async () => {
      for (const remix of remixes) {
        if (remix.tokenId) {
          // Get royalty info for this remix's parent
          if (remix.parentId && remix.parentId !== '0') {
            try {
              await fetchParentRoyaltyInfo(remix.parentId);
            } catch (error) {
              console.error(
                `Error fetching royalty info for parent #${remix.parentId}:`,
                error
              );
            }
          }
        }
      }
    };

    fetchRoyaltyData();
  }, [remixes, isConnected]);

  // Update this function to also update royaltyInfo state
  const fetchParentRoyaltyInfo = async (parentId: string) => {
    await headerGetterContract(async (contract) => {
      try {
        // Get the IP details to check owner
        const parentIP = await contract.getIP(BigInt(parentId));

        // Extract the owner address, ensuring consistent format
        const ipOwnerAddress = parentIP.owner
          ? parentIP.owner.toLowerCase()
          : null;
        const isOwner =
          account && ipOwnerAddress && ipOwnerAddress === account.toLowerCase();

        // Get royalty info
        const [pending, claimed] = await contract.getRoyalty(BigInt(parentId));
        console.log(`Royalty for parent #${parentId}:`, {
          pending: ethers.formatEther(pending),
          claimed: ethers.formatEther(claimed),
          isOwner,
        });

        // Update both state objects
        setParentIPDetails((prev: { [key: string]: any }) => ({
          ...prev,
          [parentId]: {
            ...(prev[parentId] || {}),
            title: parentIP.title || parentIP[1] || 'Unknown Title',
            owner: parentIP.owner || parentIP[0] || 'Unknown Owner',
            royaltyPercentage:
              parentIP.royaltyPercentage ||
              (parentIP[8] ? Number(parentIP[8]) : 0),
            description: parentIP.description || parentIP[2] || '',
            fileUpload: parentIP.fileUpload || parentIP[4] || '',
            pendingRoyalty: ethers.formatEther(pending),
            claimedRoyalty: ethers.formatEther(claimed),
          },
        }));

        // Also update royaltyInfo state
        setRoyaltyInfo((prev) => ({
          ...prev,
          [parentId]: {
            pending: ethers.formatEther(pending),
            claimed: ethers.formatEther(claimed),
            isOriginalIP: true,
            isYourIP: isOwner,
          },
        }));
      } catch (error) {
        console.error(`Error fetching parent IP #${parentId}:`, error);
      }
    });
  };

  // Add this useEffect to listen for royalty updates
  useEffect(() => {
    // Function to handle royalty update events
    const handleRoyaltyUpdate = (event: CustomEvent) => {
      const { parentId, amount } = event.detail;

      // Refresh royalty info for this specific token
      if (parentId) {
        fetchRoyaltyInfo(parentId);
      }

      // Also refresh token #0 as it might aggregate royalties
      fetchRoyaltyInfo('0');
    };

    // Function to check localStorage for updates
    const checkLocalStorage = () => {
      const updated = localStorage.getItem('royaltyUpdated');
      if (updated === 'true') {
        const parentId = localStorage.getItem('lastUpdatedParentId');

        if (parentId) {
          fetchRoyaltyInfo(parentId);
        }
        fetchRoyaltyInfo('0');

        // Clear the flags
        localStorage.removeItem('royaltyUpdated');
        localStorage.removeItem('lastUpdatedParentId');
      }
    };

    // Add event listener
    window.addEventListener(
      'royaltyUpdated',
      handleRoyaltyUpdate as EventListener
    );

    // Check localStorage immediately and set up interval
    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 2000);

    // Cleanup
    return () => {
      window.removeEventListener(
        'royaltyUpdated',
        handleRoyaltyUpdate as EventListener
      );
      clearInterval(interval);
    };
  }, [isConnected]);

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Royalty Management
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track and manage earnings from your intellectual property assets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <FilterIcon size={16} className="mr-2" />
              Filter
            </button>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          {/* Existing filter controls */}
        </div>
      )}

      <RoyaltyDashboard dateRange={dateRange} />

      <RoyaltySummary
        royaltyInfo={royaltyInfo}
        onClaimRoyalty={onClaimRoyalty}
        isLoading={isLoading}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Pending Royalties
              </h3>
              <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                {pendingRoyaltiesTotal} ETH
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                Ready to claim
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm border border-green-200 dark:border-green-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-400">
                Total Claimed
              </h3>
              <p className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                {claimedRoyaltiesTotal} ETH
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                Lifetime earnings
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <WalletIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-sm border border-purple-200 dark:border-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Active IPs
              </h3>
              <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                {processedIPs.length}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                {
                  processedIPs.filter(
                    (ip) => Number(ip.pendingRoyalty || 0) > 0
                  ).length
                }{' '}
                earning
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <CopyIcon className="h-6 w-6 text-white" />
            </div>
          </div>
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
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent hover:text-blue-600 dark:hover:text-blue-400'
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
                  {selectedIP &&
                    Number(getRoyaltyAmount(royaltyInfo, selectedIP).pending) >
                      0 &&
                    getRoyaltyAmount(royaltyInfo, selectedIP).isYourIP ===
                      true && (
                      <div className="mt-4 mb-6">
                        <button
                          onClick={() =>
                            selectedIP
                              ? onClaimRoyalty(selectedIP)
                              : alert('No token ID available')
                          }
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                          <DollarSignIcon size={16} className="mr-2" />
                          Claim{' '}
                          {
                            getRoyaltyAmount(royaltyInfo, selectedIP).pending
                          }{' '}
                          ETH Royalties
                        </button>
                        <p className="mt-2 text-xs text-slate-500">
                          Royalties are from remixes of your original IP. The
                          amount shown may be accumulated in a central pool.
                        </p>
                      </div>
                    )}
                </div>

                {/* Royalty summary for this IP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pending Royalties
                    </h3>
                    <p className="mt-1 text-xl font-bold">
                      {selectedIP
                        ? getRoyaltyAmount(royaltyInfo, selectedIP).pending
                        : '0'}{' '}
                      ETH
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Claimed Royalties
                    </h3>
                    <p className="mt-1 text-xl font-bold">
                      {selectedIP
                        ? getRoyaltyAmount(royaltyInfo, selectedIP).claimed
                        : '0'}{' '}
                      ETH
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-medium">
                  Remixes of IP #{selectedIP}
                </h3>

                {/* Rest of your remix display code */}
                {remixesByParentIP.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {remixesByParentIP.map((remixInfo, index) => {
                      const remixImageUrls = getImageUrl(
                        remixInfo.ip,
                        index,
                        true
                      );
                      return (
                        <div
                          key={`remix-of-${selectedIP}-${index}`}
                          className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="relative">
                            <OptimizedImage
                              src={remixImageUrls.primary}
                              fallbackSrc={remixImageUrls.fallback}
                              alt={remixInfo.ip.title}
                              aspectRatio="video"
                              className="group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute top-3 right-3">
                              <span className="rounded-full text-xs px-3 py-1 font-medium backdrop-blur-sm bg-purple-100/90 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                                Remix
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-white font-medium text-sm line-clamp-1">
                                {remixInfo.ip.title}
                              </p>
                              <p className="text-white/80 text-xs">
                                {getCategoryName(Number(remixInfo.ip.category))}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="bg-slate-100 dark:bg-slate-700 text-xs rounded-full px-2 py-1">
                                {getCategoryName(Number(remixInfo.ip.category))}
                              </span>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {ethers.formatEther(
                                  remixInfo.ip.royaltyPercentage || '0'
                                )}{' '}
                                ETH
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIPs.map((ip) => (
                  <div
                    key={ip.id}
                    className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="relative">
                      <OptimizedImage
                        src={ip.imageUrl}
                        fallbackSrc={ip.fallbackImageUrl}
                        alt={ip.title}
                        aspectRatio="video"
                        className="group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`rounded-full text-xs px-3 py-1 font-medium backdrop-blur-sm ${
                            ip.type === 'personal'
                              ? 'bg-blue-100/90 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                              : ip.type === 'rent'
                              ? 'bg-orange-100/90 dark:bg-orange-900/70 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700'
                              : 'bg-purple-100/90 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700'
                          }`}
                        >
                          {ip.type === 'personal'
                            ? 'Personal'
                            : ip.type === 'rent'
                            ? 'Rent'
                            : 'Remix'}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3">
                        {Number(ip.pendingRoyalty || 0) > 0 && (
                          <div className="flex items-center space-x-1 bg-blue-500/90 backdrop-blur-sm rounded-full px-2 py-1">
                            <span className="animate-pulse rounded-full bg-white w-2 h-2"></span>
                            <span className="text-xs font-medium text-white">
                              {Number(ip.pendingRoyalty).toFixed(4)} ETH
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-white font-medium text-sm line-clamp-1">
                          {ip.title}
                        </p>
                        <p className="text-white/80 text-xs">
                          Token #{ip.tokenId}
                        </p>
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
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {ip.earnings.toFixed(4)} ETH
                        </span>
                      </div>

                      {/* Improved pending royalty display */}
                      {(ip.pendingRoyalty && Number(ip.pendingRoyalty) > 0) ||
                      (globalRoyaltyInfo &&
                        Number(globalRoyaltyInfo.pending) > 0 &&
                        globalRoyaltyInfo.isYourIP === true) ? (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                {Number(ip.pendingRoyalty) > 0 ? (
                                  <>
                                    IP-specific royalties: {ip.pendingRoyalty}{' '}
                                    ETH
                                  </>
                                ) : (
                                  <>
                                    Royalties in central pool:{' '}
                                    {globalRoyaltyInfo.pending} ETH
                                  </>
                                )}
                              </span>
                              <p className="text-xs text-blue-600 dark:text-blue-500">
                                Total claimed:{' '}
                                {ip.tokenId
                                  ? getRoyaltyAmount(royaltyInfo, ip.tokenId)
                                      .claimed
                                  : globalRoyaltyInfo.claimed}{' '}
                                ETH
                              </p>
                            </div>
                            {(ip.tokenId &&
                              Number(
                                getRoyaltyAmount(royaltyInfo, ip.tokenId)
                                  .pending
                              ) > 0 &&
                              getRoyaltyAmount(royaltyInfo, ip.tokenId)
                                .isYourIP === true) ||
                            (globalRoyaltyInfo &&
                              Number(globalRoyaltyInfo.pending) > 0 &&
                              globalRoyaltyInfo.isYourIP === true) ? (
                              <button
                                onClick={() => {
                                  // If this IP has pending royalties, claim from it
                                  if (
                                    ip.tokenId &&
                                    Number(
                                      getRoyaltyAmount(royaltyInfo, ip.tokenId)
                                        .pending
                                    ) > 0
                                  ) {
                                    onClaimRoyalty(ip.tokenId);
                                  }
                                  // Otherwise claim from the central pool
                                  else if (
                                    Number(globalRoyaltyInfo.pending) > 0 &&
                                    globalRoyaltyInfo.isYourIP === true
                                  ) {
                                    onClaimRoyalty('0');
                                  }
                                }}
                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md px-2 py-1 flex items-center"
                              >
                                <DollarSignIcon size={12} className="mr-1" />{' '}
                                Claim
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Token ID: {ip.tokenId}
                        </span>
                        <div className="flex gap-1">
                          {ip.tokenId && (
                            <button
                              onClick={() => showRemixesForIP(ip.tokenId!)}
                              className="p-1.5 text-sm flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                              title="View remixes"
                            >
                              <ExternalLinkIcon size={14} className="mr-1" />
                              View Remixes
                            </button>
                          )}

                          {/* Only show IP-specific claim button if this IP actually has pending royalties */}
                          {ip.tokenId &&
                            Number(
                              getRoyaltyAmount(royaltyInfo, ip.tokenId).pending
                            ) > 0 &&
                            getRoyaltyAmount(royaltyInfo, ip.tokenId)
                              .isYourIP === true && (
                              <button
                                onClick={() =>
                                  ip.tokenId
                                    ? onClaimRoyalty(ip.tokenId)
                                    : alert('No token ID available')
                                }
                                className="p-1.5 text-sm flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                title="Claim royalty"
                              >
                                <DollarSignIcon size={14} className="mr-1" />
                                Claim{' '}
                                {
                                  getRoyaltyAmount(royaltyInfo, ip.tokenId)
                                    .pending
                                }{' '}
                                ETH
                              </button>
                            )}

                          {/* Show central pool claim button if no IP-specific royalties but central pool has royalties */}
                          {ip.tokenId &&
                            Number(
                              getRoyaltyAmount(royaltyInfo, ip.tokenId).pending
                            ) <= 0 &&
                            Number(globalRoyaltyInfo.pending) > 0 &&
                            globalRoyaltyInfo.isYourIP === true && (
                              <button
                                onClick={() => onClaimRoyalty('0')}
                                className="p-1.5 text-sm flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                title="Claim from central pool"
                              >
                                <DollarSignIcon size={14} className="mr-1" />
                                Claim from Pool ({
                                  globalRoyaltyInfo.pending
                                }{' '}
                                ETH)
                              </button>
                            )}
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
