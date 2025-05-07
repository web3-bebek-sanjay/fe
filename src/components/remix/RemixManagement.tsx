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

  // Fetch remix data when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchMyRemixes();
    }
  }, [isConnected]);

  // Transform blockchain data to our Remix format when myRemixes changes
  useEffect(() => {
    if (myRemixes && myRemixes.length > 0) {
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
    if (!myRemixes || myRemixes.length === 0) return;

    console.log(
      'Starting fetchParentIPDetails with myRemixes length:',
      myRemixes.length
    );

    const uniqueParentIds: string[] = [];
    myRemixes.forEach((remix, index) => {
      // Handle different possible structures
      let parentId;

      // Check if this is a RemixInfo structure with direct parentId property
      if (remix.parentId !== undefined) {
        parentId = remix.parentId.toString();
        console.log(
          `Found parentId directly from RemixInfo at index ${index}:`,
          parentId
        );
      } else if (remix.ip && remix.ip.parentId !== undefined) {
        // Some contract implementations might nest it under ip
        parentId = remix.ip.parentId.toString();
        console.log(
          `Found parentId from remix.ip.parentId at index ${index}:`,
          parentId
        );
      } else {
        // Handle nested Proxy structure
        const remixData = remix.ip || remix[0] || remix;
        parentId = remixData[6] ? remixData[6].toString() : '0';
        console.log(
          `Extracted parentId from array index 6 at index ${index}:`,
          parentId
        );
      }

      console.log(`Final parent ID for remix ${index}:`, parentId);

      if (parentId && parentId !== '0' && !uniqueParentIds.includes(parentId)) {
        uniqueParentIds.push(parentId);
      }
    });

    console.log('Unique parent IPs to fetch:', uniqueParentIds);

    if (uniqueParentIds.length === 0) {
      console.log(
        'No parent IPs to fetch - either all remixes have parentId=0 or no valid parentIds found'
      );
      setIsLoading(false);
      return;
    }

    const parentDetails: { [key: string]: any } = {};

    for (const parentId of uniqueParentIds) {
      try {
        console.log(`Fetching details for parent IP ${parentId}`);
        const details = await getIPDetails(parentId);
        console.log(`Raw parent IP #${parentId} details:`, details);

        if (details) {
          // Transform the contract data into a more usable format
          const formattedDetails = {
            title: details.title || details[1] || 'Unknown Title',
            owner: details.owner || details[0] || 'Unknown Owner',
            royaltyPercentage:
              details.royaltyPercentage ||
              (details[5] ? Number(details[5]) : 0),
            description: details.description || details[2] || '',
            fileUpload: details.fileUpload || details[4] || '',
          };
          parentDetails[parentId] = formattedDetails;
          console.log(
            `Formatted details for parent IP ${parentId}:`,
            formattedDetails
          );
        }
      } catch (error) {
        console.error(
          `Failed to fetch details for parent IP ${parentId}:`,
          error
        );
      }
    }

    console.log('Final parent details object:', parentDetails);
    setParentIPDetails(parentDetails);
    setIsLoading(false);
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
    // Custom replacer function to handle BigInt serialization
    const replacer = (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    };

    console.log('Raw myRemixes data structure:', myRemixes);

    const formattedRemixes = myRemixes.map((remix, index) => {
      console.log(`Examining remix at index ${index}:`, remix);

      // Check if this is a RemixInfo structure with ip and parentId fields
      const isRemixInfo =
        remix.ip !== undefined && remix.parentId !== undefined;
      console.log(`Is this a RemixInfo structure? ${isRemixInfo}`);

      // Get the correct data structure
      let remixData, parentId;

      if (isRemixInfo) {
        // It's a RemixInfo structure from the contract
        remixData = remix.ip;
        parentId = remix.parentId.toString();
        console.log(`Using RemixInfo structure. ParentId: ${parentId}`);
      } else {
        // It's a different structure, try to extract data
        remixData = remix[0] || remix;
        parentId = remixData[6] ? remixData[6].toString() : '0';
        console.log(`Using array structure. ParentId: ${parentId}`);
      }

      // Extract other properties
      const title = remixData.title || remixData[1] || `Remix ${index + 1}`;
      const description =
        remixData.description || remixData[2] || 'No description';
      const tokenId =
        remixData.tokenId ||
        (remixData[3] ? remixData[3].toString() : `${index}`);
      const coverImage = remixData.fileUpload || remixData[4] || '';
      const royaltyRate =
        remixData.royaltyPercentage ||
        (remixData[5] ? Number(remixData[5]) : 0);

      console.log('Extracted remix data:', {
        parentId,
        title,
        tokenId,
        royaltyRate,
        description,
        coverImage,
      });

      // Create a Remix object
      return {
        id: `remix-${index}`,
        tokenId: tokenId,
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

  // Update remixes with parent IP details once we have them
  useEffect(() => {
    if (Object.keys(parentIPDetails).length === 0 || remixes.length === 0)
      return;

    const updatedRemixes = remixes.map((remix) => {
      const parentId = remix.parentId;
      const parentDetail = parentIPDetails[parentId];

      if (parentDetail) {
        return {
          ...remix,
          parentTitle: parentDetail.title || remix.parentTitle,
          parentCreator: parentDetail.owner || remix.parentCreator,
          royaltyRate: Number(
            parentDetail.royaltyPercentage || remix.royaltyRate
          ),
        };
      }
      return remix;
    });

    setRemixes(updatedRemixes);
  }, [parentIPDetails]);

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
    setSelectedRemix(remix);
    setShowDepositModal(true);
  };

  const handleDeposit = async (remixId: string, amount: string) => {
    // Look for the remix by id OR tokenId (since remixId might be either one)
    const remix = remixes.find(
      (r) => r.id === remixId || r.tokenId === remixId
    );
    if (!remix) {
      console.error(`Remix not found with id/tokenId: ${remixId}`);
      return;
    }

    // Use parentId for deposit as that's what the contract expects
    const tokenIdToUse = remix.parentId || remix.tokenId;

    if (!tokenIdToUse) {
      console.error('Missing both parentId and tokenId for remix');
      return;
    }

    try {
      // Call the blockchain function to deposit royalty using the correct tokenId
      console.log(`Depositing royalty for parentId: ${tokenIdToUse}`);
      await handleDepositRoyalty(tokenIdToUse, amount);

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

      // IMPORTANT: Force refresh of royalty data in RoyaltyManagement component
      // This needs to be added to your WalletContext to be accessible
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that RoyaltyManagement can listen for
        const event = new CustomEvent('royaltyUpdated', {
          detail: { parentId: tokenIdToUse, amount },
        });
        window.dispatchEvent(event);

        // Or set a flag in localStorage that RoyaltyManagement can check
        localStorage.setItem('royaltyUpdated', 'true');
        localStorage.setItem('lastUpdatedParentId', tokenIdToUse);
      }

      // If you have access to a global state manager like Redux or Context
      // you could update a state variable there instead
    } catch (error) {
      console.error('Failed to deposit royalty:', error);
      // Could add error handling UI here
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
          tabs={[
            { id: 'remixes', label: 'Your Remixes' },
            { id: 'deposits', label: 'Royalty Deposits' },
          ]}
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
            <RemixList
              remixes={remixes}
              onDepositClick={handleDepositClick}
              parentIPDetails={parentIPDetails}
            />
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
