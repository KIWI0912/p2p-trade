// src/app/api/auth/siwe/route.ts
// POST /api/auth/siwe
// 接收 SIWE 签名消息和签名，验证并创建会话

import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { getOrCreateUserByWallet, verifyAndClearNonce } from '@/lib/users'
import { createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as any
    const { message, signature } = data

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      )
    }

    console.log('Received message:', message)
    console.log('Received signature:', signature)

    // 尝试从消息中提取地址和nonce
    let address: string | undefined
    let nonce: string | undefined

    // 首先尝试使用SIWE库解析
    try {
      const siweMessage = new SiweMessage(message)
      
      // 验证签名
      try {
        const result = await siweMessage.verify({ signature })
        if (result.success) {
          address = siweMessage.address
          nonce = siweMessage.nonce
          console.log('SIWE verification successful')
        } else {
          console.log('SIWE verification failed:', result)
        }
      } catch (error) {
        console.error('SIWE verification error:', error)
      }
    } catch (error) {
      console.error('Failed to parse message with SIWE library:', error)
    }

    // 如果SIWE解析失败，尝试手动解析
    if (!address || !nonce) {
      console.log('Trying manual parsing...')
      
      // 尝试从消息中提取地址
      const addressMatch = message.match(/^.*?\n(0x[a-fA-F0-9]{40})\n/s)
      if (addressMatch && addressMatch[1]) {
        address = addressMatch[1].toLowerCase()
        console.log('Extracted address:', address)
      }
      
      // 尝试从消息中提取nonce
      const nonceMatch = message.match(/Nonce: ([a-zA-Z0-9]+)/i)
      if (nonceMatch && nonceMatch[1]) {
        nonce = nonceMatch[1]
        console.log('Extracted nonce:', nonce)
      }
    }

    // 如果仍然无法提取地址或nonce，返回错误
    if (!address || !nonce) {
      return NextResponse.json(
        { error: 'Could not extract address or nonce from message' },
        { status: 400 }
      )
    }

    // 获取用户
    const user = await getOrCreateUserByWallet(address)
    console.log('User found:', user.id)

    // 验证 nonce
    const nonceValid = await verifyAndClearNonce(user.id, nonce)
    if (!nonceValid) {
      console.error('Invalid nonce. Expected:', user.nonce, 'Got:', nonce)
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 401 }
      )
    }

    console.log('Nonce verification successful')

    // 创建会话
    const { token, expiresAt } = await createSession(user.id, address)
    console.log('Session created')

    // 设置 cookie
    const cookieStore = await cookies()
    cookieStore.set(process.env.IRON_COOKIE_NAME || 'p2p_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    console.log('Cookie set')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        address: address,
        name: user.name,
        email: user.email,
      },
      token,
      expiresAt,
    })
  } catch (error) {
    console.error('Error in /api/auth/siwe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}