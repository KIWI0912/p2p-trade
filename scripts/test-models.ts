// scripts/test-models.ts
// 测试脚本：验证数据库模型和业务逻辑

import 'dotenv/config'
import { prisma } from '../src/lib/db'
import { getOrCreateUserByWallet, generateNonce } from '../src/lib/users'
import { listOrders, getOrderDetail } from '../src/lib/orders'

async function main() {
  console.log('🧪 Testing database models and business logic...\n')

  try {
    // 测试 1: 获取现有用户
    console.log('📋 Test 1: Fetching existing orders...')
    const { orders, total } = await listOrders({ limit: 5 })
    console.log(`✓ Found ${total} total orders, displaying ${orders.length}:`)
    orders.forEach((order) => {
      console.log(`  - ID ${order.id}: "${order.title}" (${order.status})`)
    })

    // 测试 2: 获取第一个订单的详情
    if (orders.length > 0) {
      console.log(`\n📝 Test 2: Getting order detail for order #${orders[0].id}...`)
      const detail = await getOrderDetail(orders[0].id)
      console.log(`✓ Order: "${detail.title}"`)
      console.log(`  Creator: ${detail.creator.name || detail.creator.walletAddress}`)
      console.log(`  Status: ${detail.status}`)
      console.log(`  Offering: ${detail.offeringItems.map((i) => i.name).join(', ')}`)
      console.log(`  Requesting: ${detail.requestingItems.map((i) => i.name).join(', ')}`)
    }

    // 测试 3: 创建新用户
    console.log('\n👤 Test 3: Creating a new user via wallet...')
    const testWallet = '0x' + Math.random().toString(16).substring(2, 42)
    const newUser = await getOrCreateUserByWallet(testWallet)
    console.log(`✓ User created: ID ${newUser.id}, Wallet: ${newUser.walletAddress}`)

    // 测试 4: 生成 Nonce
    console.log('\n🔐 Test 4: Generating nonce for SIWE...')
    const nonce = await generateNonce(testWallet)
    console.log(`✓ Nonce generated: ${nonce}`)
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: newUser.id },
    })
    console.log(`  Nonce stored in DB: ${updatedUser.nonce}`)

    // 测试 5: 获取用户统计
    console.log('\n📊 Test 5: Database statistics...')
    const userCount = await prisma.user.count()
    const orderCount = await prisma.order.count()
    const itemCount = await prisma.orderItem.count()
    console.log(`✓ Total users: ${userCount}`)
    console.log(`✓ Total orders: ${orderCount}`)
    console.log(`✓ Total items: ${itemCount}`)

    console.log('\n✅ All tests passed!\n')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
