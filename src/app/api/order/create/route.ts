// src/app/api/order/create/route.ts
// POST /api/order/create
// 创建新订单

import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { createOrder } from '@/lib/orders'
import { TradeDirection } from '@/lib/types'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('Received request to create order'); // Log request start

    // 验证认证
    const cookieStore = await cookies()
    const token = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (!token) {
      console.warn('No authentication token found'); // Log missing token
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await verifySession(token)
    if (!session) {
      console.warn('Invalid or expired session'); // Log invalid session
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const body = await request.json() as any
    const {
      title,
      description,
      direction,
      offeringItems,
      requestingItems,
      isPrivate,
      expiryDays,
    } = body

    console.log('Request body:', body); // Log request body

    // 验证必填字段
    if (!title || !direction) {
      console.warn('Missing required fields: title, direction'); // Log missing fields
      return NextResponse.json(
        { error: '缺少必填字段：标题、方向' },
        { status: 400 }
      )
    }

    // 验证 direction
    if (!Object.values(TradeDirection).includes(direction)) {
      console.warn('Invalid trade direction:', direction); // Log invalid direction
      return NextResponse.json(
        { error: '无效的交易方向' },
        { status: 400 }
      )
    }

    // 验证 expiryDays（如果提供）
    if (typeof expiryDays === 'number' && expiryDays < 0) {
      console.warn('Invalid expiryDays:', expiryDays); // Log invalid expiryDays
      return NextResponse.json(
        { error: '过期天数必须为非负数' },
        { status: 400 }
      )
    }

    // 验证物品列表
    if (!offeringItems || offeringItems.length === 0 || !requestingItems || requestingItems.length === 0) {
      console.warn('Offering and requesting items cannot be empty'); // Log empty items
      return NextResponse.json(
        { error: '提供和需求物品不能为空' },
        { status: 400 }
      )
    }

    // 创建订单
    const order = await createOrder({
      title,
      description,
      creatorId: session.userId,
      direction,
      isPrivate: !!isPrivate,
      expiryDays: typeof expiryDays === 'number' ? expiryDays : null,
      offeringItems: offeringItems || [],
      requestingItems: requestingItems || [],
    })

    console.log('Order created successfully:', order); // Log success

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error: any) {
    console.error('Error in /api/order/create:', error); // Log error details
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '订单创建失败，可能有重复数据' },
        { status: 400 }
      )
    }
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: '未找到订单' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    )
  }
}