'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TagIcon,
  ShoppingCartIcon,
  CalendarIcon,
  EyeIcon,
  LoaderIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ethers } from 'ethers';
import { getCategoryName } from '@/utils/enums';
import { useWallet } from '@/context/WalletContext';
import { TransactionStatus } from '@/components/ui/TransactionStatus';
import { TRANSACTION_STATUS } from '@/constants';

// Map license type number to user-friendly formats
const getLicenseTypes = (licenseType: number | bigint): string[] => {
  // Convert to Number to handle both number and bigint
  const value = Number(licenseType);

  switch (value) {
    case 0:
      return ['personal'];
    case 1:
      return ['rent'];
    case 2:
      return ['buy', 'rent'];
    case 3:
      return ['parent remix'];
    case 4:
      return ['child remix'];
    default:
      return ['buy'];
  }
};

interface IPCardProps {
  ip: any;
  onClick: () => void;
  showActions?: boolean; // Allow disabling transaction actions
  onTransactionComplete?: () => void; // Callback for transaction completion
}

export const IPCard: React.FC<IPCardProps> = ({
  ip,
  onClick,
  showActions = true,
  onTransactionComplete,
}) => {
  const { handleBuyIP, handleRentIP, isConnected, account } = useWallet();
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [currentAction, setCurrentAction] = useState<'buy' | 'rent' | null>(
    null
  );
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Support both mock data and blockchain data format
  const id = ip.id?.toString() || ip.tokenId?.toString() || '0';
  const title = ip.title || ip[1] || 'Untitled IP'; // Use numeric index for blockchain data
  const owner = ip.owner || ip[0] || 'Unknown'; // Owner is usually at index 0
  const description = ip.description || ip[2] || ''; // Access description

  // Check if current user owns this IP
  const isOwner =
    account && owner && account.toLowerCase() === owner.toLowerCase();

  // Get category based on data structure - using index 3 from contract data
  let categoryValue = ip.category;
  if (categoryValue === undefined && ip[3] !== undefined) {
    categoryValue = ip[3];
  }

  const category =
    typeof categoryValue === 'string'
      ? categoryValue
      : getCategoryName(categoryValue || 0);

  // Get license types based on data structure - using index 5 from contract data
  const licenseTypeValue = ip.licenseType || ip[5] || 0;

  const licenseTypes = Array.isArray(ip.licenseTypes)
    ? ip.licenseTypes
    : getLicenseTypes(Number(licenseTypeValue));

  // Check if this IP supports different license types
  const canBuy =
    licenseTypes.includes('buy') || licenseTypes.includes('personal');
  const canRent = licenseTypes.includes('rent');

  // Format prices based on data type - using index 6 or 7 from contract data
  let buyPrice = 0;
  let rentPrice = 0;

  try {
    // Buy price (basePrice) - index 6
    if (ip[6] !== undefined) {
      const priceValue = ip[6];
      buyPrice = parseFloat(ethers.formatEther(priceValue));
    } else if (ip.basePrice !== undefined) {
      const priceValue = ip.basePrice;
      buyPrice = parseFloat(ethers.formatEther(priceValue));
    }

    // Rent price - index 7
    if (ip[7] !== undefined) {
      const priceValue = ip[7];
      rentPrice = parseFloat(ethers.formatEther(priceValue));
    } else if (ip.rentPrice !== undefined) {
      const priceValue = ip.rentPrice;
      rentPrice = parseFloat(ethers.formatEther(priceValue));
    }
  } catch (error) {
    console.error('Error formatting prices:', error);
  }

  // Enhanced image URL logic
  let imageUrl = `https://picsum.photos/seed/${id || 'default'}/200`; // Default fallback

  // Priority order for image sources:
  if (
    ip.imageUrl &&
    typeof ip.imageUrl === 'string' &&
    ip.imageUrl.trim() !== ''
  ) {
    imageUrl = ip.imageUrl;
  } else if (ip[4] && typeof ip[4] === 'string' && ip[4].trim() !== '') {
    imageUrl = ip[4];
  } else if (
    ip.fileUri &&
    typeof ip.fileUri === 'string' &&
    ip.fileUri.trim() !== ''
  ) {
    imageUrl = ip.fileUri;
  } else if (
    ip.thumbnail &&
    typeof ip.thumbnail === 'string' &&
    ip.thumbnail.trim() !== ''
  ) {
    imageUrl = ip.thumbnail;
  }

  // Handle buy transaction
  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (isOwner) {
      alert('You cannot buy your own IP');
      return;
    }

    setCurrentAction('buy');
    setTxStatus('pending');

    try {
      await handleBuyIP(buyPrice.toString(), id);
      setTxStatus('success');

      // Call completion callback if provided
      setTimeout(() => {
        if (onTransactionComplete) {
          onTransactionComplete();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Buy transaction failed:', error);
      setTxStatus('error');
    }
  };

  // Handle rent transaction
  const handleRent = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (isOwner) {
      alert('You cannot rent your own IP');
      return;
    }

    setCurrentAction('rent');
    setTxStatus('pending');

    try {
      // Default to 30 days rental period
      await handleRentIP(rentPrice.toString(), 30, id);
      setTxStatus('success');

      // Call completion callback if provided
      setTimeout(() => {
        if (onTransactionComplete) {
          onTransactionComplete();
        }
      }, 2000);
    } catch (error: any) {
      console.error('Rent transaction failed:', error);
      setTxStatus('error');
    }
  };

  // Reset transaction status
  const handleReset = () => {
    setTxStatus('idle');
    setCurrentAction(null);
    setShowActionsMenu(false);
  };

  // If transaction is in progress, show transaction status
  if (txStatus !== 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="p-6">
          <TransactionStatus
            status={txStatus}
            onReset={handleReset}
            successMessage={`Successfully ${
              currentAction === 'buy' ? 'purchased' : 'rented'
            } IP license for "${title}"`}
            errorMessage={`Failed to ${
              currentAction === 'buy' ? 'purchase' : 'rent'
            } IP license. Please try again.`}
            pendingMessage={`Processing ${
              currentAction === 'buy' ? 'purchase' : 'rental'
            } transaction...`}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2,
        },
      }}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
      onClick={onClick}
    >
      <OptimizedImage
        src={imageUrl}
        alt={title}
        aspectRatio="video"
        className="w-full h-48 object-cover transition-transform hover:scale-105 duration-500"
        fallbackSrc="/placeholder.svg"
      />

      {/* Quick Action Overlay - Only show if not owner and actions are enabled */}
      {showActions && !isOwner && isConnected && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex gap-2">
              {canBuy && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuy}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg"
                >
                  <ShoppingCartIcon size={16} />
                  Buy {buyPrice} ETH
                </motion.button>
              )}
              {canRent && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRent}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg"
                >
                  <CalendarIcon size={16} />
                  Rent {rentPrice} ETH
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
            <TagIcon size={12} />
            {category}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Owner:{' '}
          {typeof owner === 'string'
            ? `${owner.slice(0, 6)}...${owner.slice(-4)}`
            : 'Unknown'}
          {isOwner && (
            <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-medium">
              You
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {description || 'No description available'}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {licenseTypes.includes('personal') && (
              <span className="bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">
                Personal
              </span>
            )}
            {licenseTypes.includes('buy') && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                Buy
              </span>
            )}
            {licenseTypes.includes('rent') && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                Rent
              </span>
            )}
            {licenseTypes.includes('parent remix') && (
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-xs font-medium">
                Parent Remix
              </span>
            )}
            {licenseTypes.includes('child remix') && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded text-xs font-medium">
                Child Remix
              </span>
            )}
          </div>

          <div className="text-right">
            {canBuy && (
              <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
                {buyPrice} ETH
              </div>
            )}
            {canRent && (
              <div className="font-medium text-xs text-purple-600 dark:text-purple-400">
                {rentPrice} ETH/month
              </div>
            )}
          </div>
        </div>

        {/* Action buttons for connected users (alternative to overlay) */}
        {showActions && !isOwner && isConnected && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              {canBuy && (
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCartIcon size={14} />
                  Buy
                </button>
              )}
              {canRent && (
                <button
                  onClick={handleRent}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <CalendarIcon size={14} />
                  Rent
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <EyeIcon size={14} />
                View
              </button>
            </div>
          </div>
        )}

        {/* Connection prompt for unconnected users */}
        {showActions && !isConnected && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400 text-center">
                Connect your wallet to purchase or rent this IP
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
