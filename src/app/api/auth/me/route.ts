// src/app/api/auth/me/route.ts
// GET /api/auth/me
// 获取当前登录的用户信息

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getUserDetail } from '@/lib/users'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // 验证会话
    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // 获取用户详情
    const user = await getUserDetail(session.userId)

    return NextResponse.json({
      user: {
        id: user.id,
        address: session.walletAddress,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
