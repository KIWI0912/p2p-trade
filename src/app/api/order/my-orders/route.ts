// src/app/api/order/my-orders/route.ts
// GET /api/order/my-orders?role=creator
// 获取当前用户的订单

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { getUserOrders } from '@/lib/orders'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    const role = request.nextUrl.searchParams.get('role') as 'creator' | 'accepter' | null

    const orders = await getUserOrders(session.userId, {
      role: role || undefined,
    })

    return NextResponse.json({
      orders,
      count: orders.length,
    })
  } catch (error) {
    console.error('Error in /api/order/my-orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}