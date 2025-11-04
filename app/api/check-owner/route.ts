import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { CONTRACTS, KIFTABLES_ABI } from '@/lib/contracts'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tokenId = searchParams.get('tokenId')
  const owner = searchParams.get('owner')

  if (!tokenId || !owner) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const tokenOwner = await client.readContract({
      address: CONTRACTS.kiftables as `0x${string}`,
      abi: KIFTABLES_ABI,
      functionName: 'ownerOf',
      args: [BigInt(tokenId)],
    })

    const isOwner = tokenOwner?.toLowerCase() === owner.toLowerCase()

    return NextResponse.json({ isOwner, tokenId: Number(tokenId) })
  } catch (error) {
    // Token doesn't exist or other error
    return NextResponse.json({ isOwner: false, tokenId: Number(tokenId) })
  }
}