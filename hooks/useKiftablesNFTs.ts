import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { CONTRACTS } from '@/lib/contracts'
import { fetchNFTsForOwner, fetchNFTMetadata } from '@/app/actions/alchemy'

const KIFTABLES_CONTRACT_ADDRESS = CONTRACTS.kiftables

export interface KiftablesNFT {
  tokenId: number
  name: string
  description: string
  image: string
  revealed: boolean
}

export function useKiftablesNFTs() {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<KiftablesNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('useKiftablesNFTs: address changed:', address)
    if (!address) {
      console.log('useKiftablesNFTs: No address, clearing NFTs')
      setNfts([])
      return
    }

    const fetchNFTs = async () => {
      console.log('useKiftablesNFTs: Starting fetch for address:', address)
      setIsLoading(true)
      setError(null)

      try {
        // Use server action to fetch NFTs
        const response = await fetchNFTsForOwner(address, KIFTABLES_CONTRACT_ADDRESS)

        console.log('Server action response:', response)
        console.log('Total NFTs found:', response.ownedNfts.length)

        // Debug first NFT
        if (response.ownedNfts.length > 0) {
          const firstNft = response.ownedNfts[0]
          console.log('First NFT data:', firstNft)
        }

        // Process NFTs and try to get fresh metadata for each one
        const kiftablesNFTs: KiftablesNFT[] = []

        for (const nft of response.ownedNfts) {
          const tokenId = parseInt(nft.tokenId)

          try {
            // Try to get fresh metadata for each NFT using server action
            console.log(`Fetching fresh metadata for token #${tokenId}`)
            const nftMetadata = await fetchNFTMetadata(KIFTABLES_CONTRACT_ADDRESS, tokenId.toString())

            console.log(`Token #${tokenId} fresh metadata response:`, nftMetadata)

            // Extract data from the fresh metadata response
            let name = nftMetadata.name || `Kiftables #${tokenId}`
            let description = nftMetadata.description || ''
            let image = ''

            // Try multiple image sources
            if (nftMetadata.image?.originalUrl) {
              image = nftMetadata.image.originalUrl
            } else if (nftMetadata.image?.cachedUrl) {
              image = nftMetadata.image.cachedUrl
            } else if (typeof nftMetadata.image === 'string') {
              image = nftMetadata.image
            } else if (nftMetadata.raw?.metadata?.image) {
              image = nftMetadata.raw.metadata.image
            }

            console.log(`Token #${tokenId} - name: ${name}, description: ${description}, image: ${image}`)

            // Handle IPFS images with multiple gateway fallbacks
            if (image && image.includes('ipfs://')) {
              const imageId = image.replace('ipfs://', '')
              image = `https://cloudflare-ipfs.com/ipfs/${imageId}`
              console.log(`Token #${tokenId} processed IPFS image: ${image}`)
            }

            // Determine if NFT is revealed based on metadata presence
            const revealed = !!(name && description && image)

            kiftablesNFTs.push({
              tokenId,
              name,
              description,
              image,
              revealed,
            })
          } catch (metadataError) {
            console.log(`Failed to get metadata for token #${tokenId}:`, metadataError)

            // Fallback to basic data from initial response
            const name = nft.name || `Kiftables #${tokenId}`
            const description = nft.description || ''
            let image = nft.image || ''

            if (image && image.includes('ipfs://')) {
              const imageId = image.replace('ipfs://', '')
              image = `https://cloudflare-ipfs.com/ipfs/${imageId}`
            }

            const revealed = !!(name && description && image)

            kiftablesNFTs.push({
              tokenId,
              name,
              description,
              image,
              revealed,
            })
          }
        }

        kiftablesNFTs.sort((a, b) => a.tokenId - b.tokenId)

        setNfts(kiftablesNFTs)
      } catch (err) {
        console.error('Error fetching Kiftables NFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNFTs()
  }, [address])

  const refetch = async () => {
    if (address) {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchNFTsForOwner(address, KIFTABLES_CONTRACT_ADDRESS)

        const kiftablesNFTs: KiftablesNFT[] = response.ownedNfts
          .map((nft: any) => {
            const tokenId = parseInt(nft.tokenId)
            const name = nft.name || `Kiftables #${tokenId}`
            const description = nft.description || ''
            let image = nft.image || ''

            if (image && image.includes('ipfs://')) {
              const imageId = image.replace('ipfs://', '')
              image = `https://cloudflare-ipfs.com/ipfs/${imageId}`
            }

            const revealed = !!(name && description && image)

            return {
              tokenId,
              name,
              description,
              image,
              revealed,
            }
          })
          .sort((a: KiftablesNFT, b: KiftablesNFT) => a.tokenId - b.tokenId)

        setNfts(kiftablesNFTs)
      } catch (err) {
        console.error('Error refetching Kiftables NFTs:', err)
        setError(err instanceof Error ? err.message : 'Failed to refetch NFTs')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return {
    nfts,
    isLoading,
    error,
    refetch,
  }
}