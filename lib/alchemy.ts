import { Alchemy, Network } from 'alchemy-sdk'

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
}

console.log('Alchemy config:', {
  apiKey: config.apiKey ? 'SET' : 'NOT SET',
  network: config.network
})

export const alchemy = new Alchemy(config)

// Kiftables contract address on mainnet
export const KIFTABLES_CONTRACT_ADDRESS = '0x228d11Ae974De7f92c16A1F621341759c56D039D'