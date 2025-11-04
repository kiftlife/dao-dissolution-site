'use server'

import { Alchemy, Network, NftOrdering } from 'alchemy-sdk'

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY, // Server-side only
  network: Network.ETH_MAINNET,
})

export async function fetchNFTsForOwner(owner: string, contractAddress: string) {
  try {
    const nfts = await alchemy.nft.getNftsForOwner(owner, {
      contractAddresses: [contractAddress],
      omitMetadata: false,
      orderBy: NftOrdering.TRANSFERTIME,
    })

    // Convert to plain object for serialization
    return {
      ownedNfts: nfts.ownedNfts.map(nft => ({
        tokenId: nft.tokenId,
        tokenType: nft.tokenType as string,
        name: nft.name || undefined,
        description: nft.description || undefined,
        image: nft.image?.originalUrl || nft.image?.cachedUrl || nft.raw?.metadata?.image || undefined,
        raw: nft.raw,
      })),
      totalCount: nfts.totalCount,
    }
  } catch (error) {
    console.error('Failed to fetch NFTs:', error)
    throw new Error('Failed to fetch NFTs')
  }
}

export async function fetchNFTMetadata(contractAddress: string, tokenId: string) {
  try {
    const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId, {
      refreshCache: true,
    })

    // Convert to plain object for serialization
    return {
      tokenId: metadata.tokenId,
      tokenType: metadata.tokenType as string,
      name: metadata.name || undefined,
      description: metadata.description || undefined,
      image: metadata.image?.originalUrl || metadata.image?.cachedUrl || metadata.raw?.metadata?.image || undefined,
      raw: metadata.raw,
    }
  } catch (error) {
    console.error('Failed to fetch NFT metadata:', error)
    throw new Error('Failed to fetch NFT metadata')
  }
}