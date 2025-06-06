// Contract addresses and ABIs

export const IPX_ADDRESS =
  process.env.NEXT_PUBLIC_IPX_CONTRACT_ADDRESS ||
  '0x1234567890123456789012345678901234567890';

export const IPX_ABI = [
  // Minimal ABI for the required functions
  {
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    name: 'buyIP',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: '' }],
    name: 'ips',
    outputs: [
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'uint256', name: 'category' },
      { type: 'address', name: 'owner' },
      { type: 'uint256', name: 'basePrice' },
      { type: 'uint256', name: 'royaltyPercentage' },
      { type: 'uint256', name: 'licenseopt' },
      { type: 'string', name: 'fileUpload' },
      { type: 'bool', name: 'isRegistered' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllIPs',
    outputs: [
      {
        components: [
          { type: 'string', name: 'title' },
          { type: 'string', name: 'description' },
          { type: 'uint256', name: 'category' },
          { type: 'address', name: 'owner' },
          { type: 'uint256', name: 'basePrice' },
          { type: 'uint256', name: 'royaltyPercentage' },
          { type: 'uint256', name: 'licenseopt' },
          { type: 'string', name: 'fileUpload' },
          { type: 'bool', name: 'isRegistered' },
        ],
        type: 'tuple[]',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ type: 'address', name: 'user' }],
    name: 'getMyIPs',
    outputs: [
      {
        components: [
          { type: 'string', name: 'title' },
          { type: 'string', name: 'description' },
          { type: 'uint256', name: 'category' },
          { type: 'address', name: 'owner' },
          { type: 'uint256', name: 'basePrice' },
          { type: 'uint256', name: 'royaltyPercentage' },
          { type: 'uint256', name: 'licenseopt' },
          { type: 'string', name: 'fileUpload' },
          { type: 'bool', name: 'isRegistered' },
        ],
        type: 'tuple[]',
        name: '',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'uint256', name: 'category' },
      { type: 'uint256', name: 'basePrice' },
      { type: 'uint256', name: 'royaltyPercentage' },
      { type: 'uint256', name: 'licenseopt' },
      { type: 'string', name: 'fileUpload' },
    ],
    name: 'registerIP',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { type: 'uint256', name: 'parentId' },
      { type: 'string', name: 'title' },
      { type: 'string', name: 'description' },
      { type: 'uint256', name: 'category' },
      { type: 'uint256', name: 'basePrice' },
      { type: 'uint256', name: 'royaltyPercentage' },
      { type: 'uint256', name: 'licenseopt' },
      { type: 'string', name: 'fileUpload' },
    ],
    name: 'registerRemix',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    name: 'claimRoyalty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    name: 'getRoyalty',
    outputs: [
      { type: 'uint256', name: 'pending' },
      { type: 'uint256', name: 'claimed' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Default network configuration
export const DEFAULT_NETWORK = {
  chainId: 1337, // Local development network
  name: 'Localhost',
  currency: 'ETH',
};
