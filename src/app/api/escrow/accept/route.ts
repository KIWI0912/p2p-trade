import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/escrow/accept
 * 接受者确认交易
 * 
 * 请求体:
 * {
 *   escrowRecordId: number,
 *   txHash: string (可选，如果链上操作)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(process.env.IRON_COOKIE_NAME || 'p2p_session')?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { error: '未认证' },
        { status: 401 }
      )
    }

    const session = await verifySession(sessionCookie)
    if (!session) {
      return NextResponse.json(
        { error: '会话无效或已过期' },
        { status: 401 }
      )
    }

    const body = await request.json() as any
    const { escrowRecordId, txHash } = body

    if (!escrowRecordId) {
      return NextResponse.json(
        { error: '缺少必填字段：托管记录ID' },
        { status: 400 }
      )
    }

    // 验证 escrowRecordId 是数字
    if (typeof escrowRecordId !== 'number' || escrowRecordId < 1) {
      return NextResponse.json(
        { error: '托管记录ID必须是正整数' },
        { status: 400 }
      )
    }

    // 获取托管记录
    const escrowRecord = await prisma.escrowRecord.findUnique({
      where: { id: escrowRecordId }
    })

    if (!escrowRecord) {
      return NextResponse.json(
        { error: '托管记录不存在' },
        { status: 404 }
      )
    }

    if (escrowRecord.status !== 'FUNDED') {
      return NextResponse.json(
        { error: '托管必须是 FUNDED 状态才能接受' },
        { status: 400 }
      )
    }

    // 如果指定了接受者，验证
    if (escrowRecord.accepter && escrowRecord.accepter !== session.walletAddress) {
      return NextResponse.json(
        { error: '你不是指定的接受者' },
        { status: 403 }
      )
    }

    // 更新托管记录
    const updated = await prisma.escrowRecord.update({
      where: { id: escrowRecordId },
      data: {
        status: 'ACCEPTED',
        accepter: session.walletAddress,
        ...(txHash && { txHash })
      }
    })

    // 更新订单状态
    if (updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: {
          escrowStatus: 'ACCEPTED',
          status: 'ACCEPTED',
          accepterId: session.userId,
          acceptedAt: new Date(),
          ...(txHash && { escrowTxHash: txHash })
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: '交易已接受',
      escrowRecordId
    })
  } catch (error: any) {
    console.error('接受托管错误:', error)
    return NextResponse.json(
      { error: error.message || '接受失败' },
      { status: 500 }
    )
  }
}
