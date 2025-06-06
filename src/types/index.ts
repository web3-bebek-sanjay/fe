// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// IP Asset types
export interface IPAsset extends BaseEntity {
  tokenId: string;
  title: string;
  description: string;
  category: string;
  tag: string;
  fileUpload: string;
  imageUrl?: string;
  licenseType: LicenseType;
  basePrice: string;
  rentPrice: string;
  royaltyPercentage: string;
  owner: string;
  isAvailable: boolean;
}

// License types
export enum LicenseType {
  Personal = 0,
  Rent = 1,
  RentAndBuy = 2,
  ParentRemix = 3,
  ChildRemix = 4,
}

// Transaction types
export interface Transaction extends BaseEntity {
  hash: string;
  from: string;
  to: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  tokenId?: string;
}

export enum TransactionType {
  Purchase = 'purchase',
  Rent = 'rent',
  Register = 'register',
  Remix = 'remix',
  RoyaltyDeposit = 'royalty-deposit',
  RoyaltyClaim = 'royalty-claim',
}

export enum TransactionStatus {
  Pending = 'pending',
  Success = 'success',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

// Wallet types
export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
}

// Remix types
export interface RemixAsset extends Omit<IPAsset, 'licenseType'> {
  parentIPId: string;
  parentIP?: IPAsset;
  licenseType: LicenseType.ChildRemix;
}

// Rental types
export interface Rental extends BaseEntity {
  tokenId: string;
  renter: string;
  owner: string;
  startDate: string;
  endDate: string;
  price: string;
  isActive: boolean;
}

// Royalty types
export interface RoyaltyInfo {
  tokenId: string;
  recipient: string;
  percentage: number;
  totalEarned: string;
  availableToClaim: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  licenseType?: LicenseType;
  minPrice?: number;
  maxPrice?: number;
  owner?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// UI Component types
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
}

export interface CardAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading states
export interface LoadingState {
  [key: string]: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  disabled?: boolean;
}
