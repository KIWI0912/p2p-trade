// src/app/api/orders/revoke/route.ts
// POST /api/orders/revoke
// 撤销私密分享链接（仅创建者）

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { revokeShareToken } from '@/lib/orders'

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
    const { orderId } = body
    if (!orderId) {
      return NextResponse.json({ error: '缺少 orderId' }, { status: 400 })
    }

    await revokeShareToken(orderId, session.userId)

    return NextResponse.json({ success: true, message: '分享链接已撤销' })
  } catch (err: any) {
    console.error('/api/orders/revoke error', err)
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: '未找到订单' }, { status: 404 })
    }
    return NextResponse.json({ error: '内部错误' }, { status: 500 })
  }
}
