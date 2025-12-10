import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/escrow/status
 * 查询托管状态
 * 
 * 查询参数:
 * - escrowRecordId: number (必需)
 * 或
 * - orderId: number (必需)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const escrowRecordId = searchParams.get('escrowRecordId')
    const orderId = searchParams.get('orderId')

    if (!escrowRecordId && !orderId) {
      return NextResponse.json(
        { error: '缺少查询参数：需要提供 escrowRecordId 或 orderId' },
        { status: 400 }
      )
    }

    // 验证参数格式
    if (escrowRecordId && (!Number.isInteger(+escrowRecordId) || +escrowRecordId < 1)) {
      return NextResponse.json(
        { error: '托管记录ID必须是正整数' },
        { status: 400 }
      )
    }

    if (orderId && (!Number.isInteger(+orderId) || +orderId < 1)) {
      return NextResponse.json(
        { error: '订单ID必须是正整数' },
        { status: 400 }
      )
    }

    let escrowRecord
    
    if (escrowRecordId) {
      escrowRecord = await prisma.escrowRecord.findUnique({
        where: { id: parseInt(escrowRecordId) }
      })
    } else {
      escrowRecord = await prisma.escrowRecord.findFirst({
        where: { orderId: parseInt(orderId!) }
      })
    }

    if (!escrowRecord) {
      return NextResponse.json(
        { error: '托管记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      escrow: {
        id: escrowRecord.id,
        orderId: escrowRecord.orderId,
        escrowId: escrowRecord.escrowId,
        contractAddress: escrowRecord.contractAddress,
        chain: escrowRecord.chain,
        assetType: escrowRecord.assetType,
        tokenAddress: escrowRecord.tokenAddress,
        amount: escrowRecord.amount,
        creator: escrowRecord.creator,
        accepter: escrowRecord.accepter,
        status: escrowRecord.status,
        txHash: escrowRecord.txHash,
        createdAt: escrowRecord.createdAt,
        fundedAt: escrowRecord.fundedAt,
        completedAt: escrowRecord.completedAt
      }
    })
  } catch (error: any) {
    console.error('查询托管状态错误:', error)
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    )
  }
}
