import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { alchemy, KIFTABLES_CONTRACT_ADDRESS } from '@/lib/alchemy'
import { OwnedNft } from 'alchemy-sdk'

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
        // Fetch NFTs for the user from the Kiftables contract
        const response = await alchemy.nft.getNftsForOwner(address, {
          contractAddresses: [KIFTABLES_CONTRACT_ADDRESS],
          withMetadata: true,
          excludeFilters: [], // Don't exclude any NFTs
          includeFilters: [], // Include all NFTs
        })

        console.log('Alchemy response:', response)
        console.log('Total NFTs found:', response.ownedNfts.length)

        // Debug first NFT
        if (response.ownedNfts.length > 0) {
          const firstNft = response.ownedNfts[0]
          console.log('First NFT raw data:', firstNft)
          console.log('First NFT metadata:', firstNft.metadata)
          console.log('First NFT tokenUri:', firstNft.tokenUri)
        }

        // Process NFTs and try to get fresh metadata for each one
        const kiftablesNFTs: KiftablesNFT[] = []

        for (const nft of response.ownedNfts) {
          if (nft.contract.address.toLowerCase() !== KIFTABLES_CONTRACT_ADDRESS.toLowerCase()) {
            continue
          }

          const tokenId = parseInt(nft.tokenId)

          try {
            // Try to get fresh metadata for each NFT
            console.log(`Fetching fresh metadata for token #${tokenId}`)
            const nftMetadata = await alchemy.nft.getNftMetadata(
              KIFTABLES_CONTRACT_ADDRESS,
              tokenId,
              { refreshCache: true }
            )

            console.log(`Token #${tokenId} fresh metadata response:`, nftMetadata)

            // Extract data from the fresh metadata response
            let name = nftMetadata.name || nftMetadata.metadata?.name || `Kiftables #${tokenId}`
            let description = nftMetadata.description || nftMetadata.metadata?.description || ''
            let image = ''

            // Try multiple image sources from Alchemy response
            if (nftMetadata.image?.originalUrl) {
              image = nftMetadata.image.originalUrl
            } else if (nftMetadata.image?.cachedUrl) {
              image = nftMetadata.image.cachedUrl
            } else if (nftMetadata.metadata?.image) {
              image = nftMetadata.metadata.image
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

            // Fallback to basic data
            kiftablesNFTs.push({
              tokenId,
              name: `Kiftables #${tokenId}`,
              description: '',
              image: '',
              revealed: false,
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
        const response = await alchemy.nft.getNftsForOwner(address, {
          contractAddresses: [KIFTABLES_CONTRACT_ADDRESS],
          withMetadata: true,
        })

        const kiftablesNFTs: KiftablesNFT[] = response.ownedNfts
          .filter((nft: OwnedNft) => nft.contract.address.toLowerCase() === KIFTABLES_CONTRACT_ADDRESS.toLowerCase())
          .map((nft: OwnedNft) => {
            const tokenId = parseInt(nft.tokenId)
            const metadata = nft.metadata
            let name = metadata?.name || `Kiftables #${tokenId}`
            let description = metadata?.description || ''
            let image = metadata?.image || ''

            if (image && image.includes('ipfs://')) {
              const imageId = image.replace('ipfs://', '')
              image = `https://cloudflare-ipfs.com/ipfs/${imageId}`
            }

            const revealed = !!(metadata?.name && metadata?.description && metadata?.image)

            return {
              tokenId,
              name,
              description,
              image,
              revealed,
            }
          })
          .sort((a, b) => a.tokenId - b.tokenId)

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