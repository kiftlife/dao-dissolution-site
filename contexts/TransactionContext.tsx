'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'

interface PendingTransaction {
  hash: `0x${string}`
  tokenIds: number[]
  timestamp: number
  status: 'pending' | 'success' | 'failed'
}

interface TransactionContextType {
  pendingTransactions: Map<`0x${string}`, PendingTransaction>
  addPendingTransaction: (hash: `0x${string}`, tokenIds: number[]) => void
  updateTransactionStatus: (hash: `0x${string}`, status: 'success' | 'failed') => void
  isPendingToken: (tokenId: number) => boolean
  clearTransaction: (hash: `0x${string}`) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [pendingTransactions, setPendingTransactions] = useState<Map<`0x${string}`, PendingTransaction>>(new Map())

  const addPendingTransaction = useCallback((hash: `0x${string}`, tokenIds: number[]) => {
    setPendingTransactions(prev => {
      const newMap = new Map(prev)
      newMap.set(hash, {
        hash,
        tokenIds,
        timestamp: Date.now(),
        status: 'pending'
      })
      return newMap
    })
  }, [])

  const updateTransactionStatus = useCallback((hash: `0x${string}`, status: 'success' | 'failed') => {
    setPendingTransactions(prev => {
      const newMap = new Map(prev)
      const tx = newMap.get(hash)
      if (tx) {
        newMap.set(hash, { ...tx, status })
      }
      return newMap
    })
  }, [])

  const clearTransaction = useCallback((hash: `0x${string}`) => {
    setPendingTransactions(prev => {
      const newMap = new Map(prev)
      newMap.delete(hash)
      return newMap
    })
  }, [])

  const isPendingToken = useCallback((tokenId: number): boolean => {
    for (const tx of Array.from(pendingTransactions.values())) {
      if (tx.status === 'pending' && tx.tokenIds.includes(tokenId)) {
        return true
      }
    }
    return false
  }, [pendingTransactions])

  return (
    <TransactionContext.Provider
      value={{
        pendingTransactions,
        addPendingTransaction,
        updateTransactionStatus,
        isPendingToken,
        clearTransaction
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactionContext() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error('useTransactionContext must be used within TransactionProvider')
  }
  return context
}

// Hook to monitor a specific transaction
export function useTransactionMonitor(hash?: `0x${string}`, onSuccess?: () => void, onError?: () => void) {
  const { updateTransactionStatus, clearTransaction } = useTransactionContext()

  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  React.useEffect(() => {
    if (hash) {
      if (isSuccess) {
        updateTransactionStatus(hash, 'success')
        onSuccess?.()
        // Clear transaction after a short delay to allow UI to update
        setTimeout(() => clearTransaction(hash), 2000)
      } else if (isError) {
        updateTransactionStatus(hash, 'failed')
        onError?.()
        // Clear failed transaction after longer delay
        setTimeout(() => clearTransaction(hash), 5000)
      }
    }
  }, [hash, isSuccess, isError, updateTransactionStatus, clearTransaction, onSuccess, onError])

  return { isLoading, isSuccess, isError }
}