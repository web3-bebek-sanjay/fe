'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CheckIcon, AlertCircleIcon, LoaderIcon } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import Image from 'next/image';
import { ethers } from 'ethers';

// Map license type number to user-friendly formats
const getLicenseTypes = (licenseType: number): string[] => {
  switch (licenseType) {
    case 0:
      return ['buy']; 
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

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  ip,
}) => {
  const { isConnected, handleBuyIP, handleRentIP, setTokenId } = useWallet();

  // Handle both data formats - structured object and array-like blockchain data
  const id = ip.id?.toString() || ip.tokenId?.toString() || '0';
  const title = ip.title || ip[1] || 'Untitled IP';
  const owner = ip.owner || ip[0] || 'Unknown';

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
      // Log specific properties instead of the whole object
      console.log('IP id:', ip.id || ip.tokenId);
      console.log('IP title:', ip.title || ip[1]);
      console.log('IP basePrice:', ip.basePrice || ip[7]);

      if (ip && ip.basePrice) {
        // Continue your existing code...
        if (typeof ip.basePrice === 'bigint') {
          price = parseFloat(ethers.formatEther(ip.basePrice));
        } else if (typeof ip.basePrice === 'string') {
          price = parseFloat(ip.basePrice);
        } else if (typeof ip.basePrice === 'number') {
          price = ip.basePrice;
        }
      } else if (ip && ip[7]) {
        if (typeof ip[7] === 'bigint') {
          price = parseFloat(ethers.formatEther(ip[7]));
        } else {
          price = parseFloat(ip[7]);
        }
      } else if (ip && ip.price) {
        if (typeof ip.price === 'number') {
          price = ip.price;
        } else if (typeof ip.price === 'string') {
          price = parseFloat(ip.price);
        }
      }
    } catch (error) {
      console.error('Error formatting price:', error);
    }
  } catch (error) {
    console.error('Error formatting price:', error);
  }

  // Add this enhanced logging
  console.log('IP object type:', typeof ip);
  console.log('IP object keys:', ip ? Object.keys(ip) : 'null/undefined');
  console.log('Raw price value:', ip?.basePrice || ip?.[7] || ip?.price);
  console.log('Parsed price:', price);

  // Updated license types detection
  const licenseTypes = Array.isArray(ip.licenseTypes)
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
  console.log('Determined license types:', licenseTypes);

  console.log(
    'Initial license type:',
    licenseTypes.includes('buy') ? 'buy' : 'rent'
  );

  // Get image URL safely
  const imageUrl = ip.thumbnail || ip.fileUri || ip[5] || '/placeholder.svg';

  // Set default license type safely
  const [licenseType, setLicenseType] = useState<'buy' | 'rent'>(
    licenseTypes.includes('buy')
      ? 'buy'
      : licenseTypes.includes('rent')
      ? 'rent'
      : 'buy' // Default to 'buy' if empty
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

    try {
      if (licenseType === 'buy') {
        try {
          // Make sure we're sending the correct price format
          console.log(`Buying IP #${id} with ${price} ETH`);

          // Let's handle both cases: either the price is already in BigInt format or needs conversion
          await handleBuyIP(ethers.parseEther(price.toString()).toString());
        } catch (priceError) {
          console.error('Error formatting price:', priceError);
          // If parseEther fails (perhaps price is already in wei), try using the original price
          await handleBuyIP(price.toString());
        }
      } else if (licenseType === 'rent') {
        const rentTotal = calculatePrice().toString();
        await handleRentIP(rentTotal, duration);
      }

      setTxStatus('success');
      // Close modal after showing success
      setTimeout(() => {
        onClose();
        setTxStatus('idle');
      }, 2000);
    } catch (error: any) {
      console.error('Transaction failed:', error);

      // Enhanced error reporting
      if (error.code === 'CALL_EXCEPTION') {
        console.error('Contract execution reverted. This could be due to:');
        console.error('- Insufficient funds for gas + value');
        console.error('- IP already purchased by someone else');
        console.error('- Not meeting contract requirements');
      }

      // Show specific error message if available
      let errorMsg = 'There was an error processing your transaction.';
      if (error.reason) errorMsg += ` Reason: ${error.reason}`;

      // Set state and show error
      setTxStatus('error');
    }
  };

  // Improved price calculation function
  const calculatePrice = () => {
    if (licenseType === 'buy') {
      return price;
    }

    // For rent: Calculate price based on duration (days)
    // This gives a pro-rated price based on the standard 30-day rental price
    return (price * duration) / 30;
  };

  // Only log duration details for rent license type
  if (licenseType === 'rent') {
    console.log('Duration:', duration);
    console.log(
      'Calculated price for duration:',
      Math.round(((price * duration) / 30) * 1000) / 1000
    );
  }

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
              {txStatus === 'idle' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      License Type
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      {licenseTypes.includes('buy') && (
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
                      {licenseTypes.includes('rent') && (
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
                        {licenseType === 'buy'
                          ? 'Perpetual'
                          : `${duration}-day`}{' '}
                        license
                      </li>
                      <li>
                        • {licenseType === 'buy' ? 'Full' : 'Limited'}{' '}
                        commercial usage
                      </li>
                      <li>• Non-exclusive rights</li>
                      <li>• No redistribution allowed</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Total Price:</div>
                    <div className="text-lg font-bold">
                      {calculatePrice()}{' '}
                      {/* This is the correct formatted price */}
                      <span className="ml-1">ETH</span>{' '}
                      {/* ETH is the correct token symbol */}
                    </div>
                  </div>
                  <button
                    onClick={handleConfirmLicense}
                    disabled={!isConnected}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isConnected
                      ? `Confirm ${
                          licenseType === 'buy' ? 'Purchase' : 'Rental'
                        }`
                      : 'Connect Wallet to Continue'}
                  </button>
                </>
              )}
              {txStatus === 'pending' && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="animate-spin mb-4">
                    <LoaderIcon size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Processing Transaction
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    Please wait while we process your transaction on the
                    blockchain.
                  </p>
                </div>
              )}
              {txStatus === 'success' && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckIcon
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Transaction Successful!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                    You have successfully{' '}
                    {licenseType === 'buy' ? 'purchased' : 'rented'} this IP
                    license.
                  </p>
                </div>
              )}
              {txStatus === 'error' && (
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                    <AlertCircleIcon
                      size={24}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <h3 className="text-lg font-medium mb-1">
                    Transaction Failed
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                    There was an error processing your transaction. Please try
                    again.
                  </p>
                  <button
                    onClick={() => setTxStatus('idle')}
                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
