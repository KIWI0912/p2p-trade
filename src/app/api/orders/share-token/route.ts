// src/app/api/orders/share-token/route.ts
// POST /api/orders/share-token
// 生成或更新分享链接令牌（仅创建者可用）

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { generateShareToken } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ error: '无效或过期的会话' }, { status: 401 })
    }

    const body = await request.json() as any
    const { orderId, expiryDays } = body
    
    if (!orderId) {
      return NextResponse.json({ error: '缺少 orderId' }, { status: 400 })
    }

    const updatedOrder = await generateShareToken(orderId, session.userId, expiryDays)

    return NextResponse.json({
      orderId: updatedOrder.id,
      shareToken: updatedOrder.shareToken,
      shareTokenExpiresAt: updatedOrder.shareTokenExpiresAt,
    })
  } catch (err: any) {
    console.error('/api/orders/share-token error', err)
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: '未找到订单' }, { status: 404 })
    }
    if (err.message?.includes('Only creator')) {
      return NextResponse.json({ error: '只有订单创建者可以生成分享链接' }, { status: 403 })
    }
    return NextResponse.json({ error: err.message || '内部错误' }, { status: 500 })
  }
}
