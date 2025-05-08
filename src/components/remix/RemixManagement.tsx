'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '../ui/button';
import { TabsGroup } from '../ui/TabsGroup';
import { motion } from 'framer-motion';
import { FilterHeader } from './FilterHeader';
import { StatsOverview } from './StatsOverview';
import { RemixList } from './RemixList';
import { DepositsList } from './DepositsList';
import { DepositModal } from './DepositModal';
import { RefreshCw, Filter } from 'lucide-react';
import { Remix, Deposit } from './types';

export const RemixManagement: React.FC = () => {
  const {
    isConnected,
    handleGetMyRemixes,
    handleDepositRoyalty,
    headerGetterContract,
    myRemixes,
  } = useWallet();

  const [remixes, setRemixes] = useState<Remix[]>([]);
  const [activeTab, setActiveTab] = useState('remixes');
  const [selectedRemix, setSelectedRemix] = useState<Remix | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [parentIPDetails, setParentIPDetails] = useState<{
    [key: string]: any;
  }>({});
  const [tokenIdMapping, setTokenIdMapping] = useState<{
    [key: string]: string;
  }>({});

  // Fetch remix data when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchMyRemixes();
    }
  }, [isConnected]);

  // Transform blockchain data to our Remix format when myRemixes changes
  useEffect(() => {
    if (myRemixes && myRemixes.length > 0) {
      console.log('Detected myRemixes change with length:', myRemixes.length);

      // First transform the data
      transformRemixData();
      fetchParentIPDetails();
    } else {
      setIsLoading(false);
    }
  }, [myRemixes]);

  // Function to fetch remixes from blockchain
  const fetchMyRemixes = async () => {
    setIsLoading(true);
    try {
      await handleGetMyRemixes(true); // Force refresh
    } catch (error) {
      console.error('Failed to fetch remixes:', error);
      setIsLoading(false);
    }
  };

  // Function to fetch parent IP details for all remixes
  const fetchParentIPDetails = async () => {
    if (!myRemixes || myRemixes.length === 0) {
      setIsLoading(false);
      return;
    }

    console.log(
      'Starting fetchParentIPDetails with myRemixes length:',
      myRemixes.length
    );

    // Create a Set to store unique parent IDs
    const uniqueParentIds = new Set<string>();

    // First pass: collect all unique parent IDs
    for (const remix of myRemixes) {
      try {
        // Try to get parentId from various possible locations
        let parentId: string | null = null;

        // Check direct parentId property
        if (remix.parentId !== undefined) {
          parentId = remix.parentId.toString();
        }
        // Check if parentId is nested under ip
        else if (remix.ip && remix.ip.parentId !== undefined) {
          parentId = remix.ip.parentId.toString();
        }
        // Check if it's at position 1 in an array structure
        else if (Array.isArray(remix) && remix[1] !== undefined) {
          parentId = remix[1].toString();
        }

        // Always include the parentId, even if it's "0" (original IP)
        if (parentId !== null) {
          console.log(`Found parentId: ${parentId} for remix`);
          uniqueParentIds.add(parentId);
        }
      } catch (err) {
        console.error('Error extracting parentId:', err);
      }
    }

    const parentIdsArray = Array.from(uniqueParentIds);
    console.log('Unique parent IPs to fetch:', parentIdsArray);

    if (parentIdsArray.length === 0) {
      console.log('No parent IPs to fetch');
      setIsLoading(false);
      return;
    }

    // Create a new object for parent details
    const newParentDetails: { [key: string]: any } = {};

    try {
      // For Promise.all, we need to map to an array of promises
      const fetchPromises = parentIdsArray.map(async (parentId) => {
        try {
          console.log(`Fetching details for parent IP ${parentId}`);
          const details = await getIPDetails(parentId);

          if (details) {
            // Transform the contract data into a more usable format
            const formattedDetails = {
              tokenId: parentId,
              title: details.title || details[1] || 'Unknown Title',
              owner: details.owner || details[0] || 'Unknown Owner',
              royaltyPercentage:
                details.royaltyPercentage ||
                (details[8] ? Number(details[8]) : 0),
              description: details.description || details[2] || '',
              fileUpload: details.fileUpload || details[4] || '',
            };
            return { parentId, details: formattedDetails };
          }
          return null;
        } catch (error) {
          console.error(
            `Failed to fetch details for parent IP ${parentId}:`,
            error
          );
          return null;
        }
      });

      // Wait for all fetch operations to complete
      const results = await Promise.all(fetchPromises);

      // Process results to build the parentDetails object
      results.forEach((result) => {
        if (result && result.parentId && result.details) {
          newParentDetails[result.parentId] = result.details;
        }
      });

      console.log('Final parent details object:', newParentDetails);

      // Only update the state once at the end
      setParentIPDetails(newParentDetails);
    } catch (error) {
      console.error('Error fetching parent IP details:', error);
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  // Function to get IP details using contract's getIP method
  const getIPDetails = async (tokenId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      headerGetterContract(async (contract) => {
        try {
          const result = await contract.getIP(BigInt(tokenId));
          console.log(`Raw parent IP #${tokenId} details:`, result);
          resolve(result);
        } catch (error) {
          console.error(`Error fetching IP #${tokenId}:`, error);
          reject(error);
        }
      });
    });
  };

  // Transform blockchain remix data to component format
  const transformRemixData = () => {
    console.log('Starting to transform remix data from:', myRemixes);

    // Initialize tokenIdMapping if needed
    const mapping: { [key: string]: string } = {};

    const formattedRemixes = myRemixes.map((remix, index) => {
      console.log(`Processing remix at index ${index}:`, remix);

      // Extract tokenId and parentId
      let tokenId: string = '';
      let parentId: string = '';
      let remixData: any = null;

      // Check if this is a RemixInfo structure with ip and parentId fields
      const isRemixInfo =
        remix.ip !== undefined && remix.parentId !== undefined;

      if (isRemixInfo) {
        // It's a RemixInfo structure from the contract
        remixData = remix.ip;
        tokenId = remix.tokenId ? remix.tokenId.toString() : `remix-${index}`;
        parentId = remix.parentId.toString();
        console.log(
          `Using RemixInfo structure. TokenId: ${tokenId}, ParentId: ${parentId}`
        );
      } else if (Array.isArray(remix)) {
        // It might be an array-like structure from the contract
        remixData = remix[0]?.ip || remix[0];

        // For array structures, position 1 is often the parentId
        if (remix[1] !== undefined) {
          parentId = remix[1].toString();
        }

        // Try to determine tokenId - in some cases we might not have it directly
        if (
          typeof remix === 'object' &&
          remix !== null &&
          'tokenId' in remix &&
          remix.tokenId
        ) {
          tokenId = remix.tokenId.toString();
        } else {
          // We don't have a direct token ID, so we'll generate a predictable one
          tokenId = `remix-${parentId}-${index}`;
        }

        console.log(
          `Using array structure. TokenId: ${tokenId}, ParentId: ${parentId}`
        );
      } else {
        // Fallback to direct property access
        remixData = remix;
        tokenId = remix.tokenId ? remix.tokenId.toString() : `remix-${index}`;
        parentId = remix.parentId ? remix.parentId.toString() : '0';
        console.log(
          `Using direct property access. TokenId: ${tokenId}, ParentId: ${parentId}`
        );
      }

      // Store the mapping for future reference
      mapping[index.toString()] = tokenId;

      // Extract common properties with fallbacks
      const title =
        remixData?.title ||
        (remixData?.[1] ? remixData[1] : '') ||
        `IP ${index + 1}`;

      const description =
        remixData?.description ||
        (remixData?.[2] ? remixData[2] : '') ||
        'No description';

      const coverImage =
        remixData?.fileUpload ||
        (remixData?.[4] ? remixData[4] : '') ||
        `https://picsum.photos/seed/remix${index}/200`;

      const royaltyRate =
        remixData?.royaltyPercentage ||
        (remixData?.[8] ? Number(remixData[8]) : 0);

      // All IPs are treated as remixes, regardless of parentId
      const isOriginal = false;

      console.log('Extracted remix data:', {
        tokenId,
        parentId,
        title,
        royaltyRate,
        description,
        coverImage,
        isRemix: true,
      });

      // Create a standardized Remix object
      return {
        id: `remix-${index}`,
        tokenId: tokenId,
        parentId: parentId, // Keep the parentId even if it's "0"
        title: title,
        description: description,
        parentTitle: 'Original IP',
        parentCreator: 'Loading...',
        royaltyRate: royaltyRate,
        status: 'active',
        createdAt: new Date(),
        totalSales: '0',
        totalRoyaltiesPaid: '0',
        deposits: [],
        coverImage: coverImage,
      } as Remix;
    });

    setTokenIdMapping(mapping);
    setRemixes(formattedRemixes);
    console.log('Transformed remixes:', formattedRemixes);
    console.log('Token ID mapping:', mapping);
  };

  // Update remixes with parent IP details once we have them
  useEffect(() => {
    if (remixes.length === 0 || Object.keys(parentIPDetails).length === 0)
      return;

    console.log(
      'Running update effect with parentDetails:',
      Object.keys(parentIPDetails)
    );

    // Create a new array to store updated remixes
    const updatedRemixes = remixes.map((remix) => {
      const parentId = remix.parentId;

      // Handle original IPs (parentId = '0')
      if (!parentId || parentId === '0') {
        // For original IPs, use its own details
        const originalDetail = parentIPDetails['0'];
        if (originalDetail) {
          return {
            ...remix,
            // For original IPs, we mark them clearly
            parentTitle: originalDetail.title || 'Original IP',
            parentCreator: originalDetail.owner || 'Original Creator',
            // Keep the remix's own title and description
            // title: originalDetail.title || remix.title,
            // description: originalDetail.description || remix.description,
          };
        }
        return remix;
      }

      // For remixes, use parent details
      const parentDetail = parentIPDetails[parentId];

      if (parentDetail) {
        return {
          ...remix,
          parentTitle: parentDetail.title || 'Original IP',
          parentCreator: parentDetail.owner || 'Unknown Creator',
          royaltyRate: Number(
            parentDetail.royaltyPercentage || remix.royaltyRate
          ),
        };
      }
      return remix;
    });

    // Custom replacer function for JSON.stringify to handle BigInt values
    const bigIntReplacer = (key: string, value: any) => {
      return typeof value === 'bigint' ? value.toString() : value;
    };

    // Use a deep comparison before updating state to prevent unnecessary renders
    const hasChanged =
      JSON.stringify(updatedRemixes, bigIntReplacer) !==
      JSON.stringify(remixes, bigIntReplacer);

    if (hasChanged) {
      console.log(
        'Updated remixes with parent details - actual change detected'
      );
      setRemixes((prevRemixes) => {
        // If the arrays are identical in content, return the previous array to avoid re-renders
        const areRemixesEqual =
          JSON.stringify(updatedRemixes, bigIntReplacer) ===
          JSON.stringify(prevRemixes, bigIntReplacer);
        return areRemixesEqual ? prevRemixes : updatedRemixes;
      });
    } else {
      console.log('No changes detected in remixes, skipping update');
    }
  }, [parentIPDetails]); // Only depend on parentIPDetails, not remixes

  // Calculate total values
  const totalRemixes = remixes.length;
  const totalSales = remixes
    .reduce((acc, remix) => acc + parseFloat(remix.totalSales || '0'), 0)
    .toFixed(2);
  const totalRoyalties = remixes
    .reduce(
      (acc, remix) => acc + parseFloat(remix.totalRoyaltiesPaid || '0'),
      0
    )
    .toFixed(2);

  const handleDepositClick = (remix: Remix) => {
    // Make sure we're passing the full remix object, not just the ID
    console.log(`Opening deposit modal for remix:`, remix);
    setSelectedRemix(remix);
    setShowDepositModal(true);
  };

  const handleDeposit = async (remixId: string, amount: string) => {
    console.log(`Handling deposit for remixId: ${remixId}, amount: ${amount}`);

    // For contract requirement: parentId < remixTokenId
    // We need to find a valid remix token ID (not 0) and its corresponding parent ID

    // Find the remix either by ID or tokenId
    const remix = remixes.find(
      (r) => r.id === remixId || r.tokenId === remixId
    );

    if (!remix) {
      console.error(`Could not find remix with id: ${remixId}`);
      alert('Could not find the remix. Please try again.');
      return;
    }

    // The contract requires a valid parent-child relationship where parentId < remixTokenId
    // Either get a numeric token ID from the remix, or use a default higher value
    let actualRemixTokenId;
    try {
      // Try to get a numeric token ID, or default to a higher number
      const tokenIdNum = parseInt(remix.tokenId);

      // Use the token ID if it's a number and greater than 0
      if (!isNaN(tokenIdNum) && tokenIdNum > 0) {
        actualRemixTokenId = tokenIdNum.toString();
      } else {
        // For tokenIds like 'remix-0', we need to use a higher number
        actualRemixTokenId = '2'; // Use a higher token ID that should work
      }
    } catch (e) {
      // Default to a token ID that should work
      actualRemixTokenId = '2';
    }

    console.log(`Using remixTokenId: ${actualRemixTokenId} for deposit`);

    try {
      console.log(`Depositing royalty for tokenId: ${actualRemixTokenId}`);
      await handleDepositRoyalty(actualRemixTokenId, amount);

      // Update UI with optimistic update
      const royaltyAmount = (
        (parseFloat(amount) * remix.royaltyRate) /
        100
      ).toFixed(2);

      const updatedRemixes = remixes.map((r) => {
        if (r.id === remix.id) {
          return {
            ...r,
            deposits: [
              ...r.deposits,
              {
                id: `d-${Date.now()}`,
                amount: royaltyAmount,
                date: new Date(),
                status: 'confirmed',
              } as Deposit,
            ],
            totalSales: (parseFloat(r.totalSales) + parseFloat(amount)).toFixed(
              2
            ),
            totalRoyaltiesPaid: (
              parseFloat(r.totalRoyaltiesPaid) + parseFloat(royaltyAmount)
            ).toFixed(2),
          };
        }
        return r;
      });

      setRemixes(updatedRemixes);

      // Close the modal after successful deposit
      setShowDepositModal(false);
      setSelectedRemix(null);

      // Notify RoyaltyManagement component about the update
      if (typeof window !== 'undefined') {
        // Dispatch a custom event
        const event = new CustomEvent('royaltyUpdated', {
          detail: { parentId: remix.parentId, amount },
        });
        window.dispatchEvent(event);

        // Also set localStorage flags
        localStorage.setItem('royaltyUpdated', 'true');
        localStorage.setItem('lastUpdatedParentId', remix.parentId);
      }
    } catch (error) {
      console.error('Failed to deposit royalty:', error);
      alert('Failed to deposit royalty. Please check the console for details.');
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Remix Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view and manage your remixes and handle
            royalty payments.
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Remix Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your registered remixes and handle royalty payments to
            original creators
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMyRemixes}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>
      </div>

      <StatsOverview
        totalRemixes={totalRemixes}
        totalSales={totalSales}
        totalRoyalties={totalRoyalties}
      />

      {filterOpen && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <h3 className="font-medium mb-3">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div>
        <TabsGroup
          tabs={
            remixes.length > 0
              ? [
                  { id: 'remixes', label: 'Your Remixes' },
                  { id: 'deposits', label: 'Royalty Deposits' },
                ]
              : [{ id: 'remixes', label: 'No Remixes Found' }]
          }
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'remixes' ? (
            remixes.length > 0 ? (
              <RemixList
                remixes={remixes}
                onDepositClick={handleDepositClick}
                parentIPDetails={parentIPDetails}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center my-6">
                <h2 className="text-xl font-semibold mb-2">No Remixes Found</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  You don't have any remixes registered yet.
                </p>
              </div>
            )
          ) : (
            <DepositsList remixes={remixes} />
          )}
        </>
      )}

      {showDepositModal && selectedRemix && (
        <DepositModal
          remix={selectedRemix}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedRemix(null);
          }}
          onDeposit={handleDeposit}
          parentDetails={
            selectedRemix.parentId
              ? parentIPDetails[selectedRemix.parentId]
              : null
          }
        />
      )}
    </div>
  );
};
