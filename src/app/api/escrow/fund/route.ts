import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/escrow/fund
 * 记录资产已存入（链上交易已确认）
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

    // 验证是否是创建者
    if (escrowRecord.creator !== session.walletAddress) {
      return NextResponse.json(
        { error: '只有创建者可以存入资产' },
        { status: 403 }
      )
    }

    // 更新托管记录
    const updated = await prisma.escrowRecord.update({
      where: { id: escrowRecordId },
      data: {
        status: 'FUNDED',
        txHash,
        fundedAt: new Date()
      }
    })

    // 更新订单状态
    if (updated.orderId) {
      await prisma.order.update({
        where: { id: updated.orderId },
        data: {
          escrowStatus: 'FUNDED',
          escrowTxHash: txHash
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: '资产已记录为已存入',
      txHash
    })
  } catch (error: any) {
    console.error('记录资产存入错误:', error)
    return NextResponse.json(
      { error: error.message || '记录失败' },
      { status: 500 }
    )
  }
}
