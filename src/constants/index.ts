// App constants
export const APP_NAME = 'IPX - Intellectual Property Management';
export const APP_DESCRIPTION =
  'Manage your intellectual property assets on the blockchain';

// Navigation tabs
export const NAVIGATION_TABS = {
  LICENSE: 'license',
  REGISTER_IP: 'registerIP',
  REGISTER_REMIX: 'registerRemix',
  ROYALTY: 'royalty',
  REMIX: 'remix',
} as const;

// License types
export const LICENSE_TYPE_LABELS = {
  0: 'Personal',
  1: 'Rent',
  2: 'Rent & Buy',
  3: 'Parent Remix',
  4: 'Child Remix',
} as const;

// Categories
export const CATEGORIES = {
  MUSIC: 0,
  ART: 1,
  LITERATURE: 2,
  SOFTWARE: 3,
  PHOTOGRAPHY: 4,
  VIDEO: 5,
  OTHER: 6,
} as const;

export const CATEGORY_LABELS = {
  [CATEGORIES.MUSIC]: 'Music',
  [CATEGORIES.ART]: 'Art',
  [CATEGORIES.LITERATURE]: 'Literature',
  [CATEGORIES.SOFTWARE]: 'Software',
  [CATEGORIES.PHOTOGRAPHY]: 'Photography',
  [CATEGORIES.VIDEO]: 'Video',
  [CATEGORIES.OTHER]: 'Other',
} as const;

// Transaction status
export const TRANSACTION_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Form validation
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  TAG: {
    MAX_LENGTH: 50,
  },
  ROYALTY: {
    MIN: 0,
    MAX: 100,
  },
  RENTAL_DURATION: {
    MIN: 1,
    MAX: 365,
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/api/upload',
  METADATA: '/api/metadata',
  HEALTH: '/api/health',
} as const;

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'application/pdf',
  ],
  IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  AUDIO_TYPES: ['audio/mpeg', 'audio/wav'],
  VIDEO_TYPES: ['video/mp4', 'video/webm'],
} as const;

// UI
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Wallet
export const SUPPORTED_CHAINS = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 5,
    name: 'Goerli Testnet',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 137,
    name: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  {
    id: 80001,
    name: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_FAILED: 'Transaction failed',
  INVALID_INPUT: 'Invalid input provided',
  NETWORK_ERROR: 'Network error occurred',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  IP_REGISTERED: 'IP successfully registered',
  REMIX_CREATED: 'Remix successfully created',
  LICENSE_PURCHASED: 'License successfully purchased',
  ROYALTY_CLAIMED: 'Royalty successfully claimed',
  FILE_UPLOADED: 'File successfully uploaded',
  WALLET_CONNECTED: 'Wallet successfully connected',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'ipx-theme',
  WALLET_CONNECTION: 'ipx-wallet-connection',
  USER_PREFERENCES: 'ipx-user-preferences',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  IP_ASSETS: 'ip-assets',
  MY_IPS: 'my-ips',
  OTHER_IPS: 'other-ips',
  REMIXES: 'remixes',
  ROYALTIES: 'royalties',
  WALLET_BALANCE: 'wallet-balance',
  TRANSACTION_HISTORY: 'transaction-history',
} as const;
