import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getEscrowContract, createEscrow, AssetType } from '@/lib/web3'
import { ethers } from 'ethers'

/**
 * POST /api/escrow/create
 * 创建新的托管记录
 * 
 * 请求体:
 * {
 *   orderId: number,
 *   amount: string (Wei),
 *   tokenAddress: string (可选，ERC20 地址),
 *   assetType: 0 (ETH) | 1 (ERC20),
 *   accepter: string (可选，接受者地址)
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
    const { orderId, amount, tokenAddress, assetType, accepter } = body

    // 验证输入
    if (!orderId || !amount || assetType === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段：订单ID、金额、资产类型' },
        { status: 400 }
      )
    }

    // 验证 orderId 是数字
    if (typeof orderId !== 'number' || orderId < 1) {
      return NextResponse.json(
        { error: '订单ID必须是正整数' },
        { status: 400 }
      )
    }

    // 验证金额格式
    if (typeof amount !== 'string' || !amount.match(/^\d+$/)) {
      return NextResponse.json(
        { error: '金额必须是有效的数字字符串' },
        { status: 400 }
      )
    }

    // 验证 assetType
    if (![0, 1].includes(assetType)) {
      return NextResponse.json(
        { error: '无效的资产类型（0=ETH, 1=ERC20）' },
        { status: 400 }
      )
    }

    // 验证订单存在且属于用户
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { creator: true }
    })

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    if (order.creatorId !== session.userId) {
      return NextResponse.json(
        { error: '只有订单创建者可以创建托管' },
        { status: 403 }
      )
    }

    // 获取合约
    const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS
    if (!contractAddress) {
      return NextResponse.json(
        { error: '托管合约未部署' },
        { status: 500 }
      )
    }

    // 创建 Escrow 记录在数据库
    const escrowRecord = await prisma.escrowRecord.create({
      data: {
        escrowId: 0, // 待更新（链上交易后）
        orderId,
        contractAddress,
        chain: 'sepolia',
        assetType: assetType === AssetType.ETH ? 'ETH' : 'ERC20',
        tokenAddress: assetType === AssetType.ERC20 ? tokenAddress : null,
        amount: amount.toString(),
        creator: session.walletAddress,
        accepter: accepter || null,
        status: 'PENDING'
      }
    })

    // 更新订单记录
    await prisma.order.update({
      where: { id: orderId },
      data: {
        escrowId: escrowRecord.id,
        escrowAddress: contractAddress,
        escrowStatus: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      escrowRecordId: escrowRecord.id,
      message: '托管记录已创建，等待资产存入',
      nextStep: '调用 /api/escrow/fund 来存入资产'
    })
  } catch (error: any) {
    console.error('创建托管错误:', error)
    return NextResponse.json(
      { error: error.message || '创建托管失败' },
      { status: 500 }
    )
  }
}
