// src/app/api/order/complete/route.ts
// POST /api/order/complete
// 完成订单

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { completeOrder } from '@/lib/orders'
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

    // 完成订单
    const order = await completeOrder(parseInt(orderId), session.userId)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    if (error?.message?.includes('Only creator or accepter')) {
      return NextResponse.json(
        { error: '只有创建者或接受者可以完成订单' },
        { status: 403 }
      )
    }
    if (error?.message?.includes('Cannot complete order in')) {
      return NextResponse.json(
        { error: '订单状态不允许完成' },
        { status: 400 }
      )
    }
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: '未找到订单' },
        { status: 404 }
      )
    }
    console.error('Error in /api/order/complete:', error)
    return NextResponse.json(
      { error: '完成订单失败' },
      { status: 500 }
    )
  }
}