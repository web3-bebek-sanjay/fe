'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { TransactionStatus } from '@/components/ui/TransactionStatus';

interface IPBreakdownProps {
  dateRange: string;
}

export const IPBreakdown: React.FC<IPBreakdownProps> = ({ dateRange }) => {
  const { isConnected } = useWallet();
  const { loading } = useLoading();
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  // Function to handle royalty operations
  const handleRoyaltyOperation = async (
    operationType: string,
    ipId: string
  ) => {
    setTxStatus('pending');

    try {
      // Simulate a blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setTxStatus('success');

      // Reset after success
      setTimeout(() => {
        setTxStatus('idle');
      }, 2000);
    } catch (error) {
      console.error(`Error during ${operationType} royalty operation:`, error);
      setTxStatus('error');
    }
  };

  const handleReset = () => {
    if (txStatus === 'error') {
      // Reset to idle on error
      setTxStatus('idle');
    } else {
      setTxStatus('idle');
    }
  };

  // Skeleton loader for IP breakdown
  const SkeletonBreakdown = () => (
    <div className="space-y-4">
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  // Mock data based on date range
  const breakdowns = [
    {
      id: '1',
      title: 'Digital Artwork Collection',
      category: 'Art',
      earnings:
        dateRange === 'week' ? 0.08 : dateRange === 'month' ? 0.32 : 1.85,
      licenses: dateRange === 'week' ? 2 : dateRange === 'month' ? 8 : 46,
    },
    {
      id: '2',
      title: 'Music Production Sample Pack',
      category: 'Audio',
      earnings:
        dateRange === 'week' ? 0.06 : dateRange === 'month' ? 0.24 : 1.44,
      licenses: dateRange === 'week' ? 3 : dateRange === 'month' ? 12 : 72,
    },
    {
      id: '3',
      title: 'Research Paper: Blockchain Economics',
      category: 'Research',
      earnings:
        dateRange === 'week' ? 0.04 : dateRange === 'month' ? 0.16 : 0.96,
      licenses: dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 24,
    },
    {
      id: '4',
      title: 'Photography Collection: Urban Landscapes',
      category: 'Photography',
      earnings:
        dateRange === 'week' ? 0.02 : dateRange === 'month' ? 0.08 : 0.48,
      licenses: dateRange === 'week' ? 1 : dateRange === 'month' ? 4 : 24,
    },
  ];

  const totalEarnings = breakdowns.reduce(
    (sum, item) => sum + item.earnings,
    0
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">IP Earnings Breakdown</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view your IP earnings and royalties
            breakdown.
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

  if (loading && isInitialFetch) {
    return <SkeletonBreakdown />;
  }

  if (txStatus !== 'idle') {
    return (
      <div className="max-w-md mx-auto my-8">
        <TransactionStatus
          status={txStatus}
          onReset={handleReset}
          successMessage="Royalty operation completed successfully."
          errorMessage="There was an error processing your royalty operation. Please try again."
          pendingMessage="Processing your royalty operation on the blockchain..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {breakdowns.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex-1 truncate">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {item.category} • {item.licenses} licenses
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{item.earnings} ETH</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {Math.round((item.earnings / totalEarnings) * 100)}% of total
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              style={{
                width: `${(item.earnings / totalEarnings) * 100}%`,
              }}
            />
          </div>
          {item.earnings > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleRoyaltyOperation('withdraw', item.id)}
                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Withdraw Royalties
              </button>
            </div>
          )}
        </motion.div>
      ))}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700">
        <motion.button
          whileHover={{
            scale: 1.02,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
        >
          View All IPs
        </motion.button>
      </div>
    </div>
  );
};
