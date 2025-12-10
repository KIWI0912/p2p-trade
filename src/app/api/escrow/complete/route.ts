import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/escrow/complete
 * 完成交易，释放资产
 * 
 * 请求体:
 * {
 *   escrowRecordId: number,
 *   txHash: string (交易哈希)
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

    if (!escrowRecordId || !txHash) {
      return NextResponse.json(
        { error: '缺少必填字段：托管记录ID、交易哈希' },
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

    // 验证交易哈希格式
    if (typeof txHash !== 'string' || !txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { error: '无效的交易哈希格式' },
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

    if (escrowRecord.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: '托管必须是 ACCEPTED 状态才能完成' },
        { status: 400 }
      )
    }

    // 验证是创建者或接受者
    if (
      escrowRecord.creator !== session.walletAddress &&
      escrowRecord.accepter !== session.walletAddress
    ) {
      return NextResponse.json(
        { error: '只有创建者或接受者可以完成交易' },
        { status: 403 }
      )
    }

    // 更新托管记录
    const updated = await prisma.escrowRecord.update({
      where: { id: escrowRecordId },
      data: {
        status: 'COMPLETED',
        txHash,
        completedAt: new Date()
      }
    })

    // 更新订单状态
    if (updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: {
          escrowStatus: 'COMPLETED',
          status: 'COMPLETED',
          completedAt: new Date(),
          escrowTxHash: txHash
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: '交易已完成',
      txHash
    })
  } catch (error: any) {
    console.error('完成托管错误:', error)
    return NextResponse.json(
      { error: error.message || '完成失败' },
      { status: 500 }
    )
  }
}
