// Type definitions for the IP management system

export interface IPStruct {
  title: string;
  description: string;
  category: number;
  owner: string;
  basePrice: bigint | string;
  royaltyPercentage: bigint | string;
  licenseopt: number;
  fileUpload: string;
  isRegistered: boolean;
}

export interface RemixStruct {
  parentId: number;
  title: string;
  description: string;
  category: number;
  owner: string;
  basePrice: bigint | string;
  royaltyPercentage: bigint | string;
  licenseopt: number;
  fileUpload: string;
  isRegistered: boolean;
}

export interface RoyaltyInfo {
  pending: string;
  claimed: string;
  isOriginalIP?: boolean;
  isYourIP?: boolean;
}

export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: bigint;
  status?: number;
}

export interface ContractResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  transaction?: TransactionResult;
}

// License type enumeration
export enum LicenseType {
  PERSONAL = 0,
  RENT = 1,
  RENT_AND_BUY = 2,
  PARENT_REMIX = 3,
  CHILD_REMIX = 4,
}

// Category enumeration
export enum Category {
  MUSIC = 0,
  ART = 1,
  LITERATURE = 2,
  SOFTWARE = 3,
  PHOTOGRAPHY = 4,
  VIDEO = 5,
  OTHER = 6,
}

// Status enumeration for UI
export enum Status {
  IDLE = 'idle',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IPMetadata {
  tokenId?: string;
  createdAt?: string;
  lastModified?: string;
  tags?: string[];
  views?: number;
  downloads?: number;
}

export interface ExtendedIPStruct extends IPStruct {
  metadata?: IPMetadata;
  earnings?: number;
  pendingRoyalty?: string;
  type?: 'personal' | 'rent' | 'remix';
  imageUrl?: string;
  fallbackImageUrl?: string;
}
