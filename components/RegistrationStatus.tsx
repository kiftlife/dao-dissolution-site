'use client'

import { useReadContract, useAccount } from 'wagmi'
import { CONTRACTS, DISSOLUTION_ABI } from '@/lib/contracts'
import { formatEther } from 'viem'
import { Clock, Users, Coins, CheckCircle, XCircle } from 'lucide-react'

export function RegistrationStatus() {
  const { isConnected } = useAccount()
  const { data: info, isLoading } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'getRedemptionInfo',
  })

  const { data: timeLeft } = useReadContract({
    address: CONTRACTS.dissolution as `0x${string}`,
    abi: DISSOLUTION_ABI,
    functionName: 'timeUntilRegistrationsClose',
  })

  // Hide the component when no wallet is connected
  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Contract not deployed or not connected</p>
      </div>
    )
  }

  const [startTime, endTime, totalEth, nftsRegistered, ethPerNft, rateCalculated, registrationsOpen, airdropStarted] = info

  const formatTime = (seconds: bigint) => {
    const days = Number(seconds) / 86400
    const hours = (Number(seconds) % 86400) / 3600
    const mins = (Number(seconds) % 3600) / 60

    if (days > 1) return `${Math.floor(days)} days`
    if (hours > 1) return `${Math.floor(hours)} hours`
    return `${Math.floor(mins)} minutes`
  }

  const getStatusColor = () => {
    if (registrationsOpen) return 'text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30'
    if (airdropStarted) return 'text-foreground bg-muted/50 border-border'
    if (rateCalculated) return 'text-muted-foreground bg-muted/30 border-border'
    return 'text-muted-foreground bg-muted/30 border-border'
  }

  const getStatusText = () => {
    if (registrationsOpen) return 'Registration Open'
    if (airdropStarted) return 'Airdrop Available'
    if (rateCalculated) return 'Registration Closed'
    return 'Not Started'
  }

  const hasNotStarted = !registrationsOpen && !airdropStarted && !rateCalculated

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Registration Status</h2>
        <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border ${getStatusColor()}`}>
          {registrationsOpen ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {getStatusText()}
        </span>
      </div>

      {/* Show special message when not started */}
      {hasNotStarted ? (
        <div className="bg-muted/20 border border-border rounded-xl p-8 text-center">
          <Clock size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold text-foreground mb-2">Registration Has Not Started</h3>
          <p className="text-muted-foreground">
            The registration period will begin soon. Please check back later or follow official announcements for the start date.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock size={16} />
                <span className="text-sm">Time Remaining</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {registrationsOpen && timeLeft ? formatTime(timeLeft as bigint) : 'N/A'}
              </p>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users size={16} />
                <span className="text-sm">NFTs Registered</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {Number(nftsRegistered).toLocaleString()}
              </p>
            </div>
          </div>

          {registrationsOpen && (
            <div className="mt-4 p-4 bg-muted/20 border border-border rounded-xl">
              <p className="text-sm text-muted-foreground">
                Registration period is active! Register your NFTs below before the deadline.
              </p>
            </div>
          )}

          {airdropStarted && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Registration period has ended. Thank you for participating!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}