# Contributing to P2P Trade

English | [中文](#中文)

Thank you for your interest in contributing to P2P Trade! We welcome contributions from everyone. This document provides guidelines and instructions for contributing.

## 🎯 Types of Contributions

We appreciate all kinds of contributions:

- **Bug Reports** - Report issues you've found
- **Feature Requests** - Suggest new features or improvements
- **Code Changes** - Submit bug fixes or new features
- **Documentation** - Improve or translate documentation
- **Testing** - Help test new features or report edge cases
- **Feedback** - Share your thoughts and suggestions

## 📋 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git
- An Ethereum wallet (for testing Web3 features)

### Setting Up Development Environment

```bash
# 1. Fork the repository
# Click "Fork" on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/p2p-trade.git
cd p2p-trade

# 3. Add upstream remote
git remote add upstream https://github.com/KIWI0912/p2p-trade.git

# 4. Install dependencies
npm install

# 5. Set up environment
cp .env.example .env.local
# Edit .env.local with your database URL

# 6. Set up database
npm run db:push
npm run db:seed

# 7. Start development server
npm run dev
```

## 🔄 Workflow

### 1. Create a Branch

```bash
# Update your local main
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-description
```

### 2. Make Changes

- Write clear, concise commits
- Follow the existing code style
- Add tests for new features
- Update documentation if needed

### 3. Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "feat: Add item category validation for orders"
git commit -m "fix: Resolve duplicate order title error"
git commit -m "docs: Update API documentation"

# Avoid
git commit -m "fix stuff"
git commit -m "updates"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Dependency updates, etc.

### 4. Test Your Changes

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

**PR Title Format:**
```
[Type] Brief description

Examples:
[Feature] Add order filtering by status
[Fix] Correct share link generation
[Docs] Update API documentation
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Related Issues
Fixes #(issue number)

## Testing
How to test these changes:
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 📝 Code Style Guidelines

### TypeScript

```typescript
// Use explicit types
const getUserOrders = async (userId: number): Promise<Order[]> => {
  // Implementation
}

// Use const/let, avoid var
const name = "John"
let count = 0

// Use arrow functions where appropriate
const handleClick = () => { }

// Use template literals
const message = `User ${userId} created order ${orderId}`
```

### React Components

```typescript
// Use functional components with hooks
interface OrderCardProps {
  order: Order
  onAccept: (orderId: number) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAccept }) => {
  return (
    <div className="order-card">
      {/* Component JSX */}
    </div>
  )
}
```

### Formatting

- Use 2 spaces for indentation
- Max line length: 100 characters (soft limit)
- Use Prettier for automatic formatting

```bash
# Format code
npx prettier --write src/
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
describe("Order Service", () => {
  it("should create order with valid data", async () => {
    const order = await createOrder({
      title: "Test Order",
      creatorId: 1,
      direction: "SELL",
      // ... other fields
    })
    
    expect(order).toBeDefined()
    expect(order.title).toBe("Test Order")
  })

  it("should reject duplicate title", async () => {
    // Setup existing order
    // Expect error when creating duplicate
  })
})
```

### E2E Tests

```typescript
test("User can create and share order", async ({ page }) => {
  // 1. Navigate to create order page
  await page.goto("/orders/new")
  
  // 2. Fill form
  await page.fill("input[name=title]", "Test Order")
  
  // 3. Submit
  await page.click("button[type=submit]")
  
  // 4. Verify success
  await expect(page).toHaveURL(/\/orders\/\d+/)
})
```

## 🔒 Security Considerations

When contributing, please be aware of:

- ✅ Never commit `.env` or `.env.local` files
- ✅ Don't expose API keys or secrets
- ✅ Validate all user inputs
- ✅ Use parameterized queries (Prisma ORM)
- ✅ Sanitize any user-facing content
- ✅ Follow SIWE security best practices for Web3 features

## 📚 Documentation

### Update README if you:
- Add new API endpoints
- Change configuration requirements
- Add new features with user-facing impact

### Update code comments for:
- Complex business logic
- Non-obvious implementations
- Edge cases or workarounds

## 🚀 Release Process

Maintainers will handle versioning using semantic versioning:
- `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

## ❓ Questions or Need Help?

- 📧 **Email**: ckiwi912@gmail.com
- 💬 **GitHub Issues**: Ask in the issue tracker
- 🤝 **Discussions**: Use GitHub Discussions for questions

---

# 中文

感谢您对 P2P Trade 的贡献！我们欢迎来自所有人的贡献。本文档提供了贡献指南和说明。

## 🎯 贡献类型

我们欢迎各种贡献：

- **Bug 报告** - 报告你发现的问题
- **功能请求** - 建议新功能或改进
- **代码变更** - 提交 bug 修复或新功能
- **文档** - 改进或翻译文档
- **测试** - 帮助测试新功能或报告边界情况
- **反馈** - 分享你的想法和建议

## 📋 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 12+
- Git
- 以太坊钱包（用于测试 Web3 功能）

### 设置开发环境

```bash
# 1. Fork 仓库
# 点击 GitHub 上的 "Fork"

# 2. 克隆你的 fork
git clone https://github.com/YOUR_USERNAME/p2p-trade.git
cd p2p-trade

# 3. 添加上游远程
git remote add upstream https://github.com/KIWI0912/p2p-trade.git

# 4. 安装依赖
npm install

# 5. 设置环境
cp .env.example .env.local
# 编辑 .env.local 填入你的数据库 URL

# 6. 设置数据库
npm run db:push
npm run db:seed

# 7. 启动开发服务器
npm run dev
```

## 🔄 工作流程

### 1. 创建分支

```bash
# 更新本地 main
git fetch upstream
git checkout main
git merge upstream/main

# 创建功能分支
git checkout -b feature/your-feature-name
# 或修复 bug
git checkout -b fix/issue-description
```

### 2. 进行更改

- 编写清晰、简洁的提交
- 遵循现有代码风格
- 为新功能添加测试
- 如需要，更新文档

### 3. 提交信息

使用清晰、描述性的提交信息：

```bash
# 好的示例
git commit -m "feat: 为订单添加物品类别验证"
git commit -m "fix: 解决重复订单标题错误"
git commit -m "docs: 更新 API 文档"

# 避免
git commit -m "fix stuff"
git commit -m "更新"
```

**提交类型：**
- `feat:` - 新功能
- `fix:` - bug 修复
- `docs:` - 文档更改
- `style:` - 代码风格变更（格式等）
- `refactor:` - 代码重构
- `test:` - 添加或更新测试
- `chore:` - 依赖更新等

### 4. 测试你的更改

```bash
# 运行单元测试
npm run test

# 监听模式运行测试
npm run test:watch

# 运行 E2E 测试
npm run test:e2e

# 运行 linter
npm run lint
```

### 5. 推送并创建 Pull Request

```bash
# 推送你的分支
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

**PR 标题格式：**
```
[类型] 简短描述

示例：
[功能] 添加按状态筛选订单
[修复] 修正分享链接生成
[文档] 更新 API 文档
```

**PR 描述模板：**
```markdown
## 描述
变更的简短描述

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 破坏性变更

## 相关问题
修复 #(问题号)

## 测试
如何测试这些变更：
- [ ] 单元测试通过
- [ ] E2E 测试通过
- [ ] 手动测试完成

## 截图（如适用）
[为 UI 变更添加截图]

## 检查清单
- [ ] 代码遵循风格指南
- [ ] 自检完成
- [ ] 为复杂代码添加注释
- [ ] 文档已更新
- [ ] 未生成新警告
```

## 📝 代码风格指南

### TypeScript

```typescript
// 使用显式类型
const getUserOrders = async (userId: number): Promise<Order[]> => {
  // 实现
}

// 使用 const/let，避免 var
const name = "John"
let count = 0

// 在适当情况下使用箭头函数
const handleClick = () => { }

// 使用模板字面量
const message = `用户 ${userId} 创建了订单 ${orderId}`
```

### React 组件

```typescript
// 使用带 hooks 的函数组件
interface OrderCardProps {
  order: Order
  onAccept: (orderId: number) => void
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onAccept }) => {
  return (
    <div className="order-card">
      {/* 组件 JSX */}
    </div>
  )
}
```

### 格式化

- 使用 2 个空格缩进
- 最大行长度：100 字符（软限制）
- 使用 Prettier 自动格式化

```bash
# 格式化代码
npx prettier --write src/
```

## 🧪 测试指南

### 单元测试

```typescript
describe("订单服务", () => {
  it("应该使用有效数据创建订单", async () => {
    const order = await createOrder({
      title: "测试订单",
      creatorId: 1,
      direction: "SELL",
      // ... 其他字段
    })
    
    expect(order).toBeDefined()
    expect(order.title).toBe("测试订单")
  })

  it("应该拒绝重复标题", async () => {
    // 设置现有订单
    // 创建重复时应出错
  })
})
```

### E2E 测试

```typescript
test("用户可以创建和分享订单", async ({ page }) => {
  // 1. 导航到创建订单页面
  await page.goto("/orders/new")
  
  // 2. 填表
  await page.fill("input[name=title]", "测试订单")
  
  // 3. 提交
  await page.click("button[type=submit]")
  
  // 4. 验证成功
  await expect(page).toHaveURL(/\/orders\/\d+/)
})
```

## 🔒 安全考虑

贡献时请注意：

- ✅ 永远不要提交 `.env` 或 `.env.local` 文件
- ✅ 不要暴露 API 密钥或机密
- ✅ 验证所有用户输入
- ✅ 使用参数化查询（Prisma ORM）
- ✅ 清理任何面向用户的内容
- ✅ 遵循 Web3 功能的 SIWE 安全最佳实践

## 📚 文档

### 在以下情况更新 README：
- 添加新的 API 端点
- 更改配置要求
- 添加有用户界面影响的新功能

### 更新代码注释：
- 复杂的业务逻辑
- 不明显的实现
- 边界情况或变通方法

## 🚀 发布流程

维护者将使用语义版本控制处理版本：
- `MAJOR.MINOR.PATCH`（例如 1.2.3）
- MAJOR：破坏性变更
- MINOR：新功能
- PATCH：bug 修复

## ❓ 有问题或需要帮助？

- 📧 **邮箱**: ckiwi912@gmail.com
- 💬 **GitHub Issues**: 在问题跟踪器中提问
- 🤝 **讨论**: 使用 GitHub Discussions 提问

---

**感谢你的贡献！** 🎉
