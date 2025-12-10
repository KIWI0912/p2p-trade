# P2P Trade - Decentralized P2P Trading Platform
## P2P Trade - 去中心化 P2P 交易平台

> A Web3-native decentralized peer-to-peer trading platform where users can trade any items using Ethereum wallet authentication.
>
> 一个基于 Web3 的去中心化 P2P 交易平台，允许用户使用以太坊钱包认证后交易任意物品。

---

## 🎯 Core Features | 核心特性

### English
- **🔐 Web3 Authentication** - Decentralized identity verification using SIWE (Sign-In With Ethereum)
- **🛍️ Flexible Trading** - Support buying/selling/exchanging any items (goods, services, crypto assets, etc.)
- **📋 Complete Lifecycle** - Full order management from creation, acceptance, to completion
- **🎯 Precise Categorization** - Mandatory item categories (electronics, fashion, cryptocurrency, etc.)
- **🔗 Share Mechanism** - Creators can generate share links with expiration control and privacy settings
- **⚠️ Smart Validation** - Duplicate title prevention, mandatory category selection, strict access control

### 中文
- **🔐 Web3 身份验证** - 使用 SIWE (Sign-In With Ethereum) 进行去中心化身份认证
- **🛍️ 灵活交易** - 支持任何物品的买卖/交换，包括商品、服务、加密资产等
- **📋 完整生命周期** - 订单从创建、接受、到完成的全流程管理
- **🎯 精准分类** - 物品必选类别（电子产品、服装、加密货币等）
- **🔗 分享机制** - 创建者可生成分享链接，支持私密订单和链接过期管理
- **⚠️ 智能验证** - 订单标题防重复、物品类别强制、访问权限控制

---

## 🛠️ Tech Stack | 技术栈

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 + React 18 + TypeScript + Tailwind CSS |
| **Backend** | Next.js API Routes + Node.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Web3** | Wagmi + RainbowKit + ethers.js + SIWE |
| **Authentication** | JWT + iron-session + httpOnly Cookie |
| **Testing** | Vitest + Playwright |

---

## 🚀 Quick Start | 快速开始

### Requirements | 环境要求
- Node.js 18+
- PostgreSQL 12+
- Ethereum Wallet (MetaMask, WalletConnect, etc.)

### Installation | 安装步骤

```bash
# 1. Install dependencies | 安装依赖
npm install

# 2. Configure database | 配置数据库
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and other configs
# 编辑 .env.local，填入你的 DATABASE_URL 和其他配置

# 3. Create database tables | 创建数据库表
npm run db:push

# 4. Insert sample data (optional) | 插入示例数据（可选）
npm run db:seed

# 5. Start development server | 启动开发服务器
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### Main Pages | 主要页面

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | Connect wallet and SIWE signing |
| Orders | `/orders` | Browse all public orders |
| Order Detail | `/orders/[id]` | View order details, accept or share |
| Create Order | `/orders/new` | Create a new order |
| My Orders | `/orders/my` | View your created orders |

| 页面 | URL | 说明 |
|-----|-----|------|
| 登录 | `/login` | 连接钱包和 SIWE 签名 |
| 订单列表 | `/orders` | 浏览所有公开订单 |
| 订单详情 | `/orders/[id]` | 查看订单详情，接受或分享 |
| 创建订单 | `/orders/new` | 创建新订单 |
| 我的订单 | `/orders/my` | 查看自己创建的订单 |

---

## 📁 Project Structure | 项目结构

```
src/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── logout/          # Logout handler
│   ├── (orders)/            # Order routes
│   │   ├── page.tsx         # Orders list
│   │   ├── [id]/            # Order details
│   │   ├── new/             # Create order
│   │   └── my/              # My orders
│   └── api/
│       ├── auth/            # Auth API endpoints
│       ├── orders/          # Order API endpoints
│       ├── user/            # User API endpoints
│       ├── escrow/          # Escrow related
│       └── verify/          # Verification endpoints
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # Auth functions
│   ├── orders.ts           # Order business logic
│   ├── users.ts            # User business logic
│   ├── hooks.ts            # React Query Hooks
│   ├── types.ts            # TypeScript types
│   ├── web3.ts             # Web3 utilities
│   └── i18n.ts             # Internationalization
├── components/             # React components
└── styles/                 # Global styles

prisma/
├── schema.prisma           # Database models
├── seed.ts                 # Seed script
└── migrations/             # Database migrations
```

---

## 🔌 API Documentation | API 文档

### Authentication | 认证

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/nonce?address=0x...` | GET | Get SIWE nonce |
| `/api/auth/siwe` | POST | SIWE verification and login |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/logout` | POST | Logout |

### Orders | 订单

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders/create` | POST | Create order |
| `/api/orders/list` | GET | Get orders list |
| `/api/orders/get?id=X` | GET | Get order details |
| `/api/orders/accept` | POST | Accept order |
| `/api/orders/complete` | POST | Complete order |
| `/api/orders/my-orders` | GET | Get my orders |
| `/api/orders/share-token` | POST | Generate share token |

### Order Creation Fields | 订单字段说明

**Required Fields | 必填字段:**
- `title` - Order title (cannot duplicate for same creator)
- `direction` - Trade direction: `SELL` or `BUY`
- `offeringItems` - Items being offered
- `requestingItems` - Items being requested

**Item Fields | 物品字段:**
- `name` - Item name (required)
- `category` - Item category (required):
  - `electronics` - Electronics
  - `fashion` - Fashion/Accessories
  - `collectibles` - Collectibles
  - `services` - Services
  - `digital` - Digital goods
  - `cryptocurrency` - Cryptocurrency
  - `real_estate` - Real estate
  - `vehicles` - Vehicles
  - `other` - Other
- `description` - Item description (optional)
- `quantity` - Quantity (optional, default 1)
- `estimatedValue` - Estimated value (optional)
- `currency` - Currency (optional)

---

## 📊 Data Models | 数据模型

### User
```typescript
{
  id: number
  walletAddress: string   // Ethereum address (unique)
  email?: string
  name?: string
  nonce: string          // For SIWE login
  createdAt: DateTime
  updatedAt: DateTime
  ordersCreated: Order[]
  ordersAccepted: Order[]
}
```

### Order
```typescript
{
  id: number
  title: string
  description?: string
  status: OrderStatus            // PENDING/ACCEPTED/COMPLETED/CANCELLED
  direction: TradeDirection      // SELL/BUY
  creatorId: number
  accepterId?: number
  acceptedAt?: DateTime
  completedAt?: DateTime
  isPrivate: boolean
  shareToken?: string
  shareTokenExpiresAt?: DateTime
  shareTokenRevoked: boolean
  createdAt: DateTime
  offeringItems: OrderItem[]
  requestingItems: OrderItem[]
  creator: User
  accepter?: User
}
```

### OrderItem
```typescript
{
  id: number
  name: string
  description?: string
  quantity: number
  unit?: string
  estimatedValue?: number
  currency?: string
  category?: string
  createdAt: DateTime
}
```

---

## 🔐 Security Features | 安全特性

- ✅ **SIWE Signature Verification** - Decentralized authentication preventing MITM attacks
- ✅ **httpOnly Cookies** - XSS attack prevention
- ✅ **JWT Session Validation** - Secure session management
- ✅ **Access Control** - Order creator/acceptor permission checks
- ✅ **Input Validation** - Strict validation for all API inputs
- ✅ **SQL Injection Protection** - Through Prisma ORM
- ✅ **CSRF Protection** - Via httpOnly cookies and Same-Site policies

---

## 🧪 Testing | 测试

```bash
# Run unit tests | 运行单元测试
npm run test

# Watch mode | 监听模式
npm run test:watch

# Run E2E tests | 运行 E2E 测试
npm run test:e2e

# E2E UI mode | E2E UI 模式
npm run test:e2e:ui
```

---

## 📝 Environment Configuration | 环境配置

Create `.env.local` file (reference `.env.example`):

创建 `.env.local` 文件（参考 `.env.example`）：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/p2pdb"

# Session Configuration
IRON_PASSWORD="your-secret-key-min-32-chars-for-production"
IRON_COOKIE_NAME="p2p_session"

# SIWE Configuration
SIWE_DOMAIN="localhost:3000"
SIWE_ORIGIN="http://localhost:3000"

# Blockchain Configuration (Optional)
NEXT_PUBLIC_CHAIN_ID="1"
```

---

## 📚 Core Workflows | 核心工作流

### 1. Web3 Authentication Flow | Web3 认证流程

1. User clicks "Connect Wallet" | 用户点击"连接钱包"
2. System fetches nonce from `/api/auth/nonce` | 系统获取 nonce
3. User signs SIWE message in wallet | 用户在钱包中签名
4. System verifies signature and creates session | 系统验证签名并创建会话
5. User successfully logged in | 用户成功登录

### 2. Order Creation Flow | 订单创建流程

1. User fills order info and items | 用户填写订单和物品信息
2. Frontend validation:
   - Title not empty
   - Item names and categories required
   - Categories must be selected
3. Backend validation:
   - No duplicate titles for same creator
   - Items list not empty
4. Order created successfully, share link generated

### 3. Order Sharing Mechanism | 订单分享机制

- Only creators can generate share links | 只有创建者可以生成分享链接
- Supports expiration control (7 days default) | 支持过期控制（默认7天）
- Can revoke share links | 支持撤销分享链接
- Private orders need valid share token | 私密订单需要有效 token

### 4. Order Interaction Flow | 订单交互流程

1. **Creator view** - No accept button, can share order
2. **Other users** - Can see accept button and item details
3. **After acceptance** - Order status becomes ACCEPTED
4. **Complete** - Both parties can mark as complete

---

## 🚧 Future Roadmap | 未来规划

- [ ] Smart contract integration (asset escrow)
- [ ] More blockchain support (Polygon, Arbitrum, etc.)
- [ ] NFT support
- [ ] Reputation system
- [ ] Dispute resolution mechanism
- [ ] Payment integration

---

## 🤝 Contributing | 贡献指南

We welcome contributions! Please follow these steps:

欢迎贡献代码！请遵循以下步骤：

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License | 许可证

MIT License - See [LICENSE](LICENSE) file for details

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 Contact | 联系方式

**Email | 邮箱:** ckiwi912@gmail.com

**Issues | 问题:** Feel free to open GitHub Issues for bugs, feature requests, or discussions.

欢迎通过 GitHub Issues 提交 bug 报告、功能请求或讨论。

---

**Last Updated | 最后更新**: 2025-12-10  
**Version | 版本**: 1.0.0  
**Status | 状态**: Production Ready ✅ | 生产就绪 ✅
