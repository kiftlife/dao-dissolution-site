import { useState } from 'react'

interface IPFSImageProps {
  src: string
  alt: string
  className?: string
}

const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://kiftdao.mypinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
]

export function IPFSImage({ src, alt, className }: IPFSImageProps) {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  console.log('IPFSImage: src:', src, 'currentGatewayIndex:', currentGatewayIndex)

  // Extract IPFS hash from various formats
  const getIPFSHash = (url: string) => {
    if (url.includes('ipfs://')) {
      return url.replace('ipfs://', '')
    }
    if (url.includes('/ipfs/')) {
      return url.split('/ipfs/')[1]
    }
    return url
  }

  const handleImageError = () => {
    console.log('IPFSImage: Image error for src:', src, 'gateway:', IPFS_GATEWAYS[currentGatewayIndex])
    const nextIndex = currentGatewayIndex + 1
    if (nextIndex < IPFS_GATEWAYS.length) {
      console.log('IPFSImage: Trying next gateway:', IPFS_GATEWAYS[nextIndex])
      setCurrentGatewayIndex(nextIndex)
    } else {
      console.log('IPFSImage: All gateways failed for:', src)
      setImageError(true)
    }
  }

  if (imageError) {
    return (
      <div className={`bg-muted/50 flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    )
  }

  const ipfsHash = getIPFSHash(src)
  const imageUrl = `${IPFS_GATEWAYS[currentGatewayIndex]}${ipfsHash}`

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      crossOrigin="anonymous"
    />
  )
}