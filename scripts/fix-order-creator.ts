// scripts/fix-order-creator.ts
// 查看并修复订单创建者地址的脚本

import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function main() {
  console.log('🔍 Fetching all orders with creator information...\n')

  try {
    // 获取所有订单及其创建者信息
    const orders = await prisma.order.findMany({
      include: {
        creator: true,
        accepter: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`📊 Total orders: ${orders.length}\n`)

    // 显示所有订单的创建者信息
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order.id}`)
      console.log(`   Title: ${order.title}`)
      console.log(`   Creator ID: ${order.creatorId}`)
      console.log(`   Creator Name: ${order.creator.name || 'N/A'}`)
      console.log(`   Creator Wallet: ${order.creator.walletAddress}`)
      console.log(`   Status: ${order.status}`)
      console.log('')
    })

    // 显示特定的用户钱包地址
    const targetWallet = '0x1f4BBb4801DD697d902328475a3b6CF09aeDDe4d'
    console.log(`\n🎯 Looking for orders created by wallet: ${targetWallet}\n`)

    const userOrders = await prisma.order.findMany({
      where: {
        creator: {
          walletAddress: {
            equals: targetWallet,
            mode: 'insensitive',
          },
        },
      },
      include: {
        creator: true,
      },
    })

    if (userOrders.length > 0) {
      console.log(`✓ Found ${userOrders.length} order(s) created by this wallet:\n`)
      userOrders.forEach((order) => {
        console.log(`  - Order ID: ${order.id} - "${order.title}" (${order.status})`)
      })
    } else {
      console.log(`✗ No orders found for this wallet`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
