'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'
import { RegisterButton } from './RegisterButton'
import { CONTRACTS, DISSOLUTION_ABI } from '@/lib/contracts'
import { CheckCircle, Clock, Sparkles, Loader2, XCircle } from 'lucide-react'
import { useKiftablesNFTs } from '@/hooks/useKiftablesNFTs'
import { IPFSImage } from './IPFSImage'
import { toast } from 'sonner'
import { useTransactionContext } from '@/contexts/TransactionContext'

export function NFTGrid() {
  const { address, isConnected } = useAccount()
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<number>>(new Set())
  const [registrationStatus, setRegistrationStatus] = useState<Map<number, boolean>>(new Map())
  const { isPendingToken } = useTransactionContext()

  console.log('NFTGrid: isConnected:', isConnected, 'address:', address)

  // Use Alchemy to fetch Kiftables NFTs
  const { nfts, isLoading: nftsLoading, error: nftsError, refetch } = useKiftablesNFTs()

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

  // Get user's registered token IDs from the dissolution contract
  const { data: userRegisteredTokenIds, refetch: refetchRegisteredTokens } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'getUserTokenIds',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Watch for NFTsRegistered events to auto-refresh
  useWatchContractEvent({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    eventName: 'NFTsRegistered',
    onLogs(logs) {
      const userLogs = logs.filter((log: any) =>
        log.args?.user?.toLowerCase() === address?.toLowerCase()
      )
      if (userLogs.length > 0) {
        console.log('NFTsRegistered event detected, refreshing...')
        refetchRegisteredTokens()
        refetch() // Refresh NFTs too
      }
    },
  })

  // Get redemption info to check if registrations are open
  const { data: redemptionInfo } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'getRedemptionInfo',
    query: { enabled: true },
  })

  const isRegistrationOpen = redemptionInfo?.[6] || false // registrationsOpen is the 7th element (index 6)

  console.log('NFTGrid: nfts:', nfts, 'loading:', nftsLoading, 'error:', nftsError)
  console.log('NFTGrid: redemptionInfo:', redemptionInfo, 'isRegistrationOpen:', isRegistrationOpen)

  // Update registration status when data changes
  useEffect(() => {
    const statusMap = new Map<number, boolean>()
    const userTokenIds = nfts.map(nft => nft.tokenId)

    // Mark all user NFTs as not registered by default
    userTokenIds.forEach(tokenId => {
      statusMap.set(tokenId, false)
    })

    // Mark registered ones as true
    if (userRegisteredTokenIds) {
      userRegisteredTokenIds.forEach((tokenId: bigint) => {
        const id = Number(tokenId)
        if (userTokenIds.includes(id)) {
          statusMap.set(id, true)
        }
      })
    }

    setRegistrationStatus(statusMap)
  }, [userRegisteredTokenIds, nfts])

  const handleTokenSelect = (tokenId: number) => {
    // Show toast if registration is closed
    if (!isRegistrationOpen) {
      toast.info("Registration will be available soon! Check back when the registration period opens.")
      return
    }

    // Don't allow selecting already registered NFTs
    if (registrationStatus.get(tokenId)) {
      toast.warning(`Kiftable #${tokenId} is already registered for dissolution.`)
      return
    }

    const newSelected = new Set(selectedTokenIds)
    if (newSelected.has(tokenId)) {
      newSelected.delete(tokenId)
      toast.success(`Removed Kiftable #${tokenId} from selection.`)
    } else {
      newSelected.add(tokenId)
      toast.success(`Added Kiftable #${tokenId}. Submit your NFTs below!`)
    }
    setSelectedTokenIds(newSelected)
  }

  const registeredCount = Array.from(registrationStatus.values()).filter(Boolean).length
  const availableCount = nfts.length - registeredCount

  // Loading state
  if (nftsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Loading NFTs...</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Fetching your Kiftables NFTs
        </p>
      </div>
    )
  }

  // Error state
  if (nftsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Error Loading NFTs</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Could not fetch NFTs from Alchemy. Please check your connection and try again.
        </p>
        <div className="bg-muted/30 border border-border rounded-xl p-4 w-full max-w-2xl">
          <p className="text-sm font-medium text-foreground mb-2">Error details:</p>
          <code className="text-xs font-mono bg-background px-3 py-2 rounded-lg block text-muted-foreground break-all">
            {nftsError}
          </code>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No NFTs state
  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No NFTs Found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          This wallet doesn't contain any Kiftables NFTs
        </p>
        <div className="bg-muted/30 border border-border rounded-xl p-4 w-full max-w-2xl">
          <p className="text-sm font-medium text-foreground mb-2">Current wallet:</p>
          <code className="text-xs font-mono bg-background px-3 py-2 rounded-lg block text-muted-foreground break-all">
            {address}
          </code>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft) => {
          const isRegistered = registrationStatus.get(nft.tokenId) || false
          const isSelected = selectedTokenIds.has(nft.tokenId)
          const isPending = isPendingToken(nft.tokenId)

          return (
            <div
              key={nft.tokenId}
              className={`
                group relative overflow-hidden rounded-2xl transition-all duration-300 transform
                ${isPending
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700/50 cursor-wait opacity-75 animate-pulse'
                  : isRegistered
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/30 cursor-not-allowed'
                  : !isRegistrationOpen
                  ? 'bg-muted/30 border-2 border-muted/50 cursor-pointer opacity-60 hover:opacity-80'
                  : isSelected
                  ? 'bg-foreground/5 border-2 border-foreground cursor-pointer scale-105 shadow-xl'
                  : 'bg-card border-2 border-border cursor-pointer hover:border-foreground/30 hover:scale-105 hover:shadow-lg'
                }
              `}
              onClick={() => !isPending && handleTokenSelect(nft.tokenId)}
            >
              {/* NFT Image Area */}
              <div className="aspect-square relative overflow-hidden">
                {/* NFT Image or Placeholder */}
                {nft.image && nft.revealed ? (
                  <IPFSImage
                    src={nft.image}
                    alt={nft.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className={`absolute inset-0 ${
                    isRegistered
                      ? 'bg-gradient-to-br from-amber-100/50 to-amber-200/50 dark:from-amber-900/30 dark:to-amber-800/30'
                      : isSelected
                      ? 'bg-gradient-to-br from-foreground/10 to-foreground/5'
                      : 'bg-gradient-to-br from-muted/50 to-muted/30'
                  }`} />
                )}

                {/* Token ID Overlay (for unrevealed or as overlay) */}
                {(!nft.revealed || !nft.image) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="text-center">
                      <div className={`text-4xl font-black ${
                        isRegistered ? 'text-amber-800 dark:text-amber-200' : isSelected ? 'text-foreground' : 'text-white'
                      }`}>
                        #{nft.tokenId}
                      </div>
                      <div className="text-sm font-medium text-white mt-1">
                        Kiftables
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Transaction Overlay */}
                {isPending && !isRegistered && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold text-sm shadow-lg animate-pulse">
                      <Loader2 size={16} className="animate-spin" />
                      PENDING...
                    </div>
                  </div>
                )}

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
                  {nft.revealed ? nft.name : `Kiftables #${nft.tokenId}`}
                </h3>
                {isRegistered && (
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    ✓ Already Registered
                  </p>
                )}
                {!isRegistered && isRegistrationOpen && isSelected && (
                  <p className="text-sm font-medium text-foreground">
                    ● Selected for Registration
                  </p>
                )}
                {!isRegistered && isRegistrationOpen && !isSelected && (
                  <p className="text-sm font-medium text-muted-foreground">
                    Click to Select
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Registration Action */}
      {availableCount > 0 && (
        <div className="flex justify-end mt-6">
          <div className="text-right">
            {!isRegistrationOpen && (
              <div className="mb-4 p-4 bg-muted/30 border border-muted/50 rounded-xl">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Registration Period Closed
                </p>
                <p className="text-xs text-muted-foreground">
                  NFT registration is not currently available. Please check back when the registration period opens.
                </p>
              </div>
            )}
            {selectedTokenIds.size > 0 ? (
              <>
                <RegisterButton
                  tokenIds={Array.from(selectedTokenIds)}
                  onSuccess={() => {
                    setSelectedTokenIds(new Set())
                  }}
                  onRefresh={() => {
                    refetchRegisteredTokens()
                    refetch()
                  }}
                  disabled={!isRegistrationOpen}
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