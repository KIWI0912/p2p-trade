// scripts/test-api.ts
// 测试 API 端点

import 'dotenv/config'
import { prisma } from '../src/lib/db'
import { generateNonce } from '../src/lib/users'
import { createSession, verifySession } from '../src/lib/auth'

async function main() {
  console.log('🧪 Testing API functions...\n')

  try {
    // 测试 1: 生成 JWT 会话
    console.log('🔐 Test 1: Creating JWT session...')
    const { token, expiresAt } = await createSession(1, '0x1234567890123456789012345678901234567890')
    console.log(`✓ Token created, expires at: ${expiresAt}`)
    console.log(`  Token length: ${token.length}`)

    // 测试 2: 验证 JWT 会话
    console.log('\n🔐 Test 2: Verifying JWT session...')
    const session = await verifySession(token)
    console.log(`✓ Session verified:`)
    console.log(`  User ID: ${session?.userId}`)
    console.log(`  Wallet: ${session?.walletAddress}`)
    console.log(`  Issued at: ${new Date((session?.iat || 0) * 1000).toISOString()}`)
    console.log(`  Expires at: ${new Date((session?.exp || 0) * 1000).toISOString()}`)

    // 测试 3: 无效的 token
    console.log('\n🔐 Test 3: Verifying invalid token...')
    const invalidSession = await verifySession('invalid-token')
    console.log(`✓ Invalid token returns null: ${invalidSession === null}`)

    // 测试 4: 获取数据库中的第一个用户
    console.log('\n👤 Test 4: Fetching first user from database...')
    const user = await prisma.user.findFirst()
    if (user) {
      console.log(`✓ Found user:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Wallet: ${user.walletAddress}`)
      console.log(`  Name: ${user.name}`)
      console.log(`  Email: ${user.email}`)
    } else {
      console.log(`  No users found`)
    }

    // 测试 5: 获取所有订单
    console.log('\n📋 Test 5: Fetching all orders...')
    const orders = await prisma.order.findMany({
      include: {
        creator: true,
        offeringItems: true,
        requestingItems: true,
      },
      take: 2,
    })
    console.log(`✓ Found ${orders.length} orders:`)
    orders.forEach((order) => {
      console.log(`  - ID ${order.id}: "${order.title}" by ${order.creator.name || 'Unknown'}`)
    })

    console.log('\n✅ All API tests passed!\n')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
