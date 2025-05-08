'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { TagIcon } from 'lucide-react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { getCategoryName } from '@/utils/enums';

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
}

export const IPCard: React.FC<IPCardProps> = ({ ip, onClick }) => {
  // Support both mock data and blockchain data format
  const id = ip.id?.toString() || ip.tokenId?.toString() || '0';
  const title = ip.title || ip[1] || 'Untitled IP'; // Use numeric index for blockchain data
  const owner = ip.owner || ip[0] || 'Unknown'; // Owner is usually at index 0
  const description = ip.description || ip[2] || ''; // Access description

  // Get category based on data structure - using index 3 from contract data
  let categoryValue = ip.category;
  if (categoryValue === undefined && ip[3] !== undefined) {
    categoryValue = ip[3];
    console.log(`IPCard: Extracting category from index 3: ${categoryValue}`);
  }

  const category =
    typeof categoryValue === 'string'
      ? categoryValue
      : getCategoryName(categoryValue || 0);

  // Get license types based on data structure - using index 5 from contract data
  const licenseTypeValue = ip.licenseType || ip[5] || 0;
  if (ip[5] !== undefined) {
    console.log(`IPCard: Extracting license type from index 5: ${ip[5]}`);
  }

  const licenseTypes = Array.isArray(ip.licenseTypes)
    ? ip.licenseTypes
    : getLicenseTypes(Number(licenseTypeValue));

  // Format price based on data type - using index 6 or 7 from contract data
  let price = 0;
  try {
    if (
      typeof ip.basePrice === 'bigint' ||
      typeof ip[6] === 'bigint' ||
      typeof ip[7] === 'bigint'
    ) {
      // Try index 6 first (basePrice from contract)
      if (ip[6] !== undefined) {
        const priceValue = ip[6];
        price = parseFloat(ethers.formatEther(priceValue));
        console.log(
          `IPCard: Extracting price from index 6: ${price} ETH from value: ${priceValue}`
        );
      }
      // Then try index 7 (rentPrice from contract) as fallback
      else if (ip[7] !== undefined) {
        const priceValue = ip[7];
        price = parseFloat(ethers.formatEther(priceValue));
        console.log(
          `IPCard: Extracting price from index 7: ${price} ETH from value: ${priceValue}`
        );
      }
      // Then try direct property access
      else if (ip.basePrice !== undefined) {
        const priceValue = ip.basePrice;
        price = parseFloat(ethers.formatEther(priceValue));
        console.log(
          `IPCard: Extracting price from basePrice property: ${price} ETH from value: ${priceValue}`
        );
      }
    } else if (typeof ip.price === 'number') {
      price = ip.price;
    } else if (typeof ip.price === 'string') {
      price = parseFloat(ip.price);
    }
  } catch (error) {
    console.error('Error formatting price:', error);
  }

  // Use thumbnail if available or fileUri for blockchain data
  const imageUrl =
    ip.thumbnail ||
    ip.fileUri ||
    ip[4] || // fileUpload is at index 4
    ip.imageUrl || // Use imageUrl if it was added previously
    `https://picsum.photos/seed/${id || 'default'}/200`;

  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: {
          duration: 0.2,
        },
      }}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-48 overflow-hidden relative">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
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
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Description: {description}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {licenseTypes.includes('personal') && (
              <span className="bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-medium">
                Personal
              </span>
            )}
            {licenseTypes.includes('buy') && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded text-xs font-medium">
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
          <div className="font-medium text-sm">{price} ETH</div>
        </div>
      </div>
    </motion.div>
  );
};
