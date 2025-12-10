// prisma/seed-featured.ts
import { PrismaClient, TradeDirection, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting featured orders seed...')

  // 创建精选订单用户
  const featuredUser = await prisma.user.upsert({
    where: { walletAddress: '0x5678567856785678567856785678567856785678' },
    update: {},
    create: {
      walletAddress: '0x5678567856785678567856785678567856785678',
      name: 'Featured Seller',
      email: 'featured@example.com',
    },
  })

  // 创建精选订单1：高端笔记本电脑
  const featuredOrder1 = await prisma.order.create({
    data: {
      title: '【精选】出售全新MacBook Pro M2',
      description: '全新未拆封的MacBook Pro，M2芯片，16GB内存，512GB SSD，太空灰色。',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: featuredUser.id,
      offeringItems: {
        create: [
          {
            name: 'MacBook Pro M2',
            description: '全新未拆封，官方保修一年',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 12999,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: 'ETH或现金',
            description: '接受以太坊或现金交易',
            quantity: 1,
            category: 'cryptocurrency',
            estimatedValue: 12999,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 创建精选订单2：高端相机
  const featuredOrder2 = await prisma.order.create({
    data: {
      title: '【精选】索尼A7IV全画幅相机',
      description: '9成新索尼A7IV全画幅相机，含24-70mm F2.8 GM镜头，已购买延长保修。',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: featuredUser.id,
      offeringItems: {
        create: [
          {
            name: '索尼A7IV相机',
            description: '9成新，含原厂电池两块、充电器、原厂包',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 15000,
            currency: 'CNY',
          },
          {
            name: '索尼24-70mm F2.8 GM镜头',
            description: '专业GM系列镜头，成像极佳',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 13000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: 'ETH或USDT',
            description: '接受加密货币支付',
            quantity: 1,
            category: 'cryptocurrency',
            estimatedValue: 28000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 创建精选订单3：限量版球鞋
  const featuredOrder3 = await prisma.order.create({
    data: {
      title: '【精选】Nike x Off-White限量联名款',
      description: '全新Nike x Off-White联名款Air Jordan 1芝加哥配色，尺码US10，附带完整包装和吊牌。',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: featuredUser.id,
      offeringItems: {
        create: [
          {
            name: 'Nike x Off-White AJ1',
            description: '芝加哥配色，US10码，全新未穿',
            quantity: 1,
            category: 'fashion',
            estimatedValue: 30000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: 'ETH',
            description: '仅接受ETH支付',
            quantity: 1,
            category: 'cryptocurrency',
            estimatedValue: 30000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  console.log('Featured orders seed completed successfully')
  console.log(`Created featured orders: ${featuredOrder1.title}, ${featuredOrder2.title}, ${featuredOrder3.title}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })