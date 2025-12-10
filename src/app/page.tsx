import { Metadata } from 'next'
import { OrderCard } from '@/components/OrderCard'
import Link from 'next/link'
import { zh } from '@/lib/i18n'
import { listOrders } from '@/lib/orders'

export const metadata: Metadata = {
  title: '这是一个交易平台',
  description: '去中心化的点对点交易平台，支持任何物品的安全交易',
}

export default async function HomePage() {
  // 从数据库获取最新订单数据，明确指定不包含私密订单
  const { orders } = await listOrders({ 
    limit: 2,
    includePrivate: false // 明确指定不包含私密订单
  });
  
  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            这是一个交易平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            去中心化的点对点交易平台，支持任何物品的安全交易。
            使用区块链技术确保交易安全，托管资金直到交易完成。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/new" 
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              创建订单
            </Link>
            <Link 
              href="/orders" 
              className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              浏览订单
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">安全托管</h3>
            <p className="text-gray-600">资金在区块链上安全托管，交易完成后自动释放</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">快速交易</h3>
            <p className="text-gray-600">简化的交易流程，快速匹配买卖双方</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">去中心化</h3>
            <p className="text-gray-600">无需中介，直接点对点交易</p>
          </div>
        </section>

        {/* Latest Orders */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">最新订单</h2>
            <Link 
              href="/orders" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Link key={order.id} href={`/${order.id}`} className="block">
                  <OrderCard 
                    order={order} 
                    currentUserAddress=""
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-2 bg-white rounded-lg p-8 text-center shadow-sm">
                <p className="text-gray-600">暂无订单，成为第一个创建订单的用户！</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">开始你的第一笔交易</h2>
          <p className="text-xl mb-8 opacity-90">
            连接钱包，创建订单，体验安全的去中心化交易
          </p>
          <Link 
            href="/new" 
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            立即开始
          </Link>
        </section>
      </main>
    </div>
  )
}