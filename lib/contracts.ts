// Environment configuration
const IS_TESTNET = process.env.NEXT_PUBLIC_TESTNET === 'true';

// Contract addresses by network
const MAINNET_CONTRACTS = {
  kiftables: '0x228d11Ae974De7f92c16A1F621341759c56D039D' as const,
  dissolution: '0x7320febE7F5130aa37EBd185C65202b54d13e1D8' as const, // Deployed on mainnet
};

const SEPOLIA_CONTRACTS = {
  // Deployed on Sepolia testnet
  kiftables: '0x725296D429ce22790A9d85c08fEd7ed0a980AC48' as const,
  dissolution: '0xb7Aa527922455534FA03f2e41970675E50DD8468' as const,
};

// Export the contracts for current environment
export const CONTRACTS = IS_TESTNET ? SEPOLIA_CONTRACTS : MAINNET_CONTRACTS;

// For manual override (useful during testing)
export const MAINNET_ADDRESSES = MAINNET_CONTRACTS;
export const SEPOLIA_ADDRESSES = SEPOLIA_CONTRACTS;

// Minimal ABI for Kiftables NFT contract
export const KIFTABLES_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'owner', type: 'address' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'uri', type: 'string' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'supply', type: 'uint256' }],
  },
  {
    name: 'tokensOfOwner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'tokenIds', type: 'uint256[]' }],
  },
] as const

// KiftDissolution contract ABI
export const DISSOLUTION_ABI = [
  // View functions
  {
    name: 'getRedemptionInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'totalEthAvailable', type: 'uint256' },
      { name: 'totalNftsRegistered', type: 'uint256' },
      { name: 'ethPerNftRate', type: 'uint256' },
      { name: 'rateCalculated', type: 'bool' },
      { name: 'registrationsOpen', type: 'bool' },
      { name: 'airdropStarted', type: 'bool' },
    ],
  },
  {
    name: 'getUserInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'nftsRegistered', type: 'uint256' },
      { name: 'withdrawn', type: 'bool' },
      { name: 'ethClaimable', type: 'uint256' },
    ],
  },
  {
    name: 'getUserTokenIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'tokenIds', type: 'uint256[]' }],
  },
  {
    name: 'isTokenRedeemed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'redeemed', type: 'bool' }],
  },
  {
    name: 'timeUntilRegistrationsClose',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'timeLeft', type: 'uint256' }],
  },
  {
    name: 'ethPerNFT',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'rate', type: 'uint256' }],
  },
  {
    name: 'totalNFTsRegistered',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'total', type: 'uint256' }],
  },
  {
    name: 'hasWithdrawn',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'withdrawn', type: 'bool' }],
  },
  // Write functions
  {
    name: 'registerNFTs',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenIds', type: 'uint256[]' }],
    outputs: [],
  },
  {
    name: 'withdrawETH',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  // Events
  {
    name: 'NFTsRegistered',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'tokenIds', type: 'uint256[]', indexed: false },
      { name: 'count', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'ETHWithdrawn',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'nftCount', type: 'uint256', indexed: false },
      { name: 'ethAmount', type: 'uint256', indexed: false },
    ],
  },
] as const