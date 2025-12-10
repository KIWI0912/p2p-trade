// src/app/api/auth/nonce/route.ts
// GET /api/auth/nonce?address=0x...
// 返回 SIWE nonce

import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserByWallet, generateNonce } from '@/lib/users'

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address')

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address' },
        { status: 400 }
      )
    }

    // 获取或创建用户
    const user = await getOrCreateUserByWallet(address)

    // 生成并保存 nonce
    const nonce = await generateNonce(address)

    return NextResponse.json({
      nonce,
      userId: user.id,
      address: user.walletAddress,
    })
  } catch (error) {
    console.error('Error in /api/auth/nonce:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
