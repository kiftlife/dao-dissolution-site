import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { CONTRACTS, DISSOLUTION_ABI } from '@/lib/contracts'

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tokenId = searchParams.get('tokenId')

  if (!tokenId) {
    return NextResponse.json({ error: 'Missing tokenId' }, { status: 400 })
  }

  // If dissolution contract is not deployed yet, return false
  if (CONTRACTS.dissolution === '0x0000000000000000000000000000000000000000') {
    return NextResponse.json({ isRedeemed: false, tokenId: Number(tokenId) })
  }

  try {
    const isRedeemed = await client.readContract({
      address: CONTRACTS.dissolution as `0x${string}`,
      abi: DISSOLUTION_ABI,
      functionName: 'isTokenRedeemed',
      args: [BigInt(tokenId)],
    })

    return NextResponse.json({ isRedeemed: !!isRedeemed, tokenId: Number(tokenId) })
  } catch (error) {
    // Contract not deployed or other error
    return NextResponse.json({ isRedeemed: false, tokenId: Number(tokenId) })
  }
}