// src/app/api/orders/accept/route.ts
// POST /api/orders/accept
// 接受订单

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { acceptOrder } from '@/lib/orders'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const body = await request.json() as any
    const { orderId } = body

    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json(
        { error: '无效或缺少订单ID' },
        { status: 400 }
      )
    }

    // 接受订单
    const order = await acceptOrder(parseInt(orderId), session.userId)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    if (error?.message?.includes('Cannot accept your own order')) {
      return NextResponse.json(
        { error: '不能接受自己的订单' },
        { status: 400 }
      )
    }
    if (error?.message?.includes('Cannot accept order in')) {
      return NextResponse.json(
        { error: '订单状态不允许接受' },
        { status: 400 }
      )
    }
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: '未找到订单' },
        { status: 404 }
      )
    }
    console.error('Error in /api/orders/accept:', error)
    return NextResponse.json(
      { error: '接受订单失败' },
      { status: 500 }
    )
  }
}
