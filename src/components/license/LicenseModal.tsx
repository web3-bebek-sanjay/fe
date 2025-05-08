'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import Image from 'next/image';
import { ethers } from 'ethers';
import { TransactionStatus } from '../ui/TransactionStatus';
import { getCategoryName } from '@/utils/enums';

// Map license type number to user-friendly formats
const getLicenseTypes = (licenseType: number): string[] => {
  switch (licenseType) {
    case 0:
      return ['personal']; // Changed from 'buy' to 'personal' to match your LicenseType enum
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

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ip: any; // Change to 'any' to support both mock and blockchain data
}

// Create a utility function to format prices consistently
const formatPrice = (priceInWei: bigint | string | number): string => {
  try {
    if (typeof priceInWei === 'bigint') {
      return ethers.formatEther(priceInWei);
    } else if (typeof priceInWei === 'string' && priceInWei.includes('n')) {
      // Handle BigInt string format with 'n' suffix
      return ethers.formatEther(BigInt(priceInWei.slice(0, -1)));
    } else {
      return ethers.formatEther(priceInWei.toString());
    }
  } catch (error) {
    console.error('Error formatting price:', error);
    return '0.00';
  }
};

// Helper function to extract category
const extractCategory = (ip: any): string => {
  // First try to access using property
  if (ip.category !== undefined) {
    return typeof ip.category === 'string'
      ? ip.category
      : getCategoryName(ip.category);
  }

  // Then try to access using array index 3 (from blockchain data)
  if (ip[3] !== undefined) {
    return getCategoryName(ip[3]);
  }

  // Default fallback
  return 'Other';
};

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  ip,
}) => {
  const { isConnected, handleBuyIP, handleRentIP, setTokenId } = useWallet();

  // Handle both data formats - structured object and array-like blockchain data
  const extractTokenId = (ipObject: any): string => {
    console.log('Extracting token ID from:', ipObject);

    // Try different possible token ID sources
    if (ipObject.tokenId !== undefined) {
      return ipObject.tokenId.toString();
    } else if (ipObject.id !== undefined) {
      return ipObject.id.toString();
    } else {
      // Search for the token ID in the ownerToTokenIds mapping
      // This is more complex and would require a separate contract call
      console.warn('Could not directly extract token ID from IP object');

      // For debugging, log the full object structure
      console.log(
        'Full IP structure:',
        JSON.stringify(ipObject, (key, value) => {
          if (typeof value === 'bigint') return value.toString() + 'n';
          return value;
        })
      );

      return '';
    }
  };

  const id = extractTokenId(ip);
  const title = ip.title || ip[1] || 'Untitled IP';
  const owner = ip.owner || ip[0] || 'Unknown';
  const description = ip.description || ip[2] || '';
  const category = extractCategory(ip);

  // Log category info for debugging
  console.log('Category information:', {
    raw: ip.category || ip[3],
    extracted: category,
  });

  // Get price based on data format
  let price = 0;
  try {
    // Create a custom replacer for JSON.stringify that handles BigInt
    const jsonReplacer = (key: string, value: any) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n'; // Convert BigInt to string and mark with 'n'
      }
      return value;
    };

    console.log('Full IP object:', JSON.stringify(ip, jsonReplacer)); // Use the replacer

    try {
      // Check real contract data format first - IP with blockchain format uses index 6 for basePrice
      if (ip && ip[6] !== undefined && typeof ip[6] === 'bigint') {
        price = parseFloat(ethers.formatEther(ip[6]));
        console.log('Found price at index 6:', ip[6], 'Converted to:', price);
      }
      // Then try standard object properties
      else if (ip && ip.basePrice !== undefined) {
        if (typeof ip.basePrice === 'bigint') {
          price = parseFloat(ethers.formatEther(ip.basePrice));
        } else if (typeof ip.basePrice === 'string') {
          price = parseFloat(ip.basePrice);
        } else if (typeof ip.basePrice === 'number') {
          price = ip.basePrice;
        }
      }
      // Check other possible price locations
      else if (ip && ip.price !== undefined) {
        if (typeof ip.price === 'number') {
          price = ip.price;
        } else if (typeof ip.price === 'string') {
          price = parseFloat(ip.price);
        } else if (typeof ip.price === 'bigint') {
          price = parseFloat(ethers.formatEther(ip.price));
        }
      }
    } catch (error) {
      console.error('Error formatting price:', error);
    }
  } catch (error) {
    console.error('Error formatting price:', error);
  }

  // Add enhanced logging
  console.log('IP object type:', typeof ip);
  console.log('IP object keys:', ip ? Object.keys(ip) : 'null/undefined');
  console.log('Index 6 (basePrice):', ip?.[6]);
  console.log('Index 7:', ip?.[7]);
  console.log('Raw basePrice property:', ip?.basePrice);
  console.log('Parsed final price:', price);

  // Updated license types detection
  const availableLicenseTypes = Array.isArray(ip.licenseTypes)
    ? ip.licenseTypes
    : getLicenseTypes(
        Number(
          // Check for licenseopt first before trying licenseType
          typeof ip.licenseopt === 'number'
            ? ip.licenseopt
            : typeof ip.licenseopt === 'bigint'
            ? Number(ip.licenseopt)
            : typeof ip.licenseType === 'number'
            ? ip.licenseType
            : typeof ip.licenseType === 'bigint'
            ? Number(ip.licenseType)
            : typeof ip[5] === 'bigint'
            ? Number(ip[5]) // Using index 5 instead of 6 based on your contract
            : 0
        )
      );

  // Add debug logging
  console.log('Raw licenseopt value:', ip.licenseopt || ip[5]);
  console.log('Determined license types:', availableLicenseTypes);

  console.log(
    'Initial license type:',
    availableLicenseTypes.includes('buy') ? 'buy' : 'rent'
  );

  // Get image URL safely
  const imageUrl =
    ip.thumbnail ||
    ip.fileUri ||
    ip[4] || // File upload is at index 4
    `https://picsum.photos/seed/${id || 'default'}/200`;

  // Set default license type safely
  const [licenseType, setLicenseType] = useState<'buy' | 'rent' | 'personal'>(
    availableLicenseTypes.includes('buy')
      ? 'buy'
      : availableLicenseTypes.includes('rent')
      ? 'rent'
      : availableLicenseTypes.includes('personal')
      ? 'personal'
      : 'buy' // Default to 'buy' if none found
  );

  const [duration, setDuration] = useState(30);
  const [txStatus, setTxStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  // Set token ID when modal opens
  useEffect(() => {
    if (isOpen && id) {
      setTokenId(id);
    }
  }, [isOpen, id, setTokenId]);

  const handleConfirmLicense = async () => {
    if (!isConnected) return;
    setTxStatus('pending');

    // Add validation to make sure we have a valid token ID
    if (!id || id === '0') {
      setTxStatus('error');
      return;
    }

    try {
      console.log(`Processing ${licenseType} for IP with token ID: ${id}`);

      if (licenseType === 'buy' || licenseType === 'personal') {
        // Get the buy price directly from index 6 or fall back to calculated price
        const buyPrice =
          typeof ip[6] === 'bigint'
            ? parseFloat(ethers.formatEther(ip[6]))
            : calculatePrice();

        console.log(`Buying IP #${id} with ${buyPrice} ETH`);
        // Pass the IP's ID directly to the buy function
        await handleBuyIP(buyPrice.toString(), id);
      } else if (licenseType === 'rent') {
        // Calculate the price based on duration
        const rentTotal = calculatePrice();

        console.log(
          `Renting IP #${id} for ${duration} days at ${rentTotal} ETH`
        );

        // Convert to string and ensure it's formatted correctly for ethers
        const rentTotalStr = rentTotal.toString();

        // Pass all parameters explicitly to avoid any confusion
        await handleRentIP(rentTotalStr, duration, id);
      }

      setTxStatus('success');
      // No longer need this setTimeout as the TransactionStatus component handles it
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setTxStatus('error');
    }
  };

  // Improved price calculation function
  const calculatePrice = () => {
    if (licenseType === 'buy' || licenseType === 'personal') {
      // Use index 6 for buy/personal price (basePrice)
      const buyPrice =
        typeof ip[6] === 'bigint'
          ? parseFloat(ethers.formatEther(ip[6]))
          : price;
      return buyPrice;
    }

    // For rent: Calculate price based on duration (days)
    // Use index 7 for rent price
    const rentPricePerDay =
      typeof ip[7] === 'bigint'
        ? parseFloat(ethers.formatEther(ip[7]))
        : price / 30; // Fallback calculation if ip[7] is not available

    // Calculate the total rent price based on duration
    return rentPricePerDay * duration;
  };

  // Only log duration details for rent license type
  if (licenseType === 'rent') {
    console.log('Duration:', duration);
    console.log(
      'Calculated price for duration:',
      Math.round(calculatePrice() * 1000) / 1000
    );
  }

  // Update license types detection with better logging

  // Log raw value before processing
  console.log(
    'Raw IP licenseopt value:',
    ip.licenseopt !== undefined
      ? ip.licenseopt
      : ip[5] !== undefined
      ? ip[5]
      : 'Not found'
  );

  // Check and coerce numeric types for consistency
  const getLicenseoptValue = (ipObj: any): number => {
    // If it's a direct property
    if (ipObj.licenseopt !== undefined) {
      const val = ipObj.licenseopt;
      return typeof val === 'bigint' ? Number(val) : Number(val);
    }
    // If it's an array-like structure, check index 5
    else if (ipObj[5] !== undefined) {
      const val = ipObj[5];
      return typeof val === 'bigint' ? Number(val) : Number(val);
    }
    // Default to buy-only license
    return 0;
  };

  const licenseoptValue = getLicenseoptValue(ip);
  console.log('Processed licenseopt value:', licenseoptValue);

  const licenseTypes = getLicenseTypes(licenseoptValue);
  console.log('Determined license types:', licenseTypes);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
            }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative">
              <div className="w-full h-48 relative">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                disabled={txStatus === 'pending'}
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{title}</h3>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Owner:{' '}
                {typeof owner === 'string'
                  ? `${owner.slice(0, 6)}...${owner.slice(-4)}`
                  : 'Unknown'}
              </div>
              {txStatus !== 'idle' ? (
                <div className="py-4">
                  <TransactionStatus
                    status={txStatus}
                    onReset={() => {
                      setTxStatus('idle');
                      if (txStatus === 'success') {
                        setTimeout(() => onClose(), 500);
                      }
                    }}
                    successMessage={`You have successfully ${
                      licenseType === 'buy' || licenseType === 'personal'
                        ? 'purchased'
                        : 'rented'
                    } this IP license.`}
                    errorMessage="There was an error processing your transaction. Please try again."
                    pendingMessage={`Processing your ${
                      licenseType === 'buy' || licenseType === 'personal'
                        ? 'purchase'
                        : 'rental'
                    } transaction on the blockchain...`}
                  />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      License Type
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      {availableLicenseTypes.includes('personal') && (
                        <button
                          className={`flex-1 py-2 text-center text-sm font-medium ${
                            licenseType === 'personal'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                          onClick={() => setLicenseType('personal')}
                        >
                          Personal
                        </button>
                      )}
                      {availableLicenseTypes.includes('buy') && (
                        <button
                          className={`flex-1 py-2 text-center text-sm font-medium ${
                            licenseType === 'buy'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                          onClick={() => setLicenseType('buy')}
                        >
                          Buy
                        </button>
                      )}
                      {availableLicenseTypes.includes('rent') && (
                        <button
                          className={`flex-1 py-2 text-center text-sm font-medium ${
                            licenseType === 'rent'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                          onClick={() => setLicenseType('rent')}
                        >
                          Rent
                        </button>
                      )}
                    </div>
                  </div>
                  {licenseType === 'rent' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Duration (days)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={90}
                        value={duration}
                        onChange={(e) =>
                          setDuration(Number.parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span>{duration} days</span>
                        <span>{calculatePrice()} ETH</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">License Terms</h4>
                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
                      <li>
                        •{' '}
                        {licenseType === 'buy' || licenseType === 'personal'
                          ? 'Perpetual'
                          : `${duration}-day`}{' '}
                        license
                      </li>
                      <li>
                        •{' '}
                        {licenseType === 'buy' || licenseType === 'personal'
                          ? 'Full'
                          : 'Limited'}{' '}
                        commercial usage
                      </li>
                      <li>• Non-exclusive rights</li>
                      <li>• No redistribution allowed</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Total Price:</div>
                    <div className="text-lg font-bold">
                      {calculatePrice()} <span className="ml-1">ETH</span>
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmLicense}
                    disabled={!isConnected}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConnected
                      ? `Confirm ${
                          licenseType === 'buy' || licenseType === 'personal'
                            ? 'Purchase'
                            : 'Rental'
                        }`
                      : 'Connect Wallet to Continue'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
