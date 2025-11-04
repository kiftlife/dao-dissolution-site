'use client'

import { useState, useEffect } from 'react'
import { Check, Square, CheckSquare } from 'lucide-react'
import Image from 'next/image'

interface NFTCardProps {
  tokenId: number
  isRegistered: boolean
  isSelected: boolean
  onToggle: (tokenId: number) => void
  metadata?: {
    name: string
    image: string
    description?: string
  }
}

export function NFTCard({ tokenId, isRegistered, isSelected, onToggle, metadata }: NFTCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    if (!isRegistered) {
      onToggle(tokenId)
    }
  }

  const getImageSrc = () => {
    if (imageError || !metadata?.image) {
      return `https://via.placeholder.com/300x300/1a1a1a/666?text=Kiftables+%23${tokenId}`
    }

    // Convert IPFS URLs to HTTP gateway
    if (metadata.image.startsWith('ipfs://')) {
      return metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
    }
    return metadata.image
  }

  return (
    <div
      onClick={handleClick}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden
        transition-all duration-300 transform hover:scale-105
        ${isRegistered ? 'opacity-60 cursor-not-allowed' : ''}
        ${isSelected ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50' : 'ring-1 ring-gray-700'}
      `}
    >
      {/* NFT Image */}
      <div className="aspect-square bg-gray-900 relative">
        <Image
          src={getImageSrc()}
          alt={metadata?.name || `Kiftables #${tokenId}`}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Card Info */}
      <div className="p-4 bg-gray-900/90 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">
              {metadata?.name || `Kiftables #${tokenId}`}
            </h3>
            <p className="text-sm text-gray-400">Token ID: {tokenId}</p>
          </div>

          {/* Checkbox */}
          <div className="flex items-center">
            {isRegistered ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={20} />
                <span className="text-xs">Registered</span>
              </div>
            ) : (
              <div className={`p-1 rounded transition-colors ${isSelected ? 'text-purple-400' : 'text-gray-500'}`}>
                {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {isRegistered && (
          <div className="mt-2 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400 text-center">
            Already Registered
          </div>
        )}
      </div>
    </div>
  )
}