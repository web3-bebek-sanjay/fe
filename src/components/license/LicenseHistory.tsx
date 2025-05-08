'use client';

import type React from 'react';
import { useState } from 'react';
import { CalendarIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useLoading } from '@/context/LoadingContext';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionStatus } from '@/components/ui/TransactionStatus';

// Mock license history data
const mockLicenseHistory = [
  {
    id: '1',
    ipTitle: 'Digital Artwork Collection',
    ipId: '1',
    licenseType: 'rent',
    startDate: '2023-11-15',
    endDate: '2023-12-15',
    price: 0.015,
    status: 'active',
  },
  {
    id: '2',
    ipTitle: 'Music Production Sample Pack',
    ipId: '2',
    licenseType: 'buy',
    startDate: '2023-10-22',
    endDate: null,
    price: 0.03,
    status: 'active',
  },
  {
    id: '3',
    ipTitle: 'Photography Collection: Urban Landscapes',
    ipId: '4',
    licenseType: 'rent',
    startDate: '2023-09-05',
    endDate: '2023-10-05',
    price: 0.02,
    status: 'expired',
  },
];

export const LicenseHistory: React.FC = () => {
  const { isConnected } = useWallet();
  const { loading } = useLoading();
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  // Function to handle license operations (like renewal or cancellation)
  const handleLicenseOperation = async (
    operationType: string,
    licenseId: string
  ) => {
    setTxStatus('pending');

    try {
      // Simulate a blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`${operationType} operation on license ${licenseId}`);
      setTxStatus('success');

      // Reset after success
      setTimeout(() => {
        setTxStatus('idle');
      }, 2000);
    } catch (error) {
      console.error(`Error during ${operationType} operation:`, error);
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

  // Skeleton loader for license history table
  const SkeletonHistoryTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              IP Title
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-48" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-32" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-16" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-6 w-16" />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">License History</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Connect your wallet to view your license history and transactions.
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
    return <SkeletonHistoryTable />;
  }

  if (txStatus !== 'idle') {
    return (
      <div className="max-w-md mx-auto my-8">
        <TransactionStatus
          status={txStatus}
          onReset={handleReset}
          successMessage="License operation completed successfully."
          errorMessage="There was an error processing your license operation. Please try again."
          pendingMessage="Processing your license operation on the blockchain..."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              IP Title
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Type
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {mockLicenseHistory.map((license) => (
            <tr
              key={license.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="py-3 px-4">
                <div className="font-medium">{license.ipTitle}</div>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    license.licenseType === 'buy'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                  }`}
                >
                  {license.licenseType === 'buy' ? 'Purchase' : 'Rental'}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <CalendarIcon size={14} className="mr-1" />
                  <span>
                    {new Date(license.startDate).toLocaleDateString()}
                    {license.endDate &&
                      ` - ${new Date(license.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium">{license.price} ETH</div>
              </td>
              <td className="py-3 px-4">
                <div
                  className={`flex items-center text-sm ${
                    license.status === 'active'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {license.status === 'active' ? (
                    <CheckCircleIcon size={14} className="mr-1" />
                  ) : (
                    <ClockIcon size={14} className="mr-1" />
                  )}
                  <span className="capitalize">{license.status}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                {license.status === 'active' &&
                  license.licenseType === 'rent' && (
                    <button
                      onClick={() =>
                        handleLicenseOperation('renew', license.id)
                      }
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Renew
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
