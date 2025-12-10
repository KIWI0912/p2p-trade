// src/app/api/orders/list/route.ts
// GET /api/orders/list?status=PENDING&limit=20&offset=0
// 获取订单列表

import { NextRequest, NextResponse } from 'next/server'
import { listOrders } from '@/lib/orders'
import { OrderStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = (searchParams.get('status') || undefined) as OrderStatus | undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // 验证 status
    if (status && !Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: '无效的订单状态' },
        { status: 400 }
      )
    }

    // 验证 offset
    if (offset < 0) {
      return NextResponse.json(
        { error: '偏移量必须为非负数' },
        { status: 400 }
      )
    }

    const result = await listOrders({
      status,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in /api/orders/list:', error)
    return NextResponse.json(
      { error: '获取订单列表失败' },
      { status: 500 }
    )
  }
}
