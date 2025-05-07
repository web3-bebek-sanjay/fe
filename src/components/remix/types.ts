export interface Deposit {
  id: string;
  amount: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface Remix {
  id: string;
  tokenId: string;
  parentId: string; // Will be "0" for original IPs
  title: string;
  description: string;
  parentTitle: string;
  parentCreator: string;
  royaltyRate: number;
  status: string;
  createdAt: Date;
  totalSales: string;
  totalRoyaltiesPaid: string;
  deposits: Deposit[];
  coverImage: string;
}

// The structure returned by the contract for RemixInfo
export interface RemixInfo {
  ip: {
    owner: string;
    title: string;
    description: string;
    category: string | number;
    fileUpload: string;
    licenseopt: string | number;
    basePrice: string | number;
    rentPrice: string | number;
    royaltyPercentage: string | number;
    pendingRoyalty: string | number;
  };
  parentId: string | number;
  tokenId?: string | number;
}

// Helper functions for working with Remix objects
export const isOriginalIP = (remix: Remix): boolean => {
  // All IPs are considered remixes, even if parentId is '0'
  return false;
};

export const getFormattedRoyaltyRate = (remix: Remix): string => {
  // Always show royalty rate
  return `${remix.royaltyRate}%`;
};

export const getFormattedCreator = (
  remix: Remix,
  fullAddress?: string
): string => {
  // Always show creator info
  if (fullAddress) {
    return `${fullAddress.substring(0, 6)}...${fullAddress.substring(
      fullAddress.length - 4
    )}`;
  }

  return remix.parentCreator || 'Unknown Creator';
};

export const extractParentId = (data: any): string => {
  // Extract parentId from various structures the contract might return
  if (!data) return '0';

  // Direct property access
  if (data.parentId !== undefined) {
    return data.parentId.toString();
  }

  // Array-like structure
  if (Array.isArray(data) && data[1] !== undefined) {
    return data[1].toString();
  }

  // Nested structure
  if (
    Array.isArray(data) &&
    data[0] &&
    typeof data[0] === 'object' &&
    data[0].parentId !== undefined
  ) {
    return data[0].parentId.toString();
  }

  // RemixInfo structure
  if (typeof data === 'object' && data.ip && data.parentId !== undefined) {
    return data.parentId.toString();
  }

  return '0';
};
