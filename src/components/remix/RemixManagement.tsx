'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '../ui/button';
import { TabsGroup } from '../ui/TabsGroup';
import { motion } from 'framer-motion';
import { mockRemixes } from './data/mockRemixes';
import { FilterHeader } from './FilterHeader';
import { StatsOverview } from './StatsOverview';
import { RemixList } from './RemixList';
import { DepositsList } from './DepositsList';
import { DepositModal } from './DepositModal';
import { RefreshCw } from 'lucide-react';
import { Remix, Deposit } from './types';

export const RemixManagement: React.FC = () => {
  const { connected } = useWallet();
  const [remixes, setRemixes] = useState(mockRemixes);
  const [activeTab, setActiveTab] = useState('remixes');
  const [selectedRemix, setSelectedRemix] = useState<Remix | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);


  // Calculate total values
  const totalRemixes = remixes.length;
  const totalSales = remixes
    .reduce((acc, remix) => acc + parseFloat(remix.totalSales), 0)
    .toFixed(2);
  const totalRoyalties = remixes
    .reduce((acc, remix) => acc + parseFloat(remix.totalRoyaltiesPaid), 0)
    .toFixed(2);

  const handleDepositClick = (remix: Remix) => {
    setSelectedRemix(remix);
    setShowDepositModal(true);
  };

  const handleDeposit = (remixId: string, amount: string) => {
    // Update remixes with new deposit
    const updatedRemixes = remixes.map((remix) => {
      if (remix.id === remixId) {
        const royaltyAmount = (
          (parseFloat(amount) * remix.royaltyRate) /
          100
        ).toFixed(2);

        return {
          ...remix,
          deposits: [
            ...remix.deposits,
            {
              id: `d-${Date.now()}`,
              amount: royaltyAmount,
              date: new Date(),
              status: 'confirmed',
            } as Deposit,
          ],
          totalSales: (
            parseFloat(remix.totalSales) + parseFloat(amount)
          ).toFixed(2),
          totalRoyaltiesPaid: (
            parseFloat(remix.totalRoyaltiesPaid) + parseFloat(royaltyAmount)
          ).toFixed(2),
        };
      }
      return remix;
    });

    setRemixes(updatedRemixes);
  };

  if (!connected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Remix Management</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view and manage your remix from
            your IP assets.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              You need to connect your wallet to access this feature.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto gap-4"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Remix Management</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your registered remixes and handle royalty payments to original creators
          </p>
        </div>
        
        <FilterHeader 
          timeRange={timeRange} 
          setTimeRange={setTimeRange} 
          filterOpen={filterOpen} 
          setFilterOpen={setFilterOpen} 
        />
      </div>

      <StatsOverview 
        totalRemixes={totalRemixes} 
        totalSales={totalSales} 
        totalRoyalties={totalRoyalties} 
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <TabsGroup
          tabs={[
            { id: 'remixes', label: 'Your Remixes' },
            { id: 'deposits', label: 'Royalty Deposits' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </motion.div>

      {activeTab === 'remixes' ? (
        <RemixList 
          remixes={remixes} 
          onDepositClick={handleDepositClick} 
        />
      ) : (
        <DepositsList remixes={remixes} />
      )}

      {showDepositModal && selectedRemix && (
        <DepositModal
          remix={selectedRemix}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedRemix(null);
          }}
          onDeposit={handleDeposit}
        />
      )}
    </motion.div>
  );
};
