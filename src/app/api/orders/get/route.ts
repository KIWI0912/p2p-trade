// src/app/api/orders/get/route.ts
// GET /api/orders/get?id=123
// 获取订单详情

import { NextRequest, NextResponse } from 'next/server'
import { getOrderDetail } from '@/lib/orders'
import { verifySession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('id')

    if (!orderId || isNaN(parseInt(orderId))) {
      return NextResponse.json(
        { error: 'Invalid or missing order ID' },
        { status: 400 }
      )
    }

    // 获取当前用户ID
    let currentUserId = null
    const cookieStore = cookies()
    const token = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (token) {
      const session = await verifySession(token)
      if (session) {
        currentUserId = session.userId
      }
    }

    const accessToken = request.nextUrl.searchParams.get('t')
    const order = await getOrderDetail(parseInt(orderId), accessToken, currentUserId)

    return NextResponse.json({
      order,
    })
  } catch (error: any) {
    if (error?.code === 'FORBIDDEN') {
      return NextResponse.json(
        { error: '需要正确的私密访问 token' },
        { status: 403 }
      )
    }
    if (error?.code === 'REVOKED') {
      return NextResponse.json(
        { error: '分享链接已被撤销' },
        { status: 410 }
      )
    }
    if (error?.code === 'EXPIRED') {
      return NextResponse.json(
        { error: '分享链接已过期' },
        { status: 410 }
      )
    }
    if (error?.code === 'P2025') {
      // Prisma "not found" error
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    console.error('Error in /api/orders/get:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}