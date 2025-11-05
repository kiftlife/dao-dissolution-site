'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { CONTRACTS, DISSOLUTION_ABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { Loader2, CheckCircle, XCircle, Send } from 'lucide-react'
import { useTransactionContext, useTransactionMonitor } from '@/contexts/TransactionContext'
import { toast } from 'sonner'

interface RegisterButtonProps {
  tokenIds: number[]
  onSuccess: () => void
  onRefresh?: () => void
  disabled?: boolean
}

export function RegisterButton({ tokenIds, onSuccess, onRefresh, disabled = false }: RegisterButtonProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const { addPendingTransaction } = useTransactionContext()

  // Get ETH per NFT rate
  const { data: ethPerNFT } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'ethPerNFT',
  })

  // Register NFTs transaction
  const {
    data: txHash,
    isPending: isWriting,
    writeContract: registerNFTs,
    error: writeError,
  } = useWriteContract()

  // Monitor transaction status
  const { isLoading: isWaiting, isSuccess } = useTransactionMonitor(
    txHash,
    () => {
      // On success callback
      toast.success(`Successfully registered ${tokenIds.length} NFT${tokenIds.length > 1 ? 's' : ''}!`)
      onRefresh?.() // Refresh the NFT data
      onSuccess()
    },
    () => {
      // On error callback
      toast.error('Registration failed. Please try again.')
    }
  )

  const handleRegister = async () => {
    setIsRegistering(true)
    try {
      registerNFTs({
        address: CONTRACTS.dissolution as `0x${string}`,
        abi: DISSOLUTION_ABI,
        functionName: 'registerNFTs',
        args: [tokenIds.map(id => BigInt(id))],
      })
    } catch (error) {
      console.error('Registration failed:', error)
      setIsRegistering(false)
      toast.error('Failed to submit transaction. Please try again.')
    }
  }

  // Handle transaction hash
  useEffect(() => {
    if (txHash) {
      addPendingTransaction(txHash, tokenIds)
      toast.info('Transaction submitted! Waiting for confirmation...')
    }
  }, [txHash, tokenIds, addPendingTransaction])

  // Handle success with useEffect to avoid setState in render
  useEffect(() => {
    if (isSuccess && isRegistering) {
      setIsRegistering(false)
    }
  }, [isSuccess, isRegistering])

  const estimatedETH = ethPerNFT ? Number(formatEther(ethPerNFT * BigInt(tokenIds.length))) : 0

  return (
    <button
      onClick={handleRegister}
      disabled={disabled || isWriting || isWaiting || tokenIds.length === 0}
      className={`
        kift-button
        flex items-center gap-2
        ${
          disabled || isWriting || isWaiting || tokenIds.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : ''
        }
      `}
    >
      {isWriting || isWaiting ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          {isWriting ? 'Confirming...' : 'Processing...'}
        </>
      ) : isSuccess ? (
        <>
          <CheckCircle size={20} />
          Registered!
        </>
      ) : (
        <>
          <Send size={20} />
          Register Selected NFTs
        </>
      )}
    </button>
  )
}