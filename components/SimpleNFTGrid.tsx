'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { RegisterButton } from './RegisterButton'
import { CONTRACTS, DISSOLUTION_ABI } from '@/lib/contracts'
import { CheckCircle, Clock, Sparkles } from 'lucide-react'

// Known test wallet NFTs for our deployment (verified on-chain)
const WALLET_NFTS = {
  '0xed1bc8a1f087af02d1412a32536ae14f1aa425c5': [1], // Wallet 1 (1 NFT)
  '0xe84d5b14a6e7f57195d5dc0ec819c6684b25956d': [2, 3], // Wallet 2 (2 NFTs)
  '0xc11e96e51a2da3710e413473c377bb78b9a48032': [4, 5, 6], // Wallet 3 (3 NFTs)
  '0x298241b5b50c15b283a8f4a0aeceaf3520dc428e': [7], // Wallet 4 (1 NFT)
  '0x5a0181bdfb858ab6dde0a5896d8108c76f099514': [12, 13], // Wallet 5 (2 NFTs)
  '0x0f3a02b48aea4849b2478242cec29abe29b76504': [17, 18, 19], // Wallet 6 (3 NFTs)
} as const

export function SimpleNFTGrid() {
  const { address, isConnected } = useAccount()
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<number>>(new Set())
  const [registrationStatus, setRegistrationStatus] = useState<Map<number, boolean>>(new Map())

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view and register your Kiftables NFTs for the dissolution process
        </p>
      </div>
    )
  }

  // Get NFTs for this wallet
  const walletNFTs = WALLET_NFTS[address.toLowerCase() as keyof typeof WALLET_NFTS] || []

  // Get user's registered token IDs from the contract
  const { data: userRegisteredTokenIds } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'getUserTokenIds',
    args: address ? [address] : undefined,
    query: { enabled: !!address && walletNFTs.length > 0 },
  })

  // Update registration status when data changes
  useEffect(() => {
    const statusMap = new Map<number, boolean>()

    // Mark all wallet NFTs as not registered by default
    walletNFTs.forEach(tokenId => {
      statusMap.set(tokenId, false)
    })

    // Mark registered ones as true
    if (userRegisteredTokenIds) {
      userRegisteredTokenIds.forEach((tokenId: bigint) => {
        const id = Number(tokenId)
        if (walletNFTs.includes(id)) {
          statusMap.set(id, true)
        }
      })
    }

    setRegistrationStatus(statusMap)
  }, [userRegisteredTokenIds, walletNFTs])

  if (walletNFTs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          This wallet doesn't contain any test NFTs for the dissolution process
        </p>
        <div className="bg-muted/30 border border-border rounded-xl p-4 w-full max-w-2xl">
          <p className="text-sm font-medium text-foreground mb-2">Current wallet:</p>
          <code className="text-xs font-mono bg-background px-3 py-2 rounded-lg block text-muted-foreground break-all">
            {address}
          </code>
          <p className="text-sm font-medium text-foreground mt-4 mb-3">Available test wallets:</p>
          <div className="grid gap-2">
            {Object.entries(WALLET_NFTS).map(([wallet, tokens]) => (
              <div key={wallet} className="flex justify-between items-center text-xs">
                <code className="font-mono text-muted-foreground">{wallet}</code>
                <span className="bg-foreground/10 text-foreground px-2 py-1 rounded-md">
                  {tokens.length} NFT{tokens.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleTokenSelect = (tokenId: number) => {
    // Don't allow selecting already registered NFTs
    if (registrationStatus.get(tokenId)) {
      return
    }

    const newSelected = new Set(selectedTokenIds)
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId)
    } else {
      newSelected.add(tokenId)
    }
    setSelectedTokenIds(newSelected)
  }

  const registeredCount = Array.from(registrationStatus.values()).filter(Boolean).length
  const availableCount = walletNFTs.length - registeredCount

  return (
    <div className="space-y-8">
      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {walletNFTs.map((tokenId) => {
          const isRegistered = registrationStatus.get(tokenId) || false
          const isSelected = selectedTokenIds.has(tokenId)

          return (
            <div
              key={tokenId}
              className={`
                group relative overflow-hidden rounded-2xl transition-all duration-300 transform
                ${isRegistered
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/30 cursor-not-allowed'
                  : isSelected
                  ? 'bg-foreground/5 border-2 border-foreground cursor-pointer scale-105 shadow-xl'
                  : 'bg-card border-2 border-border cursor-pointer hover:border-foreground/30 hover:scale-105 hover:shadow-lg'
                }
              `}
              onClick={() => handleTokenSelect(tokenId)}
            >
              {/* NFT Image Area */}
              <div className="aspect-square relative overflow-hidden">
                {/* Background */}
                <div className={`absolute inset-0 ${
                  isRegistered
                    ? 'bg-gradient-to-br from-amber-100/50 to-amber-200/50 dark:from-amber-900/30 dark:to-amber-800/30'
                    : isSelected
                    ? 'bg-gradient-to-br from-foreground/10 to-foreground/5'
                    : 'bg-gradient-to-br from-muted/50 to-muted/30'
                }`} />

                {/* Token ID */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-4xl font-black ${
                      isRegistered ? 'text-amber-800 dark:text-amber-200' : isSelected ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      #{tokenId}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">
                      Kiftables
                    </div>
                  </div>
                </div>

                {/* Registration Overlay */}
                {isRegistered && (
                  <div className="absolute inset-0 bg-amber-100/30 dark:bg-amber-900/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-amber-800 dark:bg-amber-200 text-amber-50 dark:text-amber-900 px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm shadow-lg">
                      <CheckCircle size={16} />
                      REGISTERED
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && !isRegistered && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-foreground text-background w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                {!isRegistered && (
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-300" />
                )}
              </div>

              {/* Card Footer */}
              <div className="p-6">
                <h3 className="font-bold text-foreground text-lg mb-1">
                  MockKiftables #{tokenId}
                </h3>
                <p className={`text-sm font-medium ${
                  isRegistered
                    ? 'text-amber-800 dark:text-amber-200'
                    : isSelected
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}>
                  {isRegistered
                    ? '✓ Already Registered'
                    : isSelected
                    ? '● Selected for Registration'
                    : 'Click to Select'
                  }
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Registration Action */}
      {availableCount > 0 && (
        <div className="flex justify-end mt-6">
          <div className="text-right">
            {selectedTokenIds.size > 0 ? (
              <>
                <RegisterButton
                  tokenIds={Array.from(selectedTokenIds)}
                  onSuccess={() => {
                    setSelectedTokenIds(new Set())
                    window.location.reload()
                  }}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTokenIds.size} NFT{selectedTokenIds.size !== 1 ? 's' : ''} selected
                </p>
              </>
            ) : (
              <RegisterButton
                tokenIds={[]}
                onSuccess={() => {}}
                disabled={true}
              />
            )}
          </div>
        </div>
      )}

      {/* All Registered State */}
      {availableCount === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-amber-800 dark:text-amber-200" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            All NFTs Registered
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Congratulations! All your NFTs have been successfully registered for the dissolution process.
          </p>
        </div>
      )}
    </div>
  )
}