// prisma/seed.ts
import { PrismaClient, TradeDirection, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 清空现有数据（开发环境）
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.user.deleteMany()

  // 创建示例用户
  const user1 = await prisma.user.create({
    data: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      name: 'Alice',
      email: 'alice@example.com',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      name: 'Bob',
      email: 'bob@example.com',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      walletAddress: '0x9876543210987654321098765432109876543210',
      name: 'Charlie',
      email: 'charlie@example.com',
    },
  })

  // 创建示例订单：Alice 想卖书籍换电子产品
  const order1 = await prisma.order.create({
    data: {
      title: '出售编程书籍，想换 iPad',
      description: '有多本技术书籍，想换一个 iPad 或类似的平板',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: user1.id,
      offeringItems: {
        create: [
          {
            name: 'Clean Code',
            description: '原版英文版，9成新',
            quantity: 1,
            category: 'books',
            estimatedValue: 50,
            currency: 'USD',
          },
          {
            name: 'The Pragmatic Programmer',
            description: '中文版，品相良好',
            quantity: 1,
            category: 'books',
            estimatedValue: 80,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: 'iPad 或平板电脑',
            description: '11 寸或更大，任意品牌',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 3000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 创建示例订单：Bob 想卖自行车换书籍
  const order2 = await prisma.order.create({
    data: {
      title: '出售山地自行车',
      description: '2年前购入，骑行 500km 左右，想换等值的技术书籍或其他物品',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: user2.id,
      offeringItems: {
        create: [
          {
            name: '山地自行车',
            description: '美利达品牌，27.5寸轮径，铝合金车架',
            quantity: 1,
            category: 'sports',
            estimatedValue: 2000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: '技术书籍或其他物品',
            description: '开放式要求，欢迎提出建议',
            quantity: 1,
            category: 'books',
            estimatedValue: 2000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 新增：Charlie 想买数码产品
  const order3 = await prisma.order.create({
    data: {
      title: '求购二手相机',
      description: '想购买一台二手单反相机，佳能或尼康均可',
      direction: TradeDirection.BUY,
      status: OrderStatus.PENDING,
      creatorId: user3.id,
      offeringItems: {
        create: [
          {
            name: '现金',
            description: '可以支付现金或数字货币',
            quantity: 1,
            category: 'money',
            estimatedValue: 5000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: '单反相机',
            description: '佳能或尼康，5D系列或D系列均可',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 5000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 新增：Alice 的私密订单
  const order4 = await prisma.order.create({
    data: {
      title: '出售限量版收藏品',
      description: '出售一些珍贵的限量版收藏品，只对特定人开放',
      direction: TradeDirection.SELL,
      status: OrderStatus.PENDING,
      creatorId: user1.id,
      isPrivate: true, // 设置为私密订单
      shareToken: 'secret-token-123', // 设置分享令牌
      shareTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      offeringItems: {
        create: [
          {
            name: '限量版手办',
            description: '全新未拆封，全球限量1000个',
            quantity: 1,
            category: 'collectibles',
            estimatedValue: 8000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: '高端显卡',
            description: 'RTX 3080或更高',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 8000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 新增：Bob 的已接受订单
  const order5 = await prisma.order.create({
    data: {
      title: '交换游戏主机',
      description: 'PS5换Xbox Series X',
      direction: TradeDirection.SELL, // 修正为有效的枚举值
      status: OrderStatus.ACCEPTED,
      creatorId: user2.id,
      accepterId: user3.id,
      acceptedAt: new Date(),
      offeringItems: {
        create: [
          {
            name: 'PlayStation 5',
            description: '数字版，9成新，附带2个手柄',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 3500,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: 'Xbox Series X',
            description: '要求8成新以上，附带至少1个手柄',
            quantity: 1,
            category: 'electronics',
            estimatedValue: 3500,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 新增：Charlie 的已完成订单
  const order6 = await prisma.order.create({
    data: {
      title: '出售游戏账号',
      description: '英雄联盟账号，钻石段位，含多个限定皮肤',
      direction: TradeDirection.SELL,
      status: OrderStatus.COMPLETED,
      creatorId: user3.id,
      accepterId: user1.id,
      acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前接受
      completedAt: new Date(), // 今天完成
      offeringItems: {
        create: [
          {
            name: '英雄联盟账号',
            description: '钻石段位，含50+英雄和30+皮肤',
            quantity: 1,
            category: 'digital',
            estimatedValue: 1000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: '数字货币',
            description: 'USDT或其他稳定币',
            quantity: 1000,
            unit: 'USDT',
            category: 'crypto',
            estimatedValue: 1000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  // 新增：另一个普通订单（移除了isAnonymous字段）
  const order7 = await prisma.order.create({
    data: {
      title: '求购稀有收藏品',
      description: '寻找特定系列的稀有收藏品，价格可议',
      direction: TradeDirection.BUY,
      status: OrderStatus.PENDING,
      creatorId: user2.id,
      // 移除了isAnonymous字段，因为它在模型中不存在
      offeringItems: {
        create: [
          {
            name: '数字货币支付',
            description: '可以用比特币或以太坊支付',
            quantity: 1,
            category: 'crypto',
            estimatedValue: 20000,
            currency: 'CNY',
          },
        ],
      },
      requestingItems: {
        create: [
          {
            name: '稀有收藏品',
            description: '特定系列的限量版收藏品，详情私聊',
            quantity: 1,
            category: 'collectibles',
            estimatedValue: 20000,
            currency: 'CNY',
          },
        ],
      },
    },
  })

  console.log('Seed completed successfully')
  console.log(`Created users: ${user1.name}, ${user2.name}, ${user3.name}`)
  console.log(`Created orders: ${order1.title}, ${order2.title}, ${order3.title}, ${order4.title}, ${order5.title}, ${order6.title}, ${order7.title}`)
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